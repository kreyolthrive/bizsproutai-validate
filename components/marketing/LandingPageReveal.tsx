"use client";

import { useEffect } from "react";

export function LandingPageReveal() {
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>(".landing-reveal"));

    if (elements.length === 0) {
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      elements.forEach((element) => {
        element.dataset.revealState = "visible";
      });
      return;
    }

    document.documentElement.dataset.motion = "enabled";

    if (!("IntersectionObserver" in window)) {
      elements.forEach((element) => {
        element.dataset.revealState = "visible";
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          const element = entry.target as HTMLElement;
          const order = Number(element.dataset.revealOrder ?? "0");

          window.setTimeout(() => {
            element.dataset.revealState = "visible";
          }, order * 60);

          observer.unobserve(element);
        });
      },
      { threshold: 0.12 }
    );

    elements.forEach((element, index) => {
      element.dataset.revealOrder = String(index);

      const rect = element.getBoundingClientRect();
      const isInitiallyVisible = rect.top < window.innerHeight * 0.88;

      if (isInitiallyVisible) {
        element.dataset.revealState = "visible";
        return;
      }

      element.dataset.revealState = "hidden";
      observer.observe(element);
    });

    return () => {
      observer.disconnect();
      delete document.documentElement.dataset.motion;
    };
  }, []);

  return null;
}
