import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { C } from '../data';
import { useStore, useToast } from '../contexts';
import { PrimaryButton, Input } from '../ui';
import AdminShell from './AdminShell';

export default function AdminSettings() {
  const { settings, saveSettings } = useStore();
  const toast = useToast();
  const [form, setForm] = useState(settings);

  useEffect(() => setForm(settings), [settings]);

  const handleSave = async () => {
    await saveSettings(form);
    toast('Settings saved');
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
            <Input label="WhatsApp Number (with country code, no + or spaces)"
              value={form.whatsappNumber}
              onChange={e => setForm({ ...form, whatsappNumber: e.target.value.replace(/\D/g, '') })}
              placeholder="97433526308"/>
            <p className="text-xs" style={{ color: C.muted }}>
              Qatar example: <strong style={{ color: C.navy }}>97433526308</strong> &nbsp;·&nbsp; Current saved: <strong style={{ color: form.whatsappNumber ? C.navy : '#ef4444' }}>{form.whatsappNumber || 'not set'}</strong>
            </p>
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
      </div>
    </AdminShell>
  );
}
