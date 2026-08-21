import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileJson,
  GraduationCap,
  XCircle,
} from 'lucide-react';
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

interface TrainingOption {
  id: number;
  title: string;
  slug: string;
}

type PlanAction = 'CREATE' | 'UPDATE' | 'UNCHANGED' | 'PRESERVE' | 'AMBIGUOUS';

interface PlanChange {
  field: string;
  action: 'UPDATE';
  before: unknown;
  after: unknown;
}

interface PlanNode {
  action: PlanAction;
  label: string;
  changes?: PlanChange[];
  reason?: string;
  lessons?: PlanNode[];
  resources?: PlanNode[];
  quiz?: PlanNode | null;
  questions?: PlanNode[];
}

interface UpdatePlan {
  mode: 'update_plan';
  training: { slug: string; action: 'UPDATE' | 'UNCHANGED'; changes: PlanChange[] };
  content: { sections: PlanNode[] };
  summary: {
    creates: number;
    updates: number;
    unchanged: number;
    preserved: number;
    ambiguous: number;
  };
  can_apply: boolean;
  read_only: true;
}

interface Analysis {
  valid: boolean;
  filename?: string | null;
  schema_version?: string | null;
  type?: string | null;
  status?: 'new' | 'existing' | 'invalid';
  training?: { title?: string | null; slug?: string | null } | null;
  summary?: Partial<
    Record<
      | 'changes'
      | 'sections'
      | 'lessons'
      | 'resources'
      | 'quizzes'
      | 'questions'
      | 'media_references',
      number
    >
  > | null;
  changes?: Array<{
    field: string;
    label: string;
    status: 'unchanged' | 'modified';
    before: unknown;
    after: unknown;
  }> | null;
  relation_changes?: Record<
    string,
    { added?: number; modified?: number; unchanged?: number; ambiguous?: number }
  > | null;
  warnings?: string[] | null;
  errors?: string[] | null;
  update_plan?: UpdatePlan | null;
  package?: {
    valid?: boolean;
    training_json_present?: boolean;
    manifest_present?: boolean;
    media_included?: number;
    media_missing?: number;
    integrity?: string;
    conflicts?: string[];
  } | null;
}

interface PackageMediaResult {
  copied: number;
  reused: number;
  missing: number;
}

interface ImportResult {
  training: { id: number; title: string; slug: string };
  created: Record<string, number>;
  warnings: string[];
  package_media?: PackageMediaResult;
}

interface UpdateResult {
  training: { id: number; title: string; slug: string };
  modified: Record<string, number>;
  created: Record<string, number>;
  preserved: number;
  deleted: 0;
  package_media?: PackageMediaResult;
}

