import type { APIRoute, GetStaticPaths } from "astro";
import { createOgImageResponse } from "@lib/og/render";
import { getBlogPosts } from "@utils/content";
import { formatDate } from "@utils/date";

interface Props {
  title: string;
  date: string;
  tags: string[];
}

export const getStaticPaths = (async () => {
  const posts = await getBlogPosts();
  return posts.map((post) => ({
    params: { slug: post.id },
    props: {
      title: post.data.title,
      date: formatDate(post.data.pubDate),
      tags: post.data.tags,
    } satisfies Props,
  }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) => {
  const { title, date, tags } = props as Props;
  return createOgImageResponse({ title, date, tags });
};
