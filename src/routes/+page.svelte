<script lang="ts">
	import LoadScreen from '$lib/components/LoadScreen.svelte';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';

	onMount(() => {
		location.href = '/bot-list';
	});
</script>

<div class="text-gray-800 dark:text-gray-100 flex h-full w-full flex-col">
	<div transition:fade={{ duration: 300 }} class="inset-0 absolute z-50">
		<LoadScreen />
	</div>
</div>
