// import adapter from '@sveltejs/adapter-auto';
import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/kit/vite';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://kit.svelte.dev/docs/integrations#preprocessors
  // for more information about preprocessors
  preprocess: vitePreprocess(),

  kit: {
    adapter: adapter(),
    // I like this, I think, but db/ should be in ./src/lib/server/
    // https://kit.svelte.dev/docs/server-only-modules
    alias: {
      $db: './src/lib/server/db',
      $component: './src/lib/components',
    },
  },
};

export default config;
