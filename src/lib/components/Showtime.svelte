<script lang="ts">
  export let theater: string;
  export let title: string;
  // export let showtime: string

  // XXX: How do you share type from component to parent?
  // interface Showing {
  //   theater: string
  //   title: string
  //   showtime: string
  // }
</script>

<dd>
  <div class="title">
    {title}
  </div>
  <div class="theater">
    {theater}
  </div>
</dd>

<style>
  dd {
    font: bold 20px/45px Helvetica, Arial, sans-serif;
    margin: 0;
    padding: 0 0 0 12px;
    overflow-wrap: break-word;
  }

  .title {
    font-size: larger;
  }

  .theater {
    color: #aaa;
    font-size: smaller;
  }

  :global(dd + dd) {
    border-top: 1px solid #ccc;
  }
</style>
