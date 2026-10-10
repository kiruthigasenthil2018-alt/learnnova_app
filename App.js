import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, useColorScheme } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { C, F, APP, AVATARS, Store, useStore, lazyStyles, applyTheme } from './theme';
import { Logo, Dots, Float, Wallpaper, ReminderWatcher, BackButton, VoiceBar } from './components';
import useProgress from './hooks/useProgress';
import useResponsive from './hooks/useResponsive';
import WelcomeScreen from './screens/WelcomeScreen';
import AuthScreen from './screens/AuthScreen';
import SetupScreen from './screens/SetupScreen';
import ProfileSelectScreen from './screens/ProfileSelectScreen';
import ParentGateScreen from './screens/ParentGateScreen';
import ParentSectionScreen from './screens/ParentSectionScreen';
import HomeScreen from './screens/HomeScreen';
import LearnScreen from './screens/LearnScreen';
import GamesScreen from './screens/GamesScreen';
import AIScreen from './screens/AIScreen';
import ProfileScreen from './screens/ProfileScreen';
import ProgressScreen from './screens/ProgressScreen';
import DictionaryScreen from './screens/DictionaryScreen';
import LevelScreen from './screens/LevelScreen';
import PhonicsScreen from './screens/PhonicsScreen';
import PhonicsGamesScreen from './screens/PhonicsGamesScreen';
import NurseryCategoryScreen from './screens/NurseryCategoryScreen';
import ActivitiesScreen from './screens/ActivitiesScreen';
import MemoryScreen from './screens/MemoryScreen';
import PuzzleScreen from './screens/PuzzleScreen';
import RhymesScreen from './screens/RhymesScreen';
import TracingScreen from './screens/TracingScreen';
import SubjectScreen from './screens/SubjectScreen';
import LessonScreen from './screens/LessonScreen';
import StoryScreen from './screens/StoryScreen';
import QuizScreen from './screens/QuizScreen';
import PracticeScreen from './screens/PracticeScreen';
import BitesScreen from './screens/BitesScreen';
import StoriesScreen from './screens/StoriesScreen';
import VocabularyScreen from './screens/VocabularyScreen';

const Stack = createNativeStackNavigator(), Tab = createBottomTabNavigator();
// Colourful sidebar / tab icons: emoji picture on a tinted tile
const TABS = { Home:['🏠', '#2463EB'], Learn:['📚', '#43A047'], Games:['🎮', '#8E24AA'], Progress:['📊', '#FB8C00'], Dictionary:['📖', '#00897B'], AI:['🤖', '#EC407A'], Profile:['🧒', '#5E35B1'] };
// Every inner page gets the same dark header with a clear "Back" button (goes to the previous page, or Home if there is none)
const hdr = (title) => ({ navigation }) => ({
  headerShown:true, title, headerStyle:{ backgroundColor:C.dark }, headerTintColor:'#fff', headerTitleStyle:{ fontFamily:F.bold }, headerTitleAlign:'left',
  headerBackVisible:false, headerLeft:() => <BackButton onPress={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Main', { screen:'Home' }))} />,
});
const HIDE = { tabBarButton:() => null, tabBarItemStyle:{ display:'none' } };

function TabIcon({ name, focused, big }) {
  const [emoji, color] = TABS[name], size = big ? 40 : 34;
  return (
    <View style={{ width:size, height:size, borderRadius:size * 0.32, backgroundColor:color + (focused ? '55' : '30'), alignItems:'center', justifyContent:'center', borderWidth:focused ? 2.5 : 0, borderColor:color, transform:[{ scale:focused ? 1.1 : 1 }] }}>
      <Text style={{ fontSize:size * 0.55 }}>{emoji}</Text>
    </View>
  );
}

function Tabs() {
  const { data, settings } = useStore(), r = useResponsive();
  const [e, c] = AVATARS[(data.learner && data.learner.avatar) || 0];
  return (
    <>
    <ReminderWatcher />
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route, navigation }) => ({
        headerStyle:{ backgroundColor:C.dark }, headerTintColor:'#fff', headerTitleAlign:'left', headerTitle:() => <Logo size={30} light />,
        headerLeft:route.name === 'Home' ? undefined : () => <BackButton label={r.isMobile ? '' : 'Home'} onPress={() => navigation.navigate('Home')} />,
        headerRight:() => (<View style={s.hr}><Text style={s.hs}>🔥 {data.streak}</Text><Text style={s.hs}>⭐ {data.xp}</Text><View style={[s.hAv, { backgroundColor:c }]}><Text style={{ fontSize:18 }}>{e}</Text></View></View>),
        tabBarPosition:r.isDesktop ? 'left' : 'bottom', tabBarVariant:r.isDesktop ? 'material' : 'uniform',
        tabBarActiveTintColor:TABS[route.name][1], tabBarInactiveTintColor:C.grey, tabBarActiveIndicatorColor:C.sky,
        tabBarLabelStyle:{ fontFamily:F.bold, fontSize:r.isMobile ? 10 : r.isTablet ? 12 : 15 },
        tabBarStyle:{ backgroundColor:C.card, borderColor:C.line, ...(r.isDesktop ? { width:220, paddingTop:14 } : { height:r.isTablet ? 80 : 68, paddingBottom:r.isTablet ? 10 : 6, paddingTop:6 }) },
        tabBarIcon:({ focused }) => <TabIcon name={route.name} focused={focused} big={r.isDesktop} />,
      })}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Learn" component={LearnScreen} />
      <Tab.Screen name="Games" component={GamesScreen} options={settings.showGames ? {} : HIDE} />
      <Tab.Screen name="Progress" component={ProgressScreen} options={r.isMobile ? HIDE : {}} />
      <Tab.Screen name="Dictionary" component={DictionaryScreen} options={r.isMobile || !settings.showDictionary ? HIDE : {}} />
      <Tab.Screen name="AI" component={AIScreen} options={settings.showAI ? { title:'AI Assistant' } : HIDE} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
    </>
  );
}

