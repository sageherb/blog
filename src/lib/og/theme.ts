export const OG_SIZE = { width: 1200, height: 630 } as const;

// PNG는 prefers-color-scheme에 반응하지 않으므로 뷰어 테마와 무관하게 light scheme 고정.
// SNS 썸네일의 가독성을 위한 선택.
export const OG_THEME = {
  background: "#f8f7f4",
  text: "#2c2c2a",
  textMuted: "#9aaa90",
  accent: "#8ebbaf",
} as const;

export function getTitleFontSize(title: string): number {
  if (title.length <= 18) return 72;
  if (title.length <= 32) return 60;
  if (title.length <= 48) return 48;
  return 40;
}
