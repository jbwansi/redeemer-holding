import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import {
    Calendar,
    Search,
    MapPin,
    Users,
    Eye,
    Edit,
    Trash2,
} from 'lucide-react';
import { format } from 'date-fns';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';

interface Category {
    id: number;
    name: string;
    color: string;
}

interface Event {
    id: number;
    title: string;
    slug: string;
    description: string;
    content: string;
    location: string;
    start_date: string;
    end_date: string;
    max_participants: number;
    price: number;
    featured_image: {
        thumbnail: string;
        medium: string;
        large: string;
    };
    is_published: boolean;
    is_featured: boolean;
    views: number;
    category: Category;
}

interface Props {
    events: {
        data: Event[];
        meta: {
            current_page: number;
            from: number;
            last_page: number;
            links: any[];
            path: string;
            per_page: number;
            to: number;
            total: number;
        };
    };
    categories: Category[];
}

const EventCard: React.FC<{ event: Event; onEdit: (event: Event) => void; onView: (event: Event) => void; onDelete: (event: Event) => void }> = ({ event, onEdit, onDelete, onView }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
        >
            <Card className="overflow-hidden bg-background hover:shadow-lg transition-shadow">
                <div className="relative">
                    <img
                        src={event.featured_image?.medium || '/placeholder.jpg'}
                        alt={event.title}
                        className="h-36 w-full object-cover"
                    />
                    <div className="absolute top-2 right-2 flex gap-1">
                        <Badge
                            variant={event.is_published ? 'default' : 'secondary'}
                            className="text-xs"
                        >
                            {event.is_published ? 'Publié' : 'Brouillon'}
                        </Badge>
                        {new Date(event.end_date) < new Date() && (
                            <Badge variant="destructive" className="text-xs">Passé</Badge>
                        )}
                    </div>
                    {event.is_featured && <div className="absolute top-2 left-2 flex gap-1">
                        <Badge
                            variant={'default'}
                            className="text-xs text-light"
                        >
                            Vedette
                        </Badge>
                    </div>}
                </div>

                <div className="p-2 flex flex-col gap-1">
                    <div className="flex items-center gap-1 mb-1">
                        <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: event.category?.color }}
                        />
                        <span className="text-xs font-medium">{event.category?.name}</span>
                    </div>

                    <h3 className="text-sm font-semibold line-clamp-1">{event.title}</h3>

                    <div className="space-y-1 text-xs text-muted-foreground flex-grow">
                        <div className="flex items-center gap-1.5">
                            <Calendar className="h-3 w-3" />
                            <span>{format(new Date(event.start_date), 'PPP')}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <MapPin className="h-3 w-3" />
                            <span className="line-clamp-1">{event.location}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Users className="h-3 w-3" />
                            <span>{event.max_participants} participants</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Eye className="h-3 w-3" />
                            <span>{event.views} Vues</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t mt-2">
                        <div className="flex items-center gap-1">
                            <motion.div whileHover={{ scale: 1.1 }}>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-blue-700"
                                    onClick={() => onView(event)}
                                >
                                    <Eye className="h-3 w-3" />
                                </Button>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.1 }}>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => onEdit(event)}
                                >
                                    <Edit className="h-3 w-3" />
                                </Button>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.1 }}>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-destructive"
                                    onClick={() => onDelete(event)}
                                >
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            </motion.div>
                        </div>
                        {/* <div className="flex items-center text-muted-foreground">
                            <Eye className="h-3 w-3 mr-1" />
                            <span className="text-xs">{event.views}</span>
                        </div> */}
                    </div>
                </div>
            </Card>
        </motion.div>
    );
};

export default function EventsIndex({ events, categories }: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

    const filteredEvents = events.data.filter(event => {
        const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.description.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory = selectedCategory === 'all' || event.category.id.toString() === selectedCategory;

        const matchesStatus = selectedStatus === 'all' ||
            (selectedStatus === 'published' && event.is_published) ||
            (selectedStatus === 'draft' && !event.is_published) ||
            (selectedStatus === 'past' && new Date(event.end_date) < new Date()) ||
            (selectedStatus === 'upcoming' && new Date(event.end_date) >= new Date());

        return matchesSearch && matchesCategory && matchesStatus;
    });

    const handleDelete = () => {
        if (!selectedEvent) return;

        router.delete(route('events.destroy', selectedEvent.id), {
            onSuccess: () => {
                setIsDeleteOpen(false);
                setSelectedEvent(null);
                toast.success('Event deleted successfully');
            },
            onError: () => {
                toast.error('Error deleting event');
            }
        });
    };

    const handleEdit = (event: Event) => {
        router.get(route('events.edit', event.id));
    };
    const handleView = (event: Event) => {
        router.get(route('events.show', event.slug));
    };
    return (
        <div className="p-6 space-y-6">
            <div className="rounded-lg border bg-background">
                {/* Header section with title and create button */}
                <div className="p-6 border-b">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Evènements</h1>
                            <p className="text-muted-foreground">Gérer les évènements de votre calendrier</p>
                        </div>

                        <Link href={route('events.create')}>
                            <Button size="lg" className="h-12 px-6">
                                <Calendar className="mr-2 h-5 w-5" />
                                Créer un évènement
                            </Button>
                        </Link>
                    </div>

                    {/* Filters section */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                                placeholder="Rechercher un évènement..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="pl-10 h-10"
                            />
                        </div>

                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                            <SelectTrigger className="w-[200px] h-10">
                                <SelectValue placeholder="Filter by Category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Toutes les catégories</SelectItem>
                                {categories.map(category => (
                                    <SelectItem
                                        key={category.id}
                                        value={category.id.toString()}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: category.color }}
                                            />
                                            {category.name}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                            <SelectTrigger className="w-[200px] h-10">
                                <SelectValue placeholder="Filter by Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tous les statuts</SelectItem>
                                <SelectItem value="published">Publié</SelectItem>
                                <SelectItem value="draft">Brouillon</SelectItem>
                                <SelectItem value="past">Evènements passés</SelectItem>
                                <SelectItem value="upcoming">Evènements à venir</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Events grid with animation */}
                <div className="p-6">
                    <AnimatePresence>
                        <motion.div
                            layout
                            className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3"
                        >
                            {filteredEvents.map(event => (
                                <EventCard
                                    key={event.id}
                                    event={event}
                                    onEdit={handleEdit}
                                    onView={handleView}
                                    onDelete={(event) => {
                                        setSelectedEvent(event);
                                        setIsDeleteOpen(true);
                                    }}
                                />
                            ))}
                        </motion.div>
                    </AnimatePresence>

                    {filteredEvents.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center text-muted-foreground"
                        >
                            No events found.
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Delete confirmation dialog */}
            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the event
                            <span className="font-semibold"> {selectedEvent?.title}</span>.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
