<script lang="ts">
	import ErrorCard from '$lib/components/ErrorCard.svelte';
	import Header from '$lib/components/Header.svelte';
	import LoadScreen from '$lib/components/LoadScreen.svelte';
	import { initLocale } from '$lib/i18n/index';
	import BotListPage from '$lib/pages/BotListPage.svelte';
	import { fade } from 'svelte/transition';
</script>

<div class="text-gray-800 dark:text-gray-100 flex h-full w-full flex-col">
	{#await initLocale()}
		<div transition:fade={{ duration: 300 }} class="inset-0 absolute z-50">
			<LoadScreen />
		</div>
	{:then}
		<Header />

		<div class="flex flex-1 overflow-hidden">
			<main class="p-6 flex-1 overflow-auto">
				<BotListPage />
			</main>
		</div>
	{:catch error}
		<ErrorCard {error} />
	{/await}
</div>
