import { useEffect, useRef } from "preact/hooks";

declare global {
  interface Window {
    PagefindUI?: new (options: Record<string, unknown>) => unknown;
  }
}

export default function SearchDialogIsland() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const pagefindReadyRef = useRef(false);

  useEffect(() => {
    const dialogEl = dialogRef.current;
    const triggerEl = document.getElementById("search-trigger");
    if (!dialogEl || !triggerEl) return;

    const dialog = dialogEl;
    const trigger = triggerEl;

    async function initPagefind() {
      if (pagefindReadyRef.current) return;
      pagefindReadyRef.current = true;

      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "/pagefind/pagefind-ui.css";
      document.head.appendChild(link);

      await new Promise<void>((resolve) => {
        const script = document.createElement("script");
        script.src = "/pagefind/pagefind-ui.js";
        script.onload = () => resolve();
        document.head.appendChild(script);
      });

      if (!window.PagefindUI) return;

      new window.PagefindUI({
        element: "#search-pagefind",
        showImages: false,
        resetStyles: false,
        translations: {
          placeholder: "검색어를 입력하세요",
          zero_results: "검색 결과가 없습니다.",
        },
        processResult: (result: Record<string, unknown>) => {
          const meta = result.meta as Record<string, string> | undefined;
          const desc = meta?.desc;
          if (desc && meta) {
            delete meta.desc;
            const excerpt = (result.excerpt as string) ?? "";
            result.excerpt = `<span class="search-desc">${desc}</span>${excerpt}`;
          }
          return result;
        },
      });
    }

    async function openSearch() {
      await initPagefind();
      dialog.showModal();
      dialog.querySelector<HTMLInputElement>("input")?.focus();
    }

    function closeSearch() {
      dialog.close();
    }

    function onShortcut(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        dialog.open ? closeSearch() : openSearch();
      }
    }

    function onDialogClick(e: MouseEvent) {
      if (e.target === dialog) closeSearch();
    }

    trigger.addEventListener("click", openSearch);
    document.addEventListener("keydown", onShortcut);
    dialog.addEventListener("click", onDialogClick);

    return () => {
      trigger.removeEventListener("click", openSearch);
      document.removeEventListener("keydown", onShortcut);
      dialog.removeEventListener("click", onDialogClick);
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      id="search-dialog"
      aria-label="사이트 검색"
      class="bg-panel border-border w-full rounded-xl border p-0 shadow-2xl"
    >
      <div id="search-pagefind"></div>
    </dialog>
  );
}
