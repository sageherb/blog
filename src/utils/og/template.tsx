/** @jsxImportSource preact */
import { OG_COLORS, OG_PADDING, OG_SIZE } from "@utils/og/theme";

type OgVariant = "post" | "default";

interface OgTemplateProps {
  title: string;
  description: string;
  variant?: OgVariant;
}

export function OgTemplate({
  title,
  description,
  variant = "post",
}: OgTemplateProps) {
  const titleColor =
    variant === "default" ? OG_COLORS.titleBrand : OG_COLORS.titlePost;

  return (
    <div
      style={{
        width: OG_SIZE.width,
        height: OG_SIZE.height,
        padding: OG_PADDING,
        display: "flex",
        flexDirection: "column",
        backgroundColor: OG_COLORS.background,
        fontFamily: "Pretendard",
      }}
    >
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
            fontSize: 70,
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: "-0.02em",
            color: titleColor,
            wordBreak: "keep-all",
          }}
        >
          {title}
        </div>
        <div
          style={{
            marginTop: 30,
            fontSize: 40,
            fontWeight: 400,
            lineHeight: 1.3,
            color: OG_COLORS.body,
            wordBreak: "keep-all",
          }}
        >
          {description}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          color: OG_COLORS.logo,
        }}
      >
        <SageLogo size={44} />
        <span
          style={{
            fontSize: 36,
            fontWeight: 500,
            color: OG_COLORS.body,
            letterSpacing: "-0.01em",
          }}
        >
          sageherb.dev
        </span>
      </div>
    </div>
  );
}

function SageLogo({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="2.05 2.25 19.4 19.4"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g
        transform="translate(-0.25 0)"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="0.95"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 14.95C8.95 12.55 8.72 7.45 12 2.65C15.28 7.45 15.05 12.55 12 14.95Z" />
        <path d="M9.78 17.62C6.02 17.68 3.18 15.1 2.72 11.38C6.42 11.08 9.48 13.22 9.78 17.62Z" />
        <path d="M14.22 17.62C17.98 17.68 20.82 15.1 21.28 11.38C17.58 11.08 14.52 13.22 14.22 17.62Z" />
      </g>
      <path
        d="M11.75 21.2V15.28"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
