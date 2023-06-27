import { screenings } from '$db/screenings';
import { JSDOM } from 'jsdom';
import { parseTime } from '$lib/util';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('America/Los_Angeles');

export async function cinema21() {
  //try {
    const theater = 'Cinema 21';
    const url = 'https://cinema21.com';

    const movieData = await fetch(url)
      .then((res) => res.text())
      .then((html) => {
        return new JSDOM(html, { runScripts: 'dangerously' }).window.movieData
      })
      // .catch((e) => {
        // console.error(e);
        // return;
      // }) ?? new JSDOM().window;

      // console.log(movieData)

    interface Time {
      isSoldOut: boolean;
      type: string;
      time: string;
      bookingLink: string;
      attributes: [];
    }
    
    interface Movie {
      url: string;
      'image-portrait': string;
      'image-landscape': string;
      title: string;
      releaseDate: string;
      endpoint: string;
      duration: string;
      rating: string;
      director: string;
      actors: string;
      times: Time[];
    };

    // console.log(doc.querySelectorAll('script'))
    // const movies = doc.querySelectorAll('.movie-details');

    const toInsert = [];

    // console.log(movies);

    for (const date in movieData) {
      for (const movie of movieData[date]) {
        for (const time of movie.times) {
          if (!time.isSoldOut) {
            const showtime = dayjs(`${date} ${time.time}`, 'YYYY-MM-DD hh:mma').format('YYYY-MM-DD HH:mm');
            const toPush = {
              theater_name: theater,
              movie_title: movie.title,
              showtime,
            };
            // console.log(toPush)
            toInsert.push(toPush);
          }
        }
      }
    }

    // for (const detail of movies) {
    //   const title = detail.querySelector('.movie-link')?.textContent;
    //   const datetimepairs = detail.querySelectorAll('.session-row');
    //   for (const row of datetimepairs.values()) {
    //     const date =
    //       row.childNodes[0].textContent == 'Today'
    //         ? dayjs()
    //         : dayjs(row.childNodes[0].textContent);
    //     for (const time of row.childNodes[1].childNodes) {
    //       const parsed = parseTime(time.textContent ?? '') ?? dayjs();
    //       const showtime = dayjs(`${date} ${time.textContent}`).format('YYYY-MM-DD HH:mm');
    //       // const showtime = parsed
    //       //   .set('date', date.date())
    //       //   .set('month', date.month())
    //       //   .set('year', date.year())
    //       //   .format('YYYY-MM-DD HH:mm');
    //       const toPush = {
    //         theater,
    //         title,
    //         showtime,
    //       };
    //       toInsert.push(toPush);
    //       console.log(`pushing ${toPush}`);
    //     }
    //   }
    // }

    // console.log(toInsert)

    await screenings.insert(toInsert);
  // } catch (e) {
  //   console.error(e);
  // }
}
