# LearnNova 🌟  Learn • Play • Explore • Grow

Responsive children's learning app (Nursery/LKG + Grade 1–5) — React Native + Expo (Android, iOS, Web).

## Run
```bash
npm install
npx expo install expo-speech expo-audio expo-asset          # read-aloud voice + animal sounds on phones (web works without them)
npx expo install expo-print expo-sharing expo-notifications # phone PDF download + daily reminders (web works without them)
npx expo start --web                                        # browser;  press a / i or scan the QR for phones
```
If packages complain about versions: `npx expo install --fix`

**Two keys only YOU can create** (they belong to your own Google / Anthropic accounts, so nobody else can generate them for you). Empty files `.env` and `server/.env` are already in the project - just paste the key after the `=`:
1. **Google login** → copy `.env.example` to `.env`, add your client ID. Steps in `GOOGLE_LOGIN_SETUP.md`.
2. **Claude AI answers** → see "Real AI answers" below. Needs `npm run ai` running in a second terminal.

## Structure
- `App.js` – navigation (bottom tabs on mobile/tablet, sidebar on desktop)
- `hooks/useProgress.js` – XP, streak, daily targets, lessons, badges (AsyncStorage)
- `hooks/useResponsive.js` – breakpoints (mobile <600, tablet <1024, desktop)
- `components/` – Layout (Page, Grid), Cards, QuizEngine, Extras (AudioButton, Celebration, Shake, AI/Dictionary parts), CartoonBackground
- `data/` – phonicsData, nurseryData, contentData + mathData (generated), curriculum, stories, dictionaryData, achievementData, targets, quizBuilder
- `services/` – audioService (voice + sound clips), animalSounds, aiService (Claude via server, offline fallback), dictionaryService (online), googleAuth.web.js / googleAuth.native.js
- `screens/` – all screens (Home, Learn → Nursery/Grade dashboards, Phonics, Games, Quiz, Lesson, Progress, Dictionary, AI, Profile…)
- `server/server.js` – optional AI backend (keeps the API key off the app)

## Google login
Full guide: **`GOOGLE_LOGIN_SETUP.md`** (create a Web client ID, add `http://localhost:8081`, put it in `.env` as `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`, restart with `npx expo start -c --web`).
The web build uses Google's own sign-in window (no extra package). Phones use `expo-auth-session` with Android/iOS client IDs.

## Real AI answers (Claude)
The AI Assistant sends the whole chat to `server/server.js`, which asks Claude and returns a child-friendly answer. The API key stays on the server, never in the app.
1. Get an API key at https://console.anthropic.com (this is separate from a claude.ai chat subscription and is billed per use).
2. Copy `server/.env.example` to `server/.env` and paste your key.
3. In a second terminal: `npm run ai` (Node 18+). Check http://localhost:3000/health shows `"hasKey":true`.
4. The AI screen shows "● Smart AI connected". On a real phone set `EXPO_PUBLIC_AI_URL=http://<your-computer-ip>:3000` in `.env`.
Without the server the AI only answers simple built-in questions, maths and dictionary words.

## Dictionary
Searches kid-friendly built-in words first, then real online dictionaries (dictionaryapi.dev, Wiktionary, Datamuse) for any other word, with spelling correction ("habbit" → "habit") and a picture when one exists. Needs internet.

## Animal sounds
`assets/sounds/animals/*.wav` are synthesized cartoon-style sounds made by `tools/make_animal_sounds.py`. For real recordings, just replace the files with the same names (dog.wav, cat.wav, cow.wav, …).

## PDF downloads and reminders
- **PDF:** open any lesson, a subject, or the A–Z phonics page and tap **📄 Download … as PDF**. On the web, a print window opens → choose *Save as PDF*. On phones it saves a PDF and opens the share sheet (needs `expo-print` + `expo-sharing`).
- **Daily reminder:** Profile or Parent Section → **Daily tasks reminder** → turn ON and pick a time. It shows today's unfinished tasks. On phones it sends a daily notification (needs `expo-notifications`); on the web it shows a pop-up/notification while LearnNova is open.

## New in this version
- Animated greeting (fireworks + waving bear) when Home opens, fireworks and dancing animals on quiz results, an animal cheer on every correct answer.
- Animated background: floating toys, animals and candy, plus animals walking along the bottom.
- Reminder calendar (Profile or Parent Section → Daily reminder): see learning days, choose reminder days or every day.

## Deploy: GitHub + Vercel
See the commands in the chat answer / below. Web build: `npx expo export --platform web` (output `dist`). The AI runs as Vercel functions in `api/` (same code as `server/`), so set `ANTHROPIC_API_KEY` in Vercel > Settings > Environment Variables, plus `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`. Add your Vercel address to Google "Authorised JavaScript origins".

## Voice controls
Every voice and animal sound can be paused and resumed. A floating **Pause / Play / Stop** bar appears on every page while anything is playing, and each 🔊 button turns into Pause / Resume while its own sound plays. (Android phones cannot pause speech in the middle, so Play starts the sentence again.)

## Quick commands
```bash
npm install --legacy-peer-deps
npm run ai                       # terminal 1 (AI server, needs server/.env)
npx expo start -c --web          # terminal 2 -> http://localhost:8081
```
Phone-only extras (not needed for the website / Vercel):
`npx expo install expo-speech expo-audio expo-asset expo-print expo-sharing expo-notifications`

Deploy: push to GitHub (node_modules and .env are ignored by .gitignore), import the repo in Vercel, add `ANTHROPIC_API_KEY` and `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` under Settings > Environment Variables. `vercel.json` already contains the build settings.
