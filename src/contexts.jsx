import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { Check, AlertCircle } from 'lucide-react';
import { db } from './firebase';
import { C, SEED_PRODUCTS, SEED_CATEGORIES, SEED_BANNERS, SEED_SETTINGS } from './data';


/* ════════════════════════════════════════════════════════════════════
   TOAST PROVIDER
   ════════════════════════════════════════════════════════════════════ */
const ToastCtx = createContext();
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const show = useCallback((msg, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 2800);
  }, []);
  return (
    <ToastCtx.Provider value={show}>
      {children}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id}
            className="px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 pointer-events-auto animate-slide-up"
            style={{
              background: t.type === 'error' ? '#fee' : C.navy,
              color: t.type === 'error' ? '#c00' : C.gold,
              border: `1px solid ${t.type === 'error' ? '#fcc' : C.line}`,
              fontWeight: 600,
              fontSize: 14,
            }}>
            {t.type === 'error' ? <AlertCircle size={16}/> : <Check size={16}/>}
            {t.msg}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

/* ════════════════════════════════════════════════════════════════════
   STORE PROVIDER — global app state
   ════════════════════════════════════════════════════════════════════ */
const StoreCtx = createContext();
export const useStore = () => useContext(StoreCtx);

export function StoreProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [orders, setOrders] = useState([]);
  const [settings, setSettings] = useState(SEED_SETTINGS);
  const [cart, setCart] = useState([]);
  const [favorites, setFavorites] = useState([]);
  // Persist admin auth across page reloads (sessionStorage clears when tab closes)
  const [adminAuth, setAdminAuthState] = useState(() => {
    try { return sessionStorage.getItem('tts:adminAuth') === '1'; } catch { return false; }
  });
  const setAdminAuth = useCallback((val) => {
    setAdminAuthState(val);
    try {
      if (val) sessionStorage.setItem('tts:adminAuth', '1');
      else sessionStorage.removeItem('tts:adminAuth');
    } catch {}
  }, []);
  const [loading, setLoading] = useState(true);
  const [loadingMsg, setLoadingMsg] = useState('Loading store');

  // Initial load — seed only on genuine first run (products doc missing in DB)
  useEffect(() => {
    (async () => {
      const minDisplay = new Promise(r => setTimeout(r, 1200));
      setLoadingMsg('Connecting to database');

      // Check if the store has real data by looking at the products collection.
      // Using null as sentinel: null = doc truly missing (first run).
      // If Firebase is temporarily unreachable, db.get also returns null — in
      // that case the seed writes below will also fail gracefully (they fall back
      // to localStorage) and Firestore data is left untouched.
      const existingProducts = await db.get('products', null);

      if (existingProducts === null) {
        setLoadingMsg('Setting up your store');
        await Promise.all([
          db.set('products',   SEED_PRODUCTS),
          db.set('categories', SEED_CATEGORIES),
          db.set('banners',    SEED_BANNERS),
          db.set('orders',     []),
          db.set('settings',   SEED_SETTINGS),
        ]);
      }

      setLoadingMsg('Loading products');
      const [[p, c, b, o, s, ct, fv]] = await Promise.all([
        Promise.all([
          db.get('products',   SEED_PRODUCTS),
          db.get('categories', SEED_CATEGORIES),
          db.get('banners',    SEED_BANNERS),
          db.get('orders',     []),
          db.get('settings',   SEED_SETTINGS),
          db.get('cart',       []),
          db.get('favorites',  []),
        ]),
        minDisplay,
      ]);

      setProducts(p   ?? []);
      setCategories(c ?? []);
      setBanners(b    ?? []);
      setOrders(o     ?? []);
      setSettings({ ...SEED_SETTINGS, ...s });
      setCart(ct      ?? []);
      setFavorites(fv ?? []);
      setLoading(false);
    })();
  }, []);

  // Persist cart and favorites on change
  useEffect(() => { if (!loading) db.set('cart', cart); }, [cart, loading]);
  useEffect(() => { if (!loading) db.set('favorites', favorites); }, [favorites, loading]);

  // Cart ops
  const addToCart = (productId, variant, qty = 1, size = '', color = '') => {
    setCart(c => {
      const found = c.find(i =>
        i.productId === productId && i.variant === variant &&
        (i.size || '') === size && (i.color || '') === color
      );
      if (found) return c.map(i => i === found ? { ...i, qty: i.qty + qty } : i);
      return [...c, { productId, variant, qty, size, color }];
    });
  };
  const updateQty = (productId, variant, qty, size = '', color = '') => {
    if (qty <= 0) return removeFromCart(productId, variant, size, color);
    setCart(c => c.map(i =>
      i.productId === productId && i.variant === variant &&
      (i.size || '') === size && (i.color || '') === color
        ? { ...i, qty } : i
    ));
  };
  const removeFromCart = (productId, variant, size = '', color = '') =>
    setCart(c => c.filter(i =>
      !(i.productId === productId && i.variant === variant &&
        (i.size || '') === size && (i.color || '') === color)
    ));
  const clearCart = () => setCart([]);

  // Favorites
  const toggleFav = (id) =>
    setFavorites(f => f.includes(id) ? f.filter(x => x !== id) : [...f, id]);

  // Admin CRUD
  const saveProducts = async (p) => { setProducts(p); await db.set('products', p); };
  const saveCategories = async (c) => { setCategories(c); await db.set('categories', c); };
  const saveBanners = async (b) => { setBanners(b); await db.set('banners', b); };
  const saveOrders = async (o) => { setOrders(o); await db.set('orders', o); };
  const saveSettings = async (s) => { setSettings(s); await db.set('settings', s); };

  // Place order
  const placeOrder = async (orderData) => {
    const id = `TTS${Date.now().toString().slice(-8)}`;
    const order = {
      id,
      items: cart.map(c => {
        const p = products.find(x => x.id === c.productId);
        return { ...c, name: p?.name, price: p?.price, image: p?.images?.[0] };
      }),
      subtotal: orderData.subtotal,
      shipping: orderData.shipping,
      total: orderData.total,
      customer: orderData.customer,
      paymentMethod: orderData.paymentMethod,
      status: 'pending',
      createdAt: Date.now(),
    };
    const next = [order, ...orders];
    await saveOrders(next);
    clearCart();
    return order;
  };

  return (
    <StoreCtx.Provider value={{
      products, categories, banners, orders, settings, cart, favorites,
      adminAuth, setAdminAuth, loading, loadingMsg,
      addToCart, updateQty, removeFromCart, clearCart, toggleFav,
      saveProducts, saveCategories, saveBanners, saveOrders, saveSettings,
      placeOrder,
    }}>
      {children}
    </StoreCtx.Provider>
  );
}

