// this is client.connect().db()
import db from '$db/mongo'

// this is a helper to just return a specific collection
// since I'm currently using one, I could just have ./mongo.ts return this.
// the idea is that if I had multiple collections, I could export them, also
// potentially with other options set.
export const screenings = db.collection('screenings')
