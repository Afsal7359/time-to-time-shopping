import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, ShoppingBag, Search, X } from 'lucide-react';
import { C } from '../data';
import { useStore, useRoute } from '../contexts';
import { IconButton, Empty } from '../ui';
import BottomNav from './BottomNav';
import ProductCard from './ProductCard';

export default function CategoryScreen() {
  const { products, categories, cart } = useStore();
  const { route, navigate, back } = useRoute();
  const [activeCat, setActiveCat] = useState(route.params.id || 'all');
  const [gender, setGender] = useState('all');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('relevance');

  useEffect(() => { setActiveCat(route.params.id || 'all'); }, [route.params.id]);

  const filtered = useMemo(() => {
    let list = activeCat === 'all' ? products : products.filter(p => p.categoryId === activeCat);
    if (gender === 'men') list = list.filter(p => p.gender === 'men' || p.gender === 'unisex');
    if (gender === 'women') list = list.filter(p => p.gender === 'women' || p.gender === 'unisex');
    if (query) list = list.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
    if (sort === 'low') list = [...list].sort((a, b) => a.price - b.price);
    if (sort === 'high') list = [...list].sort((a, b) => b.price - a.price);
    if (sort === 'rating') list = [...list].sort((a, b) => b.rating - a.rating);
    return list;
  }, [products, activeCat, gender, query, sort]);

  const cartCount = cart.reduce((a, b) => a + b.qty, 0);
  const activeCatObj = categories.find(c => c.id === activeCat);

  return (
    <>
      <div className="flex-1 overflow-y-auto pb-28 md:pb-8">

        {/* ── Mobile header ── */}
        <div className="md:hidden flex items-center justify-between px-5 pt-3 pb-3 relative">
          <IconButton onClick={back}><ArrowLeft size={18} style={{ color: C.navy }} /></IconButton>
          <h1 className="absolute left-1/2 -translate-x-1/2 text-base font-bold" style={{ color: C.navy }}>
            {activeCatObj ? activeCatObj.name : 'All Products'}
          </h1>
          <IconButton onClick={() => navigate('cart')} badge={cartCount}>
            <ShoppingBag size={18} style={{ color: C.navy }} />
          </IconButton>
        </div>

        {/* ── Mobile gender toggle ── */}
        <div className="md:hidden px-5 pb-4">
          <div className="flex rounded-2xl p-1" style={{ background: C.bgSoft }}>
            {[
              { key: 'all', label: 'All' },
              { key: 'men', label: 'Men' },
              { key: 'women', label: 'Women' },
            ].map(({ key, label }) => (
              <button key={key} onClick={() => setGender(key)}
                className="flex-1 h-11 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: gender === key ? C.navy : 'transparent',
                  color: gender === key ? C.gold : C.navy,
                }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Mobile search + sort ── */}
        <div className="md:hidden px-5 pb-4 flex gap-2.5">
          <div className="flex-1 flex items-center gap-3 px-4 h-12 rounded-2xl" style={{ background: C.bgSoft }}>
            <Search size={18} style={{ color: C.muted }} />
            <input placeholder="Search products..." value={query} onChange={e => setQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm" style={{ color: C.navy }} />
            {query && <X size={16} onClick={() => setQuery('')} className="cursor-pointer" style={{ color: C.muted }} />}
          </div>
          <select value={sort} onChange={e => setSort(e.target.value)}
            className="h-12 px-3 rounded-2xl text-xs font-semibold outline-none"
            style={{ background: C.navy, color: C.gold, border: 0 }}>
            <option value="relevance">Sort ★</option>
            <option value="low">Price ↑</option>
            <option value="high">Price ↓</option>
            <option value="rating">Rating</option>
          </select>
        </div>

        {/* ── Mobile category chips ── */}
        <div className="md:hidden flex gap-2 px-5 pb-4 overflow-x-auto no-scrollbar">
          <button onClick={() => setActiveCat('all')}
            className="flex-shrink-0 px-5 h-10 rounded-full text-xs font-semibold transition-all"
            style={{ background: activeCat === 'all' ? C.navy : C.bgSoft, color: activeCat === 'all' ? C.gold : C.navy }}>
            All
          </button>
          {categories.map(c => (
            <button key={c.id} onClick={() => setActiveCat(c.id)}
              className="flex-shrink-0 px-5 h-10 rounded-full text-xs font-semibold transition-all"
              style={{ background: activeCat === c.id ? C.navy : C.bgSoft, color: activeCat === c.id ? C.gold : C.navy }}>
              {c.name}
            </button>
          ))}
        </div>

        {/* ── Desktop header ── */}
        <div className="hidden md:block border-b" style={{ borderColor: '#eee' }}>
          <div className="flex items-center justify-between px-8 py-5">
            <div className="flex items-center gap-4">
              <button onClick={back}
                className="flex items-center gap-2 text-sm font-semibold hover:opacity-70 transition-opacity"
                style={{ color: C.navy }}>
                <ArrowLeft size={16} />
              </button>
              <div className="w-px h-5" style={{ background: '#e5e5e5' }} />
              <div>
                <h1 className="text-2xl font-bold" style={{ color: C.navy, fontFamily: 'Georgia, serif' }}>
                  {activeCatObj ? activeCatObj.name : 'All Products'}
                </h1>
                <p className="text-xs mt-0.5" style={{ color: C.muted }}>
                  {filtered.length} product{filtered.length !== 1 ? 's' : ''} found
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 h-11 rounded-xl border bg-gray-50"
                style={{ borderColor: '#e5e5e5', minWidth: 220 }}>
                <Search size={15} style={{ color: C.muted }} />
                <input placeholder="Search products…" value={query} onChange={e => setQuery(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-sm" style={{ color: C.navy }} />
                {query && <X size={14} onClick={() => setQuery('')} className="cursor-pointer" style={{ color: C.muted }} />}
              </div>
              <select value={sort} onChange={e => setSort(e.target.value)}
                className="h-11 px-4 rounded-xl border text-sm font-semibold outline-none"
                style={{ borderColor: '#e5e5e5', background: '#fafafa', color: C.navy }}>
                <option value="relevance">Relevance</option>
                <option value="low">Price: Low to High</option>
                <option value="high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>
          {/* Desktop category chips */}
          <div className="flex gap-2 px-8 pb-3 overflow-x-auto no-scrollbar">
            <button onClick={() => setActiveCat('all')}
              className="flex-shrink-0 px-5 h-9 rounded-full text-xs font-semibold transition-all"
              style={{ background: activeCat === 'all' ? C.navy : C.bgSoft, color: activeCat === 'all' ? C.gold : C.navy }}>
              All Products
            </button>
            {categories.map(c => (
              <button key={c.id} onClick={() => setActiveCat(c.id)}
                className="flex-shrink-0 px-5 h-9 rounded-full text-xs font-semibold transition-all"
                style={{ background: activeCat === c.id ? C.navy : C.bgSoft, color: activeCat === c.id ? C.gold : C.navy }}>
                {c.name}
              </button>
            ))}
          </div>
          {/* Desktop gender toggle */}
          <div className="flex items-center gap-2 px-8 pb-4">
            <span className="text-xs font-semibold uppercase tracking-wider mr-1" style={{ color: C.mutedDark }}>For:</span>
            {[
              { key: 'all', label: 'All' },
              { key: 'men', label: 'Men' },
              { key: 'women', label: 'Women' },
            ].map(({ key, label }) => (
              <button key={key} onClick={() => setGender(key)}
                className="px-5 h-9 rounded-full text-xs font-semibold transition-all"
                style={{
                  background: gender === key ? C.navy : '#fff',
                  color: gender === key ? C.gold : C.navy,
                  border: gender === key ? 'none' : `1.5px solid #e0e0e0`,
                }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Product grid (shared mobile + desktop) ── */}
        {filtered.length === 0 ? (
          <Empty icon={Search} title="No products found" hint="Try a different search or category" />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5 px-5 md:px-8 pt-5 md:pt-6">
            {filtered.map(p => (
              <ProductCard key={p.id} product={p} onTap={() => navigate('product', { id: p.id })} />
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </>
  );
}
