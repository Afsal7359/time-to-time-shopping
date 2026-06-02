// Format a price with currency symbol and Indian-style number formatting
export const formatPrice = (n, sym = '₹') => `${sym}${Number(n).toLocaleString('en-IN')}`;

// Build a WhatsApp wa.me URL with a pre-formatted message
export function whatsappUrl(number, message) {
  const cleaned = String(number).replace(/\D/g, '').replace(/^0+/, '');
  const text = encodeURIComponent(message);
  return `https://api.whatsapp.com/send?phone=${cleaned}&text=${text}`;
}

// Build a single-product inquiry message
export function buildProductInquiry({ brandName = 'Time to Time Shopping', product, variant, qty, currency = '₹', size = '', color = '' }) {
  const opts = [variant, size && `Size: ${size}`, color && `Color: ${color}`].filter(Boolean);
  const optsLine = opts.length ? `\nVariant: ${opts.join(' | ')}` : '';
  return `Hi ${brandName}! 👋\n\nI'd like to order:\n\n*${product.name}*${optsLine}\nQty: ${qty}\nPrice: ${formatPrice(product.price * qty, currency)}\n\nPlease confirm availability. Thank you!`;
}

// Build a complete order message for checkout WhatsApp send
export function buildOrderMessage({ orderId, customer, lines, subtotal, shipping, total, currency = '₹' }) {
  const itemList = lines
    .map(l => {
      const opts = [l.variant, l.size && `Size: ${l.size}`, l.color && `Color: ${l.color}`].filter(Boolean);
      const img = l.product.images?.[0] ? `\n  📷 ${l.product.images[0]}` : '';
      return `• ${l.product.name}${opts.length ? ` (${opts.join(' | ')})` : ''} × ${l.qty} = ${formatPrice(l.product.price * l.qty, currency)}${img}`;
    })
    .join('\n\n');
  // Customer name + address parts are optional at checkout — only include
  // the lines that actually have content so we never send "*Customer:* "
  // or "*Address:* , - ".
  const addressLine = [
    customer.address,
    customer.city,
    customer.pincode,
  ].filter(Boolean).join(', ');

  return [
    `🛍️ *NEW ORDER #${orderId}*`,
    '',
    customer.name ? `*Customer:* ${customer.name}` : '',
    `*Phone:* ${customer.phone}`,
    customer.email ? `*Email:* ${customer.email}` : '',
    addressLine ? `*Address:* ${addressLine}` : '',
    '',
    `*Items:*`,
    itemList,
    '',
    `*Subtotal:* ${formatPrice(subtotal, currency)}`,
    `*Shipping:* ${shipping === 0 ? 'FREE' : formatPrice(shipping, currency)}`,
    `*TOTAL:* ${formatPrice(total, currency)}`,
    `*Payment:* WhatsApp Order`,
    customer.notes ? `*Notes:* ${customer.notes}` : '',
  ].filter(Boolean).join('\n');
}
