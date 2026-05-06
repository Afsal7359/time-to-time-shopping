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

// ════════════════════════════════════════════════════════════════════
// SEED DATA — runs once on first load so the demo isn't empty
// ════════════════════════════════════════════════════════════════════
export const SEED_CATEGORIES = [
  { id: 'cat-1', name: 'Watches',     icon: '⌚', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&q=80' },
  { id: 'cat-2', name: 'Bags',        icon: '👜', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=300&q=80' },
  { id: 'cat-3', name: 'Sunglasses',  icon: '🕶️', image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=300&q=80' },
  { id: 'cat-4', name: 'Jewelry',     icon: '💍', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300&q=80' },
  { id: 'cat-5', name: 'Wallets',     icon: '👛', image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=300&q=80' },
  { id: 'cat-6', name: 'Belts',       icon: '🪢', image: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=300&q=80' },
];

export const SEED_PRODUCTS = [
  {
    id: 'p-1', name: 'Royal Gold Chronograph', categoryId: 'cat-1',
    price: 12999, mrp: 18999, stock: 14, rating: 4.8, reviews: 124, badge: 'Best Seller',
    images: [
      'https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=700&q=85',
      'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=700&q=85',
      'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=700&q=85',
    ],
    description: 'Premium stainless steel chronograph with sapphire crystal, 50m water resistance, and a meticulously crafted gold-tone bezel. A timeless piece that elevates every occasion.',
    variants: ['40mm', '42mm', '44mm'],
    featured: true,
  },
  {
    id: 'p-2', name: 'Midnight Diver Automatic', categoryId: 'cat-1',
    price: 8499, mrp: 11999, stock: 22, rating: 4.6, reviews: 89, badge: 'New',
    images: ['https://images.unsplash.com/photo-1622434641406-a158123450f9?w=700&q=85'],
    description: 'Automatic movement diver watch with luminous markers and rotating bezel. Built for adventure, styled for the boardroom.',
    variants: ['40mm', '42mm'],
    featured: true,
  },
  {
    id: 'p-3', name: 'Heritage Leather Tote', categoryId: 'cat-2',
    price: 4299, mrp: 5999, stock: 31, rating: 4.7, reviews: 56, badge: '',
    images: ['https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=700&q=85'],
    description: 'Hand-stitched full-grain leather tote with brass hardware. Spacious interior with laptop sleeve.',
    variants: ['Tan', 'Black', 'Cognac'],
    featured: true,
  },
  {
    id: 'p-4', name: 'Aviator Polarized', categoryId: 'cat-3',
    price: 1899, mrp: 2999, stock: 48, rating: 4.5, reviews: 203, badge: 'Trending',
    images: ['https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=700&q=85'],
    description: 'Classic aviator silhouette with UV400 polarized lenses and lightweight titanium frame.',
    variants: ['Gold', 'Silver', 'Black'],
    featured: true,
  },
  {
    id: 'p-5', name: 'Signet Ring 22K', categoryId: 'cat-4',
    price: 7999, mrp: 9999, stock: 9, rating: 4.9, reviews: 41, badge: 'Premium',
    images: ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=700&q=85'],
    description: 'Hand-engraved 22K gold signet ring. A statement of quiet confidence.',
    variants: ['Size 18', 'Size 19', 'Size 20', 'Size 21'],
    featured: false,
  },
  {
    id: 'p-6', name: 'Bifold Leather Wallet', categoryId: 'cat-5',
    price: 1499, mrp: 2199, stock: 67, rating: 4.4, reviews: 312, badge: '',
    images: ['https://images.unsplash.com/photo-1627123424574-724758594e93?w=700&q=85'],
    description: 'RFID-blocking bifold with 8 card slots and bill compartment. Slim, sturdy, and built to last.',
    variants: ['Brown', 'Black'],
    featured: false,
  },
  {
    id: 'p-7', name: 'Italian Calfskin Belt', categoryId: 'cat-6',
    price: 1799, mrp: 2499, stock: 38, rating: 4.6, reviews: 78, badge: '',
    images: ['https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=700&q=85'],
    description: 'Genuine Italian calfskin with brushed gold buckle. Reversible design for two looks in one.',
    variants: ['32', '34', '36', '38', '40'],
    featured: false,
  },
  {
    id: 'p-8', name: 'Pearl Drop Earrings', categoryId: 'cat-4',
    price: 3299, mrp: 4499, stock: 18, rating: 4.8, reviews: 67, badge: 'New',
    images: ['https://images.unsplash.com/photo-1535632066274-37b6ddfb6d4e?w=700&q=85'],
    description: 'Freshwater pearl drops on 18K gold-plated hooks. Effortlessly elegant.',
    variants: [],
    featured: true,
  },
];

export const SEED_BANNERS = [
  {
    id: 'b-1', title: 'Festive Edit', subtitle: 'Up to 40% off premium timepieces',
    cta: 'Shop Now', categoryId: 'cat-1', active: true,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900&q=85',
  },
  {
    id: 'b-2', title: 'New Arrivals', subtitle: 'Curated bags for the modern connoisseur',
    cta: 'Explore', categoryId: 'cat-2', active: true,
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=900&q=85',
  },
];

export const SEED_SETTINGS = {
  brandName: 'Time to Time Shopping',
  tagline: 'Luxury in every moment',
  whatsappNumber: '919999999999',
  storePhone: '+91 99999 99999',
  storeEmail: 'orders@timetotimeshopping.com',
  currency: '₹',
  adminPassword: 'admin123',
  freeShippingMin: 999,
  shippingFee: 99,
  codAvailable: true,
  whatsappAvailable: true,
};
