// Google sign-in for ANDROID / iOS using expo-auth-session.
// Needs a development build (not Expo Go) and Android/iOS OAuth client IDs in .env — see GOOGLE_LOGIN_SETUP.md
import { useCallback, useEffect, useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
WebBrowser.maybeCompleteAuthSession();

const ids = {
  webClientId:process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || 'unset-web',
  androidClientId:process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || 'unset-android',
  iosClientId:process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || 'unset-ios',
};
const real = (v) => !!v && !v.startsWith('unset') && !v.startsWith('YOUR_');
export const googleConfigured = real(ids.androidClientId) || real(ids.iosClientId) || real(ids.webClientId);

export function useGoogleLogin({ onUser, onError }) {
  const [busy, setBusy] = useState(false);
  const [, res, prompt] = Google.useAuthRequest(ids);
  useEffect(() => {
    if (!res) return;
    if (res.type === 'success') {
      const token = res.authentication && res.authentication.accessToken;
      fetch('https://www.googleapis.com/oauth2/v3/userinfo', { headers:{ Authorization:`Bearer ${token}` } })
        .then(r => r.json()).then(u => { if (!u.email) throw new Error('no-email'); onUser({ name:u.name || 'Learner', email:u.email.toLowerCase(), picture:u.picture, provider:'google' }); })
        .catch((e) => onError(String(e.message || e))).finally(() => setBusy(false));
    } else { setBusy(false); if (res.type === 'error') onError('failed'); }
  }, [res]);
  const start = useCallback(() => { if (!googleConfigured) return onError('not-configured'); setBusy(true); prompt().catch(() => { setBusy(false); onError('failed'); }); }, [prompt, onError]);
  return { start, busy, configured:googleConfigured };
}
