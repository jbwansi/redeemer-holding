import { Head, Link, useForm } from '@inertiajs/react';
import { CheckCircle2, Download, FileJson, Package, XCircle } from 'lucide-react';
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

type Action = 'CREATE' | 'UPDATE' | 'UNCHANGED' | 'PRESERVE' | 'AMBIGUOUS';

interface Analysis {
  valid: boolean;
  filename: string;
  schema_version: string | null;
  type: string | null;
  status: 'new' | 'existing' | 'invalid' | 'ambiguous';
  service: { name: string | null; slug: string | null };
  changes: Array<{ field: string; label: string; action: Action; before: unknown; after: unknown }>;
  errors: string[];
  warnings: string[];
  plan: {
    can_apply: boolean;
    service: { action: Action; slug: string } | null;
    summary: {
      creates: number;
      updates: number;
      unchanged: number;
      preserved: number;
      ambiguous: number;
      deleted: 0;
    };
  };
  package?: {
    valid?: boolean;
    service_json_present?: boolean;
    manifest_present?: boolean;
    media_included?: number;
    media_missing?: number;
    integrity?: string;
  } | null;
}

interface ServiceOption {
  id: number;
  name: string;
  slug: string;
}

interface ImportResult {
  service: ServiceOption;
  created?: number;
  preserved: number;
  deleted: 0;
  warnings: string[];
  modified?: { service_fields: number };
  modified_fields?: string[];
  package_media?: { copied: number; reused: number; missing: number };
}

