import { useEffect, useState } from "preact/hooks";

export default function ThemeToggleIsland() {
  // aria-label용 상태만 유지. 아이콘 표시는 CSS(html.dark)가 담당.
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function applyTheme(dark: boolean) {
    document.documentElement.classList.toggle("dark", dark);
    try {
      localStorage.setItem("theme", dark ? "dark" : "light");
    } catch {
      /* private mode — swallow */
    }
    setIsDark(dark);
  }

  return (
    <button
      type="button"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      class="theme-toggle text-text-muted hover:text-text inline-flex h-9 w-9 items-center justify-center rounded transition-colors"
      onClick={() => applyTheme(!isDark)}
    >
      {/* moon — light 모드에서 노출(다크로 전환 유도) */}
      <svg
        data-icon="moon"
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
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
      {/* sun — dark 모드에서 노출(라이트로 전환 유도) */}
      <svg
        data-icon="sun"
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
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
      </svg>
    </button>
  );
}
