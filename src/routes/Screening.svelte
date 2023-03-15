<script lang='ts'>
  import { enhance } from '$app/forms'

  interface Screening {
    movie_title: string
    theater_name: string
    showtime: string
  }

  export let screening: Screening
  // showtime
  // theater
  // movie title
</script>

<div>
{screening.movie_title}
{screening.theater_name}
{screening.showtime}
</div>