import React, { Suspense, lazy, useEffect, useMemo } from 'react';
import Navbar from './navbar';
import { ThemeProvider } from '@/components/theme-provider';
import Footer from './footer';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { toast, Toaster } from 'sonner';
import { usePage } from '@inertiajs/react';
const VisitorChatbot = lazy(() => import('@/components/frontend/chatbot/visitor-chatbot'));

function FrontLayout({ children }: { children: React.ReactNode }) {
  const { flash, app } = usePage<{
    flash?: { success?: string; error?: string; info?: string };
    app?: { is_test_env?: boolean };
  }>();

  useEffect(() => {
    // Gérer les messages de succès
    if (flash?.success) {
      toast.success(flash?.success);
    }

    // Gérer les messages d'erreur
    if (flash?.error) {
      toast.error(flash?.error);
    }

    // Gérer les messages d'erreur
    if (flash?.info) {
      toast.info(flash?.info);
    }
  }, [flash]);

  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,
            retry: 1,
          },
        },
      }),
    []
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        {app?.is_test_env && (
          <div className="sticky top-0 z-[70] bg-amber-500 px-4 py-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-900">
            Environnement de test - Donnees non contractuelles
          </div>
        )}
        <Navbar />
        {children}
        <Toaster />
        <Suspense fallback={null}>
          <VisitorChatbot />
        </Suspense>
        <Footer />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default FrontLayout;
