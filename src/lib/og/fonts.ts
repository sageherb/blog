import type { Font } from "satori";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import process from "node:process";

const FONT_PATHS = {
  regular: resolve(process.cwd(), "src/assets/fonts/Pretendard-Regular.otf"),
  bold: resolve(process.cwd(), "src/assets/fonts/Pretendard-Bold.otf"),
} as const;

let fontCache: Promise<Font[]> | undefined;

// Satori는 WOFF2를 지원하지 않으므로 OG용 폰트는 OTF/TTF/WOFF 형식만 사용한다.
export async function loadOgFonts(): Promise<Font[]> {
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
