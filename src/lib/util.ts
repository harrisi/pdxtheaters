import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'

dayjs.extend(customParseFormat)

function parseTime(str: string) {
  if (!str) return
  str = str.toLowerCase()
  if (!str.match(/m$/i)) str += 'm'
  return dayjs(str, 'hh:mma').toDate()
}

export { parseTime }
