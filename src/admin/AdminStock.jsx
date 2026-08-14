import React, { useMemo, useState } from 'react';
import {
  Search, Minus, Plus, Save, PackageX, PackageCheck, Boxes,
  Eye, EyeOff, X, Loader2, CheckCircle2,
} from 'lucide-react';
import { C } from '../data';
import { useStore, useToast } from '../contexts';
import { formatPrice, stockCount, isZeroStock, isHiddenWithStock } from '../utils';
import { Empty } from '../ui';
import AdminShell from './AdminShell';

const Chip = ({ children, bg, fg }) => (
  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide whitespace-nowrap"
    style={{ background: bg, color: fg }}>{children}</span>
);

/* Small square button used for the quick +5 / +10 style actions */
const MiniButton = ({ children, onClick, title, danger = false }) => (
  <button type="button" onClick={onClick} title={title}
    className="h-9 px-2.5 rounded-lg border text-xs font-bold flex items-center gap-1 flex-shrink-0 transition-colors hover:bg-gray-50"
    style={{ borderColor: danger ? '#fecaca' : '#e5e5e5', color: danger ? '#b91c1c' : C.navy }}>
    {children}
  </button>
);

export default function AdminStock() {
  const { products, categories, settings, saveProducts } = useStore();
  const toast = useToast();

  // Land on the out-of-stock list when there is something to fix, otherwise
  // show everything so the admin can just edit numbers.
  const [tab, setTab] = useState(() => (products.some(isZeroStock) ? 'out' : 'all'));
  const [search, setSearch] = useState('');
  const [drafts, setDrafts] = useState({});    // { [productId]: '12' } — unsaved edits
  const [selected, setSelected] = useState([]); // product ids ticked for bulk edit
  const [bulkValue, setBulkValue] = useState('');
  const [saving, setSaving] = useState(false);

  const outList = products.filter(isZeroStock);
  const hiddenList = products.filter(isHiddenWithStock);
  const totalUnits = products.reduce((a, p) => a + stockCount(p), 0);

  /* ── draft helpers ─────────────────────────────────────────────── */
  const valueOf = p => (drafts[p.id] !== undefined ? drafts[p.id] : String(stockCount(p)));
  const isDirty = p =>
    drafts[p.id] !== undefined && drafts[p.id] !== '' && Number(drafts[p.id]) !== stockCount(p);
  const setDraft = (id, v) => setDrafts(d => ({ ...d, [id]: v }));
  const bump = (p, delta) => setDraft(p.id, String(Math.max(0, (Number(valueOf(p)) || 0) + delta)));
  const dirtyProducts = products.filter(isDirty);

  /* ── saving ────────────────────────────────────────────────────── */
  // Stock is the single source of truth for availability:
  //   set to 0        → product is marked out of stock and leaves the storefront
  //   0 → any number  → product is restocked and comes back to the storefront
  //   otherwise       → a manual "hide" stays untouched
  const commit = async (edits) => {
    const map = new Map(edits.map(e => [e.id, e.stock]));
    const next = products.map(p => {
      if (!map.has(p.id)) return p;
      const n = map.get(p.id);
      const prev = stockCount(p);
      const updated = { ...p, stock: n };
      if (n === 0) updated.outOfStock = true;
      else if (prev === 0) updated.outOfStock = false;
      return updated;
    });
    setSaving(true);
    try {
      await saveProducts(next);
    } finally {
      setSaving(false);
    }
  };

  const saveAll = async () => {
    const edits = dirtyProducts.map(p => ({ id: p.id, stock: Number(drafts[p.id]) || 0 }));
    if (!edits.length) return;
    await commit(edits);
    setDrafts({});
    setSelected([]);
    const zeroed = edits.filter(e => e.stock === 0).length;
    toast(
      `Stock updated for ${edits.length} product${edits.length > 1 ? 's' : ''}` +
      (zeroed ? ` · ${zeroed} now out of stock` : '')
    );
  };

  // Visibility isn't a number, so it saves on click rather than joining the
  // draft batch.
  const toggleVisibility = async (p) => {
    const next = products.map(x => (x.id === p.id ? { ...x, outOfStock: !x.outOfStock } : x));
    setSaving(true);
    try {
      await saveProducts(next);
      toast(p.outOfStock ? `${p.name} is visible in the store` : `${p.name} hidden from the store`);
    } finally {
      setSaving(false);
    }
  };

  /* ── list ──────────────────────────────────────────────────────── */
  const list = useMemo(() => {
    let l = products;
    if (tab === 'out') l = l.filter(isZeroStock);
    else if (tab === 'in') l = l.filter(p => !isZeroStock(p));
    const q = search.trim().toLowerCase();
    if (q) l = l.filter(p => (p.name || '').toLowerCase().includes(q));
    // Lowest stock first so the empty shelves are always on top. Sorting uses
    // the saved value, not the draft, so rows don't jump around while typing.
    return [...l].sort(
      (a, b) => stockCount(a) - stockCount(b) || String(a.name).localeCompare(String(b.name))
    );
  }, [products, tab, search]);

  const visibleIds = list.map(p => p.id);
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every(id => selected.includes(id));
  const toggleSelect = id =>
    setSelected(s => (s.includes(id) ? s.filter(x => x !== id) : [...s, id]));
  const toggleSelectAll = () =>
    setSelected(s => (allVisibleSelected ? s.filter(id => !visibleIds.includes(id)) : [...new Set([...s, ...visibleIds])]));

  const applyBulk = (value) => {
    const n = String(Math.max(0, Number(value) || 0));
    setDrafts(d => {
      const next = { ...d };
      selected.forEach(id => { next[id] = n; });
      return next;
    });
  };

  const tabs = [
    { id: 'out', label: 'Out of stock', count: outList.length, danger: true },
    { id: 'in',  label: 'In stock',     count: products.length - outList.length },
    { id: 'all', label: 'All products', count: products.length },
  ];

  const stats = [
    { label: 'Out of stock', value: outList.length, icon: PackageX, color: '#dc2626', onClick: () => setTab('out') },
    { label: 'In stock',     value: products.length - outList.length, icon: PackageCheck, color: '#16a34a', onClick: () => setTab('in') },
    { label: 'Total units',  value: totalUnits, icon: Boxes, color: '#3b82f6', onClick: () => setTab('all') },
  ];

  return (
    <AdminShell active="adminStock">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 md:gap-4 mb-4">
        {stats.map(s => (
          <button key={s.label} onClick={s.onClick}
            className="bg-white rounded-2xl p-3 md:p-4 border text-left transition-all hover:shadow-sm"
            style={{ borderColor: '#eee' }}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-2"
              style={{ background: `${s.color}15`, color: s.color }}>
              <s.icon size={18}/>
            </div>
            <div className="text-[11px] md:text-xs font-semibold mb-0.5" style={{ color: C.mutedDark }}>{s.label}</div>
            <div className="text-xl md:text-2xl font-bold" style={{ color: s.value > 0 && s.color === '#dc2626' ? s.color : C.navy }}>
              {s.value}
            </div>
          </button>
        ))}
      </div>

      {/* Out-of-stock alert */}
      {outList.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4 flex items-start gap-3">
          <PackageX size={20} className="text-red-600 flex-shrink-0 mt-0.5"/>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-red-900">
              {outList.length} product{outList.length > 1 ? 's are' : ' is'} at 0 stock
            </div>
            <div className="text-xs text-red-800 mt-0.5">
              {outList.slice(0, 4).map(p => p.name).join(', ')}
              {outList.length > 4 ? ` +${outList.length - 4} more` : ''} — hidden from the storefront until restocked.
            </div>
          </div>
          {tab !== 'out' && (
            <button onClick={() => setTab('out')}
              className="text-xs font-semibold px-3 py-2 rounded-lg bg-red-600 text-white flex-shrink-0">
              Show
            </button>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map(t => {
            const on = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className="h-11 px-4 rounded-xl border text-sm font-semibold flex items-center gap-2 flex-shrink-0 transition-all"
                style={{
                  background: on ? C.navy : '#fff',
                  color: on ? C.gold : C.navy,
                  borderColor: on ? C.navy : '#eee',
                }}>
                {t.label}
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{
                    background: t.danger && t.count > 0 ? '#dc2626' : on ? 'rgba(212,175,55,0.2)' : C.bgSoft,
                    color: t.danger && t.count > 0 ? '#fff' : on ? C.gold : C.mutedDark,
                  }}>
                  {t.count}
                </span>
              </button>
            );
          })}
        </div>
        <div className="flex-1 flex items-center gap-2 px-4 h-11 rounded-xl bg-white border"
          style={{ borderColor: '#eee' }}>
          <Search size={16} style={{ color: C.muted }}/>
          <input placeholder="Search products..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm min-w-0" style={{ color: C.navy }}/>
          {search && (
            <button onClick={() => setSearch('')}><X size={14} style={{ color: C.muted }}/></button>
          )}
        </div>
      </div>

      {/* Bulk toolbar */}
      {selected.length > 0 && (
        <div className="bg-white rounded-2xl border p-3 mb-4 flex flex-wrap items-center gap-2"
          style={{ borderColor: C.gold }}>
          <span className="text-sm font-bold mr-1" style={{ color: C.navy }}>
            {selected.length} selected
          </span>
          <div className="flex items-center gap-2">
            <input value={bulkValue} inputMode="numeric"
              onChange={e => setBulkValue(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="Qty"
              className="w-20 h-9 px-3 rounded-lg border text-sm outline-none"
              style={{ borderColor: '#e5e5e5', background: '#fafafa', color: C.navy }}/>
            <MiniButton onClick={() => { if (bulkValue !== '') applyBulk(bulkValue); }}>
              Set stock
            </MiniButton>
            <MiniButton danger onClick={() => applyBulk(0)}>
              <PackageX size={12}/> Mark out of stock
            </MiniButton>
          </div>
          <button onClick={() => setSelected([])}
            className="ml-auto text-xs font-semibold" style={{ color: C.mutedDark }}>
            Clear selection
          </button>
        </div>
      )}

      {/* List */}
      <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: '#eee' }}>
        {list.length > 0 && (
          <div className="px-3 md:px-4 py-2.5 border-b flex items-center gap-3" style={{ borderColor: '#eee', background: '#fafafa' }}>
            <input type="checkbox" checked={allVisibleSelected} onChange={toggleSelectAll}
              className="w-4 h-4 flex-shrink-0 cursor-pointer"/>
            <span className="text-xs font-semibold" style={{ color: C.mutedDark }}>
              Select all {list.length} shown
            </span>
          </div>
        )}

        {list.length === 0 ? (
          tab === 'out' ? (
            <Empty icon={CheckCircle2} title="Nothing is out of stock"
              hint="Every product has units available. This list fills up the moment one hits 0."/>
          ) : (
            <Empty icon={Boxes} title="No products found"
              hint={search ? 'Try a different search term.' : 'Add products first — their stock shows up here.'}/>
          )
        ) : (
          <div className="divide-y" style={{ borderColor: '#eee' }}>
            {list.map(p => {
              const cat = categories.find(c => c.id === p.categoryId);
              const saved = stockCount(p);
              const zero = saved === 0;
              const hiddenManually = isHiddenWithStock(p);
              const dirty = isDirty(p);
              const draftIsZero = valueOf(p) === '0';

              return (
                <div key={p.id}
                  className="p-3 md:p-4 flex flex-col md:flex-row md:items-center gap-3"
                  style={{ background: dirty ? 'rgba(212,175,55,0.06)' : zero ? '#fffbfb' : '#fff' }}>
                  {/* identity */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <input type="checkbox" checked={selected.includes(p.id)}
                      onChange={() => toggleSelect(p.id)}
                      className="w-4 h-4 flex-shrink-0 cursor-pointer"/>
                    <img src={p.images?.[0]} alt={p.name}
                      className="w-12 h-12 md:w-14 md:h-14 rounded-xl object-cover flex-shrink-0"
                      style={{ background: C.bgSoft, opacity: zero ? 0.55 : 1 }}
                      onError={e => { e.target.style.visibility = 'hidden'; }}/>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-sm font-bold truncate" style={{ color: C.navy }}>{p.name}</span>
                        {zero && <Chip bg="#fee2e2" fg="#991b1b">Out of stock</Chip>}
                        {hiddenManually && <Chip bg="#e5e7eb" fg="#374151">Hidden</Chip>}
                        {dirty && <Chip bg={C.gold} fg={C.navy}>Unsaved</Chip>}
                      </div>
                      <div className="text-xs mt-0.5 flex items-center gap-2 flex-wrap" style={{ color: C.muted }}>
                        <span>{cat?.name || 'Uncategorised'}</span>
                        <span>·</span>
                        <span>{formatPrice(p.price, settings.currency)}</span>
                        <span>·</span>
                        <span style={{ color: zero ? '#dc2626' : C.muted, fontWeight: zero ? 700 : 400 }}>
                          {zero ? '0 in stock' : `${saved} in stock`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* stock controls */}
                  <div className="flex items-center gap-2 flex-wrap md:flex-nowrap md:justify-end pl-7 md:pl-0">
                    <div className="flex items-center rounded-xl border overflow-hidden flex-shrink-0"
                      style={{ borderColor: dirty ? C.gold : '#e5e5e5' }}>
                      <button type="button" onClick={() => bump(p, -1)}
                        className="w-9 h-9 flex items-center justify-center hover:bg-gray-50">
                        <Minus size={14} style={{ color: C.navy }}/>
                      </button>
                      <input value={valueOf(p)} inputMode="numeric"
                        onChange={e => setDraft(p.id, e.target.value.replace(/[^0-9]/g, ''))}
                        onBlur={() => { if (valueOf(p) === '') setDraft(p.id, String(saved)); }}
                        className="w-14 h-9 text-center text-sm font-bold outline-none"
                        style={{ color: draftIsZero ? '#dc2626' : C.navy, background: '#fff' }}/>
                      <button type="button" onClick={() => bump(p, 1)}
                        className="w-9 h-9 flex items-center justify-center hover:bg-gray-50">
                        <Plus size={14} style={{ color: C.navy }}/>
                      </button>
                    </div>

                    <MiniButton onClick={() => bump(p, 5)} title="Add 5">+5</MiniButton>
                    <MiniButton onClick={() => bump(p, 10)} title="Add 10">+10</MiniButton>
                    {!draftIsZero && (
                      <MiniButton danger onClick={() => setDraft(p.id, '0')} title="Set stock to 0">
                        <PackageX size={12}/> Set 0
                      </MiniButton>
                    )}
                    {dirty && (
                      <MiniButton onClick={() => setDrafts(d => { const n = { ...d }; delete n[p.id]; return n; })}
                        title="Undo this change">
                        Undo
                      </MiniButton>
                    )}
                    {saved > 0 && (
                      <MiniButton onClick={() => toggleVisibility(p)}
                        title={p.outOfStock ? 'Show this product in the store' : 'Hide this product from the store'}>
                        {p.outOfStock ? <><Eye size={12}/> Show</> : <><EyeOff size={12}/> Hide</>}
                      </MiniButton>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <p className="text-[11px] mt-3" style={{ color: C.mutedDark }}>
        Stock drives availability: a product at <strong>0</strong> is marked out of stock and disappears from
        the storefront; give it units again and it comes straight back.
      </p>

      {/* Sticky save bar */}
      {dirtyProducts.length > 0 && (
        <div className="sticky bottom-0 mt-4 -mx-4 md:-mx-6 px-4 md:px-6 pb-4 pt-3 z-20"
          style={{ background: 'linear-gradient(to top, #f6f7f9 70%, rgba(246,247,249,0))' }}>
          <div className="rounded-2xl px-4 py-3 flex items-center gap-3 shadow-lg"
            style={{ background: C.navy }}>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold" style={{ color: C.gold }}>
                {dirtyProducts.length} product{dirtyProducts.length > 1 ? 's' : ''} edited
              </div>
              <div className="text-xs truncate" style={{ color: C.muted }}>
                {dirtyProducts.slice(0, 3).map(p => `${p.name} → ${drafts[p.id]}`).join(' · ')}
                {dirtyProducts.length > 3 ? ` +${dirtyProducts.length - 3} more` : ''}
              </div>
            </div>
            <button onClick={() => setDrafts({})}
              className="text-xs font-semibold px-3 py-2 rounded-lg flex-shrink-0"
              style={{ color: C.muted }}>
              Discard
            </button>
            <button onClick={saveAll} disabled={saving}
              className="text-sm font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 flex-shrink-0 disabled:opacity-60"
              style={{ background: `linear-gradient(135deg, ${C.gold}, ${C.goldDark})`, color: C.navy }}>
              {saving ? <Loader2 size={14} className="animate-spin"/> : <Save size={14}/>}
              {saving ? 'Saving…' : 'Save stock'}
            </button>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
