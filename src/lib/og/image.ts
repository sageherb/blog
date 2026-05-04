interface ResolveOgImageOptions {
  /** Explicit OG override (e.g. an absolute URL or a coverImage.src path). */
  overrideUrl?: string;
  /** Auto-generated OG endpoint (e.g. "/og/<slug>.png"). */
  autoUrl?: string;
}

/**
 * Pick the OG image URL to advertise in `<meta og:image>`.
 *
 * Returns a path or absolute URL — `BaseHead.astro` is responsible for
 * resolving against `Astro.site` if the value is path-relative.
 */
export function resolveOgImageUrl({
  overrideUrl,
  autoUrl,
}: ResolveOgImageOptions): string | undefined {
  return overrideUrl ?? autoUrl;
}
