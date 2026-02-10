<script lang="ts">
	import { browser } from '$app/environment';
	import { ifMathPath, routers } from '$lib/router';
	import { ipcPassword } from '$lib/stores/tabStore';
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
		CaretLeftOutline,
		CaretRightOutline,
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

	// derive buttons from routers
	let showIpcPassword = $state(false);

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
	const IPC_PASSWORD_KEY = 'asf-ui:ipc-password';

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

	onMount(() => {
		if (!browser) {
			return;
		}

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

		if (IPC_PASSWORD_KEY in localStorage) {
			$ipcPassword = localStorage.getItem(IPC_PASSWORD_KEY) ?? '';
		}
	});
</script>

<div
	class="p-2 bg-white dark:bg-gray-800 shadow-md space-x-4 px-8 py-4 top-0 sticky z-10 flex items-center opacity-90"
>
	<div class="">
		<Button color="light" size="xs">
			<BarsOutline class="me-2 h-6 w-6" />
			<h1 class="text-lg dark:text-white font-semibold">
				{$_('header.title')}
			</h1>
		</Button>
		<Dropdown simple>
			{#each routers as router}
				{#if router.path && router.page}
					<DropdownItem
						href={router.path.toLocaleLowerCase()}
						class={ifMathPath(router.path)
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

	<div class="space-x-2 md:flex hidden flex-1 items-center">
		<ButtonGroup>
			<Button color="light" size="xs" pill onclick={() => history.back()}>
				<CaretLeftOutline class="h-6 w-6" />
			</Button>
			<Button color="light" size="xs" pill onclick={() => history.forward()}>
				<CaretRightOutline class="h-6 w-6 p-0" />
			</Button>
		</ButtonGroup>
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
