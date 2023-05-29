const time = {
  now: (): unixSeconds => Math.floor(new Date().getTime() / 1000),
  nowExact: (): unixMilliseconds => new Date().getTime(),
  startOfDay: (): unixSeconds => {
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)
    return Math.round(startOfDay.getTime() / 1000)
  },
  endOfDay: (): unixSeconds => {
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)
    return Math.round(startOfDay.getTime() / 1000) + 86400
  },
  parseSeconds: (value: number) => ({
    hours: Math.max(Math.floor(value / 3600), 0),
    minutes: Math.max(Math.floor((value % 3600) / 60), 0),
    seconds: Math.max(Math.floor((value % 3600) % 60), 0),
  }),
  getFirstDayOfMonth: (): unixSeconds => {
    const date = new Date()
    const y = date.getFullYear()
    const m = date.getMonth()

    const firstDay = new Date(y, m, 1)
    firstDay.setHours(0, 0, 0, 0)
    return Math.round(firstDay.getTime() / 1000)
  },
  getFirstDayOfWeek: (): unixSeconds => {
    const date = new Date()
    const day = date.getDay()
    const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate() + (day === 0 ? -6 : 1) - day)
    return Math.round(monday.getTime() / 1000)
  },
  todayDate: () => {
    const startOfDay = new Date()
    return `${startOfDay.getDate()}-${getReadableMonth()}-${startOfDay.getFullYear()}`
  },
  todayDurationTime: () => {
    const startOfDay = new Date()
    return Math.round(startOfDay.getTime() / 1000 - time.startOfDay())
  },
}

function getReadableMonth(): string {
  const month = new Date().getMonth() + 1
  return month.toString().padStart(2, '0')
}

export default time
