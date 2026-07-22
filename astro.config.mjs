import { satteri } from "@astrojs/markdown-satteri";
import mdx from "@astrojs/mdx";
import preact from "@astrojs/preact";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import expressiveCode from "astro-expressive-code";
import { defineConfig } from "astro/config";
import {
  codeCaptionsPlugin,
  directivesPlugin,
  imageCaptionsPlugin,
  koreanPostpositionStrongPlugin,
} from "./src/utils/markdown/index.ts";

export default defineConfig({
  site: "https://sageherb.dev",
  output: "static",
  markdown: {
    processor: satteri({
      features: { directive: true },
      mdastPlugins: [koreanPostpositionStrongPlugin(), directivesPlugin()],
      hastPlugins: [imageCaptionsPlugin()],
    }),
  },
  integrations: [
    expressiveCode({
      plugins: [codeCaptionsPlugin()],
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
