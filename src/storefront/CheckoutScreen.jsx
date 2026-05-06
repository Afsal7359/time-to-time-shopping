import React, { useRef, useState } from 'react';
import {
  ArrowLeft, MapPin, CreditCard, Truck, MessageCircle, Check,
} from 'lucide-react';
import { C } from '../data';
import { useStore, useRoute, useToast } from '../contexts';
import { PrimaryButton, IconButton } from '../ui';
import { formatPrice, whatsappUrl, buildOrderMessage } from '../utils';
import StatusBar from './StatusBar';

/* ── Defined outside so React never remounts them ── */

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
        style={{ color: C.mutedDark }}>{label}</label>
      {children}
    </div>
  );
}

const inputCls = 'w-full px-4 py-3 rounded-xl border outline-none transition-colors';
const inputStyle = { borderColor: '#e5e5e5', background: '#fafafa', fontSize: 14, color: C.navy };

function PaymentOptions({ payment, setPayment, settings }) {
  return (
    <div className="space-y-3">
      {settings.codAvailable && (
        <button type="button" onClick={() => setPayment('cod')}
          className="w-full p-4 rounded-2xl flex items-center gap-3 transition-all border-2"
          style={{ borderColor: payment === 'cod' ? C.gold : '#eee', background: payment === 'cod' ? '#fefce8' : '#fff' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: C.navy, color: C.gold }}>
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
        <button type="button" onClick={() => setPayment('whatsapp')}
          className="w-full p-4 rounded-2xl flex items-center gap-3 transition-all border-2"
          style={{ borderColor: payment === 'whatsapp' ? C.gold : '#eee', background: payment === 'whatsapp' ? '#fefce8' : '#fff' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#25D366', color: '#fff' }}>
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
}

export default function CheckoutScreen() {
  const { cart, products, settings, placeOrder } = useStore();
  const { back, navigate } = useRoute();
  const toast = useToast();

  // Uncontrolled form — no re-renders while typing, guaranteed no focus loss
  const formRef = useRef(null);
  const [payment, setPayment] = useState('cod');
  const [submitting, setSubmitting] = useState(false);

  const lines = cart
    .map(c => ({ ...c, product: products.find(p => p.id === c.productId) }))
    .filter(l => l.product);
  const subtotal = lines.reduce((a, l) => a + l.product.price * l.qty, 0);
  const shipping = subtotal >= settings.freeShippingMin ? 0 : settings.shippingFee;
  const total = subtotal + shipping;

  const handlePlace = async () => {
    const fd = new FormData(formRef.current);
    const form = {
      name:    (fd.get('name')    || '').trim(),
      phone:   (fd.get('phone')   || '').trim(),
      email:   (fd.get('email')   || '').trim(),
      address: (fd.get('address') || '').trim(),
      city:    (fd.get('city')    || '').trim(),
      pincode: (fd.get('pincode') || '').trim(),
      notes:   (fd.get('notes')   || '').trim(),
    };
    if (!form.name)                { toast('Please enter your full name', 'error');              return; }
    if (form.phone.length < 10)    { toast('Please enter a valid 10-digit phone number', 'error'); return; }
    if (!form.address)             { toast('Please enter your delivery address', 'error');       return; }
    if (!form.city)                { toast('Please enter your city', 'error');                   return; }
    if (form.pincode.length < 5)   { toast('Please enter a valid PIN code', 'error');            return; }

    setSubmitting(true);
    const order = await placeOrder({ subtotal, shipping, total, customer: form, paymentMethod: payment });
    setSubmitting(false);
    if (payment === 'whatsapp') {
      const msg = buildOrderMessage({ orderId: order.id, customer: form, lines, subtotal, shipping, total, currency: settings.currency });
      window.open(whatsappUrl(settings.whatsappNumber, msg), '_blank');
    }
    navigate('orderSuccess', { id: order.id });
  };

  const SummaryBlock = () => (
    <div className="space-y-1 text-sm">
      {lines.map(l => (
        <div key={`${l.productId}-${l.variant}`} className="flex justify-between text-xs" style={{ color: C.mutedDark }}>
          <span>{l.product.name} × {l.qty}</span>
          <span>{formatPrice(l.product.price * l.qty, settings.currency)}</span>
        </div>
      ))}
      <div className="border-t pt-2 mt-2 space-y-1" style={{ borderColor: '#ddd' }}>
        <div className="flex justify-between" style={{ color: C.mutedDark }}>
          <span>Subtotal</span><span>{formatPrice(subtotal, settings.currency)}</span>
        </div>
        <div className="flex justify-between" style={{ color: C.mutedDark }}>
          <span>Shipping</span>
          <span style={{ color: shipping === 0 ? '#16a34a' : 'inherit' }}>
            {shipping === 0 ? 'FREE' : formatPrice(shipping, settings.currency)}
          </span>
        </div>
        <div className="flex justify-between font-bold text-base pt-1" style={{ color: C.navy }}>
          <span>Total</span><span>{formatPrice(total, settings.currency)}</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* ════════════════ MOBILE ════════════════ */}
      <div className="md:hidden h-full flex flex-col" style={{ background: '#fff' }}>
        <StatusBar />
        <div className="flex-shrink-0 flex items-center justify-between px-5 pt-3 pb-3 relative border-b" style={{ borderColor: '#f0f0f0' }}>
          <IconButton onClick={back}><ArrowLeft size={18} style={{ color: C.navy }} /></IconButton>
          <h1 className="absolute left-1/2 -translate-x-1/2 text-base font-bold" style={{ color: C.navy }}>Checkout</h1>
          <div className="w-10" />
        </div>

        <div className="flex-1 overflow-y-auto">
          <form ref={formRef} onSubmit={e => e.preventDefault()} className="px-5 pt-5 space-y-6 pb-6">

            <section>
              <h3 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: C.navy }}>
                <MapPin size={16} style={{ color: C.gold }} /> Delivery Address
              </h3>
              <div className="space-y-4">
                <Field label="Full Name *">
                  <input name="name" type="text" placeholder="Aarav Sharma" autoComplete="name" className={inputCls} style={inputStyle} />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Phone *">
                    <input name="phone" type="tel" placeholder="9876543210" inputMode="numeric" maxLength={10}
                      onInput={e => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10); }}
                      className={inputCls} style={inputStyle} />
                  </Field>
                  <Field label="Email">
                    <input name="email" type="email" placeholder="optional" autoComplete="email" className={inputCls} style={inputStyle} />
                  </Field>
                </div>
                <Field label="Street Address *">
                  <input name="address" type="text" placeholder="House no, street, area" autoComplete="street-address" className={inputCls} style={inputStyle} />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="City *">
                    <input name="city" type="text" placeholder="Bengaluru" autoComplete="address-level2" className={inputCls} style={inputStyle} />
                  </Field>
                  <Field label="PIN Code *">
                    <input name="pincode" type="text" placeholder="560001" inputMode="numeric" maxLength={6}
                      onInput={e => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 6); }}
                      className={inputCls} style={inputStyle} />
                  </Field>
                </div>
                <Field label="Order Notes (optional)">
                  <textarea name="notes" rows={3} placeholder="Any special instructions"
                    className="w-full px-4 py-3 rounded-xl border outline-none resize-none"
                    style={{ ...inputStyle, borderColor: '#e5e5e5' }} />
                </Field>
              </div>
            </section>

            <section>
              <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: C.navy }}>
                <CreditCard size={16} style={{ color: C.gold }} /> Payment Method
              </h3>
              <PaymentOptions payment={payment} setPayment={setPayment} settings={settings} />
            </section>

            <section className="p-4 rounded-2xl" style={{ background: C.bgSoft }}>
              <h4 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: C.mutedDark }}>Order Summary</h4>
              <SummaryBlock />
            </section>
          </form>
        </div>

        <div className="flex-shrink-0 bg-white border-t p-4" style={{ borderColor: '#eee' }}>
          <PrimaryButton fullWidth onClick={handlePlace} disabled={submitting}
            icon={payment === 'whatsapp' ? MessageCircle : Check}>
            {submitting ? 'Placing order…' : payment === 'whatsapp' ? 'Place Order via WhatsApp' : `Place Order · ${formatPrice(total, settings.currency)}`}
          </PrimaryButton>
        </div>
      </div>

      {/* ════════════════ DESKTOP ════════════════ */}
      <div className="hidden md:flex flex-col flex-1 overflow-hidden">
        <div className="flex items-center gap-4 px-8 py-5 border-b flex-shrink-0" style={{ borderColor: '#eee' }}>
          <button onClick={back} className="flex items-center gap-2 text-sm font-semibold hover:opacity-70 transition-opacity" style={{ color: C.navy }}>
            <ArrowLeft size={16} /> Back
          </button>
          <h1 className="text-2xl font-bold" style={{ color: C.navy, fontFamily: 'Georgia, serif' }}>Checkout</h1>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left: form */}
          <div className="flex-1 overflow-y-auto px-8 py-8">
            <form ref={formRef} onSubmit={e => e.preventDefault()}>
              <section className="mb-8">
                <h2 className="text-lg font-bold mb-5 flex items-center gap-2" style={{ color: C.navy }}>
                  <MapPin size={18} style={{ color: C.gold }} /> Delivery Address
                </h2>
                <div className="space-y-4">
                  <Field label="Full Name *">
                    <input name="name" type="text" placeholder="Aarav Sharma" autoComplete="name" className={inputCls} style={inputStyle} />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Phone *">
                      <input name="phone" type="tel" placeholder="9876543210" inputMode="numeric" maxLength={10}
                        onInput={e => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10); }}
                        className={inputCls} style={inputStyle} />
                    </Field>
                    <Field label="Email">
                      <input name="email" type="email" placeholder="optional" autoComplete="email" className={inputCls} style={inputStyle} />
                    </Field>
                  </div>
                  <Field label="Street Address *">
                    <input name="address" type="text" placeholder="House no, street, area" autoComplete="street-address" className={inputCls} style={inputStyle} />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="City *">
                      <input name="city" type="text" placeholder="Bengaluru" autoComplete="address-level2" className={inputCls} style={inputStyle} />
                    </Field>
                    <Field label="PIN Code *">
                      <input name="pincode" type="text" placeholder="560001" inputMode="numeric" maxLength={6}
                        onInput={e => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 6); }}
                        className={inputCls} style={inputStyle} />
                    </Field>
                  </div>
                  <Field label="Order Notes (optional)">
                    <textarea name="notes" rows={3} placeholder="Any special instructions"
                      className="w-full px-4 py-3 rounded-xl border outline-none resize-none"
                      style={{ ...inputStyle, borderColor: '#e5e5e5' }} />
                  </Field>
                </div>
              </section>
              <section>
                <h2 className="text-lg font-bold mb-5 flex items-center gap-2" style={{ color: C.navy }}>
                  <CreditCard size={18} style={{ color: C.gold }} /> Payment Method
                </h2>
                <PaymentOptions payment={payment} setPayment={setPayment} settings={settings} />
              </section>
            </form>
          </div>

          {/* Right: summary */}
          <div className="w-96 flex-shrink-0 overflow-y-auto px-8 py-8" style={{ borderLeft: '1px solid #eee', background: '#fafafa' }}>
            <h3 className="text-lg font-bold mb-5" style={{ color: C.navy }}>Order Summary</h3>
            <div className="space-y-3 mb-5">
              {lines.map(l => (
                <div key={`${l.productId}-${l.variant}`} className="flex items-center gap-3 p-3 rounded-xl bg-white border" style={{ borderColor: '#eee' }}>
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
            <PrimaryButton fullWidth onClick={handlePlace} disabled={submitting}
              icon={payment === 'whatsapp' ? MessageCircle : Check}>
              {submitting ? 'Placing order…' : payment === 'whatsapp' ? 'Order via WhatsApp' : `Place Order · ${formatPrice(total, settings.currency)}`}
            </PrimaryButton>
          </div>
        </div>
      </div>
    </>
  );
}
