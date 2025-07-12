"use client";

import { useEffect, useRef } from "react";

export function Overlay() {
  const highlightRef = useRef<HTMLDivElement>(null);
  const currentHovered = useRef<string | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const highlight = highlightRef.current;
      if (!highlight) return;

      highlight.style.display = "none";
      const target = document.elementFromPoint(e.clientX, e.clientY);
      highlight.style.display = "";

      if (!target) {
        currentHovered.current = null;
        highlight.style.display = "none";
        return;
      }

      const componentEl = (target as Element).closest("[data-component-id]") as HTMLElement | null;
      if (!componentEl) {
        currentHovered.current = null;
        highlight.style.display = "none";
        return;
      }

      const id = componentEl.dataset.componentId as string;

      if (id === currentHovered.current) return;

      currentHovered.current = id;

      const rect = componentEl.getBoundingClientRect();

      highlight.style.position = "absolute";
      highlight.style.top = `${rect.top + window.scrollY}px`;
      highlight.style.left = `${rect.left + window.scrollX}px`;
      highlight.style.width = `${rect.width}px`;
      highlight.style.height = `${rect.height}px`;
      highlight.style.border = "2px solid #3b82f6";
      highlight.style.pointerEvents = "none";
      highlight.style.zIndex = "9999";
    };

    const handleClick = (e: MouseEvent) => {
      const highlight = highlightRef.current;
      if (!highlight) return;

      highlight.style.display = "none";
      const target = document.elementFromPoint(e.clientX, e.clientY);
      highlight.style.display = "";

      if (!target) return;

      const componentEl = (target as Element).closest("[data-component-id]") as HTMLElement | null;
      if (!componentEl) return;

      const id = componentEl.dataset.componentId as string;
      window.parent.postMessage({ type: "selectComponent", id }, "*");
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("click", handleClick, { capture: true });

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("click", handleClick, { capture: true });
    };
  }, []);

  return <div ref={highlightRef} />;
} 