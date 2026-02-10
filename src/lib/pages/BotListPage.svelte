<script lang="ts">
	import { getBotList, startBots, stopBots } from '$lib/api';
	import type { BotDetail } from '$lib/models/bot/GetBotsResponse';
	import { _ } from 'svelte-i18n';

	import LabelFor from '$lib/components/LabelFor.svelte';
	import { ipcPassword } from '$lib/stores/tabStore';
	import { toBooleanString } from '$lib/utils';
	import {
		Alert,
		Button,
		Input,
		Skeleton,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell
	} from 'flowbite-svelte';
	import { InfoCircleSolid } from 'flowbite-svelte-icons';
	import { onMount } from 'svelte';

	let ipcMessage: string = $state('');
	let ipcLoading: boolean = $state(true);

	let botListFilter = $state('');
	let botsList: BotDetail[] = $state([]);

	let filteredBots = $derived.by(() => {
		if (!botListFilter) {
			return botsList;
		}

		const key = botListFilter.toLowerCase();
		return botsList.filter(
			(item) =>
				!botListFilter ||
				(item.BotName && item.BotName.toLowerCase().includes(key)) ||
				(item.Nickname && item.Nickname.toLowerCase().includes(key)) ||
				(item.s_SteamID && item.s_SteamID.toString().toLowerCase().includes(key))
		);
	});

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

			console.log(response);
		} catch (err) {
			console.error(err);
		} finally {
			ipcLoading = false;
		}
	}

	async function startOrStopBot(botName: string, start: boolean = true) {
		try {
			ipcLoading = true;

			const response = start ? await startBots(botName) : await stopBots(botName);

			if (!response.Success) {
				console.error(response.Message);
				ipcMessage = response.Message;
				return;
			}

			reloadBots();
		} catch (err) {
			console.error(err);
		} finally {
			ipcLoading = false;
		}
	}

	onMount(() => {
		setTimeout(() => {
			reloadBots();
			console.log($ipcPassword);
		}, 1000);
	});
</script>

<div class="space-y-4 mx-auto h-full w-full">
	<Button class="w-full" onclick={reloadBots} loading={ipcLoading}>
		{$_('botListPage.reloadBotsList')}
	</Button>

	<LabelFor forId="filter" text={$_('botListPage.botsList')} />
	<Input
		id="filter"
		clearable
		placeholder={$_('botListPage.botListFilterPlaceholder')}
		bind:value={botListFilter}
	/>

	<Table shadow hoverable striped>
		<TableHead>
			<TableHeadCell>{$_('botListPage.botName')}</TableHeadCell>
			<TableHeadCell>{$_('botListPage.nickName')}</TableHeadCell>
			<TableHeadCell>{$_('botListPage.steamId')}</TableHeadCell>
			<TableHeadCell>{'在线'}</TableHeadCell>
			<TableHeadCell>{$_('botListPage.2fa')}</TableHeadCell>
			<TableHeadCell>{$_('botListPage.operator')}</TableHeadCell>
		</TableHead>

		<TableBody>
			{#if filteredBots.length === 0}
				<TableBodyRow>
					<TableBodyCell colspan={6}>
						{#if ipcLoading}
							<Skeleton size="md" />
						{:else if botsList.length === 0}
							<Alert color="red">
								{#snippet icon()}
									<InfoCircleSolid />
								{/snippet}

								<span>{$_('botListPage.ipcRequestFailed')}</span>
								{#if ipcMessage}
									<span>【{ipcMessage}】</span>
								{/if}
							</Alert>
						{:else}
							<Alert color="orange">
								{#snippet icon()}
									<InfoCircleSolid />
								{/snippet}

								<span>{$_('botListPage.noBotsFound')}</span>
							</Alert>
						{/if}
					</TableBodyCell>
				</TableBodyRow>
			{:else}
				{#each filteredBots as bot}
					<TableBodyRow>
						<TableBodyCell>{bot.BotName}</TableBodyCell>

						{#if bot.IsConnectedAndLoggedOn}
							<TableBodyCell>{bot.Nickname}</TableBodyCell>
							<TableBodyCell>{bot.s_SteamID}</TableBodyCell>
							<TableBodyCell>{toBooleanString(bot.IsConnectedAndLoggedOn)}</TableBodyCell>
						{:else}
							<TableBodyCell>-</TableBodyCell>
							<TableBodyCell>-</TableBodyCell>
							<TableBodyCell>-</TableBodyCell>
						{/if}
						<TableBodyCell>{toBooleanString(bot.HasMobileAuthenticator)}</TableBodyCell>

						<TableBodyCell>
							{#if bot.IsConnectedAndLoggedOn}
								<Button
									size="xs"
									color="light"
									onclick={() => {
										startOrStopBot(bot.BotName, false);
									}}
								>
									{$_('botListPage.stop')}
								</Button>
							{:else}
								<Button
									size="xs"
									color="light"
									onclick={() => {
										startOrStopBot(bot.BotName, true);
									}}
								>
									{$_('botListPage.start')}
								</Button>
							{/if}
						</TableBodyCell>
					</TableBodyRow>
				{/each}
			{/if}
		</TableBody>
	</Table>
</div>
