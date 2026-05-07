import React, { useState, useRef } from 'react';
import { Plus as PlusIcon, Trash2, Save, Upload, Loader2 } from 'lucide-react';
import { C } from '../data';
import { useStore, useToast } from '../contexts';
import { uploadToCloudinary, cloudinaryEnabled } from '../firebase';
import { PrimaryButton, GhostButton, Modal, Input } from '../ui';
import AdminShell from './AdminShell';

function CategoryForm({ initial, onCancel, onSave }) {
  const [form, setForm] = useState({
    name: initial?.name || '',
    icon: initial?.icon || '🛍️',
    image: initial?.image || '',
  });
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setForm(f => ({ ...f, image: url }));
    } catch (err) {
      alert(err.message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <Input label="Name *" value={form.name}
        onChange={e => setForm({ ...form, name: e.target.value })}/>
      <Input label="Icon emoji" value={form.icon}
        onChange={e => setForm({ ...form, icon: e.target.value })} placeholder="🛍️"/>
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
          style={{ color: C.mutedDark }}>Image</label>
        <div className="flex gap-2 items-center">
          <input
            value={form.image}
            onChange={e => setForm({ ...form, image: e.target.value })}
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
          {form.image && (
            <img src={form.image} alt="" className="w-9 h-9 rounded-lg object-cover flex-shrink-0"
              onError={e => { e.target.style.display = 'none'; }} />
          )}
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <GhostButton fullWidth onClick={onCancel}>Cancel</GhostButton>
        <PrimaryButton fullWidth icon={Save} onClick={() => form.name && onSave(form)}>Save</PrimaryButton>
      </div>
    </div>
  );
}

export default function AdminCategories() {
  const { categories, products, saveCategories } = useStore();
  const toast = useToast();
  const [editing, setEditing] = useState(null);

  const handleSave = async (data) => {
    let next;
    if (editing.id) {
      next = categories.map(c => c.id === editing.id ? { ...c, ...data } : c);
      toast('Category updated');
    } else {
      next = [...categories, { ...data, id: `cat-${Date.now()}` }];
      toast('Category added');
    }
    await saveCategories(next);
    setEditing(null);
  };

  const handleDelete = async (id) => {
    const used = products.filter(p => p.categoryId === id).length;
    if (used > 0) return alert(`Can't delete — ${used} products use this category. Reassign them first.`);
    if (!confirm('Delete this category?')) return;
    await saveCategories(categories.filter(c => c.id !== id));
    toast('Category deleted');
  };

  return (
    <AdminShell active="adminCategories">
      <div className="flex justify-end mb-4">
        <PrimaryButton icon={PlusIcon} onClick={() => setEditing({})}>Add Category</PrimaryButton>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map(c => {
          const count = products.filter(p => p.categoryId === c.id).length;
          return (
            <div key={c.id} className="bg-white rounded-2xl border p-4" style={{ borderColor: '#eee' }}>
              <div className="aspect-square rounded-xl overflow-hidden mb-3" style={{ background: C.bgSoft }}>
                {c.image ? (
                  <img src={c.image} alt={c.name} className="w-full h-full object-cover"/>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">{c.icon}</div>
                )}
              </div>
              <h4 className="text-sm font-bold mb-1" style={{ color: C.navy }}>{c.name}</h4>
              <p className="text-xs mb-3" style={{ color: C.muted }}>{count} products</p>
              <div className="flex gap-1">
                <button onClick={() => setEditing(c)}
                  className="flex-1 h-8 rounded-lg text-xs font-semibold"
                  style={{ background: C.bgSoft, color: C.navy }}>Edit</button>
                <button onClick={() => handleDelete(c.id)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50">
                  <Trash2 size={14}/>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)}
        title={editing?.id ? 'Edit Category' : 'New Category'}>
        <CategoryForm key={editing?.id || 'new'} initial={editing}
          onCancel={() => setEditing(null)} onSave={handleSave}/>
      </Modal>
    </AdminShell>
  );
}
