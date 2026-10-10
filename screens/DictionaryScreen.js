import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { C, F, R, useStore, isNursery, gradeOf } from '../theme';
import { Page, Card, LearnNovaHeader, DictionarySearch, DictionaryResult, EmptyState, ErrorState, Btn } from '../components';
import { lookup, suggest, didYouMean, wordOfTheDay, allWords, wordImage } from '../services/dictionaryService';

export default function DictionaryScreen({ navigation }) {
  const { data } = useStore(), lv = data.learner.level, young = isNursery(lv) || (gradeOf(lv) || 9) <= 2;
  const [q, setQ] = useState(''), [entry, setEntry] = useState(null), [state, setState] = useState('idle'), [kid, setKid] = useState(young), [alt, setAlt] = useState([]), [img, setImg] = useState(null), runId = React.useRef(0);
  const search = async (w) => {
    if (!w || !w.trim()) return;
    const id = ++runId.current;                       // ignore answers of older searches
    setState('loading'); setAlt([]); setImg(null);
    try {
      const e = await lookup(w);
      if (id !== runId.current) return;
      if (e) {
        setEntry(e); setState('found');
        wordImage(e.corrected || e.word).then(u => { if (id === runId.current) setImg(u); });
      } else { setEntry(null); setState('missing'); const a = await didYouMean(w); if (id === runId.current) setAlt(a); }
    } catch (err) { if (__DEV__) console.log(err); if (id === runId.current) setState('error'); }
  };
  const sugg = q.trim().length > 0 && state !== 'found' ? suggest(q) : [];
  const wod = wordOfTheDay();
  return (
    <Page theme="home" keyboard max={720}>
      <LearnNovaHeader title="Dictionary 📖" sub="Search a word and see what it means" color="#00796B" emoji="🔎" />
      <DictionarySearch value={q} onChange={(t) => { setQ(t); if (state === 'found') setState('idle'); }} onSearch={search} />
      <View style={{ flexDirection:'row', gap:8, flexWrap:'wrap' }}>
        {[[true, '🧸 Picture mode'], [false, '🎓 Full meaning']].map(([k, l]) => <Pressable key={l} onPress={() => setKid(k)} accessibilityRole="button" accessibilityState={{ selected:kid === k }} style={{ paddingVertical:10, paddingHorizontal:16, borderRadius:20, minHeight:44, justifyContent:'center', backgroundColor:kid === k ? C.blue : C.card, borderWidth:2, borderColor:C.line }}><Text style={{ fontFamily:F.bold, color:kid === k ? '#fff' : C.text }}>{l}</Text></Pressable>)}
      </View>
      {sugg.length > 0 && <View style={{ flexDirection:'row', flexWrap:'wrap', gap:8 }}>{sugg.map(s => <Pressable key={s.word} onPress={() => { setQ(s.word); search(s.word); }} accessibilityRole="button" style={{ backgroundColor:C.card, borderRadius:18, paddingVertical:8, paddingHorizontal:14, borderWidth:2, borderColor:C.line, minHeight:40, justifyContent:'center' }}><Text style={{ fontFamily:F.semi, color:C.text }}>{s.emoji} {s.word}</Text></Pressable>)}</View>}
      {state === 'loading' && <Card><EmptyState emoji="🔎" text="Looking it up..." sub="Just a moment!" /></Card>}
      {state === 'found' && entry && (<>
        {entry.corrected ? <Card style={{ backgroundColor:C.cream }}><Text style={{ fontFamily:F.semi, color:C.text }}>✏️ Showing the meaning of <Text style={{ fontFamily:F.bold }}>{entry.corrected}</Text> (you typed “{entry.typed}”).</Text></Card> : null}
        {entry.note ? <Card style={{ backgroundColor:C.sky }}><Text style={{ fontFamily:F.semi, color:C.text }}>💡 {entry.note}</Text></Card> : null}
        <DictionaryResult entry={entry} kid={kid} image={img} />
      </>)}
      {state === 'missing' && <Card><EmptyState emoji="🤔" text="We couldn't find that word yet." sub="Check the spelling, or ask LearnNova AI!" />{alt.length > 0 && <View style={{ gap:8, marginBottom:10 }}><Text style={{ fontFamily:F.bold, color:C.text }}>Did you mean:</Text><View style={{ flexDirection:'row', flexWrap:'wrap', gap:8 }}>{alt.map(a => <Pressable key={a} onPress={() => { setQ(a); search(a); }} accessibilityRole="button" style={{ backgroundColor:C.sky, borderRadius:18, paddingVertical:8, paddingHorizontal:14, minHeight:40, justifyContent:'center' }}><Text style={{ fontFamily:F.bold, color:C.blue }}>{a}</Text></Pressable>)}</View></View>}<Btn title="🤖 Ask LearnNova AI" outline color={C.blue} onPress={() => navigation.navigate('AI')} /></Card>}
      {state === 'error' && <Card><ErrorState onRetry={() => search(q)} /><Text style={{ fontFamily:F.semi, color:C.grey, textAlign:'center' }}>Looking up new words needs the internet.</Text></Card>}
      {state === 'idle' && (<>
        <Card onPress={() => { setQ(wod.word); search(wod.word); }} label="Word of the day" style={{ flexDirection:'row', gap:14, alignItems:'center' }}>
          <Text style={{ fontSize:48 }}>{wod.emoji}</Text><View style={{ flex:1 }}><Text style={{ fontFamily:F.semi, color:C.grey }}>⭐ Word of the day</Text><Text style={{ fontFamily:F.bold, fontSize:22, color:C.text, textTransform:'capitalize' }}>{wod.word}</Text></View><Text style={{ fontSize:22, color:C.grey }}>›</Text>
        </Card>
        <Text style={{ fontFamily:F.bold, color:C.text }}>Try these words</Text>
        <View style={{ flexDirection:'row', flexWrap:'wrap', gap:8 }}>{allWords().slice(0, 18).map(w => <Pressable key={w.word} onPress={() => { setQ(w.word); search(w.word); }} accessibilityRole="button" style={{ backgroundColor:C.card, borderRadius:18, paddingVertical:8, paddingHorizontal:14, borderWidth:2, borderColor:C.line, minHeight:40, justifyContent:'center' }}><Text style={{ fontFamily:F.semi, color:C.text }}>{w.emoji} {w.word}</Text></Pressable>)}</View>
      </>)}
    </Page>
  );
}
