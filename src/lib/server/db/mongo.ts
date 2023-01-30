import { MongoClient} from 'mongodb'
import type { Db } from 'mongodb'
import { MONGODB_URI } from '$env/static/private'

const client = new MongoClient(MONGODB_URI)

export function start_mongo() {
  console.log('starting mongo..')
  // this returns a promise, and it's resolved in ../routes/+page.server.ts.
  return client.connect()
}

// db name is defined in connection string
// this isn't a promise. It's a Db that has some immediately available information,
// and methods that return Promises and Cursors.
export default client.db()
