import React, { useMemo, useRef, useState } from 'react';
import { View, Text, Pressable, ScrollView, PanResponder, Animated, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, F, R, SHADOW } from '../theme';
import useResponsive from '../hooks/useResponsive';
import { Btn, ProgressBar, FadeIn, Float } from './base';
import { AudioButton, ShakeView } from './Extras';
import { Fireworks, DancingAnimals, AnimalCheer } from './Celebrate';
import { shuffle } from '../data/questionUtils';
import CartoonBackground from './CartoonBackground';
import { BackButton } from './BackButton';

const PRAISE = ['Great Job!', 'Awesome!', "You're doing it!", 'Fantastic!', 'Keep going!', 'Super!'];
const praise = () => PRAISE[Math.floor(Math.random() * PRAISE.length)];

// Match the following. Two ways to play (both work with finger or mouse):
//   • DRAG an answer from the right and DROP it on its partner on the left, or
//   • TAP a left card, then tap its match on the right.
function DragTile({ id, t, ok, bad, big, miss, cbs }) {
  const pos = useRef(new Animated.ValueXY()).current, moved = useRef(false), [drag, setDrag] = useState(false);
  const live = useRef({}); live.current = { ok, cbs };
  const back = () => Animated.spring(pos, { toValue:{ x:0, y:0 }, useNativeDriver:false, friction:6 }).start();
  const pan = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder:() => !live.current.ok,
    onMoveShouldSetPanResponder:() => !live.current.ok,
    onPanResponderTerminationRequest:() => false,
    onPanResponderGrant:() => { moved.current = false; },
    onPanResponderMove:(_, g) => {
      if (!moved.current && Math.abs(g.dx) + Math.abs(g.dy) > 8) { moved.current = true; setDrag(true); }
      if (moved.current) { pos.setValue({ x:g.dx, y:g.dy }); live.current.cbs.hover(id, g.dx, g.dy); }
    },
    onPanResponderRelease:(_, g) => {
      const was = moved.current; setDrag(false); live.current.cbs.hover(id, null);
      if (was) live.current.cbs.drop(id, g.dx, g.dy); else live.current.cbs.tap(id);
      back();
    },
    onPanResponderTerminate:() => { setDrag(false); live.current.cbs.hover(id, null); back(); },
  }), []);
  return (
    <Animated.View {...pan.panHandlers} accessibilityRole="button" accessibilityLabel={ok ? `${t}, matched` : `${t}. Drag onto its match, or tap.`}
      style={[{ transform:pos.getTranslateTransform(), zIndex:drag ? 50 : 1, elevation:drag ? 8 : 0, width:'100%' }, Platform.OS === 'web' ? { touchAction:'none', userSelect:'none', cursor:ok ? 'default' : 'grab' } : null]}>
      <ShakeView trigger={bad ? miss : 0} style={{ width:'100%' }}>
        <View style={{ minHeight:big ? 72 : 56, borderRadius:16, borderWidth:3, borderColor:ok ? C.green : bad ? C.red : drag ? C.blue : C.line, backgroundColor:ok ? C.mint : drag ? C.sky : C.card, alignItems:'center', justifyContent:'center', padding:8, flexDirection:'row', gap:6, opacity:drag ? 0.92 : 1 }}>
          <Text style={{ fontFamily:F.bold, fontSize:big && t.length <= 3 ? 36 : 17, color:C.text, textAlign:'center', flexShrink:1 }}>{t}</Text>{ok ? <Text style={{ color:C.green, fontFamily:F.bold, fontSize:18 }}>✓</Text> : null}
        </View>
      </ShakeView>
    </Animated.View>
  );
}

