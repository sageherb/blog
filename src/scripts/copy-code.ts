/**
 * Code copy: event delegation against SSR'd `.code-block .copy-btn`
 * (rehype plugin for markdown fences, CodeBlock.astro for the MDX path).
 * Reads `pre code` so the button label cannot bleed into the clipboard.
 */
const COPY_RESET_DELAY_MS = 2000;
const resetTimers = new WeakMap<HTMLButtonElement, number>();
const originalLabels = new WeakMap<HTMLButtonElement, string>();
const operationIds = new WeakMap<HTMLButtonElement, number>();

document.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;

  const btn = target.closest<HTMLButtonElement>(".code-block .copy-btn");
  if (!btn) return;

  const code =
    btn.closest(".code-block")?.querySelector("pre code")?.textContent ?? "";
  if (!code) return;

  // (1) Capture original ONCE — second clicks must not see "Copied!" as original.
  if (!originalLabels.has(btn)) {
    originalLabels.set(btn, btn.textContent ?? "Copy");
  }
  const originalLabel = originalLabels.get(btn)!;

  // (2) Cancel any pending reset for this button.
  const pending = resetTimers.get(btn);
  if (pending !== undefined) {
    window.clearTimeout(pending);
    resetTimers.delete(btn);
  }

  // (3) Issue a fresh op token; only the latest op may write the label.
  const opId = (operationIds.get(btn) ?? 0) + 1;
  operationIds.set(btn, opId);

  void (async () => {
    let nextLabel: "Copied!" | "Error";
    try {
      await navigator.clipboard.writeText(code);
      nextLabel = "Copied!";
    } catch {
      nextLabel = "Error";
    }
    // Stale promise from an earlier click — drop it.
    if (operationIds.get(btn) !== opId) return;
    btn.textContent = nextLabel;

    const id = window.setTimeout(() => {
      // Stale timeout — a newer click took over; let the new op manage the label.
      if (operationIds.get(btn) !== opId) return;
      btn.textContent = originalLabel;
      resetTimers.delete(btn);
    }, COPY_RESET_DELAY_MS);
    resetTimers.set(btn, id);
  })();
});
