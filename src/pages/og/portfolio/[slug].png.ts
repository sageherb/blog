import type { APIRoute, GetStaticPaths } from "astro";
import { createOgImageResponse } from "@utils/og/render";
import { getPortfolioPosts } from "@utils/content";

export const getStaticPaths = (async () => {
  const entries = await getPortfolioPosts();

  return entries.map((entry) => ({
    params: { slug: entry.id },
    props: {
      title: entry.data.title,
    },
  }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) =>
  createOgImageResponse({
    title: typeof props.title === "string" ? props.title : "",
  });
