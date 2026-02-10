<script lang="ts">
	import { getBotList, getCountryCode } from '$lib/api';
	import type { BotDetail } from '$lib/models/bot/GetBotsResponse';

	import { browser } from '$app/environment';
	import LabelFor from '$lib/components/LabelFor.svelte';
	import { Button, Card, Radio, Select } from 'flowbite-svelte';
	import { RefreshOutline } from 'flowbite-svelte-icons';
	import { onMount } from 'svelte';

	let ipcLoading: boolean = $state(true);

	let botsList: BotDetail[] = $state([]);
	let botSelectorItems = $derived.by(() => {
		const filteredBots = botsList?.map((x) => {
			const name = `${x.BotName} | ${x.Nickname} | ${x.s_SteamID}`;
			return { name, value: x, disabled: !x.IsConnectedAndLoggedOn };
		});

		if (!filteredBots || filteredBots.length === 0) {
			return [{ name: '--- 无在线机器人 ---', disabled: true, value: null }];
		} else {
			return filteredBots;
		}
	});
	let selectedBot: BotDetail | undefined = $state();

	let countryCodeList: Record<string, string> = $state({});
	let countryCodeItems = $derived.by(() => {
		const entries = Object.entries(countryCodeList ?? {});
		const items = entries
			.filter((x) => x[0] !== 'help')
			.map(([key, value]) => ({ name: value, value: key }));

		if (!items || items.length === 0) {
			return [];
		} else {
			return items;
		}
	});
	let selectedCountryCode: string | undefined = $state();

	const paymentItems = [
		{ name: '支付宝', value: 'alipay' },
		{ name: 'PaySafeCard', value: 'paysafe' }
	];
	let selectedPayment: string | undefined = $state();

	async function reloadBots() {
		try {
			ipcLoading = true;

			botsList.length = 0;

			const response = await getBotList('ASF');

			if (!response.Success) {
				console.log(response.Message);
				alert(response.Message);
				return;
			}

			botsList.length = 0;

			for (const botName in response.Result) {
				const detail = response.Result[botName];
				botsList.push(detail);
			}

			if (botSelectorItems.length > 0) {
				selectedBot = botsList[0];
			}
		} catch (err) {
			console.error(err);
			alert(err);
		} finally {
			ipcLoading = false;
		}
	}

	async function reloadBotsCountryCode() {
		const bot = selectedBot?.BotName;

		if (!bot) {
			countryCodeList = {};
			return;
		}

		selectedCountryCode = undefined;

		try {
			ipcLoading = true;

			const response = await getCountryCode(bot);

			if (!response.Success) {
				console.log(response.Message);
				alert(response.Message);
				return;
			}

			for (const botName in response.Result) {
				if (botName === bot) {
					countryCodeList = response.Result[botName].rgUserCountryOptions;
					break;
				}
			}

			const entries = Object.entries(countryCodeList ?? {}).filter(([k]) => k !== 'help');
			if (entries.length > 0) {
				selectedCountryCode = entries[0][0];
			}
		} catch (err) {
			console.error(err);
			alert(err);
		} finally {
			ipcLoading = false;
		}
	}

	onMount(() => {
		if (!browser) {
			return;
		}

		setTimeout(() => {
			reloadBots();
		}, 1000);
	});
</script>

<div class="space-y-4 mx-auto h-full w-full">
	<LabelFor forId="botList" text="机器人" />
	<div class="gap-3 flex">
		<Select
			id="botList"
			bind:value={selectedBot}
			items={botSelectorItems}
			placeholder="选择在线机器人"
			clearable
		/>
		<Button onclick={reloadBots} loading={ipcLoading}>
			<RefreshOutline class="w-4 h-4" />
		</Button>
	</div>

	<Card>ToDo</Card>

	<Button
		class="w-full"
		onclick={reloadBotsCountryCode}
		disabled={!selectedBot}
		loading={ipcLoading}
	>
		下单
	</Button>
</div>
