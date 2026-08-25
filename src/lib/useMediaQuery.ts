"use client";

import { useSyncExternalStore } from "react";

/**
 * Subscribes to a media query without a setState-in-effect round trip.
 * Returns `false` during SSR so the server and first client render agree;
 * the client corrects on hydration.
 */
export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false
  );
}
