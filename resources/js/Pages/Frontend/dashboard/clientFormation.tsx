import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Search,
  GraduationCap,
  CheckCircle,
  X,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { Link } from '@inertiajs/react';
import DashboardLayout from '@/components/frontend/layouts/dashboard-layout';

interface Training {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  featured_image: {
    original: string;
  };
  start_date: string;
  end_date: string;
  location: string;
  price: number;
  max_participants: number;
  available_seats: number;
  is_full: boolean;
  is_ongoing: boolean;
}

const TrainingStatus = {
  ALL: 'all',
  ONGOING: 'ongoing',
  UPCOMING: 'upcoming',
  PAST: 'past',
};

const DashboardTrainingCard = ({ formation }: { formation: Training }) => {
  const isPast = new Date(formation.end_date) < new Date();
  const isOngoing = formation.is_ongoing;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-md shadow-slate-200/60 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl dark:border-slate-700/50 dark:bg-slate-900/70 dark:shadow-black/20"
    >
      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/3 relative h-48 md:h-auto overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={formation.featured_image.original}
              alt={formation.title}
              className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${
                isPast ? 'filter grayscale' : ''
              }`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>
          </div>

          <div className="absolute top-4 left-4 z-10">
            <span className="px-3 py-1 bg-white/90 dark:bg-slate-900/90 text-red-600 text-sm font-medium rounded-full flex items-center">
              <GraduationCap className="w-3 h-3 mr-1" />
              Training
            </span>
          </div>

          {isPast && (
            <div className="absolute top-4 right-4 z-10">
              <span className="px-3 py-1 bg-gray-800/90 text-white text-sm font-medium rounded-full flex items-center">
                <CheckCircle className="w-3 h-3 mr-1" />
                Terminée
              </span>
            </div>
          )}

          {isOngoing && !isPast && (
            <div className="absolute top-4 right-4 z-10">
              <span className="px-3 py-1 bg-green-600/90 text-white text-sm font-medium rounded-full flex items-center">
                En cours
              </span>
            </div>
          )}
        </div>

        <div className="md:w-2/3 p-6 flex flex-col">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 line-clamp-1">
              {formation.title}
            </h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm line-clamp-2 mb-4">
              {formation.excerpt}
            </p>
          </div>

          <div className="space-y-2 text-sm mb-4">
            <div className="flex items-center text-slate-500 dark:text-slate-400">
              <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="line-clamp-1">Du {formatDate(formation.start_date)}</span>
            </div>
            <div className="flex items-center text-slate-500 dark:text-slate-400">
              <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>
                {formatTime(formation.start_date)} - {formatTime(formation.end_date)}
              </span>
            </div>
            <div className="flex items-center text-slate-500 dark:text-slate-400">
              <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="line-clamp-1">{formation.location}</span>
            </div>
            {!isPast && (
              <div className="flex items-center text-slate-500 dark:text-slate-400">
                <Users className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>
                  {formation.is_full
                    ? 'Complet'
                    : `${formation.available_seats} places disponibles`}
                </span>
              </div>
            )}
          </div>

          <div className="mt-auto pt-4 border-t border-slate-200/80 dark:border-slate-700/70 flex items-center justify-between">
            <span className="font-semibold text-slate-900 dark:text-white">
              {formation.price === 0 ? 'Gratuit' : `${formation.price} CHF`}
            </span>
            <Link
              href={`/trainings/${formation.slug}`}
              className="inline-flex items-center rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-4 py-2 text-white shadow-md shadow-red-500/25 transition-all duration-200 hover:from-red-700 hover:to-rose-700"
            >
              <span>Voir les détails</span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ClientTrainings = ({ trainings }: any) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(TrainingStatus.ALL);

  const allTrainings = trainings?.data ?? [];

  const statCounts = useMemo(() => {
    const now = new Date();
    const ongoing = allTrainings.filter(
      (f: Training) => now >= new Date(f.start_date) && now <= new Date(f.end_date)
    ).length;
    const upcoming = allTrainings.filter((f: Training) => new Date(f.start_date) > now).length;
    const past = allTrainings.filter((f: Training) => new Date(f.end_date) < now).length;
    return { all: allTrainings.length, ongoing, upcoming, past };
  }, [allTrainings]);

  const filteredTrainings = useMemo(() => {
    const currentDate = new Date();
    return allTrainings.filter((formation: Training) => {
      const startDate = new Date(formation.start_date);
      const endDate = new Date(formation.end_date);
      const matchesSearch =
        formation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        formation.excerpt.toLowerCase().includes(searchTerm.toLowerCase());

      switch (statusFilter) {
        case TrainingStatus.ONGOING:
          return currentDate >= startDate && currentDate <= endDate && matchesSearch;
        case TrainingStatus.UPCOMING:
          return startDate > currentDate && matchesSearch;
        case TrainingStatus.PAST:
          return endDate < currentDate && matchesSearch;
        default:
          return matchesSearch;
      }
    });
  }, [allTrainings, searchTerm, statusFilter]);

  const statusOptions = [
    { key: TrainingStatus.ALL, label: 'Toutes', count: statCounts.all },
    { key: TrainingStatus.ONGOING, label: 'En cours', count: statCounts.ongoing },
    { key: TrainingStatus.UPCOMING, label: 'A venir', count: statCounts.upcoming },
    { key: TrainingStatus.PAST, label: 'Passees', count: statCounts.past },
  ];

  return (
    <DashboardLayout title="Tableau de bord" currentPage="trainings">
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-950 via-slate-900 to-[#7f1d1d] p-6 md:p-7 text-white shadow-xl"
        >
          <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-10 left-10 h-28 w-28 rounded-full bg-red-400/20 blur-xl" />

          <div className="relative">
            <p className="inline-flex items-center rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-white/90">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Dashboard formation
            </p>
            <h1 className="mt-3 text-2xl md:text-3xl font-bold tracking-tight flex items-center">
              <GraduationCap className="w-6 h-6 mr-3 text-red-300" />
              Mes Formations
            </h1>
            <p className="mt-2 text-sm md:text-base text-white/80 max-w-2xl">
              Suivez vos formations en cours, les sessions à venir et votre historique depuis une
              interface claire.
            </p>
          </div>

          <div className="relative mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-3">
              <p className="text-xs text-white/75">Toutes</p>
              <p className="text-xl font-semibold">{statCounts.all}</p>
            </div>
            <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-3">
              <p className="text-xs text-white/75">En cours</p>
              <p className="text-xl font-semibold">{statCounts.ongoing}</p>
            </div>
            <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-3">
              <p className="text-xs text-white/75">A venir</p>
              <p className="text-xl font-semibold">{statCounts.upcoming}</p>
            </div>
            <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-3">
              <p className="text-xs text-white/75">Passees</p>
              <p className="text-xl font-semibold">{statCounts.past}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
          className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/60"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow relative">
              <input
                type="text"
                placeholder="Rechercher une formation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {statusOptions.map((status) => (
                <button
                  key={status.key}
                  onClick={() => setStatusFilter(status.key)}
                  className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm transition-all duration-200 ${
                    statusFilter === status.key
                      ? 'bg-red-600 text-white shadow-md shadow-red-500/20'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>{status.label}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${statusFilter === status.key ? 'bg-white/20' : 'bg-white dark:bg-slate-900/60'}`}
                  >
                    {status.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-3 text-sm text-slate-600 dark:text-slate-400">
            {filteredTrainings.length} formation{filteredTrainings.length > 1 ? 's' : ''} trouvee
            {filteredTrainings.length > 1 ? 's' : ''}
          </div>
        </motion.div>

        <div className="space-y-6">
          {filteredTrainings.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="rounded-2xl border border-dashed border-slate-300/80 bg-slate-50/70 py-14 text-center dark:border-slate-700 dark:bg-slate-900/30"
            >
              <GraduationCap className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                Aucune formation trouvée
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Aucune formation ne correspond a vos criteres de recherche.
              </p>
            </motion.div>
          ) : (
            filteredTrainings.map((formation: Training, index: number) => (
              <motion.div
                key={formation.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.28) }}
              >
                <DashboardTrainingCard formation={formation} />
              </motion.div>
            ))
          )}
        </div>
        {filteredTrainings.length > 0 && (
          <div className="flex justify-end pt-2">
            <Link
              href={route('trainings')}
              className="inline-flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              Explorer toutes les formations
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ClientTrainings;
