# Honour Your Mentor — App

The Expo / React Native app (web, iOS, Android) for Honour Your Mentor: tributes,
letters, photos, videos and voice notes, shared with the people who follow you.

## Run

```bash
npm install
npx expo start --web --port 8081
```

## Backend

The app talks to the Honour Your Mentor API (Spring Boot):

- On `localhost`, it uses `http://localhost:8080/api/v1`.
- On the live site, it uses the same origin: `https://onodem.com/api/v1`.
- To point it somewhere else, set `EXPO_PUBLIC_API_URL`, e.g. in a `.env` file:

  ```
  EXPO_PUBLIC_API_URL=https://your-api.example.com/api/v1
  ```

## Checks

```bash
npx tsc --noEmit
npx expo lint
```

## Build for web

```bash
npm run build:web
```
