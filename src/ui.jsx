import React from 'react';
import { X, Package } from 'lucide-react';
import { C } from './data';

/* ════════════════════════════════════════════════════════════════════
   LOGO — recreated TT mark in SVG with brand gold gradient
   ════════════════════════════════════════════════════════════════════ */
export const LogoMark = ({ size = 60, glow = false }) => (
  <svg width={size} height={size} viewBox="0 0 100 100"
    style={{ filter: glow ? 'drop-shadow(0 0 12px rgba(212,175,55,.5))' : 'none' }}>
    <defs>
      <linearGradient id="ttGold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F5D579" />
        <stop offset="35%" stopColor="#F0C14B" />
        <stop offset="65%" stopColor="#D4AF37" />
        <stop offset="100%" stopColor="#8B6914" />
      </linearGradient>
      <linearGradient id="ttGoldShine" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFEEAA" />
        <stop offset="50%" stopColor="#D4AF37" />
        <stop offset="100%" stopColor="#A67C00" />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="46" fill="none" stroke="url(#ttGold)" strokeWidth="3"/>
    <rect x="18" y="30" width="64" height="9" rx="1" fill="url(#ttGoldShine)"/>
    <polygon points="18,30 22,39 18,39" fill={C.goldDark} opacity="0.4"/>
    <polygon points="82,30 78,39 82,39" fill={C.goldDark} opacity="0.4"/>
    <rect x="34" y="39" width="9" height="38" fill="url(#ttGoldShine)"/>
    <rect x="57" y="39" width="9" height="38" fill="url(#ttGoldShine)"/>
    <polygon points="43,39 50,46 43,46" fill={C.goldDark} opacity="0.45"/>
    <polygon points="57,39 50,46 57,46" fill={C.goldDark} opacity="0.45"/>
    <circle cx="50" cy="58" r="4" fill="url(#ttGold)"/>
  </svg>
);

export const LogoFull = ({ stack = false }) => (
  <div className={`flex ${stack ? 'flex-col' : 'flex-row'} items-center gap-2`}>
    <LogoMark size={stack ? 64 : 36} />
    <div className={stack ? 'text-center mt-1' : ''}>
      <div style={{
        fontFamily: 'Georgia, serif', fontWeight: 800,
        fontSize: stack ? 18 : 14, letterSpacing: '0.08em',
        color: C.gold, lineHeight: 1, textTransform: 'uppercase',
      }}>
        Time to Time
      </div>
      <div style={{
        fontFamily: 'Georgia, serif', fontWeight: 600,
        fontSize: stack ? 11 : 9, letterSpacing: '0.32em',
        color: C.goldLight, marginTop: 2,
      }}>
        ─ SHOPPING ─
      </div>
    </div>
  </div>
);

/* ════════════════════════════════════════════════════════════════════
   BUTTONS
   ════════════════════════════════════════════════════════════════════ */
export const IconButton = ({ children, onClick, badge, dark = false, ...rest }) => (
  <button onClick={onClick} {...rest}
    className="relative w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95"
    style={{ background: dark ? C.navyLight : '#fff', border: `1px solid ${dark ? C.line : '#eee'}` }}>
    {children}
    {badge > 0 && (
      <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full text-[10px] font-bold flex items-center justify-center px-1"
        style={{ background: C.gold, color: C.navy }}>{badge}</span>
    )}
  </button>
);

export const PrimaryButton = ({ children, onClick, fullWidth = false, disabled = false, icon: Icon, type = 'button', ...rest }) => (
  <button onClick={onClick} disabled={disabled} type={type} {...rest}
    className={`${fullWidth ? 'w-full' : ''} px-6 py-3 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed`}
    style={{
      background: `linear-gradient(135deg, ${C.gold} 0%, ${C.goldDark} 100%)`,
      color: C.navy,
      boxShadow: '0 4px 14px rgba(212,175,55,0.3)',
    }}>
    {Icon && <Icon size={16}/>}
    {children}
  </button>
);

export const GhostButton = ({ children, onClick, fullWidth = false, icon: Icon, ...rest }) => (
  <button onClick={onClick} {...rest}
    className={`${fullWidth ? 'w-full' : ''} px-6 py-3 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]`}
    style={{
      background: 'transparent',
      color: C.navy,
      border: `1.5px solid ${C.gold}`,
    }}>
    {Icon && <Icon size={16}/>}
    {children}
  </button>
);

/* ════════════════════════════════════════════════════════════════════
   MODAL
   ════════════════════════════════════════════════════════════════════ */
export const Modal = ({ open, onClose, title, children, maxWidth = 'max-w-lg' }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(10,16,24,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}>
      <div className={`${maxWidth} w-full bg-white rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-hidden flex flex-col animate-slide-up`}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: '#eee' }}>
          <h3 className="text-lg font-bold" style={{ color: C.navy }}>{title}</h3>
          <button onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100">
            <X size={18}/>
          </button>
        </div>
        <div className="p-5 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════
   FORM CONTROLS
   ════════════════════════════════════════════════════════════════════ */
export const Input = ({ label, ...rest }) => (
  <label className="block">
    {label && (
      <span className="block text-xs font-semibold mb-1.5 uppercase tracking-wider"
        style={{ color: C.mutedDark }}>{label}</span>
    )}
    <input {...rest}
      className="w-full px-4 py-3 rounded-xl border outline-none transition-all focus:border-yellow-600"
      style={{ borderColor: '#e5e5e5', background: '#fafafa', fontSize: 14, color: C.navy }}/>
  </label>
);

export const Textarea = ({ label, ...rest }) => (
  <label className="block">
    {label && (
      <span className="block text-xs font-semibold mb-1.5 uppercase tracking-wider"
        style={{ color: C.mutedDark }}>{label}</span>
    )}
    <textarea {...rest} rows={rest.rows || 4}
      className="w-full px-4 py-3 rounded-xl border outline-none transition-all focus:border-yellow-600 resize-none"
      style={{ borderColor: '#e5e5e5', background: '#fafafa', fontSize: 14, color: C.navy }}/>
  </label>
);

export const Select = ({ label, options = [], ...rest }) => (
  <label className="block">
    {label && (
      <span className="block text-xs font-semibold mb-1.5 uppercase tracking-wider"
        style={{ color: C.mutedDark }}>{label}</span>
    )}
    <select {...rest}
      className="w-full px-4 py-3 rounded-xl border outline-none transition-all focus:border-yellow-600"
      style={{ borderColor: '#e5e5e5', background: '#fafafa', fontSize: 14, color: C.navy }}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </label>
);

/* ════════════════════════════════════════════════════════════════════
   EMPTY STATE
   ════════════════════════════════════════════════════════════════════ */
export const Empty = ({ icon: Icon = Package, title, hint, action }) => (
  <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
    <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
      style={{ background: C.bgSoft, color: C.muted }}>
      <Icon size={32}/>
    </div>
    <h3 className="font-bold text-lg mb-1" style={{ color: C.navy }}>{title}</h3>
    {hint && <p className="text-sm mb-5" style={{ color: C.mutedDark }}>{hint}</p>}
    {action}
  </div>
);
