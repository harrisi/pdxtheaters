<script lang='ts'>
  import List from '$component/List.svelte'
  import Showtime from '$component/Showtime.svelte'
  import Search from '$component/Search.svelte'
  import utc from 'dayjs/plugin/utc'
  import timezone from 'dayjs/plugin/timezone'
  import dayjs from 'dayjs'
  dayjs.extend(utc)
  dayjs.extend(timezone)

  dayjs.tz.setDefault('America/Los_Angeles')

  // the below is importing the PageData type which is generated by SvelteKit
  // (https://kit.svelte.dev/docs/types#generated-types).
  import type { PageData } from './$types'
  // https://kit.svelte.dev/docs/load
  // I'm not really sure why it needs to be `export let`. I guess this page is
  // technically a component that SvelteKit is populating data for as a prop?
  export let data: PageData

  // this is a reactive statement to update screenings whenever data updates.
  // in my application I don't think it's necessary.
  $: ({ screenings } = data)

  // interface Showing {
  //   theater: string,
  //   movie: string,
  //   date: string,
  //   showtimes: string[],
  // }
</script>

<!-- this needs to be changed. -->

<Search></Search>

<List>
  {#each screenings.data as screening}
    <dt>{dayjs(screening.showtime).format('h:mma')}</dt>
    <Showtime title={screening.movie_title} theater={screening.theater_name} />
  {/each}
</List>

<style>
  /* this should be in a global css file or something */
  * {
    box-sizing: border-box;
  }

  dt {
    background: #b8c1c8;
    border-bottom: 1px solid #989ea4;
    border-top: 1px solid #717d85;
    color: #fff;
    font: bold 18px/21px Helvetica, Arial, sans-serif;
    margin: 0;
    padding: 2px 0 0 12px;
    position: sticky;
    top: -1px;
  }
</style>
