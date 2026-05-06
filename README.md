# Toporyx

Toporyx is a topology and systems-diagram editor built with React, Vite, and Firebase.

## Development

```bash
npm install
npm run dev
```

For cloud-enabled local development, create a `.env.local` file from `.env.example` and fill in your Firebase web app values.

## Quality Checks

```bash
npm run lint
npm run test
npm run build
```

## Storage Model

- Signed out: boards are stored in `localStorage` under `toporyx-local`
- Signed in: boards are stored in Firestore under `artifacts/{appId}/users/{uid}/boards/{boardId}`
- First cloud sign-in for an empty user space seeds cloud boards from existing local boards

The app now exposes a small status chip in the top-left HUD so you can tell whether you are in `Local` or `Cloud` mode and whether the latest save is `Saving`, `Saved`, or `Save failed`.

## Environment

Use `.env.example` as the reference for local or production configuration.

This repo no longer ships with a hardcoded Firebase project config. If the required `VITE_FIREBASE_*` variables are missing, the app falls back to local-only mode and disables cloud sync/auth gracefully.

Important variables:

- `VITE_TOPORYX_APP_ID`
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`
