import React from 'react';
import { Heart } from 'lucide-react';
import { C } from '../data';
import { useStore, useRoute } from '../contexts';
import { Empty, PrimaryButton } from '../ui';
import StatusBar from './StatusBar';
import BottomNav from './BottomNav';
import ProductCard from './ProductCard';

export default function WishlistScreen() {
  const { products, favorites } = useStore();
  const { navigate } = useRoute();
  const list = products.filter(p => favorites.includes(p.id));

  return (
    <>
      <StatusBar />
      <div className="flex-1 overflow-y-auto pb-28 md:pb-8">
        <div className="px-5 md:px-8 pt-3 pb-4">
          <h1 className="text-2xl font-bold" style={{ color: C.navy, fontFamily: 'Georgia, serif' }}>
            Wishlist
          </h1>
          <p className="text-sm" style={{ color: C.muted }}>
            {list.length} {list.length === 1 ? 'item' : 'items'} saved
          </p>
        </div>
        {list.length === 0 ? (
          <Empty icon={Heart} title="No favorites yet" hint="Tap ♡ on any product to save"
            action={<PrimaryButton onClick={() => navigate('home')}>Discover Products</PrimaryButton>} />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 px-5 md:px-8">
            {list.map(p => (
              <ProductCard key={p.id} product={p} onTap={() => navigate('product', { id: p.id })} />
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </>
  );
}
