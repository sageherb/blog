/** OG image dimensions — fixed by the Open Graph spec. */
export const OG_SIZE = { width: 1200, height: 630 } as const;

/**
 * Sage botanical palette flattened to a small set of hex values.
 * Light scheme regardless of viewer theme: PNGs do not respond to
 * `prefers-color-scheme` and need maximum contrast for SNS thumbnails.
 */
export const OG_THEME = {
  background: "#f8f7f4", // Sand
  text: "#2c2c2a", // Bark
  textMuted: "#9aaa90", // Mist
  accent: "#8ebbaf", // Sage
} as const;

/** Title font size scaled by character count to fit within the canvas. */
export function getTitleFontSize(title: string): number {
  if (title.length <= 18) return 72;
  if (title.length <= 32) return 60;
  if (title.length <= 48) return 48;
  return 40;
}
