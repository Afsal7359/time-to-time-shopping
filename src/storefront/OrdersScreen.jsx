import React from 'react';
import { Package, Sparkles } from 'lucide-react';
import { C, STATUS_COLORS } from '../data';
import { useStore, useRoute } from '../contexts';
import { Empty, PrimaryButton } from '../ui';
import { formatPrice } from '../utils';
import BottomNav from './BottomNav';

export default function OrdersScreen() {
  const { orders, settings } = useStore();
  const { navigate } = useRoute();

  return (
    <>
      <div className="flex-1 overflow-y-auto pb-28 md:pb-8">
        <div className="px-5 md:px-8 pt-3 pb-4">
          <h1 className="text-2xl font-bold" style={{ color: C.navy, fontFamily: 'Georgia, serif' }}>
            My Orders
          </h1>
          <p className="text-sm" style={{ color: C.muted }}>Track all your purchases</p>
        </div>

        {orders.length === 0 ? (
          <Empty icon={Package} title="No orders yet" hint="Time to find something special"
            action={<PrimaryButton onClick={() => navigate('home')} icon={Sparkles}>Shop Now</PrimaryButton>} />
        ) : (
          <div className="px-5 md:px-8 space-y-3 md:max-w-2xl">
            {orders.map(o => {
              const sc = STATUS_COLORS[o.status] || STATUS_COLORS.pending;
              return (
                <div key={o.id} className="p-4 rounded-2xl border" style={{ borderColor: '#eee' }}>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-xs font-semibold" style={{ color: C.muted }}>Order ID</div>
                      <div className="text-sm font-bold" style={{ color: C.navy }}>#{o.id}</div>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase"
                      style={{ background: sc.bg, color: sc.fg }}>{sc.label}</span>
                  </div>
                  <div className="flex gap-2 mb-3 overflow-x-auto no-scrollbar">
                    {o.items.slice(0, 4).map((it, i) => (
                      <img key={i} src={it.image} alt={it.name}
                        className="w-14 h-14 rounded-lg object-cover flex-shrink-0" loading="lazy" />
                    ))}
                    {o.items.length > 4 && (
                      <div className="w-14 h-14 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ background: C.bgSoft, color: C.navy }}>+{o.items.length - 4}</div>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs" style={{ color: C.mutedDark }}>
                    <span>{new Date(o.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}</span>
                    <span className="font-bold text-sm" style={{ color: C.navy }}>
                      {formatPrice(o.total, settings.currency)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <BottomNav />
    </>
  );
}
