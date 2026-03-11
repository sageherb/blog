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
    <>
      <dialog
        ref={dialogRef}
        id="search-dialog"
        aria-label="사이트 검색"
        class="bg-panel border-border w-full rounded-xl border p-0 shadow-2xl"
      >
        <div id="search-pagefind"></div>
      </dialog>
      <style>
        {`
        #search-dialog {
          outline: none;
          margin: 5rem auto auto;
          width: calc(100% - 2rem);
          max-width: 32rem;
          max-height: calc(100vh - 7rem);
        }

        #search-dialog::backdrop {
          background-color: rgb(0 0 0 / 0.35);
          backdrop-filter: blur(4px);
        }

        #search-pagefind {
          --pagefind-ui-scale: 0.75;
          --pagefind-ui-primary: var(--link);
          --pagefind-ui-text: var(--text);
          --pagefind-ui-background: var(--panel);
          --pagefind-ui-border: var(--border);
          --pagefind-ui-tag: var(--surface);
          --pagefind-ui-border-width: 1px;
          --pagefind-ui-border-radius: 6px;
          --pagefind-ui-font: inherit;
        }

        #search-pagefind .pagefind-ui__form {
          padding: 0.375rem 0.75rem;
        }

        #search-pagefind .pagefind-ui__form::before {
          top: calc(0.375rem + 0.625rem);
          left: calc(20px * var(--pagefind-ui-scale) + 0.5rem);
          width: 14px;
          height: 14px;
        }

        #search-pagefind .pagefind-ui__search-input {
          height: 2.25rem !important;
          padding-top: 0 !important;
          padding-bottom: 0 !important;
          font-size: 0.875rem !important;
          border: none !important;
          box-shadow: none !important;
        }

        #search-pagefind .pagefind-ui__search-input:focus,
        #search-pagefind .pagefind-ui__search-input:focus-visible {
          outline: none !important;
          box-shadow: none !important;
        }

        #search-pagefind .pagefind-ui__search-clear {
          top: 0.375rem;
          right: calc(3px * var(--pagefind-ui-scale) + 0.5rem);
          height: 2.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0;
        }

        #search-pagefind .pagefind-ui__search-clear::before {
          content: "✕";
          font-size: 0.875rem;
          line-height: 1;
          color: var(--text-muted);
        }

        #search-pagefind
          .pagefind-ui__drawer:has(.pagefind-ui__result, .pagefind-ui__message) {
          padding: 0 0.75rem 0.75rem;
          border-top: 1px solid var(--border);
          overflow-y: auto;
          max-height: 60vh;
        }
        `}
      </style>
    </>
  );
}
