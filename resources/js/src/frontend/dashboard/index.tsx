// Exemple d'utilisation dans ClientDashboard.tsx
import React, { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import {
    Calendar,
    GraduationCap,
    User,
    Home
} from 'lucide-react';

import DashboardContent from './dashboard-content';
import { route } from 'ziggy-js';
import DashboardLayout from '@/components/frontend/layouts/dashboard-layout';


// data recevied
// 'countCurrentFormations' => $countCurrentFormations,
// 'countUpGoingFormations' => $countUpGoingFormations,
// 'CountPastFormations' => $CountPastFormations,
// 'countCurrentEvents' => $countCurrentEvents,
// 'countUpGoingEvents' => $countUpGoingEvents,
// 'CountPastEvents' => $CountPastEvents,
interface ClientDashboardProps {

    countCurrentFormations: number;
    countUpGoingFormations: number;
    CountPastFormations: number;
    countCurrentEvents: number;
    countUpGoingEvents: number;
    CountPastEvents: number;
}

const ClientDashboard = ({ countCurrentEvents, countUpGoingEvents, CountPastEvents, countCurrentFormations, countUpGoingFormations, CountPastFormations }: ClientDashboardProps) => {
    const { auth } = usePage().props as any


    return (

        <DashboardLayout title="Tableau de bord" currentPage="dashboard">


            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Bienvenue sur votre tableau de bord
                </h1>
                <DashboardContent auth={auth} countCurrentEvents={countCurrentEvents} countUpGoingEvents={countUpGoingEvents} CountPastEvents={CountPastEvents} countCurrentFormations={countCurrentFormations} countUpGoingFormations={countUpGoingFormations} CountPastFormations={CountPastFormations} />
            </div>


        </DashboardLayout>


    );
};

export default ClientDashboard;