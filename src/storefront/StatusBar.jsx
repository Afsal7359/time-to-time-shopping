import React from 'react';
import { C } from '../data';

export default function StatusBar({ light = false }) {
  return (
    <div className="md:hidden flex items-center justify-between px-7 pt-4 pb-1 text-xs font-semibold"
      style={{ color: light ? '#fff' : C.navy }}>
      <span>11:30</span>
      <div className="flex items-center gap-1.5">
        <svg width="16" height="11" viewBox="0 0 16 11" fill="currentColor">
          <rect x="0" y="7" width="2.5" height="4" rx=".5"/>
          <rect x="3.5" y="5" width="2.5" height="6" rx=".5"/>
          <rect x="7" y="3" width="2.5" height="8" rx=".5"/>
          <rect x="10.5" y="0" width="2.5" height="11" rx=".5"/>
        </svg>
        <svg width="14" height="10" viewBox="0 0 16 12" fill="currentColor">
          <path d="M8 12a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM4.2 7.8a5.5 5.5 0 017.6 0l1.4-1.4a7.5 7.5 0 00-10.4 0l1.4 1.4z"/>
        </svg>
        <svg width="22" height="11" viewBox="0 0 26 12" fill="none">
          <rect x="1" y="1" width="22" height="10" rx="3" stroke="currentColor" strokeWidth="1"/>
          <rect x="3" y="3" width="18" height="6" rx="1.5" fill="currentColor"/>
          <rect x="24" y="4" width="2" height="4" rx="1" fill="currentColor"/>
        </svg>
      </div>
    </div>
  );
}
