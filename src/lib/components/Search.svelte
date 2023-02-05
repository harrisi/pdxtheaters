<script>
  // this should probably just be in $lib/utils or something.
  import dayjs from 'dayjs'
  // import { screenings } from '$db/screenings'

  export let groupBy = 'showtime'
  export let sortBy = 'showtime'
  export let dateStart = dayjs()
  export let dateEnd = dayjs().endOf(('day'))

  // const pipeline = [
  //   {
  //     $unwind: '$showtimes.time',
  //   },
  //   {
  //     $match: {
  //       'showtimes.time': {
  //         $gte: dateStart,
  //         $lte: dateEnd,
  //       },
  //     },
  //   },
  //   {
  //     $group: {
  //       _id: groupBy,
  //     },
  //   },
  //   {
  //     $sort: {
  //       [sortBy]: 1,
  //     },
  //   },
  // ]

  // // I don't like dealing with the details here. The alternatives are either to
  // // just expose a few set options as methods or use an ORM (Mongoose). I should
  // // probably start thinking about Mongoose.
  // // oh right, I can't actually do this. I need to make a server route to query the db.
  // screenings.aggregate(pipeline)
  
  // ?
  let searchStart = dayjs().format()
  let searchEnd = dayjs().endOf('day').format()

</script>

<div>
  <form id='searchForm'>
    <!-- this will be a bit of a hassle to deal with, but oh well. -->
    <input type='search' id='search' placeholder='What or where to watch?' />
    <!-- this input type wasn't supported by iOS until JANUARY 22 2023. That was ten days ago.
    it's been supported by Opera since 2011. To be fair, FireFox didn't support it until 2021.
    I'm not sure what alternative I have really. I think maybe search parameters up front isn't
    the best option. I've noticed a number of the theater sites have tabs for the next few days.
    I think that might be nice. I don't know. I'll have to play around with it.
    -->
    <input type='datetime-local' id='searchStart' bind:value={searchStart} min={dayjs().format('YYYY-MM-DD')} />
    <!-- I don't know if the min will work like this but searchEnd needs to be >= searchStart. -->
    <input type='datetime' id='searchEnd' bind:value={searchEnd} min={searchStart} />
    <select form='searchForm' name='selectSort'>
      <option value='time.ascending'>Time (now -&gt; later)</option>
      <option value='time.descending'>Time (later -&gt; now)</option>
      <!-- TODO -->
      <option value='theater'>Theater distance</option>
      <!-- <option value='??'>??</option> -->
    </select>
    <!-- this is obviously dumb but I'm not sure how I'd want to handle it.
    there are a lot of options for this, and it might involve cookies.
    -->
    {#each ['Moreland'] as theater}
      <input type='checkbox' value={theater}/>
    {/each}
    <input type='submit' />
  </form>
</div>

<style>
  * {
  box-sizing: border-box;
  }
</style>
