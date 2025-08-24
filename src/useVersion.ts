import { useEffect, useRef, useState } from 'react';

type VersionInfo = {
  version: string;
  build?: string;
  timestamp?: string;
};

const STORAGE_KEY = 'app_version';

export function useVersionCheck(options?: { intervalMs?: number }) {
  const intervalMs = options?.intervalMs ?? 60_000;
  const [current, setCurrent] = useState<VersionInfo | null>(null);
  const [remote, setRemote] = useState<VersionInfo | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const currentRef = useRef<VersionInfo | null>(null);
  currentRef.current = current;

  async function fetchVersion(): Promise<VersionInfo | null> {
    try {
      const res = await fetch('/public/version.json', { cache: 'no-store' });
      if (!res.ok) return null;
      return (await res.json()) as VersionInfo;
    } catch {
      return null;
    }
  }

  function readStoredVersion(): VersionInfo | null {
    try {
      if (typeof window === 'undefined') return null;
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as VersionInfo;
    } catch {
      return null;
    }
  }

  function writeStoredVersion(v: VersionInfo | null) {
    try {
      if (typeof window === 'undefined') return;
      if (v === null) {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(v));
      }
    } catch {
      // ignore storage errors
    }
  }

  useEffect(() => {
    let timer: number | undefined;

    (async () => {
      const stored = readStoredVersion();
      if (stored) {
        setCurrent(stored);
      }

      const latest = await fetchVersion();
      if (latest) {
        setRemote(latest);
        if (!stored || stored.version !== latest.version) {
          setUpdateAvailable(true);
        } else {
          setUpdateAvailable(false);
        }
      }
    })();

    timer = window.setInterval(async () => {
      const latest = await fetchVersion();
      if (latest) {
        setRemote(latest);
        if (!currentRef.current || currentRef.current.version !== latest.version) {
          setUpdateAvailable(true);
        }
      }
    }, intervalMs) as unknown as number;

    return () => {
      if (timer) window.clearInterval(timer);
    };
  }, [intervalMs]);

  const reloadNow = () => {
    if (remote) writeStoredVersion(remote);
    if (navigator.serviceWorker?.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
      setTimeout(() => window.location.reload(), 500);
    } else {
      window.location.reload();
    }
  };

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.data?.type === 'RELOAD_REQUIRED') {
        // prefer version sent by SW, fallback to remote from fetch
        const v = e.data?.version ?? remote;
        if (v) writeStoredVersion(v);
        window.location.reload();
      }
    }
    navigator.serviceWorker?.addEventListener('message', onMessage);
    return () => navigator.serviceWorker?.removeEventListener('message', onMessage);
  }, [remote]);

  return { current, remote, updateAvailable, reloadNow };
}
