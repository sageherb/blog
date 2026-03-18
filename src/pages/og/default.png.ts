import type { APIRoute } from "astro";
import { SITE_TITLE } from "@config";
import { createOgImageResponse } from "@utils/og/render";

export const GET: APIRoute = async () =>
  createOgImageResponse({
    title: SITE_TITLE,
  });
