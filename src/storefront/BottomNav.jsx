import React from 'react';
import { Home, Heart, ShoppingBag, Package } from 'lucide-react';
import { C } from '../data';
import { useRoute, useStore } from '../contexts';

export default function BottomNav() {
  const { route, navigate } = useRoute();
  const { cart, favorites } = useStore();
  const items = [
    { name: 'home',     icon: Home,        label: 'Home' },
    { name: 'wishlist', icon: Heart,       label: 'Wishlist', badge: favorites.length },
    { name: 'cart',     icon: ShoppingBag, label: 'Cart', badge: cart.reduce((a, b) => a + b.qty, 0) },
    { name: 'orders',   icon: Package,     label: 'Orders' },
  ];

  return (
    <div className="md:hidden fixed left-1/2 -translate-x-1/2 bottom-4 z-30 flex items-center gap-1 px-2 py-2 rounded-full"
      style={{ background: '#fff', boxShadow: '0 10px 30px rgba(0,0,0,.15)' }}>
      {items.map(it => {
        const active = route.name === it.name;
        return (
          <button key={it.name} onClick={() => navigate(it.name)}
            className="relative w-12 h-12 rounded-full flex items-center justify-center transition-all"
            style={{
              background: active ? `radial-gradient(circle at 30% 30%, ${C.goldLight}, ${C.gold} 70%)` : 'transparent',
            }}>
            <it.icon size={20} style={{
              color: C.navy,
              fill: active ? C.navy : 'none',
            }} strokeWidth={2}/>
            {it.badge > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] rounded-full text-[9px] font-bold flex items-center justify-center px-1"
                style={{ background: '#ef4444', color: '#fff' }}>{it.badge}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
