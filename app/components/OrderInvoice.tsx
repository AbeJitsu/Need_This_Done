'use client';

import { Download, Printer, X } from 'lucide-react';
import type { Order, LineItem } from '@/lib/medusa-client';

// ============================================================================
// Order Invoice Component
// ============================================================================
// What: Printable/downloadable invoice for customer orders
// Why: Customers need receipts for records, warranty claims, taxes
// How: Shows formatted invoice with order details and items

interface OrderInvoiceProps {
  order: Order & { shipping_address?: any; billing_address?: any; tax_total?: number };
  onClose?: () => void;
  isModal?: boolean;
}

export default function OrderInvoice({
  order,
  onClose,
  isModal = false,
}: OrderInvoiceProps) {
  // ============================================================================
  // Format Helpers
  // ============================================================================

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  // ============================================================================
  // Download Invoice as HTML
  // ============================================================================

  const downloadInvoice = () => {
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Invoice - Order #${order.id.slice(0, 8)}</title>
  <style>
    body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
    .container { max-width: 800px; margin: 0 auto; padding: 40px 20px; }
    .header { border-bottom: 2px solid #e5e7eb; padding-bottom: 20px; margin-bottom: 30px; }
    .company-info { margin-bottom: 30px; }
    .invoice-title { font-size: 28px; font-weight: bold; color: #059669; margin-bottom: 10px; }
    .invoice-details { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 30px; }
    .detail-section { }
    .detail-label { font-size: 12px; color: #6b7280; text-transform: uppercase; font-weight: bold; margin-bottom: 5px; }
    .detail-value { font-size: 14px; color: #1f2937; margin-bottom: 15px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    thead { background-color: #f3f4f6; }
    th { padding: 12px; text-align: left; font-weight: bold; color: #374151; border-bottom: 2px solid #d1d5db; }
    td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
    tr:last-child td { border-bottom: 2px solid #d1d5db; }
    .amount-right { text-align: right; }
    .summary { margin-bottom: 30px; display: flex; justify-content: flex-end; }
    .summary-table { width: 300px; }
    .summary-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
    .summary-total { display: flex; justify-content: space-between; padding: 12px 0; font-size: 18px; font-weight: bold; color: #059669; border-top: 2px solid #059669; }
    .footer { text-align: center; color: #6b7280; font-size: 12px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
    @media print {
      body { margin: 0; padding: 0; }
      .container { padding: 0; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="company-info">
        <div class="invoice-title">INVOICE</div>
        <div style="font-size: 12px; color: #6b7280;">NeedThisDone.com</div>
      </div>
    </div>

    <div class="invoice-details">
      <div class="detail-section">
        <div class="detail-label">Bill To</div>
        <div class="detail-value">
          <div>${order.email}</div>
          ${order.shipping_address?.first_name || ''} ${order.shipping_address?.last_name || ''}
        </div>
        <div class="detail-label">Order #</div>
        <div class="detail-value">${order.id}</div>
      </div>
      <div class="detail-section">
        <div class="detail-label">Invoice Date</div>
        <div class="detail-value">${formatDate(order.created_at)}</div>
        <div class="detail-label">Order Status</div>
        <div class="detail-value" style="text-transform: capitalize;">${order.status}</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Item</th>
          <th>Quantity</th>
          <th class="amount-right">Unit Price</th>
          <th class="amount-right">Total</th>
        </tr>
      </thead>
      <tbody>
        ${order.items
          .map(
            (item: LineItem) => `
        <tr>
          <td>
            <div style="font-weight: bold;">${item.title || 'Product'}</div>
            ${item.description ? `<div style="font-size: 12px; color: #6b7280;">${item.description}</div>` : ''}
          </td>
          <td>${item.quantity}</td>
          <td class="amount-right">${formatPrice(item.unit_price || 0)}</td>
          <td class="amount-right">${formatPrice((item.unit_price || 0) * item.quantity)}</td>
        </tr>
        `
          )
          .join('')}
      </tbody>
    </table>

    <div class="summary">
      <div class="summary-table">
        <div class="summary-row">
          <span>Subtotal</span>
          <span>${formatPrice(order.total - (order.tax_total || 0))}</span>
        </div>
        ${order.tax_total ? `
        <div class="summary-row">
          <span>Tax</span>
          <span>${formatPrice(order.tax_total)}</span>
        </div>
        ` : ''}
        <div class="summary-total">
          <span>Total</span>
          <span>${formatPrice(order.total)}</span>
        </div>
      </div>
    </div>

    <div class="footer">
      <p>Thank you for your business!</p>
      <p>This invoice was generated on ${new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })}</p>
    </div>
  </div>
</body>
</html>
    `;

    // Create blob and download
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Invoice-${order.id.slice(0, 8)}-${formatDate(order.created_at).replace(/\s/g, '-')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ============================================================================
  // Print Invoice
  // ============================================================================

  const printInvoice = () => {
    window.print();
  };

  // ============================================================================
  // Invoice Display
  // ============================================================================

  return (
    <div className={`${isModal ? 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4' : ''}`}>
      <div className={`${isModal ? 'bg-white rounded-lg shadow-xl max-w-3xl w-full' : ''}`}>
        {/* Header with Actions */}
        <div className={`${isModal ? 'flex items-center justify-between border-b border-gray-200 p-6' : 'flex items-center justify-between mb-6'}`}>
          <h2 className="text-2xl font-bold text-gray-900">
            Invoice #{order.id.slice(0, 8)}
          </h2>

          <div className="flex items-center gap-3">
            <button
              onClick={downloadInvoice}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download</span>
            </button>

            <button
              onClick={printInvoice}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors print:hidden"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print</span>
            </button>

            {isModal && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            )}
          </div>
        </div>

        {/* Invoice Content */}
        <div className={`${isModal ? 'p-6 max-h-[80vh] overflow-y-auto' : ''} print:p-0`}>
          {/* Company and Order Info */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">NeedThisDone</h3>
              <p className="text-gray-600 text-sm">Professional Services Platform</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Order Date</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatDate(order.created_at)}
              </p>
            </div>
          </div>

          {/* Bill To Section */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <p className="text-xs font-bold text-gray-600 uppercase mb-2">Bill To</p>
              <p className="font-semibold text-gray-900">{order.email}</p>
              {order.billing_address && (
                <p className="text-sm text-gray-600">
                  {order.billing_address.first_name} {order.billing_address.last_name}
                </p>
              )}
            </div>
            <div>
              <p className="text-xs font-bold text-gray-600 uppercase mb-2">Status</p>
              <p className="text-sm text-gray-900 capitalize font-semibold">
                {order.status === 'completed' ? '✓ Completed' : order.status === 'pending' ? '⏳ Processing' : '✗ Canceled'}
              </p>
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full mb-8 print:mb-6">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="text-left py-3 font-semibold text-gray-900">Item</th>
                <th className="text-center py-3 font-semibold text-gray-900">Qty</th>
                <th className="text-right py-3 font-semibold text-gray-900">Price</th>
                <th className="text-right py-3 font-semibold text-gray-900">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item: LineItem) => (
                <tr key={item.id} className="border-b border-gray-200">
                  <td className="py-4">
                    <p className="font-medium text-gray-900">{item.title || 'Product'}</p>
                    {item.description && (
                      <p className="text-sm text-gray-600">{item.description}</p>
                    )}
                  </td>
                  <td className="text-center py-4 text-gray-900">{item.quantity}</td>
                  <td className="text-right py-4 text-gray-900">
                    {formatPrice(item.unit_price || 0)}
                  </td>
                  <td className="text-right py-4 font-semibold text-gray-900">
                    {formatPrice((item.unit_price || 0) * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Summary */}
          <div className="flex justify-end mb-8 print:mb-6">
            <div className="w-72">
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900">
                  {formatPrice(order.total - (order.tax_total || 0))}
                </span>
              </div>
              {order.tax_total !== undefined && order.tax_total > 0 && (
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Tax</span>
                  <span className="text-gray-900">{formatPrice(order.tax_total)}</span>
                </div>
              )}
              <div className="flex justify-between py-3 border-t-2 border-gray-900">
                <span className="font-bold text-lg text-gray-900">Total</span>
                <span className="font-bold text-lg text-emerald-600">
                  {formatPrice(order.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-gray-600 border-t border-gray-200 pt-4 print:border-0 print:pt-0">
            <p>Thank you for your business!</p>
            <p className="text-xs text-gray-500 mt-2">
              Invoice generated on {new Date().toLocaleDateString('en-US')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
