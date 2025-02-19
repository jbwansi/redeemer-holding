import { Settings } from "@/types/settings";

export const fetchSettings = async (): Promise<Settings> => {
    const response = await fetch(route('settings.fetch'), {
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? ''
        }
    });

    if (!response.ok) {
        throw new Error('Erreur lors de la récupération des paramètres');
    }

    return response.json();
};

