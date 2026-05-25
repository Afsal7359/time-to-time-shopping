import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { Check, AlertCircle } from 'lucide-react';
import {
  db, onAuthChanged, signInAdmin, signOutAdmin, changeAdminPassword,
} from './firebase';
import { C, DEFAULT_SETTINGS } from './data';

// cart + favorites live in localStorage only (per-browser, no server write).
// This removes the need for public Firestore writes on those keys.
const LOCAL_CART_KEY = 'tts:cart';
const LOCAL_FAV_KEY  = 'tts:favorites';
const readLocalJSON = (k, fb) => {
  try { const v = localStorage.getItem(k); return v == null ? fb : JSON.parse(v); }
  catch { return fb; }
};
const writeLocalJSON = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };


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
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [cart, setCart] = useState(() => readLocalJSON(LOCAL_CART_KEY, []));
  const [favorites, setFavorites] = useState(() => readLocalJSON(LOCAL_FAV_KEY, []));
  const [trash, setTrash] = useState([]); // [{ trashId, kind, item, deletedAt }]
  // Auth state is driven by Firebase. adminAuth is true iff a Firebase
  // user is signed in. We don't track our own session flag — Firebase
  // persists the session itself (browserLocalPersistence).
  const [currentUser, setCurrentUser] = useState(null);
  const adminAuth = !!currentUser;
  const [loading, setLoading] = useState(true);
  const [loadingMsg, setLoadingMsg] = useState('Loading store');

  // Subscribe to Firebase auth state changes once.
  useEffect(() => {
    const unsub = onAuthChanged((u) => setCurrentUser(u));
    return unsub;
  }, []);

  const signIn = useCallback(async (email, password) => {
    const user = await signInAdmin(email, password);
    return user;
  }, []);
  const signOut = useCallback(async () => {
    await signOutAdmin();
  }, []);
  const changePassword = useCallback(async (currentPwd, newPwd) => {
    await changeAdminPassword(currentPwd, newPwd);
  }, []);

  // Initial load. There is no seed/demo data — a fresh install starts
  // empty and the admin populates it. The only protective behavior here
  // is: if a read errors, do NOT proceed (and definitely do not write
  // anything). Surface the failure so the operator can fix the
  // connection/credentials before the app touches live data.
  useEffect(() => {
    (async () => {
      const minDisplay = new Promise(r => setTimeout(r, 1200));
      setLoadingMsg('Connecting to database');

      // Probe products with one retry. getRaw distinguishes "doc missing"
      // from "read failed" so a transient error can never look like a
      // fresh install.
      const probe = async (key) => {
        const first = await db.getRaw(key);
        if (!first.error) return first;
        await new Promise(r => setTimeout(r, 800));
        return db.getRaw(key);
      };

      // Note: cart and favorites are NOT loaded from Firestore — they live
      // in localStorage (initialised via useState above) so we never need
      // public write access to those keys.
      const probes = await Promise.all(
        ['products', 'categories', 'banners', 'orders', 'settings', 'trash']
          .map(k => probe(k).then(r => [k, r]))
      );

      const errored = probes.find(([, r]) => r.error);
      if (errored) {
        console.error(
          'Aborting startup: could not read from database. App will not ' +
          'write any data until the connection is restored.',
          errored
        );
        setLoadingMsg(
          'Could not connect to the database. Please check your connection and refresh. ' +
          '(No data has been changed.)'
        );
        return; // stay on loading screen rather than risk corruption
      }

      const byKey = Object.fromEntries(probes);
      const val = (k, fallback) => byKey[k].exists ? byKey[k].value : fallback;

      await minDisplay;

      setProducts(val('products', []) ?? []);
      setCategories(val('categories', []) ?? []);
      setBanners(val('banners', []) ?? []);
      setOrders(val('orders', []) ?? []);
      setSettings({ ...DEFAULT_SETTINGS, ...(val('settings', {}) ?? {}) });
      // cart/favorites already initialised from localStorage above.
      setTrash(val('trash', []) ?? []);
      setLoading(false);
    })();
  }, []);

  // Persist cart and favorites to localStorage on change (per-browser, no
  // server write — eliminates the need for public Firestore write access).
  useEffect(() => { if (!loading) writeLocalJSON(LOCAL_CART_KEY, cart); }, [cart, loading]);
  useEffect(() => { if (!loading) writeLocalJSON(LOCAL_FAV_KEY, favorites); }, [favorites, loading]);

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
  const saveSettings = async (s) => {
    // Defensive scrub: the old code persisted the admin password into the
    // public settings doc. Auth now lives in Firebase Auth, so this field
    // must never be written again — drop it on every save.
    const { adminPassword: _drop, ...clean } = s || {};
    setSettings(clean);
    await db.set('settings', clean);
  };

  // Recoverable delete. Captures the full item into trash before removing it
  // from its collection, so a mis-click can be reversed from the admin
  // dashboard. Trash is capped at 50 entries (oldest evicted) to keep the
  // doc small. kind ∈ 'product' | 'banner' | 'category'.
  const TRASH_CAP = 50;
  const softDelete = async (kind, id) => {
    let removed = null;
    if (kind === 'product') {
      removed = products.find(x => x.id === id);
      if (!removed) return;
      await saveProducts(products.filter(x => x.id !== id));
    } else if (kind === 'banner') {
      removed = banners.find(x => x.id === id);
      if (!removed) return;
      await saveBanners(banners.filter(x => x.id !== id));
    } else if (kind === 'category') {
      removed = categories.find(x => x.id === id);
      if (!removed) return;
      await saveCategories(categories.filter(x => x.id !== id));
    } else {
      return;
    }
    const entry = {
      trashId: `${kind}-${id}-${Date.now()}`,
      kind,
      item: removed,
      deletedAt: Date.now(),
    };
    const next = [entry, ...trash].slice(0, TRASH_CAP);
    setTrash(next);
    await db.set('trash', next);
  };

  const restoreFromTrash = async (trashId) => {
    const entry = trash.find(t => t.trashId === trashId);
    if (!entry) return;
    if (entry.kind === 'product') {
      // Skip if an item with the same id was recreated in the meantime.
      if (!products.some(x => x.id === entry.item.id)) {
        await saveProducts([entry.item, ...products]);
      }
    } else if (entry.kind === 'banner') {
      if (!banners.some(x => x.id === entry.item.id)) {
        await saveBanners([entry.item, ...banners]);
      }
    } else if (entry.kind === 'category') {
      if (!categories.some(x => x.id === entry.item.id)) {
        await saveCategories([entry.item, ...categories]);
      }
    }
    const next = trash.filter(t => t.trashId !== trashId);
    setTrash(next);
    await db.set('trash', next);
  };

  const purgeTrashEntry = async (trashId) => {
    const next = trash.filter(t => t.trashId !== trashId);
    setTrash(next);
    await db.set('trash', next);
  };

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
      products, categories, banners, orders, settings, cart, favorites, trash,
      adminAuth, currentUser, signIn, signOut, changePassword,
      loading, loadingMsg,
      addToCart, updateQty, removeFromCart, clearCart, toggleFav,
      saveProducts, saveCategories, saveBanners, saveOrders, saveSettings,
      softDelete, restoreFromTrash, purgeTrashEntry,
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
