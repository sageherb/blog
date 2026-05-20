/** @jsxImportSource preact */
import { getTitleFontSize, OG_SIZE, OG_THEME } from "./theme";

interface OgTemplateProps {
  title: string;
  date?: string;
  tags?: string[];
}

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
          {visibleTags.map((tag, i) => (
            <span key={`${tag}:${i}`} style={{ display: "flex" }}>
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
