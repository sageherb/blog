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

/**
 * Render an OG card to a PNG ArrayBuffer.
 *
 * Pipeline: JSX → satori (SVG) → resvg (PNG).
 * `OgTemplate` is invoked as a function rather than via JSX so this file
 * can stay `.ts` (no JSX runtime needed here).
 *
 * Returning an `ArrayBuffer` (rather than the `Buffer`/`Uint8Array<ArrayBufferLike>`
 * that resvg yields) keeps `Response` typing clean across runtimes.
 */
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
  return buf.buffer.slice(
    buf.byteOffset,
    buf.byteOffset + buf.byteLength,
  ) as ArrayBuffer;
}

/** Convenience wrapper that returns a cached PNG `Response`. */
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
