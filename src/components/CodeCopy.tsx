import { useEffect } from "preact/hooks";

export default function CodeCopyIsland() {
  useEffect(() => {
    document.querySelectorAll<HTMLPreElement>(".prose pre").forEach((pre) => {
      if (pre.querySelector(".copy-btn")) return;

      const btn = document.createElement("button");
      btn.className = "copy-btn";
      btn.textContent = "Copy";
      btn.setAttribute("aria-label", "코드 복사");

      btn.addEventListener("click", async () => {
        const code = pre.querySelector("code")?.textContent ?? "";
        try {
          await navigator.clipboard.writeText(code);
          btn.textContent = "Copied!";
        } catch {
          btn.textContent = "Error";
        } finally {
          setTimeout(() => {
            btn.textContent = "Copy";
          }, 2000);
        }
      });

      pre.appendChild(btn);
    });
  }, []);

  return null;
}
