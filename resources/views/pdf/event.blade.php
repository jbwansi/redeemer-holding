<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Facture {{ $invoice_number }}</title>
    <style>
        body {
            font-family: 'DejaVu Sans', sans-serif;
            margin: 0;
            padding: 0;
            line-height: 1.4;
            color: #1a1a1a;
            font-size: 14px;
        }

        .invoice-header {
            background: #f8fafc;
            border-bottom: 1px solid #e2e8f0;
            padding: 20px;
            position: relative;
            height: 60px;
        }

        .logo {
            position: absolute;
            top: 20px;
            left: 20px;
            height: 90px;
            width: auto;
        }

        .invoice-title {
            position: absolute;
            right: 20px;
            top: 20px;
            text-align: right;
        }

        .invoice-title h1 {
            margin: 0;
            font-size: 24px;
            color: #1e293b;
        }

        .invoice-title .ref {
            color: #64748b;
            font-size: 13px;
            margin-top: 4px;
        }

        .container {
            padding: 20px;
        }

        .two-columns {
            display: table;
            width: 100%;
            margin-bottom: 20px;
        }

        .column {
            display: table-cell;
            width: 50%;
            vertical-align: top;
            padding: 10px;
        }

        .section-title {
            color: #dc2626;
            font-size: 15px;
            font-weight: bold;
            margin: 0 0 8px 0;
            padding-bottom: 4px;
            border-bottom: 1px solid #fecaca;
        }

        .details-content {
            color: #475569;
            line-height: 1.4;
        }

        .event-details {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 4px;
            padding: 10px;
            margin-bottom: 20px;
        }

        .event-details h3 {
            margin: 0 0 8px 0;
            font-size: 15px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
        }

        th {
            background-color: #f1f5f9;
            text-align: left;
            padding: 8px;
            font-size: 13px;
            border-bottom: 1px solid #e2e8f0;
        }

        td {
            padding: 8px;
            font-size: 13px;
            border-bottom: 1px solid #e2e8f0;
        }

        .totals {
            width: 250px;
            float: right;
            margin-top: 10px;
        }

        .totals table {
            margin: 0;
        }

        .totals table td {
            padding: 4px 8px;
        }

        .totals table tr.total {
            font-weight: bold;
            border-top: 1px solid #e2e8f0;
        }

        .status-paid {
            position: absolute;
            top: 120px;
            right: 30px;
            transform: rotate(-15deg);
            border: 2px solid #22c55e;
            color: #16a34a;
            padding: 6px 12px;
            font-size: 16px;
            font-weight: bold;
            border-radius: 4px;
            text-transform: uppercase;
            background: rgba(34, 197, 94, 0.1);
        }

        .footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            padding: 15px;
            font-size: 11px;
            text-align: center;
            color: #64748b;
            border-top: 1px solid #e2e8f0;
        }

        .footer-content {
            display: table;
            width: 100%;
            max-width: 800px;
            margin: 0 auto;
        }

        .footer-section {
            display: table-cell;
            width: 33.33%;
            text-align: center;
            vertical-align: top;
            font-size: 11px;
            line-height: 1.3;
        }

        .footer-title {
            font-weight: bold;
            color: #475569;
            margin-bottom: 2px;
        }
    </style>
</head>
<body>
    <div class="invoice-header">
        <img src="{{ public_path('assets/images/logo.png') }}" class="logo" alt="Redeemer Holding">
        <div class="invoice-title">
            <h1>FACTURE</h1>
            <div class="ref">#{{ $invoice_number }}</div>
        </div>
    </div>

    <div class="status-paid">PAYÉ</div>

    <div class="container">
        <div class="two-columns">
            <div class="column">
                <div class="section-title">REDEEMER HOLDING</div>
                <div class="details-content">
                    Avenue Jean-Marie-Musy 5<br>
                    1700 Fribourg<br>
                    Suisse<br>
                    Tél: +41 76 582 11 09<br>
                    Email: jb.wansi@redeemerholding.com
                </div>
            </div>
            <div class="column">
                <div class="section-title">INFORMATIONS CLIENT</div>
                <div class="details-content">
                    <strong>{{ $registration->name }}</strong><br>
                    {{ $registration->email }}<br>
                    @if($registration->phone)
                        {{ $registration->phone }}<br>
                    @endif
                    Date: {{ \Carbon\Carbon::parse($date)->format('d/m/Y') }}<br>
                    Réf: {{ $registration->reference }}<br>
                    Paiement: Carte bancaire
                </div>
            </div>
        </div>

        <div class="event-details">
            <h3>{{ $event->title }}</h3>
            <div class="details-content">
                <strong>Date:</strong> {{ \Carbon\Carbon::parse($event->start_date)->format('d/m/Y H:i') }} -
                {{ \Carbon\Carbon::parse($event->end_date)->format('d/m/Y H:i') }}<br>
                <strong>Lieu:</strong> {{ $event->location }}
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th>Description</th>
                    <th>Quantité</th>
                    <th>Prix unitaire</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Billet - {{ $event->title }}</td>
                    <td>{{ $registration->qty }}</td>
                    <td>{{ number_format($event->price, 2, '.', "'") }} CHF</td>
                    <td>{{ number_format($subtotal, 2, '.', "'") }} CHF</td>
                </tr>
                <tr>
                    <td>Frais de service (5%)</td>
                    <td>1</td>
                    <td>{{ number_format($serviceFee, 2, '.', "'") }} CHF</td>
                    <td>{{ number_format($serviceFee, 2, '.', "'") }} CHF</td>
                </tr>
            </tbody>
        </table>

        <div class="totals">
            <table>
                <tr>
                    <td>Sous-total</td>
                    <td align="right">{{ number_format($subtotal, 2, '.', "'") }} CHF</td>
                </tr>
                <tr>
                    <td>Frais de service</td>
                    <td align="right">{{ number_format($serviceFee, 2, '.', "'") }} CHF</td>
                </tr>
                <tr class="total">
                    <td>Total</td>
                    <td align="right">{{ number_format($total, 2, '.', "'") }} CHF</td>
                </tr>
            </table>
        </div>
    </div>

    <div class="footer">
        <div class="footer-content">
            <div class="footer-section">
                <div class="footer-title">Email</div>
                jb.wansi@redeemerholding.com<br>
                Réponse sous 24h ouvrées
            </div>
            <div class="footer-section">
                <div class="footer-title">Téléphone</div>
                +41 76 582 11 09<br>
                Lun-Ven, 9h-18h
            </div>
            <div class="footer-section">
                <div class="footer-title">Adresse</div>
                Avenue Jean-Marie-Musy 5, 1700 Fribourg<br>
                Suisse
            </div>
        </div>
    </div>
</body>
</html>
