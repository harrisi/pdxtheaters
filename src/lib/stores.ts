import { writable } from 'svelte/store';

interface Showtimes {
  theater: string;
  movie: string;
  showtime: Date;
}

export const showtimes = writable<Showtimes[]>();
