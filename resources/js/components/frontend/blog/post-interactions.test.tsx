import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import PostInteractions from './post-interactions';
import type { BlogInteractionSummary } from '@/types/blog-interactions';

const mocks = vi.hoisted(() => ({
  request: vi.fn(),
  user: null as { id: number; name?: string } | null,
}));
vi.mock('axios', () => ({
  default: {
    request: mocks.request,
    isAxiosError: (error: { isAxiosError?: boolean }) => error?.isAxiosError === true,
  },
}));
vi.mock('ziggy-js', () => ({
  route: (name: string, params: { slug: string }) => `${name}/${params.slug}`,
}));
vi.mock('@inertiajs/react', () => ({ usePage: () => ({ props: { auth: { user: mocks.user } } }) }));

let root: Root;
let container: HTMLDivElement;
let summary: BlogInteractionSummary;
const approved = {
  id: 1,
  display_name: 'Alice',
  body: '<img src=x onerror=alert(1)>',
  created_at: '2026-10-14T10:00:00Z',
};
const error = (status?: number, fields?: Record<string, string[]>) => ({
  isAxiosError: true,
  response: status
    ? { status, data: { errors: fields }, headers: { 'retry-after': '60' } }
    : undefined,
});
const findButton = (text: string) =>
  Array.from(container.querySelectorAll('button')).find((button) =>
    button.textContent?.includes(text)
  )!;
const mutateCalls = () =>
  mocks.request.mock.calls
    .map(([config]) => config)
    .filter((config) => ['put', 'delete'].includes(config.method));
const commentCalls = () =>
  mocks.request.mock.calls
    .map(([config]) => config)
    .filter((config) => config.url.startsWith('blogs.comments.store'));

beforeEach(() => {
  vi.useFakeTimers();
  mocks.user = null;
  mocks.request.mockReset();
  summary = {
    likes_count: 4,
    liked: false,
    ratings_count: 2,
    rating_average: 3.5,
    my_rating: null,
    comments_count: 2,
  };
  mocks.request.mockImplementation(async (config) => {
    if (config.url.startsWith('blogs.interaction-session'))
      return { data: { comment_form_token: 'opaque-form-token' } };
    if (config.url.startsWith('blogs.comments.index'))
      return {
        data: {
          data: [config.params.page === 2 ? { ...approved, id: 2, display_name: 'Bob' } : approved],
          meta: { current_page: config.params.page, last_page: 2, per_page: 10, total: 2 },
        },
      };
    if (config.url.startsWith('blogs.comments.store')) return { data: { message: 'Received' } };
    if (config.url.startsWith('blogs.likes.'))
      summary = {
        ...summary,
        liked: config.method === 'put',
        likes_count: config.method === 'put' ? 5 : 4,
      };
    if (config.url.startsWith('blogs.ratings.'))
      summary = { ...summary, my_rating: config.method === 'put' ? config.data.rating : null };
    return { data: { ...summary } };
  });
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => root.unmount());
  document.body.innerHTML = '';
  vi.useRealTimers();
});

async function render() {
  await act(async () => root.render(<PostInteractions slug="article" />));
}
async function click(element: HTMLElement) {
  await act(async () => element.click());
}
async function change(selector: string, value: string) {
  const element = container.querySelector(selector) as HTMLInputElement | HTMLTextAreaElement;
  await act(async () => {
    Object.getOwnPropertyDescriptor(
      element instanceof HTMLTextAreaElement
        ? HTMLTextAreaElement.prototype
        : HTMLInputElement.prototype,
      'value'
    )!.set!.call(element, value);
    element.dispatchEvent(new Event('input', { bubbles: true }));
  });
}
async function prepareComment() {
  await change('#blog-comment-name', 'Marie');
  await change('#blog-comment-body', 'Mon commentaire en attente');
  await act(async () => vi.advanceTimersByTimeAsync(3101));
}
async function submit() {
  await act(async () =>
    container
      .querySelector('form')!
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
  );
}

