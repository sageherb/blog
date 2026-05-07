import antfu from "@antfu/eslint-config";

export default antfu({
  typescript: {
    tsconfigPath: "tsconfig.json",
  },
  astro: true,
  react: false,
  jsonc: true,
  yaml: true,
  markdown: true,
  stylistic: false,
  ignores: [
    "dist/**",
    ".astro/**",
    "public/pagefind/**",
    ".omc/**",
    ".agents/**",
    ".codex/**",
    ".claude/**",
    "pnpm-lock.yaml",
    "**/*.md/**",
  ],
});
