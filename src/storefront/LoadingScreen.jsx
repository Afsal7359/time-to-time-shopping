import React, { useEffect, useState } from 'react';
import { C } from '../data';
import { LogoMark } from '../ui';

export default function LoadingScreen({ message = 'Loading store…' }) {
  const [dot, setDot] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setDot(d => (d + 1) % 3), 500);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      className="fixed inset-0 z-[999] flex flex-col items-center justify-center"
      style={{
        background: `radial-gradient(ellipse at 50% 25%, ${C.navyLight} 0%, ${C.navy} 50%, ${C.navyDeep} 100%)`,
      }}
    >
      {/* Spinning rings + logo */}
      <div className="relative flex items-center justify-center mb-10 ls-fadein" style={{ width: 140, height: 140 }}>

        {/* Outer ring */}
        <svg className="ls-spin absolute" width="140" height="140" viewBox="0 0 140 140" fill="none">
          <circle cx="70" cy="70" r="66"
            stroke="url(#ringOuter)" strokeWidth="1.5" strokeDasharray="4 8" strokeLinecap="round"/>
          <defs>
            <linearGradient id="ringOuter" x1="0" y1="0" x2="140" y2="140" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor={C.gold} stopOpacity="0.6"/>
              <stop offset="100%" stopColor={C.goldLight} stopOpacity="0.1"/>
            </linearGradient>
          </defs>
        </svg>

        {/* Inner ring */}
        <svg className="ls-spin-rev absolute" width="112" height="112" viewBox="0 0 112 112" fill="none"
          style={{ top: 14, left: 14 }}>
          <circle cx="56" cy="56" r="52"
            stroke="url(#ringInner)" strokeWidth="2" strokeDasharray="12 6" strokeLinecap="round"/>
          <defs>
            <linearGradient id="ringInner" x1="0" y1="0" x2="112" y2="112" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor={C.goldLight} stopOpacity="0.9"/>
              <stop offset="60%" stopColor={C.gold} stopOpacity="0.3"/>
              <stop offset="100%" stopColor={C.goldDark} stopOpacity="0.05"/>
            </linearGradient>
          </defs>
        </svg>

        {/* Logo mark */}
        <div className="ls-glow relative z-10">
          <LogoMark size={80} glow />
        </div>
      </div>

      {/* Brand name */}
      <div className="text-center ls-fadein" style={{ animationDelay: '0.15s' }}>
        <h1
          className="text-2xl font-bold tracking-[0.18em] uppercase mb-1"
          style={{ color: C.gold, fontFamily: 'Georgia, serif' }}
        >
          Time to Time
        </h1>
        <p className="text-[11px] tracking-[0.45em] uppercase" style={{ color: C.muted }}>
          — Shopping —
        </p>
      </div>

      {/* Progress bar */}
      <div
        className="mt-10 ls-fadein"
        style={{ width: 160, animationDelay: '0.25s' }}
      >
        <div className="h-[3px] w-full rounded-full overflow-hidden" style={{ background: 'rgba(212,175,55,0.15)' }}>
          <div className="h-full rounded-full ls-bar" style={{ background: `linear-gradient(90deg, ${C.goldDark}, ${C.gold}, ${C.goldLight})` }} />
        </div>
        <p className="text-center text-[11px] mt-3 tracking-wide" style={{ color: C.muted }}>
          {message}
          <span style={{ letterSpacing: 2 }}>{'.'.repeat(dot + 1)}</span>
        </p>
      </div>
    </div>
  );
}
