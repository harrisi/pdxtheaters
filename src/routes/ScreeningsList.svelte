<script lang="ts">
  import { page } from '$app/stores';
  import Screening from './Screening.svelte';
  // @ts-ignore
  export let screenings;

  // do I $page.url.searchParams.get('o') here too? How do I keep everything ordered and whatnot?
  $: q = $page.url.searchParams.get('q'); // query
  $: ds = $page.url.searchParams.get('ds'); // date start
  $: de = $page.url.searchParams.get('de'); // date end
  $: o = $page.url.searchParams.get('o'); // order by
</script>

{#if screenings.length === 0}
  <p>Nothing to see here.</p>
{:else}
  <div>
    {#each screenings as screening (screening.id)}
      <Screening {screening} />
    {/each}
  </div>
{/if}
