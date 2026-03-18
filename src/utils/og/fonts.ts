import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { Font } from "satori";

const toArrayBuffer = (buffer: Buffer): ArrayBuffer => {
  const bytes = new Uint8Array(buffer);
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
};

const fontFiles = {
  regular: resolve(process.cwd(), "src/assets/fonts/Pretendard-Regular.otf"),
  bold: resolve(process.cwd(), "src/assets/fonts/Pretendard-Bold.otf"),
} as const;

type OgFont = Font & {
  weight: 400 | 700;
  style: "normal";
};

let fontCache: Promise<OgFont[]> | undefined;

export const loadOgFonts = (): Promise<OgFont[]> => {
  if (!fontCache) {
    fontCache = Promise.all([
      readFile(fontFiles.regular),
      readFile(fontFiles.bold),
    ]).then(([regular, bold]) => [
      {
        name: "Pretendard",
        data: toArrayBuffer(regular),
        weight: 400 as const,
        style: "normal" as const,
      },
      {
        name: "Pretendard",
        data: toArrayBuffer(bold),
        weight: 700 as const,
        style: "normal" as const,
      },
    ]);
  }

  return fontCache;
};
