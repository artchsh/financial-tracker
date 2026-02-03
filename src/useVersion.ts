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

  function cmpVersions(a: string, b: string): number {
    // Compare semantic-like versions: returns 1 if a>b, -1 if a<b, 0 if equal
    const pa = a.split('.').map((x) => parseInt(x, 10));
    const pb = b.split('.').map((x) => parseInt(x, 10));
    const len = Math.max(pa.length, pb.length);
    for (let i = 0; i < len; i++) {
      const va = Number.isFinite(pa[i]) ? pa[i] : 0;
      const vb = Number.isFinite(pb[i]) ? pb[i] : 0;
      if (va > vb) return 1;
      if (va < vb) return -1;
    }
    return 0;
  }

  function isRemoteGreater(remoteV?: string, localV?: string): boolean {
    if (!remoteV) return false;
    if (!localV) return false; // First run: treat as up-to-date after storing
    return cmpVersions(remoteV, localV) > 0;
  }

  async function fetchVersion(): Promise<VersionInfo | null> {
    try {
      // Add cache-busting query parameter to ensure fresh data
      const url = `/public/version.json?t=${Date.now()}`;
      const res = await fetch(url, { cache: 'no-store' });
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
      const stored = JSON.parse(raw) as VersionInfo;
      
      // Validate stored version data
      if (!stored.version || typeof stored.version !== 'string') {
        console.warn('Invalid version data in localStorage, clearing...');
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      
      // Check if stored version is significantly outdated (more than 90 days)
      if (stored.timestamp) {
        const storedTime = new Date(stored.timestamp).getTime();
        const now = Date.now();
        const daysDiff = (now - storedTime) / (1000 * 60 * 60 * 24);
        
        if (daysDiff > 90) {
          console.warn('Stored version is significantly outdated (>90 days), clearing...');
          localStorage.removeItem(STORAGE_KEY);
          return null;
        }
      }
      
      return stored;
    } catch (error) {
      // Corrupted localStorage data - clear it
      console.warn('Error reading stored version, clearing localStorage:', error);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {}
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
      if (stored) setCurrent(stored);

      const latest = await fetchVersion();
      if (latest) {
        setRemote(latest);
        if (!stored) {
          // First launch: store current version without prompting for update
          writeStoredVersion(latest);
          setCurrent(latest);
          setUpdateAvailable(false);
        } else {
          // Check for inconsistencies between stored and remote
          const isGreater = isRemoteGreater(latest.version, stored.version);
          
          // Additional check: if timestamps are inconsistent, clear and reset
          if (stored.timestamp && latest.timestamp) {
            const storedTime = new Date(stored.timestamp).getTime();
            const remoteTime = new Date(latest.timestamp).getTime();
            
            // If stored timestamp is newer than remote but versions don't match,
            // there's an inconsistency - clear and reset
            if (storedTime > remoteTime && stored.version !== latest.version) {
              console.warn('Version timestamp inconsistency detected, resetting...');
              writeStoredVersion(latest);
              setCurrent(latest);
              setUpdateAvailable(false);
              return;
            }
          }
          
          setUpdateAvailable(isGreater);
        }
      }
    })();

    timer = window.setInterval(async () => {
      const latest = await fetchVersion();
      if (latest) {
        setRemote(latest);
        const localV = currentRef.current?.version;
        setUpdateAvailable(isRemoteGreater(latest.version, localV));
      }
    }, intervalMs) as unknown as number;

    return () => {
      if (timer) window.clearInterval(timer);
    };
  }, [intervalMs]);

  const reloadNow = async () => {
    if (remote) writeStoredVersion(remote);
    try {
      const reg = await navigator.serviceWorker?.getRegistration();
      // Prefer sending message to waiting SW so it can activate
      if (reg?.waiting) {
        reg.waiting.postMessage({ type: 'SKIP_WAITING' });
        const onControllerChange = () => {
          navigator.serviceWorker?.removeEventListener('controllerchange', onControllerChange);
          window.location.reload();
        };
        navigator.serviceWorker?.addEventListener('controllerchange', onControllerChange);
        // Safety timeout
        setTimeout(() => {
          navigator.serviceWorker?.removeEventListener('controllerchange', onControllerChange);
          window.location.reload();
        }, 1500);
        return;
      }
      // Fallback: ask current controller to coordinate reload
      if (navigator.serviceWorker?.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
        setTimeout(() => window.location.reload(), 500);
      } else {
        window.location.reload();
      }
    } catch {
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
