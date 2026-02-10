<script lang="ts">
	import { addCart, clearCart, getBotList, purchaseInternal } from '$lib/api';
	import type { BotDetail } from '$lib/models/bot/GetBotsResponse';

	import { browser } from '$app/environment';
	import LabelFor from '$lib/components/LabelFor.svelte';
	import type { ItemData as CartItems } from '$lib/models/cart/AddCartRequest';
	import type { OnlyPurchaseResponse as PurchaseResult } from '$lib/models/cart/InternalPurchaseResponse';
	import { toBooleanString } from '$lib/utils';
	import {
		Alert,
		Button,
		Helper,
		Select,
		Skeleton,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell,
		Textarea
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

	let purchaseHistory: PurchaseResult[] = $state([]);

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

		if (!bot) {
			alert('请选择机器人');
			return;
		}

		try {
			ipcLoading = true;

			const response = await purchaseInternal(bot);
			const result = response?.Result[bot];

			if (!response.Success || !result) {
				console.log(response.Message);

				purchaseHistory.push({
					Success: false,
					BotName: bot,
					Message: response?.Message || '网络错误',
					Cost: '-1'
				});

				return;
			} else {
				purchaseHistory.push({
					...result,
					BotName: bot,
					Message: response?.Message
				});
			}

			console.log(purchaseHistory);
		} catch (err) {
			console.error(err);
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
			<TableHeadCell>状态</TableHeadCell>
			<TableHeadCell>花费</TableHeadCell>
			<TableHeadCell>余额变动</TableHeadCell>
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
						{#if history.Cost === '-1'}
							<TableBodyCell colspan={6}>{history.Message}</TableBodyCell>
						{:else}
							<TableBodyCell>{toBooleanString(history.Success)}</TableBodyCell>
							<TableBodyCell>{history.Cost}</TableBodyCell>
							<TableBodyCell>{`${history.BalancePrev} -> ${history.BalanceNow}`}</TableBodyCell>
						{/if}
					</TableBodyRow>
				{/each}
			{/if}
		</TableBody>
	</Table>
</div>
