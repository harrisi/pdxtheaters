import { json, error } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { screenings } from '$db/screenings'
import { JSDOM } from 'jsdom'

interface Screening {
  title: string,
  showtime: string,
  theater: string,
}

interface Theater {
  name: string,
  url: string,
  titleSelector: string | string[] | Function,
  showtimeSelector: string | string[] | Function,
}

/*
 * okay how do we do this
 * I think I'll need to get different theaters on different invocations
 * every 15 minutes from 01:00(?) on, get a different theater
 * wow that would be annoying
 * I think I just need to run this job on my server.
 */

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

async function moreland() {
  try {
    let theater = 'Moreland'
    let url = 'https://697452.formovietickets.com:2235'

    let doc: Document = await fetch(url).then(res => res.text()).then(html => { return new JSDOM(html).window.document })

    let dateNodes = doc.querySelector('#Table2 > tbody > tr > td.rightcol > form > select') as HTMLSelectElement

    let paths = []

    // gets all days' urls that are available
    for (let child of dateNodes?.options ?? []) {
      paths.push(child.value)
    }

    for (let u of paths.map(path => `${url}/${path}`)) {
      // fetch each path, gets us showtimes for each day available
      fetch(u)
      .then(res => res.text())
      .then(html => {
        const dom = new JSDOM(html)
        const { document } = dom.window

        /* this is tricky because the HTML isn't great. This could be Movie, showtime, Movie, showtime,
         * or Movie, showtime, showtime, or Movie, showtime, showtime, Movie, showtime, etc.
         * it looks like I can check `showtime.nextElementSibling.nodeName === 'A'`, and if so, it's
         * a showtime for the same movie.
         */
        let rightcol = document?.querySelector('td.rightcol')?.childNodes
        // this skips over the select and whatnot. By default it's 3.
        let startOfMoviesIndex = 3
        // this is maybe a bad idea. it should also be 3 but if something changes maybe it'll help.
        rightcol?.forEach((el, i) => (el.nodeName === 'FORM') ? startOfMoviesIndex = i : null)

        // consume iterator
        let movieAndShowtimeNodes: ChildNode[] = []
        for (let [k, v] of rightcol?.entries() ?? []) {
          if (k <= 3) continue
          if (v.nodeName === 'A' || v.nodeName === 'B')
            movieAndShowtimeNodes.push(v)
        }

        // movieAndShowtimeNodes = movieAndShowtimeNodes.slice(startOfMoviesIndex)
        let movieAndShowtimes = []

        // wow what a mess
        for (let i = 0; i < movieAndShowtimeNodes.length; ) {
          // obviously this should be a type
          let curMovie = {
            theater,
            movie: '',
            showtimes: [
              {
                time: new Date(),
                url: '',
              },
            ],
          }

          // wow dumb
          curMovie.showtimes.pop()
          let curNode = movieAndShowtimeNodes[i]

          if (curNode.nodeName === 'B') {
            curMovie.movie = ((curNode as HTMLElement).textContent || '').split('\n')[0]
            i++
            do {
              let a = movieAndShowtimeNodes[i++] as HTMLAnchorElement
              curMovie.showtimes.push({
                time: parseTime(a.textContent || '') || new Date(0),
                // this is frustrating. Since I'm gathering the data in the iframe, the url is to
                // the iframe source, when I want it to go to morelandtheater.com. I don't think
                // there is a solution. Oh well.
                // also, I'm stripping the RtsPurchaseId because I can imagine that causing problems somehow.
                url: `${url}/${a.href.replace(/&RtsPurchaseId=[0-9a-f-]*/, '')}`,
              })
            } while (i < movieAndShowtimeNodes.length && movieAndShowtimeNodes[i].nodeName === 'A')
            movieAndShowtimes.push(curMovie)
          } else {
            i++
          }
        }

        return movieAndShowtimes
      }).then(async toBeInserted => {
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
        await screenings.insertMany(toBeInserted)
      }).catch(e => {
        console.error(e)
      })
    }

  } catch (e) {
    console.error(e)
  }
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
]

// MM/DD/YYY (I don't like this)
const today = new Date().toLocaleString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit', timeZone: 'America/Los_Angeles' })

interface Showing {
  movie: string
  theater: string
  showtime: string
}

// can this try running other functions and stop after 10s, returning where in the list it stopped?
// probably easier for now to just break it into multiple functions and call them all individually from GitHub.
// I also think it might be easier to use edge functions. With that I think I can just asynchronously return
// data from different functions?
async function run() {
  let res = 0

  try {
    // await client.connect()

    // should be narrowed?
    // const database = client.db('previewDB')

    // let collection = database.collection<Showing>(today)

    for (let theater of theaters) {
      await fetch(theater.url)
      .then(response => response.text())
      .then(html => {
        const dom = new JSDOM(html)
        const { document } = dom.window
        let movie: string = ''
        let showtime: string = ''

        if (typeof theater.titleSelector === 'string') {
          movie = document.querySelector(theater.titleSelector)?.innerHTML.trim() || ''
        } else if (typeof theater.titleSelector === 'object' && theater.titleSelector.length) {
          // bleh
        } else if (typeof theater.titleSelector === 'function') {
          movie = theater.titleSelector(document)
        }

        if (typeof theater.showtimeSelector === 'string') {
          showtime = document.querySelector(theater.showtimeSelector)?.innerHTML.trim() || ''
        } else if (typeof theater.showtimeSelector === 'object' && theater.showtimeSelector.length) {
          // bleh
        } else if (typeof theater.showtimeSelector === 'function') {
          showtime = theater.showtimeSelector(document)
        }

        let doc = {
          theater: theater.name,
          movie,
          showtime,
        }

        console.log(`theater: ${theater.name}; movie: ${movie}; showtime: ${showtime}`)

        return doc
      })
      // this is really silly. shouldn't be opening a new connection and inserting one by one.
      .then(async doc => {
        await screenings.insertOne(doc)
        res++
      })
        .catch(console.error)
    }

  } finally {
    // await client.close()
  }

  return res
}

export const POST = (async ({ request }) => {
  const foo = await request.json()
  console.log(JSON.stringify(foo))
  return json({a: 1, b: 2, c: foo})
}) satisfies RequestHandler

export const GET = (async () => {
  try {
    let res = await moreland().catch(e => { throw error(500, e) })
    return json({ ok: 200, res })
    // let now = new Date()
    // //if (now.getHours() === 13 && now.getMinutes() >= 10 && now.getMinutes() <= 30) {
    // let res = await run().catch(e => { throw error(500, e) })
    // return json({ ok: 200, res })
    // } else {
    //   throw new Error(now.toString())
    // }
  } catch (err: any) {
    throw error(500, err.message)
  }
  // return json({err: 'unknown'})
}) satisfies RequestHandler

