import type { APIRoute, GetStaticPaths } from "astro";
import { getBlogPosts } from "@utils/content";
import { createOgImageResponse } from "@utils/og/render";

interface Props {
  title: string;
  description: string;
}

export const getStaticPaths = (async () => {
  const posts = await getBlogPosts();
  return posts.map((post) => ({
    params: { slug: post.id },
    props: {
      title: post.data.title,
      description: post.data.description,
    } satisfies Props,
  }));
}) satisfies GetStaticPaths;

export const GET = (async ({ props }) =>
  createOgImageResponse(props)) satisfies APIRoute<Props>;
