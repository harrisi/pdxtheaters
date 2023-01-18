<script lang='ts'>
  import List from './List.svelte'
  import Showtime from './Showtime.svelte'

  interface S {
    theater: string
    title: string
    showtime: string
  }

  let showtimes: S[] = []

  let theaters = [
    'Moreland',
    'Cinemagic',
    'Oak Grove 8',
    'Joy Cinema',
    `McMenamin's Kennedy School`,
    'Living Room',
    'Cinema 21',
    'Laurelhurst',
  ]

  let titles = [
    'Avatar: The Way of Water',
    'M3GAN',
    'Puss in Boots: The Last Wish',
    'A Man Called Otto',
    'Missing',
    'Plane',
    'House Party',
    'The Whale',
    'Black Panther: Wakanda Forever',
  ]

  let times = [
    '1:00pm',
    '2:30pm',
    '3:00pm',
    '4:30pm',
    '5:00pm',
    '6:00pm',
    '7:00pm',
    '8:00pm',
    '9:00pm',
    '10:30pm',
  ]

  for (let theater of theaters) {
    for (let title of titles) {
      for (let time of times) {
        if (Math.random() > 0.1) continue

        let showing = {
          theater,
          title,
          showtime: time,
        }

        showtimes.push(showing)
      }
    }
  }

  const dateSort = (a: string, b: string) => Date.parse(`1970/01/01 ${a.slice(0, -2)} ${a.slice(-2)}`) -
      Date.parse(`1970/01/01 ${b.slice(0, -2)} ${b.slice(-2)}`)

</script>

<List>
  {#each Array.from(new Set(showtimes.map(el => el.showtime))).sort(dateSort) as showtime}
      <dt>{showtime}</dt>
      {#each showtimes.filter(el => el.showtime == showtime) as { title, theater }}
      <Showtime {title} {theater} />
    {/each}
  {/each}
</List>

<style>
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
