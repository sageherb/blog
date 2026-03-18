export const OG_IMAGE_SIZE = {
  width: 1200,
  height: 630,
} as const;

export const OG_THEME = {
  background: "#f4f4f5",
  frameBackground: "#ffffff",
  frameBorder: "#d4d4d8",
  topBarBackground: "#f4f4f5",
  text: "#18181b",
  accent: "#476e64",
  buttonBorder: "rgba(71, 110, 100, 0.18)",
} as const;

export const getOgTitleFontSize = (title: string) => {
  if (title.length <= 18) return 68;
  if (title.length <= 32) return 56;
  if (title.length <= 48) return 46;
  return 40;
};
