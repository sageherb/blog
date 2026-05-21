import type { APIRoute } from "astro";
import { SITE_DESCRIPTION, SITE_TITLE } from "@config";
import { createOgImageResponse } from "@utils/og/render";

export const GET: APIRoute = async () =>
  createOgImageResponse({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    variant: "default",
  });
