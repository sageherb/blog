import { AUTHOR, SOCIAL_LINKS } from "@config";
import { siteUrl } from "@utils/url";

export type JsonLdObject = Record<string, unknown>;
export type JsonLdInput = JsonLdObject | JsonLdObject[];

const OG_IMAGE_WIDTH = 1200;
const OG_IMAGE_HEIGHT = 630;

interface BreadcrumbItem {
  name: string;
  path: string;
}

function absolute(pathOrUrl: string): string {
  return siteUrl(pathOrUrl).toString();
}

function personNode(): JsonLdObject {
  const sameAs: string[] = [];
  if (SOCIAL_LINKS.github) sameAs.push(SOCIAL_LINKS.github);
  return {
    "@type": "Person",
    name: AUTHOR,
    url: absolute("/"),
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };
}

function imageObject(pathOrUrl: string): JsonLdObject {
  return {
    "@type": "ImageObject",
    url: absolute(pathOrUrl),
    width: OG_IMAGE_WIDTH,
    height: OG_IMAGE_HEIGHT,
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

function buildBlogPostingJsonLd(input: BlogPostingInput): JsonLdObject {
  const canonicalUrl = absolute(input.canonicalPath);
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: input.title,
    description: input.description,
    datePublished: input.pubDate.toISOString(),
    inLanguage: "ko-KR",
    author: personNode(),
    publisher: personNode(),
    ...(input.tags.length > 0 ? { keywords: input.tags.join(", ") } : {}),
    ...(input.ogImagePath != null && input.ogImagePath !== ""
      ? { image: imageObject(input.ogImagePath) }
      : {}),
    mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
  };
}

function buildBreadcrumbJsonLd(items: BreadcrumbItem[]): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absolute(item.path),
    })),
  };
}

export function buildPostPageJsonLd(input: BlogPostingInput): JsonLdObject[] {
  return [
    buildBlogPostingJsonLd(input),
    buildBreadcrumbJsonLd([
      { name: "Blog", path: "/blog/" },
      { name: input.title, path: input.canonicalPath },
    ]),
  ];
}

export function escapeJsonForHtml(json: string): string {
  return json
    .replaceAll("<", "\\u003c")
    .replaceAll(">", "\\u003e")
    .replaceAll("&", "\\u0026");
}
