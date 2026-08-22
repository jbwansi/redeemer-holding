import { Head, Link, useForm } from '@inertiajs/react';
import { CalendarDays, CheckCircle2, Download, FileJson, XCircle } from 'lucide-react';
import { useState } from 'react';
import { route } from 'ziggy-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Analysis {
  valid: boolean;
  filename: string;
  status: 'new' | 'existing' | 'invalid' | 'ambiguous';
  category: { name: string; slug: string } | null;
  changes: Array<{
    field: string;
    label: string;
    action: 'UPDATE' | 'UNCHANGED';
    before: unknown;
    after: unknown;
  }>;
  errors: string[];
  warnings: string[];
  plan: {
    event: { action: 'CREATE' | 'UPDATE' | 'UNCHANGED' | 'AMBIGUOUS' } | null;
    category: { action: 'UNCHANGED' | 'AMBIGUOUS'; slug: string } | null;
    summary: { preserved: number; deleted: 0 };
  };
  package?: {
    valid?: boolean;
    event_json_present?: boolean;
    manifest_present?: boolean;
    media_included?: number;
    media_missing?: number;
    integrity?: string;
  } | null;
}

interface EventOption {
  id: number;
  title: string;
  slug: string;
}

interface ImportResult {
  event: { id: number; title: string; slug: string };
  category: { id: number; name: string; slug: string };
  preserved: number;
  deleted: 0;
  warnings: string[];
  package_media?: { copied: number; reused: number; missing: number };
}

interface UpdateResult extends ImportResult {
  modified: { event_fields: number };
  modified_fields: string[];
}

