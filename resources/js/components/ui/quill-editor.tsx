import DOMPurify from 'dompurify';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { type HTMLAttributes, type ReactNode, useEffect, useMemo, useRef } from 'react';
import { cn } from '@/lib/utils';

interface QuillEditorProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  placeholder?: string;
  error?: string;
  label?: ReactNode;
  labelClassName?: string;
  errorClassName?: string;
  toolbarPosition?: 'top' | 'bottom';
  toolbarMode?: 'full' | 'compact';
  allowLinks?: boolean;
  allowHeadings?: boolean;
  allowHistory?: boolean;
}

type ToolbarConfig = {
  container: any[];
  formats: string[];
};

const toolbarLabelMap: Record<string, string> = {
  '.ql-bold': 'Gras',
  '.ql-italic': 'Italique',
  '.ql-underline': 'Souligné',
  '.ql-strike': 'Barré',
  '.ql-blockquote': 'Citation',
  '.ql-header': 'Titre',
  '.ql-list': 'Liste',
  '.ql-indent': 'Retrait',
  '.ql-align': 'Alignement',
  '.ql-color': 'Couleur du texte',
  '.ql-background': 'Couleur de fond',
  '.ql-font': 'Police',
  '.ql-link': 'Lien',
  '.ql-clean': 'Effacer le formatage',
};

export function buildToolbarConfig({
  toolbarMode,
  allowLinks,
  allowHeadings,
}: Pick<QuillEditorProps, 'toolbarMode' | 'allowLinks' | 'allowHeadings'>): ToolbarConfig {
  const longContainer = [
    [...(allowHeadings ? [{ header: [false, 2, 3] }] : []), 'blockquote', 'code-block'],
    [{ align: '' }, { align: 'center' }, { align: 'right' }, { align: 'justify' }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ color: [] }, { background: [] }],
    [{ script: 'sub' }, { script: 'super' }],
    [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
    [{ font: [] }],
    [...(allowLinks ? ['link'] : []), 'clean'],
  ];

  const compactContainer = [
    [
      ...(allowHeadings ? [{ header: [false, 2, 3] }] : []),
      'bold',
      'italic',
      'underline',
      ...(allowLinks ? ['link'] : []),
    ],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ font: [] }, 'clean'],
  ];

  const formats = [
    'bold',
    'italic',
    'underline',
    'strike',
    'blockquote',
    'list',
    'ordered',
    'bullet',
    'indent',
    'align',
    'color',
    'background',
    'font',
    'code-block',
    ...(allowHeadings ? ['header'] : []),
    ...(allowLinks ? ['link'] : []),
  ];

  return {
    container: toolbarMode === 'compact' ? compactContainer : longContainer,
    formats,
  };
}

function isSafeUrl(url: string): boolean {
  const trimmed = url.trim();

  if (!trimmed) return false;
  if (/^(javascript|data|vbscript):/i.test(trimmed)) return false;

  try {
    const parsed = new URL(trimmed, window.location.href);
    const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:'];
    return (
      allowedProtocols.includes(parsed.protocol) ||
      trimmed.startsWith('/') ||
      trimmed.startsWith('#')
    );
  } catch {
    return trimmed.startsWith('/') || trimmed.startsWith('#');
  }
}

function sanitizeHtmlForPaste(value: string): string {
  const sanitized = DOMPurify.sanitize(value, {
    ALLOWED_TAGS: [
      'p',
      'br',
      'strong',
      'b',
      'em',
      'i',
      'u',
      's',
      'strike',
      'del',
      'blockquote',
      'ul',
      'ol',
      'li',
      'h1',
      'h2',
      'h3',
      'a',
      'span',
      'div',
      'section',
      'code',
      'pre',
      'sub',
      'sup',
      'mark',
      'font',
      'table',
      'thead',
      'tbody',
      'tr',
      'td',
      'th',
      'hr',
    ],
    ALLOWED_ATTR: ['href', 'title', 'target', 'rel', 'align', 'color', 'background', 'face'],
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'link', 'meta', 'svg', 'math'],
    FORBID_ATTR: ['style', 'class', 'id', 'name', 'srcdoc'],
    ALLOW_UNKNOWN_PROTOCOLS: false,
  });

  const wrapper = document.createElement('div');
  wrapper.innerHTML = sanitized;

  wrapper.querySelectorAll('*').forEach((node) => {
    const element = node as HTMLElement;

    if (element.tagName.toLowerCase() === 'a') {
      const href = element.getAttribute('href');
      if (!href || !isSafeUrl(href)) {
        element.removeAttribute('href');
      }

      const target = element.getAttribute('target');
      if (target === '_blank') {
        element.setAttribute('rel', 'noopener noreferrer nofollow');
      } else {
        element.removeAttribute('target');
      }
    }

    if (['div', 'section'].includes(element.tagName.toLowerCase())) {
      const parent = element.parentElement;
      if (!parent || parent.closest('table')) return;

      const fragment = document.createDocumentFragment();
      const hasMeaningfulBlockChildren = Array.from(element.childNodes).some(
        (child) =>
          child.nodeType === Node.ELEMENT_NODE &&
          ['p', 'ul', 'ol', 'blockquote', 'h1', 'h2', 'h3', 'pre', 'table'].includes(
            (child as Element).tagName.toLowerCase()
          )
      );

      if (hasMeaningfulBlockChildren) {
        while (element.firstChild) {
          fragment.appendChild(element.firstChild);
        }
        parent.insertBefore(fragment, element);
      } else {
        const paragraph = document.createElement('p');
        while (element.firstChild) {
          paragraph.appendChild(element.firstChild);
        }
        parent.insertBefore(paragraph, element);
      }

      parent.removeChild(element);
    }
  });

  wrapper.querySelectorAll('span, font').forEach((node) => {
    const element = node as HTMLElement;
    if (!element.textContent?.trim() && !element.querySelector('img, a, br')) {
      element.remove();
    }
  });

  return wrapper.innerHTML.trim();
}

