import { AUTHOR, SITE_DESCRIPTION, SITE_TITLE, SOCIAL_LINKS } from "@config";
import { siteUrl } from "@utils/url";

export type JsonLdObject = Record<string, unknown>;
export type JsonLdInput = JsonLdObject | JsonLdObject[];

function absolute(pathOrUrl: string): string {
  return siteUrl(pathOrUrl).toString();
}

// potentialAction에 SearchAction을 의도적으로 누락 — 검색은 클라이언트 모달(Pagefind)이라
// 엔드포인트 URL이 없어 검색 결과에 노출되면 깨진 경로가 된다.
export function buildWebSiteJsonLd(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: absolute("/"),
    inLanguage: "ko-KR",
  };
}

export function buildPersonJsonLd(): JsonLdObject {
  const sameAs: string[] = [];
  if (SOCIAL_LINKS.github) sameAs.push(SOCIAL_LINKS.github);
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: AUTHOR,
    url: absolute("/"),
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };
}

interface BlogPostingInput {
  title: string;
  description: string;
  pubDate: Date;
  tags: string[];
  canonicalPath: string;
  ogImagePath?: string;
}

export function buildBlogPostingJsonLd(input: BlogPostingInput): JsonLdObject {
  const canonicalUrl = absolute(input.canonicalPath);
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: input.title,
    description: input.description,
    datePublished: input.pubDate.toISOString(),
    inLanguage: "ko-KR",
    author: { "@type": "Person", name: AUTHOR, url: absolute("/") },
    ...(input.tags.length > 0 ? { keywords: input.tags.join(", ") } : {}),
    ...(input.ogImagePath != null && input.ogImagePath !== ""
      ? { image: absolute(input.ogImagePath) }
      : {}),
    mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
  };
}

export function escapeJsonForHtml(json: string): string {
  return json
    .replaceAll("<", "\\u003c")
    .replaceAll(">", "\\u003e")
    .replaceAll("&", "\\u0026");
}
