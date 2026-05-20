import { SITE_URL } from "@config";

const SITE = new URL(SITE_URL);

export function siteUrl(path: string): URL {
  return /^https?:\/\//i.test(path) ? new URL(path) : new URL(path, SITE);
}
