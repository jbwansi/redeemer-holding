import { Head, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import DashboardLayout from '@/components/frontend/layouts/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NativeSelect } from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';
export default function Create({
  languages,
  defaultLanguage,
}: {
  languages: string[];
  defaultLanguage: string;
}) {
  const form = useForm({
    title: '',
    current_situation: '',
    target_role: '',
    target_sector: '',
    target_description: '',
    language: defaultLanguage,
    target_date: '',
    submission_token: crypto.randomUUID(),
  });
  return (
    <DashboardLayout title="Nouvel objectif" currentPage="coach">
      <Head title="Nouvel objectif carrière" />
      <Card className="mx-auto max-w-3xl p-6">
        <h1 className="mb-4 text-2xl font-semibold">Définir mon objectif</h1>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            form.post(route('coach.career.store'));
          }}
        >
          <div>
            <Label>Titre de l’objectif</Label>
            <Input
              value={form.data.title}
              onChange={(e) => form.setData('title', e.target.value)}
              required
            />
          </div>
          <div>
            <Label>Situation actuelle</Label>
            <Textarea
              className="w-full rounded-md border p-2"
              value={form.data.current_situation}
              onChange={(e) => form.setData('current_situation', e.target.value)}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Poste cible</Label>
              <Input
                value={form.data.target_role}
                onChange={(e) => form.setData('target_role', e.target.value)}
              />
            </div>
            <div>
              <Label>Secteur cible</Label>
              <Input
                value={form.data.target_sector}
                onChange={(e) => form.setData('target_sector', e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              className="w-full rounded-md border p-2"
              value={form.data.target_description}
              onChange={(e) => form.setData('target_description', e.target.value)}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <NativeSelect
              className="rounded-md border p-2"
              value={form.data.language}
              onChange={(e) => form.setData('language', e.target.value)}
            >
              {languages.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </NativeSelect>
            <Input
              type="date"
              value={form.data.target_date}
              onChange={(e) => form.setData('target_date', e.target.value)}
            />
          </div>
          <Button disabled={form.processing}>Analyser et proposer un plan</Button>
        </form>
      </Card>
    </DashboardLayout>
  );
}
