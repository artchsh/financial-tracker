import { useEffect, useRef, useState } from 'react';

type VersionInfo = {
  version: string;
  build?: string;
  timestamp?: string;
};

export function useVersionCheck(options?: { intervalMs?: number }) {
  const intervalMs = options?.intervalMs ?? 60_000; // default 1 minute
  const [current, setCurrent] = useState<VersionInfo | null>(null);
  const [remote, setRemote] = useState<VersionInfo | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);

  async function fetchVersion(): Promise<VersionInfo | null> {
    try {
      const res = await fetch('/public/version.json', { cache: 'no-store' });
      if (!res.ok) return null;
      return (await res.json()) as VersionInfo;
    } catch {
      return null;
    }
  }

  async function readCachedVersion(): Promise<VersionInfo | null> {
    try {
      const res = await fetch('/public/version.json', { cache: 'force-cache' });
      if (!res.ok) return null;
      return (await res.json()) as VersionInfo;
    } catch {
      return null;
    }
  }

  useEffect(() => {
    let timer: number | undefined;
    (async () => {
      // First, check cached/current version (from SW cache if offline)
      const cached = await readCachedVersion();
      if (cached) setCurrent(cached);
      // Then, force network to detect remote
      const latest = await fetchVersion();
      if (latest) {
        setRemote(latest);
        if (!cached || cached.version !== latest.version) {
          setUpdateAvailable(true);
        }
      }
    })();

    timer = window.setInterval(async () => {
      const latest = await fetchVersion();
      if (latest) {
        setRemote(latest);
        if (!current || current.version !== latest.version) {
          setUpdateAvailable(true);
        }
      }
    }, intervalMs) as unknown as number;

    return () => {
      if (timer) window.clearInterval(timer);
      controllerRef.current?.abort();
    };
  }, []);

  const reloadNow = () => {
    // Ask SW to skip waiting and reload clients
    if (navigator.serviceWorker?.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
      // As a fallback, force reload after a short delay
      setTimeout(() => window.location.reload(), 500);
    } else {
      window.location.reload();
    }
  };

  // Listen for SW message to reload
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.data?.type === 'RELOAD_REQUIRED') {
        window.location.reload();
      }
    }
    navigator.serviceWorker?.addEventListener('message', onMessage);
    return () => navigator.serviceWorker?.removeEventListener('message', onMessage);
  }, []);

  return { current, remote, updateAvailable, reloadNow };
}
