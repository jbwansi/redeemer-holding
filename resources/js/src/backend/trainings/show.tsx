import React from 'react';
import DOMPurify from 'dompurify';
import { useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Clock, Users, GraduationCap, Link, Upload, Loader2 } from 'lucide-react';
import { Link as InertiaLink } from '@inertiajs/react';
import { cn } from '@/lib/utils';

interface Training {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  location: string;
  start_date: string;
  end_date: string;
  price: string;
  max_participants: string;
  meeting_link: string; // Nouveau champ ajouté
  featured_image: {
    large: string;
  };
  is_published: boolean;
  participant_count?: number;
  slug: string;
  is_full?: boolean;
}

const ShowTraining = ({ training }: { training: Training }) => {
  const displayedTraining = training;
  const safeContent = React.useMemo(
    () => DOMPurify.sanitize(displayedTraining.content || ''),
    [displayedTraining?.content]
  );

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-950 via-slate-900 to-[#7f1d1d] px-6 py-7 text-white shadow-xl">
        <div className="absolute -top-10 -right-10 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-white/75">Détail formation</p>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight mt-1">
              {displayedTraining.title}
            </h1>
            <p className="mt-2 text-white/80 max-w-2xl">{displayedTraining.excerpt}</p>
          </div>
          <Badge variant="secondary" className="w-fit text-slate-900 bg-white/95">
            {displayedTraining.is_published ? 'Publié' : 'Brouillon'}
          </Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="relative aspect-[16/9] rounded-2xl overflow-hidden border border-slate-200/80 bg-slate-100 dark:border-slate-700/60 dark:bg-slate-900/50">
            <img
              src={displayedTraining.featured_image.large}
              alt={displayedTraining.title}
              className="object-cover w-full h-full"
            />
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <GraduationCap className="h-5 w-5 text-red-600" />
                <Badge variant="outline" className="text-red-600 border-red-200">
                  Formation
                </Badge>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Description
              </h2>
            </div>

            <Card className="border-slate-200/80 bg-white/95 dark:border-slate-700/60 dark:bg-slate-900/70">
              <CardContent className="p-6">
                <div
                  className="prose max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: safeContent }}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="border-slate-200/80 bg-white/95 shadow-sm dark:border-slate-700/60 dark:bg-slate-900/70">
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {parseInt(displayedTraining.price).toLocaleString()} CHF
                </span>
                <Badge variant="outline" className="text-xs">
                  {displayedTraining.is_full ? 'Complet' : 'Ouvert'}
                </Badge>
              </div>

              <Button
                className="w-full rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700"
                size="lg"
                variant={displayedTraining.is_full ? 'outline' : 'default'}
                asChild
              >
                <InertiaLink href={route('trainings.participants', displayedTraining.slug)}>
                  Voir les inscrits ({displayedTraining.participant_count || 0} /{' '}
                  {displayedTraining.max_participants})
                </InertiaLink>
              </Button>

              <Button variant="outline" className="w-full rounded-xl" size="lg" asChild>
                <InertiaLink
                  href={route('trainings.sections.index', {
                    training: displayedTraining.id,
                  })}
                >
                  <GraduationCap className="h-4 w-4 mr-2" />
                  Constructeur de formation
                </InertiaLink>
              </Button>

              <Button variant="outline" className="w-full rounded-xl" size="lg" asChild>
                <InertiaLink
                  href={route('trainings.sections.index', {
                    training: displayedTraining.id,
                  })}
                >
                  <GraduationCap className="h-4 w-4 mr-2" />
                  Gérer les leçons
                </InertiaLink>
              </Button>

              {/* Bouton pour rejoindre le meeting si le lien existe */}
              {displayedTraining.meeting_link && (
                <Button className="w-full rounded-xl" size="lg" variant="outline" asChild>
                  <a
                    href={displayedTraining.meeting_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2"
                  >
                    <Link className="h-4 w-4" />
                    Rejoindre le meeting
                  </a>
                </Button>
              )}

              <hr className="border-slate-200 dark:border-slate-700" />

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-slate-500 mt-1" />
                  <div>
                    <p className="font-medium">Date de début</p>
                    <p className="text-slate-600 dark:text-slate-400">
                      {formatDate(displayedTraining.start_date)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-slate-500 mt-1" />
                  <div>
                    <p className="font-medium">Date de fin</p>
                    <p className="text-slate-600 dark:text-slate-400">
                      {formatDate(displayedTraining.end_date)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-slate-500 mt-1" />
                  <div>
                    <p className="font-medium">Horaires</p>
                    <p className="text-slate-600 dark:text-slate-400">
                      {formatTime(displayedTraining.start_date)} -
                      {formatTime(displayedTraining.end_date)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-slate-500 mt-1" />
                  <div>
                    <p className="font-medium">Lieu</p>
                    <p className="text-slate-600 dark:text-slate-400">
                      {displayedTraining.location}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-slate-500 mt-1" />
                  <div>
                    <p className="font-medium">Participants</p>
                    <p className="text-slate-600 dark:text-slate-400">
                      {displayedTraining.max_participants} places maximum
                    </p>
                  </div>
                </div>

                {/* Affichage du lien de meeting s'il existe */}
                {displayedTraining.meeting_link && (
                  <div className="flex items-start gap-3">
                    <Link className="h-5 w-5 text-slate-500 mt-1" />
                    <div>
                      <p className="font-medium">Lien de meeting</p>
                      <a
                        href={displayedTraining.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-600 dark:text-slate-400 hover:text-red-600 underline break-all"
                      >
                        {displayedTraining.meeting_link}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <ImportSectionsForm trainingId={training.id} />
    </div>
  );
};

const ImportSectionsForm = ({ trainingId }: { trainingId: number }) => {
  const {
    data: importData,
    setData: setImportData,
    post: postImport,
    processing: importProcessing,
    errors: importErrors,
  } = useForm({
    file: null as File | null,
  });
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImportData('file', file);
  };

  const submitImport = (e: React.FormEvent) => {
    e.preventDefault();

    postImport(route('trainings.import-sections', { training: trainingId }), {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => {
        setImportData('file', null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      },
    });
  };

  return (
    <Card className="border-slate-200/80 bg-white/95 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/70 max-w-4xl mx-auto">
      <CardContent className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-2">
            Importer du contenu pédagogique
          </h2>
          <p className="text-sm text-muted-foreground">
            Ajoutez des modules, leçons et ressources à cette formation existante.
          </p>
          <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/20 dark:text-amber-200">
            Le contenu sera ajouté à cette formation. Cette opération ne remplace pas
            automatiquement les modules déjà présents.
          </p>
        </div>

        <form onSubmit={submitImport} className="space-y-4">
          <div
            className={cn(
              'relative aspect-auto rounded-lg border-2 border-dashed border-muted-foreground/25 transition-colors hover:border-muted-foreground/50',
              'flex cursor-pointer flex-col items-center justify-center overflow-hidden p-8 text-center',
              importData.file && 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
            )}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.txt"
              onChange={handleFileChange}
              className="hidden"
            />
            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
            {importData.file ? (
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {importData.file.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {(importData.file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  Cliquez pour télécharger un fichier JSON
                </p>
                <p className="text-xs text-muted-foreground">
                  Formats acceptés : .json, .txt (max 5 MB)
                </p>
              </div>
            )}
          </div>

          {importErrors.file && (
            <div className="rounded-lg bg-red-50 dark:bg-red-950/20 p-4 border border-red-200 dark:border-red-900">
              <p className="text-sm text-red-700 dark:text-red-400">{importErrors.file}</p>
            </div>
          )}

          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={importProcessing || !importData.file}
              className="flex-1 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
            >
              {importProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Importer
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setImportData('file', null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="rounded-xl"
            >
              Annuler
            </Button>
          </div>

          <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg space-y-3">
            <h3 className="font-medium text-sm text-slate-900 dark:text-slate-100">
              Format JSON attendu :
            </h3>
            <pre className="text-xs bg-slate-100 dark:bg-slate-900 p-3 rounded overflow-auto max-h-64 text-slate-700 dark:text-slate-300">
              {`{
  "sections": [
    {
      "title": "Module 1",
      "description": "Description facultative",
      "sort_order": 1,
      "is_published": true,
      "lessons": [
        {
          "title": "Leçon 1",
          "slug": "lecon-1",
          "excerpt": "Description",
          "content": "<p>HTML content</p>",
          "video_url": "https://...",
          "video_duration": 600,
          "sort_order": 1,
          "is_published": true,
          "is_free": false,
          "resources": [
            {
              "title": "Resource",
              "description": "Description facultative",
              "file_type": "pdf",
              "external_url": "https://...",
              "file_path": null,
              "file_disk": "public",
              "is_downloadable": true,
              "is_public": false,
              "sort_order": 1
            }
          ]
        }
      ]
    }
  ]
}`}
            </pre>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ShowTraining;