function attachToolbarControls(instance: Quill, allowHistory: boolean) {
  const toolbarElement = instance.container.querySelector('.ql-toolbar');
  if (!toolbarElement) return;

  Object.entries(toolbarLabelMap).forEach(([selector, label]) => {
    const button = toolbarElement.querySelector(selector) as HTMLButtonElement | null;
    if (button) {
      button.setAttribute('aria-label', label);
      button.setAttribute('title', label);
    }
  });

  if (!allowHistory) return;

  const existingUndo = toolbarElement.querySelector('.ql-custom-undo');
  const existingRedo = toolbarElement.querySelector('.ql-custom-redo');
  if (existingUndo) existingUndo.remove();
  if (existingRedo) existingRedo.remove();

  const undoButton = document.createElement('button');
  undoButton.type = 'button';
  undoButton.className = 'ql-custom-undo';
  undoButton.innerHTML = '<span aria-hidden="true">↶</span>';
  undoButton.setAttribute('aria-label', 'Annuler');
  undoButton.setAttribute('title', 'Annuler');
  undoButton.addEventListener('click', () => instance.history.undo());

  const redoButton = document.createElement('button');
  redoButton.type = 'button';
  redoButton.className = 'ql-custom-redo';
  redoButton.innerHTML = '<span aria-hidden="true">↷</span>';
  redoButton.setAttribute('aria-label', 'Rétablir');
  redoButton.setAttribute('title', 'Rétablir');
  redoButton.addEventListener('click', () => instance.history.redo());

  toolbarElement.appendChild(undoButton);
  toolbarElement.appendChild(redoButton);
}

function insertHtmlAtSelection(instance: Quill, html: string, plainText?: string) {
  const selection = instance.getSelection(true);
  const index = selection ? selection.index : 0;
  const length = selection ? selection.length : 0;

  if (length > 0) {
    instance.deleteText(index, length, 'user');
  }

  if (html.trim()) {
    instance.clipboard.dangerouslyPasteHTML(index, html, 'user');
    const visibleTextLength = (plainText ?? html.replace(/<[^>]*>/g, '')).length;
    instance.setSelection(index + visibleTextLength, 0, 'silent');
    return;
  }

  if (plainText) {
    instance.insertText(index, plainText, 'user');
    instance.setSelection(index + plainText.length, 0, 'silent');
  }
}

