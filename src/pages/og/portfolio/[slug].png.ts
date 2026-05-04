import type { APIRoute, GetStaticPaths } from "astro";
import { createOgImageResponse } from "@lib/og/render";
import { getPortfolioPosts } from "@utils/content";
import { formatDate } from "@utils/date";

interface Props {
  title: string;
  date: string;
}

export const getStaticPaths = (async () => {
  const entries = await getPortfolioPosts();
  return entries.map((entry) => ({
    params: { slug: entry.id },
    props: {
      title: entry.data.title,
      date: formatDate(entry.data.startDate ?? entry.data.pubDate),
    } satisfies Props,
  }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) => {
  const { title, date } = props as Props;
  return createOgImageResponse({ title, date });
};
