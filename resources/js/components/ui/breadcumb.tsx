import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { ChevronRight, Home } from 'lucide-react';
import { LABEL_MAPPING, ROUTE_MAPPING } from '@/lib/routes';

interface BreadcrumbSegment {
    label: string;
    path: string;
}

const Breadcrumb: React.FC = () => {
    const { url } = usePage();

    // Nettoyer l'URL et retirer le trailing slash
    const cleanUrl = url.split('?')[0].replace(/\/$/, '');

    // Créer un tableau de segments uniquement avec les parties valides
    const segments = cleanUrl.split('/').filter(segment => segment.length > 0);

    // Fonction pour vérifier si une route existe
    const routeExists = (routeName: string): boolean => {
        try {
            route(routeName);
            return true;
        } catch {
            return false;
        }
    };

    // Fonction pour obtenir le label d'un segment
    const getSegmentLabel = (segment: string): string => {
        // Vérifier d'abord dans le mapping
        const mappedLabel = LABEL_MAPPING[segment];
        if (mappedLabel) {
            return mappedLabel;
        }

        // Si c'est un ID numérique
        if (/^\d+$/.test(segment)) {
            return `#${segment}`;
        }

        // Formater le segment en titre
        return segment
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    };

    // Fonction pour obtenir l'URL d'un segment
    const getSegmentUrl = (currentSegments: string[]): string => {
        const path = currentSegments.join('/');

        // Vérifier si une route nommée existe pour ce chemin
        const routeName = ROUTE_MAPPING[path];
        if (routeName && routeExists(routeName)) {
            return route(routeName);
        }

        // Fallback sur le chemin direct
        return '/' + path;
    };

    // Construire les segments du breadcrumb
    const breadcrumbSegments: BreadcrumbSegment[] = segments.reduce((acc: BreadcrumbSegment[], segment: string, index: number) => {
        const currentSegments = segments.slice(0, index + 1);
        const path = getSegmentUrl(currentSegments);

        // Ne pas ajouter les segments qui correspondent à des routes invalides
        if (path) {
            acc.push({
                label: getSegmentLabel(segment),
                path: path
            });
        }

        return acc;
    }, []);

    // Si aucun segment valide n'est trouvé, retourner uniquement le dashboard
    if (breadcrumbSegments.length === 0) {
        return (
            <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300 mb-4">
                <Link
                    href={route('dashboard')}
                    className="flex items-center hover:text-gray-900 dark:hover:text-white"
                >
                    <Home size={16} className="mr-1" />
                    {LABEL_MAPPING['dashboard']}
                </Link>
            </nav>
        );
    }

    return (
        <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300 mb-4">
            <Link
                href={route('dashboard')}
                className="flex items-center hover:text-gray-900 dark:hover:text-white"
            >
                <Home size={16} className="mr-1" />
                {LABEL_MAPPING['dashboard']}
            </Link>

            {breadcrumbSegments.map((segment, index) => (
                <React.Fragment key={`${segment.path}-${index}`}>
                    <ChevronRight size={16} />
                    <Link
                        href={segment.path}
                        className={`hover:text-gray-900 dark:hover:text-white ${
                            index === breadcrumbSegments.length - 1
                                ? 'font-semibold text-gray-900 dark:text-white'
                                : ''
                        }`}
                    >
                        {segment.label}
                    </Link>
                </React.Fragment>
            ))}
        </nav>
    );
};

export default Breadcrumb;
