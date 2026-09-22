import { describe, expect, it } from 'vitest';
import { buildToolbarConfig } from './quill-editor';

describe('Quill toolbar configuration', () => {
  it('keeps the full toolbar options enabled with headings and links', () => {
    const config = buildToolbarConfig({
      toolbarMode: 'full',
      allowHeadings: true,
      allowLinks: true,
    });

    expect(config.container.flat().includes('clean')).toBe(true);
    expect(config.container.flat().includes('link')).toBe(true);
    expect(config.formats).toContain('header');
    expect(config.formats).toContain('link');
    expect(config.formats).not.toContain('undo');
    expect(config.formats).not.toContain('redo');
  });

  it('hides headings and links in compact mode when disabled', () => {
    const config = buildToolbarConfig({
      toolbarMode: 'compact',
      allowHeadings: false,
      allowLinks: false,
    });

    expect(config.container.flat().includes('link')).toBe(false);
    expect(
      config.container
        .flat()
        .some((entry) => typeof entry === 'object' && entry && 'header' in entry)
    ).toBe(false);
    expect(config.formats).not.toContain('link');
    expect(config.formats).not.toContain('header');
  });
});
