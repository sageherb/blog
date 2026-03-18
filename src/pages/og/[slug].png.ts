import type { APIRoute, GetStaticPaths } from "astro";
import { createOgImageResponse } from "@utils/og/render";
import { getBlogPosts } from "@utils/content";

export const getStaticPaths = (async () => {
  const posts = await getBlogPosts();

  return posts.map((post) => ({
    params: { slug: post.id },
    props: {
      title: post.data.title,
    },
  }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) =>
  createOgImageResponse({
    title: typeof props.title === "string" ? props.title : "",
  });
