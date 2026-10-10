import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { C, F, useStore } from '../theme';
import { Dialog } from './Extras';
import { SettingRow } from './SettingsParts';
import { dailyProgress } from '../data/targets';
import { applyReminder, fmtTime, notifyNow, requestPermission, nativeAvailable, dateKey, reminderDay } from '../services/reminderService';

const dayKey = () => { const d = new Date(); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; };
const pendingText = (data) => {
  const p = dailyProgress(data.counts, data.learner.level);
  const lines = p.groups.flatMap(g => g.items.filter(i => !i.done).map(i => `${g.emoji} ${g.label}: ${i.label} (${i.have}/${i.need})`));
  return lines.length ? lines.join('\n') : '🎉 All of today\'s tasks are done. Great job!';
};

// Lives inside the main screens: syncs phone notifications and shows the "daily tasks" pop-up at the chosen time.
export function ReminderWatcher() {
  const { data, settings, setSettings } = useStore(), nav = useNavigation(), [open, setOpen] = useState(false);
  const r = settings.reminder, ref = useRef({ r, data, settings }); ref.current = { r, data, settings };
  useEffect(() => { applyReminder(r); }, [r.on, r.hour, r.minute, r.mode, (r.dates || []).join(',')]);
  useEffect(() => {
    const tick = () => {
      const { r, data } = ref.current, n = new Date();
      if (!reminderDay(r) || r.last === dayKey()) return;
      if (n.getHours() * 60 + n.getMinutes() < r.hour * 60 + r.minute) return;
      if (dailyProgress(data.counts, data.learner.level).complete) return;
      setSettings({ reminder:{ ...r, last:dayKey() } });
      notifyNow('⏰ Time to learn with LearnNova!', "Finish today's tasks to keep your streak.");
      setOpen(true);
    };
    tick(); const id = setInterval(tick, 20000); return () => clearInterval(id);
  }, []);
  return (
    <Dialog visible={open} title="⏰ Daily tasks reminder" text={`Hi ${data.learner.name}! Today's tasks:\n\n${pendingText(data)}`}
      buttons={[{ label:'Later', outline:true, onPress:() => setOpen(false) }, { label:"Let's learn!", onPress:() => { setOpen(false); nav.navigate('Main', { screen:'Learn' }); } }]} />
  );
}

