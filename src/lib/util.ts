function parseTime(str: string) {
  if (!str) return
    let time = str.match(/^(\d+)(:(\d\d))?\s*((a|(p))m?)?$/i)
  if (!time) return
    let hours = parseInt(time[1], 10)
  hours += (hours < 12 && time[6]) ? 12 : 0
  let minutes = parseInt(time[3], 10)
  let d = new Date()
  d.setHours(hours, minutes, 0, 0)
  return d
}

export { parseTime }
