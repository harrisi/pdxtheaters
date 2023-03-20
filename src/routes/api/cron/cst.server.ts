import { screenings } from '$db/screenings';
import { JSDOM } from 'jsdom';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('America/Los_Angeles');

export async function cst() {
  const toInsert = [];
  let next = 'https://cstpdx.com/schedule/list';

  do {
    let dom = await fetch(next)
      .then((res) => res.text())
      .then((html) => {
        return new JSDOM(html, { runScripts: 'dangerously' });
      });
    const events = dom.window.document.querySelectorAll(
      '.tribe-events-calendar-list__event-row'
    );

    for (const event of events) {
      const details = event.querySelector(
        '.tribe-events-calendar-list__event-wrapper'
      );
      const date = details.querySelector('time').getAttribute('datetime');
      const time = details
        .querySelector('time')
        .textContent.split('@')[1]
        .trim()
        .replace(' ', '')
        .toLowerCase();
      const movie = details
        .querySelector('.tribe-events-calendar-list__event-title-link')
        .textContent.trim();
      toInsert.push({
        theater_name: 'Clinton Street Theater',
        movie_title: movie,
        showtime: dayjs(`${date} ${time}`, 'YYYY-MM-DD hh:mma').format(
          'YYYY-MM-DD HH:mm'
        ),
      });
    }

    next = dom.window.document.querySelector(
      '.tribe-events-c-top-bar__nav-link--next'
    ).href;
  console.log(next)
  console.log(toInsert)
  } while (next);

  // if no next page, we're done

  await screenings.insert(toInsert);
}
