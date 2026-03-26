"use client";

import { useEffect } from "react";

export function LandingPageReveal() {
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>(".landing-reveal"));

    if (elements.length === 0) {
      return;
    }

    if (!("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("visible"));
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
            element.classList.add("visible");
          }, order * 60);

          observer.unobserve(element);
        });
      },
      { threshold: 0.12 }
    );

    elements.forEach((element, index) => {
      element.dataset.revealOrder = String(index);
      observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  return null;
}