function MatchQ({ q, onResolved }) {
  const right = useMemo(() => shuffle(q.pairs.map((p, i) => ({ i, t:p[1] }))), [q]);
  const [selL, setSelL] = useState(null), [done, setDone] = useState([]), [miss, setMiss] = useState(0), [flash, setFlash] = useState(null), [hover, setHover] = useState(null);
  const L = useRef({}), Rr = useRef({}), colX = useRef({ l:0, r:0 }), hoverRef = useRef(null);
  const doneRef = useRef([]); doneRef.current = done;

  const attempt = (leftI, rightI) => {
    if (doneRef.current.includes(rightI)) return;
    if (leftI === rightI) { const d = [...doneRef.current, rightI]; setDone(d); setSelL(null); if (d.length === q.pairs.length) onResolved(miss === 0); }
    else { setMiss(m => m + 1); setFlash(rightI); setTimeout(() => setFlash(null), 500); }
  };
  // which left card is under the dragged answer?
  const overLeft = (id, dx, dy) => {
    const rr = Rr.current[id]; if (!rr) return null;
    const cx = colX.current.r + rr.x + rr.w / 2 + dx, cy = rr.y + rr.h / 2 + dy;
    for (const [k, l] of Object.entries(L.current)) { const x = colX.current.l + l.x; if (cx >= x && cx <= x + l.w && cy >= l.y - 6 && cy <= l.y + l.h + 6 && !doneRef.current.includes(+k)) return +k; }
    return null;
  };
  const cbs = {
    tap:(id) => { if (selL != null) attempt(selL, id); },
    hover:(id, dx, dy) => { const h = dx == null ? null : overLeft(id, dx, dy); if (h !== hoverRef.current) { hoverRef.current = h; setHover(h); } },
    drop:(id, dx, dy) => { const h = overLeft(id, dx, dy); if (h != null) attempt(h, id); },
  };
  const cbRef = useRef(cbs); cbRef.current = cbs;
  const stable = useRef({ tap:(i) => cbRef.current.tap(i), hover:(i, a, b) => cbRef.current.hover(i, a, b), drop:(i, a, b) => cbRef.current.drop(i, a, b) }).current;

  return (
    <View>
      <View style={{ flexDirection:'row', gap:12, zIndex:1 }}>
        <View style={{ flex:1, gap:10 }} onLayout={(e) => { colX.current.l = e.nativeEvent.layout.x; }}>
          {q.pairs.map((p, i) => (
            <View key={i} onLayout={(e) => { const l = e.nativeEvent.layout; L.current[i] = { x:l.x, y:l.y, w:l.width, h:l.height }; }}>
              <Pressable onPress={() => !done.includes(i) && setSelL(i)} accessibilityRole="button" accessibilityLabel={done.includes(i) ? `${p[0]}, matched` : p[0]}
                style={{ minHeight:q.big ? 72 : 56, borderRadius:16, borderWidth:3, borderColor:done.includes(i) ? C.green : hover === i ? C.blue : selL === i ? C.blue : C.line, backgroundColor:done.includes(i) ? C.mint : hover === i || selL === i ? C.sky : C.card, alignItems:'center', justifyContent:'center', padding:8, flexDirection:'row', gap:6, transform:[{ scale:hover === i ? 1.04 : 1 }] }}>
                <Text style={{ fontFamily:F.bold, fontSize:q.big && p[0].length <= 3 ? 36 : 17, color:C.text, textAlign:'center', flexShrink:1 }}>{p[0]}</Text>{done.includes(i) ? <Text style={{ color:C.green, fontFamily:F.bold, fontSize:18 }}>✓</Text> : null}
              </Pressable>
            </View>))}
        </View>
        <View style={{ flex:1, gap:10, zIndex:5 }} onLayout={(e) => { colX.current.r = e.nativeEvent.layout.x; }}>
          {right.map(rt => (
            <View key={rt.i} onLayout={(e) => { const l = e.nativeEvent.layout; Rr.current[rt.i] = { x:l.x, y:l.y, w:l.width, h:l.height }; }}>
              <DragTile id={rt.i} t={rt.t} big={q.big} ok={done.includes(rt.i)} bad={flash === rt.i} miss={miss} cbs={stable} />
            </View>))}
        </View>
      </View>
      <Text style={{ fontFamily:F.semi, color:C.grey, textAlign:'center', marginTop:12 }}>👆 Drag an answer from the right onto its match, or tap a left card then its match.</Text>
    </View>
  );
}

