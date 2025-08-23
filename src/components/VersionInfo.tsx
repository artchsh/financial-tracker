import { useState, useEffect } from "react";

export default function VersionInfo() {
  const [version, setVersion] = useState<{ version: string, build: string, timestamp: string } | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const tryFetch = async (path: string) => {
      try {
        const res = await fetch(path, { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (mounted) setVersion(json);
        console.log("json", json)
        return true;
      } catch {
        return false;
      }
    };

    (async () => {
      const ok = await tryFetch('/public/version.json');
      if (!ok) {
        const ok2 = await tryFetch('/public/version.json');
        if (!ok2 && mounted) setErr('Version info unavailable');
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  if (err) {
    return (
      <>
        <p><strong>Financial Tracker PWA</strong></p>
        <p>Version: Unknown</p>
        <p className="mt-1">Built with React and IndexedDB for offline use</p>
        <p className="mt-1">Works offline</p>
        <p>Mobile optimized</p>
        <p>Data stored locally</p>
        <p>{err}</p>
      </>
    );
  }

  if (!version) {
    return (
      <>
        <p><strong>Financial Tracker PWA</strong></p>
        <p>Loading version...</p>
        <p className="mt-1">Built with React and IndexedDB for offline use</p>
        <p className="mt-1">Works offline</p>
        <p>Mobile-first</p>
        <p>Data stored locally</p>
      </>
    );
  }

  return (
    <>
      <p><strong>Financial Tracker PWA</strong></p>
      <p>
        Version {version.version ?? 'Unknown'}
        {version.build ? ` — ${version.build}` : ''}
      </p>
      {version.timestamp && (
        <p className="mt-1">Built on: {new Date(version.timestamp).toLocaleString()}</p>
      )}
      <p className="mt-1">Built with React and IndexedDB for offline use</p>
      <p className="mt-1">Works offline</p>
      <p>Mobile optimized</p>
      <p>Data stored locally</p>
    </>
  );
}