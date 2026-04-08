<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $headline }}</title>
</head>

<body style="margin:0;background:#f4f6fb;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:24px;">
        <tr>
            <td align="center">
                <table role="presentation" width="640" cellspacing="0" cellpadding="0"
                    style="max-width:640px;background:#ffffff;border-radius:14px;overflow:hidden;">
                    <tr>
                        <td style="padding:36px 32px;background:linear-gradient(120deg,#0f172a,#1d4ed8);color:#ffffff;">
                            <div style="font-size:12px;letter-spacing:1px;opacity:.85;text-transform:uppercase;">
                                {{ $appName }} Newsletter
                            </div>
                            <h1 style="margin:12px 0 0 0;font-size:28px;line-height:1.3;">{{ $headline }}</h1>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:28px 32px 16px 32px;font-size:15px;line-height:1.7;color:#374151;">
                            {!! nl2br(e($contentText)) !!}
                        </td>
                    </tr>

                    @if(!empty($ctaText) && !empty($ctaUrl))
                    <tr>
                        <td style="padding:8px 32px 30px 32px;">
                            <a href="{{ $ctaUrl }}"
                                style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:10px;font-weight:600;">
                                {{ $ctaText }}
                            </a>
                        </td>
                    </tr>
                    @endif

                    <tr>
                        <td style="padding:20px 32px 28px 32px;border-top:1px solid #e5e7eb;font-size:12px;color:#6b7280;">
                            Cet email vous a ete envoye par {{ $appName }}.
                            @if(!empty($unsubscribeUrl))
                            <br>
                            <a href="{{ $unsubscribeUrl }}" style="color:#2563eb;text-decoration:underline;">Se desabonner</a>
                            @endif
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>

</html>
