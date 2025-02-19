<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">

    <!-- SEO -->
    <meta name="description" content="{{ config('app.description', 'Description de votre application') }}">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <!-- Performance -->
    <link rel="dns-prefetch" href="//fonts.gstatic.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="shortcut icon" href="{{ asset(" assets/images/favicon.png") }}" type="image/png">

    <!-- PWA -->
    <meta name="theme-color" content="#ffffff">
    <link rel="manifest" href="/manifest.json">
    <link rel="apple-touch-icon" href="/icon-192x192.png">

    @routes()
    <!-- Vite avec preloading -->
    @vite(['resources/js/app.tsx', 'resources/css/app.css'])

    <!-- Inertia -->
    @inertiaHead
</head>

<body class="font-sans antialiased">
    @inertia

    <!-- Noscript fallback -->
    <noscript>
        <div class="flex items-center justify-center min-h-screen text-center">
            <p>JavaScript est requis pour utiliser cette application.</p>
        </div>
    </noscript>
</body>

</html>
