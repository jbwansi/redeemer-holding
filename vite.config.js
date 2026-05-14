import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import { imagetools } from 'vite-imagetools'

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            refresh: true,
        }),
        imagetools(),
    ],
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (!id.includes('node_modules')) {
                        return;
                    }

                    if (
                        id.includes('/node_modules/react/') ||
                        id.includes('/node_modules/react-dom/') ||
                        id.includes('/node_modules/scheduler/')
                    ) {
                        return 'vendor-react-core';
                    }

                    if (id.includes('@inertiajs')) {
                        return 'vendor-inertia';
                    }

                    if (id.includes('@tanstack/react-query')) {
                        return 'vendor-query';
                    }

                    if (id.includes('framer-motion')) {
                        return 'vendor-motion';
                    }

                    if (id.includes('recharts') || id.includes('d3-')) {
                        return 'vendor-charts';
                    }

                    if (id.includes('@radix-ui') || id.includes('cmdk')) {
                        return 'vendor-ui';
                    }

                    if (id.includes('quill') || id.includes('react-quill') || id.includes('react-quilljs') || id.includes('html-react-parser')) {
                        return 'vendor-editor';
                    }

                    if (id.includes('date-fns') || id.includes('lodash')) {
                        return 'vendor-utils';
                    }

                    if (id.includes('/node_modules/lucide-react/dist/esm/icons/')) {
                        const iconFile = id.split('/icons/')[1]?.replace('.js', '') ?? 'misc';
                        const bucket = iconFile[0]?.toLowerCase();

                        return bucket && bucket >= 'a' && bucket <= 'z'
                            ? `vendor-lucide-${bucket}`
                            : 'vendor-lucide-misc';
                    }

                    if (id.includes('/node_modules/lucide-react/')) {
                        return 'vendor-lucide-core';
                    }

                    const afterNodeModules = id.split('node_modules/')[1];
                    if (!afterNodeModules) {
                        return 'vendor-misc';
                    }

                    const parts = afterNodeModules.split('/');
                    const packageName = parts[0].startsWith('@')
                        ? `${parts[0]}-${parts[1] ?? 'pkg'}`
                        : parts[0];

                    return `vendor-${packageName.replace(/[@/]/g, '-')}`;
                },
            },
        },
    },
    resolve: {
        alias: {
            '@': '/resources/js',
        },
    },
});
