import localFont from "next/font/local";

// Self-hosted (not fetched from Google Fonts at request time) — see
// specs/app/app-design.md §8. Same files already vetted for the design
// prototype (specs/prototype/assets/fonts/).
export const displayFont = localFont({
  src: "./fonts/baloo2-700.woff2",
  weight: "700",
  variable: "--font-display",
  display: "swap",
});

export const bodyFont = localFont({
  src: "./fonts/nunito-variable.woff2",
  weight: "200 1000",
  variable: "--font-body",
  display: "swap",
});

export const dataFont = localFont({
  src: [
    { path: "./fonts/plexmono-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/plexmono-600.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-data",
  display: "swap",
});
