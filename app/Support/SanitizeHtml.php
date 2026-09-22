<?php

namespace App\Support;

use DOMDocument;
use DOMElement;
use DOMNodeList;
use Illuminate\Support\Str;

final class SanitizeHtml
{
    /**
     * Remove dangerous HTML but preserve common rich text blocks used in Quill.
     */
    public static function sanitize(?string $html): ?string
    {
        if ($html === null) {
            return null;
        }

        $trimmed = trim($html);
        if ($trimmed === '') {
            return '';
        }

        $clean = preg_replace('/\r\n?/', "\n", $html);
        $clean = preg_replace('/<\s*(?:script|style|iframe|object|embed|meta|link|svg|math)\b.*?>.*?<\s*\/\s*(?:script|style|iframe|object|embed|meta|link|svg|math)\s*>/is', '', $clean ?? '');

        $dom = new DOMDocument();
        $dom->preserveWhiteSpace = true;
        $dom->formatOutput = false;
        @$dom->loadHTML('<?xml encoding="UTF-8">' . $clean, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);

        $xpath = new \DOMXPath($dom);
        foreach ($xpath->query('//*[name()="script" or name()="style" or name()="iframe" or name()="object" or name()="embed" or name()="meta" or name()="link" or name()="svg" or name()="math"]') as $node) {
            $node->parentNode?->removeChild($node);
        }

        foreach ($xpath->query('//@*') as $attribute) {
            $name = strtolower($attribute->nodeName);
            if (in_array($name, ['style', 'class', 'id', 'name', 'srcdoc'], true)) {
                $attribute->ownerElement?->removeAttribute($attribute->nodeName);
            }
        }

        foreach ($xpath->query('//a') as $link) {
            /** @var DOMElement $link */
            $href = trim((string) $link->getAttribute('href'));
            if ($href === '' || ! self::isAllowedUrl($href)) {
                $link->removeAttribute('href');
            }

            $target = $link->getAttribute('target');
            if ($target === '_blank') {
                $link->setAttribute('rel', 'noopener noreferrer nofollow');
            } else {
                $link->removeAttribute('target');
            }
        }

        foreach ($xpath->query('//div | //section | //span | //font') as $node) {
            /** @var DOMElement $node */
            if (self::isSafeInlineTextContainer($node)) {
                continue;
            }

            $parent = $node->parentNode;
            if (!$parent) {
                continue;
            }

            $content = $node->ownerDocument->createDocumentFragment();
            while ($node->firstChild) {
                $content->appendChild($node->firstChild);
            }

            $parent->insertBefore($content, $node);
            $parent->removeChild($node);
        }

        $html = self::normalizeNodes($dom);

        return preg_replace('/\n{3,}/', "\n\n", trim($html)) ?? trim($html);
    }

    private static function isAllowedUrl(string $url): bool
    {
        $trimmed = trim($url);

        if ($trimmed === '') {
            return false;
        }

        if (preg_match('/^(?:javascript|data|vbscript):/i', $trimmed)) {
            return false;
        }

        $allowedProtocols = ['http', 'https', 'mailto', 'tel'];

        if (preg_match('/^(?:\/|#)/', $trimmed)) {
            return true;
        }

        if (! preg_match('/^[a-zA-Z][a-zA-Z0-9+.-]*:/', $trimmed)) {
            return true;
        }

        $parts = parse_url($trimmed);
        if (! is_array($parts) || ! isset($parts['scheme'])) {
            return false;
        }

        return in_array(strtolower($parts['scheme']), $allowedProtocols, true);
    }

    private static function isSafeInlineTextContainer(DOMElement $element): bool
    {
        $tag = strtolower($element->tagName);

        if (in_array($tag, ['span', 'font'], true)) {
            $hasMeaningfulContent = trim($element->textContent ?? '') !== '' || $element->getElementsByTagName('a')->length > 0;
            return $hasMeaningfulContent;
        }

        return false;
    }

    private static function normalizeNodes(DOMDocument $dom): string
    {
        $allowed = ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'del', 'blockquote', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'a', 'span', 'div', 'section', 'code', 'pre', 'sub', 'sup', 'mark', 'font', 'table', 'thead', 'tbody', 'tr', 'td', 'th', 'hr'];

        foreach ($dom->getElementsByTagName('*') as $node) {
            $tag = strtolower($node->nodeName);
            if (! in_array($tag, $allowed, true)) {
                $fragment = $dom->createDocumentFragment();
                while ($node->firstChild) {
                    $fragment->appendChild($node->firstChild);
                }

                if ($node->parentNode) {
                    $node->parentNode->insertBefore($fragment, $node);
                    $node->parentNode->removeChild($node);
                }
            }
        }

        $html = $dom->saveHTML();

        return str_replace(['<?xml encoding="UTF-8">', "\0"], '', (string) $html);
    }
}
