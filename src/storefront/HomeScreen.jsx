import React, { useState, useEffect } from 'react';
import {
  Bell, ShoppingBag, Search, SlidersHorizontal,
  Truck, Banknote, Clock,
} from 'lucide-react';
import { C } from '../data';
import { useStore, useRoute } from '../contexts';
import { IconButton, LogoFull } from '../ui';
import BottomNav from './BottomNav';
import ProductCard from './ProductCard';

export default function HomeScreen() {
  const { products, categories, banners } = useStore();
  const { navigate } = useRoute();
  const [bannerIdx, setBannerIdx] = useState(0);

  const activeBanners = banners.filter(b => b.active);
  const trending = products.filter(p => p.featured).slice(0, 8);

  useEffect(() => {
    if (activeBanners.length < 2) return;
    const t = setInterval(() => setBannerIdx(i => (i + 1) % activeBanners.length), 4500);
    return () => clearInterval(t);
  }, [activeBanners.length]);

  const banner = activeBanners[bannerIdx] || activeBanners[0];

  return (
    <>
      <div className="flex-1 overflow-y-auto pb-28 md:pb-12">

        {/* Mobile header */}
        <div className="md:hidden flex items-center justify-between px-5 pt-3 pb-3">
          <LogoFull />
          <div className="flex gap-2">
            <IconButton onClick={() => navigate('search')}>
              <Bell size={18} style={{ color: C.navy }} />
            </IconButton>
            <IconButton onClick={() => navigate('cart')}>
              <ShoppingBag size={18} style={{ color: C.navy }} />
            </IconButton>
          </div>
        </div>

        {/* Mobile-only search bar (desktop search is in the navbar) */}
        <div className="md:hidden px-5 pb-4 flex gap-2.5">
          <div className="flex-1 flex items-center gap-3 px-4 h-12 rounded-2xl" style={{ background: C.bgSoft }}>
            <Search size={18} style={{ color: C.muted }} />
            <input
              placeholder="Search luxury watches, bags..."
              onFocus={() => navigate('search')}
              readOnly
              className="flex-1 bg-transparent outline-none text-sm cursor-pointer"
              style={{ color: C.navy }} />
          </div>
          <button onClick={() => navigate('search')}
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: C.navy }}>
            <SlidersHorizontal size={18} style={{ color: C.gold }} />
          </button>
        </div>

        {/* Hero banner */}
        {banner && (
          <div
            className="mx-5 md:mx-8 mb-6 rounded-3xl overflow-hidden relative cursor-pointer"
            onClick={() => navigate('category', { id: banner.categoryId })}
            style={{
              background: `linear-gradient(120deg, ${C.navy} 0%, ${C.navyLight} 100%)`,
              minHeight: 200,
            }}>
            <div className="absolute inset-0"
              style={{
                backgroundImage: `url(${banner.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: 0.45,
              }} />
            <div className="absolute inset-0"
              style={{ background: 'linear-gradient(90deg, rgba(10,16,24,0.96) 0%, rgba(10,16,24,0.55) 55%, rgba(10,16,24,0.1) 100%)' }} />
            <div className="relative px-6 py-8 md:px-14 md:py-14 flex flex-col justify-center"
              style={{ minHeight: 200 }}>
              <span className="self-start text-[10px] md:text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-3"
                style={{ background: C.gold, color: C.navy }}>Featured Collection</span>
              <h2 className="text-2xl md:text-5xl font-bold mb-2 md:mb-3 leading-tight"
                style={{ color: C.gold, fontFamily: 'Georgia, serif', maxWidth: 540 }}>
                {banner.title}
              </h2>
              <p className="text-sm md:text-lg mb-4 md:mb-7 leading-relaxed"
                style={{ color: '#e8d089', maxWidth: 420 }}>{banner.subtitle}</p>
              <button
                className="self-start px-5 md:px-8 py-2.5 md:py-3.5 rounded-xl text-sm md:text-base font-semibold transition-transform hover:scale-[1.03]"
                style={{ background: C.gold, color: C.navy }}>{banner.cta}</button>
            </div>
            {activeBanners.length > 1 && (
              <div className="absolute bottom-4 right-6 flex gap-1.5">
                {activeBanners.map((_, i) => (
                  <span key={i} className="rounded-full transition-all"
                    style={{
                      width: i === bannerIdx ? 20 : 6,
                      height: 5,
                      background: i === bannerIdx ? C.gold : 'rgba(255,255,255,.4)',
                    }} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Categories */}
        <div className="flex items-center justify-between px-5 md:px-8 mb-3">
          <h3 className="text-lg font-bold" style={{ color: C.navy, fontFamily: 'Georgia, serif' }}>
            Shop by Category
          </h3>
          <button onClick={() => navigate('search')} className="text-xs font-semibold" style={{ color: C.muted }}>
            See all
          </button>
        </div>
        <div className="flex gap-3 md:gap-5 px-5 md:px-8 mb-7 overflow-x-auto pb-2 no-scrollbar">
          {categories.map(cat => (
            <button key={cat.id} onClick={() => navigate('category', { id: cat.id })}
              className="flex-shrink-0 flex flex-col items-center group" style={{ width: 76 }}>
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mb-2 overflow-hidden border-2 group-hover:scale-105 transition-transform"
                style={{ borderColor: C.gold, background: '#fafafa' }}>
                {cat.image ? (
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <span className="text-2xl">{cat.icon}</span>
                )}
              </div>
              <span className="text-xs font-medium text-center leading-tight" style={{ color: C.navy }}>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Trending Now */}
        <div className="flex items-center justify-between px-5 md:px-8 mb-3">
          <h3 className="text-lg font-bold" style={{ color: C.navy, fontFamily: 'Georgia, serif' }}>
            Trending Now
          </h3>
          <button onClick={() => navigate('category', { id: 'all' })} className="text-xs font-semibold" style={{ color: C.muted }}>
            See all
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5 px-5 md:px-8">
          {trending.map(p => (
            <ProductCard key={p.id} product={p} onTap={() => navigate('product', { id: p.id })} />
          ))}
        </div>

        {/* Trust strip */}
        <div className="mx-5 md:mx-8 mt-8 mb-4 grid grid-cols-3 gap-2 p-4 md:p-7 rounded-2xl md:rounded-3xl"
          style={{ background: C.navy }}>
          {[
            { icon: Truck,    label: 'Free Shipping',      sub: 'Orders above QAR69' },
            { icon: Banknote, label: 'Cash on Delivery',   sub: 'Available' },
            { icon: Clock,    label: 'Same Day Delivery',  sub: 'Available' },
          ].map((it, i) => (
            <div key={i} className="text-center">
              <it.icon size={22} style={{ color: C.gold, margin: '0 auto 6px' }} />
              <div className="text-[11px] md:text-sm font-semibold" style={{ color: C.goldLight }}>{it.label}</div>
              <div className="hidden md:block text-xs mt-1" style={{ color: C.muted }}>{it.sub}</div>
            </div>
          ))}
        </div>

      </div>
      <BottomNav />
    </>
  );
}
