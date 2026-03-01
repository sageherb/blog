import { getCollection, type CollectionEntry } from "astro:content";

export type BlogPost = CollectionEntry<"blog">;
export type PortfolioEntry = CollectionEntry<"portfolio">;

/** Returns all published blog posts, sorted newest first. */
export async function getBlogPosts(): Promise<BlogPost[]> {
  const posts = await getCollection("blog", ({ data }) => !data.draft);
  return posts.sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );
}

/** Returns all published portfolio entries, sorted newest first. */
export async function getPortfolioPosts(): Promise<PortfolioEntry[]> {
  const entries = await getCollection("portfolio", ({ data }) => !data.draft);
  return entries.sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );
}

/** Returns sorted unique tags collected from all published blog posts. */
export async function getAllTags(): Promise<string[]> {
  const posts = await getBlogPosts();
  const tags = new Set(posts.flatMap((p) => p.data.tags));
  return [...tags].sort();
}

/** Returns all published blog posts that include the given tag. */
export async function getPostsByTag(tag: string): Promise<BlogPost[]> {
  const posts = await getBlogPosts();
  return posts.filter((p) => p.data.tags.includes(tag));
}
