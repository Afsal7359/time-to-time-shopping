import React, { useState, useEffect, useRef } from 'react';
import {
  Search, Plus as PlusIcon, Edit2, Trash2, Save, Plus, Upload, Loader2,
} from 'lucide-react';
import { C } from '../data';
import { useStore, useToast } from '../contexts';
import { uploadToCloudinary, cloudinaryEnabled } from '../firebase';
import {
  PrimaryButton, GhostButton, Modal, Input, Textarea, Select,
} from '../ui';
import { formatPrice } from '../utils';
import AdminShell from './AdminShell';

function ImageRow({ img, onChange, onRemove }) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      onChange(url);
    } catch (err) {
      alert(err.message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="flex gap-2 mb-2 items-center">
      <input
        value={img}
        onChange={e => onChange(e.target.value)}
        placeholder="Paste image URL…"
        className="flex-1 px-3 py-2 rounded-lg border text-xs outline-none min-w-0"
        style={{ borderColor: '#e5e5e5', background: '#fafafa' }}
      />
      <input type="file" accept="image/*" ref={fileRef} className="hidden" onChange={handleFile} />
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        title={cloudinaryEnabled ? 'Upload from file' : 'Configure Cloudinary in .env to enable uploads'}
        className="h-9 px-3 rounded-lg border text-xs font-semibold flex items-center gap-1.5 flex-shrink-0 transition-colors disabled:opacity-50"
        style={{ borderColor: '#d1d5db', color: C.navy, background: '#fff' }}
      >
        {uploading
          ? <><Loader2 size={12} className="animate-spin" /> Uploading…</>
          : <><Upload size={12} /> Upload</>}
      </button>
      {img && (
        <img src={img} alt="" className="w-9 h-9 rounded-lg object-cover flex-shrink-0"
          onError={e => { e.target.style.display = 'none'; }} />
      )}
      <button type="button" onClick={onRemove}
        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-red-500 hover:bg-red-50">
        <Trash2 size={14} />
      </button>
    </div>
  );
}

function ProductEditor({ open, product, categories, onClose, onSave }) {
  const [form, setForm] = useState({
    name: '', categoryId: categories[0]?.id || '', subcategoryId: '', price: '', mrp: '', stock: 0,
    lowStockAlert: 5,
    images: [''], description: '', variants: '', sizes: '', colors: '',
    badge: '', featured: false, rating: 4.5, reviews: 0,
  });

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || '',
        categoryId: product.categoryId || categories[0]?.id || '',
        subcategoryId: product.subcategoryId || '',
        price: product.price || '',
        mrp: product.mrp || '',
        stock: product.stock ?? 0,
        lowStockAlert: product.lowStockAlert ?? 5,
        images: product.images?.length ? product.images : [''],
        description: product.description || '',
        variants: (product.variants || []).join(', '),
        sizes: (product.sizes || []).join(', '),
        colors: (product.colors || []).join(', '),
        badge: product.badge || '',
        featured: !!product.featured,
        rating: product.rating || 4.5,
        reviews: product.reviews || 0,
      });
    }
  }, [product, categories]);

  if (!open) return null;

  const handleSubmit = () => {
    const data = {
      ...form,
      subcategoryId: form.subcategoryId || '',
      price: Number(form.price) || 0,
      mrp: Number(form.mrp) || Number(form.price) || 0,
      stock: Number(form.stock) || 0,
      lowStockAlert: Math.max(0, Number(form.lowStockAlert) || 0),
      rating: Number(form.rating) || 0,
      reviews: Number(form.reviews) || 0,
      images: form.images.filter(i => i.trim()),
      variants: form.variants.split(',').map(v => v.trim()).filter(Boolean),
      sizes: form.sizes.split(',').map(v => v.trim()).filter(Boolean),
      colors: form.colors.split(',').map(v => v.trim()).filter(Boolean),
    };
    if (!data.name || !data.price) return alert('Name and price are required');
    if (data.images.length === 0) return alert('Add at least one image (URL or upload)');
    onSave(data);
  };

  const updateImage = (i, val) => {
    const next = [...form.images];
    next[i] = val;
    setForm({ ...form, images: next });
  };

  return (
    <Modal open={open} onClose={onClose}
      title={product?.id ? 'Edit Product' : 'New Product'} maxWidth="max-w-2xl">
      <div className="space-y-4">
        <Input label="Product Name *" value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}/>
        {(() => {
          const activeCat = categories.find(c => c.id === form.categoryId);
          const subcats = activeCat?.subcategories || [];
          if (subcats.length === 0) return (
            <Select label="Category *" value={form.categoryId}
              onChange={e => setForm({ ...form, categoryId: e.target.value, subcategoryId: '' })}
              options={categories.map(c => ({ value: c.id, label: c.name }))}/>
          );
          return (
            <div className="grid grid-cols-2 gap-3">
              <Select label="Category *" value={form.categoryId}
                onChange={e => setForm({ ...form, categoryId: e.target.value, subcategoryId: '' })}
                options={categories.map(c => ({ value: c.id, label: c.name }))}/>
              <Select label="Subcategory" value={form.subcategoryId}
                onChange={e => setForm({ ...form, subcategoryId: e.target.value })}
                options={[{ value: '', label: 'All / None' }, ...subcats.map(s => ({ value: s.id, label: s.name }))]}/>
            </div>
          );
        })()}
        <Input label="Badge (e.g. New, Sale)" value={form.badge}
          onChange={e => setForm({ ...form, badge: e.target.value })}/>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Price (₹) *" type="number" value={form.price}
            onChange={e => setForm({ ...form, price: e.target.value })}/>
          <Input label="MRP (₹)" type="number" value={form.mrp}
            onChange={e => setForm({ ...form, mrp: e.target.value })}/>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Stock" type="number" value={form.stock}
            onChange={e => setForm({ ...form, stock: e.target.value })}/>
          <Input label="Low-stock alert at" type="number" value={form.lowStockAlert}
            onChange={e => setForm({ ...form, lowStockAlert: e.target.value })}/>
        </div>
        <p className="text-[11px] -mt-2" style={{ color: C.mutedDark }}>
          When Stock drops to or below this number, the dashboard flags the product
          and the storefront shows an "Only X left" badge.
        </p>
        <Textarea label="Description" value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}/>
        <Input label="Variants (comma-separated, e.g. S, M, L or 40mm, 42mm)"
          value={form.variants}
          onChange={e => setForm({ ...form, variants: e.target.value })}/>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Sizes — optional (e.g. S, M, L, XL)"
            value={form.sizes}
            onChange={e => setForm({ ...form, sizes: e.target.value })}/>
          <Input label="Colors — optional (e.g. Red, Blue, Black)"
            value={form.colors}
            onChange={e => setForm({ ...form, colors: e.target.value })}/>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider"
              style={{ color: C.mutedDark }}>
              Images ({form.images.filter(i => i).length})
            </label>
            {!cloudinaryEnabled && (
              <span className="text-[10px] px-2 py-0.5 rounded-full"
                style={{ background: '#fef3c7', color: '#92400e' }}>
                Upload disabled — Cloudinary not configured
              </span>
            )}
          </div>
          {form.images.map((img, i) => (
            <ImageRow
              key={i}
              img={img}
              onChange={val => updateImage(i, val)}
              onRemove={() => setForm({ ...form, images: form.images.filter((_, x) => x !== i) })}
            />
          ))}
          <button type="button"
            onClick={() => setForm({ ...form, images: [...form.images, ''] })}
            className="text-xs font-semibold flex items-center gap-1 mt-1"
            style={{ color: C.navy }}>
            <Plus size={12} /> Add another image
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input label="Rating (0-5)" type="number" step="0.1" min="0" max="5"
            value={form.rating} onChange={e => setForm({ ...form, rating: e.target.value })}/>
          <Input label="Reviews count" type="number" value={form.reviews}
            onChange={e => setForm({ ...form, reviews: e.target.value })}/>
        </div>

        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={form.featured}
            onChange={e => setForm({ ...form, featured: e.target.checked })}/>
          <span style={{ color: C.navy }}>Show in "Trending Now" on home page</span>
        </label>

        <div className="flex gap-2 pt-2">
          <GhostButton fullWidth onClick={onClose}>Cancel</GhostButton>
          <PrimaryButton fullWidth icon={Save} onClick={handleSubmit}>Save Product</PrimaryButton>
        </div>
      </div>
    </Modal>
  );
}

