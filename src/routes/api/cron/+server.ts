import { json, error } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { API_SECRET_KEY, MONGODB_URI } from '$env/static/private'
import { MongoClient } from 'mongodb'
import { JSDOM } from 'jsdom'

const client = new MongoClient(MONGODB_URI)

const theaters = [
  {
    name: 'Moreland',
    //url: 'http://morelandtheater.com',
    url: 'https://697452.formovietickets.com:2235',
    titleSelector: 'a.displaytitle',
    showtimeSelector: 'td.rightcol',
    showtimeSelectorFn: (t: string) => {
      let match = t.match(/\d+:\d+[ap]/)
      return match ? match[0] : ''
    }
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

    // XXX Note about above: the timezone is off.

    for (let theater of theaters) {
      fetch(theater.url)
      .then(response => response.text())
      .then(html => {
        const dom = new JSDOM(html/*, { pretendToBeVisual: true, resources: 'usable', runScripts: 'outside-only', }*/)

        const { document } = dom.window
        let movie = document.querySelector(theater.titleSelector)?.innerHTML.trim() || ''
        let showtime = document.querySelector(theater.showtimeSelector)?.innerHTML.trim() || ''
        if (theater.showtimeSelectorFn) {
          showtime = theater.showtimeSelectorFn(showtime)
        }

        let doc = {
          theater: theater.name,
          movie,
          showtime,
        }

        console.log(`theater: ${theater.name}; movie: ${movie}; showtime: ${showtime}`)

        return doc
      })
      .then(async doc => {
        console.log(doc)
        await client.connect()

        // should be narrowed?
        const database = client.db('previewDB')

        let collection = database.collection<Showing>(today)

        collection.insertOne(doc)
      })
      .catch(console.error)
    }

    // let doc: Showing = {
    //   theater: `(${passed}) theater name`,
    //   movie: `(${passed}) movie title`,
    //   showtime: new Date(),
    // }

    // let doc2: Showing = {
    //   theater: `(${passed}) other theater name`,
    //   movie: `(${passed}) other movie title`,
    //   showtime: new Date(),
    // }
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
      await run(true).catch(console.error)
      return json({a: 5, b: 6})
    } else {
      await run(false).catch(console.error)
    }
  } catch (err: any) {
    throw error(500, err.message)
  }
  return json({err: 'unknown'})
}) satisfies RequestHandler

