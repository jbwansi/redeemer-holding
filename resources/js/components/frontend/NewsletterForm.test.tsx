import React from 'react';
import { act } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createRoot } from 'react-dom/client';
import NewsletterForm from './NewsletterForm';

function render(ui: React.ReactElement) {
  const container = document.createElement('div');
  document.body.appendChild(container);

  const root = createRoot(container);

  act(() => {
    root.render(ui);
  });

  return { container, root };
}

afterEach(() => {
  document.body.innerHTML = '';
  window.location.hash = '';
  vi.restoreAllMocks();
});

describe('NewsletterForm', () => {
  it('exposes a unique stable newsletter anchor and focuses the email field when the hash is opened', async () => {
    const scrollIntoViewMock = vi.fn();
    const focusMock = vi.fn();

    window.location.hash = '#newsletter';

    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      value: scrollIntoViewMock,
      writable: true,
      configurable: true,
    });
    vi.spyOn(HTMLInputElement.prototype, 'focus').mockImplementation(function (
      this: HTMLInputElement,
      options?: FocusOptions
    ) {
      focusMock(options);
      return undefined;
    });

    const { container, root } = render(<NewsletterForm source="footer" id="newsletter" />);

    await act(async () => {
      await Promise.resolve();
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    const anchor = container.querySelector('#newsletter');
    const emailField = container.querySelector('#newsletter-email');

    expect(anchor).not.toBeNull();
    expect(anchor?.className).toContain('scroll-mt-24');
    expect(emailField).not.toBeNull();
    expect(container.querySelectorAll('#newsletter').length).toBe(1);
    expect(scrollIntoViewMock).toHaveBeenCalled();
    expect(focusMock).toHaveBeenCalledWith({ preventScroll: true });

    act(() => {
      root.unmount();
    });
  });
});
