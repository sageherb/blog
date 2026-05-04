import mdx from "@astrojs/mdx";
import preact from "@astrojs/preact";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import rehypeCopyButton from "./src/lib/rehype/copy-button.mjs";

export default defineConfig({
  site: "https://sageherb.dev",
  output: "static",
  integrations: [
    mdx(),
    preact(),
    // OG image endpoints are PNGs served from /og/* — exclude from sitemap.
    sitemap({ filter: (page) => !page.includes("/og/") }),
  ],
  markdown: {
    shikiConfig: {
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
    },
    rehypePlugins: [rehypeCopyButton],
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
