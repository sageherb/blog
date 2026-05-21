import type { Font } from "satori";

const PRETENDARD_BASE =
  "https://cdn.jsdelivr.net/npm/pretendard@1.3.9/dist/public/static";

const FONT_SPECS = [
  { weight: 400, file: "Pretendard-Regular.otf" },
  { weight: 500, file: "Pretendard-Medium.otf" },
  { weight: 700, file: "Pretendard-Bold.otf" },
] as const satisfies readonly { weight: Font["weight"]; file: string }[];

let fontCache: Promise<Font[]> | undefined;

export async function loadOgFonts(): Promise<Font[]> {
  fontCache ??= Promise.all(
    FONT_SPECS.map(async ({ weight, file }) => {
      const response = await fetch(`${PRETENDARD_BASE}/${file}`);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch ${file}: ${response.status} ${response.statusText}`,
        );
      }
      const data = await response.arrayBuffer();
      return { name: "Pretendard", data, weight, style: "normal" };
    }),
  );
  return fontCache;
}
