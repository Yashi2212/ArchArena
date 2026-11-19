export type IconName = 'compass' | 'learn' | 'practice' | 'studio' | 'client' | 'balance' | 'service' | 'cache' | 'database' | 'queue' | 'limit' | 'save' | 'folder' | 'undo' | 'redo' | 'reset' | 'arrow' | 'check' | 'warning' | 'error' | 'info' | 'lock' | 'close' | 'help' | 'activity' | 'cost';
const paths: Record<IconName, string> = {
  compass: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z M15.5 8.5l-2 5-5 2 2-5 5-2Z',
  learn: 'M4 5h6l2 2 2-2h6v14h-6l-2 2-2-2H4V5Z M12 7v14',
  practice: 'M4 17V7h4m8 0h4v10h-4 M9 9l3 3-3 3 M13 15h3',
  studio: 'M12 3 3 8l9 5 9-5-9-5Z M3 12l9 5 9-5 M3 16l9 5 9-5',
  client: 'M5 4h14v12H5V4Z M9 20h6 M12 16v4',
  balance: 'M4 12h5m0 0 5-6h6M9 12l5 6h6 M18 4l2 2-2 2 M18 16l2 2-2 2',
  service: 'M4 4h16v6H4V4Z M4 14h16v6H4v-6Z M7 7h1 M7 17h1',
  cache: 'M14 3 5 14h7l-2 7 9-12h-7l2-6Z',
  database: 'M4 6c0-4 16-4 16 0s-16 4-16 0Z M4 6v12c0 4 16 4 16 0V6 M4 12c0 4 16 4 16 0',
  queue: 'M4 6h11 M4 12h11 M4 18h11 M18 9l3 3-3 3',
  limit: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z M12 7v5l4 2',
  save: 'M4 3h13l4 4v14H3V3h1Z M7 3v6h10V3 M7 21v-8h10v8',
  folder: 'M3 7V4h7l2 3h9v13H3V7Z',
  undo: 'M9 5 4 10l5 5 M4 10h10a6 6 0 0 1 6 6v3',
  redo: 'm15 5 5 5-5 5 M20 10h-10a6 6 0 0 0-6 6v3',
  reset: 'M4 4v6h6 M4 10a8 8 0 1 1 0 5',
  arrow: 'M4 12h16 M14 6l6 6-6 6',
  check: 'm5 12 4 4L19 6',
  warning: 'm12 3 10 18H2L12 3Z M12 9v5 M12 17v1',
  error: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z M8 8l8 8 M16 8l-8 8',
  info: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z M12 10v7 M12 6v1',
  lock: 'M5 10h14v11H5V10Z M8 10V7a4 4 0 0 1 8 0v3 M12 14v3',
  close: 'm6 6 12 12 M18 6 6 18',
  help: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z M9 8c0-4 7-3 6 1-.5 2-3 2-3 5 M12 17v1',
  activity: 'M2 12h5l3-8 4 16 3-8h5',
  cost: 'M5 6c0-4 14-4 14 0S5 10 5 6Z M5 6v12c0 4 14 4 14 0V6 M5 12c0 4 14 4 14 0',
};

export function Icon({ name, className = '' }: { name: IconName; className?: string }) {
  return <svg className={`ui-icon ${className}`} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d={paths[name]} /></svg>;
}