// ---------- Calendar: see learning days, and pick the days you want reminders ----------
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
function ReminderCalendar({ r, set, week }) {
  const now = new Date(), [view, setView] = useState({ y:now.getFullYear(), m:now.getMonth() }), todayK = dateKey(now), dates = r.dates || [];
  const first = new Date(view.y, view.m, 1).getDay(), days = new Date(view.y, view.m + 1, 0).getDate();
  const cells = [...Array(first).fill(null), ...Array.from({ length:days }, (_, i) => i + 1)];
  while (cells.length % 7) cells.push(null);
  const go = (d) => { const t = new Date(view.y, view.m + d, 1); setView({ y:t.getFullYear(), m:t.getMonth() }); };
  const toggle = (day) => {
    const k = dateKey(new Date(view.y, view.m, day)); if (k < todayK) return;
    const next = dates.includes(k) ? dates.filter(x => x !== k) : [...dates, k].sort();
    set({ mode:'dates', dates:next });
  };
  const Mode = ({ k, label }) => <Pressable onPress={() => set({ mode:k })} accessibilityRole="button" accessibilityState={{ selected:(r.mode || 'daily') === k }} style={{ flex:1, paddingVertical:10, borderRadius:14, minHeight:44, alignItems:'center', justifyContent:'center', backgroundColor:(r.mode || 'daily') === k ? C.blue : C.card, borderWidth:2, borderColor:(r.mode || 'daily') === k ? C.blue : C.line }}><Text style={{ fontFamily:F.bold, fontSize:13, color:(r.mode || 'daily') === k ? '#fff' : C.text }}>{label}</Text></Pressable>;
  const nav = (label, d) => <Pressable onPress={() => go(d)} accessibilityRole="button" accessibilityLabel={label} style={{ width:44, height:44, borderRadius:22, backgroundColor:C.sky, alignItems:'center', justifyContent:'center' }}><Text style={{ fontFamily:F.bold, fontSize:24, color:C.blue }}>{d < 0 ? '‹' : '›'}</Text></Pressable>;
  return (
    <View style={{ width:'100%', maxWidth:420, gap:10, alignSelf:'center' }}>
      <Text style={{ fontFamily:F.bold, fontSize:16, color:C.text, textAlign:'center' }}>📅 Reminder calendar</Text>
      <View style={{ flexDirection:'row', gap:8 }}><Mode k="daily" label="Every day" /><Mode k="dates" label={`Only chosen days (${dates.length})`} /></View>
      <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between' }}>{nav('Previous month', -1)}<Text style={{ fontFamily:F.bold, fontSize:18, color:C.text }}>{MONTHS[view.m]} {view.y}</Text>{nav('Next month', 1)}</View>
      <View style={{ flexDirection:'row' }}>{['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <Text key={i} style={{ flex:1, textAlign:'center', fontFamily:F.bold, color:C.grey, fontSize:12 }}>{d}</Text>)}</View>
      <View style={{ flexDirection:'row', flexWrap:'wrap' }}>
        {cells.map((d, i) => {
          if (!d) return <View key={i} style={{ width:`${100 / 7}%`, height:46 }} />;
          const k = dateKey(new Date(view.y, view.m, d)), past = k < todayK, picked = dates.includes(k), st = week && week[k], isToday = k === todayK;
          return (
            <View key={i} style={{ width:`${100 / 7}%`, height:46, padding:2 }}>
              <Pressable onPress={() => toggle(d)} disabled={past} accessibilityRole="button" accessibilityLabel={`${d} ${MONTHS[view.m]}${picked ? ', reminder on' : ''}${st ? ', learned' : ''}`}
                style={{ flex:1, borderRadius:12, alignItems:'center', justifyContent:'center', backgroundColor:picked ? C.blue : st ? C.mint : 'transparent', borderWidth:isToday ? 2 : 1, borderColor:isToday ? C.orange || C.blue : picked ? C.blue : C.line, opacity:past && !st ? 0.45 : 1 }}>
                <Text style={{ fontFamily:F.bold, fontSize:14, color:picked ? '#fff' : C.text }}>{d}</Text>
                {st ? <Text style={{ fontSize:9, position:'absolute', bottom:0, right:2 }}>{st === 'full' ? '🌟' : '🔥'}</Text> : null}
                {picked ? <Text style={{ fontSize:9, position:'absolute', top:0, right:2 }}>⏰</Text> : null}
              </Pressable>
            </View>);
        })}
      </View>
      <Text style={{ fontFamily:F.semi, fontSize:12, color:C.grey, textAlign:'center' }}>⏰ reminder day   🔥 learned   🌟 all tasks done   •   Tap a coming day to add or remove a reminder.</Text>
      {dates.length > 0 && <Pressable onPress={() => set({ dates:[] })} accessibilityRole="button"><Text style={{ fontFamily:F.bold, color:C.blue, textAlign:'center' }}>Clear chosen days</Text></Pressable>}
    </View>
  );
}

// Settings card: ON/OFF + time stepper + calendar + test button
export function ReminderCard() {
  const { data, settings, setSettings } = useStore(), r = settings.reminder, [msg, setMsg] = useState(''), [test, setTest] = useState(false);
  const set = (p) => setSettings({ reminder:{ ...r, ...p, last:'' } });
  const shift = (mins) => { const t = (r.hour * 60 + r.minute + mins + 1440) % 1440; set({ hour:Math.floor(t / 60), minute:t % 60 }); };
  const toggle = async (on) => {
    if (on) { const ok = await requestPermission(); setMsg(ok ? '' : nativeAvailable() || typeof window !== 'undefined' ? 'Notifications are blocked, so you will see the in-app pop-up while LearnNova is open.' : 'Install expo-notifications for phone alerts (see README). The in-app pop-up still works.'); }
    set({ on });
  };
  const Step = ({ label, d }) => <Pressable onPress={() => shift(d)} accessibilityRole="button" accessibilityLabel={label} style={{ width:48, height:48, borderRadius:24, backgroundColor:C.sky, alignItems:'center', justifyContent:'center' }}><Text style={{ fontFamily:F.bold, fontSize:24, color:C.blue }}>{d < 0 ? '−' : '+'}</Text></Pressable>;
  return (
    <View style={{ gap:6 }}>
      <SettingRow emoji="⏰" title="Daily tasks reminder" sub="A reminder to finish today's learning tasks" value={r.on} onChange={toggle} />
      {r.on && (
        <View style={{ alignItems:'center', gap:10, paddingBottom:6 }}>
          <Text style={{ fontFamily:F.semi, color:C.grey }}>Remind me at</Text>
          <View style={{ flexDirection:'row', alignItems:'center', gap:14 }}><Step label="Earlier by 30 minutes" d={-30} /><Text style={{ fontFamily:F.bold, fontSize:28, color:C.text, minWidth:130, textAlign:'center' }}>{fmtTime(r.hour, r.minute)}</Text><Step label="Later by 30 minutes" d={30} /></View>
          <View style={{ flexDirection:'row', flexWrap:'wrap', gap:8, justifyContent:'center' }}>
            {[[8, 0], [16, 0], [17, 0], [18, 30], [19, 30]].map(([h, m]) => <Pressable key={h + ':' + m} onPress={() => set({ hour:h, minute:m })} accessibilityRole="button" style={{ paddingVertical:8, paddingHorizontal:12, borderRadius:16, backgroundColor:r.hour === h && r.minute === m ? C.blue : C.card, borderWidth:2, borderColor:C.line, minHeight:40, justifyContent:'center' }}><Text style={{ fontFamily:F.bold, color:r.hour === h && r.minute === m ? '#fff' : C.text, fontSize:13 }}>{fmtTime(h, m)}</Text></Pressable>)}
          </View>
          <ReminderCalendar r={r} set={set} week={data.week} />
          <Pressable onPress={() => { notifyNow('⏰ Time to learn with LearnNova!', 'This is a test reminder.'); setTest(true); }} accessibilityRole="button" style={{ paddingVertical:10, paddingHorizontal:18, borderRadius:20, borderWidth:2, borderColor:C.blue, minHeight:44, justifyContent:'center' }}><Text style={{ fontFamily:F.bold, color:C.blue }}>Send a test reminder</Text></Pressable>
          {msg ? <Text style={{ fontFamily:F.semi, fontSize:12, color:C.grey, textAlign:'center' }}>{msg}</Text> : null}
        </View>)}
      <Dialog visible={test} title="⏰ Daily tasks reminder" text={`Today's tasks for ${data.learner.name}:\n\n${pendingText(data)}`} buttons={[{ label:'Okay', onPress:() => setTest(false) }]} />
    </View>
  );
}
