import mdx from "@astrojs/mdx";
import preact from "@astrojs/preact";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import astroExpressiveCode from "astro-expressive-code";
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://sageherb.dev",
  output: "static",
  integrations: [
    astroExpressiveCode({
      themes: ["github-light", "github-dark"],
      useDarkModeMediaQuery: false,
      themeCssSelector: (theme) =>
        theme.name === "github-dark" ? ".dark" : false,
      styleOverrides: {
        frames: {
          shadowColor: "transparent",
        },
      },
    }),
    mdx(),
    preact(),
    sitemap({ filter: (page) => !page.includes("/og/") }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
