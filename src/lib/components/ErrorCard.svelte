<script lang="ts">
  import { Button, Card } from 'flowbite-svelte';

  interface Props {
    error?: string;
  }

  let { error }: Props = $props();

  const repoLink = 'https://github.com/chr233/asf-import-tools';
</script>

<div class="flex h-screen w-full items-center justify-center">
  <Card class="p-6">
    <h1 class="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">
      初始化出错, 请联系售后更新程序
    </h1>
    <p class="mb-3 text-lg text-gray-700 dark:text-gray-400">
      {error}
    </p>
    {#if repoLink}
      <Button class="w-full" href={repoLink} target="_blank">前往仓库页 / Goto Repo Page</Button>
    {/if}
  </Card>
</div>
