export type ServiceFocus =
  | 'all'
  | 'coaching'
  | 'consultation'
  | 'formation'
  | 'team_building'
  | 'webinaire'
  | 'ressources';

type FilterableService = {
  name?: string | null;
  slug?: string | null;
  excerpt?: string | null;
  content?: string | null;
  tagline?: string | null;
  ideal_for?: string[] | null;
};

const focusKeywords: Record<Exclude<ServiceFocus, 'all'>, string[]> = {
  coaching: ['coaching', 'coach'],
  consultation: ['consultation', 'conseil', 'entrepreneur', 'bilan de competences'],
  formation: ['formation', 'atelier', 'conference', 'leadership'],
  team_building: ['team building', 'coaching d equipe', 'cohesion', 'collectif'],
  webinaire: ['webinaire', 'conference', 'atelier a distance'],
  ressources: ['ressource', 'guide', 'outil', 'bilan de competences'],
};

// Transitional aliases until services have a structured category field.
const focusAliases: Partial<Record<Exclude<ServiceFocus, 'all'>, string[]>> = {
  consultation: ['accompagnement-entrepreneurial', 'bilan-de-competences'],
  formation: ['developpement-du-leadership', 'conferences-workshops'],
  team_building: ['coaching-d-equipe'],
  webinaire: ['conferences-workshops'],
  ressources: ['bilan-de-competences'],
};

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/[-_]/g, ' ')
    .toLowerCase();

export const serviceMatchesFocus = (service: FilterableService, focus: ServiceFocus) => {
  if (focus === 'all') return true;

  const slug = String(service.slug || '').toLowerCase();
  if ((focusAliases[focus] ?? []).includes(slug)) return true;

  const haystack = normalize(
    [
      service.name,
      service.slug,
      service.excerpt,
      service.content,
      service.tagline,
      ...(Array.isArray(service.ideal_for) ? service.ideal_for : []),
    ]
      .filter(Boolean)
      .join(' ')
  );

  return focusKeywords[focus].some((keyword) => haystack.includes(normalize(keyword)));
};
