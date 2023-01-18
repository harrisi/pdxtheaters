import { json, error } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { API_SECRET_KEY, MONGODB_URI } from '$env/static/private'
import { MongoClient } from 'mongodb'
import { JSDOM } from 'jsdom'

const client = new MongoClient(MONGODB_URI)

interface Theater {
  name: string,
  url: string,
  titleSelector: string | Function,
  showtimeSelector: string | Function,
}

// these should probably be somewhere else
const theaters: Theater[] = [
  {
    name: 'Moreland',
    //url: 'http://morelandtheater.com',
    url: 'https://697452.formovietickets.com:2235',
    titleSelector: 'a.displaytitle',
    showtimeSelector: 'td.rightcol',
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
  //   titleSelector: 'foo',
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

async function run() {
  try {
    for (let theater of theaters) {
      fetch(theater.url)
      .then(response => response.text())
      .then(html => {
        const dom = new JSDOM(html)
        const { document } = dom.window
        let movie: string = ''
        let showtime: string = ''

        if (typeof theater.titleSelector === 'string') {
          movie = document.querySelector(theater.titleSelector)?.innerHTML.trim() || ''
        } else if (typeof theater.titleSelector === 'function') {
          movie = theater.titleSelector(document)
        }

        if (typeof theater.showtimeSelector === 'string') {
          showtime = document.querySelector(theater.showtimeSelector)?.innerHTML.trim() || ''
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
        await client.connect()

        // should be narrowed?
        const database = client.db('previewDB')

        let collection = database.collection<Showing>(today)

        collection.insertOne(doc)
      })
      .catch(console.error)
    }

  } finally {
    await client.close()
  }
}

export const POST = (async ({ request }) => {
  const foo = await request.json()
  console.log(JSON.stringify(foo))
  return json({a: 1, b: 2, c: foo})
}) satisfies RequestHandler

export const GET = (async ({ request }) => {
  try {
    const auth = request.headers.get('Authorization')
    if (auth === `Bearer ${API_SECRET_KEY}`) {
      await run().catch(console.error)
      return json({a: 5, b: 6})
    } else {
      return json({auth: auth?.slice(0,auth?.length/2), headers: [...request.headers]})
    }
  } catch (err: any) {
    throw error(500, err.message)
  }
  // return json({err: 'unknown'})
}) satisfies RequestHandler

