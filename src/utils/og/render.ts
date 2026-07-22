import type { Buffer } from "node:buffer";
import { Resvg } from "@resvg/resvg-js";
import { loadOgFonts } from "@utils/og/fonts";
import { OgTemplate } from "@utils/og/template";
import { OG_SIZE } from "@utils/og/theme";
import satori from "satori";

interface RenderOgOptions {
  title: string;
  description: string;
  variant?: "post" | "default";
}

export async function createOgImageResponse(
  options: RenderOgOptions,
): Promise<Response> {
  const fonts = await loadOgFonts();
  const svg = await satori(OgTemplate(options), {
    width: OG_SIZE.width,
    height: OG_SIZE.height,
    fonts,
  });
  const png = new Resvg(svg, {
    fitTo: { mode: "width", value: OG_SIZE.width },
  })
    .render()
    .asPng();

  return new Response(toArrayBuffer(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}

function toArrayBuffer(buf: Buffer): ArrayBuffer {
  return buf.buffer.slice(
    buf.byteOffset,
    buf.byteOffset + buf.byteLength,
  ) as ArrayBuffer;
}
