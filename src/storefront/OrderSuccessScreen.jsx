import React from 'react';
import { Check, Package } from 'lucide-react';
import { C } from '../data';
import { useStore, useRoute } from '../contexts';
import { PrimaryButton, GhostButton } from '../ui';
import { formatPrice } from '../utils';

export default function OrderSuccessScreen() {
  const { route, navigate } = useRoute();
  const { orders, settings } = useStore();
  const order = orders.find(o => o.id === route.params.id);

  return (
    <>
      <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center p-8 md:p-16 text-center">
        <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6 animate-zoom-in"
          style={{ background: `radial-gradient(circle, ${C.gold} 0%, ${C.goldDark} 100%)` }}>
          <Check size={48} style={{ color: C.navy }} strokeWidth={3}/>
        </div>
        <h1 className="text-2xl font-bold mb-2" style={{ color: C.navy, fontFamily: 'Georgia, serif' }}>
          Order Placed!
        </h1>
        <p className="text-sm mb-6" style={{ color: C.mutedDark }}>
          Thank you for shopping with us.<br/>
          Your order ID is <span className="font-bold" style={{ color: C.navy }}>{order?.id}</span>
        </p>
        <div className="w-full max-w-xs space-y-2 mb-8 p-4 rounded-2xl text-left"
          style={{ background: C.bgSoft }}>
          <div className="flex justify-between text-xs">
            <span style={{ color: C.mutedDark }}>Total</span>
            <span className="font-bold" style={{ color: C.navy }}>
              {formatPrice(order?.total || 0, settings.currency)}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span style={{ color: C.mutedDark }}>Payment</span>
            <span className="font-bold" style={{ color: C.navy }}>
              {order?.paymentMethod === 'cod' ? 'Cash on Delivery' : 'WhatsApp'}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span style={{ color: C.mutedDark }}>Status</span>
            <span className="font-bold capitalize" style={{ color: '#ea580c' }}>{order?.status}</span>
          </div>
        </div>
        <div className="space-y-2 w-full max-w-xs">
          <PrimaryButton fullWidth onClick={() => navigate('orders')} icon={Package}>
            View My Orders
          </PrimaryButton>
          <GhostButton fullWidth onClick={() => navigate('home')}>
            Continue Shopping
          </GhostButton>
        </div>
      </div>
    </>
  );
}
