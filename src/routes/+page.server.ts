import { screenings } from '$db/screenings';
// N.B. PageServerLoad instead of PageLoad.
import type { PageServerLoad, Actions } from './$types';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import dayjs from 'dayjs';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('America/Los_Angeles');

// export const actions = {
//   default: async ({ request }) => {
//     const data = await request.formData();
//     const searchText = data.get('q')
//     const searchStart = data.get('ds')
//     const searchEnd = data.get('de')
//     const groupBy = data.get('g')
// 
//     return { success: true };
//   },
// } satisfies Actions;

// this is where the data prop in ./+page.svelte is populated
export const load: PageServerLoad = async ({ url }) => {
  let q = `%${url.searchParams.get('q') ?? ''}`
  q = q.endsWith('%') ? q : q + '%'
  const ds = url.searchParams.get('ds') ?? dayjs().format()
  const de = url.searchParams.get('de') ?? dayjs().endOf('day').format()
  const o = url.searchParams.get('o') ?? 'showtime'

  const res = await screenings
    .select()
    .gte('showtime', ds)
    .lte('showtime', de)
    .ilike('movie', q)
    .order(o);

  return {
    screenings: res.data,
  };

  // const pipeline = [
  //   {
  //     // the $ is necessary here because.. I'm not really sure.
  //     // I guess just because it's not a key?
  //     $unwind: '$showtimes',
  //   },
  //   {
  //     $match: {
  //       'showtimes.time': {
  //         // this will be new Date().setHours(0, 0, 0, 0) for future dates
  //         $gte: dayjs().toDate(),
  //         $lte: dayjs().endOf('day').toDate(),
  //       },
  //     },
  //   },
  //   // {
  //   //   $group: {
  //   //     // I definitely might want to group by something else.
  //   //     _id: 'theater',
  //   //   },
  //   // },
  //   {
  //     $sort: {
  //       'showtimes.time': 1,
  //     },
  //   },
  //   {
  //     $project: {
  //       _id: 0,
  //       movie: 1,
  //       theater: 1,
  //       showtimes: 1,
  //     },
  //   },
  // ]

  // const data = await screenings.aggregate(pipeline).toArray()

  // // `data` in ./+page.svelte is this object.
  // // technically, apparently, it also includes data from all of its
  // // parents as well.
  // return {
  //   screenings: data,
  // }
};
