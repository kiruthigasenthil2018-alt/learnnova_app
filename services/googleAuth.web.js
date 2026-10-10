// Google sign-in for the WEB version, using Google Identity Services (no extra npm package needed).
// Needs only a "Web application" OAuth client ID in .env:  EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=xxxx.apps.googleusercontent.com
import { useCallback, useState } from 'react';

// NOTE: Expo only inlines process.env.EXPO_PUBLIC_* when written exactly like this (no process.env[name]).
const CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '';
export const googleConfigured = !!CLIENT_ID && !CLIENT_ID.startsWith('YOUR_');

let loading = null;
const loadGsi = () => {
  if (typeof window === 'undefined') return Promise.reject(new Error('no-window'));
  if (window.google && window.google.accounts && window.google.accounts.oauth2) return Promise.resolve();
  if (loading) return loading;
  loading = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client'; s.async = true; s.defer = true;
    s.onload = () => resolve(); s.onerror = () => { loading = null; reject(new Error('script')); };
    document.head.appendChild(s);
  });
  return loading;
};

export function useGoogleLogin({ onUser, onError }) {
  const [busy, setBusy] = useState(false);
  const start = useCallback(async () => {
    if (!googleConfigured) return onError('not-configured');
    setBusy(true);
    try {
      await loadGsi();
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id:CLIENT_ID, scope:'openid email profile',
        callback:async (resp) => {
          try {
            if (!resp || resp.error || !resp.access_token) throw new Error((resp && resp.error) || 'no-token');
            const r = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', { headers:{ Authorization:`Bearer ${resp.access_token}` } });
            const u = await r.json();
            if (!u.email) throw new Error('no-email');
            onUser({ name:u.name || u.given_name || 'Learner', email:u.email.toLowerCase(), picture:u.picture, provider:'google' });
          } catch (e) { onError(String(e.message || e)); }
          setBusy(false);
        },
        error_callback:(e) => { setBusy(false); onError((e && e.type) || 'popup_failed_to_open'); },
      });
      client.requestAccessToken({ prompt:'select_account' });
    } catch (e) { setBusy(false); onError(e.message === 'script' ? 'script' : 'failed'); }
  }, [onUser, onError]);
  return { start, busy, configured:googleConfigured };
}
