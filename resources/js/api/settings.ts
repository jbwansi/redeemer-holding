import { Settings } from '@/types/settings';

export const fetchSettings = async (): Promise<Settings> => {
  const isDashboard = window.location.pathname.startsWith('/dashboard');
  const endpoint = isDashboard ? route('settings.fetch') : route('settings.public');
  const url = `${endpoint}${endpoint.includes('?') ? '&' : '?'}_ts=${Date.now()}`;

  const response = await fetch(url, {
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-TOKEN':
        document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '',
    },
  });

  if (!response.ok) {
    throw new Error('Erreur lors de la récupération des paramètres');
  }

  return response.json();
};