/* ════════════════════════════════════════════════════════════════════
   ROUTE PROVIDER — simple state-based router with back support
   ════════════════════════════════════════════════════════════════════ */
const RouteCtx = createContext();
export const useRoute = () => useContext(RouteCtx);

function readInitialRoute() {
  // sessionStorage preserves full route (including params) across F5 reloads
  try {
    const saved = sessionStorage.getItem('tts:route');
    if (saved) {
      const r = JSON.parse(saved);
      if (r?.name) return r;
    }
  } catch {}
  // Fallback: read simple route name from URL hash
  const h = window.location.hash.replace(/^#\/?/, '');
  if (!h || h === 'home') return { name: 'home', params: {} };
  return { name: h, params: {} };
}

function persistRoute(r) {
  try { sessionStorage.setItem('tts:route', JSON.stringify(r)); } catch {}
  // Keep hash in sync for param-less routes (bookmarkable / direct URL access)
  if (!r.params || Object.keys(r.params).length === 0) {
    window.location.hash = r.name === 'home' ? '' : r.name;
  }
}

export function RouteProvider({ children }) {
  const [route, setRoute] = useState(readInitialRoute);
  const [history, setHistory] = useState([]);

  // Handle browser hash changes (direct URL entry, browser back/forward)
  useEffect(() => {
    const onHashChange = () => {
      const h = window.location.hash.replace(/^#\/?/, '');
      if (!h || h === 'home') {
        const r = { name: 'home', params: {} };
        setRoute(r);
        persistRoute(r);
      } else {
        const r = { name: h, params: {} };
        setRoute(r);
        persistRoute(r);
      }
      setHistory([]);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = useCallback((name, params = {}) => {
    setHistory(h => [...h, route]);
    const newRoute = { name, params };
    setRoute(newRoute);
    persistRoute(newRoute);
    window.scrollTo(0, 0);
  }, [route]);

  const back = useCallback(() => {
    setHistory(h => {
      if (h.length === 0) {
        const r = { name: 'home', params: {} };
        setRoute(r);
        persistRoute(r);
        return h;
      }
      const prev = h[h.length - 1];
      setRoute(prev);
      persistRoute(prev);
      return h.slice(0, -1);
    });
  }, []);

  return (
    <RouteCtx.Provider value={{ route, navigate, back }}>
      {children}
    </RouteCtx.Provider>
  );
}
