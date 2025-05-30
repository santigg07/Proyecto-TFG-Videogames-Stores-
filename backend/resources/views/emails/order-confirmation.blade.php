<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmación de Pedido - Retro Games Store</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #f3f4f6;
            color: #1f2937;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
        }
        .header {
            background-color: #1f2937;
            padding: 32px 24px;
            text-align: center;
        }
        .header h1 {
            color: #ffffff;
            margin: 0;
            font-size: 28px;
            font-weight: bold;
        }
        .header .logo {
            color: #ef4444;
            font-size: 32px;
            margin-bottom: 16px;
        }
        .content {
            padding: 32px 24px;
        }
        .greeting {
            font-size: 18px;
            color: #1f2937;
            margin-bottom: 24px;
        }
        .order-info {
            background-color: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 24px;
        }
        .order-info h2 {
            color: #1f2937;
            font-size: 20px;
            margin: 0 0 16px 0;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 12px;
            padding-bottom: 12px;
            border-bottom: 1px solid #e5e7eb;
        }
        .info-row:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
        }
        .info-label {
            color: #6b7280;
            font-size: 14px;
        }
        .info-value {
            color: #1f2937;
            font-weight: 600;
            font-size: 14px;
        }
        .products-section {
            margin-bottom: 24px;
        }
        .products-section h3 {
            color: #1f2937;
            font-size: 18px;
            margin-bottom: 16px;
        }
        .product-item {
            display: flex;
            align-items: center;
            padding: 16px;
            background-color: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            margin-bottom: 12px;
        }
        .product-image {
            width: 80px;
            height: 80px;
            object-fit: cover;
            border-radius: 8px;
            margin-right: 16px;
        }
        .product-details {
            flex: 1;
        }
        .product-name {
            color: #1f2937;
            font-weight: 600;
            margin-bottom: 4px;
        }
        .product-info {
            color: #6b7280;
            font-size: 14px;
        }
        .product-price {
            color: #1f2937;
            font-weight: 600;
            text-align: right;
        }
        .totals {
            background-color: #1f2937;
            color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 24px;
        }
        .total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
        }
        .total-row.final {
            font-size: 20px;
            font-weight: bold;
            margin-top: 12px;
            padding-top: 12px;
            border-top: 1px solid #374151;
        }
        .shipping-info {
            background-color: #fef3c7;
            border: 1px solid #fbbf24;
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 24px;
        }
        .shipping-info h4 {
            color: #92400e;
            margin: 0 0 8px 0;
            font-size: 16px;
        }
        .shipping-address {
            color: #78350f;
            font-size: 14px;
            line-height: 1.6;
        }
        .button {
            display: inline-block;
            background-color: #ef4444;
            color: #ffffff;
            padding: 12px 32px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            text-align: center;
            margin: 16px 0;
        }
        .button:hover {
            background-color: #dc2626;
        }
        .footer {
            background-color: #f9fafb;
            padding: 24px;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
        }
        .footer a {
            color: #ef4444;
            text-decoration: none;
        }
        .social-links {
            margin-top: 16px;
        }
        .social-links a {
            display: inline-block;
            margin: 0 8px;
            color: #6b7280;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="logo"><img src="{{ url('storage/Retro-Time-02.png') }}" alt="Logo Retro Time"></div>
            <h1>Retro Games Store</h1>
        </div>

        <!-- Content -->
        <div class="content">
            <div class="greeting">
                Hola {{ $order->user->name }},
            </div>

            <p style="margin-bottom: 24px;">
                ¡Gracias por tu compra! Hemos recibido tu pedido y estamos preparándolo para su envío.
            </p>

            <!-- Order Info -->
            <div class="order-info">
                <h2>Información del Pedido</h2>
                <div class="info-row">
                    <span class="info-label">Número de pedido:</span>
                    <span class="info-value">#{{ $order->id }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Fecha:</span>
                    <span class="info-value">{{ $order->created_at->format('d/m/Y H:i') }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Método de pago:</span>
                    <span class="info-value">{{ ucfirst($order->payment_method) }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Estado:</span>
                    <span class="info-value">
                        @if($order->status == 'completed')
                            Completado
                        @elseif($order->status == 'processing')
                            Procesando
                        @else
                            Pendiente
                        @endif
                    </span>
                </div>
            </div>

            <!-- Products -->
            <div class="products-section">
                <h3>Productos</h3>
                @foreach($order->items as $item)
                <div class="product-item">
                    @if($item->game->image)
                    <img src="{{ url('storage/games' . $item->game->image) }}" alt="{{ $item->game->name }}" class="product-image">
                    @else
                    <div style="width: 80px; height: 80px; background-color: #e5e7eb; border-radius: 8px; margin-right: 16px; display: flex; align-items: center; justify-content: center;">
                        <span style="color: #9ca3af;">🎮</span>
                    </div>
                    @endif
                    <div class="product-details">
                        <div class="product-name">{{ $item->game->name }}</div>
                        <div class="product-info">
                            {{ $item->game->console->name }} • Cantidad: {{ $item->quantity }}
                        </div>
                    </div>
                    <div class="product-price">
                        {{ number_format($item->price * $item->quantity, 2) }} €
                    </div>
                </div>
                @endforeach
            </div>

            <!-- Totals -->
            <div class="totals">
                <div class="total-row">
                    <span>Subtotal:</span>
                    <span>{{ number_format($order->total, 2) }} €</span>
                </div>
                <div class="total-row">
                    <span>Envío:</span>
                    <span>Gratis</span>
                </div>
                <div class="total-row final">
                    <span>Total:</span>
                    <span>{{ number_format($order->total, 2) }} €</span>
                </div>
            </div>

            <!-- Shipping Info -->
            @php
                $shippingAddress = is_string($order->shipping_address) 
                    ? json_decode($order->shipping_address, true) 
                    : $order->shipping_address;
            @endphp
            @if($shippingAddress)
            <div class="shipping-info">
                <h4>📦 Dirección de Envío</h4>
                <div class="shipping-address">
                    {{ $shippingAddress['address'] ?? '' }}<br>
                    {{ $shippingAddress['city'] ?? '' }}, {{ $shippingAddress['postal_code'] ?? $shippingAddress['postalCode'] ?? '' }}<br>
                    {{ $shippingAddress['country'] ?? '' }}<br>
                    @if(isset($shippingAddress['phone']))
                        Tel: {{ $shippingAddress['phone'] }}
                    @endif
                </div>
            </div>
            @endif

            <!-- CTA Button -->
            <div style="text-align: center; margin: 32px 0;">
                <a href="{{ url('/profile/orders/' . $order->id) }}" class="button">
                    Ver Detalle del Pedido
                </a>
            </div>

            <p style="color: #6b7280; font-size: 14px;">
                Si tienes alguna pregunta sobre tu pedido, no dudes en contactarnos respondiendo a este email o visitando nuestra página de ayuda.
            </p>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>
                © {{ date('Y') }} Retro Games Store. Todos los derechos reservados.
            </p>
            <p>
                <a href="{{ url('/') }}">Visitar tienda</a> • 
                <a href="{{ url('/terms') }}">Términos y condiciones</a> • 
                <a href="{{ url('/privacy') }}">Política de privacidad</a>
            </p>
            <div class="social-links">
                <a href="#">Facebook</a>
                <a href="#">Twitter</a>
                <a href="#">Instagram</a>
            </div>
        </div>
    </div>
</body>
</html>