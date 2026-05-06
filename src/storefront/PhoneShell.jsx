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

export default function PhoneShell({ children }) {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <DesktopNav />
      <div className="relative flex-1 flex flex-col overflow-hidden bg-white">
        {children}
      </div>
    </div>
  );
}
