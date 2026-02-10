<script lang="ts">
	import { browser } from '$app/environment';
	import { ipcPassword } from '$lib/stores/tabStore';
	import { Input } from 'flowbite-svelte';
	import { EyeOutline, EyeSlashOutline } from 'flowbite-svelte-icons';

	interface Props {
		id?: string;
		placeholder?: string | null;
		saveKey?: string | null;
	}

	let { id, placeholder, saveKey }: Props = $props();
	let value: string = $state($ipcPassword);
	let showPassword: boolean = $state(false);

	function saveSettings() {
		$ipcPassword = value;
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
