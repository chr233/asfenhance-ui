<script lang="ts">
	import { addCart, clearCart, getBotList, getCountryCode, purchaseTransRegion } from '$lib/api';
	import type { BotDetail } from '$lib/models/bot/GetBotsResponse';

	import { browser } from '$app/environment';
	import LabelFor from '$lib/components/LabelFor.svelte';
	import type { ItemData as CartItems } from '$lib/models/cart/AddCartRequest';
	import type { Result as PurchaseResult } from '$lib/models/cart/ExternalPurchaseResponse';
	import {
		Alert,
		Button,
		Helper,
		Radio,
		Select,
		Skeleton,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell,
		Textarea,
		Tooltip
	} from 'flowbite-svelte';
	import { InfoCircleSolid, RefreshOutline } from 'flowbite-svelte-icons';
	import { onDestroy, onMount } from 'svelte';

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

	let inputCartInfo: string = $state('');

	onMount(() => {
		if (!browser) return;

		window.addEventListener('close', saveLocation);
		inputCartInfo = localStorage.getItem('cart') ?? '';

		setTimeout(reloadBots, 1000);
	});

	onDestroy(() => {
		saveLocation();
	});

	function saveLocation() {
		localStorage.setItem('cart', inputCartInfo);
	}

	// 刷新机器人列表
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
				selectedBot = botSelectorItems.find((x) => !x.disabled)?.value || undefined;
			}
		} catch (err) {
			console.error(err);
			alert(err);
		} finally {
			ipcLoading = false;
		}
	}

	// 刷新国家代码
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

	// 解析添加购物车
	async function parseAddCart() {
		const bot = selectedBot?.BotName;
		const input = inputCartInfo;

		if (!bot || !input) {
			alert('购物车内容为空');
			return;
		}

		const regFull = new RegExp(/(app|a|bundle|b|sub|s)\/(\d+)/);
		const regShort = new RegExp(/^([\s]*|)(\d+)/);

		const lines = input.split('\n');

		const cartItems: CartItems[] = [];

		for (let line of lines) {
			if (line.trim() === '') {
				continue;
			}

			const match = line.match(regFull) ?? line.match(regShort);
			if (!match) {
				continue;
			}

			let type = match[1];
			const strId = match[2];
			const itemId = parseInt(strId);
			if (itemId !== itemId) {
				continue;
			}

			switch (type.toLowerCase()) {
				case '':
				case 'sub':
					type = 'sub';
					cartItems.push({ PackageId: itemId });
					break;
				case 'b':
				case 'bundle':
					type = 'bundle';
					cartItems.push({ BundleId: itemId });
					break;
				default:
					continue;
			}
		}

		if (cartItems.length === 0) {
			alert('有效的购物车内容为空');
			return;
		}

		try {
			ipcLoading = true;

			await clearCart(bot);

			const response = await addCart(bot, { Items: cartItems });

			if (!response.Success) {
				console.log(response.Message);
				alert(response.Message);

				return;
			}
		} catch (err) {
			console.error(err);
			alert(err);
		} finally {
			ipcLoading = false;
		}
	}

	// 下单
	async function purchase() {
		const bot = selectedBot?.BotName;
		const code = selectedCountryCode;
		const payment = selectedPayment;

		if (!bot || !code || !payment) {
			return;
		}

		try {
			ipcLoading = true;

			const response = await purchaseTransRegion(bot, code, payment);

			if (!response.Success) {
				console.log(response.Message);

				purchaseHistory.push({
					BotName: bot,
					Message: response?.Message || '网络错误'
				});

				return;
			} else {
				purchaseHistory.push({
					...response.Result,
					BotName: bot,
					Message: response?.Message
				});
			}
		} catch (err) {
			console.error(err);
			alert(err);
		} finally {
			ipcLoading = false;
		}
	}
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
		<Button color="light" onclick={reloadBots} loading={ipcLoading}>
			<RefreshOutline class="w-4 h-4" />
		</Button>
	</div>

	<LabelFor forId="country" text="国家代码" />
	<div class="gap-3 flex">
		{#each countryCodeItems as country (country.value)}
			<Radio
				id="country"
				bind:group={selectedCountryCode}
				disabled={ipcLoading}
				value={country.value}
			>
				{country.name}
			</Radio>
		{/each}
		<Button
			color="light"
			onclick={reloadBotsCountryCode}
			disabled={!selectedBot}
			loading={ipcLoading}
		>
			获取可用国家
		</Button>
	</div>

	<LabelFor forId="payment" text="支付方式" />
	<div class="gap-3 flex">
		{#each paymentItems as payment (payment.value)}
			<Radio id="payment" bind:group={selectedPayment} value={payment.value}>
				{payment.name}
			</Radio>
		{/each}
	</div>

	<LabelFor forId="cart" text="设置购物车 (可选)" />
	<Textarea id="cart" rows={3} bind:value={inputCartInfo}>
		{#snippet footer()}
			<div class="gap-3 flex items-center">
				<Helper>一行一个, 支持 subId 或者 bundleId, 例如 s/12345 或者 b/12345</Helper>
				<Button
					class="ml-auto"
					color="light"
					onclick={parseAddCart}
					disabled={!selectedBot}
					loading={ipcLoading}
				>
					添加
				</Button>
			</div>
		{/snippet}
	</Textarea>

	<Button class="w-full" onclick={purchase} disabled={!selectedBot} loading={ipcLoading}>
		下单
	</Button>

	<Table shadow hoverable striped>
		<TableHead>
			<TableHeadCell>机器人</TableHeadCell>
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
				{#each purchaseHistory as history, i (i)}
					<TableBodyRow>
						<TableBodyCell>{history.BotName}</TableBodyCell>
						{#if !history.PaymentUrl}
							<TableBodyCell colspan={6}>{history.Message}</TableBodyCell>
						{:else}
							<TableBodyCell>{history.TransId}</TableBodyCell>
							<TableBodyCell>
								<div class="gap-3 flex">
									<Button size="xs" color="light" target="_blank" href={history.PaymentUrl}
										>前往支付</Button
									>
									<Tooltip type="auto" placement="bottom">{history.PaymentUrl}</Tooltip>
								</div>
							</TableBodyCell>
						{/if}
					</TableBodyRow>
				{/each}
			{/if}
		</TableBody>
	</Table>
</div>
