import type { SatteriProcessorOptions } from "@astrojs/markdown-satteri";

type HastPlugin = NonNullable<SatteriProcessorOptions["hastPlugins"]>[number];

type ElementVisitor = Exclude<
  NonNullable<HastPlugin["element"]>,
  readonly unknown[]
>["visit"];
type ImageNode = Parameters<ElementVisitor>[0];
type HastContext = Parameters<ElementVisitor>[1];
type ImageParent = NonNullable<ReturnType<HastContext["parent"]>>;
type FigureNode = Parameters<HastContext["replaceNode"]>[1];

type CaptionNode =
  | { type: "text"; value: string }
  | {
      type: "element";
      tagName: string;
      properties: Record<string, string>;
      children: CaptionNode[];
    };

const CAPTION_LINK_PATTERN = /\[([^\]]+)\]\(([^)\s]+)\)/g;

export function parseCaption(caption: string): CaptionNode[] {
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

function captionedFigure(img: ImageNode, caption: string): FigureNode {
  const { title: _, ...imgProperties } = img.properties;
  return {
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
        children: parseCaption(caption.trim()),
      },
    ],
  };
}

function isSoleMeaningfulChild(parent: ImageParent): boolean {
  if (parent.type !== "element" || parent.tagName !== "p") return false;
  const meaningfulChildren = parent.children.filter(
    (child) => !(child.type === "text" && child.value.trim() === ""),
  );
  return meaningfulChildren.length === 1;
}

export function imageCaptionsPlugin(): HastPlugin {
  return {
    name: "image-captions",
    element: {
      filter: ["img"],
      visit(node, ctx) {
        const caption = node.properties?.title;
        if (typeof caption !== "string" || caption.trim() === "") return;

        const parent = ctx.parent(node);
        if (!isSoleMeaningfulChild(parent)) return;

        ctx.replaceNode(parent, captionedFigure(node, caption));
      },
    },
  };
}
