import { screenings } from '$db/screenings';
// N.B. PageServerLoad instead of PageLoad.
import type { PageServerLoad, Actions } from './$types';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import dayjs from 'dayjs';
import { supabase } from '$db/supabase';

dayjs.extend(utc);
dayjs.extend(timezone);

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
  const ds = url.searchParams.get('ds') ?? dayjs().tz('America/Los_Angeles').format('YYYY-MM-DD HH:mm')
  const de = url.searchParams.get('de') ?? dayjs().tz('America/Los_Angeles').endOf('day').format('YYYY-MM-DD HH:mm')
  const o = url.searchParams.get('o') ?? 'showtime'

  console.log(q)
  console.log(ds)
  console.log(de)

  const res = await supabase.from('screenings')
    .select()
    .gte('showtime', ds)
    .lte('showtime', de)
    .ilike('movie_title', q)
    .order('showtime');


  return {
    screenings: res.data,
  };

};
