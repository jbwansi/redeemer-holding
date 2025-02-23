<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <!-- Encodage et responsive -->
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">

    <!-- Balises Title et Meta description optimisées -->
    <title>{{ config('app.name') }} - Transformation personnelle par les valeurs</title>
    <meta name="description" content="{{ config('app.description', 'Découvrez votre véritable potentiel et vivez une vie épanouie grâce à la transformation par les valeurs. Coaching personnalisé pour votre développement personnel.') }}">

    <!-- Meta tags SEO supplémentaires -->
    <meta name="author" content="Acatech">
    <meta name="keywords" content="transformation personnelle, développement personnel, coaching valeurs, épanouissement, potentiel, bien-être">
    <meta name="robots" content="index, follow">
    <meta property="og:type" content="website">
    <meta property="og:title" content="{{ config('app.name') }} - Transformation personnelle par les valeurs">
    <meta property="og:description" content="{{ config('app.description') }}">
    <meta property="og:image" content="{{ asset('assets/images/og-image.jpg') }}">
    <meta property="og:url" content="{{ url()->current() }}">
    <meta name="twitter:card" content="summary_large_image">

    <!-- Sécurité et Performance -->
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <link rel="canonical" href="{{ url()->current() }}">
    <link rel="dns-prefetch" href="//fonts.gstatic.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

    <!-- Favicons -->
    <link rel="icon" type="image/png" sizes="32x32" href="{{ asset('assets/images/favicon-32x32.png') }}">
    <link rel="icon" type="image/png" sizes="16x16" href="{{ asset('assets/images/favicon-16x16.png') }}">
    <link rel="apple-touch-icon" sizes="180x180" href="{{ asset('assets/images/apple-touch-icon.png') }}">

    <!-- PWA -->
    <meta name="theme-color" content="#ffffff">
    <meta name="application-name" content="{{ config('app.name') }}">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="default">
    <link rel="manifest" href="/manifest.json">

    <!-- Vite et Inertia -->
    @routes()
    @vite(['resources/js/app.tsx', 'resources/css/app.css'])
    @inertiaHead

    <!-- Schema.org -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "{{ config('app.name') }}",
        "description": "Découvrez votre véritable potentiel et vivez une vie épanouie grâce à la transformation par les valeurs. Coaching personnalisé pour votre développement personnel.",
        "url": "{{ url('/') }}"
    }
    </script>
</head>

<body class="font-sans antialiased">
    <!-- Main content -->
    @inertia

    <!-- Noscript avec plus d'informations -->
    <noscript>
        <div class="flex items-center justify-center min-h-screen text-center p-4">
            <div>
                <h1 class="text-xl font-bold mb-4">JavaScript est désactivé</h1>
                <p>Pour une expérience optimale, veuillez activer JavaScript dans votre navigateur.</p>
            </div>
        </div>
    </noscript>
</body>
</html>
