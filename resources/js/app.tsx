import "./bootstrap"
import React, { useEffect, useRef } from "react";
import { createInertiaApp } from '@inertiajs/react'
import { createRoot } from 'react-dom/client'
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers'
import { Page, PageProps } from '@inertiajs/core'
import { router } from '@inertiajs/react'
import MainLayout from "./components/layouts/main-layout";
import { ThemeProvider } from "./components/theme-provider";

// ─────────────────────────────────────────────
//  Config
// ─────────────────────────────────────────────
const IS_PROD = import.meta.env.PROD;
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes

// ─────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────
type LayoutFunction = (page: React.ReactNode) => React.ReactNode;

interface PageComponent extends Page<PageProps> {
    layout?: LayoutFunction;
    default: {
        layout?: LayoutFunction;
    };
}

// ─────────────────────────────────────────────
//  Composant AutoLogout (prod uniquement)
// ─────────────────────────────────────────────
const AutoLogout = () => {
    const inactivityTimer = useRef<ReturnType<typeof setTimeout>>();

    useEffect(() => {
        if (!IS_PROD) return; // ← rien en localhost

        // ── 1. Logout après inactivité ──────────────────
        const resetInactivityTimer = () => {
            clearTimeout(inactivityTimer.current);
            inactivityTimer.current = setTimeout(() => {
                router.post('/logout');
            }, INACTIVITY_TIMEOUT);
        };

        const activityEvents = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
        activityEvents.forEach(e => window.addEventListener(e, resetInactivityTimer));
        resetInactivityTimer();

        // ── 2. Logout quand l'utilisateur quitte le site ─
        let beaconSent = false;

        const handleClose = () => {
            if (beaconSent) return;
            beaconSent = true;

            navigator.sendBeacon('/logout-on-close');
        };

        window.addEventListener('pagehide', handleClose);

        // ── Nettoyage ────────────────────────────────────
        return () => {
            clearTimeout(inactivityTimer.current);
            activityEvents.forEach(e => window.removeEventListener(e, resetInactivityTimer));
            window.removeEventListener('pagehide', handleClose);
            window.removeEventListener('beforeunload', handleClose);
        };
    }, []);

    return null;
};

// ─────────────────────────────────────────────
//  Inertia App
// ─────────────────────────────────────────────
createInertiaApp({
    title: (title: string) => `${title || "Transformer des vies, une personne à la fois"} - Redeemer Holding`,

    resolve: (name: string) => resolvePageComponent<PageComponent>(
        `./src/${name}.tsx`,
        import.meta.glob<PageComponent>('./src/**/*.tsx')
    ).then((page) => {
        if (page.default.layout) return page;

        const isDashboardPage = name.startsWith('backend/');

        if (isDashboardPage) {
            page.default.layout = (page: React.ReactNode) => (
                <MainLayout>
                    {page}
                </MainLayout>
            );
        } else {
            page.default.layout = (page: React.ReactNode) => page;
        }

        return page;
    }),

    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <>
                <AutoLogout />
                <App {...props} />
            </>
        );
    },
});
