import type { Element, ElementContent } from "astro-expressive-code/hast";

import assert from "node:assert/strict";
// This project intentionally runs these tests with Node's built-in test runner.
// eslint-disable-next-line test/no-import-node-test
import test from "node:test";

import { createSatteriMarkdownProcessor } from "@astrojs/markdown-satteri";
import { ExpressiveCode } from "astro-expressive-code";
import { getClassNames } from "astro-expressive-code/hast";

import {
  codeCaptionsPlugin,
  koreanPostpositionStrongPlugin,
} from "../src/utils/markdown/index.ts";

const expressiveCode = new ExpressiveCode({
  shiki: false,
  textMarkers: false,
  logger: { error: () => undefined },
  plugins: [codeCaptionsPlugin()],
});
const plainExpressiveCode = new ExpressiveCode({
  shiki: false,
  textMarkers: false,
  logger: { error: () => undefined },
});

function isElement(node: ElementContent): node is Element {
  return node.type === "element";
}

function hasClass(node: Element, className: string): boolean {
  return getClassNames(node).includes(className);
}

function findElement(
  root: Element,
  predicate: (node: Element) => boolean,
): Element | undefined {
  if (predicate(root)) return root;

  for (const child of root.children) {
    if (!isElement(child)) continue;

    const match = findElement(child, predicate);
    if (match) return match;
  }
}

async function renderCode(meta: string): Promise<Element> {
  const result = await expressiveCode.render({
    code: "const value = 1;",
    language: "js",
    meta,
  });

  return result.renderedGroupAst;
}

async function render(markdown: string): Promise<string> {
  const processor = await createSatteriMarkdownProcessor({
    syntaxHighlight: false,
    mdastPlugins: [koreanPostpositionStrongPlugin()],
  });
  const result = await processor.render(markdown);

  return result.code;
}

void test("괄호로 끝나는 굵은 글씨 뒤에 한글 조사를 붙일 수 있다", async () => {
  assert.equal(
    await render("**오류(Error)**가 발생했다."),
    "<p><strong>오류(Error)</strong>가 발생했다.</p>\n",
  );
});

void test("한 text 노드의 앞뒤 문자와 여러 강조 구문을 보존한다", async () => {
  assert.equal(
    await render("앞 **오류(Error)**가 나고 **경고(Warning)**는 뒤에 있다."),
    "<p>앞 <strong>오류(Error)</strong>가 나고 <strong>경고(Warning)</strong>는 뒤에 있다.</p>\n",
  );
});

void test("이미 파싱되는 표준 bold는 그대로 둔다", async () => {
  assert.equal(
    await render("**오류(Error)** 가 발생했다."),
    "<p><strong>오류(Error)</strong> 가 발생했다.</p>\n",
  );
});

void test("inline code 안의 강조 표시는 그대로 둔다", async () => {
  assert.equal(
    await render("`**오류(Error)**가` 발생했다."),
    "<p><code>**오류(Error)**가</code> 발생했다.</p>\n",
  );
});

void test("이스케이프한 강조 표시는 일반 텍스트로 보존한다", async () => {
  assert.equal(
    await render("\\*\\*오류(Error)\\*\\*가 발생했다."),
    "<p>**오류(Error)**가 발생했다.</p>\n",
  );
});

void test("같은 text 노드에서 literal 강조 다음의 정상 강조만 복구한다", async () => {
  assert.equal(
    await render("\\*\\*무시(Ignore)\\*\\*는 두고 **오류(Error)**가 발생했다."),
    "<p>**무시(Ignore)**는 두고 <strong>오류(Error)</strong>가 발생했다.</p>\n",
  );
});

void test("같은 text 노드의 문장부호 변환과 문자 참조를 보존한다", async () => {
  assert.equal(
    await render('"인용" &amp; 앞 **오류(Error)**가 발생했다.'),
    "<p>“인용” &amp; 앞 <strong>오류(Error)</strong>가 발생했다.</p>\n",
  );
});

void test("같은 text 노드의 무관한 이스케이프를 보존한다", async () => {
  assert.equal(
    await render("\\! 앞 **오류(Error)**가 발생했다."),
    "<p>! 앞 <strong>오류(Error)</strong>가 발생했다.</p>\n",
  );
});

void test("문자 참조로 작성한 별표는 강조 구문으로 바꾸지 않는다", async () => {
  assert.equal(
    await render("&#42;&#42;오류(Error)&#42;&#42;가 발생했다."),
    "<p>**오류(Error)**가 발생했다.</p>\n",
  );
});

