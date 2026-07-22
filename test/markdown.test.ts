import assert from "node:assert/strict";
// This project intentionally runs these tests with Node's built-in test runner.
// eslint-disable-next-line test/no-import-node-test
import test from "node:test";

import { createSatteriMarkdownProcessor } from "@astrojs/markdown-satteri";

import { koreanPostpositionStrongPlugin } from "../src/utils/markdown.ts";

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
