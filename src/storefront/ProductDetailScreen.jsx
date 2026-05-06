import React, { useState } from 'react';
import {
  ArrowLeft, ShoppingBag, Heart, ChevronLeft, ChevronRight,
  Star, Minus, Plus, MessageCircle, AlertCircle,
} from 'lucide-react';
import { C } from '../data';
import { useStore, useRoute, useToast } from '../contexts';
import { IconButton, Empty, PrimaryButton } from '../ui';
import { formatPrice, whatsappUrl, buildProductInquiry } from '../utils';
import StatusBar from './StatusBar';

export default function ProductDetailScreen() {
  const { products, addToCart, settings, favorites, toggleFav } = useStore();
  const { route, back, navigate } = useRoute();
  const toast = useToast();
  const product = products.find(p => p.id === route.params.id);
  const [imgIdx, setImgIdx] = useState(0);
  const [variant, setVariant] = useState(product?.variants?.[0] || '');
  const [qty, setQty] = useState(1);
  const [showFullDesc, setShowFullDesc] = useState(false);

  if (!product) {
    return (
      <>
        <StatusBar />
        <Empty icon={AlertCircle} title="Product not found"
          action={<PrimaryButton onClick={back}>Go back</PrimaryButton>} />
      </>
    );
  }

  const off = product.mrp > product.price ? Math.round((1 - product.price / product.mrp) * 100) : 0;
  const isFav = favorites.includes(product.id);

  const handleAdd = () => { addToCart(product.id, variant, qty); toast(`Added ${qty} × ${product.name}`); };
  const handleBuyNow = () => { addToCart(product.id, variant, qty); navigate('cart'); };
  const handleWhatsapp = () => {
    const msg = buildProductInquiry({ brandName: settings.brandName, product, variant, qty, currency: settings.currency });
    window.open(whatsappUrl(settings.whatsappNumber, msg), '_blank');
  };

  const variantLabel = product.variants?.[0]?.match(/\d+mm/) ? 'Case Size' :
    product.variants?.[0]?.match(/Size/) ? 'Ring Size' :
    isNaN(product.variants?.[0]) ? 'Colour' : 'Size';

  const prevImg = () => setImgIdx(i => (i - 1 + product.images.length) % product.images.length);
  const nextImg = () => setImgIdx(i => (i + 1) % product.images.length);

  return (
    <>
      {/* ════════════════ MOBILE LAYOUT ════════════════ */}
      <div className="md:hidden h-full flex flex-col" style={{ background: C.navy }}>
        <StatusBar light />

        {/* Fixed header strip */}
        <div className="flex-shrink-0 flex items-center justify-between px-5 pt-3 pb-3 relative">
          <IconButton onClick={back} dark><ArrowLeft size={18} style={{ color: C.gold }} /></IconButton>
          <h1 className="absolute left-1/2 -translate-x-1/2 text-base font-bold" style={{ color: C.gold }}>
            Product Details
          </h1>
          <div className="flex gap-2">
            <IconButton onClick={() => toggleFav(product.id)} dark>
              <Heart size={16} style={{ color: isFav ? '#ef4444' : C.gold, fill: isFav ? '#ef4444' : 'none' }} />
            </IconButton>
            <IconButton onClick={() => navigate('cart')} dark>
              <ShoppingBag size={16} style={{ color: C.gold }} />
            </IconButton>
          </div>
        </div>

        {/* Single unified scroll — image + content together */}
        <div className="flex-1 overflow-y-auto">

          {/* Image carousel — part of the scroll flow */}
          <div className="relative mx-5 mb-0 rounded-3xl overflow-hidden"
            style={{ aspectRatio: '1/1.05', background: C.navyLight }}>
            <img src={product.images[imgIdx]} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
            {product.images.length > 1 && (
              <>
                <button onClick={prevImg} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center">
                  <ChevronLeft size={18} />
                </button>
                <button onClick={nextImg} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center">
                  <ChevronRight size={18} />
                </button>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-1.5">
                  {product.images.map((_, i) => (
                    <span key={i} onClick={() => setImgIdx(i)} className="cursor-pointer transition-all"
                      style={{ width: 4, height: i === imgIdx ? 18 : 4, borderRadius: 2, background: i === imgIdx ? C.gold : 'rgba(255,255,255,.5)' }} />
                  ))}
                </div>
              </>
            )}
            {off > 0 && (
              <span className="absolute top-4 left-4 text-xs font-bold px-3 py-1.5 rounded-lg"
                style={{ background: C.gold, color: C.navy }}>SAVE {off}%</span>
            )}
          </div>

          {/* Product details — flows directly below the image */}
          <div className="rounded-t-3xl bg-white px-5 pt-5 pb-6 -mt-4 relative z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: C.muted }}>{product.badge || 'Premium'}</span>
              <div className="flex items-center gap-1">
                <Star size={14} fill={C.gold} stroke={C.gold} />
                <span className="text-sm font-semibold" style={{ color: C.navy }}>{product.rating}</span>
                <span className="text-xs" style={{ color: C.muted }}>({product.reviews} reviews)</span>
              </div>
            </div>
            <div className="flex items-start justify-between gap-4 mb-5">
              <h1 className="text-2xl font-bold leading-tight" style={{ color: C.navy, fontFamily: 'Georgia, serif' }}>{product.name}</h1>
              <div className="text-right flex-shrink-0">
                {product.mrp > product.price && <div className="text-xs line-through" style={{ color: C.muted }}>{formatPrice(product.mrp, settings.currency)}</div>}
                <div className="text-xl font-bold" style={{ color: C.navy }}>{formatPrice(product.price, settings.currency)}</div>
              </div>
            </div>
            {product.variants?.length > 0 && (
              <div className="mb-5">
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: C.mutedDark }}>{variantLabel}</p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map(v => (
                    <button key={v} onClick={() => setVariant(v)}
                      className="px-4 h-10 rounded-xl text-sm font-semibold transition-all"
                      style={{ background: variant === v ? C.navy : '#fff', color: variant === v ? C.gold : C.navy, border: variant === v ? 'none' : '1.5px solid #e5e5e5' }}>{v}</button>
                  ))}
                </div>
              </div>
            )}
            <div className="mb-5 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: C.mutedDark }}>Quantity</span>
              <div className="flex items-center gap-1 rounded-xl" style={{ background: C.bgSoft }}>
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-9 h-9 flex items-center justify-center"><Minus size={14} /></button>
                <span className="w-8 text-center text-sm font-bold" style={{ color: C.navy }}>{qty}</span>
                <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="w-9 h-9 flex items-center justify-center"><Plus size={14} /></button>
              </div>
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: C.mutedDark }}>Description</p>
            <p className="text-sm leading-relaxed mb-2" style={{ color: C.mutedDark }}>
              {showFullDesc ? product.description : product.description.slice(0, 140) + (product.description.length > 140 ? '...' : '')}
              {product.description.length > 140 && (
                <button onClick={() => setShowFullDesc(s => !s)} className="ml-1 font-semibold" style={{ color: C.navy }}>
                  {showFullDesc ? 'Show less' : 'Read more'}
                </button>
              )}
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs">
              <span className={`w-2 h-2 rounded-full ${product.stock > 5 ? 'bg-green-500' : 'bg-orange-500'}`} />
              <span style={{ color: product.stock > 5 ? '#16a34a' : '#ea580c' }}>
                {product.stock > 5 ? 'In stock' : product.stock > 0 ? `Only ${product.stock} left` : 'Out of stock'}
              </span>
            </div>
          </div>
        </div>

        {/* Action bar — always at bottom, never scrolls */}
        <div className="flex-shrink-0 bg-white border-t px-5 py-3 flex gap-2" style={{ borderColor: '#eee' }}>
          <button onClick={handleWhatsapp} className="flex-shrink-0 h-12 px-4 rounded-2xl flex items-center justify-center gap-1.5 text-sm font-semibold" style={{ background: '#25D366', color: '#fff' }}>
            <MessageCircle size={16} /> WhatsApp
          </button>
          <button onClick={handleAdd} className="flex-1 h-12 rounded-2xl flex items-center justify-center gap-2 text-sm font-semibold" style={{ background: '#fff', color: C.navy, border: `1.5px solid ${C.gold}` }}>
            <ShoppingBag size={14} /> Add
          </button>
          <button onClick={handleBuyNow} disabled={product.stock === 0} className="flex-1 h-12 rounded-2xl text-sm font-semibold disabled:opacity-50"
            style={{ background: `linear-gradient(135deg, ${C.gold}, ${C.goldDark})`, color: C.navy }}>
            Buy Now
          </button>
        </div>
      </div>

      {/* ════════════════ DESKTOP LAYOUT ════════════════ */}
      {/* Single outer scroll — no nested independent scrolls */}
      <div className="hidden md:flex flex-1 overflow-y-auto">
        <div className="flex w-full">

          {/* Left: Image panel — sticky so it stays in view while details scroll */}
          <div className="w-[48%] flex-shrink-0 flex flex-col"
            style={{ position: 'sticky', top: 0, alignSelf: 'flex-start', height: 'calc(100vh - 72px)', background: C.navyCard }}>
            <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{ borderBottom: `1px solid ${C.line}` }}>
              <button onClick={back} className="flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-70" style={{ color: C.muted }}>
                <ArrowLeft size={16} /> Back to Products
              </button>
              <div className="flex gap-2">
                <button onClick={() => toggleFav(product.id)} className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors hover:bg-white/10"
                  style={{ border: `1px solid ${C.line}` }}>
                  <Heart size={16} style={{ color: isFav ? '#ef4444' : C.gold, fill: isFav ? '#ef4444' : 'none' }} />
                </button>
                <button onClick={() => navigate('cart')} className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors hover:bg-white/10"
                  style={{ border: `1px solid ${C.line}` }}>
                  <ShoppingBag size={16} style={{ color: C.gold }} />
                </button>
              </div>
            </div>
            <div className="flex-1 relative overflow-hidden">
              <img src={product.images[imgIdx]} alt={product.name}
                className="w-full h-full object-contain p-10" loading="lazy"
                style={{ background: C.navyCard }} />
              {product.images.length > 1 && (
                <>
                  <button onClick={prevImg} className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/90 flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                    <ChevronLeft size={20} />
                  </button>
                  <button onClick={nextImg} className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/90 flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
              {off > 0 && (
                <span className="absolute top-5 left-5 text-sm font-bold px-4 py-1.5 rounded-xl"
                  style={{ background: C.gold, color: C.navy }}>SAVE {off}%</span>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-3 p-4 overflow-x-auto no-scrollbar flex-shrink-0" style={{ borderTop: `1px solid ${C.line}` }}>
                {product.images.map((img, i) => (
                  <button key={i} onClick={() => setImgIdx(i)}
                    className="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden transition-all hover:scale-105"
                    style={{ border: `2px solid ${i === imgIdx ? C.gold : 'transparent'}`, opacity: i === imgIdx ? 1 : 0.55 }}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Details — natural flow, no inner scroll */}
          <div className="flex-1 bg-white flex flex-col">
            <div className="px-10 py-8 flex-1">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full"
                  style={{ background: `${C.gold}20`, color: C.goldDark }}>{product.badge || 'Premium'}</span>
                <div className="flex items-center gap-1.5">
                  <Star size={16} fill={C.gold} stroke={C.gold} />
                  <span className="text-base font-bold" style={{ color: C.navy }}>{product.rating}</span>
                  <span className="text-sm" style={{ color: C.muted }}>({product.reviews} reviews)</span>
                </div>
              </div>
              <h1 className="text-3xl font-bold leading-tight mb-2" style={{ color: C.navy, fontFamily: 'Georgia, serif' }}>
                {product.name}
              </h1>
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-3xl font-bold" style={{ color: C.navy }}>{formatPrice(product.price, settings.currency)}</span>
                {product.mrp > product.price && (
                  <>
                    <span className="text-lg line-through" style={{ color: C.muted }}>{formatPrice(product.mrp, settings.currency)}</span>
                    <span className="text-sm font-bold px-2 py-0.5 rounded" style={{ background: '#dcfce7', color: '#15803d' }}>{off}% off</span>
                  </>
                )}
              </div>
              <div className="border-t mb-6" style={{ borderColor: '#f0f0f0' }} />
              {product.variants?.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: C.mutedDark }}>{variantLabel}</p>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map(v => (
                      <button key={v} onClick={() => setVariant(v)}
                        className="px-5 h-11 rounded-xl text-sm font-semibold transition-all"
                        style={{ background: variant === v ? C.navy : '#fff', color: variant === v ? C.gold : C.navy, border: variant === v ? 'none' : '1.5px solid #e0e0e0' }}>{v}</button>
                    ))}
                  </div>
                </div>
              )}
              <div className="mb-6 flex items-center justify-between">
                <span className="text-sm font-bold uppercase tracking-wider" style={{ color: C.mutedDark }}>Quantity</span>
                <div className="flex items-center gap-2 rounded-2xl px-2" style={{ background: C.bgSoft }}>
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-200 transition-colors"><Minus size={16} /></button>
                  <span className="w-10 text-center text-base font-bold" style={{ color: C.navy }}>{qty}</span>
                  <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-200 transition-colors"><Plus size={16} /></button>
                </div>
              </div>
              <div className="border-t mb-6" style={{ borderColor: '#f0f0f0' }} />
              <div className="mb-6">
                <p className="text-sm font-bold uppercase tracking-wider mb-2" style={{ color: C.mutedDark }}>Description</p>
                <p className="text-sm leading-relaxed" style={{ color: '#555', lineHeight: 1.7 }}>
                  {showFullDesc ? product.description : product.description.slice(0, 200) + (product.description.length > 200 ? '…' : '')}
                  {product.description.length > 200 && (
                    <button onClick={() => setShowFullDesc(s => !s)} className="ml-1 font-semibold underline" style={{ color: C.navy }}>
                      {showFullDesc ? 'Read less' : 'Read more'}
                    </button>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm mb-8">
                <span className={`w-2.5 h-2.5 rounded-full ${product.stock > 5 ? 'bg-green-500' : 'bg-orange-500'}`} />
                <span className="font-semibold" style={{ color: product.stock > 5 ? '#15803d' : '#c2410c' }}>
                  {product.stock > 5 ? 'In stock — ships within 2 business days' : product.stock > 0 ? `Only ${product.stock} left — order soon!` : 'Currently out of stock'}
                </span>
              </div>
            </div>

            {/* Action bar — inline at bottom of content, sticky to viewport bottom */}
            <div className="px-10 py-5 border-t flex gap-3"
              style={{ borderColor: '#eee', background: '#fff', position: 'sticky', bottom: 0 }}>
              <button onClick={handleWhatsapp}
                className="px-5 rounded-2xl flex items-center justify-center gap-2 text-sm font-semibold flex-shrink-0"
                style={{ background: '#25D366', color: '#fff', height: 52 }}>
                <MessageCircle size={18} /> WhatsApp
              </button>
              <button onClick={handleAdd}
                className="flex-1 rounded-2xl flex items-center justify-center gap-2 text-sm font-semibold transition-all hover:bg-gray-50"
                style={{ background: '#fff', color: C.navy, border: `2px solid ${C.gold}`, height: 52 }}>
                <ShoppingBag size={16} /> Add to Cart
              </button>
              <button onClick={handleBuyNow} disabled={product.stock === 0}
                className="flex-1 rounded-2xl text-sm font-bold transition-all hover:opacity-90 disabled:opacity-50"
                style={{ background: `linear-gradient(135deg, ${C.gold}, ${C.goldDark})`, color: C.navy, height: 52 }}>
                Buy Now
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
