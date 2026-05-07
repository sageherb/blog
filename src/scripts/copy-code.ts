/**
 * Code copy: event delegation against SSR'd `.code-block .copy-btn`
 * (rehype plugin for markdown fences, CodeBlock.astro for the MDX path).
 * Reads `pre code` so the button label cannot bleed into the clipboard.
 */
const COPY_RESET_DELAY_MS = 2000;

document.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;

  const btn = target.closest<HTMLButtonElement>(".code-block .copy-btn");
  if (!btn) return;

  const code =
    btn.closest(".code-block")?.querySelector("pre code")?.textContent ?? "";
  if (!code) return;

  const originalLabel = btn.textContent ?? "Copy";

  void (async () => {
    try {
      await navigator.clipboard.writeText(code);
      btn.textContent = "Copied!";
    } catch {
      btn.textContent = "Error";
    }

    window.setTimeout(() => {
      btn.textContent = originalLabel;
    }, COPY_RESET_DELAY_MS);
  })();
});
