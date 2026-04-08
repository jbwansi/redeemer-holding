<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Maintenance en cours</title>
    <style>
        :root {
            color-scheme: light;
        }

        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            min-height: 100vh;
            display: grid;
            place-items: center;
            font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
            background: radial-gradient(circle at top left, #f7d8d7 0%, #f7fafc 38%, #eef2ff 100%);
            color: #0f172a;
            padding: 24px;
        }

        .card {
            width: min(680px, 100%);
            background: rgba(255, 255, 255, 0.94);
            border: 1px solid rgba(148, 163, 184, 0.28);
            border-radius: 22px;
            box-shadow: 0 18px 60px rgba(15, 23, 42, 0.12);
            padding: 36px;
        }

        .badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: #b91c1c;
            background: rgba(220, 38, 38, 0.1);
            border: 1px solid rgba(220, 38, 38, 0.2);
            border-radius: 999px;
            padding: 8px 12px;
        }

        h1 {
            margin: 18px 0 12px;
            font-size: clamp(28px, 3vw, 38px);
            line-height: 1.1;
        }

        p {
            margin: 0;
            color: #334155;
            font-size: 16px;
            line-height: 1.6;
        }

        .meta {
            margin-top: 22px;
            border-top: 1px solid #e2e8f0;
            padding-top: 14px;
            color: #64748b;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <main class="card">
        <span class="badge">Maintenance</span>
        <h1>Le site est temporairement indisponible.</h1>
        <p>{{ $message }}</p>

        @if(!empty($endDate))
            <p class="meta">Fin estimee: {{ $endDate }}</p>
        @endif
    </main>
</body>
</html>
