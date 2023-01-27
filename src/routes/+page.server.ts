import { screenings } from '$db/screenings'
// N.B. PageServerLoad instead of PageLoad.
import type { PageServerLoad } from './$types'

// this is where the data prop in ./+page.svelte is populated
export const load: PageServerLoad = async () => {
  // the important thing here is the projection. Really the problem is
  // with what's being returned. The return value needs to be a POJO
  // (Plain Old JavaScript Object), sort of. see gh/rich-harris/devalue.
  const data = await screenings.find({}, {
    limit: 50,
    projection: { '_id': 0 }
  }).toArray()

  // `data` in ./+page.svelte is this object.
  // technically, apparently, it also includes data from all of its
  // parents as well.
  return {
    screenings: data,
  }
}
