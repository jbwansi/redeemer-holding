import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Clock, Users, Share2, Heart, GraduationCap } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';

interface Formation {
    title: string;
    excerpt: string;
    content: string;
    location: string;
    start_date: string;
    end_date: string;
    price: string;
    max_participants: string;
    featured_image: {
        large: string;
    };
    is_published: boolean;
    participant_count?: number;
    slug: string;
    is_full?: boolean;
}

const ShowFormation = ({ formation }: { formation: Formation }) => {
    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (date: string) => {
        return new Date(date).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="mx-auto p-6">
            <div className="grid lg:grid-cols-3 gap-8">
                {/* Image et Infos Principales */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="relative aspect-[16/9] rounded-2xl overflow-hidden">
                        <img
                            src={formation.featured_image.large}
                            alt={formation.title}
                            className="object-cover w-full h-full"
                        />
                        <div className="absolute top-4 right-4 flex gap-2">
                            <Button size="icon" variant="secondary" className="rounded-full bg-white/80 backdrop-blur-sm">
                                <Share2 className="h-5 w-5" />
                            </Button>
                            <Button size="icon" variant="secondary" className="rounded-full bg-white/80 backdrop-blur-sm">
                                <Heart className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <GraduationCap className="h-5 w-5 text-primary" />
                                <Badge variant="outline" className="text-primary">
                                    Formation
                                </Badge>
                            </div>
                            <h1 className="text-4xl font-bold tracking-tight mb-4">{formation.title}</h1>
                            <p className="text-lg text-muted-foreground">{formation.excerpt}</p>
                        </div>

                        <Card>
                            <CardContent className="p-6">
                                <div
                                    className="prose max-w-none dark:prose-invert"
                                    dangerouslySetInnerHTML={{ __html: formation.content }}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <Card>
                        <CardContent className="p-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <span className="text-2xl font-bold">{parseInt(formation.price).toLocaleString()} CHF</span>
                                <Badge variant="secondary" className="text-base px-4 py-1">
                                    {formation.is_published ? 'Publié' : 'Brouillon'}
                                </Badge>
                            </div>

                            <Button
                                className="w-full"
                                size="lg"
                                variant={formation.is_full ? "outline" : "default"}
                                asChild
                            >
                                <Link href={route('formations.participants', formation.slug)}>
                                    Voir les inscrits ({formation.participant_count || 0} / {formation.max_participants})
                                </Link>
                            </Button>

                            <hr className="border-muted" />

                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <Calendar className="h-5 w-5 text-muted-foreground mt-1" />
                                    <div>
                                        <p className="font-medium">Date de début</p>
                                        <p className="text-muted-foreground">
                                            {formatDate(formation.start_date)}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Calendar className="h-5 w-5 text-muted-foreground mt-1" />
                                    <div>
                                        <p className="font-medium">Date de fin</p>
                                        <p className="text-muted-foreground">
                                            {formatDate(formation.end_date)}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Clock className="h-5 w-5 text-muted-foreground mt-1" />
                                    <div>
                                        <p className="font-medium">Horaires</p>
                                        <p className="text-muted-foreground">
                                            {formatTime(formation.start_date)} -
                                            {formatTime(formation.end_date)}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <MapPin className="h-5 w-5 text-muted-foreground mt-1" />
                                    <div>
                                        <p className="font-medium">Lieu</p>
                                        <p className="text-muted-foreground">{formation.location}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Users className="h-5 w-5 text-muted-foreground mt-1" />
                                    <div>
                                        <p className="font-medium">Participants</p>
                                        <p className="text-muted-foreground">
                                            {formation.max_participants} places maximum
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

export default ShowFormation;