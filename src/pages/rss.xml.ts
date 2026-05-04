import rss from "@astrojs/rss";
import { SITE_DESCRIPTION, SITE_TITLE } from "@config";
import { getBlogPosts } from "@utils/content";
import type { APIContext } from "astro";

export const GET = async (context: APIContext) => {
  const posts = await getBlogPosts();
  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: context.site!,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: `/blog/${post.id}/`,
    })),
  });
};
