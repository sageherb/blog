import type { Page } from "astro";
import { POSTS_PER_PAGE } from "@config";

export function buildBlogFirstPage<T>(items: T[]): Page<T> {
  const total = items.length;
  const lastPage = Math.max(1, Math.ceil(total / POSTS_PER_PAGE));
  return {
    data: items.slice(0, POSTS_PER_PAGE),
    start: 0,
    end: Math.min(POSTS_PER_PAGE, total) - 1,
    total,
    currentPage: 1,
    lastPage,
    size: POSTS_PER_PAGE,
    url: {
      current: "/blog",
      prev: undefined,
      next: lastPage > 1 ? "/blog/2" : undefined,
      first: undefined,
      last: lastPage > 1 ? `/blog/${lastPage}` : undefined,
    },
  };
}
