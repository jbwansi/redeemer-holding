import { describe, expect, it } from 'vitest';
import { blogError } from './blog-interactions';

describe('Blog API error reporting', () => {
  it.each([500, 502, 503])(
    'distinguishes HTTP %i from a network failure without leaking server details',
    (status) => {
      const result = blogError({
        isAxiosError: true,
        response: {
          status,
          data: { message: 'SQLSTATE: no such table: post_comments', trace: ['internal path'] },
          headers: {},
        },
      });
      expect(result.message).toContain('erreur serveur');
      expect(result.message).not.toContain('connexion');
      expect(JSON.stringify(result)).not.toContain('SQLSTATE');
      expect(result.fields).toEqual({});
    }
  );

  it('keeps a useful network error when no HTTP response was received', () => {
    expect(blogError({ isAxiosError: true }).message).toContain('Vérifiez votre connexion');
  });
});
