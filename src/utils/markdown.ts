import type { SatteriProcessorOptions } from "@astrojs/markdown-satteri";

type HastPlugin = NonNullable<SatteriProcessorOptions["hastPlugins"]>[number];

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
              children: [{ type: "text", value: title.trim() }],
            },
          ],
        });
      },
    },
  };
}
