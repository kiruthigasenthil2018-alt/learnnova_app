// Daily reminder.
// • Phones: schedules a repeating daily notification (needs `npx expo install expo-notifications`).
// • Web: shows a browser notification + an in-app pop-up while LearnNova is open (browsers cannot wake a closed page).
import { Platform } from 'react-native';

let N = null;
try { N = require('expo-notifications'); } catch (e) { N = null; }

export const fmtTime = (h, m) => `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
export const nativeAvailable = () => Platform.OS !== 'web' && !!N;

export async function requestPermission() {
  try {
    if (Platform.OS === 'web') return typeof Notification !== 'undefined' ? (await Notification.requestPermission()) === 'granted' : false;
    if (!N) return false;
    const cur = await N.getPermissionsAsync(); if (cur.granted) return true;
    return (await N.requestPermissionsAsync()).granted;
  } catch (e) { return false; }
}

export const pad = (n) => String(n).padStart(2, '0');
export const dateKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
// Should the reminder fire on this day? ('daily' = every day, 'dates' = only the days picked in the calendar)
export const reminderDay = (r, d = new Date()) => !!r.on && (r.mode !== 'dates' || (r.dates || []).includes(dateKey(d)));

export async function applyReminder(r) {            // keep the phone's scheduled notifications in sync with the setting
  if (Platform.OS === 'web' || !N) return;
  try {
    await N.cancelAllScheduledNotificationsAsync();
    if (!r.on) return;
    const content = { title:'⏰ Time to learn with LearnNova!', body:"Finish today's tasks to keep your 🔥 streak going." };
    if (r.mode === 'dates') {
      for (const k of (r.dates || []).slice(0, 60)) {            // one notification per chosen calendar day
        const [y, m, d] = k.split('-').map(Number), when = new Date(y, m - 1, d, r.hour, r.minute, 0);
        if (when.getTime() > Date.now()) await N.scheduleNotificationAsync({ content, trigger:{ type:'date', date:when } });
      }
    } else await N.scheduleNotificationAsync({ content, trigger:{ type:'daily', hour:r.hour, minute:r.minute } });
  } catch (e) { if (__DEV__) console.log('[reminder]', e); }
}

export function notifyNow(title, body) {
  try {
    if (Platform.OS === 'web') { if (typeof Notification !== 'undefined' && Notification.permission === 'granted') new Notification(title, { body }); }
    else if (N) N.scheduleNotificationAsync({ content:{ title, body }, trigger:null });
  } catch (e) {}
}
