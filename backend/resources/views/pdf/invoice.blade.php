<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Factura #{{ $order->id }} - Retro Games Store</title>
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        
        body {
            font-family: Arial, sans-serif;
            font-size: 14px;
            line-height: 1.4;
            color: #333;
        }
        
        .container {
            padding: 20px;
            max-width: 800px;
            margin: 0 auto;
        }
        
        .header {
            border-bottom: 3px solid #dc2626;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        
        .header-top {
            display: table;
            width: 100%;
        }
        
        .logo-section {
            display: table-cell;
            width: 50%;
            vertical-align: top;
        }
        
        .invoice-info {
            display: table-cell;
            width: 50%;
            text-align: right;
            vertical-align: top;
        }
        
        .logo {
            font-size: 28px;
            font-weight: bold;
            color: #dc2626;
            margin-bottom: 5px;
        }
        
        .company-info {
            font-size: 12px;
            color: #666;
            line-height: 1.3;
        }
        
        .invoice-number {
            font-size: 24px;
            font-weight: bold;
            color: #111;
            margin-bottom: 5px;
        }
        
        .invoice-date {
            font-size: 14px;
            color: #666;
        }
        
        .section {
            margin-bottom: 30px;
        }
        
        .section-title {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 15px;
            color: #111;
            border-bottom: 1px solid #e5e5e5;
            padding-bottom: 5px;
        }
        
        .billing-shipping {
            display: table;
            width: 100%;
        }
        
        .billing-section, .shipping-section {
            display: table-cell;
            width: 48%;
            vertical-align: top;
        }
        
        .billing-section {
            padding-right: 20px;
        }
        
        .address-box {
            background-color: #f9f9f9;
            padding: 15px;
            border-radius: 5px;
            font-size: 13px;
        }
        
        .address-box strong {
            display: block;
            margin-bottom: 5px;
            color: #111;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        
        th {
            background-color: #1f2937;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: normal;
            font-size: 13px;
        }
        
        td {
            padding: 12px;
            border-bottom: 1px solid #e5e5e5;
            font-size: 13px;
        }
        
        tr:last-child td {
            border-bottom: none;
        }
        
        .text-right {
            text-align: right;
        }
        
        .text-center {
            text-align: center;
        }
        
        .totals-section {
            margin-top: 30px;
            text-align: right;
        }
        
        .totals-table {
            display: inline-block;
            min-width: 300px;
        }
        
        .totals-row {
            display: table;
            width: 100%;
            margin-bottom: 8px;
        }
        
        .totals-label {
            display: table-cell;
            padding-right: 20px;
            text-align: right;
            font-size: 14px;
        }
        
        .totals-value {
            display: table-cell;
            text-align: right;
            font-size: 14px;
            min-width: 100px;
        }
        
        .totals-row.total {
            font-weight: bold;
            font-size: 18px;
            border-top: 2px solid #1f2937;
            padding-top: 10px;
            margin-top: 10px;
        }
        
        .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #e5e5e5;
            text-align: center;
            font-size: 12px;
            color: #666;
        }
        
        .payment-info {
            background-color: #e0f2fe;
            padding: 15px;
            border-radius: 5px;
            margin-top: 20px;
        }
        
        .payment-info strong {
            color: #0369a1;
        }
        
        @page {
            margin: 0.5cm;
        }
        
        .page-break {
            page-break-after: always;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="header-top">
                <div class="logo-section">
                    <div class="logo"><img src="{{ public_path('storage/logo-rojo.png') }}" alt="Logo Retro Time"></div>
                    <div class="company-info">
                        Tu tienda de juegos retro de confianza<br>
                        CIF: B12345678<br>
                        Calle Ejemplo 123, 28001 Madrid<br>
                        Tel: +34 900 123 456<br>
                        Email: info@retrogamesstore.com
                    </div>
                </div>
                <div class="invoice-info">
                    <div class="invoice-number">FACTURA #{{ str_pad($order->id, 6, '0', STR_PAD_LEFT) }}</div>
                    <div class="invoice-date">
                        Fecha: {{ $order->created_at->format('d/m/Y') }}<br>
                        Hora: {{ $order->created_at->format('H:i') }}
                    </div>
                </div>
            </div>
        </div>

        <!-- Billing and Shipping -->
        <div class="section">
            <div class="billing-shipping">
                <div class="billing-section">
                    <h3 class="section-title">Datos de Facturación</h3>
                    <div class="address-box">
                        <strong>{{ $order->user->name }}</strong>
                        {{ $order->user->email }}<br>
                        @if($order->user->phone)
                            Tel: {{ $order->user->phone }}<br>
                        @endif
                        @if($order->user->address)
                            {{ $order->user->address }}<br>
                            {{ $order->user->city }}, {{ $order->user->postal_code }}<br>
                            {{ $order->user->country }}
                        @endif
                    </div>
                </div>
                
                @php
                    $shippingAddress = is_string($order->shipping_address) 
                        ? json_decode($order->shipping_address, true) 
                        : $order->shipping_address;
                @endphp
                
                <div class="shipping-section">
                    <h3 class="section-title">Dirección de Envío</h3>
                    <div class="address-box">
                        @if($shippingAddress)
                            <strong>{{ $order->user->name }}</strong>
                            {{ $shippingAddress['address'] ?? '' }}<br>
                            {{ $shippingAddress['city'] ?? '' }}, {{ $shippingAddress['postal_code'] ?? $shippingAddress['postalCode'] ?? '' }}<br>
                            {{ $shippingAddress['country'] ?? '' }}<br>
                            @if(isset($shippingAddress['phone']))
                                Tel: {{ $shippingAddress['phone'] }}
                            @endif
                        @else
                            <em>Sin dirección de envío</em>
                        @endif
                    </div>
                </div>
            </div>
        </div>

        <!-- Products -->
        <div class="section">
            <h3 class="section-title">Productos</h3>
            <table>
                <thead>
                    <tr>
                        <th style="width: 50%">Producto</th>
                        <th class="text-center" style="width: 15%">Cantidad</th>
                        <th class="text-right" style="width: 17.5%">Precio Unit.</th>
                        <th class="text-right" style="width: 17.5%">Total</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($order->items as $item)
                    <tr>
                        <td>
                            <strong>{{ $item->game->name }}</strong><br>
                            <small style="color: #666;">{{ $item->game->console->name }}</small>
                        </td>
                        <td class="text-center">{{ $item->quantity }}</td>
                        <td class="text-right">{{ number_format($item->price, 2) }} €</td>
                        <td class="text-right">{{ number_format($item->price * $item->quantity, 2) }} €</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>

        <!-- Totals -->
        <div class="totals-section">
            <div class="totals-table">
                <div class="totals-row">
                    <div class="totals-label">Subtotal:</div>
                    <div class="totals-value">{{ number_format($order->total, 2) }} €</div>
                </div>
                <div class="totals-row">
                    <div class="totals-label">Gastos de envío:</div>
                    <div class="totals-value">0.00 €</div>
                </div>
                <div class="totals-row">
                    <div class="totals-label">IVA (21%):</div>
                    <div class="totals-value">{{ number_format($order->total * 0.21, 2) }} €</div>
                </div>
                <div class="totals-row total">
                    <div class="totals-label">TOTAL:</div>
                    <div class="totals-value">{{ number_format($order->total * 1.21, 2) }} €</div>
                </div>
            </div>
        </div>

        <!-- Payment Info -->
        <div class="payment-info">
            <strong>Información de Pago</strong><br>
            Método de pago: <strong>{{ ucfirst($order->payment_method) }}</strong><br>
            @if($order->payment_id)
                ID de transacción: {{ $order->payment_id }}<br>
            @endif
            Estado del pago: <strong>{{ $order->status == 'completed' ? 'Pagado' : 'Pendiente' }}</strong>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>
                <strong>¡Gracias por tu compra!</strong><br>
                Esta factura ha sido generada automáticamente y es válida sin firma.<br>
                Para cualquier consulta, contacta con nosotros en info@retrogamesstore.com
            </p>
        </div>
    </div>
</body>
</html>