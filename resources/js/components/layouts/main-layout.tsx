import React, { PropsWithChildren, useEffect } from 'react'
import { SidebarProvider, SidebarTrigger } from '../ui/sidebar';
import { ThemeProvider } from 'next-themes';
import { toast, Toaster } from 'sonner';
import { usePage } from '@inertiajs/react';
import Breadcrumb from '../ui/breadcumb';
import Navbar from './dashboard/navbar';
import { AppSidebar } from './dashboard/app-sidebar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

interface MainLayoutProps extends PropsWithChildren {
    title?: string;
    pageTitle?: string;
}

interface Props {
    flash: {
        success?: string
        error?: string
    }
}

const MainLayout = ({ children, title }: MainLayoutProps) => {
    const { flash } = usePage() as any;
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 1000 * 60 * 5,
                retry: 1,
            },
        },
    });

    useEffect(() => {
        // Gérer les messages de succès
        if (flash?.success) {
            toast.success(flash?.success)
        }

        // Gérer les messages d'erreur
        if (flash?.error) {
            toast.error(flash?.error)
        }
    }, [flash])



    return (
        <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <SidebarProvider>
                <AppSidebar />
                <main className="w-full pb-24">
                    <Navbar title='' />
                    <div className="container mx-auto px-4 py-3">
                        <h1 className="text-xl font-bold mb-4">
                            {document.title.split(' - ')[0]}
                        </h1>
                        <Breadcrumb />
                        <div className="py-5">
                            {children}
                        </div>
                    </div>
                </main>
            </SidebarProvider>
            <Toaster />
        </ThemeProvider>
        </QueryClientProvider>
    )
}

export default MainLayout
