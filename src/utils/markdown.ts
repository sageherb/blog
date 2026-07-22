import type { SatteriProcessorOptions } from "@astrojs/markdown-satteri";

type HastPlugin = NonNullable<SatteriProcessorOptions["hastPlugins"]>[number];
type MdastPlugin = NonNullable<SatteriProcessorOptions["mdastPlugins"]>[number];

interface MdastText {
  type: "text";
  value: string;
}

interface MdastStrong {
  type: "strong";
  children: MdastText[];
}

type TextVisitor = NonNullable<MdastPlugin["text"]>;
type SourceTextNode = Parameters<TextVisitor>[0];

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

const KOREAN_POSTPOSITION_STRONG_PATTERN =
  /(?<!\*)\*\*([^\s*][^*\r\n]*\))\*\*(?=\p{Script=Hangul})/gu;
const STAR_CHARACTER_REFERENCE_PATTERN =
  /^(?:&#(?:0*42|[xX]0*2[aA]);|&(?:ast|midast);)/;
const UTF8_ENCODER = new TextEncoder();
const UTF8_DECODER = new TextDecoder();

function sourceText(
  node: SourceTextNode,
  sourceBytes: Uint8Array,
): string | undefined {
  const start = node.position?.start.offset;
  const end = node.position?.end.offset;
  if (start === undefined || end === undefined) return undefined;

  // Sätteri positions are UTF-8 byte offsets, not JavaScript string indexes.
  return UTF8_DECODER.decode(sourceBytes.subarray(start, end));
}

function collectRawStarOrigins(raw: string): boolean[] {
  const origins: boolean[] = [];
  let backslashRun = 0;

  for (let index = 0; index < raw.length; index += 1) {
    const character = raw[index];
    if (character === "\\") {
      backslashRun += 1;
      continue;
    }

    if (character === "*") {
      origins.push(backslashRun % 2 === 0);
    } else if (character === "&" && backslashRun % 2 === 0) {
      const reference = raw
        .slice(index)
        .match(STAR_CHARACTER_REFERENCE_PATTERN)?.[0];
      if (reference !== undefined) {
        origins.push(false);
        index += reference.length - 1;
      }
    }
    backslashRun = 0;
  }

  return origins;
}

function literalStarIndexes(
  value: string,
  raw: string,
): ReadonlySet<number> | undefined {
  const valueIndexes: number[] = [];
  for (let index = 0; index < value.length; index += 1) {
    if (value[index] === "*") valueIndexes.push(index);
  }

  const origins = collectRawStarOrigins(raw);
  if (origins.length !== valueIndexes.length) return undefined;

  const literalIndexes = new Set<number>();
  for (const [originIndex, valueIndex] of valueIndexes.entries()) {
    if (origins[originIndex]) literalIndexes.add(valueIndex);
  }
  return literalIndexes;
}

function restoreKoreanPostpositionStrong(
  value: string,
  literalStars: ReadonlySet<number>,
): Array<MdastText | MdastStrong> | undefined {
  const nodes: Array<MdastText | MdastStrong> = [];
  let lastIndex = 0;

  for (const match of value.matchAll(KOREAN_POSTPOSITION_STRONG_PATTERN)) {
    const closingIndex = match.index + match[0].length - 2;
    if (
      !literalStars.has(match.index) ||
      !literalStars.has(match.index + 1) ||
      !literalStars.has(closingIndex) ||
      !literalStars.has(closingIndex + 1)
    ) {
      continue;
    }

    if (match.index > lastIndex) {
      nodes.push({ type: "text", value: value.slice(lastIndex, match.index) });
    }
    nodes.push({
      type: "strong",
      children: [{ type: "text", value: match[1] }],
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex === 0) return undefined;
  if (lastIndex < value.length) {
    nodes.push({ type: "text", value: value.slice(lastIndex) });
  }
  return nodes;
}

export function koreanPostpositionStrongPlugin(): MdastPlugin {
  let cachedSource: string | undefined;
  let cachedSourceBytes: Uint8Array | undefined;

  return {
    name: "korean-postposition-strong",
    text(node, ctx) {
      // CommonMark delimiter parsing leaves this CJK-specific shape as text;
      // repair only **text)** followed immediately by a Hangul character.
      if (!node.value.includes(")**")) return;

      const source = ctx.source;
      if (source !== cachedSource || cachedSourceBytes === undefined) {
        cachedSource = source;
        cachedSourceBytes = UTF8_ENCODER.encode(source);
      }

      const raw = sourceText(node, cachedSourceBytes);
      if (raw === undefined) return;
      const literalStars = literalStarIndexes(node.value, raw);
      if (!literalStars) return;

      const restored = restoreKoreanPostpositionStrong(
        node.value,
        literalStars,
      );
      if (!restored) return;

      ctx.insertBefore(node, restored);
      ctx.removeNode(node);
    },
  };
}

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
