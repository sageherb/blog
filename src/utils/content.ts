import { getCollection, type CollectionEntry } from "astro:content";

export type BlogPost = CollectionEntry<"blog">;
export type PortfolioEntry = CollectionEntry<"portfolio">;
export type TaggedEntry = BlogPost | PortfolioEntry;

export async function getBlogPosts(): Promise<BlogPost[]> {
  const posts = await getCollection("blog", ({ data }) => !data.draft);
  return posts.sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );
}

export async function getPortfolioPosts(): Promise<PortfolioEntry[]> {
  const entries = await getCollection("portfolio", ({ data }) => !data.draft);
  return entries.sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );
}

export async function getAllTaggedEntries(): Promise<TaggedEntry[]> {
  const [blogs, portfolios] = await Promise.all([
    getBlogPosts(),
    getPortfolioPosts(),
  ]);
  return [...blogs, ...portfolios].sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );
}

export async function getAllTags(): Promise<string[]> {
  const entries = await getAllTaggedEntries();
  const tags = new Set(entries.flatMap((e) => e.data.tags));
  return [...tags].sort();
}

export function getEntryUrl(entry: TaggedEntry): string {
  return entry.collection === "blog"
    ? `/blog/${entry.id}`
    : `/portfolio/${entry.id}`;
}
