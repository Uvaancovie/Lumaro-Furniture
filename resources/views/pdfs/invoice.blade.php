<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Invoice {{ $order->order_number }}</title>
    <style>
        @page { margin: 20mm 15mm; }

        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 10pt;
            color: #1f2937;
            line-height: 1.5;
        }

        /* Header */
        .invoice-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 3px solid #d97706;
        }

        .brand h1 {
            margin: 0;
            font-size: 24pt;
            color: #d97706;
            letter-spacing: -0.5px;
        }

        .brand p {
            margin: 2px 0 0;
            color: #6b7280;
            font-size: 9pt;
        }

        .invoice-title {
            text-align: right;
        }

        .invoice-title h2 {
            margin: 0;
            font-size: 18pt;
            color: #374151;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .invoice-title p {
            margin: 4px 0 0;
            font-size: 9pt;
            color: #6b7280;
        }

        .invoice-title .order-number {
            font-size: 11pt;
            font-weight: bold;
            color: #d97706;
            margin-top: 6px;
        }

        /* Addresses */
        .addresses {
            display: flex;
            gap: 20px;
            margin-bottom: 30px;
        }

        .address-box {
            flex: 1;
            padding: 12px 16px;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            background: #f9fafb;
        }

        .address-box h3 {
            margin: 0 0 8px;
            font-size: 9pt;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #6b7280;
        }

        .address-box p {
            margin: 1px 0;
            font-size: 9pt;
            color: #1f2937;
        }

        /* Table */
        table.items {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 24px;
            font-size: 9pt;
        }

        table.items thead th {
            background: #d97706;
            color: #ffffff;
            padding: 10px 12px;
            text-align: left;
            font-size: 8pt;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        table.items thead th:last-child {
            text-align: right;
        }

        table.items tbody td {
            padding: 9px 12px;
            border-bottom: 1px solid #e5e7eb;
        }

        table.items tbody td:last-child {
            text-align: right;
        }

        table.items tbody tr:nth-child(even) {
            background: #f9fafb;
        }

        table.items tbody tr:last-child td {
            border-bottom: 2px solid #d97706;
        }

        /* Totals */
        .totals-section {
            margin-left: auto;
            width: 320px;
        }

        table.totals {
            width: 100%;
            border-collapse: collapse;
            font-size: 9pt;
        }

        table.totals td {
            padding: 5px 12px;
        }

        table.totals td:last-child {
            text-align: right;
            font-weight: 600;
            width: 120px;
        }

        table.totals tr.sub td {
            color: #6b7280;
        }

        table.totals tr.grand-total td {
            font-size: 13pt;
            font-weight: bold;
            color: #1f2937;
            padding-top: 10px;
            border-top: 2px solid #1f2937;
        }

        table.totals tr.grand-total td:last-child {
            color: #d97706;
        }

        .paid-badge {
            display: inline-block;
            padding: 3px 12px;
            background: #059669;
            color: #fff;
            font-size: 8pt;
            font-weight: bold;
            border-radius: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        /* Notes */
        .notes-section {
            margin-top: 24px;
            padding: 12px 16px;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            background: #fffbeb;
        }

        .notes-section h3 {
            margin: 0 0 6px;
            font-size: 9pt;
            color: #92400e;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .notes-section p {
            margin: 0;
            font-size: 9pt;
            color: #78350f;
        }

        /* Footer */
        .invoice-footer {
            margin-top: 40px;
            padding-top: 16px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
        }

        .invoice-footer p {
            margin: 2px 0;
            font-size: 8pt;
            color: #9ca3af;
        }

        .invoice-footer .bank-info {
            margin-top: 10px;
            font-size: 8pt;
            color: #6b7280;
        }
    </style>
</head>
<body>

    <div class="invoice-header">
        <div class="brand">
            <h1>Lumaro Furniture Studio</h1>
            <p>Handcrafted Furniture Studio</p>
            <p>Johannesburg, South Africa</p>
        </div>
        <div class="invoice-title">
            <h2>Invoice</h2>
            <p class="order-number">{{ $order->order_number }}</p>
            <p>Date: {{ $order->created_at->format('d M Y') }}</p>
            <p style="margin-top: 6px;">
                <span class="paid-badge">Paid</span>
            </p>
        </div>
    </div>

    <div class="addresses">
        <div class="address-box">
            <h3>Bill To</h3>
            <p>{{ $order->billing_address['name'] }}</p>
            <p>{{ $order->billing_address['address_line1'] }}</p>
            @if($order->billing_address['address_line2'] ?? null)
                <p>{{ $order->billing_address['address_line2'] }}</p>
            @endif
            <p>{{ $order->billing_address['city'] }}{{ $order->billing_address['state'] ? ', ' . $order->billing_address['state'] : '' }} {{ $order->billing_address['postal_code'] ?? '' }}</p>
            <p>{{ $order->billing_address['country'] }}</p>
            @if($order->billing_address['phone'] ?? null)
                <p style="margin-top: 4px;">{{ $order->billing_address['phone'] }}</p>
            @endif
        </div>
        <div class="address-box">
            <h3>Ship To</h3>
            <p>{{ $order->shipping_address['name'] }}</p>
            <p>{{ $order->shipping_address['address_line1'] }}</p>
            @if($order->shipping_address['address_line2'] ?? null)
                <p>{{ $order->shipping_address['address_line2'] }}</p>
            @endif
            <p>{{ $order->shipping_address['city'] }}{{ $order->shipping_address['state'] ? ', ' . $order->shipping_address['state'] : '' }} {{ $order->shipping_address['postal_code'] ?? '' }}</p>
            <p>{{ $order->shipping_address['country'] }}</p>
            @if($order->shipping_address['phone'] ?? null)
                <p style="margin-top: 4px;">{{ $order->shipping_address['phone'] }}</p>
            @endif
        </div>
    </div>

    <table class="items">
        <thead>
            <tr>
                <th style="width:50%;">Product</th>
                <th>SKU</th>
                <th style="text-align:center;">Qty</th>
                <th>Unit Price</th>
                <th>Subtotal</th>
            </tr>
        </thead>
        <tbody>
            @foreach($order->items as $item)
            <tr>
                <td>{{ $item->product_name }}</td>
                <td>{{ $item->product_data['sku'] ?? '—' }}</td>
                <td style="text-align:center;">{{ $item->quantity }}</td>
                <td>R{{ number_format($item->unit_price, 2) }}</td>
                <td>R{{ number_format($item->subtotal, 2) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="totals-section">
        <table class="totals">
            <tr class="sub">
                <td>Subtotal</td>
                <td>R{{ number_format($order->subtotal, 2) }}</td>
            </tr>
            <tr class="sub">
                <td>Shipping</td>
                <td>@if($order->shipping_cost > 0)R{{ number_format($order->shipping_cost, 2) }}@else<span style="color:#059669;">Free</span>@endif</td>
            </tr>
            <tr class="sub">
                <td>VAT (15%)</td>
                <td>R{{ number_format($order->tax, 2) }}</td>
            </tr>
            @if($order->discount > 0)
            <tr class="sub">
                <td>Discount</td>
                <td style="color:#059669;">-R{{ number_format($order->discount, 2) }}</td>
            </tr>
            @endif
            <tr class="grand-total">
                <td>Total Due</td>
                <td>R{{ number_format($order->total, 2) }}</td>
            </tr>
        </table>
    </div>

    @if($order->notes)
    <div class="notes-section">
        <h3>Order Notes</h3>
        <p>{{ $order->notes }}</p>
    </div>
    @endif

    <div class="invoice-footer">
        <p><strong>Lumaro Furniture Studio</strong> &mdash; Handcrafted Furniture Studio &bull; Johannesburg, South Africa</p>
        <p>Email: info@lumarofurniture.co.za &bull; Phone: +27 11 234 5678</p>
        <div class="bank-info">
            <p><strong>Payment:</strong> Bank: First National Bank &bull; Account: 6284 1926 187 &bull; Branch Code: 255005 &bull; Reference: {{ $order->order_number }}</p>
        </div>
        <p style="margin-top: 8px;">Thank you for your business!</p>
    </div>

</body>
</html>
