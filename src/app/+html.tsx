import { ScrollViewStyleReset } from "expo-router/html";
import { type PropsWithChildren } from "react";
import { themeCss } from "@/constants/theme";

// Runs before the app bundle: reads the saved appearance (AsyncStorage on web is
// localStorage, values JSON-free) and sets data-theme so there's no flash.
const applySavedAppearance = `
(function () {
  try {
    var pref = localStorage.getItem("@honour-your-mentor/appearance") || "dark";
    var scheme = pref === "system"
      ? (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark")
      : pref;
    document.documentElement.setAttribute("data-theme", scheme === "light" ? "light" : "dark");
    var lang = localStorage.getItem("@honour-your-mentor/language");
    if (lang === "hi") document.documentElement.setAttribute("lang", "hi");
  } catch (e) {
    document.documentElement.setAttribute("data-theme", "dark");
  }
})();
`;

/**
 * Root HTML configuration for Honour Your Mentor on Web.
 * Enables font-display: swap, viewport optimization, and preconnect for super fast loading.
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              /* Prevent layout shifts and enable non-blocking font swapping */
              @font-face {
                font-family: 'Ionicons';
                font-display: swap;
              }
              @font-face {
                font-family: 'Caveat';
                font-display: swap;
              }
              html, body {
                margin: 0;
                padding: 0;
                height: 100%;
                overflow-x: hidden;
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
              }
              #root {
                display: flex;
                flex-direction: column;
                height: 100%;
                min-height: 100vh;
              }
            `,
          }}
        />
        {/* Appearance tokens (Dark / Light) + apply the saved choice before first paint. */}
        <style id="hym-theme-tokens" dangerouslySetInnerHTML={{ __html: themeCss() }} />
        <meta name="theme-color" content="#000000" />
        <script dangerouslySetInnerHTML={{ __html: applySavedAppearance }} />
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}

