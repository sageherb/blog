import {
  AUTHOR,
  SITE_DESCRIPTION,
  SITE_TITLE,
  SITE_URL,
  SOCIAL_LINKS,
} from "@config";

export type JsonLdObject = Record<string, unknown>;
export type JsonLdInput = JsonLdObject | JsonLdObject[];

const SITE = new URL(SITE_URL);

/** Resolve a root-relative path against `SITE_URL`. Absolute URLs pass through. */
function absolute(pathOrUrl: string): string {
  return /^https?:\/\//i.test(pathOrUrl)
    ? pathOrUrl
    : new URL(pathOrUrl, SITE).toString();
}

/**
 * `WebSite` schema for the homepage.
 *
 * Intentionally omits `potentialAction: SearchAction` — search is a
 * client-side modal (Pagefind), not a URL endpoint, so a SearchAction
 * would point at a route that doesn't exist.
 */
export function buildWebSiteJsonLd(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE.toString(),
    inLanguage: "ko-KR",
  };
}

/** `Person` schema for the site author. Used wherever authorship is asserted. */
export function buildPersonJsonLd(): JsonLdObject {
  const sameAs: string[] = [];
  if (SOCIAL_LINKS.github) sameAs.push(SOCIAL_LINKS.github);
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: AUTHOR,
    url: SITE.toString(),
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };
}

interface BlogPostingInput {
  title: string;
  description: string;
  pubDate: Date;
  tags: string[];
  /** Page path (e.g. "/blog/my-post/") or absolute URL. */
  canonicalPath: string;
  /** OG image path or absolute URL. Optional. */
  ogImagePath?: string;
}

/** `BlogPosting` schema for blog detail pages. */
export function buildBlogPostingJsonLd(input: BlogPostingInput): JsonLdObject {
  const canonicalUrl = absolute(input.canonicalPath);
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: input.title,
    description: input.description,
    datePublished: input.pubDate.toISOString(),
    inLanguage: "ko-KR",
    author: { "@type": "Person", name: AUTHOR, url: SITE.toString() },
    ...(input.tags.length > 0 ? { keywords: input.tags.join(", ") } : {}),
    ...(input.ogImagePath != null && input.ogImagePath !== ""
      ? { image: absolute(input.ogImagePath) }
      : {}),
    mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
  };
}

/** Escape HTML-sensitive characters in a JSON string for safe `<script>` embedding. */
export function escapeJsonForHtml(json: string): string {
  return json
    .replaceAll("<", "\\u003c")
    .replaceAll(">", "\\u003e")
    .replaceAll("&", "\\u0026");
}