void test("문자 참조 강조 다음의 정상 강조만 복구한다", async () => {
  assert.equal(
    await render(
      "&ast;&midast;무시(Reference)&ast;&midast;는 두고 **오류(Error)**가 발생했다.",
    ),
    "<p>**무시(Reference)**는 두고 <strong>오류(Error)</strong>가 발생했다.</p>\n",
  );
});

void test("앞선 inline 노드 뒤의 UTF-8 byte offset을 처리한다", async () => {
  assert.equal(
    await render("**앞**과 [링크](/) 뒤 **오류(Error)**가 발생했다."),
    '<p><strong>앞</strong>과 <a href="/">링크</a> 뒤 <strong>오류(Error)</strong>가 발생했다.</p>\n',
  );
});

void test("강조 표시 뒤가 한글이 아니면 복구하지 않는다", async () => {
  assert.equal(
    await render("**오류(Error)**x 발생했다."),
    "<p>**오류(Error)**x 발생했다.</p>\n",
  );
});

void test("코드 캡션을 Expressive Code 스타일 초기화 경계 밖에 렌더링한다", async () => {
  const root = await renderCode('title="demo.js" caption="설명 [링크](/docs)"');
  const children = root.children.filter(isElement);

  assert.equal(root.tagName, "figure");
  assert.ok(hasClass(root, "code-figure"));
  assert.equal(children.length, 2);

  const [expressiveCodeRoot, caption] = children;
  assert.equal(expressiveCodeRoot?.tagName, "div");
  assert.ok(hasClass(expressiveCodeRoot, "expressive-code"));
  assert.equal(caption?.tagName, "figcaption");
  assert.ok(hasClass(caption, "code-caption"));

  const frame = expressiveCodeRoot.children.find(
    (child): child is Element => isElement(child) && hasClass(child, "frame"),
  );
  assert.equal(frame?.tagName, "div");
  assert.equal(
    findElement(expressiveCodeRoot, (node) => hasClass(node, "header"))
      ?.tagName,
    "div",
  );
  const title = findElement(expressiveCodeRoot, (node) =>
    hasClass(node, "title"),
  );
  assert.deepEqual(title?.children, [{ type: "text", value: "demo.js" }]);
  assert.ok(findElement(expressiveCodeRoot, (node) => node.tagName === "pre"));
  const copyButton = findElement(
    expressiveCodeRoot,
    (node) => node.tagName === "button" && "dataCode" in node.properties,
  );
  assert.equal(copyButton?.properties.dataCode, "const value = 1;");

  const link = findElement(caption, (node) => node.tagName === "a");
  assert.equal(link?.properties.href, "/docs");
});

void test("캡션 없는 코드 블록의 기존 Expressive Code 구조를 보존한다", async () => {
  const meta = 'title="demo.js"';
  const [root, baseline] = await Promise.all([
    renderCode(meta),
    plainExpressiveCode.render({
      code: "const value = 1;",
      language: "js",
      meta,
    }),
  ]);
  const frame = root.children.find(isElement);

  assert.deepEqual(root, baseline.renderedGroupAst);
  assert.equal(root.tagName, "div");
  assert.ok(hasClass(root, "expressive-code"));
  if (frame === undefined) assert.fail("Expected a rendered code frame.");
  assert.equal(frame.tagName, "figure");
  assert.ok(hasClass(frame, "frame"));
  assert.equal(
    findElement(frame, (node) => hasClass(node, "header"))?.tagName,
    "figcaption",
  );
  assert.equal(
    findElement(root, (node) => hasClass(node, "code-caption")),
    undefined,
  );
});

void test("캡션 없는 다중 블록 그룹의 기존 구조를 보존한다", async () => {
  const blocks = [
    { code: "const first = true;", language: "js", meta: "" },
    { code: "const second = true;", language: "js", meta: "" },
  ];
  const [actual, baseline] = await Promise.all([
    expressiveCode.render(blocks),
    plainExpressiveCode.render(blocks),
  ]);

  assert.deepEqual(actual.renderedGroupAst, baseline.renderedGroupAst);
});

void test("캡션이 있는 혼합 다중 블록 그룹을 거부한다", async () => {
  await assert.rejects(
    expressiveCode.render([
      {
        code: "const captioned = true;",
        language: "js",
        meta: 'caption="설명"',
      },
      { code: "const plain = true;", language: "js", meta: "" },
    ]),
    /Code captions are only supported for standalone code blocks/,
  );
});

void test("캡션이 여러 개인 다중 블록 그룹을 거부한다", async () => {
  await assert.rejects(
    expressiveCode.render([
      {
        code: "const first = true;",
        language: "js",
        meta: 'caption="첫 번째"',
      },
      {
        code: "const second = true;",
        language: "js",
        meta: 'caption="두 번째"',
      },
    ]),
    /Code captions are only supported for standalone code blocks/,
  );
});
