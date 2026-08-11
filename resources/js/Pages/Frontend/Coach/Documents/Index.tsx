import { Head, router, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import DashboardLayout from '@/components/frontend/layouts/dashboard-layout';
import { Button } from '@/components/ui/button';
interface Document {
  id: number;
  type: string;
  original_name: string;
  language?: string;
  size: number;
  created_at: string;
}
export default function Index({ documents }: { documents: Document[] }) {
  const form = useForm<{ type: string; language: string; document: File | null }>({
    type: 'cv',
    language: 'fr',
    document: null,
  });
  return (
    <DashboardLayout title="Documents Coach" currentPage="coach">
      <Head title="Documents Coach" />
      <main className="mx-auto max-w-4xl space-y-5 p-6">
        <h1 className="text-3xl font-bold">Mes documents privés</h1>
        <form
          className="flex flex-wrap gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            form.post(route('coach.documents.store'), { forceFormData: true });
          }}
        >
          <select value={form.data.type} onChange={(e) => form.setData('type', e.target.value)}>
            <option value="cv">CV</option>
            <option value="job_offer">Offre</option>
            <option value="job_description">Description de poste</option>
            <option value="certificate">Certificat</option>
            <option value="other">Autre</option>
          </select>
          <input
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={(e) => form.setData('document', e.target.files?.[0] ?? null)}
          />
          <Button disabled={form.processing}>Ajouter</Button>
        </form>
        <ul className="divide-y">
          {documents.map((d) => (
            <li className="flex items-center justify-between py-3" key={d.id}>
              <span>
                {d.original_name} · {d.type} · {Math.ceil(d.size / 1024)} Ko
              </span>
              <span className="flex gap-2">
                <a className="underline" href={route('coach.documents.download', d.id)}>
                  Télécharger
                </a>
                <button onClick={() => router.delete(route('coach.documents.destroy', d.id))}>
                  Supprimer
                </button>
              </span>
            </li>
          ))}
        </ul>
      </main>
    </DashboardLayout>
  );
}
