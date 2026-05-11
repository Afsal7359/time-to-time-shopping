import React from 'react';
import { Home, Heart, ShoppingBag, Package, Search } from 'lucide-react';
import { C } from '../data';
import { useStore, useRoute } from '../contexts';
import { LogoFull } from '../ui';

function DesktopNav() {
  const { route, navigate } = useRoute();
  const { cart, favorites } = useStore();
  const cartCount = cart.reduce((a, b) => a + b.qty, 0);

  const primaryNav = [
    { name: 'home',   label: 'Home',   matchRoute: null },
    { name: 'search', label: 'Browse', matchRoute: 'category' },
  ];

  const rightNav = [
    { name: 'wishlist', icon: Heart,       label: 'Wishlist', badge: favorites.length },
    { name: 'cart',     icon: ShoppingBag, label: 'Cart',     badge: cartCount },
    { name: 'orders',   icon: Package,     label: 'Orders',   badge: 0 },
  ];

  return (
    <header
      className="hidden md:flex items-center flex-shrink-0 z-40"
      style={{
        background: C.navy,
        borderBottom: `1px solid ${C.line}`,
        height: 72,
        padding: '0 32px',
        gap: 16,
      }}>

      {/* Logo */}
      <div className="cursor-pointer flex-shrink-0" onClick={() => navigate('home')}>
        <LogoFull />
      </div>

      {/* Primary nav links */}
      <nav className="flex items-center gap-0.5 flex-shrink-0">
        {primaryNav.map(it => {
          const active = route.name === it.name || route.name === it.matchRoute;
          return (
            <button key={it.name} onClick={() => navigate(it.name)}
              className="px-4 h-9 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: active ? 'rgba(212,175,55,0.15)' : 'transparent',
                color: active ? C.gold : C.muted,
              }}>
              {it.label}
            </button>
          );
        })}
      </nav>

      <div className="w-px h-5 flex-shrink-0" style={{ background: C.line }} />

      {/* Search bar — center */}
      <button
        onClick={() => navigate('search')}
        className="flex items-center gap-3 flex-1 max-w-lg px-4 rounded-2xl text-left transition-all hover:bg-white/10"
        style={{
          background: 'rgba(255,255,255,0.06)',
          border: `1px solid ${C.line}`,
          height: 42,
        }}>
        <Search size={15} style={{ color: C.muted }} />
        <span className="flex-1 text-sm" style={{ color: C.muted }}>Search watches, bags, jewellery…</span>
        <kbd className="hidden lg:inline text-[11px] px-1.5 py-0.5 rounded font-mono"
          style={{ background: 'rgba(255,255,255,0.08)', color: C.muted }}>⌘K</kbd>
      </button>

      <div className="flex-1" />

      {/* Right icon buttons */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {rightNav.map(it => {
          const active = route.name === it.name;
          return (
            <button key={it.name} onClick={() => navigate(it.name)}
              className="relative flex items-center gap-2 px-3 h-10 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: active ? 'rgba(212,175,55,0.12)' : 'transparent',
                color: active ? C.gold : C.muted,
              }}>
              <it.icon size={18} />
              <span className="hidden xl:inline text-xs">{it.label}</span>
              {it.badge > 0 && (
                <span
                  className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full text-[9px] font-bold flex items-center justify-center"
                  style={{ background: '#ef4444', color: '#fff', padding: '0 4px' }}>
                  {it.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
}

function WhatsAppFAB() {
  const { settings } = useStore();
  if (!settings.whatsappAvailable || !settings.whatsappNumber) return null;

  const number = String(settings.whatsappNumber).replace(/\D/g, '').replace(/^0+/, '');
  if (!number) return null;

  const handleClick = () => {
    window.open(`https://api.whatsapp.com/send?phone=${number}`, '_blank');
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-transform hover:scale-110 active:scale-95"
      style={{ background: '#fff' }}
      title="Chat on WhatsApp"
    >
      <svg viewBox="0 0 48 48" width="30" height="30" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M24 4C12.954 4 4 12.954 4 24c0 3.552.945 6.89 2.596 9.77L4 44l10.476-2.558A19.9 19.9 0 0024 44c11.046 0 20-8.954 20-20S35.046 4 24 4z" fill="#25D366"/>
        <path d="M35.07 28.878c-.49-.245-2.9-1.432-3.35-1.595-.45-.163-.778-.245-1.106.245-.327.49-1.27 1.595-1.556 1.922-.286.327-.572.368-1.063.123-2.876-1.438-4.762-2.567-6.654-5.822-.503-.863.503-.802 1.437-2.669.163-.327.082-.613-.041-.858-.123-.245-1.106-2.663-1.515-3.648-.4-.958-.806-.826-1.106-.842-.286-.014-.613-.018-.94-.018-.327 0-.858.123-1.308.613-.45.49-1.718 1.678-1.718 4.095 0 2.417 1.759 4.752 2.004 5.08.245.326 3.461 5.285 8.39 7.414 3.12 1.348 4.344 1.463 5.904 1.232.95-.14 2.9-1.186 3.31-2.332.41-1.146.41-2.128.287-2.332-.118-.204-.45-.327-.94-.572z" fill="#fff"/>
      </svg>
    </button>
  );
}

export default function PhoneShell({ children }) {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <DesktopNav />
      <div className="relative flex-1 flex flex-col overflow-hidden bg-white">
        {children}
      </div>
      <WhatsAppFAB />
    </div>
  );
}
