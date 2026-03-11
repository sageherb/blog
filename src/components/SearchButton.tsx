import { useEffect, useState } from "preact/hooks";

export default function SearchButtonIsland() {
  const [isMac, setIsMac] = useState(true);

  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad|iPod/.test(navigator.userAgent));
  }, []);

  return (
    <button
      id="search-trigger"
      aria-label="검색 열기"
      aria-keyshortcuts="Meta+k Control+k"
      class="text-text-muted hover:text-text inline-flex h-9 items-center gap-1.5 rounded px-2 text-sm leading-none transition-colors"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
      <kbd
        class="bg-surface border-border hidden h-5 place-items-center rounded border px-1.5 font-sans text-sm leading-none sm:inline-grid"
        aria-hidden="true"
      >
        <span class="relative top-px leading-none">
          {isMac ? "⌘K" : "Ctrl K"}
        </span>
      </kbd>
    </button>
  );
}
