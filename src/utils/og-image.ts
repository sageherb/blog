import type { ImageMetadata } from "astro";

interface SelectOgImageOptions {
  coverImage?: ImageMetadata;
  fallbackPath?: string;
}

export const selectOgImage = ({
  coverImage,
  fallbackPath,
}: SelectOgImageOptions) => coverImage?.src ?? fallbackPath;