export default function QuillEditor({
  id,
  value = '',
  onChange,
  readOnly = false,
  placeholder,
  label,
  error,
  className,
  labelClassName,
  errorClassName,
  toolbarPosition = 'top',
  toolbarMode = 'full',
  allowLinks = true,
  allowHeadings = true,
  allowHistory = true,
  ...containerProps
}: QuillEditorProps) {
  const editorElement = useRef<HTMLDivElement>(null);
  const quill = useRef<Quill | null>(null);
  const onChangeRef = useRef(onChange);
  const applyingExternalValue = useRef(false);

  const toolbar = useMemo(
    () => buildToolbarConfig({ toolbarMode, allowLinks, allowHeadings }),
    [toolbarMode, allowLinks, allowHeadings]
  );

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!editorElement.current || quill.current) return;

    const instance = new Quill(editorElement.current, {
      theme: 'snow',
      formats: toolbar.formats,
      modules: {
        toolbar: {
          container: toolbar.container,
          handlers: {
            link: function () {
              const selection = instance.getSelection();
              const url = window.prompt(
                'URL du lien',
                selection && selection.length > 0 ? 'https://' : 'https://'
              );
              if (!url) return;

              const safeUrl =
                /^https?:\/\//i.test(url) || url.startsWith('/') || url.startsWith('#')
                  ? url
                  : `https://${url}`;

              instance.format('link', safeUrl, 'user');
            },
          },
        },
        history: {
          delay: 500,
          maxStack: 100,
          userOnly: false,
        },
        clipboard: {
          matchVisual: false,
        },
      },
      placeholder,
      readOnly,
    });

    quill.current = instance;
    instance.root.style.minHeight = '320px';
    instance.root.style.lineHeight = '1.7';
    instance.root.style.fontSize = '1rem';
    if (placeholder) {
      instance.root.setAttribute('data-placeholder', placeholder);
    }

    const handlePaste = (event: ClipboardEvent) => {
      const html = event.clipboardData?.getData('text/html');
      const plainText = event.clipboardData?.getData('text/plain');

      if (!html && !plainText) return;

      event.preventDefault();

      if (html) {
        const cleaned = sanitizeHtmlForPaste(html);
        if (cleaned) {
          insertHtmlAtSelection(instance, cleaned, plainText || cleaned.replace(/<[^>]*>/g, ''));
        }
        return;
      }

      if (plainText) {
        insertHtmlAtSelection(instance, '', plainText);
      }
    };

    instance.root.addEventListener('paste', handlePaste);

    attachToolbarControls(instance, allowHistory);

    if (value) {
      applyingExternalValue.current = true;
      instance.clipboard.dangerouslyPasteHTML(value, 'user');
      applyingExternalValue.current = false;
    }

    const handleChange = () => {
      if (!applyingExternalValue.current) {
        const html = instance.root.innerHTML;
        onChangeRef.current?.(html === '<p><br></p>' ? '' : html);
      }
    };

    instance.on('text-change', handleChange);

    return () => {
      instance.root.removeEventListener('paste', handlePaste);
      instance.off('text-change', handleChange);
      quill.current = null;
      editorElement.current?.replaceChildren();
    };
  }, []);

  useEffect(() => {
    const instance = quill.current;
    if (!instance) return;
    const current = instance.root.innerHTML === '<p><br></p>' ? '' : instance.root.innerHTML;
    if (current === value) return;

    applyingExternalValue.current = true;
    instance.clipboard.dangerouslyPasteHTML(value ?? '', 'user');
    applyingExternalValue.current = false;
  }, [value]);

  useEffect(() => {
    quill.current?.enable(!readOnly);
  }, [readOnly]);

  useEffect(() => {
    if (!quill.current) return;
    const instance = quill.current;
    if (placeholder) {
      instance.root.setAttribute('data-placeholder', placeholder);
    } else {
      instance.root.removeAttribute('data-placeholder');
    }
  }, [placeholder]);

  return (
    <>
      <style>{`
        .react-quill {
          display: flex;
          flex-direction: column;
          width: 100%;
        }
        .react-quill .ql-toolbar.ql-snow {
          display: flex;
          flex-wrap: wrap;
          gap: 4px 8px;
          align-items: center;
          padding: 10px 12px;
        }
        .react-quill .ql-toolbar.ql-snow .ql-formats {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          margin-right: 4px;
          margin-bottom: 0;
        }
        .react-quill .ql-toolbar.ql-snow button {
          border: 0;
          background: transparent;
          color: inherit;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 28px;
          min-height: 28px;
          border-radius: 4px;
        }
        .react-quill .ql-toolbar.ql-snow button:hover {
          background: rgba(15, 23, 42, 0.04);
        }
        .react-quill-toolbar-bottom .ql-toolbar {
          order: 2;
        }
        .react-quill-toolbar-bottom .ql-container {
          order: 1;
        }
        .react-quill .ql-container.ql-snow {
          min-height: 320px;
        }
        .react-quill .ql-editor {
          min-height: 320px;
          line-height: 1.7;
        }
      `}</style>
      <div
        {...containerProps}
        id={id}
        className={cn(
          'react-quill',
          toolbarPosition === 'bottom' && 'react-quill-toolbar-bottom relative',
          className
        )}
      >
        {label && <label className={cn('mb-1.5 block', labelClassName)}>{label}</label>}
        <div ref={editorElement} aria-label={typeof label === 'string' ? label : undefined} />
        {error && <p className={cn('mt-1 text-sm text-destructive', errorClassName)}>{error}</p>}
      </div>
    </>
  );
}
