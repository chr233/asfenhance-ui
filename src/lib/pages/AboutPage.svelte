<script lang="ts">
	import { PACKAGE_INFO } from '$lib/packageInfo';
	import { Card } from 'flowbite-svelte';
	import { _ } from 'svelte-i18n';
	const { name, version, author, description } = PACKAGE_INFO;
</script>

<div class="flex h-screen w-full items-center justify-center">
	<Card class="p-4 sm:p-6 md:p-8">
		<h1 class="mb-4 text-2xl font-bold">{$_('aboutPage.title')}</h1>
		<ul class="space-y-2">
			<li><b>{$_('aboutPage.project')}</b> {name}</li>
			<li><b>{$_('aboutPage.version')}</b> {version}</li>
			<li><b>{$_('aboutPage.author')}</b> {author}</li>
			<li><b>{$_('aboutPage.description')}</b> {description}</li>
		</ul>
	</Card>
</div>
