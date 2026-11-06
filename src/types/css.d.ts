// Type declarations for CSS imports on web, so `npx tsc --noEmit` passes on a fresh
// clone (before `expo start` has generated expo-env.d.ts).
declare module "*.module.css" {
  const classes: Record<string, string>;
  export default classes;
}

declare module "*.css";