// Splash: logo fade + scale, loading dots and bar
function Loading() {
  const bar = useRef(new Animated.Value(0)).current, pop = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(bar, { toValue:1, duration:1700, easing:Easing.out(Easing.quad), useNativeDriver:false }).start();
    Animated.spring(pop, { toValue:1, friction:5, useNativeDriver:true }).start();
  }, []);
  return (
    <Wallpaper theme="home">
      <View style={s.center}>
        <Animated.View style={{ alignItems:'center', opacity:pop, transform:[{ scale:pop.interpolate({ inputRange:[0, 1], outputRange:[0.6, 1] }) }] }}>
          <Float amp={10}><Text style={{ fontSize:80 }}>🌈</Text></Float>
          <Text style={s.brand} accessibilityRole="header">{APP.name}</Text>
          <Text style={s.tag}>{APP.short}</Text>
        </Animated.View>
        <View style={{ marginTop:24 }}><Dots color="#fff" /></View>
        <View style={s.track}><Animated.View style={[s.fill, { width:bar.interpolate({ inputRange:[0, 1], outputRange:['0%', '100%'] }) }]} /></View>
      </View>
    </Wallpaper>
  );
}

export default function App() {
  const [fonts] = useFonts({ Inter_400Regular, Inter_600SemiBold, Inter_700Bold });
  const { store, ready, user, data, profiles, settings } = useProgress();
  const scheme = useColorScheme();
  const mode = settings.mode === 'system' ? (scheme === 'dark' ? 'dark' : 'light') : settings.mode;
  applyTheme({ mode, palette:settings.palette });          // updates the live colour object before anything renders
  if (!fonts || !ready) return <Loading />;
  const stage = !user ? 'auth' : profiles.length === 0 ? 'setup' : !data || !data.learner ? 'profiles' : 'main';
  const navTheme = { ...DefaultTheme, dark:mode === 'dark', colors:{ ...DefaultTheme.colors, primary:C.blue, background:C.bg, card:C.card, text:C.text, border:C.line, notification:C.red } };
  const parent = <><Stack.Screen name="ParentGate" component={ParentGateScreen} options={{ animation:'fade' }} /><Stack.Screen name="ParentSection" component={ParentSectionScreen} options={hdr('Parent Section')} /></>;
  return (
    <SafeAreaProvider>
      <View style={s.outer}><View style={s.inner}>
        <Store.Provider value={store}>
          <NavigationContainer theme={navTheme} documentTitle={{ formatter:() => `${APP.name} – Learn • Play • Explore • Grow` }}>
            <Stack.Navigator screenOptions={{ headerShown:false, animation:'fade' }}>
              {stage === 'auth' && <><Stack.Screen name="Welcome" component={WelcomeScreen} /><Stack.Screen name="Auth" component={AuthScreen} /></>}
              {stage === 'setup' && <Stack.Screen name="Setup" component={SetupScreen} />}
              {stage === 'profiles' && <><Stack.Screen name="ProfileSelect" component={ProfileSelectScreen} /><Stack.Screen name="Setup" component={SetupScreen} />{parent}</>}
              {stage === 'main' && <>
                <Stack.Screen name="Main" component={Tabs} />
                {parent}
                <Stack.Screen name="Level" component={LevelScreen} options={hdr('Who is learning?')} />
                <Stack.Screen name="Phonics" component={PhonicsScreen} options={hdr('A–Z Phonics')} />
                <Stack.Screen name="PhonicsGames" component={PhonicsGamesScreen} options={hdr('Phonics Games')} />
                <Stack.Screen name="NurseryCategory" component={NurseryCategoryScreen} options={hdr('Learn')} />
                <Stack.Screen name="Activities" component={ActivitiesScreen} options={hdr('Activities')} />
                <Stack.Screen name="Memory" component={MemoryScreen} options={hdr('Memory Game')} />
                <Stack.Screen name="Puzzle" component={PuzzleScreen} options={hdr('Word Puzzle')} />
                <Stack.Screen name="Rhymes" component={RhymesScreen} options={hdr('Rhymes')} />
                <Stack.Screen name="Tracing" component={TracingScreen} options={hdr('Tracing')} />
                <Stack.Screen name="Subject" component={SubjectScreen} options={hdr('Subject')} />
                <Stack.Screen name="Lesson" component={LessonScreen} options={hdr('Lesson')} />
                <Stack.Screen name="Story" component={StoryScreen} options={hdr('Story Time')} />
                <Stack.Screen name="Quiz" component={QuizScreen} options={{ animation:'slide_from_bottom' }} />
                <Stack.Screen name="BrainGames" component={PracticeScreen} options={hdr('Brain Games')} />
                <Stack.Screen name="Bites" component={BitesScreen} options={hdr('Fun Facts')} />
                <Stack.Screen name="Stories" component={StoriesScreen} options={hdr('Story Mode')} />
                <Stack.Screen name="Vocabulary" component={VocabularyScreen} options={hdr('Vocabulary')} />
              </>}
            </Stack.Navigator>
          </NavigationContainer>
          <VoiceBar />
        </Store.Provider>
      </View></View>
    </SafeAreaProvider>
  );
}
const s = lazyStyles(() => StyleSheet.create({
  outer:{ flex:1, backgroundColor:C.dark, alignItems:'center' }, inner:{ flex:1, width:'100%', maxWidth:1440, backgroundColor:C.bg },
  center:{ flex:1, alignItems:'center', justifyContent:'center', padding:20 },
  brand:{ color:'#fff', fontFamily:F.bold, fontSize:40, marginTop:4 }, tag:{ color:'#DCE6FF', fontFamily:F.semi, marginTop:6, textAlign:'center', fontSize:16 },
  track:{ width:'70%', maxWidth:300, height:8, borderRadius:4, backgroundColor:'rgba(255,255,255,0.25)', marginTop:18, overflow:'hidden' }, fill:{ height:8, backgroundColor:C.green },
  hr:{ flexDirection:'row', alignItems:'center', gap:10, marginRight:12 }, hs:{ color:'#fff', fontFamily:F.bold, fontSize:13 }, hAv:{ width:32, height:32, borderRadius:16, alignItems:'center', justifyContent:'center' },
}));
