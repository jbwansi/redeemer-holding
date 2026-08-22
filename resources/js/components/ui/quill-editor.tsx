import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { type HTMLAttributes, type ReactNode, useEffect, useRef } from 'react';
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
}

const toolbar = [
  ['bold', 'italic', 'underline', 'strike'],
  ['blockquote', 'code-block'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ script: 'sub' }, { script: 'super' }],
  [{ indent: '-1' }, { indent: '+1' }],
  [{ color: [] }, { background: [] }],
  [{ font: [] }],
  [{ align: [] }],
  ['clean'],
];

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
  ...containerProps
}: QuillEditorProps) {
  const editorElement = useRef<HTMLDivElement>(null);
  const quill = useRef<Quill | null>(null);
  const onChangeRef = useRef(onChange);
  const applyingExternalValue = useRef(false);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!editorElement.current) return;

    const instance = new Quill(editorElement.current, {
      theme: 'snow',
      modules: { toolbar },
      placeholder,
      readOnly,
    });
    quill.current = instance;
    if (value) {
      applyingExternalValue.current = true;
      instance.clipboard.dangerouslyPasteHTML(value);
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
    instance.clipboard.dangerouslyPasteHTML(value ?? '');
    applyingExternalValue.current = false;
  }, [value]);

  useEffect(() => {
    quill.current?.enable(!readOnly);
  }, [readOnly]);

  return (
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
      <div ref={editorElement} />
      {error && <p className={cn('mt-1 text-sm text-destructive', errorClassName)}>{error}</p>}
    </div>
  );
}
