<script lang="ts">
  import { browser } from '$app/environment';
  import { Button, ButtonGroup, DarkMode } from 'flowbite-svelte';
  import {
    FileImportOutline,
    GlobeOutline,
    LanguageOutline,
    MoonOutline,
    SunOutline,
    UsersGroupOutline
  } from 'flowbite-svelte-icons';
  import { onMount } from 'svelte';
  import { _, locale } from 'svelte-i18n';
  interface Props {
    activeTab?: string;
  }

  let { activeTab = $bindable('') }: Props = $props();
  let isDarkMode: boolean = $state(false);

  const buttons = [
    { id: 'bot-list', icon: UsersGroupOutline, label: 'header.botList' },
    { id: 'import', icon: FileImportOutline, label: 'header.import' },
    { id: 'about', icon: GlobeOutline, label: 'header.about' }
  ];

  /**
   * 切换页面
   * @param tabId
   */
  function selectTab(tabId: string) {
    activeTab = tabId;
  }

  /**
   * 切换语言
   */
  function toggleLang() {
    if ($locale === 'en-us') {
      $locale = 'zh-cn';
    } else {
      $locale = 'en-us';
    }

    if (browser) {
      localStorage.setItem('locale', $locale);
    }
  }

  const DARK_MODE_KEY = 'dark-mode';

  /**
   * 切换夜间模式
   */
  function toggleTheme(ev: MouseEvent) {
    const target = ev.target as HTMLElement;
    isDarkMode = target.ownerDocument.documentElement.classList.toggle('dark');

    localStorage.setItem(DARK_MODE_KEY, isDarkMode ? 'dark' : 'light');
  }

  onMount(() => {
    if (DARK_MODE_KEY in localStorage) {
      isDarkMode = localStorage.getItem(DARK_MODE_KEY) === 'dark';
      isDarkMode
        ? window.document.documentElement.classList.add('dark')
        : window.document.documentElement.classList.remove('dark');
    } else {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        window.document.documentElement.classList.add('dark');
      }
    }
  });
</script>

<div
  class="p-2 bg-white dark:bg-gray-800 shadow-md space-x-4 px-8 py-4 top-0 sticky z-10 flex items-center opacity-90"
>
  <h1 class="text-lg dark:text-white font-semibold sm:block hidden">
    {$_('header.title')}
  </h1>

  <div class="sm:block ml-auto hidden">
    <ButtonGroup>
      {#each buttons as btn}
        <Button
          pill
          color={activeTab === btn.id ? 'primary' : 'light'}
          size="xs"
          onclick={() => selectTab(btn.id)}
        >
          <btn.icon />
          <span class="ml-2">{$_(btn.label)}</span>
        </Button>
      {/each}
    </ButtonGroup>
  </div>

  <div class="sm:hidden">
    <ButtonGroup>
      {#each buttons as btn}
        <Button
          pill
          color={activeTab === btn.id ? 'primary' : 'light'}
          size="xs"
          onclick={() => selectTab(btn.id)}
        >
          <btn.icon />
        </Button>
      {/each}
    </ButtonGroup>
  </div>

  <div class="space-x-2 ml-auto flex items-center">
    <ButtonGroup>
      <Button
        color="light"
        size="xs"
        pill
        onclick={toggleTheme}
        title={$_('header.changeLanguage')}
      >
        {#if isDarkMode}
          <MoonOutline />
        {:else}
          <SunOutline />
        {/if}
      </Button>

      <Button color="light" size="xs" pill onclick={toggleLang} title={$_('header.changeLanguage')}>
        <LanguageOutline />
      </Button>
    </ButtonGroup>
  </div>
</div>
