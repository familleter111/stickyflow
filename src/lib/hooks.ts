import { useEffect, useRef } from "react";

/** Calls handler when a click/touch occurs outside the referenced element. */
export function useOnClickOutside<T extends HTMLElement>(
  onOutside: () => void,
  active = true,
) {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    if (!active) return;
    const handler = (e: MouseEvent | TouchEvent) => {
      const el = ref.current;
      if (el && !el.contains(e.target as Node)) onOutside();
    };
    // defer so the opening click doesn't immediately close it
    const id = window.setTimeout(() => {
      document.addEventListener("mousedown", handler);
      document.addEventListener("touchstart", handler);
    }, 0);
    return () => {
      window.clearTimeout(id);
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [onOutside, active]);
  return ref;
}

/** Calls handler on Escape key while active. */
export function useEscape(onEscape: () => void, active = true) {
  useEffect(() => {
    if (!active) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onEscape();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onEscape, active]);
}
