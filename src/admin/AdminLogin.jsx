import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { C } from '../data';
import { useStore, useRoute, useToast } from '../contexts';
import { LogoMark } from '../ui';

// Maps Firebase auth error codes to messages we're OK showing the user.
// Deliberately vague on credential mismatch — don't reveal whether the
// email exists.
function friendlyAuthError(code) {
  switch (code) {
    case 'auth/invalid-email':           return 'That email address is not valid.';
    case 'auth/user-disabled':           return 'This account has been disabled.';
    case 'auth/too-many-requests':       return 'Too many attempts. Try again in a few minutes.';
    case 'auth/network-request-failed':  return 'Network error. Check your connection.';
    default:                              return 'Sign in failed. Check your email and password.';
  }
}

export default function AdminLogin() {
  const { signIn } = useStore();
  const { navigate } = useRoute();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [busy, setBusy] = useState(false);

  const handleLogin = async (e) => {
    e?.preventDefault();
    if (busy) return;
    if (!email || !pwd) { toast('Enter email and password', 'error'); return; }
    setBusy(true);
    try {
      await signIn(email.trim(), pwd);
      // Auth listener flips adminAuth → Router will render the dashboard.
      navigate('adminDashboard');
    } catch (err) {
      toast(friendlyAuthError(err?.code), 'error');
    } finally {
      setBusy(false);
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
              style={{ color: C.gold }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="admin@example.com" autoFocus autoComplete="username"
              className="w-full h-12 px-4 rounded-xl outline-none text-sm"
              style={{ background: C.navy, color: C.text, border: `1px solid ${C.line}` }}/>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2"
              style={{ color: C.gold }}>Password</label>
            <input type="password" value={pwd} onChange={e => setPwd(e.target.value)}
              placeholder="Enter password" autoComplete="current-password"
              className="w-full h-12 px-4 rounded-xl outline-none text-sm"
              style={{ background: C.navy, color: C.text, border: `1px solid ${C.line}` }}/>
          </div>
          <button type="submit" disabled={busy}
            className="w-full h-12 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
            style={{ background: `linear-gradient(135deg, ${C.gold}, ${C.goldDark})`, color: C.navy }}>
            <Lock size={16}/> {busy ? 'Signing in…' : 'Sign In'}
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
