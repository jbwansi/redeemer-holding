import './bootstrap';
import React, { useEffect, useRef } from 'react';
import { createInertiaApp, router, usePage } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { Page, PageProps } from '@inertiajs/core';

import MainLayout from './components/layouts/main-layout';

// ─────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────
const IS_PROD = import.meta.env.PROD;
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1']);

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type LayoutFunction = (page: React.ReactNode) => React.ReactNode;

interface PageComponent extends Page<PageProps> {
  layout?: LayoutFunction;
  default: {
    layout?: LayoutFunction;
  };
}

interface SharedProps extends PageProps {
  auth: {
    user: {
      id: number;
      name: string;
      email: string;
    } | null;
  };
}

// ─────────────────────────────────────────────
// Auto Logout Component
// ─────────────────────────────────────────────
const AutoLogout = () => {
  const { auth } = usePage<SharedProps>().props;
  const page = usePage();

  // Vérifie si on est sur une page dashboard
  const isDashboardPage = page.component?.startsWith('backend/');

  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const isLocalHost = LOCAL_HOSTS.has(window.location.hostname);

    if (!IS_PROD) return;
    if (isLocalHost) return;
    if (!auth?.user) return;
    if (!isDashboardPage) return;

    const resetInactivityTimer = () => {
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
      }

      inactivityTimer.current = setTimeout(() => {
        router.post('/logout');
      }, INACTIVITY_TIMEOUT);
    };

    const activityEvents = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];

    activityEvents.forEach((e) => window.addEventListener(e, resetInactivityTimer));

    resetInactivityTimer();

    const handleClose = () => {
      if (!isDashboardPage || !auth?.user) return;

      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

      if (!csrfToken) return;

      const payload = new FormData();
      payload.append('_token', csrfToken);

      navigator.sendBeacon('/logout-on-close', payload);
    };

    window.addEventListener('pagehide', handleClose);

    return () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);

      activityEvents.forEach((e) => window.removeEventListener(e, resetInactivityTimer));

      window.removeEventListener('pagehide', handleClose);
    };
  }, [auth?.user, isDashboardPage]);

  return null;
};

// ─────────────────────────────────────────────
// Inertia App
// ─────────────────────────────────────────────
createInertiaApp({
  title: (title: string) =>
    `${title || 'Transformer des vies, une personne à la fois'} - Redeemer Holding`,

  resolve: (name: string) => {
    const pages = import.meta.glob<PageComponent>('./Pages/**/*.tsx');
    const backendPages = import.meta.glob<PageComponent>('./src/backend/**/*.tsx');

    const pagePromise = name.startsWith('backend/')
      ? resolvePageComponent<PageComponent>(`./src/${name}.tsx`, backendPages)
      : resolvePageComponent<PageComponent>(`./Pages/${name}.tsx`, pages);

    return pagePromise.then((page) => {
      if (page.default.layout) {
        return page;
      }

      const isDashboardPage = name.startsWith('backend/');

      if (isDashboardPage) {
        page.default.layout = (pageElement: React.ReactNode) => (
          <MainLayout>
            <AutoLogout />
            {pageElement}
          </MainLayout>
        );
      } else {
        page.default.layout = (pageElement: React.ReactNode) => <>{pageElement}</>;
      }

      return page;
    });
  },

  setup({ el, App, props }) {
    createRoot(el).render(<App {...props} />);
  },
});
