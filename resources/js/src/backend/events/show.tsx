import React from 'react';
import DOMPurify from 'dompurify';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Clock, Users } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';

const ShowEvent = ({ event }: any) => {
    const displayedEvent = event;
    const safeContent = React.useMemo(() => DOMPurify.sanitize(displayedEvent.content || ''), [displayedEvent.content]);

    return (
        <div className="p-6 space-y-6">
            <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-950 via-slate-900 to-[#7f1d1d] px-6 py-7 text-white shadow-xl">
                <div className="absolute -top-10 -right-10 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-wide text-white/75">Détail événement</p>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mt-1">{displayedEvent.title}</h1>
                        <p className="mt-2 text-white/80 max-w-2xl">{displayedEvent.description}</p>
                    </div>
                    <Badge variant="secondary" className="w-fit text-slate-900 bg-white/95">
                        {displayedEvent.is_published ? 'Publié' : 'Brouillon'}
                    </Badge>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="relative aspect-[16/9] rounded-2xl overflow-hidden border border-slate-200/80 bg-slate-100 dark:border-slate-700/60 dark:bg-slate-900/50">
                        <img
                            src={displayedEvent.featured_image.large}
                            alt={displayedEvent.title}
                            className="object-cover w-full h-full"
                        />
                    </div>

                    <div className="space-y-6">
                        <div>
                            <Badge
                                style={{ backgroundColor: displayedEvent.category.color }}
                                className="mb-4"
                            >
                                {displayedEvent.category.name}
                            </Badge>
                            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Description</h2>
                        </div>

                        <Card className="border-slate-200/80 bg-white/95 dark:border-slate-700/60 dark:bg-slate-900/70">
                            <CardContent className="p-6">
                                <div className="prose max-w-none dark:prose-invert"
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
                                <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">{parseInt(displayedEvent.price).toLocaleString()} CHF</span>
                                <Badge variant="outline" className="text-xs">{displayedEvent.is_full ? 'Complet' : 'Ouvert'}</Badge>
                            </div>

                            <Button
                                className="w-full rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700"
                                size="lg"
                                variant={displayedEvent.is_full ? "outline" : "default"}
                                asChild
                            >
                                <Link href={route('events.participants', event.slug)}>
                                    Voir les inscrits ({displayedEvent.participant_count} / {displayedEvent.max_participants})
                                </Link>
                            </Button>

                            <hr className="border-slate-200 dark:border-slate-700" />

                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <Calendar className="h-5 w-5 text-slate-500 mt-1" />
                                    <div>
                                        <p className="font-medium">Date</p>
                                        <p className="text-slate-600 dark:text-slate-400">
                                            {format(new Date(displayedEvent.start_date), 'PPPP', { locale: fr })}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Clock className="h-5 w-5 text-slate-500 mt-1" />
                                    <div>
                                        <p className="font-medium">Horaires</p>
                                        <p className="text-slate-600 dark:text-slate-400">
                                            {format(new Date(displayedEvent.start_date), 'HH:mm')} -
                                            {format(new Date(displayedEvent.end_date), 'HH:mm')}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <MapPin className="h-5 w-5 text-slate-500 mt-1" />
                                    <div>
                                        <p className="font-medium">Lieu</p>
                                        <p className="text-slate-600 dark:text-slate-400">{displayedEvent.location}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Users className="h-5 w-5 text-slate-500 mt-1" />
                                    <div>
                                        <p className="font-medium">Participants</p>
                                        <p className="text-slate-600 dark:text-slate-400">
                                            {displayedEvent.max_participants} places maximum
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ShowEvent;