export default function AdminProducts() {
  const { products, categories, settings, saveProducts, softDelete } = useStore();
  const toast = useToast();
  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  let list = filter === 'all' ? products : products.filter(p => p.categoryId === filter);
  if (search) list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const handleSave = async (data) => {
    let next;
    if (editing.id) {
      next = products.map(p => p.id === editing.id ? { ...p, ...data } : p);
      toast('Product updated');
    } else {
      next = [{ ...data, id: `p-${Date.now()}` }, ...products];
      toast('Product added');
    }
    await saveProducts(next);
    setEditing(null);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    await softDelete('product', id);
    toast('Product deleted — restore from Dashboard › Recently Deleted');
  };

  return (
    <AdminShell active="adminProducts">
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <div className="flex-1 flex items-center gap-2 px-4 h-11 rounded-xl bg-white border"
          style={{ borderColor: '#eee' }}>
          <Search size={16} style={{ color: C.muted }}/>
          <input placeholder="Search products..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm" style={{ color: C.navy }}/>
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value)}
          className="h-11 px-4 rounded-xl bg-white border text-sm font-semibold outline-none"
          style={{ borderColor: '#eee', color: C.navy }}>
          <option value="all">All categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <PrimaryButton icon={PlusIcon} onClick={() => setEditing({})}>Add Product</PrimaryButton>
      </div>

      <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: '#eee' }}>
        {list.length === 0 ? (
          <div className="p-12 text-center text-sm" style={{ color: C.muted }}>No products found</div>
        ) : (
          <div className="divide-y" style={{ borderColor: '#eee' }}>
            {list.map(p => {
              const cat = categories.find(c => c.id === p.categoryId);
              return (
                <div key={p.id} className="p-3 md:p-4 flex items-center gap-3 md:gap-4">
                  <img src={p.images[0]} alt={p.name}
                    className="w-14 h-14 md:w-16 md:h-16 rounded-xl object-cover flex-shrink-0"/>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold truncate" style={{ color: C.navy }}>{p.name}</div>
                    <div className="text-xs flex items-center gap-2 flex-wrap mt-0.5"
                      style={{ color: C.muted }}>
                      <span>{cat?.name}</span>
                      <span>·</span>
                      <span>Stock: {p.stock}</span>
                      {p.featured && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                          style={{ background: C.gold, color: C.navy }}>FEATURED</span>
                      )}
                    </div>
                    <div className="text-sm font-bold mt-1" style={{ color: C.navy }}>
                      {formatPrice(p.price, settings.currency)}
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => setEditing(p)}
                      className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-gray-100">
                      <Edit2 size={14} style={{ color: C.navy }}/>
                    </button>
                    <button onClick={() => handleDelete(p.id)}
                      className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-red-50">
                      <Trash2 size={14} className="text-red-500"/>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ProductEditor open={!!editing} product={editing} categories={categories}
        onClose={() => setEditing(null)} onSave={handleSave}/>
    </AdminShell>
  );
}
