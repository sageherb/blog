import type { BlogPost } from "@utils/content";
import { getBlogPosts } from "@utils/content";

export function tagToSlug(tag: string): string {
  const slug = tag
    .normalize("NFC")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}-]/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || tag.normalize("NFC").trim().toLowerCase();
}

export interface TagGroup {
  slug: string;
  display: string;
  posts: BlogPost[];
}

export async function getTagGroups(): Promise<TagGroup[]> {
  const posts = await getBlogPosts();
  const groups = new Map<string, TagGroup>();
  for (const post of posts) {
    const seen = new Set<string>();
    for (const tag of post.data.tags) {
      const slug = tagToSlug(tag);
      if (seen.has(slug)) continue;
      seen.add(slug);
      const existing = groups.get(slug);
      if (existing) existing.posts.push(post);
      else groups.set(slug, { slug, display: tag, posts: [post] });
    }
  }
  return [...groups.values()];
}

export const tagPath = (tag: string) =>
  `/tags/${encodeURIComponent(tagToSlug(tag))}/`;
