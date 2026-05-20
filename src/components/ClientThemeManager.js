"use client";

import { useEffect } from "react";

export function ClientThemeManager() {
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "system";
    const savedBg = localStorage.getItem("bgPattern") || "none";

    const root = document.documentElement;
    if (savedTheme === "dark") {
      root.classList.add("dark");
    } else if (savedTheme === "light") {
      root.classList.remove("dark");
    } else {
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }

    if (savedBg !== "none") {
      document.body.classList.add(`bg-${savedBg}`);
    }

    // Register Service Worker for PWA
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.error("Service Worker registration failed:", err);
      });
    }
  }, []);

  return null;
}
