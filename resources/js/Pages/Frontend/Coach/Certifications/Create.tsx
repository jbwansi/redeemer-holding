import { Head, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import DashboardLayout from '@/components/frontend/layouts/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NativeSelect } from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';
interface Goal {
  id: number;
  title: string;
  target_role: string | null;
}
export default function Create({
  careerGoals,
  languages,
  defaultLanguage,
}: {
  careerGoals: Goal[];
  languages: string[];
  defaultLanguage: string;
}) {
  const form = useForm({
    target_role: '',
    target_sector: '',
    professional_domain: '',
    objective: '',
    language: defaultLanguage,
    career_goal_id: '',
    submission_token: crypto.randomUUID(),
  });
  return (
    <DashboardLayout title="Analyser mes compétences" currentPage="coach">
      <Head title="Analyser mes compétences" />
      <Card className="mx-auto max-w-3xl p-6">
        <h1 className="mb-1 text-2xl font-semibold">Compétences & certifications</h1>
        <p className="mb-5 text-sm text-muted-foreground">
          Les certifications et formations produites sont des suggestions IA à vérifier, sans
          validation externe.
        </p>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            form.post(route('coach.certifications.store'));
          }}
        >
          <div>
            <Label>Poste cible</Label>
            <Input
              required
              value={form.data.target_role}
              onChange={(e) => form.setData('target_role', e.target.value)}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Secteur</Label>
              <Input
                value={form.data.target_sector}
                onChange={(e) => form.setData('target_sector', e.target.value)}
              />
            </div>
            <div>
              <Label>Domaine</Label>
              <Input
                value={form.data.professional_domain}
                onChange={(e) => form.setData('professional_domain', e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label>Objectif</Label>
            <Textarea
              className="w-full rounded-md border p-2"
              value={form.data.objective}
              onChange={(e) => form.setData('objective', e.target.value)}
            />
          </div>
          <div>
            <Label>Objectif carrière existant (facultatif)</Label>
            <NativeSelect
              className="w-full rounded-md border p-2"
              value={form.data.career_goal_id}
              onChange={(e) => form.setData('career_goal_id', e.target.value)}
            >
              <option value="">Aucun</option>
              {careerGoals.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.title}
                </option>
              ))}
            </NativeSelect>
          </div>
          <NativeSelect
            className="rounded-md border p-2"
            value={form.data.language}
            onChange={(e) => form.setData('language', e.target.value)}
          >
            {languages.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </NativeSelect>
          <Button disabled={form.processing}>Lancer l’analyse</Button>
        </form>
      </Card>
    </DashboardLayout>
  );
}
