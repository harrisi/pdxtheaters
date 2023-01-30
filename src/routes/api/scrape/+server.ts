import { json, error } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { MONGODB_URI } from '$env/static/private'
import { MongoClient } from 'mongodb'
import { JSDOM } from 'jsdom'

// is this available from $db?
const client = new MongoClient(MONGODB_URI)

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

// these should probably be somewhere else
const theaters: Theater[] = [
  {
    name: 'Moreland',
    //url: 'http://morelandtheater.com',
    url: 'https://697452.formovietickets.com:2235',
    // titleSelector: '#Table2 > tbody > tr > td.rightcol > b:nth-child(5)',
    titleSelector: (document: Document) => {
      return document.querySelector('#Table2 > tbody > tr > td.rightcol > b:nth-child(5)')?.innerHTML.split('<br>')[0]
    },
    showtimeSelector: '#Table2 > tbody > tr > td.rightcol > a',
    // showtimeSelectorFn: (t: string) => {
    //   let match = t.match(/\d+:\d+[ap]/)
    //   return match ? match[0] : ''
    // }
  },

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
    await client.connect()

    // should be narrowed?
    const database = client.db('previewDB')

    let collection = database.collection<Showing>(today)

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
        await collection.insertOne(doc)
        res++
      })
      .catch(console.error)
    }

  } finally {
    await client.close()
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
    let now = new Date()
    //if (now.getHours() === 13 && now.getMinutes() >= 10 && now.getMinutes() <= 30) {
      let res = await run().catch(e => { throw error(500, e) })
      return json({ ok: 200, res })
    // } else {
    //   throw new Error(now.toString())
    // }
  } catch (err: any) {
    throw error(500, err.message)
  }
  // return json({err: 'unknown'})
}) satisfies RequestHandler

