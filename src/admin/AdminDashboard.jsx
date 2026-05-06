import React from 'react';
import {
  IndianRupee, ShoppingBag, AlertCircle, Tag, Package,
} from 'lucide-react';
import { C, STATUS_COLORS } from '../data';
import { useStore, useRoute } from '../contexts';
import { formatPrice } from '../utils';
import AdminShell from './AdminShell';

export default function AdminDashboard() {
  const { orders, products, settings } = useStore();
  const { navigate } = useRoute();

  const totalRevenue = orders.filter(o => o.status !== 'cancelled').reduce((a, o) => a + o.total, 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const lowStock = products.filter(p => p.stock < 10).length;
  const recentOrders = orders.slice(0, 5);

  const stats = [
    { label: 'Total Revenue', value: formatPrice(totalRevenue, settings.currency), icon: IndianRupee, color: '#16a34a' },
    { label: 'Total Orders',  value: orders.length, icon: ShoppingBag, color: '#3b82f6' },
    { label: 'Pending',       value: pendingOrders, icon: AlertCircle, color: '#ea580c' },
    { label: 'Products',      value: products.length, icon: Tag, color: '#8b5cf6' },
  ];

  return (
    <AdminShell active="adminDashboard">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-4 border" style={{ borderColor: '#eee' }}>
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: `${s.color}15`, color: s.color }}>
                <s.icon size={18}/>
              </div>
            </div>
            <div className="text-xs font-semibold mb-1" style={{ color: C.mutedDark }}>{s.label}</div>
            <div className="text-xl md:text-2xl font-bold" style={{ color: C.navy }}>{s.value}</div>
          </div>
        ))}
      </div>

      {lowStock > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
          <AlertCircle size={20} className="text-orange-600 flex-shrink-0"/>
          <div className="flex-1">
            <div className="text-sm font-bold text-orange-900">
              {lowStock} product{lowStock > 1 ? 's' : ''} low on stock
            </div>
            <div className="text-xs text-orange-800">Restock to avoid losing sales</div>
          </div>
          <button onClick={() => navigate('adminProducts')}
            className="text-xs font-semibold px-3 py-2 rounded-lg bg-orange-600 text-white">View</button>
        </div>
      )}

      <div className="bg-white rounded-2xl p-4 md:p-5 border" style={{ borderColor: '#eee' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold" style={{ color: C.navy }}>Recent Orders</h3>
          <button onClick={() => navigate('adminOrders')}
            className="text-xs font-semibold" style={{ color: C.muted }}>View all →</button>
        </div>
        {recentOrders.length === 0 ? (
          <p className="text-sm text-center py-8" style={{ color: C.muted }}>
            No orders yet — they'll appear here once customers buy something.
          </p>
        ) : (
          <div className="space-y-2">
            {recentOrders.map(o => {
              const sc = STATUS_COLORS[o.status] || STATUS_COLORS.pending;
              return (
                <div key={o.id} onClick={() => navigate('adminOrders')}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: C.bgSoft, color: C.navy }}>
                      <Package size={16}/>
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold truncate" style={{ color: C.navy }}>#{o.id}</div>
                      <div className="text-xs truncate" style={{ color: C.muted }}>
                        {o.customer.name} · {o.items.length} items
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <div className="text-sm font-bold" style={{ color: C.navy }}>
                      {formatPrice(o.total, settings.currency)}
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase"
                      style={{ background: sc.bg, color: sc.fg }}>{sc.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
