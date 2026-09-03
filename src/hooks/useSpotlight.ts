import { useCallback, type MouseEvent } from "react";

/**
 * Writes the pointer position into `--mx` / `--my` on the hovered element, which the
 * `spotlight` CSS utility reads. It mutates style directly rather than through state, so a
 * moving cursor costs zero re-renders.
 */
export function useSpotlight() {
  return useCallback((event: MouseEvent<HTMLElement>) => {
    const element = event.currentTarget;
    const rect = element.getBoundingClientRect();
    element.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    element.style.setProperty("--my", `${event.clientY - rect.top}px`);
  }, []);
}
