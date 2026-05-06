// Format a price with currency symbol and Indian-style number formatting
export const formatPrice = (n, sym = '₹') => `${sym}${Number(n).toLocaleString('en-IN')}`;

// Build a WhatsApp wa.me URL with a pre-formatted message
export function whatsappUrl(number, message) {
  const cleaned = String(number).replace(/\D/g, '');
  const text = encodeURIComponent(message);
  return `https://wa.me/${cleaned}?text=${text}`;
}

// Build a single-product inquiry message
export function buildProductInquiry({ brandName = 'Time to Time Shopping', product, variant, qty, currency = '₹' }) {
  return `Hi ${brandName}! 👋\n\nI'd like to order:\n\n*${product.name}*\nVariant: ${variant || 'Standard'}\nQty: ${qty}\nPrice: ${formatPrice(product.price * qty, currency)}\n\nPlease confirm availability. Thank you!`;
}

// Build a complete order message for checkout WhatsApp send
export function buildOrderMessage({ orderId, customer, lines, subtotal, shipping, total, currency = '₹' }) {
  const itemList = lines
    .map(l => `• ${l.product.name} (${l.variant || 'Std'}) × ${l.qty} = ${formatPrice(l.product.price * l.qty, currency)}`)
    .join('\n');
  return [
    `🛍️ *NEW ORDER #${orderId}*`,
    '',
    `*Customer:* ${customer.name}`,
    `*Phone:* ${customer.phone}`,
    customer.email ? `*Email:* ${customer.email}` : '',
    `*Address:* ${customer.address}, ${customer.city} - ${customer.pincode}`,
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
