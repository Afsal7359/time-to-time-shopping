import React, { useState, useEffect } from 'react';
import { Save, RefreshCw } from 'lucide-react';
import { C, SEED_PRODUCTS, SEED_CATEGORIES, SEED_BANNERS } from '../data';
import { useStore, useToast } from '../contexts';
import { PrimaryButton, Input } from '../ui';
import AdminShell from './AdminShell';

export default function AdminSettings() {
  const { settings, saveSettings, saveProducts, saveCategories, saveBanners } = useStore();
  const toast = useToast();
  const [form, setForm] = useState(settings);
  const [reseeding, setReseeding] = useState(false);

  useEffect(() => setForm(settings), [settings]);

  const handleSave = async () => {
    await saveSettings(form);
    toast('Settings saved');
  };

  const handleReseed = async () => {
    if (!confirm(
      'This will replace ALL products, categories, and banners with the default sample data.\n\nOrders and settings will NOT be changed.\n\nContinue?'
    )) return;
    setReseeding(true);
    try {
      await Promise.all([
        saveProducts(SEED_PRODUCTS),
        saveCategories(SEED_CATEGORIES),
        saveBanners(SEED_BANNERS),
      ]);
      toast('Store data reset to defaults');
    } catch {
      toast('Reset failed', 'error');
    } finally {
      setReseeding(false);
    }
  };

  return (
    <AdminShell active="adminSettings">
      <div className="max-w-2xl space-y-6">
        <section className="bg-white rounded-2xl border p-5" style={{ borderColor: '#eee' }}>
          <h3 className="text-base font-bold mb-1" style={{ color: C.navy }}>Brand Identity</h3>
          <p className="text-xs mb-4" style={{ color: C.muted }}>Public-facing store information</p>
          <div className="space-y-3">
            <Input label="Brand Name" value={form.brandName}
              onChange={e => setForm({ ...form, brandName: e.target.value })}/>
            <Input label="Tagline" value={form.tagline}
              onChange={e => setForm({ ...form, tagline: e.target.value })}/>
            <Input label="Currency Symbol" value={form.currency}
              onChange={e => setForm({ ...form, currency: e.target.value })} maxLength={3}/>
          </div>
        </section>

        <section className="bg-white rounded-2xl border p-5" style={{ borderColor: '#eee' }}>
          <h3 className="text-base font-bold mb-1" style={{ color: C.navy }}>Contact & Orders</h3>
          <p className="text-xs mb-4" style={{ color: C.muted }}>
            WhatsApp number receives order messages
          </p>
          <div className="space-y-3">
            <Input label="WhatsApp Number (with country code, no +)"
              value={form.whatsappNumber}
              onChange={e => setForm({ ...form, whatsappNumber: e.target.value.replace(/\D/g, '') })}
              placeholder="919999999999"/>
            <Input label="Store Phone (display only)" value={form.storePhone}
              onChange={e => setForm({ ...form, storePhone: e.target.value })}/>
            <Input label="Email" value={form.storeEmail}
              onChange={e => setForm({ ...form, storeEmail: e.target.value })}/>
          </div>
        </section>

        <section className="bg-white rounded-2xl border p-5" style={{ borderColor: '#eee' }}>
          <h3 className="text-base font-bold mb-1" style={{ color: C.navy }}>Shipping</h3>
          <div className="space-y-3 mt-3">
            <Input label="Free shipping above (₹)" type="number" value={form.freeShippingMin}
              onChange={e => setForm({ ...form, freeShippingMin: Number(e.target.value) || 0 })}/>
            <Input label="Default shipping fee (₹)" type="number" value={form.shippingFee}
              onChange={e => setForm({ ...form, shippingFee: Number(e.target.value) || 0 })}/>
          </div>
        </section>

        <section className="bg-white rounded-2xl border p-5" style={{ borderColor: '#eee' }}>
          <h3 className="text-base font-bold mb-1" style={{ color: C.navy }}>Payment Methods</h3>
          <div className="space-y-3 mt-3">
            <label className="flex items-center justify-between p-3 rounded-xl cursor-pointer"
              style={{ background: C.bgSoft }}>
              <div>
                <div className="text-sm font-bold" style={{ color: C.navy }}>Cash on Delivery</div>
                <div className="text-xs" style={{ color: C.muted }}>Customers pay when they receive</div>
              </div>
              <input type="checkbox" checked={form.codAvailable}
                onChange={e => setForm({ ...form, codAvailable: e.target.checked })}/>
            </label>
            <label className="flex items-center justify-between p-3 rounded-xl cursor-pointer"
              style={{ background: C.bgSoft }}>
              <div>
                <div className="text-sm font-bold" style={{ color: C.navy }}>WhatsApp Order</div>
                <div className="text-xs" style={{ color: C.muted }}>Customers confirm via WhatsApp chat</div>
              </div>
              <input type="checkbox" checked={form.whatsappAvailable}
                onChange={e => setForm({ ...form, whatsappAvailable: e.target.checked })}/>
            </label>
          </div>
        </section>

        <section className="bg-white rounded-2xl border p-5" style={{ borderColor: '#eee' }}>
          <h3 className="text-base font-bold mb-1" style={{ color: C.navy }}>Admin Access</h3>
          <p className="text-xs mb-4" style={{ color: C.muted }}>
            Change the password to access this panel
          </p>
          <Input label="Admin Password" type="text" value={form.adminPassword}
            onChange={e => setForm({ ...form, adminPassword: e.target.value })}/>
        </section>

        <PrimaryButton fullWidth icon={Save} onClick={handleSave}>Save All Settings</PrimaryButton>

        <section className="bg-white rounded-2xl border p-5" style={{ borderColor: '#eee' }}>
          <h3 className="text-base font-bold mb-1" style={{ color: C.navy }}>Data Management</h3>
          <p className="text-xs mb-4" style={{ color: C.muted }}>
            Reset store content to the built-in sample data. Useful for a fresh start or demo.
            Orders and settings are not affected.
          </p>
          <button
            onClick={handleReseed}
            disabled={reseeding}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all disabled:opacity-50 hover:bg-red-50"
            style={{ borderColor: '#fca5a5', color: '#dc2626' }}
          >
            <RefreshCw size={14} className={reseeding ? 'animate-spin' : ''} />
            {reseeding ? 'Resetting…' : 'Reset to Default Seed Data'}
          </button>
        </section>
      </div>
    </AdminShell>
  );
}
