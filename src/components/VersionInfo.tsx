import { useVersionCheck } from '@/useVersion';

export default function VersionInfo() {
  const { current, remote, updateAvailable } = useVersionCheck();

  const display = current ?? remote;

  if (!display) {
    return (
      <>
        <p><strong>Budget Planner & Tracker PWA</strong></p>
        <p>Loading version...</p>
      </>
    );
  }

  return (
    <>
      <p><strong>Budget Planner & Tracker PWA</strong></p>
      <p>
        Version {display.version ?? 'Unknown'}
        {display.build ? ` — ${display.build}` : ''}
      </p>
      {display.timestamp && (
        <p className="mt-1">Built on: {new Date(display.timestamp).toLocaleString()}</p>
      )}
      {updateAvailable && remote && (
        <p className="mt-1">Update available: {remote.version}</p>
      )}
    </>
  );
}