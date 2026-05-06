import React from 'react';
import {
  ArrowLeft, Trash2, Minus, Plus, ShoppingCart,
  CreditCard, Sparkles, Tag,
} from 'lucide-react';
import { C } from '../data';
import { useStore, useRoute } from '../contexts';
import { IconButton, Empty, PrimaryButton } from '../ui';
import { formatPrice } from '../utils';
import StatusBar from './StatusBar';
import BottomNav from './BottomNav';

export default function CartScreen() {
  const { cart, products, settings, updateQty, removeFromCart } = useStore();
  const { back, navigate } = useRoute();

  const lines = cart
    .map(c => ({ ...c, product: products.find(p => p.id === c.productId) }))
    .filter(l => l.product);
  const subtotal = lines.reduce((a, l) => a + l.product.price * l.qty, 0);
  const shipping = subtotal >= settings.freeShippingMin || subtotal === 0 ? 0 : settings.shippingFee;
  const total = subtotal + shipping;

  const CartItem = ({ l }) => (
    <div className="flex gap-3 p-3 md:p-4 rounded-2xl" style={{ background: C.bgSoft }}>
      <img src={l.product.images[0]} alt={l.product.name}
        className="w-20 h-24 md:w-24 md:h-28 rounded-xl object-cover cursor-pointer flex-shrink-0"
        onClick={() => navigate('product', { id: l.product.id })} />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-semibold leading-tight" style={{ color: C.navy }}>{l.product.name}</h4>
          <button onClick={() => removeFromCart(l.productId, l.variant)} className="text-gray-400 hover:text-red-500 flex-shrink-0 transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
        {l.variant && <p className="text-xs mt-1" style={{ color: C.muted }}>{l.variant}</p>}
        <div className="flex items-center justify-between mt-3">
          <span className="text-sm font-bold" style={{ color: C.navy }}>
            {formatPrice(l.product.price * l.qty, settings.currency)}
          </span>
          <div className="flex items-center gap-1 rounded-xl" style={{ background: '#fff', border: '1px solid #eee' }}>
            <button onClick={() => updateQty(l.productId, l.variant, l.qty - 1)} className="w-8 h-8 flex items-center justify-center"><Minus size={12} /></button>
            <span className="w-6 text-center text-xs font-bold" style={{ color: C.navy }}>{l.qty}</span>
            <button onClick={() => updateQty(l.productId, l.variant, l.qty + 1)} className="w-8 h-8 flex items-center justify-center"><Plus size={12} /></button>
          </div>
        </div>
      </div>
    </div>
  );

  const OrderSummary = ({ showButton = true }) => (
    <div>
      <h3 className="text-base font-bold mb-4" style={{ color: C.navy }}>Order Summary</h3>
      <div className="space-y-3 text-sm mb-4">
        {lines.map(l => (
          <div key={`${l.productId}-${l.variant}`} className="flex justify-between" style={{ color: C.mutedDark }}>
            <span className="truncate flex-1 pr-2">{l.product.name} ×{l.qty}</span>
            <span className="flex-shrink-0 font-medium">{formatPrice(l.product.price * l.qty, settings.currency)}</span>
          </div>
        ))}
      </div>
      <div className="border-t pt-3 space-y-2" style={{ borderColor: '#eee' }}>
        <div className="flex justify-between text-sm" style={{ color: C.mutedDark }}>
          <span>Subtotal</span>
          <span style={{ color: C.navy, fontWeight: 600 }}>{formatPrice(subtotal, settings.currency)}</span>
        </div>
        <div className="flex justify-between text-sm" style={{ color: C.mutedDark }}>
          <span>Shipping</span>
          <span style={{ color: shipping === 0 ? '#16a34a' : C.navy, fontWeight: 600 }}>
            {shipping === 0 ? 'FREE' : formatPrice(shipping, settings.currency)}
          </span>
        </div>
        {shipping > 0 && (
          <div className="text-xs p-2.5 rounded-xl flex items-start gap-2" style={{ background: '#fefce8', color: '#854d0e' }}>
            <Tag size={12} className="flex-shrink-0 mt-0.5" />
            Add {formatPrice(settings.freeShippingMin - subtotal, settings.currency)} more for FREE shipping
          </div>
        )}
        <div className="flex justify-between pt-2 font-bold text-base border-t" style={{ borderColor: '#eee', color: C.navy }}>
          <span>Total</span>
          <span>{formatPrice(total, settings.currency)}</span>
        </div>
      </div>
      {showButton && (
        <div className="mt-5">
          <PrimaryButton fullWidth onClick={() => navigate('checkout')} icon={CreditCard}>
            Proceed to Checkout
          </PrimaryButton>
          <button onClick={() => navigate('home')} className="w-full mt-3 text-sm font-semibold text-center"
            style={{ color: C.muted }}>
            ← Continue Shopping
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* ════════════════ MOBILE LAYOUT ════════════════ */}
      <div className="md:hidden h-full flex flex-col relative overflow-hidden">
        <StatusBar />
        <div className="flex items-center justify-between px-5 pt-3 pb-3 relative flex-shrink-0">
          <IconButton onClick={back}><ArrowLeft size={18} style={{ color: C.navy }} /></IconButton>
          <h1 className="absolute left-1/2 -translate-x-1/2 text-base font-bold" style={{ color: C.navy }}>
            Cart {cart.length > 0 && `(${cart.length})`}
          </h1>
          <div className="w-10" />
        </div>
        <div className="flex-1 overflow-y-auto pb-32">
          {lines.length === 0 ? (
            <Empty icon={ShoppingCart} title="Your cart is empty" hint="Add something timeless"
              action={<PrimaryButton onClick={() => navigate('home')} icon={Sparkles}>Start Shopping</PrimaryButton>} />
          ) : (
            <>
              <div className="px-5 space-y-3">
                {lines.map(l => <CartItem key={`${l.productId}-${l.variant}`} l={l} />)}
              </div>
              <div className="mx-5 mt-5 p-4 rounded-2xl border" style={{ borderColor: '#eee' }}>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between" style={{ color: C.mutedDark }}>
                    <span>Subtotal</span><span style={{ color: C.navy }}>{formatPrice(subtotal, settings.currency)}</span>
                  </div>
                  <div className="flex justify-between" style={{ color: C.mutedDark }}>
                    <span>Shipping</span>
                    <span style={{ color: shipping === 0 ? '#16a34a' : C.navy }}>{shipping === 0 ? 'FREE' : formatPrice(shipping, settings.currency)}</span>
                  </div>
                  {shipping > 0 && (
                    <div className="text-[11px] p-2 rounded-lg" style={{ background: '#fefce8', color: '#854d0e' }}>
                      Add {formatPrice(settings.freeShippingMin - subtotal, settings.currency)} more for FREE shipping
                    </div>
                  )}
                  <div className="flex justify-between pt-2 mt-2 border-t font-bold text-base" style={{ borderColor: '#eee', color: C.navy }}>
                    <span>Total</span><span>{formatPrice(total, settings.currency)}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        {lines.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 bg-white border-t p-4 z-20" style={{ borderColor: '#eee' }}>
            <PrimaryButton fullWidth onClick={() => navigate('checkout')} icon={CreditCard}>
              Checkout · {formatPrice(total, settings.currency)}
            </PrimaryButton>
          </div>
        )}
        {lines.length === 0 && <BottomNav />}
      </div>

      {/* ════════════════ DESKTOP LAYOUT ════════════════ */}
      <div className="hidden md:flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-4 px-8 py-5 border-b flex-shrink-0" style={{ borderColor: '#eee' }}>
          <button onClick={back} className="flex items-center gap-2 text-sm font-semibold hover:opacity-70 transition-opacity" style={{ color: C.navy }}>
            <ArrowLeft size={16} />
          </button>
          <h1 className="text-2xl font-bold" style={{ color: C.navy, fontFamily: 'Georgia, serif' }}>
            Shopping Cart
          </h1>
          {lines.length > 0 && (
            <span className="text-sm px-3 py-1 rounded-full" style={{ background: C.bgSoft, color: C.mutedDark }}>
              {lines.length} {lines.length === 1 ? 'item' : 'items'}
            </span>
          )}
        </div>

        {lines.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <Empty icon={ShoppingCart} title="Your cart is empty" hint="Add something timeless"
              action={<PrimaryButton onClick={() => navigate('home')} icon={Sparkles}>Start Shopping</PrimaryButton>} />
          </div>
        ) : (
          <div className="flex flex-1 overflow-hidden">
            {/* Left: Cart items */}
            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4">
              {lines.map(l => <CartItem key={`${l.productId}-${l.variant}`} l={l} />)}
            </div>
            {/* Right: Summary */}
            <div className="w-96 flex-shrink-0 overflow-y-auto px-8 py-6" style={{ borderLeft: '1px solid #eee', background: '#fafafa' }}>
              <OrderSummary showButton={true} />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
