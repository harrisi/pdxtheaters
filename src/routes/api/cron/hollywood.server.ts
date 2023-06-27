import { screenings } from '$db/screenings';
import { JSDOM } from 'jsdom';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('America/Los_Angeles');

export async function hollywood() {
  const url = 'https://hollywoodtheatre.org/'
  const toInsert = []

  let dom = await fetch(url)
    .then((res) => res.text())
    .then((html) => {
      return new JSDOM(html, { runScripts: 'dangerously' });
    });

  const events = dom.window.document.querySelectorAll('.calendar__events__day')

  for (const row of events) {
    const date = row.getAttribute('data-calendar-date')
    for (const event of row.querySelectorAll('.calendar__events__day__event')) {
      const title = event.querySelector('h3').textContent.replace(/\s+/g, ' ').replace(/\n/g, '').trim()
      for (const time of event.querySelectorAll('.showtime-square')) {
        const t = time.textContent.trim().replace(' ', '').toLowerCase()
        toInsert.push({
          theater_name: 'Hollywood Theatre',
          movie_title: title,
          showtime: dayjs(`${date} ${t}`, 'YYYY-MM-DD hh:mma').format('YYYY-MM-DD HH:mm'),
        })
      }
    }
  }

  // console.log(toInsert)
  await screenings.insert(toInsert)
}