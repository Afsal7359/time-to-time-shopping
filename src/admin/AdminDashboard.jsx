import React from 'react';
import {
  IndianRupee, ShoppingBag, AlertCircle, Tag, Package, RotateCcw, Trash2, PackageX,
} from 'lucide-react';
import { C, STATUS_COLORS } from '../data';
import { useStore, useRoute, useToast } from '../contexts';
import { formatPrice, isZeroStock } from '../utils';
import AdminShell from './AdminShell';

const KIND_LABEL = { product: 'Product', banner: 'Banner', category: 'Category' };

function formatAgo(ts) {
  const s = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function AdminDashboard() {
  const { orders, products, settings, trash, restoreFromTrash, purgeTrashEntry } = useStore();
  const { navigate } = useRoute();
  const toast = useToast();

  const totalRevenue = orders.filter(o => o.status !== 'cancelled').reduce((a, o) => a + o.total, 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  // Products sitting at zero stock — these are hidden from the storefront and
  // are the only stock situation worth alerting on.
  const outOfStock = products.filter(isZeroStock);
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

      {outOfStock.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
          <PackageX size={20} className="text-red-600 flex-shrink-0 mt-0.5"/>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-red-900">
              {outOfStock.length} product{outOfStock.length > 1 ? 's are' : ' is'} out of stock
            </div>
            <div className="text-xs text-red-800 mt-0.5">
              {outOfStock.slice(0, 4).map(p => p.name).join(', ')}
              {outOfStock.length > 4 ? ` +${outOfStock.length - 4} more` : ''} — hidden from the store until restocked.
            </div>
          </div>
          <button onClick={() => navigate('adminStock')}
            className="text-xs font-semibold px-3 py-2 rounded-lg bg-red-600 text-white flex-shrink-0">
            Update stock
          </button>
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

      {trash.length > 0 && (
        <div className="bg-white rounded-2xl p-4 md:p-5 border mt-6" style={{ borderColor: '#eee' }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold" style={{ color: C.navy }}>Recently Deleted</h3>
            <span className="text-xs" style={{ color: C.muted }}>{trash.length} item{trash.length > 1 ? 's' : ''}</span>
          </div>
          <div className="space-y-2">
            {trash.slice(0, 10).map(t => (
              <div key={t.trashId}
                className="flex items-center justify-between p-3 rounded-xl"
                style={{ background: C.bgSoft }}>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold truncate" style={{ color: C.navy }}>
                    {t.item?.name || '(unnamed)'}
                  </div>
                  <div className="text-xs" style={{ color: C.muted }}>
                    {KIND_LABEL[t.kind] || t.kind} · {formatAgo(t.deletedAt)}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                  <button
                    onClick={async () => { await restoreFromTrash(t.trashId); toast(`${KIND_LABEL[t.kind] || 'Item'} restored`); }}
                    className="flex items-center gap-1 text-xs font-semibold px-3 py-2 rounded-lg"
                    style={{ background: C.navy, color: C.gold }}>
                    <RotateCcw size={14}/> Restore
                  </button>
                  <button
                    onClick={async () => {
                      if (!confirm('Permanently delete this item? This cannot be undone.')) return;
                      await purgeTrashEntry(t.trashId);
                      toast('Permanently removed');
                    }}
                    className="p-2 rounded-lg"
                    style={{ background: '#fee', color: '#c00' }}
                    title="Delete permanently">
                    <Trash2 size={14}/>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </AdminShell>
  );
}
