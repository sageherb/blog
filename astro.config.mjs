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
      themes: ["catppuccin-latte", "catppuccin-frappe"],
      useDarkModeMediaQuery: false,
      themeCssSelector: (theme) =>
        theme.name === "catppuccin-frappe" ? ".dark" : false,
      styleOverrides: {
        borderWidth: "0",
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
