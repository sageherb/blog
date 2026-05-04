/**
 * Rehype plugin: wrap each markdown fence `<pre><code>` in a `.code-block`
 * div with a sibling copy `<button>`.
 *
 * Output shape:
 *   <div class="code-block">
 *     <pre><code>...</code></pre>
 *     <button type="button" class="copy-btn" aria-label="코드 복사">Copy</button>
 *   </div>
 *
 * The button stays OUTSIDE the `<pre>` so its label can never bleed into
 * the copied text — runtime reads `pre code` only. Same shape is produced
 * by `CodeBlock.astro`, which lets a single CSS rule cover both paths.
 *
 * Runs in the markdown/MDX pipeline so the button ships in SSR HTML;
 * runtime JS only handles the click via event delegation.
 */
export default function rehypeCopyButton() {
  return (tree) => transform(tree);
}

function transform(node) {
  if (!node || !Array.isArray(node.children)) return;
  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i];
    if (
      child.type === "element" &&
      child.tagName === "pre" &&
      hasCodeChild(child) &&
      !hasClass(node, "code-block")
    ) {
      node.children[i] = wrapWithCodeBlock(child);
    } else {
      transform(child);
    }
  }
}

function hasCodeChild(pre) {
  return (
    Array.isArray(pre.children) &&
    pre.children.some((c) => c.type === "element" && c.tagName === "code")
  );
}

function hasClass(node, name) {
  if (node.type !== "element") return false;
  const cls = node.properties?.className;
  if (Array.isArray(cls)) return cls.includes(name);
  if (typeof cls === "string") return cls.split(/\s+/).includes(name);
  return false;
}

function wrapWithCodeBlock(pre) {
  return {
    type: "element",
    tagName: "div",
    properties: { className: ["code-block"] },
    children: [
      pre,
      {
        type: "element",
        tagName: "button",
        properties: {
          type: "button",
          className: ["copy-btn"],
          "aria-label": "코드 복사",
        },
        children: [{ type: "text", value: "Copy" }],
      },
    ],
  };
}
