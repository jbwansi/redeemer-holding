import { Head, Link, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import DashboardLayout from '@/components/frontend/layouts/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Document {
  id: number;
  type: string;
  original_name: string;
  language: string | null;
}

export default function Analyze({
  documents,
  languages,
  defaultLanguage,
}: {
  documents: Document[];
  languages: string[];
  defaultLanguage: string;
}) {
  const cvs = documents.filter((document) => document.type === 'cv');
  const offers = documents.filter((document) =>
    ['job_offer', 'job_description'].includes(document.type)
  );
  const form = useForm({
    cv_document_id: '',
    job_document_id: '',
    job_title: '',
    company_name: '',
    language: defaultLanguage,
    submission_token: crypto.randomUUID(),
  });
  const upload = useForm<{ type: string; language: string; document: File | null }>({
    type: 'cv',
    language: defaultLanguage,
    document: null,
  });

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    form.post(route('coach.cv.store'), { preserveScroll: true });
  };

  return (
    <DashboardLayout title="Analyser une candidature" currentPage="coach">
      <Head title="Analyser une candidature" />
      <Card className="mx-auto max-w-3xl p-6">
        <h1 className="mb-1 text-2xl font-semibold">Comparer mon CV à une offre</h1>
        <p className="mb-5 text-sm text-muted-foreground">
          Le Coach produit des propositions à relire. Il ne modifie jamais vos documents.
        </p>
        <form className="space-y-4" onSubmit={submit}>
          <div className="rounded-md border bg-muted/30 p-4">
            <h2 className="mb-2 font-medium">Ajouter un document privé</h2>
            <div className="flex flex-wrap gap-2">
              <select
                className="rounded-md border p-2"
                value={upload.data.type}
                onChange={(e) => upload.setData('type', e.target.value)}
              >
                <option value="cv">CV</option>
                <option value="job_offer">Offre d’emploi</option>
                <option value="job_description">Description de poste</option>
              </select>
              <input
                accept=".pdf,.docx,.txt"
                type="file"
                onChange={(e) => upload.setData('document', e.target.files?.[0] ?? null)}
              />
              <Button
                disabled={upload.processing || !upload.data.document}
                onClick={() =>
                  upload.post(route('coach.documents.store'), {
                    forceFormData: true,
                    preserveScroll: true,
                  })
                }
                type="button"
                variant="outline"
              >
                Téléverser
              </Button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              PDF, DOCX ou TXT, 10 Mo maximum. Aucun document n’est rendu public.
            </p>
          </div>
          <div>
            <Label htmlFor="cv">CV</Label>
            <select
              className="w-full rounded-md border p-2"
              id="cv"
              value={form.data.cv_document_id}
              onChange={(e) => form.setData('cv_document_id', e.target.value)}
              required
            >
              <option value="">Sélectionner</option>
              {cvs.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.original_name}
                </option>
              ))}
            </select>
            {form.errors.cv_document_id && (
              <p className="text-sm text-red-600">{form.errors.cv_document_id}</p>
            )}
          </div>
          <div>
            <Label htmlFor="offer">Offre ou description de poste</Label>
            <select
              className="w-full rounded-md border p-2"
              id="offer"
              value={form.data.job_document_id}
              onChange={(e) => form.setData('job_document_id', e.target.value)}
              required
            >
              <option value="">Sélectionner</option>
              {offers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.original_name}
                </option>
              ))}
            </select>
            {form.errors.job_document_id && (
              <p className="text-sm text-red-600">{form.errors.job_document_id}</p>
            )}
          </div>
          <div>
            <Label htmlFor="job_title">Poste</Label>
            <Input
              id="job_title"
              value={form.data.job_title}
              onChange={(e) => form.setData('job_title', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="company_name">Entreprise (facultatif)</Label>
            <Input
              id="company_name"
              value={form.data.company_name}
              onChange={(e) => form.setData('company_name', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="language">Langue de réponse</Label>
            <select
              className="w-full rounded-md border p-2"
              id="language"
              value={form.data.language}
              onChange={(e) => form.setData('language', e.target.value)}
            >
              {languages.map((language) => (
                <option key={language} value={language}>
                  {language.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-3">
            <Button
              disabled={form.processing || cvs.length === 0 || offers.length === 0}
              type="submit"
            >
              Lancer l’analyse
            </Button>
            <Button asChild variant="outline">
              <Link href={route('coach.documents.index')}>Gérer mes documents</Link>
            </Button>
          </div>
        </form>
      </Card>
    </DashboardLayout>
  );
}
