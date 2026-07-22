import type { SatteriProcessorOptions } from "@astrojs/markdown-satteri";

type HastPlugin = NonNullable<SatteriProcessorOptions["hastPlugins"]>[number];
type MdastPlugin = NonNullable<SatteriProcessorOptions["mdastPlugins"]>[number];

type DirectiveVisitor = NonNullable<MdastPlugin["containerDirective"]>;
type DirectiveNode = Parameters<DirectiveVisitor>[0];
type DirectiveContext = Parameters<DirectiveVisitor>[1];
type DirectiveChild = Parameters<DirectiveContext["prependChild"]>[1];

type ElementVisitor = Exclude<
  NonNullable<HastPlugin["element"]>,
  readonly unknown[]
>["visit"];
type ImageNode = Parameters<ElementVisitor>[0];
type HastContext = Parameters<ElementVisitor>[1];
type ImageParent = NonNullable<ReturnType<HastContext["parent"]>>;
type FigureNode = Parameters<HastContext["replaceNode"]>[1];

const NOTE_CLASSES =
  "bg-surface my-6 rounded-lg px-5 py-4 [&_:not(pre)>code]:bg-gray-5 [&>:last-child]:mb-0";
const NOTE_TITLE_CLASSES = "text-accent-11 mt-0! mb-1.5! text-sm font-bold";

const WRAPPER_CLASSES: Record<string, string> = {
  center:
    "my-6 flex flex-col items-center text-center [&>p]:my-0 [&_figure]:my-0 [&_img]:mx-auto [&_img]:my-0",
  row: "my-6 grid grid-cols-1 items-start gap-4 text-center sm:grid-cols-2 [&>p]:my-0 [&_figure]:my-0 [&_img]:mx-auto [&_img]:my-0",
};

function noteTitleParagraph(title: string): DirectiveChild {
  return {
    type: "paragraph",
    data: {
      hName: "p",
      hProperties: { "aria-hidden": "true", class: NOTE_TITLE_CLASSES },
    },
    children: [{ type: "text", value: title.trim() }],
  };
}

function transformNote(node: DirectiveNode, ctx: DirectiveContext): void {
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
    ctx.prependChild(node, noteTitleParagraph(title));
  }
}

function transformWrapper(node: DirectiveNode, ctx: DirectiveContext): void {
  ctx.setProperty(node, "data", {
    hName: "div",
    hProperties: { class: WRAPPER_CLASSES[node.name] },
  });
}

function transformUnknown(node: DirectiveNode, ctx: DirectiveContext): void {
  console.warn(
    `[markdown] 알 수 없는 directive ":::${node.name}" — 스타일 없이 렌더링합니다.`,
  );
  ctx.setProperty(node, "data", { hName: "div" });
}

export function directivesPlugin(): MdastPlugin {
  return {
    name: "content-directives",
    containerDirective(node, ctx) {
      if (node.name === "note") {
        transformNote(node, ctx);
      } else if (Object.hasOwn(WRAPPER_CLASSES, node.name)) {
        transformWrapper(node, ctx);
      } else {
        transformUnknown(node, ctx);
      }
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
