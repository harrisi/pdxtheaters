import { json, error } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { API_SECRET_KEY, MONGODB_URI } from '$env/static/private'
import { MongoClient, ServerApiVersion } from 'mongodb'

const client = new MongoClient(MONGODB_URI)

async function run() {
  try {
    await client.connect()

    // should be narrowed?
    const database = client.db('previewDB')

    // XXXX-XX-XX
    const today = new Date().toLocaleString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit', timeZone: 'America/Los_Angeles' })

    interface Showing {
      movie: string
      theater: string
      showtime: Date
    }

    const collection = database.collection<Showing>(today)

    const timeOpts = {
      hour: 'numeric',
      minute: 'numeric',
    }

    // scrape sites to populate showtimes
    // for (let theater in theaters) {

    // }

    let doc: Showing = {
      theater: 'theater name',
      movie: 'movie title',
      showtime: new Date(),
    }

    let doc2: Showing = {
      theater: 'other theater name',
      movie: 'other movie title',
      showtime: new Date(),
    }

    await collection.insertMany([doc, doc2])

    // const docCount = await collection.countDocuments({})
  } finally {
    await client.close()
  }
}

export const POST = (async ({ request }) => {
  const foo = await request.json()
  console.log(JSON.stringify(foo))
  return json({a: 1, b: 2, c: foo})
}) satisfies RequestHandler

export const GET = (({ request }) => {
  try {
    const auth = request.headers.get('Authorization')
    if (auth === `Bearer ${API_SECRET_KEY}`) {
      run().catch(console.error)
      return json({a: 5, b: 6})
    }
  } catch (err: any) {
    throw error(500, err.message)
  }
  return json({err: 'unknown'})
}) satisfies RequestHandler

