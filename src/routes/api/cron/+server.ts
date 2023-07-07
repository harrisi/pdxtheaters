import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { screenings } from '$db/screenings';
import { JSDOM } from 'jsdom';
import { moreland } from './moreland.server';
import { laurelhurst } from './laurelhurst.server';
import { studioone } from './studioone.server';
import { cinema21 } from './cinema21.server'
import { cinemagic } from './cinemagic.server'
import { cst } from './cst.server'
import { hollywood } from './hollywood.server'

interface Theater {
  name: string;
  url: string;
  titleSelector: string | string[] | Function;
  showtimeSelector: string | string[] | Function;
}

// these should probably be somewhere else
const theaters: Theater[] = [
  // this is really annoying. the mcmenamins site uses javascript to show stuff but the nodes should still be there
  // is it updating the dom after the whole document is downloaded? or after it's interacted with?
  // I don't really get it because just getting the page with curl gives me what I need.
  {
    name: 'McMenamins Bagdad',
    url: 'https://mcmenamins.com/bagdad-theater-pub',
    titleSelector: 'h4.uk-margin-bottom-remove',
    showtimeSelector: 'div > div.uk-width-1-4 > button',
  },

  // {
  //   name: 'Laurelhurst',
  //   url: 'https://laurelhursttheater.com',
  //   titleSelector: (doc: Document) => {
  //     let movies = doc.querySelector('#movieListingC')
  //     let children = movies?.children
  //     for (let i = 0; i < (children?.length ?? 0); i++) {
  //       let m: Showing = { movie: '', theater: 'Laurelhurst', showtime: ''}
  //       let child = children?.item(i)
  //       if (child?.hasAttribute('data-title')) {
  //         m.movie = child.getAttribute('data-title') || ''
  //         let showtimes = child.querySelector('div.movieListing_showtimes')
  //         let schildren = showtimes?.children
  //         for (let j = 0; j < (schildren?.length ?? 0); j++) {
  //           let schild = schildren?.item(j)
  //           if (schild?.hasAttribute('data-showtimetext')) {
  //             m.showtime = child.getAttribute('data-showtimetext') || ''
  //           }
  //         }
  //       }
  //     }
  //   },
  //   showtimeSelector: (doc: Document) => {
  //     return doc.body.innerText
  //   },
  // },

  // {
  //   name: 'Living Room',
  //   url: 'https://livingroomtheater.com',
  //   titleSelector: (doc: Document) => {
  //     return doc.body.innerText
  //   },
  // },
];

// can this try running other functions and stop after 10s, returning where in the list it stopped?
// probably easier for now to just break it into multiple functions and call them all individually from GitHub.
// I also think it might be easier to use edge functions. With that I think I can just asynchronously return
// data from different functions?
async function run() {
  let res = 0;

  try {
    // await client.connect()

    // should be narrowed?
    // const database = client.db('previewDB')

    // let collection = database.collection<Showing>(today)

    for (let theater of theaters) {
      await fetch(theater.url)
        .then((response) => response.text())
        .then((html) => {
          const dom = new JSDOM(html);
          const { document } = dom.window;
          let movie: string = '';
          let showtime: string = '';

          if (typeof theater.titleSelector === 'string') {
            movie =
              document.querySelector(theater.titleSelector)?.innerHTML.trim() ||
              '';
          } else if (
            typeof theater.titleSelector === 'object' &&
            theater.titleSelector.length
          ) {
            // bleh
          } else if (typeof theater.titleSelector === 'function') {
            movie = theater.titleSelector(document);
          }

          if (typeof theater.showtimeSelector === 'string') {
            showtime =
              document
                .querySelector(theater.showtimeSelector)
                ?.innerHTML.trim() || '';
          } else if (
            typeof theater.showtimeSelector === 'object' &&
            theater.showtimeSelector.length
          ) {
            // bleh
          } else if (typeof theater.showtimeSelector === 'function') {
            showtime = theater.showtimeSelector(document);
          }

          let doc = {
            theater: theater.name,
            movie,
            showtime,
          };

          return doc;
        })
        // this is really silly. shouldn't be opening a new connection and inserting one by one.
        .then(async (doc) => {
          await screenings.insert(doc);
          // await screenings.insertOne(doc)
          res++;
        })
        .catch(console.error);
    }
  } finally {
    // await client.close()
  }

  return res;
}

export const GET = (async ({url}) => {
  const theaters = url.searchParams.get('theater').split(',')
  try {
    for (let theater of theaters) {
      switch (theater) {
        case 'moreland':
          moreland().catch((e) => {
          throw error(500, e);
        });
        break;
        case 'laurelhurst':
          laurelhurst().catch((e) => {
          throw error(500, e);
        });
        break;
        case 'studioone':
          studioone().catch((e) => {
          throw error(500, e);
        });
        break;
        case 'cinema21':
          cinema21().catch((e) => {
          throw error(500, e);
        });
        break;
        case 'cinemagic':
          cinemagic().catch((e) => {
          throw error(500, e);
        });
        break;
        case 'cst':
          cst().catch((e) => {
          throw error(500, e);
        });
        break;
        case 'hollywood':
          hollywood().catch((e) => {
          throw error(500, e);
        });
        break;
        // should return something better
        default:
          throw error(500, 'no theater')
      }
      return json({ ok: 200 });
    }
  } catch (err: any) {
    throw error(500, err.message);
  }
}) satisfies RequestHandler;
