<script lang="ts">
  import { browser } from '$app/environment';
  import '$lib/i18n';
  import { pageTitle } from '$lib/stores/tabStore';
  import { locale, waitLocale } from 'svelte-i18n';
  import '../app.css';
  import type { LayoutLoad } from './$types';

  let { children } = $props();

  export const load: LayoutLoad = async () => {
    if (browser) {
      $locale = window.navigator.language.toLowerCase();
    } else {
      $locale = 'zh-cn';
    }
    await waitLocale();
  };
</script>

<svelte:head>
  <title>{$pageTitle}</title>
</svelte:head>

{@render children?.()}
