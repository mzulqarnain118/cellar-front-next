export const isLeapYear = (year: number) => year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0)

export const is21OrOlder = (year: number, month: number, day: number) =>
  new Date(year + 21, month - 1, day) <= new Date()

export const MAX_DAYS: Record<string, number> = {
  '01': 31,
  '02': 28,
  '03': 31,
  '04': 30,
  '05': 31,
  '06': 30,
  '07': 31,
  '08': 31,
  '09': 30,
  '10': 31,
  '11': 30,
  '12': 31,
}

export const MONTH_MAP: Record<string, string> = {
  '01': 'January',
  '02': 'February',
  '03': 'March',
  '04': 'April',
  '05': 'May',
  '06': 'June',
  '07': 'July',
  '08': 'August',
  '09': 'September',
  '10': 'October',
  '11': 'November',
  '12': 'December',
}
