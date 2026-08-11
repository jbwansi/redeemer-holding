import { Head, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

interface Settings {
  enabled: boolean;
  module_interview: boolean;
  module_cv: boolean;
  module_career: boolean;
  module_certification: boolean;
  provider: string;
  languages: string[];
  default_language: string;
  monthly_message_limit: number;
  rate_limit_per_minute: number;
  general_instructions: string;
  interview_question_limit: number;
}

interface Props {
  settings: Settings;
  metrics: Record<string, number>;
}

const moduleLabels: Array<[keyof Settings, string]> = [
  ['module_interview', 'Entretiens'],
  ['module_cv', 'CV & candidatures'],
  ['module_career', 'Orientation & carrière'],
  ['module_certification', 'Compétences & certifications'],
];

export default function CoachAdmin({ settings, metrics }: Props) {
  const form = useForm(settings);
  const toggleLanguage = (language: string, enabled: boolean) => {
    form.setData(
      'languages',
      enabled
        ? Array.from(new Set([...form.data.languages, language]))
        : form.data.languages.filter((item) => item !== language)
    );
  };

  return (
    <div className="space-y-6">
      <Head title="Coach numérique" />
      <div>
        <h2 className="text-2xl font-semibold">Coach numérique</h2>
        <p className="text-muted-foreground">
          Configuration opérationnelle et métriques agrégées. Aucun contenu privé utilisateur n'est
          affiché.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <strong>{metrics.requests}</strong>
          <p>Requêtes totales</p>
        </Card>
        <Card className="p-4">
          <strong>{metrics.activeUsers}</strong>
          <p>Utilisateurs actifs</p>
        </Card>
        <Card className="p-4">
          <strong>{metrics.failedRequests}</strong>
          <p>Échecs</p>
        </Card>
        <Card className="p-4">
          <strong>{metrics.successfulRequests}</strong>
          <p>Succès</p>
        </Card>
        <Card className="p-4">
          <strong>{metrics.inputTokens}</strong>
          <p>Tokens entrants</p>
        </Card>
        <Card className="p-4">
          <strong>{metrics.outputTokens}</strong>
          <p>Tokens sortants</p>
        </Card>
      </div>

      <form
        className="space-y-6"
        onSubmit={(event) => {
          event.preventDefault();
          form.put(route('admin.coach.settings.update'));
        }}
      >
        <Card className="space-y-5 p-6">
          <div className="flex items-center justify-between">
            <div>
              <Label>Activer le Coach</Label>
              <p className="text-sm text-muted-foreground">Contrôle l'accès client au service.</p>
            </div>
            <Switch
              checked={form.data.enabled}
              onCheckedChange={(value) => form.setData('enabled', value)}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {moduleLabels.map(([key, label]) => (
              <div className="flex items-center justify-between rounded border p-3" key={key}>
                <Label>{label}</Label>
                <Switch
                  checked={Boolean(form.data[key])}
                  onCheckedChange={(value) => form.setData(key, value)}
                />
              </div>
            ))}
          </div>
        </Card>

        <Card className="grid gap-5 p-6 md:grid-cols-2">
          <div>
            <Label>Provider IA</Label>
            <Input value="fake" disabled />
          </div>
          <div>
            <Label>Langue par défaut</Label>
            <select
              className="mt-2 w-full rounded-md border bg-background p-2"
              value={form.data.default_language}
              onChange={(e) => form.setData('default_language', e.target.value)}
            >
              {form.data.languages.map((language) => (
                <option value={language} key={language}>
                  {language.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Langues disponibles</Label>
            {['fr', 'de', 'en'].map((language) => (
              <label className="mr-4 inline-flex items-center gap-2" key={language}>
                <input
                  type="checkbox"
                  checked={form.data.languages.includes(language)}
                  onChange={(e) => toggleLanguage(language, e.target.checked)}
                />
                {language.toUpperCase()}
              </label>
            ))}
          </div>
          <div>
            <Label>Quota mensuel</Label>
            <Input
              type="number"
              min={1}
              value={form.data.monthly_message_limit}
              onChange={(e) => form.setData('monthly_message_limit', Number(e.target.value))}
            />
          </div>
          <div>
            <Label>Rate limit par minute</Label>
            <Input
              type="number"
              min={1}
              value={form.data.rate_limit_per_minute}
              onChange={(e) => form.setData('rate_limit_per_minute', Number(e.target.value))}
            />
          </div>
          <div>
            <Label>Questions par simulation</Label>
            <Input
              type="number"
              min={3}
              max={10}
              value={form.data.interview_question_limit}
              onChange={(e) => form.setData('interview_question_limit', Number(e.target.value))}
            />
          </div>
          <div className="md:col-span-2">
            <Label>Paramètres généraux</Label>
            <Textarea
              value={form.data.general_instructions}
              onChange={(e) => form.setData('general_instructions', e.target.value)}
            />
          </div>
        </Card>
        <Button disabled={form.processing}>Enregistrer la configuration</Button>
      </form>
    </div>
  );
}
