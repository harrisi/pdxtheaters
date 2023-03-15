import dayjs, { Dayjs } from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone)
dayjs.tz.setDefault('America/Los_Angeles')

export function parseTime(str: string) {
  if (!str) return;
  str = str.toLowerCase();
  if (!str.match(/m$/i)) str += 'm';
  return dayjs(str, 'hh:mma');
}