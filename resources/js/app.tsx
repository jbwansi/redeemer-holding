import "./bootstrap";
import React, { useEffect, useRef } from "react";
import { createInertiaApp, router, usePage } from "@inertiajs/react";
import { createRoot } from "react-dom/client";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import { Page, PageProps } from "@inertiajs/core";

import MainLayout from "./components/layouts/main-layout";

// ─────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────
const IS_PROD = import.meta.env.PROD;
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes

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
        if (!IS_PROD) return;
        if (!auth?.user) return;
        if (!isDashboardPage) return;

        const resetInactivityTimer = () => {
            if (inactivityTimer.current) {
                clearTimeout(inactivityTimer.current);
            }

            inactivityTimer.current = setTimeout(() => {
                router.post("/logout");
            }, INACTIVITY_TIMEOUT);
        };

        const activityEvents = ["mousemove", "keydown", "click", "scroll", "touchstart"];

        activityEvents.forEach((e) =>
            window.addEventListener(e, resetInactivityTimer)
        );

        resetInactivityTimer();

        const handleClose = () => {
            if (!isDashboardPage || !auth?.user) return;

            navigator.sendBeacon("/logout-on-close");
        };

        window.addEventListener("pagehide", handleClose);

        return () => {
            if (inactivityTimer.current) clearTimeout(inactivityTimer.current);

            activityEvents.forEach((e) =>
                window.removeEventListener(e, resetInactivityTimer)
            );

            window.removeEventListener("pagehide", handleClose);
        };
    }, [auth?.user, isDashboardPage]);

    return null;
};

// ─────────────────────────────────────────────
// Inertia App
// ─────────────────────────────────────────────
createInertiaApp({
    title: (title: string) =>
        `${title || "Transformer des vies, une personne à la fois"} - Redeemer Holding`,

    resolve: (name: string) =>
        resolvePageComponent<PageComponent>(
            `./src/${name}.tsx`,
            import.meta.glob<PageComponent>("./src/**/*.tsx")
        ).then((page) => {
            if (page.default.layout) {
                return page;
            }

            const isDashboardPage = name.startsWith("backend/");

            if (isDashboardPage) {
                page.default.layout = (pageElement: React.ReactNode) => (
                    <MainLayout>
                        <AutoLogout />
                        {pageElement}
                    </MainLayout>
                );
            } else {
                page.default.layout = (pageElement: React.ReactNode) => (
                    <>{pageElement}</>
                );
            }

            return page;
        }),

    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },
});