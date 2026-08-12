export function endOfDay(value: string | Date): Date {
  const date = value instanceof Date ? new Date(value) : new Date(value)
  date.setHours(23, 59, 59, 999)
  return date
}
