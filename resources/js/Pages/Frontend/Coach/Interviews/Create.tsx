import { Head, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import DashboardLayout from '@/components/frontend/layouts/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Document {
  id: number;
  type: string;
  original_name: string;
}
export default function Create({
  documents,
  languages,
  defaultLanguage,
}: {
  documents: Document[];
  languages: string[];
  defaultLanguage: string;
}) {
  const form = useForm({
    job_title: '',
    company_name: '',
    job_description: '',
    interview_type: 'general',
    difficulty: 'standard',
    language: defaultLanguage,
    document_ids: [] as number[],
  });
  return (
    <DashboardLayout title="Nouvelle simulation" currentPage="coach">
      <Head title="Nouvelle simulation" />
      <form
        className="mx-auto max-w-3xl space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          form.post(route('coach.interviews.store'));
        }}
      >
        <div>
          <Label>Poste</Label>
          <Input
            value={form.data.job_title}
            onChange={(e) => form.setData('job_title', e.target.value)}
            required
          />
        </div>
        <div>
          <Label>Entreprise (facultative)</Label>
          <Input
            value={form.data.company_name}
            onChange={(e) => form.setData('company_name', e.target.value)}
          />
        </div>
        <div>
          <Label>Description ou offre</Label>
          <Textarea
            value={form.data.job_description}
            onChange={(e) => form.setData('job_description', e.target.value)}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <select
            className="rounded border bg-background p-2"
            value={form.data.interview_type}
            onChange={(e) => form.setData('interview_type', e.target.value)}
          >
            {['general', 'behavioral', 'technical', 'management', 'leadership'].map((value) => (
              <option value={value} key={value}>
                {value}
              </option>
            ))}
          </select>
          <select
            className="rounded border bg-background p-2"
            value={form.data.difficulty}
            onChange={(e) => form.setData('difficulty', e.target.value)}
          >
            {['easy', 'standard', 'advanced'].map((value) => (
              <option value={value} key={value}>
                {value}
              </option>
            ))}
          </select>
          <select
            className="rounded border bg-background p-2"
            value={form.data.language}
            onChange={(e) => form.setData('language', e.target.value)}
          >
            {languages.map((value) => (
              <option value={value} key={value}>
                {value.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
        {documents.length > 0 && (
          <fieldset>
            <legend className="mb-2 font-medium">Documents facultatifs</legend>
            {documents.map((document) => (
              <label className="mr-4 inline-flex items-center gap-2" key={document.id}>
                <input
                  type="checkbox"
                  checked={form.data.document_ids.includes(document.id)}
                  onChange={(e) =>
                    form.setData(
                      'document_ids',
                      e.target.checked
                        ? [...form.data.document_ids, document.id]
                        : form.data.document_ids.filter((id) => id !== document.id)
                    )
                  }
                />
                {document.original_name}
              </label>
            ))}
          </fieldset>
        )}
        <Button disabled={form.processing}>
          {form.processing ? 'Préparation…' : 'Préparer la simulation'}
        </Button>
      </form>
    </DashboardLayout>
  );
}
