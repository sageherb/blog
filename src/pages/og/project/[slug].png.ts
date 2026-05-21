import type { APIRoute, GetStaticPaths } from "astro";
import { getProjectPosts } from "@utils/content";
import { createOgImageResponse } from "@utils/og/render";

interface Props {
  title: string;
  description: string;
}

export const getStaticPaths = (async () => {
  const entries = await getProjectPosts();
  return entries.map((entry) => ({
    params: { slug: entry.id },
    props: {
      title: entry.data.title,
      description: entry.data.description,
    } satisfies Props,
  }));
}) satisfies GetStaticPaths;

export const GET = (async ({ props }) =>
  createOgImageResponse(props)) satisfies APIRoute<Props>;
