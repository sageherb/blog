import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
// This project intentionally runs these tests with Node's built-in test runner.
// eslint-disable-next-line test/no-import-node-test
import test from "node:test";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("../../", import.meta.url));
const distRoot = join(projectRoot, "dist");

function walk(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

function getPretendardWoff2Sources(css: string): string[] {
  const fontFaceBlocks = css.match(/@font-face\s*\{[^}]*\}/gi) ?? [];

  return fontFaceBlocks
    .filter((block) => /font-family:\s*["']?Pretendard Variable/i.test(block))
    .flatMap((block) =>
      [
        ...block.matchAll(
          /url\(\s*["']?([^"')]+\.woff2(?:[?#][^"')]+)?)["']?\s*\)/gi,
        ),
      ].map((match) => match[1]),
    );
}

function resolveOutputAsset(cssFile: string, source: string): string {
  const assetPath = source.split(/[?#]/, 1)[0];

  return source.startsWith("/")
    ? join(distRoot, assetPath.replace(/^\/+/, ""))
    : join(dirname(cssFile), assetPath);
}

void test("production serves Pretendard dynamic subsets from the site origin", () => {
  const html = readFileSync(join(distRoot, "blog", "index.html"), "utf8");
  const files = walk(distRoot);
  const cssFiles = files.filter((file) => file.endsWith(".css"));
  const cssByFile = new Map(
    cssFiles.map((file) => [file, readFileSync(file, "utf8")]),
  );
  const css = [...cssByFile.values()].join("\n");
  const pretendardSources = [...cssByFile].flatMap(([file, contents]) =>
    getPretendardWoff2Sources(contents).map((source) => ({ file, source })),
  );
  const uniqueSources = new Set(pretendardSources.map(({ source }) => source));

  assert.doesNotMatch(html, /cdn\.jsdelivr\.net.*pretendard/i);
  assert.doesNotMatch(css, /cdn\.jsdelivr\.net.*pretendard/i);
  assert.match(css, /font-family:\s*["']?Pretendard Variable/i);
  assert.match(css, /unicode-range:/i);
  assert.ok(
    uniqueSources.size > 1,
    "expected multiple emitted Pretendard subset sources",
  );

  for (const { file, source } of pretendardSources) {
    assert.doesNotMatch(
      source,
      /^(?:https?:)?\/\//i,
      "expected Pretendard source to be served from the site origin",
    );
    assert.doesNotMatch(
      source,
      /^data:/i,
      "expected Pretendard source to be an emitted WOFF2 file",
    );
    assert.ok(
      existsSync(resolveOutputAsset(file, source)),
      `expected emitted Pretendard subset file for ${source}`,
    );
  }
});
