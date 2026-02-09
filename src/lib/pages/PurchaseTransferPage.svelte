<script lang="ts">
	import { getBotList, getCountryCode } from '$lib/api';
	import type { BotDetail } from '$lib/models/bot/GetBotsResponse';

	import { browser } from '$app/environment';
	import LabelFor from '$lib/components/LabelFor.svelte';
	import type { Result as PurchaseResult } from '$lib/models/cart/ExternalPurchaseResponse';
	import {
		Alert,
		Button,
		Radio,
		Select,
		Skeleton,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell
	} from 'flowbite-svelte';
	import { InfoCircleSolid, RefreshOutline } from 'flowbite-svelte-icons';
	import { onMount } from 'svelte';

	let ipcMessage: string = $state('');
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

	let purchaseHistory: PurchaseResult[] = $state([]);

	const paymentItems = [
		{ name: '支付宝', value: 'alipay' },
		{ name: 'PaySafeCard', value: 'paysafe' }
	];
	let selectedPayment: string = $state('alipay');

	async function reloadBots() {
		try {
			ipcLoading = true;

			botsList.length = 0;
			ipcMessage = '';

			const response = await getBotList('ASF');

			if (!response.Success) {
				console.log(response.Message);

				ipcMessage = response.Message;

				return;
			}

			botsList.length = 0;

			for (const botName in response.Result) {
				const detail = response.Result[botName];
				botsList.push(detail);
			}

			if (botSelectorItems.length > 0) {
				selectedBot = botSelectorItems.find((x) => !x.disabled)?.value || undefined;
			}
		} catch (err) {
			console.error(err);
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

			ipcMessage = '';

			const response = await getCountryCode(bot);

			if (!response.Success) {
				console.log(response.Message);

				ipcMessage = response.Message;

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
		} finally {
			ipcLoading = false;
		}
	}

	async function purchaseExternal() {
		const bot = selectedBot?.BotName;

		if (!bot) {
			countryCodeList = {};
			return;
		}

		selectedCountryCode = undefined;

		try {
			ipcLoading = true;

			ipcMessage = '';

			const response = await getCountryCode(bot);

			if (!response.Success) {
				console.log(response.Message);

				ipcMessage = response.Message;

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
			disabled={ipcLoading}
			clearable
			placeholder="选择在线机器人"
		/>
		<Button onclick={reloadBots} loading={ipcLoading}>
			<RefreshOutline class="w-4 h-4" />
		</Button>
	</div>

	<LabelFor forId="country" text="国家代码" />
	<div class="gap-3 flex">
		{#each countryCodeItems as country}
			<Radio
				id="country"
				bind:group={selectedCountryCode}
				disabled={ipcLoading}
				value={country.value}
			>
				{country.name}
			</Radio>
		{/each}
		<Button onclick={reloadBotsCountryCode} disabled={!selectedBot} loading={ipcLoading}>
			获取可用国家
		</Button>
	</div>

	<LabelFor forId="payment" text="支付方式" />
	<div class="gap-3 flex">
		{#each paymentItems as payment}
			<Radio id="payment" bind:group={selectedPayment} value={payment.value}>
				{payment.name}
			</Radio>
		{/each}
	</div>

	<Button
		class="w-full"
		onclick={reloadBotsCountryCode}
		disabled={!selectedBot}
		loading={ipcLoading}
	>
		下单
	</Button>

	<Table shadow hoverable striped>
		<TableHead>
			<TableHeadCell>机器人</TableHeadCell>
			<TableHeadCell>状态</TableHeadCell>
			<TableHeadCell>TransId</TableHeadCell>
			<TableHeadCell>支付链接</TableHeadCell>
		</TableHead>

		<TableBody>
			{#if purchaseHistory.length === 0}
				<TableBodyRow>
					<TableBodyCell colspan={6}>
						{#if ipcLoading}
							<Skeleton size="md" class="my-8" />
						{:else}
							<Alert>
								{#snippet icon()}
									<InfoCircleSolid />
								{/snippet}

								<span>无数据</span>
							</Alert>
						{/if}
					</TableBodyCell>
				</TableBodyRow>
			{:else}
				{#each purchaseHistory as history}
					<TableBodyRow>
						<TableBodyCell>{history.BotName}</TableBodyCell>
						{#if !history.PaymentUrl}
							<TableBodyCell colspan={6}>{history.Message}</TableBodyCell>
						{:else}
							<TableBodyCell>{history.Message}</TableBodyCell>
							<TableBodyCell>{history.TransId}</TableBodyCell>
							<TableBodyCell>
								<Button size="xs" href={history.PaymentUrl}>前往支付</Button>
							</TableBodyCell>
						{/if}
					</TableBodyRow>
				{/each}
			{/if}
		</TableBody>
	</Table>
</div>
