import React, { useState } from 'react';
import {
  ArrowLeft, MapPin, CreditCard, Truck, MessageCircle, Check,
} from 'lucide-react';
import { C } from '../data';
import { useStore, useRoute, useToast } from '../contexts';
import { IconButton, PrimaryButton, Input, Textarea } from '../ui';
import { formatPrice, whatsappUrl, buildOrderMessage } from '../utils';
import StatusBar from './StatusBar';

export default function CheckoutScreen() {
  const { cart, products, settings, placeOrder } = useStore();
  const { back, navigate } = useRoute();
  const toast = useToast();
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', city: '', pincode: '', notes: '' });
  const [payment, setPayment] = useState('cod');
  const [submitting, setSubmitting] = useState(false);

  const lines = cart.map(c => ({ ...c, product: products.find(p => p.id === c.productId) })).filter(l => l.product);
  const subtotal = lines.reduce((a, l) => a + l.product.price * l.qty, 0);
  const shipping = subtotal >= settings.freeShippingMin ? 0 : settings.shippingFee;
  const total = subtotal + shipping;
  const valid = form.name && form.phone.length >= 10 && form.address && form.city && form.pincode.length >= 5;

  const handlePlace = async () => {
    if (!valid) { toast('Please fill all required fields', 'error'); return; }
    setSubmitting(true);
    const order = await placeOrder({ subtotal, shipping, total, customer: form, paymentMethod: payment });
    setSubmitting(false);
    if (payment === 'whatsapp') {
      const msg = buildOrderMessage({ orderId: order.id, customer: form, lines, subtotal, shipping, total, currency: settings.currency });
      window.open(whatsappUrl(settings.whatsappNumber, msg), '_blank');
    }
    navigate('orderSuccess', { id: order.id });
  };

  const AddressForm = () => (
    <div className="space-y-4">
      <Input label="Full Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Aarav Sharma" />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Phone *" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })} placeholder="9876543210" />
        <Input label="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="optional" />
      </div>
      <Input label="Street Address *" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="House no, street, area" />
      <div className="grid grid-cols-2 gap-3">
        <Input label="City *" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} placeholder="Bengaluru" />
        <Input label="PIN Code *" value={form.pincode} onChange={e => setForm({ ...form, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })} placeholder="560001" />
      </div>
      <Textarea label="Order Notes (optional)" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Any special instructions" />
    </div>
  );

  const PaymentOptions = () => (
    <div className="space-y-3">
      {settings.codAvailable && (
        <button onClick={() => setPayment('cod')}
          className="w-full p-4 rounded-2xl flex items-center gap-3 transition-all border-2"
          style={{ borderColor: payment === 'cod' ? C.gold : '#eee', background: payment === 'cod' ? '#fefce8' : '#fff' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: C.navy, color: C.gold }}>
            <Truck size={18} />
          </div>
          <div className="flex-1 text-left">
            <div className="text-sm font-bold" style={{ color: C.navy }}>Cash on Delivery</div>
            <div className="text-xs" style={{ color: C.muted }}>Pay when you receive</div>
          </div>
          {payment === 'cod' && <Check size={18} style={{ color: C.gold }} />}
        </button>
      )}
      {settings.whatsappAvailable && (
        <button onClick={() => setPayment('whatsapp')}
          className="w-full p-4 rounded-2xl flex items-center gap-3 transition-all border-2"
          style={{ borderColor: payment === 'whatsapp' ? C.gold : '#eee', background: payment === 'whatsapp' ? '#fefce8' : '#fff' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#25D366', color: '#fff' }}>
            <MessageCircle size={18} />
          </div>
          <div className="flex-1 text-left">
            <div className="text-sm font-bold" style={{ color: C.navy }}>Order on WhatsApp</div>
            <div className="text-xs" style={{ color: C.muted }}>Confirm via chat & pay later</div>
          </div>
          {payment === 'whatsapp' && <Check size={18} style={{ color: C.gold }} />}
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* ════════════════ MOBILE LAYOUT ════════════════ */}
      <div className="md:hidden h-full flex flex-col overflow-hidden relative">
        <StatusBar />
        <div className="flex items-center justify-between px-5 pt-3 pb-3 relative flex-shrink-0">
          <IconButton onClick={back}><ArrowLeft size={18} style={{ color: C.navy }} /></IconButton>
          <h1 className="absolute left-1/2 -translate-x-1/2 text-base font-bold" style={{ color: C.navy }}>Checkout</h1>
          <div className="w-10" />
        </div>
        <div className="flex-1 overflow-y-auto pb-32">
          <div className="px-5 space-y-5">
            <section>
              <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: C.navy }}>
                <MapPin size={16} style={{ color: C.gold }} /> Delivery Address
              </h3>
              <AddressForm />
            </section>
            <section>
              <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: C.navy }}>
                <CreditCard size={16} style={{ color: C.gold }} /> Payment Method
              </h3>
              <PaymentOptions />
            </section>
            <section className="p-4 rounded-2xl" style={{ background: C.bgSoft }}>
              <h4 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: C.mutedDark }}>Order Summary</h4>
              <div className="space-y-1 text-sm mb-3">
                {lines.map(l => (
                  <div key={`${l.productId}-${l.variant}`} className="flex justify-between text-xs" style={{ color: C.mutedDark }}>
                    <span>{l.product.name} × {l.qty}</span>
                    <span>{formatPrice(l.product.price * l.qty, settings.currency)}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-1 text-sm pt-2 border-t" style={{ borderColor: '#ddd' }}>
                <div className="flex justify-between" style={{ color: C.mutedDark }}><span>Subtotal</span><span>{formatPrice(subtotal, settings.currency)}</span></div>
                <div className="flex justify-between" style={{ color: C.mutedDark }}>
                  <span>Shipping</span>
                  <span style={{ color: shipping === 0 ? '#16a34a' : 'inherit' }}>{shipping === 0 ? 'FREE' : formatPrice(shipping, settings.currency)}</span>
                </div>
                <div className="flex justify-between font-bold text-base pt-1" style={{ color: C.navy }}><span>Total</span><span>{formatPrice(total, settings.currency)}</span></div>
              </div>
            </section>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t p-4 z-20" style={{ borderColor: '#eee' }}>
          <PrimaryButton fullWidth onClick={handlePlace} disabled={!valid || submitting} icon={payment === 'whatsapp' ? MessageCircle : Check}>
            {submitting ? 'Placing…' : payment === 'whatsapp' ? 'Place Order via WhatsApp' : `Place Order · ${formatPrice(total, settings.currency)}`}
          </PrimaryButton>
        </div>
      </div>

      {/* ════════════════ DESKTOP LAYOUT ════════════════ */}
      <div className="hidden md:flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-4 px-8 py-5 border-b flex-shrink-0" style={{ borderColor: '#eee' }}>
          <button onClick={back} className="flex items-center gap-2 text-sm font-semibold hover:opacity-70 transition-opacity" style={{ color: C.navy }}>
            <ArrowLeft size={16} /> Back
          </button>
          <h1 className="text-2xl font-bold" style={{ color: C.navy, fontFamily: 'Georgia, serif' }}>Checkout</h1>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left: Form */}
          <div className="flex-1 overflow-y-auto px-8 py-8">
            <section className="mb-8">
              <h2 className="text-lg font-bold mb-5 flex items-center gap-2" style={{ color: C.navy }}>
                <MapPin size={18} style={{ color: C.gold }} /> Delivery Address
              </h2>
              <AddressForm />
            </section>
            <section>
              <h2 className="text-lg font-bold mb-5 flex items-center gap-2" style={{ color: C.navy }}>
                <CreditCard size={18} style={{ color: C.gold }} /> Payment Method
              </h2>
              <PaymentOptions />
            </section>
          </div>

          {/* Right: Summary + Place Order */}
          <div className="w-96 flex-shrink-0 overflow-y-auto px-8 py-8" style={{ borderLeft: '1px solid #eee', background: '#fafafa' }}>
            <h3 className="text-lg font-bold mb-5" style={{ color: C.navy }}>Order Summary</h3>
            <div className="space-y-3 mb-5">
              {lines.map(l => (
                <div key={`${l.productId}-${l.variant}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white border" style={{ borderColor: '#eee' }}>
                  <img src={l.product.images[0]} alt={l.product.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate" style={{ color: C.navy }}>{l.product.name}</div>
                    <div className="text-xs" style={{ color: C.muted }}>{l.variant || 'Standard'} × {l.qty}</div>
                  </div>
                  <div className="text-sm font-bold flex-shrink-0" style={{ color: C.navy }}>
                    {formatPrice(l.product.price * l.qty, settings.currency)}
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t pt-4 space-y-2 mb-6" style={{ borderColor: '#eee' }}>
              <div className="flex justify-between text-sm" style={{ color: C.mutedDark }}>
                <span>Subtotal</span><span style={{ color: C.navy, fontWeight: 600 }}>{formatPrice(subtotal, settings.currency)}</span>
              </div>
              <div className="flex justify-between text-sm" style={{ color: C.mutedDark }}>
                <span>Shipping</span>
                <span style={{ color: shipping === 0 ? '#16a34a' : C.navy, fontWeight: 600 }}>
                  {shipping === 0 ? 'FREE' : formatPrice(shipping, settings.currency)}
                </span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-3" style={{ color: C.navy, borderColor: '#eee' }}>
                <span>Total</span><span>{formatPrice(total, settings.currency)}</span>
              </div>
            </div>
            <PrimaryButton fullWidth onClick={handlePlace} disabled={!valid || submitting} icon={payment === 'whatsapp' ? MessageCircle : Check}>
              {submitting ? 'Placing…' : payment === 'whatsapp' ? 'Order via WhatsApp' : `Place Order · ${formatPrice(total, settings.currency)}`}
            </PrimaryButton>
            {!valid && (
              <p className="text-xs text-center mt-3" style={{ color: C.muted }}>Fill delivery details to continue</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