const displayValue = (value: unknown) => {
  if (value === null) return 'null';
  if (value === undefined) return '—';
  if (typeof value === 'boolean') return value ? 'Oui' : 'Non';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

export default function ServiceImportExport({
  services,
  analysis,
  importResult,
  updateResult,
}: {
  services: ServiceOption[];
  analysis?: Analysis | null;
  importResult?: ImportResult | null;
  updateResult?: ImportResult | null;
}) {
  const form = useForm<{ file: File | null }>({ file: null });
  const [serviceId, setServiceId] = useState('');
  const [fileInputKey, setFileInputKey] = useState(0);
  const [createConfirmation, setCreateConfirmation] = useState(false);
  const [updateConfirmation, setUpdateConfirmation] = useState(false);

  const clearFile = () => {
    form.reset('file');
    form.clearErrors();
    setFileInputKey((value) => value + 1);
  };

  const submit = (routeName: string, onSuccess?: () => void) =>
    form.post(route(routeName), {
      forceFormData: true,
      preserveScroll: true,
      preserveState: true,
      onSuccess,
    });

  const result = updateResult ?? importResult;

  return (
    <div className="space-y-8 p-4 md:p-8">
      <Head title="Import / Export des services" />
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Import / Export des services
        </h1>
        <p className="mt-2 text-muted-foreground">
          Analysez chaque fichier avant toute création ou mise à jour. Aucun élément local n’est
          supprimé.
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Exporter un service
          </CardTitle>
          <CardDescription>
            Téléchargez le contenu seul ou un package contenant son image principale.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Label htmlFor="service">Service</Label>
          <Select value={serviceId} onValueChange={setServiceId}>
            <SelectTrigger id="service">
              <SelectValue placeholder="Sélectionner un service" />
            </SelectTrigger>
            <SelectContent>
              {services.map((service) => (
                <SelectItem key={service.id} value={String(service.id)}>
                  {service.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex flex-wrap gap-3">
            <Button
              disabled={!serviceId}
              onClick={() => {
                window.location.href = route('services.export-json', { service: serviceId });
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              Exporter en JSON
            </Button>
            <Button
              variant="outline"
              disabled={!serviceId}
              onClick={() => {
                window.location.href = route('services.export-package', { service: serviceId });
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              Exporter avec l’image (ZIP)
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileJson className="h-5 w-5" />
            Importer un service
          </CardTitle>
          <CardDescription>
            L’analyse du JSON ou du ZIP est strictement sans écriture.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              submit('services.import-export.analyze');
            }}
          >
            <Label htmlFor="service-file">Fichier JSON ou ZIP</Label>
            <input
              key={fileInputKey}
              id="service-file"
              type="file"
              accept=".json,.zip,application/json,application/zip"
              onChange={(event) => form.setData('file', event.target.files?.[0] ?? null)}
              className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            {form.errors.file && <p className="text-sm text-destructive">{form.errors.file}</p>}
            <Button type="submit" disabled={!form.data.file || form.processing}>
              {form.processing ? 'Analyse en cours…' : 'Analyser le fichier'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {analysis && (
        <Card className="max-w-5xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {analysis.valid ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              ) : (
                <XCircle className="h-5 w-5 text-destructive" />
              )}
              Rapport d’analyse
            </CardTitle>
            <CardDescription>
              {analysis.filename} — {analysis.service?.slug ?? 'cible inconnue'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-5">
              <Summary label="Type" value={analysis.type ?? '—'} />
              <Summary label="Version" value={analysis.schema_version ?? '—'} />
              <Summary label="Action" value={analysis.plan?.service?.action ?? analysis.status} />
              <Summary label="PRESERVE" value={analysis.plan?.summary?.preserved ?? 0} />
              <Summary label="DELETE" value={0} />
            </div>

            {analysis.package && (
              <div className="rounded-lg border bg-muted/20 p-4 text-sm">
                <p>service.json : {analysis.package.service_json_present ? 'présent' : 'absent'}</p>
                <p>manifest.json : {analysis.package.manifest_present ? 'présent' : 'absent'}</p>
                <p>Médias inclus : {analysis.package.media_included ?? 0}</p>
                <p>Médias manquants : {analysis.package.media_missing ?? 0}</p>
                <p>Intégrité : {analysis.package.integrity ?? 'inconnue'}</p>
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
                      <th className="p-2 text-left">Import</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysis.changes.map((change) => (
                      <tr key={change.field} className="border-b last:border-0">
                        <td className="p-2">{change.label}</td>
                        <td className="p-2 font-medium">{change.action}</td>
                        <td className="max-w-72 truncate p-2">{displayValue(change.before)}</td>
                        <td className="max-w-72 truncate p-2">{displayValue(change.after)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {analysis.errors?.length > 0 && <Messages items={analysis.errors} error />}
            {analysis.warnings?.length > 0 && <Messages items={analysis.warnings} />}

            {analysis.valid && analysis.plan.can_apply && analysis.status === 'new' && (
              <Button
                onClick={() => setCreateConfirmation(true)}
                disabled={!form.data.file || form.processing}
              >
                Créer le service
              </Button>
            )}
            {analysis.valid &&
              analysis.plan.can_apply &&
              analysis.status === 'existing' &&
              analysis.plan.service?.action === 'UPDATE' && (
                <Button
                  onClick={() => setUpdateConfirmation(true)}
                  disabled={!form.data.file || form.processing}
                >
                  Appliquer les modifications
                </Button>
              )}
            <p className="text-sm font-medium">
              Toute confirmation relance une validation backend complète.
            </p>
          </CardContent>
        </Card>
      )}

      {result && (
        <Card className="max-w-4xl border-emerald-300 bg-emerald-50/60">
          <CardHeader>
            <CardTitle>Service {updateResult ? 'mis à jour' : 'créé'} avec succès</CardTitle>
            <CardDescription>{result.service.name}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <Summary
                label={updateResult ? 'Champs modifiés' : 'Créés'}
                value={updateResult ? (result.modified?.service_fields ?? 0) : 1}
              />
              <Summary label="Préservés" value={result.preserved} />
              <Summary label="Supprimés" value={0} />
            </div>
            {result.warnings?.length > 0 && <Messages items={result.warnings} />}
            {result.package_media && (
              <p className="text-sm">
                Médias — copiés : {result.package_media.copied}, réutilisés :{' '}
                {result.package_media.reused}, manquants : {result.package_media.missing}
              </p>
            )}
            <div className="flex gap-3">
              <Button asChild>
                <Link href={route('services.show', result.service.id)}>Voir</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href={route('services.index')}>Retour aux services</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <AlertDialog open={createConfirmation} onOpenChange={setCreateConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Créer ce service ?</AlertDialogTitle>
            <AlertDialogDescription>
              Le fichier sera revalidé. Aucun autre contenu ne sera supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setCreateConfirmation(false);
                submit('services.import-export.create', clearFile);
              }}
            >
              Confirmer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={updateConfirmation} onOpenChange={setUpdateConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mettre à jour ce service ?</AlertDialogTitle>
            <AlertDialogDescription>
              Seuls les champs affichés UPDATE seront appliqués. Les champs absents resteront
              inchangés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setUpdateConfirmation(false);
                submit('services.import-export.update', clearFile);
              }}
            >
              Confirmer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border bg-background p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}

function Messages({ items, error = false }: { items: string[]; error?: boolean }) {
  return (
    <div
      className={`rounded-lg border p-4 ${error ? 'border-destructive/40 bg-destructive/5 text-destructive' : 'border-amber-300 bg-amber-50 text-amber-900'}`}
    >
      <ul className="list-disc pl-5">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
