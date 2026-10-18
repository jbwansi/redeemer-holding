import axios from 'axios';
import { route } from 'ziggy-js';
import type { BlogApiError } from '@/types/blog-interactions';

// The existing Axios bootstrap and Laravel XSRF-TOKEN cookie handle CSRF.
// Same-origin requests send session/actor cookies; no credential is stored in JS.
export async function blogRequest<T>(
  name: string,
  slug: string,
  method: 'get' | 'post' | 'put' | 'delete' = 'get',
  data?: unknown,
  options?: { page?: number; signal?: AbortSignal }
): Promise<T> {
  const response = await axios.request<T>({
    url: route(name, { slug }),
    method,
    data,
    headers: { Accept: 'application/json' },
    params: options?.page ? { page: options.page } : undefined,
    signal: options?.signal,
    timeout: 15000,
  });
  return response.data;
}

export function blogError(error: unknown): BlogApiError {
  if (axios.isAxiosError<{ errors?: Record<string, string[]> }>(error)) {
    const status = error.response?.status;
    const fields = Object.fromEntries(
      Object.entries(error.response?.data?.errors ?? {}).map(([key, messages]) => [
        key,
        messages[0],
      ])
    );
    if (status === 422) return { message: 'Vérifiez les informations saisies.', fields };
    if (status === 429) {
      const seconds = Number(error.response?.headers['retry-after']);
      return {
        message:
          Number.isFinite(seconds) && seconds > 0
            ? `Trop de tentatives. Réessayez dans ${seconds} secondes.`
            : 'Trop de tentatives. Patientez avant de réessayer.',
        fields: {},
      };
    }
    if (status === 419)
      return {
        message: 'Votre session a expiré. Actualisez la page avant de réessayer.',
        fields: {},
      };
    if (status === 403)
      return {
        message:
          'Votre session ne permet pas cette action. Vérifiez que les cookies sont autorisés puis actualisez la page.',
        fields: {},
      };
    if (status === 404) return { message: 'Cet article n’est plus disponible.', fields: {} };
    if (status && status >= 500)
      return {
        message:
          'Les interactions sont temporairement indisponibles à cause d’une erreur serveur. Réessayez plus tard.',
        fields: {},
      };
  }
  return {
    message: 'La demande n’a pas pu être confirmée. Vérifiez votre connexion puis réessayez.',
    fields: {},
  };
}
