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
  const feedUrl = new URL("/rss.xml", context.site).toString();
  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: context.site,
    xmlns: { atom: "http://www.w3.org/2005/Atom" },
    customData: [
      `<language>ko</language>`,
      `<atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />`,
    ].join(""),
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: blogPath(post.id),
    })),
  });
};
