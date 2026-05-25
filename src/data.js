// ════════════════════════════════════════════════════════════════════
// BRAND TOKENS — Time to Time Shopping
// ════════════════════════════════════════════════════════════════════
export const C = {
  navy:        '#0F1825',
  navyDeep:    '#0A1018',
  navyCard:    '#1A2332',
  navyLight:   '#243046',
  gold:        '#D4AF37',
  goldLight:   '#F0C14B',
  goldPale:    '#F5D579',
  goldDark:    '#8B6914',
  cream:       '#F7EFD9',
  creamLight:  '#FBF6E8',
  ink:         '#0A0A0A',
  text:        '#F5F5F5',
  textDark:    '#1a1a1a',
  muted:       '#8B9BB4',
  mutedDark:   '#6B7280',
  line:        'rgba(212,175,55,0.18)',
  bgSoft:      '#F4F4F4',
};

// Order status badge colors
export const STATUS_COLORS = {
  pending:   { bg: '#fef3c7', fg: '#92400e', label: 'Pending' },
  confirmed: { bg: '#dbeafe', fg: '#1e40af', label: 'Confirmed' },
  shipped:   { bg: '#e0e7ff', fg: '#3730a3', label: 'Shipped' },
  delivered: { bg: '#d1fae5', fg: '#065f46', label: 'Delivered' },
  cancelled: { bg: '#fee2e2', fg: '#991b1b', label: 'Cancelled' },
};

// Default settings — applied only when the admin has never saved settings.
// These are fallbacks (so the storefront has values to render on a fresh
// install) and are also merged underneath saved settings so any new key
// added here later picks up a default without overwriting admin values.
export const DEFAULT_SETTINGS = {
  brandName: 'Time to Time Shopping',
  tagline: 'Luxury in every moment',
  whatsappNumber: '97433526308',
  storePhone: '+91 99999 99999',
  storeEmail: 'orders@timetotimeshopping.com',
  currency: '₹',
  freeShippingMin: 999,
  shippingFee: 99,
  codAvailable: true,
  whatsappAvailable: true,
};
