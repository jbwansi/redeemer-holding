import React, { useEffect } from 'react'
import Navbar from './navbar'
import { ThemeProvider } from '@/components/theme-provider'
import Footer from './footer'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { toast, Toaster } from 'sonner';
import { usePage } from '@inertiajs/react';

function FrontLayout({ children }: any) {

    const { flash } = usePage() as any;

    useEffect(() => {
        console.log(flash);

        // Gérer les messages de succès
        if (flash?.success) {
            toast.success(flash?.success)
        }

        // Gérer les messages d'erreur
        if (flash?.error) {
            toast.error(flash?.error)
        }

        // Gérer les messages d'erreur
        if (flash?.info) {
            toast.info(flash?.info)
        }
    }, [flash])

    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 1000 * 60 * 5,
                retry: 1,
            },
        },
    });

    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
                <Navbar />
                {children}
                <Toaster />
                <Footer />
            </ThemeProvider>
        </QueryClientProvider>
    )
}

export default FrontLayout
