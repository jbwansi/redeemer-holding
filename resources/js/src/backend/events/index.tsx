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
import { Calendar, Search, MapPin, Users, Eye, Edit, Trash2, FileJson } from 'lucide-react';
import { format } from 'date-fns';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import { route } from 'ziggy-js';

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

const EventCard: React.FC<{
  event: Event;
  onEdit: (event: Event) => void;
  onView: (event: Event) => void;
  onDelete: (event: Event) => void;
  onTogglePublish: (event: Event) => void;
}> = ({ event, onEdit, onDelete, onView, onTogglePublish }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="overflow-hidden border-slate-200/80 bg-white/95 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-700/60 dark:bg-slate-900/70">
        <div className="relative">
          <img
            src={event.featured_image?.medium || '/placeholder.jpg'}
            alt={event.title}
            className="h-36 w-full object-cover"
          />
          <div className="absolute top-2 right-2 flex gap-1">
            <Badge variant={event.is_published ? 'default' : 'secondary'} className="text-xs">
              {event.is_published ? 'Publié' : 'Brouillon'}
            </Badge>
            {new Date(event.end_date) < new Date() && (
              <Badge variant="destructive" className="text-xs">
                Passé
              </Badge>
            )}
          </div>
          {event.is_featured && (
            <div className="absolute top-2 left-2 flex gap-1">
              <Badge variant={'default'} className="text-xs text-red-500 bg-white">
                Vedette
              </Badge>
            </div>
          )}
        </div>

        <div className="p-3 flex flex-col gap-1.5">
          <div className="flex items-center gap-1 mb-1">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: event.category?.color }}
            />
            <span className="text-xs font-medium">{event.category?.name}</span>
          </div>

          <h3 className="text-sm font-semibold line-clamp-1 text-slate-900 dark:text-slate-100">
            {event.title}
          </h3>

          <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400 flex-grow">
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

          <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 mt-2 dark:border-slate-700/60">
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

            <button
              type="button"
              onClick={() => onTogglePublish(event)}
              className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
                event.is_published ? 'bg-green-600' : 'bg-slate-300'
              }`}
              title={event.is_published ? 'Dépublier' : 'Publier'}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  event.is_published ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </button>
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

  const filteredEvents = events.data.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' || event.category.id.toString() === selectedCategory;

    const matchesStatus =
      selectedStatus === 'all' ||
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
        toast.success('Événement supprimé avec succès');
      },
      onError: () => {
        toast.error("Erreur lors de la suppression de l'événement");
      },
    });
  };

  const handleTogglePublish = (event: Event) => {
    router.patch(
      route('events.toggle-publish', event.id),
      {
        is_published: !event.is_published,
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          toast.success(
            !event.is_published ? 'Événement publié avec succès' : 'Événement dépublié avec succès'
          );
        },
        onError: () => {
          toast.error('Erreur lors du changement de statut');
        },
      }
    );
  };

  const handleEdit = (event: Event) => {
    router.get(route('events.edit', event.id));
  };
  const handleView = (event: Event) => {
    router.get(route('events.show', event.slug));
  };
  return (
    <div className="p-6 space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-950 via-slate-900 to-[#7f1d1d] px-6 py-7 text-white shadow-xl">
        <div className="absolute -top-10 -right-10 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Événements</h1>
            <p className="mt-2 text-white/80">Gérer les événements de votre calendrier</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="lg"
              asChild
              className="h-11 border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
            >
              <Link href={route('events.import-export')}>
                <FileJson className="mr-2 h-5 w-5" />
                Import / Export
              </Link>
            </Button>
            <Link href={route('events.create')}>
              <Button
                size="lg"
                className="h-11 px-5 rounded-xl bg-white text-slate-900 hover:bg-slate-100"
              >
                <Calendar className="mr-2 h-5 w-5" />
                Créer un événement
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-sm dark:border-slate-700/60 dark:bg-slate-900/70">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Rechercher un événement..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 rounded-xl"
            />
          </div>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[220px] h-10 rounded-xl">
              <SelectValue placeholder="Filtrer par catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les catégories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
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
            <SelectTrigger className="w-[220px] h-10 rounded-xl">
              <SelectValue placeholder="Filtrer par statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="published">Publié</SelectItem>
              <SelectItem value="draft">Brouillon</SelectItem>
              <SelectItem value="past">Événements passés</SelectItem>
              <SelectItem value="upcoming">Événements à venir</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mt-3 text-sm text-slate-600 dark:text-slate-400">
          {filteredEvents.length} résultat{filteredEvents.length > 1 ? 's' : ''}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white/95 p-6 shadow-sm dark:border-slate-700/60 dark:bg-slate-900/70">
        <AnimatePresence>
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onEdit={handleEdit}
                onView={handleView}
                onDelete={(event) => {
                  setSelectedEvent(event);
                  setIsDeleteOpen(true);
                }}
                onTogglePublish={handleTogglePublish}
              />
            ))}
          </motion.div>
        </AnimatePresence>

        {filteredEvents.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-xl border border-dashed border-slate-300/80 bg-slate-50/70 py-12 text-center text-slate-600 dark:border-slate-700 dark:bg-slate-900/30 dark:text-slate-400"
          >
            Aucun événement trouvé.
          </motion.div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Cela supprimera définitivement l'événement
              <span className="font-semibold"> {selectedEvent?.title}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
