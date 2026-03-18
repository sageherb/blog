/** @jsxImportSource preact */
import { Resvg } from "@resvg/resvg-js";
import satori from "satori";
import { OgTemplate } from "@utils/og/template";
import { loadOgFonts } from "@utils/og/fonts";
import { OG_IMAGE_SIZE } from "@utils/og/theme";

interface RenderOgImageOptions {
  title: string;
}

export const renderOgImage = async ({ title }: RenderOgImageOptions) => {
  const fonts = await loadOgFonts();

  const svg = await satori(<OgTemplate title={title} />, {
    width: OG_IMAGE_SIZE.width,
    height: OG_IMAGE_SIZE.height,
    fonts,
  });

  const resvg = new Resvg(svg, {
    fitTo: {
      mode: "width",
      value: OG_IMAGE_SIZE.width,
    },
  });

  const png = resvg.render().asPng();

  return new Uint8Array(png);
};

export const createOgImageResponse = async (
  options: RenderOgImageOptions,
): Promise<Response> => {
  const png = await renderOgImage(options);

  return new Response(png, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};
