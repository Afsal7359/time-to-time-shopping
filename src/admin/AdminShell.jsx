import React, { useState } from 'react';
import {
  LayoutDashboard, Package, Tag, Layers, Image as ImageIcon, Settings,
  LogOut, Menu, X, Eye,
} from 'lucide-react';
import { C } from '../data';
import { useStore, useRoute } from '../contexts';
import { LogoFull } from '../ui';

export default function AdminShell({ active, children }) {
  const { signOut } = useStore();
  const { navigate } = useRoute();
  const [mobOpen, setMobOpen] = useState(false);

  const tabs = [
    { id: 'adminDashboard',  icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'adminOrders',     icon: Package,         label: 'Orders' },
    { id: 'adminProducts',   icon: Tag,             label: 'Products' },
    { id: 'adminCategories', icon: Layers,          label: 'Categories' },
    { id: 'adminBanners',    icon: ImageIcon,       label: 'Banners' },
    { id: 'adminSettings',   icon: Settings,        label: 'Settings' },
  ];

  const logout = async () => {
    await signOut();
    navigate('home');
  };

  return (
    <div className="h-screen w-full flex overflow-hidden" style={{ background: '#f6f7f9' }}>
      {/* Sidebar - desktop */}
      <aside className="hidden md:flex flex-col w-64 flex-shrink-0"
        style={{ background: C.navy, borderRight: `1px solid ${C.line}` }}>
        <div className="p-5 border-b" style={{ borderColor: C.line }}>
          <LogoFull stack/>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {tabs.map(t => (
            <button key={t.id} onClick={() => navigate(t.id)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: active === t.id ? `linear-gradient(135deg, ${C.gold}, ${C.goldDark})` : 'transparent',
                color: active === t.id ? C.navy : C.muted,
              }}>
              <t.icon size={16}/> {t.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t" style={{ borderColor: C.line }}>
          <button onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold"
            style={{ color: C.muted }}>
            <LogOut size={16}/> Logout
          </button>
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobOpen && (
        <div className="md:hidden fixed inset-0 z-50" onClick={() => setMobOpen(false)}>
          <div className="absolute inset-0" style={{ background: 'rgba(10,16,24,0.7)' }}/>
          <div className="absolute left-0 top-0 bottom-0 w-72 flex flex-col"
            style={{ background: C.navy }} onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b flex justify-between items-center" style={{ borderColor: C.line }}>
              <LogoFull/>
              <button onClick={() => setMobOpen(false)}><X size={20} style={{ color: C.gold }}/></button>
            </div>
            <nav className="flex-1 p-3 space-y-1">
              {tabs.map(t => (
                <button key={t.id} onClick={() => { navigate(t.id); setMobOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold"
                  style={{
                    background: active === t.id ? `linear-gradient(135deg, ${C.gold}, ${C.goldDark})` : 'transparent',
                    color: active === t.id ? C.navy : C.muted,
                  }}>
                  <t.icon size={16}/> {t.label}
                </button>
              ))}
            </nav>
            <div className="p-3 border-t" style={{ borderColor: C.line }}>
              <button onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold"
                style={{ color: C.muted }}>
                <LogOut size={16}/> Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main */}
      <main className="flex-1 min-w-0 flex flex-col">
        <div className="bg-white border-b flex items-center justify-between px-4 md:px-6 h-16 flex-shrink-0"
          style={{ borderColor: '#eee' }}>
          <div className="flex items-center gap-3">
            <button className="md:hidden" onClick={() => setMobOpen(true)}>
              <Menu size={20} style={{ color: C.navy }}/>
            </button>
            <h1 className="text-lg font-bold" style={{ color: C.navy }}>
              {tabs.find(t => t.id === active)?.label}
            </h1>
          </div>
          <button onClick={() => navigate('home')}
            className="text-xs font-semibold flex items-center gap-1.5 px-3 py-2 rounded-lg"
            style={{ background: C.bgSoft, color: C.navy }}>
            <Eye size={14}/> View Store
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
}
