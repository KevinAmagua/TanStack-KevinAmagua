export function formatSavedAt(value?: Date | string): string {
  if (!value) return 'Fecha de guardado no disponible';

  const date = value instanceof Date ? value : new Date(value);
  if (!Number.isFinite(date.getTime())) {
    return 'Fecha de guardado no disponible';
  }

  return `Guardado: ${new Intl.DateTimeFormat('es-EC', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)}`;
}
