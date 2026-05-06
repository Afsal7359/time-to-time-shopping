import React from 'react';
import { Heart, Star } from 'lucide-react';
import { C } from '../data';
import { useStore } from '../contexts';
import { formatPrice } from '../utils';

export default function ProductCard({ product, onTap }) {
  const { favorites, toggleFav, settings } = useStore();
  const isFav = favorites.includes(product.id);
  const off = product.mrp > product.price ? Math.round((1 - product.price / product.mrp) * 100) : 0;

  return (
    <div onClick={onTap} className="cursor-pointer group">
      <div className="relative rounded-2xl overflow-hidden mb-2"
        style={{ background: C.bgSoft, aspectRatio: '3/4' }}>
        <img src={product.images[0]} alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"/>
        {product.badge && (
          <span className="absolute top-2 left-2 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase"
            style={{ background: '#fff', color: C.navy }}>{product.badge}</span>
        )}
        {off > 0 && (
          <span className="absolute bottom-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded"
            style={{ background: C.gold, color: C.navy }}>-{off}%</span>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); toggleFav(product.id); }}
          className="absolute top-2 right-2 w-8 h-8 rounded-xl bg-white flex items-center justify-center hover:scale-110 transition-transform">
          <Heart size={14} style={{
            color: isFav ? '#ef4444' : C.navy,
            fill: isFav ? '#ef4444' : 'none',
          }} strokeWidth={2}/>
        </button>
      </div>
      <div className="px-1">
        <div className="text-sm font-medium leading-tight mb-1 line-clamp-2" style={{ color: C.navy }}>
          {product.name}
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-[15px] font-bold" style={{ color: C.navy }}>
            {formatPrice(product.price, settings.currency)}
          </span>
          {product.mrp > product.price && (
            <span className="text-xs line-through" style={{ color: C.muted }}>
              {formatPrice(product.mrp, settings.currency)}
            </span>
          )}
        </div>
        {product.rating > 0 && (
          <div className="flex items-center gap-1 mt-1">
            <Star size={11} fill={C.gold} stroke={C.gold}/>
            <span className="text-[11px] font-semibold" style={{ color: C.navy }}>{product.rating}</span>
            <span className="text-[10px]" style={{ color: C.muted }}>({product.reviews})</span>
          </div>
        )}
      </div>
    </div>
  );
}