const displayValue = (value: unknown) => {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Oui' : 'Non';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

const normalizeAnalysis = (analysis?: Analysis) => {
  if (!analysis) return null;

  return {
    ...analysis,
    filename: String(analysis.filename ?? ''),
    schema_version: analysis.schema_version ?? null,
    type: analysis.type ?? null,
    status: analysis.status ?? 'invalid',
    training: {
      title: analysis.training?.title ?? null,
      slug: analysis.training?.slug ?? null,
    },
    summary: {
      changes: Number(analysis.summary?.changes ?? 0),
      sections: Number(analysis.summary?.sections ?? 0),
      lessons: Number(analysis.summary?.lessons ?? 0),
      resources: Number(analysis.summary?.resources ?? 0),
      quizzes: Number(analysis.summary?.quizzes ?? 0),
      questions: Number(analysis.summary?.questions ?? 0),
      media_references: Number(analysis.summary?.media_references ?? 0),
    },
    changes: Array.isArray(analysis.changes) ? analysis.changes : [],
    relation_changes: analysis.relation_changes ?? {},
    warnings: Array.isArray(analysis.warnings) ? analysis.warnings : [],
    errors: Array.isArray(analysis.errors) ? analysis.errors : [],
    update_plan: analysis.update_plan ?? null,
    package: analysis.package
      ? {
          valid: Boolean(analysis.package.valid),
          training_json_present: Boolean(analysis.package.training_json_present),
          manifest_present: Boolean(analysis.package.manifest_present),
          media_included: Number(analysis.package.media_included ?? 0),
          media_missing: Number(analysis.package.media_missing ?? 0),
          integrity: String(analysis.package.integrity ?? 'invalid'),
          conflicts: Array.isArray(analysis.package.conflicts) ? analysis.package.conflicts : [],
        }
      : null,
  };
};

const collectPlanNodes = (plan: UpdatePlan) => {
  const nodes: PlanNode[] = [
    {
      action: plan.training.action,
      label: `Formation : ${plan.training.slug}`,
      changes: plan.training.changes,
    },
  ];
  const visit = (node: PlanNode) => {
    nodes.push(node);
    node.lessons?.forEach(visit);
    node.resources?.forEach(visit);
    if (node.quiz) visit(node.quiz);
    node.questions?.forEach(visit);
  };
  plan.content.sections.forEach(visit);
  return nodes;
};

const planGroups: Array<{ action: PlanAction; label: string }> = [
  { action: 'UPDATE', label: 'À modifier' },
  { action: 'CREATE', label: 'À ajouter' },
  { action: 'UNCHANGED', label: 'Inchangés' },
  { action: 'PRESERVE', label: 'Conservés' },
  { action: 'AMBIGUOUS', label: 'Ambigus' },
];

const scopeLabels: Record<string, string> = {
  trainings: 'Formation',
  training_fields: 'Champs formation',
  sections: 'Sections',
  lessons: 'Leçons',
  resources: 'Ressources',
  quizzes: 'Quiz',
  questions: 'Questions',
};

export default function TrainingImportExport({
  trainings,
  analysis,
  importResult,
  updateResult,
}: {
  trainings: TrainingOption[];
  analysis?: Analysis;
  importResult?: ImportResult;
  updateResult?: UpdateResult;
}) {
  const [trainingId, setTrainingId] = useState('');
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [updateConfirmationOpen, setUpdateConfirmationOpen] = useState(false);
  const [showResults, setShowResults] = useState(true);
  const [fileInputKey, setFileInputKey] = useState(0);
  const form = useForm<{ file: File | null }>({ file: null });
  const safeAnalysis = normalizeAnalysis(analysis);

  const exportTraining = () => {
    if (trainingId) {
      window.location.href = route('trainings.export-json', { training: trainingId });
    }
  };

  const exportPackage = () => {
    if (trainingId) {
      window.location.href = route('trainings.export-package', { training: trainingId });
    }
  };

  const analyzeFile = (event: React.FormEvent) => {
    event.preventDefault();
    setShowResults(true);
    form.post(route('trainings.import-export.analyze'), {
      forceFormData: true,
      preserveState: true,
      preserveScroll: true,
      onSuccess: () => setShowResults(true),
      onError: () => setShowResults(true),
    });
  };

  const clearSelectedFile = () => {
    form.reset('file');
    form.clearErrors();
    setFileInputKey((key) => key + 1);
  };

  const createTraining = () => {
    setConfirmationOpen(false);
    form.post(route('trainings.import-export.create'), {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: clearSelectedFile,
    });
  };

  const updateTraining = () => {
    setUpdateConfirmationOpen(false);
    form.post(route('trainings.import-export.update'), {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: clearSelectedFile,
    });
  };

  const importAnotherFile = () => {
    clearSelectedFile();
    setConfirmationOpen(false);
    setUpdateConfirmationOpen(false);
    setShowResults(false);
  };

  return (
    <div className="space-y-8 p-4 md:p-8">
      <Head title="Import / Export des formations" />

      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Import / Export des formations
        </h1>
        <p className="mt-2 text-muted-foreground">
          Exportez vos formations au format JSON afin de pouvoir les transférer et les tester entre
          vos différents environnements.
        </p>
      </div>

      <Card className="max-w-2xl border-slate-200/80 bg-white/95 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/70">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Exporter une formation</CardTitle>
              <CardDescription>
                Téléchargez sa définition métier et pédagogique complète.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="training">Formation</Label>
            <Select value={trainingId} onValueChange={setTrainingId}>
              <SelectTrigger id="training">
                <SelectValue placeholder="Sélectionner une formation" />
              </SelectTrigger>
              <SelectContent>
                {trainings.map((training) => (
                  <SelectItem key={training.id} value={String(training.id)}>
                    {training.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button type="button" disabled={!trainingId} onClick={exportTraining}>
              <Download className="mr-2 h-4 w-4" />
              Exporter en JSON
            </Button>
            <Button type="button" variant="outline" disabled={!trainingId} onClick={exportPackage}>
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
              <CardTitle>Importer une formation</CardTitle>
              <CardDescription>
                Analysez un export JSON ou un package ZIP sans enregistrer aucune donnée.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={analyzeFile}>
            <div className="space-y-2">
              <Label htmlFor="json-file">Fichier JSON ou package ZIP</Label>
              <input
                key={fileInputKey}
                id="json-file"
                type="file"
                accept=".json,.zip,application/json,application/zip"
                className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-1 file:text-primary"
                onChange={(event) => form.setData('file', event.target.files?.[0] ?? null)}
              />
              {form.errors.file && <p className="text-sm text-destructive">{form.errors.file}</p>}
            </div>
            <Button type="submit" disabled={!form.data.file || form.processing}>
              <FileJson className="mr-2 h-4 w-4" />
              {form.processing ? 'Analyse en cours...' : 'Analyser le fichier'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {showResults && safeAnalysis && (
        <Card className="max-w-4xl border-slate-200/80 bg-white/95 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/70">
          <CardHeader>
            <div className="flex items-start gap-3">
              {safeAnalysis.valid ? (
                <CheckCircle2 className="mt-0.5 h-6 w-6 text-emerald-600" />
              ) : (
                <XCircle className="mt-0.5 h-6 w-6 text-destructive" />
              )}
              <div>
                <CardTitle>
                  {safeAnalysis.valid ? 'Analyse terminée' : 'Analyse impossible'}
                </CardTitle>
                <CardDescription>{safeAnalysis.filename || 'Fichier JSON'}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-7">
            <dl className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <dt className="text-muted-foreground">Schéma</dt>
                <dd className="font-medium">
                  {String(safeAnalysis.schema_version ?? '—')}{' '}
                  {safeAnalysis.schema_version === '1.0' && '✓'}
                </dd>
                {safeAnalysis.schema_version === '1.0' && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Format JSON 1.0 — mode de compatibilité
                  </p>
                )}
                {safeAnalysis.schema_version === '1.1' && (
                  <p className="mt-1 text-xs text-muted-foreground">Format JSON 1.1</p>
                )}
              </div>
              <div>
                <dt className="text-muted-foreground">Type</dt>
                <dd className="font-medium">
                  {String(safeAnalysis.type ?? '—')} {safeAnalysis.type === 'training' && '✓'}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Statut</dt>
                <dd className="font-medium">
                  {safeAnalysis.status === 'new'
                    ? 'Nouvelle formation'
                    : safeAnalysis.status === 'existing'
                      ? 'Formation existante'
                      : 'Fichier invalide'}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Formation</dt>
                <dd className="font-medium">{safeAnalysis.training.title ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Slug</dt>
                <dd className="font-medium">{safeAnalysis.training.slug ?? '—'}</dd>
              </div>
            </dl>

            {safeAnalysis.valid && (
              <div>
                <h3 className="mb-3 font-semibold">Résumé</h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    ['Changements', safeAnalysis.summary.changes],
                    ['Sections', safeAnalysis.summary.sections],
                    ['Leçons', safeAnalysis.summary.lessons],
                    ['Ressources', safeAnalysis.summary.resources],
                    ['Quiz', safeAnalysis.summary.quizzes],
                    ['Questions', safeAnalysis.summary.questions],
                    ['Erreurs', safeAnalysis.errors.length],
                    ['Avertissements', safeAnalysis.warnings.length],
                  ].map(([label, value]) => (
                    <div key={String(label)} className="rounded-lg border bg-muted/30 p-3">
                      <p className="text-xs text-muted-foreground">{String(label ?? '')}</p>
                      <p className="text-xl font-semibold">{String(value ?? 0)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {safeAnalysis.package && (
              <div className="rounded-lg border p-4 text-sm">
                <h3 className="mb-3 font-semibold">Package ZIP</h3>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  <p>
                    training.json :{' '}
                    {safeAnalysis.package.training_json_present ? 'présent' : 'absent'}
                  </p>
                  <p>
                    manifest.json : {safeAnalysis.package.manifest_present ? 'présent' : 'absent'}
                  </p>
                  <p>Médias inclus : {safeAnalysis.package.media_included}</p>
                  <p>Médias manquants : {safeAnalysis.package.media_missing}</p>
                </div>
                <p className="mt-2">
                  Intégrité : {safeAnalysis.package.integrity === 'ok' ? 'vérifiée' : 'invalide'}
                </p>
              </div>
            )}

            {safeAnalysis.valid && !safeAnalysis.package && (
              <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
                <p className="font-medium">
                  Le fichier JSON transporte les données et les références aux médias, mais pas les
                  fichiers physiques eux-mêmes.
                </p>
                <p className="mt-1">
                  Références médias détectées : {safeAnalysis.summary.media_references}
                </p>
              </div>
            )}

            {safeAnalysis.changes.some((change) => change.status === 'modified') && (
              <div>
                <h3 className="mb-3 font-semibold">Champs modifiés</h3>
                <div className="divide-y rounded-lg border">
                  {safeAnalysis.changes
                    .filter((change) => change.status === 'modified')
                    .map((change) => (
                      <div
                        key={change.field}
                        className="grid gap-1 p-3 text-sm sm:grid-cols-[180px_1fr]"
                      >
                        <span className="font-medium">{change.label}</span>
                        <span>
                          <span className="text-muted-foreground">
                            {displayValue(change.before)}
                          </span>{' '}
                          → {displayValue(change.after)}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {Object.keys(safeAnalysis.relation_changes).length > 0 && (
              <div>
                <h3 className="mb-3 font-semibold">Comparaison du contenu pédagogique</h3>
                <div className="overflow-x-auto rounded-lg border">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="p-3">Éléments</th>
                        <th className="p-3">Ajoutés</th>
                        <th className="p-3">Modifiés</th>
                        <th className="p-3">Inchangés</th>
                        <th className="p-3">Ambigus</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {Object.entries(safeAnalysis.relation_changes).map(([name, counts]) => (
                        <tr key={name}>
                          <td className="p-3 font-medium">{name}</td>
                          <td className="p-3">{String(counts?.added ?? 0)}</td>
                          <td className="p-3">{String(counts?.modified ?? 0)}</td>
                          <td className="p-3">{String(counts?.unchanged ?? 0)}</td>
                          <td className="p-3">{String(counts?.ambiguous ?? 0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {safeAnalysis.valid &&
              safeAnalysis.status === 'existing' &&
              safeAnalysis.update_plan && (
                <div className="space-y-5 rounded-lg border border-blue-300 bg-blue-50/50 p-4 dark:border-blue-900 dark:bg-blue-950/20">
                  <div>
                    <h3 className="font-semibold">
                      Mise à jour disponible — simulation uniquement
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Le fichier sera relu et le plan entièrement recalculé côté serveur avant toute
                      écriture.
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                    {[
                      ['À ajouter', safeAnalysis.update_plan.summary.creates],
                      ['À modifier', safeAnalysis.update_plan.summary.updates],
                      ['Inchangés', safeAnalysis.update_plan.summary.unchanged],
                      ['Conservés', safeAnalysis.update_plan.summary.preserved],
                      ['Ambigus', safeAnalysis.update_plan.summary.ambiguous],
                    ].map(([label, count]) => (
                      <div key={String(label)} className="rounded-md border bg-background p-3">
                        <p className="text-xs text-muted-foreground">{String(label)}</p>
                        <p className="text-lg font-semibold">{String(count)}</p>
                      </div>
                    ))}
                  </div>
                  {!safeAnalysis.update_plan.can_apply && (
                    <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
                      <p className="font-semibold">Import bloqué</p>
                      <p className="mt-1">
                        Certains éléments ne peuvent pas être identifiés avec suffisamment de
                        certitude. Aucune modification n’a été effectuée.
                      </p>
                    </div>
                  )}
                  <div className="grid gap-4 lg:grid-cols-2">
                    {planGroups.map((group) => {
                      const nodes = collectPlanNodes(safeAnalysis.update_plan!).filter(
                        (node) => node.action === group.action
                      );
                      if (nodes.length === 0) return null;
                      return (
                        <div key={group.action} className="rounded-lg border bg-background">
                          <h4 className="border-b px-4 py-3 font-medium">
                            {group.label} ({nodes.length})
                          </h4>
                          <div className="divide-y">
                            {nodes.map((node, index) => (
                              <div
                                key={`${group.action}-${node.label}-${index}`}
                                className="p-4 text-sm"
                              >
                                <p className="font-medium">{node.label}</p>
                                {node.reason && (
                                  <p className="mt-1 text-muted-foreground">{node.reason}</p>
                                )}
                                {node.changes?.map((change) => (
                                  <div key={change.field} className="mt-2 text-xs">
                                    <span className="font-medium">{change.field} :</span>{' '}
                                    <span className="text-muted-foreground">
                                      {displayValue(change.before)}
                                    </span>{' '}
                                    → {displayValue(change.after)}
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {safeAnalysis.update_plan.can_apply &&
                    safeAnalysis.update_plan.summary.ambiguous === 0 &&
                    (safeAnalysis.update_plan.summary.creates === 0 &&
                    safeAnalysis.update_plan.summary.updates === 0 ? (
                      <div className="rounded-md border border-emerald-300 bg-emerald-50 p-4 text-sm font-medium text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200">
                        Cette formation est déjà à jour.
                      </div>
                    ) : (
                      <div className="flex justify-end border-t pt-4">
                        <Button
                          type="button"
                          onClick={() => setUpdateConfirmationOpen(true)}
                          disabled={!form.data.file || form.processing}
                        >
                          Appliquer les modifications
                        </Button>
                      </div>
                    ))}
                </div>
              )}

            {safeAnalysis.warnings.length > 0 && (
              <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
                <h3 className="mb-2 flex items-center gap-2 font-semibold">
                  <AlertTriangle className="h-4 w-4" /> Avertissements
                </h3>
                <ul className="list-disc space-y-1 pl-5 text-sm">
                  {safeAnalysis.warnings.map((warning) => (
                    <li key={warning}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}
            {safeAnalysis.errors.length > 0 && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-destructive">
                <h3 className="mb-2 font-semibold">Erreurs bloquantes</h3>
                <ul className="list-disc space-y-1 pl-5 text-sm">
                  {safeAnalysis.errors.map((error) => (
                    <li key={error}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
            {safeAnalysis.valid && safeAnalysis.status === 'new' && (
              <div className="flex justify-end border-t pt-5">
                <Button
                  type="button"
                  onClick={() => setConfirmationOpen(true)}
                  disabled={!form.data.file || form.processing}
                >
                  Créer la formation
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {showResults && importResult && (
        <Card className="max-w-4xl border-emerald-300 bg-emerald-50/60 dark:border-emerald-900 dark:bg-emerald-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" /> Formation créée avec succès
            </CardTitle>
            <CardDescription>{importResult.training.title}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {Object.entries(importResult.created).map(([name, count]) => (
                <div key={name} className="rounded-lg border bg-background p-3">
                  <p className="text-xs text-muted-foreground">{scopeLabels[name] ?? name}</p>
                  <p className="text-xl font-semibold">{count}</p>
                </div>
              ))}
            </div>
            {importResult.package_media && (
              <p className="text-sm font-medium">
                Médias — copiés : {importResult.package_media.copied}, réutilisés :{' '}
                {importResult.package_media.reused}, manquants :{' '}
                {importResult.package_media.missing}
              </p>
            )}
            <p className="text-sm font-medium">Supprimés : 0</p>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href={route('trainings.show', { training: importResult.training.slug })}>
                  Voir la formation
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href={route('trainings.edit', { training: importResult.training.id })}>
                  Modifier la formation
                </Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href={route('trainings.import-export')}>Retour à Import / Export</Link>
              </Button>
              <Button type="button" variant="outline" onClick={importAnotherFile}>
                Importer un autre fichier
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {showResults && updateResult && (
        <Card className="max-w-4xl border-emerald-300 bg-emerald-50/60 dark:border-emerald-900 dark:bg-emerald-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" /> Formation mise à jour avec
              succès
            </CardTitle>
            <CardDescription>{updateResult.training.title}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border bg-background p-3">
                <p className="text-xs text-muted-foreground">Modifiés</p>
                <p className="text-xl font-semibold">
                  {Object.values(updateResult.modified).reduce((total, value) => total + value, 0)}
                </p>
              </div>
              <div className="rounded-lg border bg-background p-3">
                <p className="text-xs text-muted-foreground">Créés</p>
                <p className="text-xl font-semibold">
                  {Object.values(updateResult.created).reduce((total, value) => total + value, 0)}
                </p>
              </div>
              <div className="rounded-lg border bg-background p-3">
                <p className="text-xs text-muted-foreground">Conservés</p>
                <p className="text-xl font-semibold">{updateResult.preserved}</p>
              </div>
              <div className="rounded-lg border bg-background p-3">
                <p className="text-xs text-muted-foreground">Supprimés</p>
                <p className="text-xl font-semibold">{updateResult.deleted}</p>
              </div>
            </div>
            {updateResult.package_media && (
              <p className="text-sm font-medium">
                Médias — copiés : {updateResult.package_media.copied}, réutilisés :{' '}
                {updateResult.package_media.reused}, manquants :{' '}
                {updateResult.package_media.missing}
              </p>
            )}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border bg-background p-4">
                <h3 className="mb-2 font-semibold">Modifiés</h3>
                {Object.entries(updateResult.modified).map(([scope, count]) => (
                  <p key={scope} className="text-sm text-muted-foreground">
                    {scopeLabels[scope] ?? scope} : {count}
                  </p>
                ))}
              </div>
              <div className="rounded-lg border bg-background p-4">
                <h3 className="mb-2 font-semibold">Créés</h3>
                {Object.entries(updateResult.created).map(([scope, count]) => (
                  <p key={scope} className="text-sm text-muted-foreground">
                    {scopeLabels[scope] ?? scope} : {count}
                  </p>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href={route('trainings.show', { training: updateResult.training.slug })}>
                  Voir la formation
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href={route('trainings.edit', { training: updateResult.training.id })}>
                  Modifier la formation
                </Link>
              </Button>
              <Button type="button" variant="outline" onClick={importAnotherFile}>
                Importer un autre fichier
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <AlertDialog open={confirmationOpen} onOpenChange={setConfirmationOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Créer cette formation ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette formation n’existe pas encore sur cet environnement. La formation et son contenu
              pédagogique seront créés. Les fichiers physiques référencés par le JSON ne sont pas
              copiés automatiquement.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={createTraining}>Confirmer la création</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={updateConfirmationOpen} onOpenChange={setUpdateConfirmationOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Appliquer ces modifications ?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <p>Mises à jour : {safeAnalysis?.update_plan?.summary.updates ?? 0}</p>
                <p>Créations : {safeAnalysis?.update_plan?.summary.creates ?? 0}</p>
                <p>Conservés : {safeAnalysis?.update_plan?.summary.preserved ?? 0}</p>
                <p>Suppressions : 0</p>
                <p>Aucun élément absent du JSON ne sera supprimé.</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={updateTraining}>Confirmer la mise à jour</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
