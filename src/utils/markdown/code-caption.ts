import type { ExpressiveCodePlugin } from "astro-expressive-code";
import type { Element, ElementContent } from "astro-expressive-code/hast";

import { AttachedPluginData } from "astro-expressive-code";
import { getClassNames } from "astro-expressive-code/hast";

import { parseCaption } from "./captions.ts";

const CODE_FIGURE_CLASS = "code-figure";
const CODE_CAPTION_CLASS = "code-caption";

function isElement(node: ElementContent): node is Element {
  return node.type === "element";
}

function hasClass(node: Element, className: string): boolean {
  return getClassNames(node).includes(className);
}

function captionedCodeFigure(frame: Element, caption: string): Element {
  if (frame.tagName !== "figure" || !hasClass(frame, "frame")) {
    throw new Error(
      "Expected the Expressive Code Frames plugin to render figure.frame.",
    );
  }

  const header = frame.children.find(
    (child): child is Element => isElement(child) && hasClass(child, "header"),
  );
  if (!header || header.tagName !== "figcaption") {
    throw new Error(
      "Expected the Expressive Code Frames plugin to render figcaption.header.",
    );
  }

  frame.tagName = "div";
  header.tagName = "div";

  return {
    type: "element",
    tagName: "figure",
    properties: { className: [CODE_FIGURE_CLASS] },
    children: [
      frame,
      {
        type: "element",
        tagName: "figcaption",
        properties: { className: [CODE_CAPTION_CLASS] },
        children: parseCaption(caption),
      },
    ],
  };
}

export function codeCaptionsPlugin(): ExpressiveCodePlugin {
  const captions = new AttachedPluginData(() => "");

  return {
    name: "CodeCaptions",
    hooks: {
      preprocessMetadata({ codeBlock }) {
        const caption =
          codeBlock.metaOptions.getString("caption")?.trim() ?? "";
        captions.setFor(codeBlock, caption);
      },
      postprocessRenderedBlock({ codeBlock, renderData }) {
        const caption = captions.getOrCreateFor(codeBlock);
        if (!caption) return;

        renderData.blockAst = captionedCodeFigure(renderData.blockAst, caption);
      },
    },
  };
}
