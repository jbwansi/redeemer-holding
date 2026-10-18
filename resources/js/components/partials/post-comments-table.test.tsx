import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import PostCommentsTable, { ModerationComment } from './post-comments-table';

const mocks = vi.hoisted(() => ({
  patch: vi.fn(),
  reload: vi.fn(),
  errors: {} as Record<string, string>,
}));
vi.mock('ziggy-js', () => ({
  route: (_name: string, id: number) => `/dashboard/post-comments/${id}/status`,
}));
vi.mock('@inertiajs/react', () => ({
  router: { reload: mocks.reload },
  useForm: (initial: unknown) => {
    const [data, setData] = React.useState(initial);
    return {
      data,
      setData,
      errors: mocks.errors,
      processing: false,
      patch: mocks.patch,
      clearErrors: vi.fn(),
      reset: vi.fn(),
    };
  },
}));

const comment: ModerationComment = {
  id: 1,
  display_name: 'Visiteur',
  body: '<img src=x onerror=alert(1)>',
  status: 'pending',
  created_at: '2026-10-14T10:00:00Z',
  version: 0,
  allowed_statuses: ['approved', 'rejected', 'spam'],
  post: { id: 1, title: 'Article', deleted: false },
};

afterEach(() => {
  vi.clearAllMocks();
  mocks.errors = {};
  document.body.innerHTML = '';
});

describe('PostCommentsTable', () => {
  it('renders untrusted content as text and requires confirmation before patching', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    await act(async () => root.render(<PostCommentsTable comments={[comment]} />));
    expect(container.querySelector('img')).toBeNull();
    expect(container.textContent).toContain(comment.body);
    const approve = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === 'Approuver'
    )!;
    await act(async () => approve.click());
    expect(mocks.patch).not.toHaveBeenCalled();
    expect(document.querySelector('[role="alertdialog"]')).not.toBeNull();
    const confirm = Array.from(document.querySelectorAll('button')).find(
      (button) => button.textContent === 'Confirmer'
    )!;
    await act(async () => confirm.click());
    expect(mocks.patch).toHaveBeenCalledWith(
      '/dashboard/post-comments/1/status',
      expect.objectContaining({ preserveScroll: true })
    );
    await act(async () => root.unmount());
  });

  it('only offers server-provided actions and blocks stale decisions until reload', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    await act(async () =>
      root.render(
        <PostCommentsTable
          comments={[{ ...comment, status: 'spam', allowed_statuses: ['pending'] }]}
        />
      )
    );
    expect(container.textContent).not.toContain('Approuver');
    await act(async () => container.querySelector('button')!.click());
    mocks.errors = { conflict: 'Rechargez la liste.' };
    await act(async () => root.render(<PostCommentsTable comments={[comment]} />));
    const confirm = Array.from(document.querySelectorAll('button')).find(
      (button) => button.textContent === 'Confirmer'
    )!;
    expect(confirm.disabled).toBe(true);
    const reload = Array.from(document.querySelectorAll('button')).find(
      (button) => button.textContent === 'Recharger la liste'
    )!;
    await act(async () => reload.click());
    expect(mocks.reload).toHaveBeenCalled();
    await act(async () => root.unmount());
  });
});