const displayValue = (value: unknown) => {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Oui' : 'Non';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

export default function EventImportExport({
  events,
  analysis,
  importResult,
  updateResult,
}: {
  events: EventOption[];
  analysis?: Analysis | null;
  importResult?: ImportResult | null;
  updateResult?: UpdateResult | null;
}) {
  const form = useForm<{ file: File | null }>({ file: null });
  const [eventId, setEventId] = useState('');
  const [fileInputKey, setFileInputKey] = useState(0);
  const [showResults, setShowResults] = useState(true);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [updateConfirmationOpen, setUpdateConfirmationOpen] = useState(false);
  const analyze = (event: React.FormEvent) => {
    event.preventDefault();
    setShowResults(true);
    form.post(route('events.import-export.analyze'), {
      forceFormData: true,
      preserveState: true,
      preserveScroll: true,
    });
  };
  const exportEvent = () => {
    if (eventId) window.location.href = route('events.export-json', { event: eventId });
  };
  const exportPackage = () => {
    if (eventId) window.location.href = route('events.export-package', { event: eventId });
  };
  const clearSelectedFile = () => {
    form.reset('file');
    form.clearErrors();
    setFileInputKey((key) => key + 1);
  };
  const createEvent = () => {
    setConfirmationOpen(false);
    form.post(route('events.import-export.create'), {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: clearSelectedFile,
    });
  };
  const updateEvent = () => {
    setUpdateConfirmationOpen(false);
    form.post(route('events.import-export.update'), {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: clearSelectedFile,
    });
  };

  return (
    <div className="space-y-8 p-4 md:p-8">
      <Head title="Import / Export des événements" />
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Import / Export des événements
        </h1>
        <p className="mt-2 text-muted-foreground">
          Exportez vos événements au format JSON afin de pouvoir les transférer et les tester entre
          vos différents environnements.
        </p>
      </div>

      <Card className="max-w-2xl border-slate-200/80 bg-white/95 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/70">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Exporter un événement</CardTitle>
              <CardDescription>Téléchargez sa définition métier portable.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="event">Événement</Label>
            <Select value={eventId} onValueChange={setEventId}>
              <SelectTrigger id="event">
                <SelectValue placeholder="Sélectionner un événement" />
              </SelectTrigger>
              <SelectContent>
                {events.map((event) => (
                  <SelectItem key={event.id} value={String(event.id)}>
                    {event.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button type="button" disabled={!eventId} onClick={exportEvent}>
              <Download className="mr-2 h-4 w-4" />
              Exporter en JSON
            </Button>
            <Button type="button" variant="outline" disabled={!eventId} onClick={exportPackage}>
              <Download className="mr-2 h-4 w-4" />
              Exporter avec médias (ZIP)
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="max-w-2xl border-slate-200/80 bg-white/95 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/70">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <FileJson className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Importer un événement</CardTitle>
              <CardDescription>
                Analysez un export JSON ou un package ZIP sans enregistrer aucune donnée.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={analyze} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="json-file">Fichier JSON ou package ZIP</Label>
              <input
                key={fileInputKey}
                id="json-file"
                type="file"
                accept=".json,.zip,application/json,application/zip"
                onChange={(event) => form.setData('file', event.target.files?.[0] ?? null)}
                className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-1 file:text-primary"
              />
              {form.errors.file && (
                <p className="mt-1 text-sm text-destructive">{form.errors.file}</p>
              )}
            </div>
            <Button type="submit" disabled={!form.data.file || form.processing}>
              <FileJson className="mr-2 h-4 w-4" />
              {form.processing ? 'Analyse en cours...' : 'Analyser le fichier'}
            </Button>
          </form>
        </CardContent>
      </Card>
      {showResults && analysis && (
        <Card className="max-w-4xl border-slate-200/80 bg-white/95 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/70">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {analysis.valid ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              ) : (
                <XCircle className="h-6 w-6 text-destructive" />
              )}
              Rapport d’analyse
            </CardTitle>
            <CardDescription>
              {analysis.filename} — statut : {analysis.status}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {analysis.plan?.event && (
              <div className="grid gap-3 sm:grid-cols-4">
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Event</p>
                  <p className="font-semibold">{analysis.plan.event.action}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Catégorie</p>
                  <p className="font-semibold">{analysis.plan.category?.action ?? '—'}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Conservé</p>
                  <p className="font-semibold">{analysis.plan.summary.preserved}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">DELETE</p>
                  <p className="font-semibold">0</p>
                </div>
              </div>
            )}
            {analysis.category && (
              <p className="text-sm">
                Catégorie résolue : <strong>{analysis.category.name}</strong> (
                {analysis.category.slug})
              </p>
            )}
            {analysis.package && (
              <div className="rounded-lg border bg-muted/20 p-4 text-sm">
                <h3 className="mb-2 font-semibold">Package ZIP</h3>
                <p>event.json : {analysis.package.event_json_present ? 'présent' : 'absent'}</p>
                <p>manifest.json : {analysis.package.manifest_present ? 'présent' : 'absent'}</p>
                <p>Médias inclus : {analysis.package.media_included ?? 0}</p>
                <p>Médias manquants : {analysis.package.media_missing ?? 0}</p>
                <p>Intégrité : {analysis.package.integrity === 'ok' ? 'vérifiée' : 'invalide'}</p>
              </div>
            )}
            {analysis.changes?.length > 0 && (
              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="p-2 text-left">Champ</th>
                      <th className="p-2 text-left">Action</th>
                      <th className="p-2 text-left">Actuel</th>
                      <th className="p-2 text-left">JSON</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysis.changes.map((change) => (
                      <tr key={change.field} className="border-b last:border-0">
                        <td className="p-2">{change.label}</td>
                        <td className="p-2 font-medium">{change.action}</td>
                        <td className="max-w-64 truncate p-2">{displayValue(change.before)}</td>
                        <td className="max-w-64 truncate p-2">{displayValue(change.after)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {analysis.errors?.length > 0 && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-destructive">
                <ul className="list-disc pl-5">
                  {analysis.errors.map((error) => (
                    <li key={error}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
            {analysis.warnings?.length > 0 && (
              <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-900">
                <ul className="list-disc pl-5">
                  {analysis.warnings.map((warning) => (
                    <li key={warning}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}
            {analysis.valid && analysis.status === 'new' && (
              <div className="flex justify-end border-t pt-4">
                <Button
                  type="button"
                  onClick={() => setConfirmationOpen(true)}
                  disabled={!form.data.file || form.processing}
                >
                  Créer l’événement
                </Button>
              </div>
            )}
            {analysis.valid &&
              analysis.status === 'existing' &&
              analysis.plan.event?.action === 'UPDATE' && (
                <div className="flex justify-end border-t pt-4">
                  <Button
                    type="button"
                    onClick={() => setUpdateConfirmationOpen(true)}
                    disabled={!form.data.file || form.processing}
                  >
                    Appliquer les modifications
                  </Button>
                </div>
              )}
            <p className="text-sm font-medium">
              Toute création déclenche une revalidation backend complète.
            </p>
          </CardContent>
        </Card>
      )}
      {importResult && (
        <Card className="max-w-4xl border-emerald-300 bg-emerald-50/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              Événement créé avec succès
            </CardTitle>
            <CardDescription>
              {importResult.event.title} — catégorie {importResult.category.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border bg-background p-3">
                <p className="text-xs text-muted-foreground">Créés</p>
                <p className="text-xl font-semibold">1</p>
              </div>
              <div className="rounded-lg border bg-background p-3">
                <p className="text-xs text-muted-foreground">Conservés</p>
                <p className="text-xl font-semibold">{importResult.preserved}</p>
              </div>
              <div className="rounded-lg border bg-background p-3">
                <p className="text-xs text-muted-foreground">Supprimés</p>
                <p className="text-xl font-semibold">0</p>
              </div>
            </div>
            {importResult.warnings.length > 0 && (
              <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-900">
                <ul className="list-disc pl-5">
                  {importResult.warnings.map((warning) => (
                    <li key={warning}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}
            {importResult.package_media && (
              <p className="text-sm">
                Médias — copiés : {importResult.package_media.copied}, réutilisés :{' '}
                {importResult.package_media.reused}, manquants :{' '}
                {importResult.package_media.missing}
              </p>
            )}
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href={route('events.show', importResult.event.slug)}>Voir l’événement</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href={route('events.edit', importResult.event.id)}>Modifier</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href={route('events.import-export')}>Retour Import / Export</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      {updateResult && (
        <Card className="max-w-4xl border-emerald-300 bg-emerald-50/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              Événement mis à jour
            </CardTitle>
            <CardDescription>
              {updateResult.event.title} — catégorie {updateResult.category.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border bg-background p-3">
                <p className="text-xs text-muted-foreground">Champs modifiés</p>
                <p className="text-xl font-semibold">{updateResult.modified.event_fields}</p>
              </div>
              <div className="rounded-lg border bg-background p-3">
                <p className="text-xs text-muted-foreground">Données préservées</p>
                <p className="text-xl font-semibold">{updateResult.preserved}</p>
              </div>
              <div className="rounded-lg border bg-background p-3">
                <p className="text-xs text-muted-foreground">Supprimés</p>
                <p className="text-xl font-semibold">0</p>
              </div>
            </div>
            {updateResult.modified_fields.length > 0 && (
              <p className="text-sm">Modifiés : {updateResult.modified_fields.join(', ')}</p>
            )}
            {updateResult.warnings.length > 0 && (
              <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-900">
                <ul className="list-disc pl-5">
                  {updateResult.warnings.map((warning) => (
                    <li key={warning}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}
            {updateResult.package_media && (
              <p className="text-sm">
                Médias — copiés : {updateResult.package_media.copied}, réutilisés :{' '}
                {updateResult.package_media.reused}, manquants :{' '}
                {updateResult.package_media.missing}
              </p>
            )}
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href={route('events.show', updateResult.event.slug)}>Voir l’événement</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href={route('events.edit', updateResult.event.id)}>Modifier</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href={route('events.import-export')}>Retour Import / Export</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      <AlertDialog open={confirmationOpen} onOpenChange={setConfirmationOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Créer cet événement ?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <p>
                  Catégorie : <strong>{analysis?.category?.name ?? '—'}</strong>
                </p>
                <p>Le fichier sera entièrement revalidé côté serveur.</p>
                <p>
                  Avec un JSON, la référence featured_image est seule conservée. Avec un ZIP, le
                  média déclaré et vérifié sera copié ou réutilisé sans écrasement.
                </p>
                <p>Aucune inscription ni donnée transactionnelle ne sera importée. DELETE = 0.</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={createEvent}>Confirmer la création</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={updateConfirmationOpen} onOpenChange={setUpdateConfirmationOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Appliquer ces modifications ?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <p>
                  Champs modifiés :{' '}
                  {analysis?.changes.filter((change) => change.action === 'UPDATE').length ?? 0}
                </p>
                <p>
                  Participants, paiements, billets, check-in et autres données transactionnelles
                  seront conservés.
                </p>
                <p>
                  Avec un JSON, aucun fichier physique ne change. Avec un ZIP, le média déclaré et
                  vérifié sera copié ou réutilisé sans écrasement ni suppression.
                </p>
                <p>Suppressions : 0.</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={updateEvent}>Confirmer la mise à jour</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
