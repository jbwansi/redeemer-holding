<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>

    <!-- Encodage et responsive -->
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">

    @php
        $seo         = $page['props']['seo'] ?? [];
        $seoTitle    = $seo['title']          ?? config('app.name');
        $seoDesc     = $seo['description']    ?? '';
        $seoOgTitle  = $seo['og_title']       ?? $seoTitle;
        $seoOgDesc   = $seo['og_description'] ?? $seoDesc;
        $seoOgImage  = $seo['og_image']       ?? asset('assets/images/logo.png');
        $seoOgType   = $seo['og_type']        ?? 'website';
        $seoCanon    = $seo['canonical']      ?? url()->current();
        $seoRobots   = $seo['robots']         ?? 'index, follow';
        $seoSchema   = $seo['schema']         ?? null;
    @endphp

    <!-- Balises Title et Meta description -->
    <title>{{ $seoTitle }}</title>
    <meta name="description" content="{{ $seoDesc }}">

    <!-- Meta tags SEO supplémentaires -->
    <meta name="author" content="{{ config('app.name') }}">
    <meta name="keywords" content="transformation personnelle, développement personnel, coaching valeurs, épanouissement, potentiel, bien-être">
    <meta name="robots" content="{{ $seoRobots }}">
    <meta name="googlebot" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
    <meta property="og:type" content="{{ $seoOgType }}">
    <meta property="og:site_name" content="{{ config('app.name') }}">
    <meta property="og:locale" content="fr_CH">
    <meta property="og:title" content="{{ $seoOgTitle }}">
    <meta property="og:description" content="{{ $seoOgDesc }}">
    <meta property="og:image" content="{{ $seoOgImage }}">
    <meta property="og:url" content="{{ $seoCanon }}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{{ $seoOgTitle }}">
    <meta name="twitter:description" content="{{ $seoOgDesc }}">
    <meta name="twitter:image" content="{{ $seoOgImage }}">

    <!-- Sécurité et Performance -->
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <link rel="canonical" href="{{ $seoCanon }}">
    <link rel="sitemap" type="application/xml" title="Sitemap" href="{{ route('sitemap') }}">
    <link rel="sitemap" type="application/xml" title="Sitemap Index" href="{{ route('sitemap.index') }}">

    <!-- Favicons -->
    <link rel="icon" type="image/png" sizes="32x32" href="{{ asset('assets/images/logo.png') }}">
    <link rel="icon" type="image/png" sizes="16x16" href="{{ asset('assets/images/logo.png') }}">
    <link rel="apple-touch-icon" sizes="180x180" href="{{ asset('assets/images/logo.png') }}">

    <!-- PWA -->
    <meta name="theme-color" content="#ffffff">
    <meta name="application-name" content="{{ config('app.name') }}">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="default">
    {{-- <link rel="manifest" href="/manifest.json"> --}}

    <!-- Vite et Inertia -->
    @routes()
    @vite(['resources/js/app.tsx', 'resources/css/app.css'])
    @inertiaHead

    <!-- Schema.org -->
    <script type="application/ld+json">
    @if($seoSchema)
    {!! json_encode($seoSchema, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT) !!}
    @else
    {
        "@@context": "https://schema.org",
        "@type": "WebSite",
        "name": "{{ config('app.name') }}",
        "url": "{{ url('/') }}"
    }
    @endif
    </script>
</head>

<body class="font-sans antialiased">
    <!-- Main content -->
    @inertia

    <!-- Informations pour les visiteurs sans JavaScript -->
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
