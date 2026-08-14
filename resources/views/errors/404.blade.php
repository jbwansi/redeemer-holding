<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex, follow">
    <title>Page non trouvée</title>
    <style>
        :root { color-scheme: dark; }
        * { box-sizing: border-box; }
        body { margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 24px; background: radial-gradient(circle at top, #162542 0, #071224 48%, #030712 100%); color: #f8fafc; font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
        main { width: min(680px, 100%); padding: clamp(28px, 6vw, 56px); text-align: center; border: 1px solid rgba(255, 255, 255, .1); border-radius: 28px; background: rgba(8, 20, 39, .88); box-shadow: 0 24px 80px rgba(0, 0, 0, .38); }
        .brand { margin: 0 0 28px; color: #da2e29; font-size: 14px; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; }
        .code { margin: 0; color: #da2e29; font-size: clamp(72px, 20vw, 132px); font-weight: 900; line-height: .85; }
        h1 { margin: 26px 0 0; font-size: clamp(28px, 6vw, 42px); }
        p { margin: 16px auto 0; max-width: 520px; color: #cbd5e1; line-height: 1.7; }
        .actions { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; margin-top: 32px; }
        a { min-height: 44px; display: inline-flex; align-items: center; justify-content: center; padding: 11px 18px; border-radius: 12px; color: white; font-weight: 750; text-decoration: none; }
        .primary { background: #da2e29; }
        .primary:hover { background: #bd2622; }
        .secondary { border: 1px solid #475569; background: #10213c; }
        .secondary:hover { background: #162b4c; }
        .support { margin-top: 30px; font-size: 14px; }
        .support a { min-height: 0; padding: 0; color: #ff8d8a; }
    </style>
</head>
<body>
    <main>
        <p class="brand">Redeemer Holding · Transformer par les valeurs</p>
        <p class="code" aria-label="Erreur 404">404</p>
        <h1>Page non trouvée</h1>
        <p>La page demandée n’existe pas ou a été déplacée. Vous pouvez revenir à l’accueil ou à la page précédente.</p>
        <div class="actions">
            <a class="primary" href="{{ route('home') }}">Retour à l’accueil</a>
            <a class="secondary" href="{{ url()->previous() }}">Page précédente</a>
        </div>
        @if (get_setting('support_email'))
            <p class="support">Besoin d’aide ? <a href="mailto:{{ get_setting('support_email') }}">Contacter le support</a></p>
        @endif
    </main>
</body>
</html>