export default function QuizEngine({ quiz, onFinish, nextActions, onClose, onRestart }) {
  const r = useResponsive();
  const qs = quiz.questions, total = qs.length, kid = quiz.kid;
  const [i, setI] = useState(0), [sel, setSel] = useState(null), [checked, setChecked] = useState(false), [matchOk, setMatchOk] = useState(null);
  const [score, setScore] = useState(0), [wrongTick, setWrongTick] = useState(0), [result, setResult] = useState(null), [msg, setMsg] = useState(praise());
  const q = qs[i];

  if (!total) return <View style={{ flex:1, alignItems:'center', justifyContent:'center' }}><Text style={{ fontFamily:F.bold, fontSize:18, color:C.text }}>No questions yet 📚</Text></View>;

  // ---------- results ----------
  if (result) {
    const pct = Math.round((score / total) * 100), perfect = score === total;
    return (
      <SafeAreaView style={{ flex:1, backgroundColor:C.bg }}><CartoonBackground theme={quiz.theme || 'home'} />
        <ScrollView contentContainerStyle={{ alignItems:'center', padding:r.pad, flexGrow:1, justifyContent:'center' }}>
          {pct >= 50 && <Fireworks bursts={4} count={16} big duration={1700} />}
          <FadeIn style={{ width:'100%', maxWidth:480, alignItems:'center', gap:6 }}>
            <DancingAnimals mood={pct >= 50 ? 'cheer' : 'try'} title={perfect ? 'Perfect score!' : pct >= 50 ? 'Congratulations!' : 'Keep trying!'} sub={pct >= 50 ? 'The animals are dancing for you!' : 'The animals believe in you!'} />
            <Float amp={12}><Text style={{ fontSize:72 }}>{perfect ? '🏆' : pct >= 50 ? '🎉' : '🌟'}</Text></Float>
            <Text style={{ fontFamily:F.bold, fontSize:r.fs(28), color:C.text, textAlign:'center' }}>{quiz.finishTitle || 'Quiz Complete!'}</Text>
            <Text style={{ fontFamily:F.bold, fontSize:r.fs(34), color:C.blue }}>Score: {score}/{total}</Text>
            <Text style={{ fontFamily:F.semi, fontSize:20, color:C.grey }}>{pct}%</Text>
            <Text style={{ fontFamily:F.semi, fontSize:16, color:C.text, textAlign:'center' }}>{perfect ? 'Perfect! You got every one right!' : pct >= 50 ? 'You learned something new!' : "Let's try again — you can do it!"}</Text>
            <View style={{ backgroundColor:C.cream, borderRadius:R.card, borderWidth:2, borderColor:C.gold, paddingVertical:10, paddingHorizontal:22, marginTop:8 }}><Text style={{ fontFamily:F.bold, fontSize:24, color:'#B26A00' }}>⭐ +{result.xp} XP</Text></View>
            {result.streak > 0 && <Text style={{ fontFamily:F.bold, fontSize:16, color:'#E65100', marginTop:6 }}>🔥 Streak maintained • {result.streak} day{result.streak > 1 ? 's' : ''}</Text>}
            {(result.newBadges || []).map(b => <Text key={b.id} style={{ fontFamily:F.bold, fontSize:15, color:C.text, marginTop:4 }}>🏅 New badge: {b.emoji} {b.title}</Text>)}
            {quiz.moral ? <View style={{ backgroundColor:C.mint, borderRadius:R.card, padding:14, marginTop:10, width:'100%' }}><Text style={{ fontFamily:F.bold, color:C.okText }}>💡 Moral of the story</Text><Text style={{ fontFamily:F.semi, color:C.text, fontSize:16, lineHeight:24 }}>{quiz.moral}</Text></View> : null}
            <Text style={{ fontFamily:F.bold, fontSize:15, color:C.grey, marginTop:10 }}>🏆 Progress updated</Text>
            {nextActions ? (
              <View style={{ width:'100%', gap:10, marginTop:14 }}>
                <Text style={{ fontFamily:F.bold, fontSize:16, color:C.text }}>Next:</Text>
                {nextActions(result).map(a => <Btn key={a.label} title={`${a.emoji}  ${a.label}`} outline color={C.blue} onPress={a.onPress} />)}
              </View>
            ) : null}
            <View style={{ width:'100%', gap:10, marginTop:10 }}>
              {onRestart ? <Btn title="Play again" outline color={C.grey} onPress={onRestart} /> : null}
              <Btn title="Continue Learning" color={C.green} onPress={onClose} />
            </View>
          </FadeIn>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ---------- one question ----------
  const isMatch = q.type === 'match';
  const ok = checked && (isMatch ? matchOk : sel === q.a);
  const advance = () => {
    if (i + 1 >= total) { const s = score; setResult(onFinish ? onFinish(s, total) : { xp:0, streak:0 }); return; }
    setI(i + 1); setSel(null); setChecked(false); setMatchOk(null); setMsg(praise());
  };
  const check = () => { setChecked(true); if (sel === q.a) setScore(s => s + 1); else setWrongTick(t => t + 1); };
  const resolveMatch = (good) => { setMatchOk(good); setChecked(true); if (good) setScore(s => s + 1); else setWrongTick(t => t + 1); };
  const optBig = q.big, isSym = (o) => optBig && !/[A-Za-z]{2,}/.test(o) && o.length <= 8, wide = q.type === 'tf' || !optBig;

  return (
    <SafeAreaView style={{ flex:1, backgroundColor:C.bg }}><CartoonBackground theme={quiz.theme || 'home'} />
      <View style={{ flexDirection:'row', alignItems:'center', gap:12, padding:14 }}>
        <BackButton onPress={onClose} light={false} color={C.text} label="Back" style={{ paddingHorizontal:0 }} />
        <View style={{ flex:1 }}><ProgressBar value={(i + (checked ? 1 : 0)) / total} color={quiz.color || C.green} height={14} /></View>
        <Text style={{ fontFamily:F.bold, color:C.text, fontSize:13 }}>{score} ⭐</Text>
      </View>
      <ScrollView contentContainerStyle={{ alignItems:'center', padding:r.pad, paddingBottom:30 }} keyboardShouldPersistTaps="handled">
        <View style={{ width:'100%', maxWidth:660, gap:12 }}>
          <Text style={{ fontFamily:F.semi, color:C.grey }}>{quiz.emoji} {quiz.title}  •  Question {i + 1} of {total}</Text>
          <FadeIn key={i}>
            <ShakeView trigger={checked && !ok ? wrongTick : 0} style={{ gap:12 }}>
              {q.pic ? <View style={{ backgroundColor:C.cream, borderRadius:R.card, padding:14, alignItems:'center', minHeight:100, justifyContent:'center' }}><Text style={{ fontSize:q.pic.length > 14 ? 34 : 54, textAlign:'center', lineHeight:q.pic.length > 14 ? 44 : 66 }} accessibilityLabel={`Picture: ${q.pic}`}>{q.pic}</Text></View> : null}
              <Text style={{ fontFamily:F.bold, fontSize:r.fs(kid ? 26 : 22), color:C.text, flexShrink:1, lineHeight:r.fs(kid ? 34 : 30) }} accessibilityRole="header">{q.q}</Text>
              {(kid || q.say) && q.say !== undefined ? <AudioButton say={q.say || q.q} clip={q.clip} label={q.audioOnly ? 'Play sound' : 'Hear it'} size={kid ? 'lg' : 'md'} note={q.say} style={{ alignSelf:'flex-start' }} /> : kid ? <AudioButton say={q.q.replace(/_/g, 'blank')} label="Read to me" style={{ alignSelf:'flex-start' }} /> : null}
              {isMatch ? <MatchQ key={i} q={q} onResolved={resolveMatch} /> : (
                <View style={{ flexDirection:'row', flexWrap:'wrap', gap:10, justifyContent:'space-between' }}>
                  {q.o.map((o, k) => {
                    const right = checked && k === q.a, wrong = checked && sel === k && k !== q.a, picked = !checked && sel === k;
                    return (
                      <Pressable key={k} disabled={checked} onPress={() => setSel(k)} accessibilityRole="button" accessibilityState={{ selected:sel === k }} accessibilityLabel={`Option ${String.fromCharCode(65 + k)}: ${o}${right ? ', correct answer' : wrong ? ', not correct' : ''}`}
                        style={{ width:wide ? '100%' : '48%', minHeight:optBig ? 76 : 58, flexDirection:'row', alignItems:'center', gap:10, borderRadius:R.btn, borderWidth:3, borderBottomWidth:5, padding:12, borderColor:right ? C.green : wrong ? C.red : picked ? C.blue : C.line, backgroundColor:right ? C.mint : wrong ? C.rose : picked ? C.sky : C.card }}>
                        <View style={{ width:34, height:34, borderRadius:10, alignItems:'center', justifyContent:'center', backgroundColor:right ? C.green : wrong ? C.red : picked ? C.blue : C.bg }}>
                          <Text style={{ fontFamily:F.bold, color:(right || wrong || picked) ? '#fff' : C.text }}>{right ? '✓' : wrong ? '✕' : String.fromCharCode(65 + k)}</Text>
                        </View>
                        <Text style={{ flex:1, fontFamily:F.bold, fontSize:isSym(o) ? 38 : r.fs(17), color:C.text, textAlign:isSym(o) ? 'center' : 'left' }}>{o}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </ShakeView>
          </FadeIn>
        </View>
      </ScrollView>
      <View style={{ padding:14, borderTopWidth:1, borderTopColor:C.line, backgroundColor:checked ? (ok ? C.mint : C.rose) : C.card }}>
        <View style={{ width:'100%', maxWidth:660, alignSelf:'center', gap:8 }}>
          {checked && ok && (<View><Fireworks count={12} duration={1200} /><AnimalCheer /><Text style={{ fontFamily:F.bold, fontSize:20, color:C.okText }}>🎉 {msg}</Text><Text style={{ fontFamily:F.semi, color:C.okText }}>✓ Correct Answer   ⭐ Star earned!</Text></View>)}
          {checked && !ok && (<View><Text style={{ fontFamily:F.bold, fontSize:20, color:C.red }}>💡 Try Again!</Text><Text style={{ fontFamily:F.semi, color:C.red }}>That's not quite right. Let's learn it together.</Text>{!isMatch ? <Text style={{ fontFamily:F.bold, color:C.text, marginTop:2 }}>The answer is: {q.o[q.a]}</Text> : null}</View>)}
          {isMatch ? (checked ? <Btn title={i + 1 >= total ? 'Finish' : 'Continue'} color={ok ? C.green : C.blue} onPress={advance} /> : <Text style={{ fontFamily:F.semi, color:C.grey, textAlign:'center' }}>Drag an answer onto its match — or tap a left card, then its match 👆</Text>)
            : !checked ? <Btn title="Check" color={C.blue} disabled={sel === null} onPress={check} /> : <Btn title={i + 1 >= total ? 'Finish' : 'Continue'} color={ok ? C.green : C.blue} onPress={advance} />}
        </View>
      </View>
    </SafeAreaView>
  );
}
