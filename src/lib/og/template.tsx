/** @jsxImportSource preact */
import { OG_SIZE, OG_THEME, getTitleFontSize } from "./theme";

interface OgTemplateProps {
  title: string;
  /** Pre-formatted date string (e.g. "2026년 5월 4일"). Optional. */
  date?: string;
  /** Tag list. Capped at 4 to avoid overflowing the bottom row. */
  tags?: string[];
}

/**
 * Minimum-typography OG template (1200x630).
 *
 *   ┌─────────────────────────────────────────────┐
 *   │ sageherb.dev                                │
 *   │                                             │
 *   │   <Title>                                   │
 *   │   ────                                      │
 *   │                                             │
 *   │ 2026년 5월 4일              #astro #blog    │
 *   └─────────────────────────────────────────────┘
 *
 * Satori requires `display: flex` on every element with children, so
 * the styles look more verbose than they would in regular CSS.
 */
export function OgTemplate({ title, date, tags = [] }: OgTemplateProps) {
  const visibleTags = tags.slice(0, 4);

  return (
    <div
      style={{
        width: OG_SIZE.width,
        height: OG_SIZE.height,
        display: "flex",
        flexDirection: "column",
        backgroundColor: OG_THEME.background,
        color: OG_THEME.text,
        padding: "60px 80px",
        fontFamily: "Pretendard",
      }}
    >
      {/* Top: wordmark */}
      <div
        style={{
          display: "flex",
          fontSize: 24,
          fontWeight: 400,
          letterSpacing: "-0.01em",
        }}
      >
        sageherb.dev
      </div>

      {/* Center: title + accent line */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: getTitleFontSize(title),
            fontWeight: 700,
            lineHeight: 1.2,
            letterSpacing: "-0.04em",
            wordBreak: "keep-all",
          }}
        >
          {title}
        </div>
        <div
          style={{
            marginTop: 32,
            width: 80,
            height: 4,
            backgroundColor: OG_THEME.accent,
          }}
        />
      </div>

      {/* Bottom: date | tags */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 18,
          color: OG_THEME.textMuted,
        }}
      >
        <div style={{ display: "flex" }}>{date ?? ""}</div>
        <div style={{ display: "flex", gap: 16 }}>
          {visibleTags.map((tag) => (
            <span style={{ display: "flex" }}>#{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
