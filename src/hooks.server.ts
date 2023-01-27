import { start_mongo } from '$db/mongo'

start_mongo().then(() => {
  // obviously not needed, but useful for sanity.
  // I don't really think anything here should be done.
  console.log('mongo started')
}).catch(console.error)
