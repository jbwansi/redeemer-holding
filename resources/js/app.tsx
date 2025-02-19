import "./bootstrap"
import React from "react";
import { createInertiaApp } from '@inertiajs/react'
import { createRoot } from 'react-dom/client'
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers'
import { Page, PageProps } from '@inertiajs/core'
import MainLayout from "./components/layouts/main-layout";
import { ThemeProvider } from "./components/theme-provider";

// Type pour la fonction layout
type LayoutFunction = (page: React.ReactNode) => React.ReactNode;

// Type pour les composants de page
interface PageComponent extends Page<PageProps> {
    layout?: LayoutFunction;
    default: {
        layout?: LayoutFunction;
    };
}

createInertiaApp({
    title: (title: string) => `${title || "Tableau de bord"} - Redeemer Holding`,
    resolve: (name: string) => resolvePageComponent<PageComponent>(
        `./src/${name}.tsx`,
        import.meta.glob<PageComponent>('./src/**/*.tsx')
    ).then((page) => {
        // Vérifier si le composant a déjà défini son propre layout
        if (page.default.layout) {
            return page;
        }

        // Vérifier si la page fait partie du tableau de bord
        const isDashboardPage = name.startsWith('backend/');

        if (isDashboardPage) {
            // Appliquer le MainLayout uniquement aux pages du tableau de bord
            page.default.layout = (page: React.ReactNode) => (
                <MainLayout>
                    {page}
                </MainLayout>
            );
        } else {
            // Pour les autres pages, pas de layout par défaut
            page.default.layout = (page: React.ReactNode) => page;
        }

        return page;
    }),
    setup({ el, App, props }: {
        el: HTMLElement,
        App: React.ComponentType,
        props: Record<string, unknown>
    }) {
        createRoot(el).render(<App {...props} />)
    },
})
