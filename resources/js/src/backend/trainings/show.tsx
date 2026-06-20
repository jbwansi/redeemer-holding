import React from 'react';
import DOMPurify from 'dompurify';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Clock, Users, GraduationCap, Link } from 'lucide-react';
import { Link as InertiaLink } from '@inertiajs/react';
import { route } from 'ziggy-js';

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

const ShowTraining = ({ training, }: { training: Training }) => {
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
                  Gérer les modules
                </InertiaLink>
              </Button>

              <Button variant="outline" className="w-full rounded-xl" size="lg" asChild>
                <InertiaLink
                  href={route('trainings.lessons.index', {
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
                      {formatTime(displayedTraining.start_date)} -{formatTime(displayedTraining.end_date)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-slate-500 mt-1" />
                  <div>
                    <p className="font-medium">Lieu</p>
                    <p className="text-slate-600 dark:text-slate-400">{displayedTraining.location}</p>
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
    </div>
  );
};

export default ShowTraining;
