<script lang="ts">
  import { browser } from '$app/environment';
  import { Input } from 'flowbite-svelte';
  import { EyeOutline, EyeSlashOutline } from 'flowbite-svelte-icons';
  import { onMount } from 'svelte';
  interface Props {
    id?: string;
    value: string;
    placeholder?: string | null;
    saveKey?: string | null;
  }

  let { id, value = $bindable(), placeholder, saveKey }: Props = $props();

  let showPassword: boolean = $state(false);

  onMount(() => {
    if (browser && saveKey) {
      const saved = localStorage.getItem(saveKey);
      if (saved) {
        value = saved;
      }
    }
  });

  function saveSettings() {
    if (browser && saveKey) {
      localStorage.setItem(saveKey, value);
    }
  }

  function switchShowPassword() {
    showPassword = !showPassword;
  }
</script>

<Input
  {id}
  type={showPassword ? 'text' : 'password'}
  {placeholder}
  bind:value
  clearable
  class="pl-10"
  oninput={saveSettings}
>
  {#snippet left()}
    <button onclick={switchShowPassword} class="pointer-events-auto">
      {#if showPassword}
        <EyeSlashOutline class="h-6 w-6" />
      {:else}
        <EyeOutline class="h-6 w-6" />
      {/if}
    </button>
  {/snippet}
</Input>
