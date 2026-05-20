import { Resvg } from "@resvg/resvg-js";
import satori from "satori";
import { loadOgFonts } from "./fonts";
import { OgTemplate } from "./template";
import { OG_SIZE } from "./theme";

interface RenderOgOptions {
  title: string;
  date?: string;
  tags?: string[];
}

export async function renderOgImage(
  options: RenderOgOptions,
): Promise<ArrayBuffer> {
  const fonts = await loadOgFonts();
  const svg = await satori(OgTemplate(options), {
    width: OG_SIZE.width,
    height: OG_SIZE.height,
    fonts,
  });
  const buf = new Resvg(svg, {
    fitTo: { mode: "width", value: OG_SIZE.width },
  })
    .render()
    .asPng();
  // PNG 렌더러가 반환하는 Buffer/Uint8Array<ArrayBufferLike>를 그대로 쓰면
  // Response 타입이 런타임별로 어긋난다. slice로 ArrayBuffer를 잘라 호환성 확보.
  return buf.buffer.slice(
    buf.byteOffset,
    buf.byteOffset + buf.byteLength,
  ) as ArrayBuffer;
}

export async function createOgImageResponse(
  options: RenderOgOptions,
): Promise<Response> {
  const png = await renderOgImage(options);
  return new Response(png, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
