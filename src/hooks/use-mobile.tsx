'use client';

import { useSyncExternalStore } from 'react';

const MOBILE_BREAKPOINT = 768;

function subscribe(callback: () => void) {
  const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
  mql.addEventListener('change', callback);
  return () => {
    mql.removeEventListener('change', callback);
  };
}

function getSnapshot() {
  // This function is only called on the client.
  return window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`).matches;
}

// On the server, React will use this value.
// It must be consistent with the initial client-side render to avoid a mismatch.
function getServerSnapshot() {
  return false;
}

export function useIsMobile(): boolean {
  // useSyncExternalStore is the modern, safe way to subscribe to external browser APIs.
  const isMobile = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );
  return isMobile;
}
