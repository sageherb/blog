/** @jsxImportSource preact */
import { OG_IMAGE_SIZE, OG_THEME, getOgTitleFontSize } from "@utils/og/theme";

interface OgTemplateProps {
  title: string;
}

const topBarButtonStyle = {
  width: 14,
  height: 14,
  borderRadius: "999px",
  backgroundColor: "#ffffff",
  border: `1px solid ${OG_THEME.buttonBorder}`,
};

export const OgTemplate = ({ title }: OgTemplateProps) => {
  const titleFontSize = getOgTitleFontSize(title);

  return (
    <div
      style={{
        width: OG_IMAGE_SIZE.width,
        height: OG_IMAGE_SIZE.height,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: OG_THEME.background,
        color: OG_THEME.text,
        padding: 40,
        fontFamily: "Pretendard",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          backgroundColor: OG_THEME.frameBackground,
          borderRadius: 28,
          border: `1px solid ${OG_THEME.frameBorder}`,
          boxShadow: "0 24px 80px rgba(17, 24, 39, 0.08)",
        }}
      >
        <div
          style={{
            height: 58,
            display: "flex",
            alignItems: "center",
            padding: "0 22px",
            backgroundColor: OG_THEME.accent,
            borderBottom: `1px solid ${OG_THEME.frameBorder}`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div style={topBarButtonStyle} />
            <div style={topBarButtonStyle} />
            <div style={topBarButtonStyle} />
          </div>
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "64px 96px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              fontSize: titleFontSize,
              lineHeight: 1.25,
              fontWeight: 700,
              letterSpacing: "-0.04em",
              wordBreak: "keep-all",
            }}
          >
            {title}
          </div>
        </div>
      </div>
    </div>
  );
};
