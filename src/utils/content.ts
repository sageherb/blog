import type { CollectionEntry } from "astro:content";
import { getCollection } from "astro:content";

export type BlogPost = CollectionEntry<"blog">;
export type ProjectEntry = CollectionEntry<"project">;

export async function getBlogPosts(): Promise<BlogPost[]> {
  const posts = await getCollection("blog", ({ data }) => !data.draft);
  return posts.sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );
}

export async function getProjectPosts(): Promise<ProjectEntry[]> {
  const entries = await getCollection("project", ({ data }) => !data.draft);
  return entries.sort(
    (a, b) =>
      (b.data.startDate ?? b.data.pubDate).valueOf() -
      (a.data.startDate ?? a.data.pubDate).valueOf(),
  );
}

export async function getAllTags(): Promise<string[]> {
  const posts = await getBlogPosts();
  const tags = new Set(posts.flatMap((p) => p.data.tags));
  return [...tags];
}
