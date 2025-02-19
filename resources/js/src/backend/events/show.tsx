import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Clock, Users, Share2, Heart } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const ShowEvent = ({ event }: any) => {
    const sampleEvent = {
        title: "Festival de musique d'été",
        description: "Un weekend de musique live avec les meilleurs artistes",
        content: `<p>Rejoignez-nous pour une expérience musicale inoubliable...</p>`,
        location: "Parc Central, Paris",
        category: { name: "Musique", color: "#FF5A5F" },
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 86400000).toISOString(),
        price: "25000",
        max_participants: "500",
        featured_image: "/api/placeholder/1200/600",
        is_published: true
    };

    const displayedEvent = event || sampleEvent;
    console.log(event);

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="grid lg:grid-cols-3 gap-8">
                {/* Image et Infos Principales */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="relative aspect-[16/9] rounded-2xl overflow-hidden">
                        <img
                            src={displayedEvent.featured_image.large}
                            alt={displayedEvent.title}
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
                            <Badge
                                style={{ backgroundColor: displayedEvent.category.color }}
                                className="mb-4"
                            >
                                {displayedEvent.category.name}
                            </Badge>
                            <h1 className="text-4xl font-bold tracking-tight mb-4">{displayedEvent.title}</h1>
                            <p className="text-lg text-muted-foreground">{displayedEvent.description}</p>
                        </div>

                        <Card>
                            <CardContent className="p-6">
                                <div className="prose max-w-none dark:prose-invert"
                                    dangerouslySetInnerHTML={{ __html: displayedEvent.content }}
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
                                <span className="text-2xl font-bold">{parseInt(displayedEvent.price).toLocaleString()} FCFA</span>
                                <Badge variant="secondary" className="text-base px-4 py-1">
                                    {displayedEvent.is_published ? 'Publié' : 'Brouillon'}
                                </Badge>
                            </div>

                            <Button className="w-full" size="lg">
                                Réserver maintenant
                            </Button>

                            <hr className="border-muted" />

                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <Calendar className="h-5 w-5 text-muted-foreground mt-1" />
                                    <div>
                                        <p className="font-medium">Date</p>
                                        <p className="text-muted-foreground">
                                            {format(new Date(displayedEvent.start_date), 'PPPP', { locale: fr })}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Clock className="h-5 w-5 text-muted-foreground mt-1" />
                                    <div>
                                        <p className="font-medium">Horaires</p>
                                        <p className="text-muted-foreground">
                                            {format(new Date(displayedEvent.start_date), 'HH:mm')} -
                                            {format(new Date(displayedEvent.end_date), 'HH:mm')}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <MapPin className="h-5 w-5 text-muted-foreground mt-1" />
                                    <div>
                                        <p className="font-medium">Lieu</p>
                                        <p className="text-muted-foreground">{displayedEvent.location}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Users className="h-5 w-5 text-muted-foreground mt-1" />
                                    <div>
                                        <p className="font-medium">Participants</p>
                                        <p className="text-muted-foreground">
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