describe('Public blog interactions', () => {
  it('loads exact server counters without initializing an anonymous identity on reads', async () => {
    await render();
    expect(container.textContent).toContain('3,5 / 5 · 2 évaluations');
    expect(container.textContent).toContain('Commentaires (2)');
    expect(container.textContent).toContain(
      'Cet article vous a été utile ? Partagez votre appréciation.'
    );
    expect(findButton('J’aime').textContent).toContain('4');
    expect(
      mocks.request.mock.calls.some(([config]) =>
        config.url.startsWith('blogs.interaction-session')
      )
    ).toBe(false);
    expect(mocks.request.mock.calls[0][0].headers).toEqual({ Accept: 'application/json' });
    expect(container.querySelector('img')).toBeNull();
    expect(container.textContent).toContain(approved.body);
  });

  it('formats a whole average with one decimal and a singular evaluation label', async () => {
    summary.rating_average = 4;
    summary.ratings_count = 1;
    await render();
    expect(container.textContent).toContain('4,0 / 5 · 1 évaluation');
    expect(container.textContent).not.toContain('1 évaluations');
  });

  it('invites the first published comment without inventing a counter', async () => {
    const original = mocks.request.getMockImplementation()!;
    mocks.request.mockImplementation((config) =>
      config.url.startsWith('blogs.comments.index')
        ? Promise.resolve({
            data: { data: [], meta: { current_page: 1, last_page: 1, per_page: 10, total: 0 } },
          })
        : original(config)
    );
    await render();
    expect(container.textContent).toContain('Commentaires (0)');
    expect(container.textContent).toContain(
      'Soyez le premier à partager votre avis sur cet article !'
    );
    expect(container.querySelector('[aria-label="Pagination des commentaires"]')).toBeNull();
  });

  it('prepares automatically on keyboard focus and blocks submission before the deadline', async () => {
    await render();
    expect(findButton('Préparer le formulaire')).toBeUndefined();
    await act(async () => container.querySelector<HTMLInputElement>('#blog-comment-name')!.focus());
    expect(findButton('Préparation…').disabled).toBe(true);
    await submit();
    expect(commentCalls()).toHaveLength(0);
    await act(async () => vi.advanceTimersByTimeAsync(3000));
    expect(findButton('Préparation…').disabled).toBe(true);
    await act(async () => vi.advanceTimersByTimeAsync(101));
    expect(findButton('Envoyer mon commentaire').disabled).toBe(false);
    expect(
      mocks.request.mock.calls.filter(([config]) =>
        config.url.startsWith('blogs.interaction-session')
      )
    ).toHaveLength(1);
  });

  it('offers a preparation retry after a network failure without losing input', async () => {
    await render();
    mocks.request.mockRejectedValueOnce(error());
    await change('#blog-comment-body', 'Mon expérience');
    expect(findButton('Réessayer la préparation')).toBeDefined();
    await click(findButton('Réessayer la préparation'));
    await act(async () => vi.advanceTimersByTimeAsync(3101));
    expect(findButton('Envoyer mon commentaire').disabled).toBe(false);
    expect(container.querySelector<HTMLTextAreaElement>('textarea')?.value).toBe('Mon expérience');
    expect(container.textContent).not.toContain('Vérifiez votre connexion');
  });

  it('adds and removes a like while sharing one initialization', async () => {
    await render();
    await click(findButton('J’aime'));
    expect(findButton('Vous aimez').getAttribute('aria-pressed')).toBe('true');
    expect(findButton('Vous aimez').textContent).toContain('5');
    await click(findButton('Vous aimez'));
    expect(findButton('J’aime').getAttribute('aria-pressed')).toBe('false');
    expect(mutateCalls().map((config) => [config.url, config.method])).toEqual([
      ['blogs.likes.store/article', 'put'],
      ['blogs.likes.destroy/article', 'delete'],
    ]);
    expect(
      mocks.request.mock.calls.filter(([config]) =>
        config.url.startsWith('blogs.interaction-session')
      )
    ).toHaveLength(1);
  });

  it('selects, modifies and removes ratings with arrow-key support', async () => {
    await render();
    await click(container.querySelector('[aria-label="3 étoiles"]')!);
    expect(container.textContent).toContain('Votre note : 3 / 5');
    const third = container.querySelector('[aria-label="3 étoiles"]') as HTMLInputElement;
    await act(async () => {
      third.focus();
      third.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true })
      );
    });
    expect(container.textContent).toContain('Votre note : 4 / 5');
    expect(container.querySelector<HTMLInputElement>('[aria-label="4 étoiles"]')?.checked).toBe(
      true
    );
    await click(findButton('Retirer ma note'));
    expect(container.textContent).toContain('Vous n’avez pas encore noté');
    expect(mutateCalls().map((config) => config.data?.rating ?? null)).toEqual([3, 4, null]);
    expect(mutateCalls()[2].method).toBe('delete');
  });

  it('submits the documented comment payload, confirms moderation and never appends pending content', async () => {
    await render();
    await prepareComment();
    expect(findButton('Envoyer mon commentaire').disabled).toBe(false);
    await submit();
    expect(commentCalls()[0].data).toEqual({
      comment_form_token: 'opaque-form-token',
      display_name: 'Marie',
      body: 'Mon commentaire en attente',
      website: '',
    });
    expect(container.textContent).toContain(
      'Merci ! Votre commentaire a été envoyé et sera publié après validation.'
    );
    expect(
      container.querySelector('[aria-label="Commentaires publiés"]')?.textContent
    ).not.toContain('Mon commentaire en attente');
    expect(container.querySelector<HTMLTextAreaElement>('textarea')?.value).toBe('');
  });

  it('waits for the anti-spam deadline and shares initialization with likes', async () => {
    await render();
    await click(findButton('J’aime'));
    await change('#blog-comment-body', 'Texte');
    expect(findButton('Préparation…').disabled).toBe(true);
    await act(async () => vi.advanceTimersByTimeAsync(3101));
    expect(findButton('Envoyer mon commentaire').disabled).toBe(false);
    expect(
      mocks.request.mock.calls.filter(([config]) =>
        config.url.startsWith('blogs.interaction-session')
      )
    ).toHaveLength(1);
  });

  it('displays 422 field errors and retains the entered comment', async () => {
    await render();
    await prepareComment();
    mocks.request.mockRejectedValueOnce(error(422, { body: ['Ce commentaire existe déjà.'] }));
    await submit();
    expect(container.textContent).toContain('Ce commentaire existe déjà.');
    expect(container.querySelector<HTMLTextAreaElement>('textarea')?.value).toBe(
      'Mon commentaire en attente'
    );
    expect(container.querySelector('textarea')?.getAttribute('aria-invalid')).toBe('true');
    expect(container.textContent).not.toContain('Merci !');
  });

  it('explains 429 responses and preserves like state', async () => {
    await render();
    mocks.request.mockRejectedValueOnce(error(429));
    await click(findButton('J’aime'));
    expect(container.textContent).toContain('Réessayez dans 60 secondes');
    expect(findButton('J’aime').getAttribute('aria-pressed')).toBe('false');
    expect(findButton('J’aime').disabled).toBe(false);
  });

  it('retains the same form token and content for a network retry', async () => {
    await render();
    await prepareComment();
    mocks.request.mockRejectedValueOnce(error());
    await submit();
    expect(container.textContent).toContain('Vérifiez votre connexion');
    await submit();
    expect(commentCalls()).toHaveLength(2);
    expect(commentCalls()[0].data).toEqual(commentCalls()[1].data);
    expect(container.textContent).toContain('Merci !');
  });

  it('paginates only via the documented page parameter', async () => {
    await render();
    await click(findButton('Suivant'));
    expect(container.textContent).toContain('Bob');
    expect(container.textContent).not.toContain('Alice');
    expect(container.textContent).toContain('Page 2 sur 2');
    expect(findButton('Suivant').disabled).toBe(true);
    await click(findButton('Précédent'));
    expect(container.textContent).toContain('Alice');
    const calls = mocks.request.mock.calls
      .map(([config]) => config)
      .filter((config) => config.url.startsWith('blogs.comments.index'));
    expect(calls.map((config) => config.params)).toEqual([{ page: 1 }, { page: 2 }, { page: 1 }]);
  });

  it('starts empty despite a profile name and submits the chosen public name for members', async () => {
    mocks.user = { id: 4, name: 'TEST' };
    await render();
    const name = container.querySelector<HTMLInputElement>('#blog-comment-name')!;
    expect(name.value).toBe('');
    expect(name.placeholder).toBe('Entrez votre prénom');
    expect(name.required).toBe(true);
    expect(name.maxLength).toBe(80);
    await change('#blog-comment-name', 'Marianne');
    await change('#blog-comment-body', 'Bonjour');
    await act(async () => vi.advanceTimersByTimeAsync(3101));
    await submit();
    expect(commentCalls()[0].data.display_name).toBe('Marianne');
    expect(commentCalls()[0].data).not.toHaveProperty('blog_actor_id');
    expect(mocks.user.name).toBe('TEST');
  });

  it('leaves the required first name empty for guests and members without a profile name', async () => {
    await render();
    expect(container.querySelector<HTMLInputElement>('#blog-comment-name')?.value).toBe('');
    expect(container.querySelector<HTMLInputElement>('#blog-comment-name')?.placeholder).toBe(
      'Entrez votre prénom'
    );
    mocks.user = { id: 4 };
    await render();
    expect(container.querySelector<HTMLInputElement>('#blog-comment-name')?.value).toBe('');
    expect(container.querySelector<HTMLInputElement>('#blog-comment-name')?.required).toBe(true);
  });

  it('preserves the typed first name across rerenders and validation errors', async () => {
    mocks.user = { id: 4, name: 'TEST' };
    await render();
    await prepareComment();
    await render();
    expect(container.querySelector<HTMLInputElement>('#blog-comment-name')?.value).toBe('Marie');
    mocks.request.mockRejectedValueOnce(error(422, { display_name: ['Prénom invalide.'] }));
    await submit();
    const name = container.querySelector<HTMLInputElement>('#blog-comment-name')!;
    expect(name.value).toBe('Marie');
    expect(name.getAttribute('aria-invalid')).toBe('true');
    await change('#blog-comment-name', 'Marianne');
    expect(name.value).toBe('Marianne');
  });

  it('disables vote controls while a request is pending', async () => {
    await render();
    let resolve!: (response: unknown) => void;
    mocks.request.mockImplementationOnce(
      () =>
        new Promise((done) => {
          resolve = done;
        })
    );
    await click(findButton('J’aime'));
    expect(findButton('Envoi…').disabled).toBe(true);
    expect(container.querySelector('fieldset')?.disabled).toBe(true);
    await act(async () => resolve({ data: { comment_form_token: 'token' } }));
    expect(findButton('Vous aimez').disabled).toBe(false);
  });

  it('renews an expired form without discarding text or silently submitting', async () => {
    await render();
    await prepareComment();
    await act(async () => vi.advanceTimersByTimeAsync(3600000));
    await submit();
    expect(commentCalls()).toHaveLength(0);
    expect(container.textContent).toContain('Le formulaire a été actualisé');
    expect(container.querySelector<HTMLTextAreaElement>('textarea')?.value).toBe(
      'Mon commentaire en attente'
    );
    await act(async () => vi.advanceTimersByTimeAsync(3101));
    await submit();
    expect(commentCalls()).toHaveLength(1);
  });
});
