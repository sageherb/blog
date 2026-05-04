import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { Font } from "satori";

const FONT_PATHS = {
  regular: resolve(process.cwd(), "src/assets/fonts/Pretendard-Regular.otf"),
  bold: resolve(process.cwd(), "src/assets/fonts/Pretendard-Bold.otf"),
} as const;

let fontCache: Promise<Font[]> | undefined;

/**
 * Load Pretendard OTFs for satori. Cached for the lifetime of the build
 * process so each subsequent OG endpoint reuses the in-memory buffers.
 *
 * Satori does not support WOFF2, so OG fonts must stay in OTF/TTF/WOFF.
 */
export function loadOgFonts(): Promise<Font[]> {
  if (!fontCache) {
    fontCache = Promise.all([
      readFile(FONT_PATHS.regular),
      readFile(FONT_PATHS.bold),
    ]).then(([regular, bold]) => [
      { name: "Pretendard", data: regular, weight: 400, style: "normal" },
      { name: "Pretendard", data: bold, weight: 700, style: "normal" },
    ]);
  }
  return fontCache;
}
