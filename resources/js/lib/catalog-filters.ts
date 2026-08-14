export const readCatalogFilter = (name: string): string => {
  if (typeof window === 'undefined') return '';

  return new URLSearchParams(window.location.search).get(name) ?? '';
};

export const catalogPageParams = (
  page: number,
  filters: Record<string, string | boolean | null>
) => {
  const params: Record<string, string | number | boolean> = { page };

  Object.entries(filters).forEach(([name, value]) => {
    if (value !== '' && value !== null && value !== false) params[name] = value;
  });

  return params;
};
