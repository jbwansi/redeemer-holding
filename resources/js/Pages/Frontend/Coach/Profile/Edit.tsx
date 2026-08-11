import { Head, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import DashboardLayout from '@/components/frontend/layouts/dashboard-layout';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { NativeSelect } from '@/components/ui/native-select';
interface Profile {
  professional_title?: string;
  summary?: string;
  career_objective?: string;
  default_language?: string;
  target_roles?: string[];
  target_sectors?: string[];
  languages?: string[];
}
export default function Edit({ profile }: { profile: Profile | null }) {
  const form = useForm({
    professional_title: profile?.professional_title ?? '',
    summary: profile?.summary ?? '',
    career_objective: profile?.career_objective ?? '',
    default_language: profile?.default_language ?? 'fr',
    target_roles: profile?.target_roles ?? [],
    target_sectors: profile?.target_sectors ?? [],
    languages: profile?.languages ?? [],
  });
  return (
    <DashboardLayout title="Profil professionnel" currentPage="coach">
      <Head title="Profil professionnel" />
      <form
        className="mx-auto max-w-3xl space-y-4 p-6"
        onSubmit={(e) => {
          e.preventDefault();
          form.put(route('coach.profile.update'));
        }}
      >
        <h1 className="text-3xl font-bold">Profil professionnel</h1>
        <Input
          value={form.data.professional_title}
          placeholder="Titre professionnel"
          onChange={(e) => form.setData('professional_title', e.target.value)}
        />
        <Textarea
          value={form.data.summary}
          placeholder="Résumé"
          onChange={(e) => form.setData('summary', e.target.value)}
        />
        <Input
          value={form.data.target_roles.join(', ')}
          placeholder="Métiers ciblés (séparés par des virgules)"
          onChange={(e) =>
            form.setData(
              'target_roles',
              e.target.value
                .split(',')
                .map((value) => value.trim())
                .filter(Boolean)
            )
          }
        />
        <Input
          value={form.data.target_sectors.join(', ')}
          placeholder="Secteurs ciblés (séparés par des virgules)"
          onChange={(e) =>
            form.setData(
              'target_sectors',
              e.target.value
                .split(',')
                .map((value) => value.trim())
                .filter(Boolean)
            )
          }
        />
        <Input
          value={form.data.languages.join(', ')}
          placeholder="Langues (fr, de, en)"
          onChange={(e) =>
            form.setData(
              'languages',
              e.target.value
                .split(',')
                .map((value) => value.trim())
                .filter(Boolean)
            )
          }
        />
        <Textarea
          value={form.data.career_objective}
          placeholder="Objectif professionnel"
          onChange={(e) => form.setData('career_objective', e.target.value)}
        />
        <NativeSelect
          className="rounded border p-2"
          value={form.data.default_language}
          onChange={(e) => form.setData('default_language', e.target.value)}
        >
          <option value="fr">Français</option>
          <option value="de">Deutsch</option>
          <option value="en">English</option>
        </NativeSelect>
        <Button disabled={form.processing}>Enregistrer</Button>
      </form>
    </DashboardLayout>
  );
}
