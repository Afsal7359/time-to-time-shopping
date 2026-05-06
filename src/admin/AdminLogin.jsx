import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { C } from '../data';
import { useStore, useRoute, useToast } from '../contexts';
import { LogoMark } from '../ui';

export default function AdminLogin() {
  const { settings, setAdminAuth } = useStore();
  const { navigate } = useRoute();
  const toast = useToast();
  const [pwd, setPwd] = useState('');

  const handleLogin = (e) => {
    e?.preventDefault();
    if (pwd === settings.adminPassword) {
      setAdminAuth(true);
      navigate('adminDashboard');
    } else {
      toast('Incorrect password', 'error');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6"
      style={{
        background: `radial-gradient(ellipse at top, ${C.navyLight} 0%, ${C.navy} 50%, ${C.navyDeep} 100%)`,
      }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-block mb-4"><LogoMark size={88} glow/></div>
          <h1 className="text-3xl font-bold mb-1"
            style={{ color: C.gold, fontFamily: 'Georgia, serif' }}>Admin Panel</h1>
          <p className="text-sm" style={{ color: C.muted }}>Time to Time Shopping</p>
        </div>
        <form onSubmit={handleLogin} className="rounded-3xl p-6 space-y-4"
          style={{ background: C.navyCard, border: `1px solid ${C.line}` }}>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2"
              style={{ color: C.gold }}>Password</label>
            <input type="password" value={pwd} onChange={e => setPwd(e.target.value)}
              placeholder="Enter admin password" autoFocus
              className="w-full h-12 px-4 rounded-xl outline-none text-sm"
              style={{ background: C.navy, color: C.text, border: `1px solid ${C.line}` }}/>
            <p className="text-[11px] mt-2" style={{ color: C.muted }}>
              Default password: <code style={{ color: C.gold }}>admin123</code> (change in Settings)
            </p>
          </div>
          <button type="submit"
            className="w-full h-12 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
            style={{ background: `linear-gradient(135deg, ${C.gold}, ${C.goldDark})`, color: C.navy }}>
            <Lock size={16}/> Sign In
          </button>
          <button type="button" onClick={() => navigate('home')}
            className="w-full text-xs font-semibold" style={{ color: C.muted }}>
            ← Back to store
          </button>
        </form>
      </div>
    </div>
  );
}
