import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
// This project intentionally runs these tests with Node's built-in test runner.
// eslint-disable-next-line test/no-import-node-test
import test from "node:test";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("../../", import.meta.url));

interface HtmlTag {
  attributes: Map<string, string>;
  content?: string;
  name: "link" | "meta" | "title";
}

function readProjectFile(...segments: string[]): string {
  return readFileSync(join(projectRoot, ...segments), "utf8");
}

function parseSeoTags(html: string): HtmlTag[] {
  const tags: HtmlTag[] = [];
  const tagPattern =
    /<title\b([^>]*)>([\s\S]*?)<\/title\s*>|<(meta|link)\b([^>]*)>/gi;

  for (const match of html.matchAll(tagPattern)) {
    const name = (match[3] ?? "title").toLowerCase() as HtmlTag["name"];
    const attributeSource = match[1] ?? match[4] ?? "";
    const attributes = new Map<string, string>();
    const attributePattern =
      /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;

    for (const attribute of attributeSource.matchAll(attributePattern)) {
      attributes.set(
        attribute[1].toLowerCase(),
        attribute[2] ?? attribute[3] ?? attribute[4] ?? "",
      );
    }

    tags.push({ attributes, content: match[2], name });
  }

  return tags;
}

function assertExactlyOneTag(
  tags: HtmlTag[],
  name: HtmlTag["name"],
  selector: Record<string, string> = {},
  expected: { attributes?: Record<string, string>; content?: string } = {},
): void {
  const matches = tags.filter(
    (tag) =>
      tag.name === name &&
      Object.entries(selector).every(
        ([attribute, value]) => tag.attributes.get(attribute) === value,
      ),
  );

  assert.equal(
    matches.length,
    1,
    `expected exactly one <${name}> matching ${JSON.stringify(selector)}`,
  );

  const [tag] = matches;
  for (const [attribute, value] of Object.entries(expected.attributes ?? {})) {
    assert.equal(tag.attributes.get(attribute), value);
  }
  if (expected.content !== undefined) {
    assert.equal(tag.content, expected.content);
  }
}

void test("/blog uses the site title and site description", () => {
  const tags = parseSeoTags(readProjectFile("dist", "blog", "index.html"));

  assertExactlyOneTag(tags, "title", {}, { content: "SageHerb" });
  assertExactlyOneTag(
    tags,
    "meta",
    { name: "description" },
    { attributes: { content: "개발 기록 저장소" } },
  );
  assertExactlyOneTag(
    tags,
    "meta",
    { property: "og:title" },
    { attributes: { content: "SageHerb" } },
  );
  assertExactlyOneTag(
    tags,
    "meta",
    { property: "og:site_name" },
    { attributes: { content: "SageHerb" } },
  );
  assertExactlyOneTag(
    tags,
    "meta",
    { property: "og:description" },
    { attributes: { content: "개발 기록 저장소" } },
  );
  assertExactlyOneTag(
    tags,
    "meta",
    { property: "og:image:alt" },
    { attributes: { content: "SageHerb" } },
  );
  assertExactlyOneTag(
    tags,
    "link",
    { rel: "canonical" },
    { attributes: { href: "https://sageherb.dev/blog/" } },
  );
});

void test("a blog post keeps its page-title suffix", () => {
  const tags = parseSeoTags(
    readProjectFile(
      "dist",
      "blog",
      "building-my-blog-with-astro",
      "index.html",
    ),
  );

  assertExactlyOneTag(
    tags,
    "title",
    {},
    {
      content: "블로그 완성 | SageHerb",
    },
  );
  assertExactlyOneTag(
    tags,
    "meta",
    { property: "og:title" },
    { attributes: { content: "블로그 완성" } },
  );
});

void test("a representative secondary page keeps the site-title suffix", () => {
  const tags = parseSeoTags(readProjectFile("dist", "about", "index.html"));

  assertExactlyOneTag(tags, "title", {}, { content: "Sage | SageHerb" });
});

void test("the second blog page keeps the paginated title when generated", () => {
  const pagePath = join(projectRoot, "dist", "blog", "2", "index.html");
  if (!existsSync(pagePath)) return;

  assertExactlyOneTag(
    parseSeoTags(readFileSync(pagePath, "utf8")),
    "title",
    {},
    {
      content: "Blog | SageHerb",
    },
  );
});

void test("the root redirect contract remains permanent", () => {
  const config = JSON.parse(readProjectFile("vercel.json")) as {
    redirects: Array<{
      source: string;
      destination: string;
      permanent: boolean;
    }>;
  };

  assert.deepEqual(
    config.redirects.find(({ source }) => source === "/"),
    {
      source: "/",
      destination: "/blog",
      permanent: true,
    },
  );
});
