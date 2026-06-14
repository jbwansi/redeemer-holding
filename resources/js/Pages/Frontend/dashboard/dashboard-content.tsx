import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Phone,
  Mail,
  GraduationCap,
  Calendar,
  ArrowRight,
  Clock,
  CheckCircle,
  User,
  Trophy,
} from 'lucide-react';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import VisitorsByCountry from './visitors-by-country';

import BackupButton from './backup-button';

// Simple notification component
const Notification = ({
  message,
  type,
  onClose,
}: {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}) => (
  <div
    className={`fixed top-6 right-6 z-50 px-4 py-3 rounded shadow-lg text-white ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}
    role="alert"
  >
    <div className="flex items-center justify-between gap-4">
      <span>{message}</span>
      <button onClick={onClose} className="ml-4 text-white font-bold">
        ×
      </button>
    </div>
  </div>
);

interface ClientDashboardProps {
  countCurrentTrainings: number;
  countUpGoingTrainings: number;
  CountPastTrainings: number;
  countCurrentEvents: number;
  countUpGoingEvents: number;
  CountPastEvents: number;
  auth: {
    user: {
      name: string;
      email: string;
      phone?: string;
      avatar?: string;
    };
  };
}

const DashboardContent = ({
  countCurrentTrainings,
  countUpGoingTrainings,
  CountPastTrainings,
  countCurrentEvents,
  countUpGoingEvents,
  CountPastEvents,
  auth,
}: ClientDashboardProps) => {
  // Références pour les animations
  const [notification, setNotification] = React.useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  // Helper to show notification
  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };
  const profileRef = useRef(null);
  const statsRef = useRef(null);

  // Détection de visibilité pour animations
  const isProfileInView = useInView(profileRef, { once: true, amount: 0.3 });
  const isStatsInView = useInView(statsRef, { once: true, amount: 0.3 });

  // Calcul des totaux pour les pourcentages
  const totalTrainings =
    countCurrentTrainings + countUpGoingTrainings + CountPastTrainings || 1;
  const totalEvents = countCurrentEvents + countUpGoingEvents + CountPastEvents || 1;

  return (
    <div className="p-4 lg:p-8">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      {/* Section Profil */}
      <motion.div
        ref={profileRef}
        initial={{ opacity: 0, y: 20 }}
        animate={isProfileInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
          <User className="w-6 h-6 mr-2 text-red-600" />
          Mon Profil
        </h2>

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col md:flex-row items-start gap-8">
              {/* Avatar et infos principales */}
              <motion.div
                className="flex-shrink-0 relative"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={isProfileInView ? { scale: 1, opacity: 1 } : { scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="w-32 h-32 rounded-xl bg-gradient-to-br from-red-500 to-red-600 p-1">
                  <div className="w-full h-full rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                    {auth.user.avatar ? (
                      <img
                        src={auth.user.avatar}
                        alt={auth.user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-16 h-16 text-gray-400" />
                    )}
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-4 border-white dark:border-gray-900"></div>
              </motion.div>

              {/* Intrainings détaillées */}
              <motion.div
                className="flex-grow space-y-4"
                initial={{ x: 20, opacity: 0 }}
                animate={isProfileInView ? { x: 0, opacity: 1 } : { x: 20, opacity: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="flex flex-col space-y-1">
                  <label className="text-sm text-gray-500 dark:text-gray-400">Nom complet</label>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {auth.user.name}
                  </p>
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-sm text-gray-500 dark:text-gray-400">Email</label>
                  <div className="flex items-center text-gray-900 dark:text-white">
                    <Mail className="w-4 h-4 mr-2 text-gray-400" />
                    {auth.user.email}
                  </div>
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-sm text-gray-500 dark:text-gray-400">Téléphone</label>
                  <div className="flex items-center text-gray-900 dark:text-white">
                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                    {auth.user.phone || 'Non renseigné'}
                  </div>
                </div>
              </motion.div>

              {/* Bouton d'action */}
              <motion.div
                className="flex-shrink-0"
                initial={{ x: 20, opacity: 0 }}
                animate={isProfileInView ? { x: 0, opacity: 1 } : { x: 20, opacity: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Link
                  href={route('dashboard.client.account')}
                  className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
                >
                  <span>Modifier le profil</span>
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Section Statistiques */}
      <motion.div
        ref={statsRef}
        initial={{ opacity: 0, y: 20 }}
        animate={isStatsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
          <Trophy className="w-6 h-6 mr-2 text-red-600" />
          Mes Activités
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Card Formations */}
          <motion.div
            className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={isStatsInView ? { scale: 1, opacity: 1 } : { scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Formations</h3>
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <GraduationCap className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-600 dark:text-gray-300">En cours</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {countCurrentTrainings}
                  </span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-red-500"
                    initial={{ width: '0%' }}
                    animate={
                      isStatsInView
                        ? {
                            width: `${(countCurrentTrainings / totalTrainings) * 100}%`,
                          }
                        : { width: '0%' }
                    }
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-600 dark:text-gray-300">À venir</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {countUpGoingTrainings}
                  </span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-blue-500"
                    initial={{ width: '0%' }}
                    animate={
                      isStatsInView
                        ? {
                            width: `${(countUpGoingTrainings / totalTrainings) * 100}%`,
                          }
                        : { width: '0%' }
                    }
                    transition={{ duration: 1, delay: 0.6 }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-600 dark:text-gray-300">Terminées</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {CountPastTrainings}
                  </span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-green-500"
                    initial={{ width: '0%' }}
                    animate={
                      isStatsInView
                        ? {
                            width: `${(CountPastTrainings / totalTrainings) * 100}%`,
                          }
                        : { width: '0%' }
                    }
                    transition={{ duration: 1, delay: 0.7 }}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card Événements */}
          <motion.div
            className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={isStatsInView ? { scale: 1, opacity: 1 } : { scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Événements</h3>
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-600 dark:text-gray-300">En cours</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {countCurrentEvents}
                  </span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-purple-500"
                    initial={{ width: '0%' }}
                    animate={
                      isStatsInView
                        ? {
                            width: `${(countCurrentEvents / totalEvents) * 100}%`,
                          }
                        : { width: '0%' }
                    }
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-600 dark:text-gray-300">À venir</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {countUpGoingEvents}
                  </span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-blue-500"
                    initial={{ width: '0%' }}
                    animate={
                      isStatsInView
                        ? {
                            width: `${(countUpGoingEvents / totalEvents) * 100}%`,
                          }
                        : { width: '0%' }
                    }
                    transition={{ duration: 1, delay: 0.6 }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-600 dark:text-gray-300">Terminés</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {CountPastEvents}
                  </span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-green-500"
                    initial={{ width: '0%' }}
                    animate={
                      isStatsInView
                        ? {
                            width: `${(CountPastEvents / totalEvents) * 100}%`,
                          }
                        : { width: '0%' }
                    }
                    transition={{ duration: 1, delay: 0.7 }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Section Visiteurs par pays */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Visiteurs par pays
          </h3>
          <VisitorsByCountry />
        </div>

        {/* Section Export/Backup */}
        <div className="my-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Export/Backup
          </h3>
          <BackupButton onNotify={showNotification} />
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardContent;
