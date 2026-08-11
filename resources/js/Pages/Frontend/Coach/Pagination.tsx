import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';

export interface Paginated<T> {
  data: T[];
  current_page: number;
  last_page: number;
  prev_page_url: string | null;
  next_page_url: string | null;
}

export function CoachPagination({ page }: { page: Paginated<unknown> }) {
  if (page.last_page <= 1) return null;

  return (
    <nav aria-label="Pagination" className="flex items-center justify-between gap-3">
      {page.prev_page_url ? (
        <Button asChild variant="outline">
          <Link href={page.prev_page_url} preserveScroll>
            Précédent
          </Link>
        </Button>
      ) : (
        <Button disabled variant="outline">
          Précédent
        </Button>
      )}
      <span className="text-sm text-muted-foreground">
        Page {page.current_page} sur {page.last_page}
      </span>
      {page.next_page_url ? (
        <Button asChild variant="outline">
          <Link href={page.next_page_url} preserveScroll>
            Suivant
          </Link>
        </Button>
      ) : (
        <Button disabled variant="outline">
          Suivant
        </Button>
      )}
    </nav>
  );
}
