import type { SatteriProcessorOptions } from "@astrojs/markdown-satteri";

type MdastPlugin = NonNullable<SatteriProcessorOptions["mdastPlugins"]>[number];

type DirectiveVisitor = NonNullable<MdastPlugin["containerDirective"]>;
type DirectiveNode = Parameters<DirectiveVisitor>[0];
type DirectiveContext = Parameters<DirectiveVisitor>[1];
type DirectiveChild = Parameters<DirectiveContext["prependChild"]>[1];

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
