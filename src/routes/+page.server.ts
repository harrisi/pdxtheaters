import { screenings } from '$db/screenings'
// N.B. PageServerLoad instead of PageLoad.
import type { PageServerLoad } from './$types'

// this is where the data prop in ./+page.svelte is populated
export const load: PageServerLoad = async () => {
  let todayEnd = new Date()
  todayEnd.setHours(23, 59, 59, 999)

  const pipeline = [
    {
      // the $ is necessary here because.. I'm not really sure.
      // I guess just because it's not a key?
      $unwind: '$showtimes',
    },
    {
      $match: {
        'showtimes.time': {
          // this will be new Date().setHours(0, 0, 0, 0) for future dates
          $gte: new Date(),
          $lte: todayEnd,
        },
      },
    },
    // {
    //   $group: {
    //     // I definitely might want to group by something else.
    //     _id: 'theater',
    //   },
    // },
    {
      $sort: {
        'showtimes.time': 1,
      },
    },
    {
      $project: {
        _id: 0,
        movie: 1,
        theater: 1,
        showtimes: 1,
      },
    },
  ]

  const data = await screenings.aggregate(pipeline).toArray()

  // `data` in ./+page.svelte is this object.
  // technically, apparently, it also includes data from all of its
  // parents as well.
  return {
    screenings: data,
    newDate: new Date(),
    todayEnd,
  }
}
