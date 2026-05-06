import React, { useState } from 'react';
import {
  Package, Phone, Mail, MapPin, FileText,
} from 'lucide-react';
import { C, STATUS_COLORS } from '../data';
import { useStore, useToast } from '../contexts';
import { Modal } from '../ui';
import { formatPrice } from '../utils';
import AdminShell from './AdminShell';

export default function AdminOrders() {
  const { orders, settings, saveOrders } = useStore();
  const toast = useToast();
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  const updateStatus = async (id, status) => {
    const next = orders.map(o => o.id === id ? { ...o, status } : o);
    await saveOrders(next);
    setSelected(s => s ? { ...s, status } : s);
    toast(`Order ${id} → ${status}`);
  };

  return (
    <AdminShell active="adminOrders">
      <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
        {[
          { id: 'all', label: `All (${orders.length})` },
          ...Object.keys(STATUS_COLORS).map(s => ({
            id: s,
            label: STATUS_COLORS[s].label,
            count: orders.filter(o => o.status === s).length,
          })),
        ].map(t => (
          <button key={t.id} onClick={() => setFilter(t.id)}
            className="flex-shrink-0 px-4 h-9 rounded-full text-xs font-semibold transition-all"
            style={{
              background: filter === t.id ? C.navy : '#fff',
              color: filter === t.id ? C.gold : C.navy,
              border: `1px solid ${filter === t.id ? C.navy : '#eee'}`,
            }}>
            {t.label}{t.count !== undefined && t.id !== 'all' ? ` (${t.count})` : ''}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: '#eee' }}>
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-sm" style={{ color: C.muted }}>
            No orders match this filter
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: '#eee' }}>
            {filtered.map(o => {
              const sc = STATUS_COLORS[o.status] || STATUS_COLORS.pending;
              return (
                <div key={o.id} onClick={() => setSelected(o)}
                  className="p-4 flex items-center gap-4 hover:bg-gray-50 cursor-pointer">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: C.navy, color: C.gold }}>
                    <Package size={18}/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold" style={{ color: C.navy }}>#{o.id}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase"
                        style={{ background: sc.bg, color: sc.fg }}>{sc.label}</span>
                    </div>
                    <div className="text-xs truncate" style={{ color: C.mutedDark }}>
                      {o.customer.name} · {o.customer.phone} · {o.items.length} items
                    </div>
                    <div className="text-[11px]" style={{ color: C.muted }}>
                      {new Date(o.createdAt).toLocaleString('en-IN', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                      })}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-base font-bold" style={{ color: C.navy }}>
                      {formatPrice(o.total, settings.currency)}
                    </div>
                    <div className="text-[10px] uppercase font-semibold" style={{ color: C.muted }}>
                      {o.paymentMethod === 'cod' ? 'COD' : 'WhatsApp'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)}
        title={`Order #${selected?.id}`} maxWidth="max-w-2xl">
        {selected && (
          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: C.mutedDark }}>Status</p>
              <div className="flex flex-wrap gap-2">
                {Object.keys(STATUS_COLORS).map(s => (
                  <button key={s} onClick={() => updateStatus(selected.id, s)}
                    className="text-xs font-semibold px-3 py-2 rounded-lg uppercase"
                    style={{
                      background: selected.status === s ? STATUS_COLORS[s].fg : STATUS_COLORS[s].bg,
                      color: selected.status === s ? '#fff' : STATUS_COLORS[s].fg,
                    }}>
                    {STATUS_COLORS[s].label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl" style={{ background: C.bgSoft }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: C.mutedDark }}>Customer</p>
              <div className="space-y-1 text-sm" style={{ color: C.navy }}>
                <div><strong>{selected.customer.name}</strong></div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Phone size={12}/> {selected.customer.phone}
                  <a href={`tel:${selected.customer.phone}`}
                    className="text-xs underline" style={{ color: C.muted }}>Call</a>
                  <a href={`https://wa.me/91${selected.customer.phone}`}
                    target="_blank" rel="noreferrer"
                    className="text-xs underline" style={{ color: '#25D366' }}>WhatsApp</a>
                </div>
                {selected.customer.email && (
                  <div className="flex items-center gap-2"><Mail size={12}/> {selected.customer.email}</div>
                )}
                <div className="flex items-start gap-2">
                  <MapPin size={12} className="mt-0.5"/>
                  <span>{selected.customer.address}, {selected.customer.city} - {selected.customer.pincode}</span>
                </div>
                {selected.customer.notes && (
                  <div className="flex items-start gap-2 pt-2">
                    <FileText size={12} className="mt-0.5"/>
                    <span className="italic">"{selected.customer.notes}"</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: C.mutedDark }}>Items</p>
              <div className="space-y-2">
                {selected.items.map((it, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: '#fafafa' }}>
                    <img src={it.image} alt={it.name} className="w-12 h-12 rounded-lg object-cover"/>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate" style={{ color: C.navy }}>{it.name}</div>
                      <div className="text-xs" style={{ color: C.muted }}>
                        {it.variant || 'Standard'} × {it.qty}
                      </div>
                    </div>
                    <div className="text-sm font-bold" style={{ color: C.navy }}>
                      {formatPrice(it.price * it.qty, settings.currency)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl space-y-2 text-sm" style={{ background: C.navy, color: C.text }}>
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(selected.subtotal, settings.currency)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{selected.shipping === 0 ? 'FREE' : formatPrice(selected.shipping, settings.currency)}</span>
              </div>
              <div className="flex justify-between font-bold pt-2 border-t"
                style={{ borderColor: C.line, color: C.gold }}>
                <span>Total ({selected.paymentMethod === 'cod' ? 'COD' : 'WhatsApp'})</span>
                <span>{formatPrice(selected.total, settings.currency)}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </AdminShell>
  );
}
