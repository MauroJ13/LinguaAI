const timeFormatter = new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit' });

export function formatTime(timestamp: number): string {
  return timeFormatter.format(new Date(timestamp));
}

let counter = 0;
export function createId(prefix = 'msg'): string {
  counter += 1;
  return `${prefix}-${Date.now().toString(36)}-${counter}`;
}
