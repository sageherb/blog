export interface PageBlock {
  pages: number[];
  prevPage: number | null;
  nextPage: number | null;
}

export function getPageBlock(
  current: number,
  last: number,
  size: number,
): PageBlock {
  const block = Math.floor((current - 1) / size);
  const start = block * size + 1;
  const end = Math.min(start + size - 1, last);
  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);
  return {
    pages,
    prevPage: start > 1 ? start - 1 : null,
    nextPage: end < last ? end + 1 : null,
  };
}

export function buildPageHref(base: string, n: number): string {
  const root = base.replace(/\/$/, "");
  return n === 1 ? root || "/" : `${root}/${n}`;
}
