import { Search, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';

import IconComponent from '@/components/ui/icon';
import { normalizeServiceIconName } from '@/lib/service-icon';
import {
  filterServiceIcons,
  findServiceIcon,
  SERVICE_ICON_CATEGORIES,
  type ServiceIconCategory,
} from '@/lib/service-icon-registry';

interface IconPickerProps {
  value: string;
  onChange: (value: string) => void;
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<ServiceIconCategory | 'all'>('all');
  const normalizedValue = normalizeServiceIconName(value);
  const selectedIcon = findServiceIcon(normalizedValue || value);
  const displayedIcons = useMemo(() => filterServiceIcons(query, category), [query, category]);
  const SelectedIcon = selectedIcon?.component;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 rounded-xl border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border bg-background text-[#DA2E29]">
            {SelectedIcon ? (
              <SelectedIcon aria-hidden="true" className="h-6 w-6" />
            ) : value ? (
              <IconComponent
                name={normalizedValue || value}
                aria-hidden="true"
                className="h-6 w-6"
              />
            ) : (
              <span className="text-xs text-muted-foreground">Aucune</span>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold">Icône sélectionnée</p>
            <p className="truncate text-xs text-muted-foreground">
              {selectedIcon?.label || value || 'Aucune icône'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onChange('')}
          disabled={!value}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DA2E29] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Trash2 aria-hidden="true" className="h-4 w-4" />
          Retirer l’icône
        </button>
      </div>

      {value && !selectedIcon && (
        <p className="rounded-lg border border-amber-300/60 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
          Cette ancienne valeur est conservée. Sélectionnez une nouvelle icône uniquement si vous
          souhaitez la remplacer.
        </p>
      )}

      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(220px,0.4fr)]">
        <label className="relative block">
          <span className="sr-only">Rechercher une icône</span>
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher par nom, usage ou catégorie"
            className="min-h-11 w-full rounded-xl border bg-background py-2 pl-10 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DA2E29]"
          />
        </label>

        <label>
          <span className="sr-only">Filtrer les icônes par catégorie</span>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value as ServiceIconCategory | 'all')}
            className="min-h-11 w-full rounded-xl border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DA2E29]"
          >
            <option value="all">Toutes les catégories</option>
            {SERVICE_ICON_CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div
        className="grid max-h-[28rem] grid-cols-2 gap-2 overflow-y-auto rounded-xl border p-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5"
        aria-label="Catalogue des icônes de services"
      >
        {displayedIcons.map((entry) => {
          const EntryIcon = entry.component;
          const selected = selectedIcon?.name === entry.name;

          return (
            <button
              key={entry.name}
              type="button"
              onClick={() => onChange(entry.name)}
              aria-label={`${entry.label} — ${entry.category}`}
              aria-pressed={selected}
              title={`${entry.label} — ${entry.category}`}
              className={`flex min-h-24 flex-col items-center justify-center gap-2 rounded-xl border p-2 text-center text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DA2E29] ${
                selected
                  ? 'border-[#DA2E29] bg-[#DA2E29]/10 text-[#DA2E29] ring-1 ring-[#DA2E29]'
                  : 'border-border bg-background text-foreground hover:border-[#DA2E29]/50 hover:bg-muted'
              }`}
            >
              <EntryIcon aria-hidden="true" className="h-6 w-6" />
              <span className="line-clamp-2">{entry.label}</span>
              {selected && <span className="sr-only">Sélectionnée</span>}
            </button>
          );
        })}
      </div>

      {displayedIcons.length === 0 && (
        <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
          Aucune icône ne correspond à cette recherche.
        </p>
      )}
    </div>
  );
}
