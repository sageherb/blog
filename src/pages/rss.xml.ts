import type { APIContext } from "astro";
import rss from "@astrojs/rss";
import { SITE_DESCRIPTION, SITE_TITLE } from "@config";
import { getBlogPosts } from "@utils/content";
import { blogPath } from "@utils/routes";

export const GET = async (context: APIContext) => {
  if (!context.site) {
    throw new Error("RSS feed requires `site` in astro.config.mjs");
  }
  const posts = await getBlogPosts();
  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: blogPath(post.id),
    })),
  });
};
