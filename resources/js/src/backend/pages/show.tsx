import React from 'react';
import DOMPurify from 'dompurify';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
interface Page {
  title: string;
  content: string;
  status: boolean;
  updated_at: string;
}
const ShowPage = ({ page }: { page: Page }) => {
  const safeContent = React.useMemo(() => DOMPurify.sanitize(page.content || ''), [page.content]);

  return (
    <div className="max-w-3xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>{page.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Badge variant={page.status ? 'default' : 'outline'}>
            {page.status ? 'Publiée' : 'Brouillon'}
          </Badge>
          <div className="text-sm text-muted-foreground">
            Dernière mise à jour: {format(new Date(page.updated_at), 'MMMM d, yyyy')}
          </div>
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: safeContent }} />
        </CardContent>
      </Card>
    </div>
  );
};

export default ShowPage;
