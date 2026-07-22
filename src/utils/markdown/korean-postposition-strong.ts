import type { SatteriProcessorOptions } from "@astrojs/markdown-satteri";

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
