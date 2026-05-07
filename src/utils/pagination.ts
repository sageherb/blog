import type { Page } from "astro";
import { POSTS_PER_PAGE } from "@config";

/**
 * Build a Page<T> for blog page 1.
 *
 * Used by `/` and `/blog` (both render the first page of blog posts).
 * `url.current` is hardcoded to "/blog" so the shared Pagination component
 * generates correct `/blog/2+` links from either entry point.
 */
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
