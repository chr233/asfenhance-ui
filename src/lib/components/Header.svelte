<script lang="ts">
	import { browser } from '$app/environment';
	import { DEFAULT_ROUTE, routers } from '$lib/router';
	import { activePage, ipcPassword } from '$lib/stores/tabStore';
	import {
		Button,
		ButtonGroup,
		Drawer,
		Dropdown,
		DropdownDivider,
		DropdownItem
	} from 'flowbite-svelte';
	import {
		BarsOutline,
		CogOutline,
		LanguageOutline,
		MoonOutline,
		SunOutline
	} from 'flowbite-svelte-icons';
	import { onMount } from 'svelte';
	import { _, locale } from 'svelte-i18n';
	import LabelFor from './LabelFor.svelte';
	import PasswordInput from './PasswordInput.svelte';

	let isDarkMode: boolean = $state(false);
	let showIpcPassword: boolean = $state(false);
	let showPageList: boolean = $state(false);
	let currentRouter = $derived.by(() => routers.find((r) => r.path === $activePage));

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

	const DARK_MODE_KEY = 'asfe-ui:dark-mode';
	const IPC_PASSWORD_KEY = 'asf-ui:ipc-password';
	const PAGE_KEY = 'asfe-ui:page';

	/**
	 * 切换夜间模式
	 */
	function toggleTheme(ev: MouseEvent) {
		const target = ev.target as HTMLElement;
		isDarkMode = target.ownerDocument.documentElement.classList.toggle('dark');

		localStorage.setItem(DARK_MODE_KEY, isDarkMode ? 'dark' : 'light');
	}

	function onOpenSetting() {
		showIpcPassword = true;
	}

	function openPageList() {
		showPageList = true;
	}

	function switchPage(page: string) {
		$activePage = page;
		localStorage.setItem(PAGE_KEY, page);
		showPageList = false;
	}

	onMount(() => {
		if (!browser) {
			return;
		}

		if (DARK_MODE_KEY in localStorage) {
			isDarkMode = localStorage.getItem(DARK_MODE_KEY) === 'dark';
			if (isDarkMode) {
				window.document.documentElement.classList.add('dark');
			} else {
				window.document.documentElement.classList.remove('dark');
			}
		} else {
			if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
				window.document.documentElement.classList.add('dark');
			}
		}

		if (IPC_PASSWORD_KEY in localStorage) {
			$ipcPassword = localStorage.getItem(IPC_PASSWORD_KEY) ?? '';
		}

		if (PAGE_KEY in localStorage) {
			const page = localStorage.getItem(PAGE_KEY);
			const router = routers.find((r) => r.path === page);
			$activePage = router?.path ?? DEFAULT_ROUTE.path;
		}
	});
</script>

<div
	class="p-2 bg-white dark:bg-gray-800 shadow-md space-x-4 px-8 py-4 top-0 sticky z-10 flex items-center opacity-90"
>
	<div class="">
		<Button color="light" size="xs" onclick={openPageList}>
			<BarsOutline class="me-2 h-6 w-6" />
			<h1 class="text-lg dark:text-white font-semibold">
				{currentRouter?.label ?? $_('header.title')}
			</h1>
		</Button>
		<Dropdown simple bind:isOpen={showPageList}>
			{#each routers as router (router.path)}
				{#if router.page}
					<DropdownItem
						onclick={() => switchPage(router.path)}
						class={router.path == $activePage
							? 'gap-2 text-primary-700 dark:text-primary-500'
							: 'gap-2'}
					>
						<div class="flex items-center">
							{#if router.icon}
								<router.icon class="me-2 h-4 w-4" />
							{/if}
							{router.label}
						</div>
					</DropdownItem>
				{:else}
					<DropdownDivider />
				{/if}
			{/each}
		</Dropdown>
	</div>

	<div class="space-x-2 sm:flex ml-auto hidden items-center">
		<ButtonGroup>
			<Button pill color="light" size="xs" onclick={onOpenSetting}>
				<CogOutline class="me-2 h-6 w-6" />设置 IPC 密码
			</Button>
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
				<LanguageOutline class="h-6 w-6" />
			</Button>
		</ButtonGroup>
	</div>

	<div class="space-x-2 sm:hidden ml-auto flex items-center">
		<ButtonGroup>
			<Button color="light" size="xs" pill onclick={onOpenSetting}>
				<CogOutline class="h-6 w-6" />
			</Button>
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
				<LanguageOutline class="h-6 w-6" />
			</Button>
		</ButtonGroup>
	</div>

	<Drawer placement="top" bind:open={showIpcPassword}>
		<form class="space-y-4 text-gray-800 dark:text-gray-100 mx-auto h-full w-full">
			<LabelFor forId="ipc" text={$_('botListPage.ipcPassword')} />
			<PasswordInput id="ipc" saveKey={IPC_PASSWORD_KEY} />
		</form>
	</Drawer>
</div>
