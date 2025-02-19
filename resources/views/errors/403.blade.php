{{-- resources/views/errors/403.blade.php --}}
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Accès non autorisé</title>

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

    <!-- Scripts -->
    <script src="https://cdn.tailwindcss.com"></script>

    <style>
        .animate-float {
            animation: float 6s ease-in-out infinite;
        }

        @keyframes float {
            0% {
                transform: translateY(0px);
            }

            50% {
                transform: translateY(-20px);
            }

            100% {
                transform: translateY(0px);
            }
        }
    </style>
</head>

<body class="antialiased">
    <div class="relative min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <!-- Background pattern -->
        <div
            class="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]">
        </div>

        <div class="relative p-6 w-full max-w-4xl">
            <div class="text-center">
                <!-- Numéro d'erreur stylisé -->
                <h1
                    class="text-9xl font-bold bg-gradient-to-r from-red-500 via-red-400 to-red-500 text-transparent bg-clip-text select-none">
                    403
                </h1>

                <!-- Message principal -->
                <h2 class="mt-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                    {{ $exception->getMessage() ?: 'Accès non autorisé' }}
                </h2>

                <!-- Description -->
                <p class="mt-4 text-gray-500 dark:text-gray-400">
                    Désolé, vous n'avez pas les permissions nécessaires pour accéder à cette page.
                </p>

                <!-- Illustration -->
                <div class="mt-8 flex justify-center">
                    <div class="relative animate-float">
                        <svg class="w-48 h-48 text-red-500/20 dark:text-red-400/20" fill="currentColor"
                            viewBox="0 0 24 24">
                            <path
                                d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm-1-5h2v2h-2v-2zm0-8h2v6h-2V7z" />
                        </svg>
                        <div class="absolute inset-0 flex items-center justify-center">
                            <svg class="w-24 h-24 text-red-500 dark:text-red-400" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 15v2m0 0v2m0-2h2m-2 0H10m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <!-- Actions -->
                <div class="mt-12 flex items-center justify-center gap-4">
                    <a href="{{ url()->previous() }}"
                        class="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg font-semibold text-xs text-gray-700 dark:text-gray-300 uppercase tracking-widest shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition ease-in-out duration-150">
                        Retour
                    </a>
                    {{-- <a href="{{ route('home') }}"
                        class="inline-flex items-center px-4 py-2 bg-red-500 dark:bg-red-600 border border-transparent rounded-lg font-semibold text-xs text-white uppercase tracking-widest hover:bg-red-600 dark:hover:bg-red-700 focus:bg-red-600 dark:focus:bg-red-700 active:bg-red-700 dark:active:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition ease-in-out duration-150">
                        Retour à l'accueil
                    </a> --}}
                </div>

                <!-- Contact support -->
                <p class="mt-8 text-sm text-gray-500 dark:text-gray-400">
                    Si vous pensez qu'il s'agit d'une erreur, veuillez contacter le support
                    <a href="mailto:{{ get_setting('support_email') }}"
                        class="font-medium text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-500">
                        {{ get_setting('support_email') }}
                    </a>
                </p>
            </div>
        </div>
    </div>
</body>

</html>
