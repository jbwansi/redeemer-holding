import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { ChevronRight, Home } from 'lucide-react';
import { LABEL_MAPPING, ROUTE_MAPPING } from '@/lib/routes';

// Type pour un segment de breadcrumb
interface BreadcrumbSegment {
    label: string;
    path: string;
}


const Breadcrumb: React.FC = () => {
    const { url } = usePage();

    // Nettoyer l'URL des query params
    const cleanUrl: string = url.split('?')[0];

    // Diviser l'URL en segments
    const segments: string[] = cleanUrl.split('/').filter((segment: string): boolean => segment !== '');

    // Fonction pour obtenir le label d'un segment
    const getSegmentLabel = (segment: string, fullPath: string): string => {
        // Vérifier d'abord dans le mapping
        if (segment in LABEL_MAPPING) {
            return LABEL_MAPPING[segment];
        }

        // Si c'est un ID numérique, garder le format original
        if (/^\d+$/.test(segment)) {
            return `#${segment}`;
        }

        // Sinon, formater le segment
        return segment
            .split('-')
            .map((word: string): string => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    // Fonction pour obtenir l'URL d'un segment
    const getSegmentUrl = (segments: string[], index: number): string => {
        const path: string = segments.slice(0, index + 1).join('/');

        // Vérifier si une route nommée existe pour ce chemin
        if (path in ROUTE_MAPPING) {
            try {
                return route(ROUTE_MAPPING[path]);
            } catch (e) {
                console.warn(`Route "${ROUTE_MAPPING[path]}" non trouvée`);
                return '/' + path;
            }
        }

        // Sinon retourner le chemin simple
        return '/' + path;
    };

    // Construire les segments du breadcrumb
    const breadcrumbSegments: BreadcrumbSegment[] = segments.map((segment: string, index: number): BreadcrumbSegment => {
        const path: string = segments.slice(0, index + 1).join('/');
        return {
            label: getSegmentLabel(segment, path),
            path: getSegmentUrl(segments, index)
        };
    });

    return (
        <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300 mb-4">
            <Link
                href={route('dashboard')}
                className="flex items-center hover:text-gray-900 dark:hover:text-white"
            >
                <Home size={16} className="mr-1" />
                {LABEL_MAPPING['dashboard']}
            </Link>

            {breadcrumbSegments.map((segment: BreadcrumbSegment, index: number) => (
                <React.Fragment key={segment.path}>
                    <ChevronRight size={16} />
                    <Link
                        href={segment.path}
                        className={`hover:text-gray-900 dark:hover:text-white ${index === breadcrumbSegments.length - 1
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
