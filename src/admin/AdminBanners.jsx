import React, { useState, useRef } from 'react';
import { Plus as PlusIcon, Edit2, Trash2, Save, Upload, Loader2 } from 'lucide-react';
import { C } from '../data';
import { useStore, useToast } from '../contexts';
import { uploadToCloudinary, cloudinaryEnabled } from '../firebase';
import { PrimaryButton, GhostButton, Modal, Input, Select } from '../ui';
import AdminShell from './AdminShell';

function BannerImageInput({ value, onChange }) {
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
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
        style={{ color: C.mutedDark }}>
        Banner Image
        {!cloudinaryEnabled && (
          <span className="ml-2 normal-case text-[10px] px-2 py-0.5 rounded-full font-normal"
            style={{ background: '#fef3c7', color: '#92400e' }}>
            Upload disabled — Cloudinary not configured
          </span>
        )}
      </label>
      <div className="flex gap-2 items-center">
        <input
          value={value}
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
      </div>
      {value && (
        <img src={value} alt="" className="mt-2 w-full h-32 rounded-xl object-cover"
          onError={e => { e.target.style.display = 'none'; }} />
      )}
    </div>
  );
}

function BannerForm({ initial, categories, onCancel, onSave }) {
  const [form, setForm] = useState({
    title: initial?.title || '',
    subtitle: initial?.subtitle || '',
    cta: initial?.cta || 'Shop Now',
    categoryId: initial?.categoryId || categories[0]?.id || '',
    image: initial?.image || '',
    active: initial?.active ?? true,
  });
  return (
    <div className="space-y-3">
      <Input label="Title *" value={form.title}
        onChange={e => setForm({ ...form, title: e.target.value })}/>
      <Input label="Subtitle" value={form.subtitle}
        onChange={e => setForm({ ...form, subtitle: e.target.value })}/>
      <Input label="CTA Button Text" value={form.cta}
        onChange={e => setForm({ ...form, cta: e.target.value })}/>
      <Select label="Links to Category" value={form.categoryId}
        onChange={e => setForm({ ...form, categoryId: e.target.value })}
        options={categories.map(c => ({ value: c.id, label: c.name }))}/>
      <BannerImageInput value={form.image} onChange={val => setForm({ ...form, image: val })} />
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input type="checkbox" checked={form.active}
          onChange={e => setForm({ ...form, active: e.target.checked })}/>
        <span style={{ color: C.navy }}>Active (show on storefront)</span>
      </label>
      <div className="flex gap-2 pt-2">
        <GhostButton fullWidth onClick={onCancel}>Cancel</GhostButton>
        <PrimaryButton fullWidth icon={Save} onClick={() => form.title && onSave(form)}>Save</PrimaryButton>
      </div>
    </div>
  );
}

export default function AdminBanners() {
  const { banners, categories, saveBanners } = useStore();
  const toast = useToast();
  const [editing, setEditing] = useState(null);

  const handleSave = async (data) => {
    let next;
    if (editing.id) next = banners.map(b => b.id === editing.id ? { ...b, ...data } : b);
    else next = [...banners, { ...data, id: `b-${Date.now()}` }];
    await saveBanners(next);
    toast('Banner saved');
    setEditing(null);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this banner?')) return;
    await saveBanners(banners.filter(b => b.id !== id));
    toast('Banner deleted');
  };

  const toggle = async (id) => {
    await saveBanners(banners.map(b => b.id === id ? { ...b, active: !b.active } : b));
  };

  return (
    <AdminShell active="adminBanners">
      <div className="flex justify-end mb-4">
        <PrimaryButton icon={PlusIcon} onClick={() => setEditing({})}>Add Banner</PrimaryButton>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {banners.map(b => (
          <div key={b.id} className="bg-white rounded-2xl border overflow-hidden"
            style={{ borderColor: '#eee' }}>
            <div className="aspect-video relative" style={{ background: C.navy }}>
              {b.image && (
                <img src={b.image} alt="" className="w-full h-full object-cover opacity-50"/>
              )}
              <div className="absolute inset-0 p-5 flex flex-col justify-center">
                <h3 className="text-xl font-bold"
                  style={{ color: C.gold, fontFamily: 'Georgia, serif' }}>{b.title}</h3>
                <p className="text-sm" style={{ color: '#e8d089' }}>{b.subtitle}</p>
              </div>
              <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-1 rounded-full uppercase"
                style={{ background: b.active ? '#16a34a' : '#9ca3af', color: '#fff' }}>
                {b.active ? 'Active' : 'Hidden'}
              </span>
            </div>
            <div className="p-3 flex gap-2">
              <button onClick={() => toggle(b.id)}
                className="flex-1 h-9 rounded-lg text-xs font-semibold"
                style={{ background: C.bgSoft, color: C.navy }}>
                {b.active ? 'Hide' : 'Show'}
              </button>
              <button onClick={() => setEditing(b)}
                className="flex-1 h-9 rounded-lg text-xs font-semibold flex items-center justify-center gap-1"
                style={{ background: C.bgSoft, color: C.navy }}>
                <Edit2 size={12}/> Edit
              </button>
              <button onClick={() => handleDelete(b.id)}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50">
                <Trash2 size={12}/>
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)}
        title={editing?.id ? 'Edit Banner' : 'New Banner'}>
        <BannerForm key={editing?.id || 'new'} initial={editing} categories={categories}
          onCancel={() => setEditing(null)} onSave={handleSave}/>
      </Modal>
    </AdminShell>
  );
}
