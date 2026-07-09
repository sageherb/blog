import type { SatteriProcessorOptions } from "@astrojs/markdown-satteri";

type HastPlugin = NonNullable<SatteriProcessorOptions["hastPlugins"]>[number];
type MdastPlugin = NonNullable<SatteriProcessorOptions["mdastPlugins"]>[number];

const NOTE_CLASSES =
  "bg-surface my-6 rounded-lg px-5 py-4 [&_:not(pre)>code]:bg-gray-5 [&>:last-child]:mb-0";
const NOTE_TITLE_CLASSES = "text-accent-11 mb-1.5 text-sm font-bold";

const WRAPPER_CLASSES: Record<string, string> = {
  center: "flex flex-col items-center text-center [&_img]:mx-auto",
  row: "my-6 grid grid-cols-1 items-start gap-4 text-center sm:grid-cols-2 [&>p]:my-0 [&_figure]:my-0 [&_img]:mx-auto [&_img]:my-0",
};

export function directivesPlugin(): MdastPlugin {
  return {
    name: "content-directives",
    containerDirective(node, ctx) {
      if (node.name === "note") {
        const title = node.attributes?.title;
        const hasTitle = typeof title === "string" && title.trim() !== "";
        ctx.setProperty(node, "data", {
          hName: "aside",
          hProperties: {
            role: "note",
            ...(hasTitle && { "aria-label": title }),
            class: hasTitle
              ? `${NOTE_CLASSES} [&>:nth-child(2)]:mt-0`
              : `${NOTE_CLASSES} [&>:first-child]:mt-0`,
          },
        });
        if (hasTitle) {
          ctx.prependChild(node, {
            type: "paragraph",
            data: { hName: "div", hProperties: { class: NOTE_TITLE_CLASSES } },
            children: [{ type: "text", value: title.trim() }],
          });
        }
        return;
      }

      if (!Object.hasOwn(WRAPPER_CLASSES, node.name)) {
        console.warn(
          `[markdown] 알 수 없는 directive ":::${node.name}" — 스타일 없이 렌더링합니다.`,
        );
        ctx.setProperty(node, "data", { hName: "div" });
        return;
      }

      ctx.setProperty(node, "data", {
        hName: "div",
        hProperties: { class: WRAPPER_CLASSES[node.name] },
      });
    },
  };
}

type CaptionNode =
  | { type: "text"; value: string }
  | {
      type: "element";
      tagName: string;
      properties: Record<string, string>;
      children: CaptionNode[];
    };

const CAPTION_LINK_PATTERN = /\[([^\]]+)\]\(([^)\s]+)\)/g;

function parseCaption(caption: string): CaptionNode[] {
  const nodes: CaptionNode[] = [];
  let lastIndex = 0;
  for (const match of caption.matchAll(CAPTION_LINK_PATTERN)) {
    if (match.index > lastIndex) {
      nodes.push({
        type: "text",
        value: caption.slice(lastIndex, match.index),
      });
    }
    nodes.push({
      type: "element",
      tagName: "a",
      properties: { href: match[2] },
      children: [{ type: "text", value: match[1] }],
    });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < caption.length) {
    nodes.push({ type: "text", value: caption.slice(lastIndex) });
  }
  return nodes;
}

export function imageCaptionsPlugin(): HastPlugin {
  return {
    name: "image-captions",
    element: {
      filter: ["img"],
      visit(node, ctx) {
        const title = node.properties?.title;
        if (typeof title !== "string" || title.trim() === "") return;

        const parent = ctx.parent(node);
        if (parent.type !== "element" || parent.tagName !== "p") return;

        const meaningfulChildren = parent.children.filter(
          (child) => !(child.type === "text" && child.value.trim() === ""),
        );
        if (meaningfulChildren.length !== 1) return;

        const { title: _, ...imgProperties } = node.properties;
        ctx.replaceNode(parent, {
          type: "element",
          tagName: "figure",
          properties: {},
          children: [
            {
              type: "element",
              tagName: "img",
              properties: imgProperties,
              children: [],
            },
            {
              type: "element",
              tagName: "figcaption",
              properties: {},
              children: parseCaption(title.trim()),
            },
          ],
        });
      },
    },
  };
}
