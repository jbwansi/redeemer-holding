// Exemple d'utilisation dans ClientDashboard.tsx
import React from 'react';
import { usePage } from '@inertiajs/react';

import DashboardContent from './dashboard-content';
import DashboardLayout from '@/components/frontend/layouts/dashboard-layout';

// data recevied
// 'countCurrentTrainings' => $countCurrentTrainings,
// 'countUpGoingTrainings' => $countUpGoingTrainings,
// 'CountPastTrainings' => $CountPastTrainings,
// 'countCurrentEvents' => $countCurrentEvents,
// 'countUpGoingEvents' => $countUpGoingEvents,
// 'CountPastEvents' => $CountPastEvents,
interface ClientDashboardProps {
  countCurrentTrainings: number;
  countUpGoingTrainings: number;
  CountPastTrainings: number;
  countCurrentEvents: number;
  countUpGoingEvents: number;
  CountPastEvents: number;
}

const ClientDashboard = ({
  countCurrentEvents,
  countUpGoingEvents,
  CountPastEvents,
  countCurrentTrainings,
  countUpGoingTrainings,
  CountPastTrainings,
}: ClientDashboardProps) => {
  const { auth } = usePage().props as any;

  return (
    <DashboardLayout title="Tableau de bord" currentPage="dashboard">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Bienvenue sur votre tableau de bord
        </h1>
        <DashboardContent
          auth={auth}
          countCurrentEvents={countCurrentEvents}
          countUpGoingEvents={countUpGoingEvents}
          CountPastEvents={CountPastEvents}
          countCurrentTrainings={countCurrentTrainings}
          countUpGoingTrainings={countUpGoingTrainings}
          CountPastTrainings={CountPastTrainings}
        />
      </div>
    </DashboardLayout>
  );
};

export default ClientDashboard;
