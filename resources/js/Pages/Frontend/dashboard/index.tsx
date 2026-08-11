import React from 'react';
import { usePage } from '@inertiajs/react';
import DashboardContent from './dashboard-content';
import DashboardLayout from '@/components/frontend/layouts/dashboard-layout';

interface ClientDashboardProps {
  countCurrentTrainings: number;
  countUpGoingTrainings: number;
  CountPastTrainings: number;
  countCurrentEvents: number;
  countUpGoingEvents: number;
  CountPastEvents: number;
}

interface DashboardPageProps {
  auth: { user: { name: string; role: string } };
  [key: string]: unknown;
}

const ClientDashboard = (props: ClientDashboardProps) => {
  const { auth } = usePage<DashboardPageProps>().props;

  return (
    <DashboardLayout title="Tableau de bord" currentPage="dashboard">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
          Bienvenue sur votre tableau de bord
        </h1>
        <DashboardContent auth={auth} {...props} />
      </div>
    </DashboardLayout>
  );
};

export default ClientDashboard;
