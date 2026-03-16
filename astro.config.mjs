import mdx from "@astrojs/mdx";
import preact from "@astrojs/preact";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, fontProviders } from "astro/config";

export default defineConfig({
  site: "https://sageherb.dev",
  output: "static",
  integrations: [mdx(), preact(), sitemap()],
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: "Pretendard Variable",
      cssVariable: "--font-pretendard",
      weights: ["100 900"],
      styles: ["normal"],
      subsets: ["latin", "korean"],
      fallbacks: ["system-ui", "sans-serif"],
    },
  ],
  markdown: {
    shikiConfig: {
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
