# Real Google login — setup

LearnNova uses Google's own sign-in window. No password is stored for Google users.

## 1. Packages (already in package.json — just make sure they are installed)
```bash
npm install
npx expo install expo-auth-session expo-web-browser expo-crypto expo-linking expo-apple-authentication
```
Web needs **no extra package** (it loads Google's `gsi/client` script by itself).

## 2. Create the Google client ID (about 5 minutes, free)
1. Open https://console.cloud.google.com → create/select a project.
2. **APIs & Services → OAuth consent screen** → *External* → fill app name (LearnNova) and your email → **Test users: add the Gmail addresses you will sign in with** → Save.
3. **APIs & Services → Credentials → Create credentials → OAuth client ID → Web application.**
   - **Authorised JavaScript origins:** `http://localhost:8081`
   - **Authorised redirect URIs:** `http://localhost:8081`
   (If you run on another port or domain, add that too. Origins have no trailing slash.)
4. Copy the **Client ID** (looks like `123456-abc.apps.googleusercontent.com`).

## 3. Put it in `.env`
Copy `.env.example` to `.env` and paste:
```
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=123456-abc.apps.googleusercontent.com
```
Restart with the cache cleared (needed every time `.env` changes):
```bash
npx expo start -c --web
```
Click **Continue with Google** on the sign-up page. A Google window opens, you pick your account, and you are signed in.

## Phones (optional)
Google blocks sign-in inside Expo Go. Make a development build (`npx expo run:android` / `npx expo run:ios`) and create an **Android** client ID (package `com.learnova.app` + your SHA-1) and an **iOS** client ID (bundle id `com.learnova.app`). Put them in `.env` as `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` / `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`.

## Troubleshooting
| Message | Fix |
|---|---|
| "Google sign-in is not set up yet" | `.env` is missing/empty, or you did not restart with `-c`. |
| `redirect_uri_mismatch` / "origin not allowed" | The address in the browser bar is not in *Authorised JavaScript origins*. |
| "Access blocked: app has not completed verification" | Add your Gmail under *OAuth consent screen → Test users*. |
| Window does not open | Allow pop-ups for localhost. |
