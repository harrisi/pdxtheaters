import { screenings } from '$db/screenings';
import { JSDOM } from 'jsdom';
import { parseTime } from '$lib/util';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('America/Los_Angeles')

export async function moreland() {
  try {
    let theater = 'Moreland';
    let url = 'https://697452.formovietickets.com:2235';

    let doc: Document = await fetch(url)
      .then((res) => res.text())
      .then((html) => {
        return new JSDOM(html).window.document;
      });

    let dateNodes = doc.querySelector(
      '#Table2 > tbody > tr > td.rightcol > form > select'
    ) as HTMLSelectElement;

    let paths = [];

    // gets all days' urls that are available
    for (let child of dateNodes?.options ?? []) {
      paths.push(child.value);
    }

    for (let u of paths.map((path) => `${url}/${path}`)) {
      // fetch each path, gets us showtimes for each day available
      fetch(u)
        .then((res) => res.text())
        .then((html) => {
          const dom = new JSDOM(html);
          const { document } = dom.window;

          /* this is tricky because the HTML isn't great. This could be Movie, showtime, Movie, showtime,
           * or Movie, showtime, showtime, or Movie, showtime, showtime, Movie, showtime, etc.
           * it looks like I can check `showtime.nextElementSibling.nodeName === 'A'`, and if so, it's
           * a showtime for the same movie.
           */
          let rightcol = document?.querySelector('td.rightcol')?.childNodes;
          // this skips over the select and whatnot. By default it's 3.
          let startOfMoviesIndex = 3;
          // this is maybe a bad idea. it should also be 3 but if something changes maybe it'll help.
          rightcol?.forEach((el, i) =>
            el.nodeName === 'FORM' ? (startOfMoviesIndex = i) : null
          );

          // consume iterator
          let movieAndShowtimeNodes: ChildNode[] = [];
          for (let [k, v] of rightcol?.entries() ?? []) {
            if (k <= 3) continue;
            if (v.nodeName === 'A' || v.nodeName === 'B')
              movieAndShowtimeNodes.push(v);
          }

          // movieAndShowtimeNodes = movieAndShowtimeNodes.slice(startOfMoviesIndex)
          let movieAndShowtimes = [];

          // wow what a mess
          for (let i = 0; i < movieAndShowtimeNodes.length; ) {
            // obviously this should be a type
            let curMovie = {
              theater_name: theater,
              movie_title: '',
              showtime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
              //url: '',
            };

            let curNode = movieAndShowtimeNodes[i];

            if (curNode.nodeName === 'B') {
              let movie_title = (
                (curNode as HTMLElement).textContent || ''
              ).trim().split('\n')[0];
              i++;
              do {
                let a = movieAndShowtimeNodes[i++] as HTMLAnchorElement;
                let time = parseTime(a.textContent || '') || dayjs().toDate();
                // lol
                time = dayjs(time).set('date', dayjs(u.slice(-8)).get('date'));
                curMovie.showtime = time
                  .format('YYYY-MM-DD HH:mm:ss');
                // curMovie.url = `${url}/${a.href.replace(/&RtsPurchaseId=[0-9a-f-]*/, '')}`
                // curMovie.showtimes.push({
                //   time,
                //   // this is frustrating. Since I'm gathering the data in the iframe, the url is to
                //   // the iframe source, when I want it to go to morelandtheater.com. I don't think
                //   // there is a solution. Oh well.
                //   // also, I'm stripping the RtsPurchaseId because I can imagine that causing problems somehow.
                //   url: `${url}/${a.href.replace(/&RtsPurchaseId=[0-9a-f-]*/, '')}`,
                // })
                curMovie.movie_title = movie_title;
                movieAndShowtimes.push(curMovie);
                curMovie = {
                  theater_name: theater,
                  movie_title: movie_title,
                  showtime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                };
              } while (
                i < movieAndShowtimeNodes.length &&
                movieAndShowtimeNodes[i].nodeName === 'A'
              );
            } else {
              i++;
            }
          }

          return movieAndShowtimes;
        })
        .then(async (toBeInserted) => {
          // this was the start of testing if the showtime is already in mongo. It's kind of awkward
          // to deal with because the index would need to be a combination of all elements, which seems
          // bad. I think it would be better to have a hash function that takes all the data and set that
          // as the _id.
          // let docs = []
          // for(let doc of toBeInserted.values()) {
          //   docs.push(doc)
          // }
          // await screenings.find({
          // })
          // this should check if the documents already exist.
          await screenings.insert(toBeInserted); // .select().then(console.log)
          // await screenings.insertMany(toBeInserted)
        })
        .catch((e) => {
          console.error(e);
        });
    }
  } catch (e) {
    console.error(e);
  }
}
