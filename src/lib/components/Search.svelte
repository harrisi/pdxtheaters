<script lang='ts'>
  import type { ActionData } from './$types'

  export let form: ActionData

  // this should probably just be in $lib/utils or something.
  import dayjs from 'dayjs'
  import utc from 'dayjs/plugin/utc'
  import timezone from 'dayjs/plugin/timezone'
  // import { screenings } from '$db/screenings'

  dayjs.extend(utc)
  dayjs.extend(timezone)
  dayjs.tz.setDefault('America/Los_Angeles')

  export let groupBy = 'showtime'
  export let sortBy = 'showtime'
  export let dateStart = dayjs()
  export let dateEnd = dayjs().endOf(('day'))

  let dtFormat = 'YYYY-MM-DDTHH:mm'

  // ?
  let searchStart = dayjs().format(dtFormat)
  let searchEnd = dayjs().endOf('day').format(dtFormat)

</script>

<div>
  <form method='POST' action='/' id='searchForm'>
    <!-- this will be a bit of a hassle to deal with, but oh well. -->
    <input type='search' id='search' name='searchText' placeholder='What or where to watch?' />
    <!-- this input type wasn't supported by iOS until JANUARY 22 2023. That was ten days ago.
    it's been supported by Opera since 2011. To be fair, FireFox didn't support it until 2021.
    I'm not sure what alternative I have really. I think maybe search parameters up front isn't
    the best option. I've noticed a number of the theater sites have tabs for the next few days.
    I think that might be nice. I don't know. I'll have to play around with it.
    -->
    <input type='datetime-local' id='searchStart' name='searchStart' bind:value={searchStart} min={dayjs().format(dtFormat)} />
    <!-- I don't know if the min will work like this but searchEnd needs to be >= searchStart. -->
    <input type='datetime-local' id='searchEnd' name='searchEnd' bind:value={searchEnd} min={searchStart} />
    <select form='searchForm' name='searchSort'>
      <option value='time.ascending'>Time (now -&gt; later)</option>
      <option value='time.descending'>Time (later -&gt; now)</option>
      <!-- TODO -->
      <option value='theater'>Theater distance</option>
      <!-- <option value='??'>??</option> -->
    </select>
    <!-- this is obviously dumb but I'm not sure how I'd want to handle it.
    there are a lot of options for this, and it might involve cookies.
    -->
    <!-- I think the better thing to do would just be local and not local. -->
    <input type='submit' />
  </form>
</div>

<style>
  * {
  box-sizing: border-box;
  }
</style>
