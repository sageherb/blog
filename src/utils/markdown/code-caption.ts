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

function prepareCaptionedCodeFrame(frame: Element): void {
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
}

function captionedCodeFigure(group: Element, caption: string): Element {
  if (group.tagName !== "div" || !hasClass(group, "expressive-code")) {
    throw new Error(
      "Expected Expressive Code to render a div.expressive-code group.",
    );
  }

  return {
    type: "element",
    tagName: "figure",
    properties: { className: [CODE_FIGURE_CLASS] },
    children: [
      group,
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

        prepareCaptionedCodeFrame(renderData.blockAst);
      },
      postprocessRenderedBlockGroup({ renderedGroupContents, renderData }) {
        const captionedBlock = renderedGroupContents.find(
          ({ codeBlock }) => captions.getOrCreateFor(codeBlock) !== "",
        );
        if (!captionedBlock) return;
        if (renderedGroupContents.length !== 1) {
          throw new Error(
            "Code captions are only supported for standalone code blocks.",
          );
        }

        const caption = captions.getOrCreateFor(captionedBlock.codeBlock);
        renderData.groupAst = captionedCodeFigure(renderData.groupAst, caption);
      },
    },
  };
}
