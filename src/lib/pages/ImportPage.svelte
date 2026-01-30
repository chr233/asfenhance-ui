<script lang="ts">
  import LabelFor from '$lib/components/LabelFor.svelte';
  import PasswordInput from '$lib/components/PasswordInput.svelte';
  import type { ImportBotsMessagePayload } from '$lib/models/ImportBotsPayload';
  import type { MaFileData } from '$lib/models/MaFileData';
  import {
    Alert,
    Button,
    Checkbox,
    Dropzone,
    Fileupload,
    Helper,
    Progressbar,
    Table,
    TableBody,
    TableBodyCell,
    TableBodyRow,
    TableHead,
    TableHeadCell,
    Textarea
  } from 'flowbite-svelte';
  import { InfoCircleSolid, UploadOutline } from 'flowbite-svelte-icons';
  import { importBots } from '$lib/api';
  import { _ } from 'svelte-i18n';

  let ipcPassword: string = $state('');

  let accountText: string = $state('');
  let accountCount: number = $derived.by(updateAccountCount);

  let selectAccountFiles: FileList | null = $state(null);
  let selectMaFiles: FileList | null = $state(null);

  let enableBot: boolean = $state(true);
  let allowFarming: boolean = $state(true);
  let allowReplace: boolean = $state(false);

  let isBusy: boolean = $state(false);

  let importResult: ImportBotsMessagePayload[] = $state([]);
  let importProcess: number = $derived.by(() => {
    if (importResult.length === 0) {
      return 0;
    }
    const processedCount = importResult.filter((bot) => bot.Processed).length;
    return Math.floor((processedCount / importResult.length) * 100);
  });

  const separatorRegex = /[,， \t]|----/;

  /**
   * 读取账号文件
   * @param file
   */
  function readAccountFromFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const content = e.target?.result as string;
      accountText = content;
    };
    reader.onerror = () => {
      alert($_('importPage.fileReadFailed'));
    };
    reader.readAsText(file);
  }

  /**
   * 拖拽账号文件导入
   */
  function onAccountFileDrop(event: DragEvent) {
    event.preventDefault();
    selectAccountFiles = event.dataTransfer?.files ?? null;
    onSelectAccounts();
  }

  /**
   * 选择账号文件导入
   */
  function onSelectAccounts() {
    if (!selectAccountFiles || selectAccountFiles.length === 0) {
      return;
    }

    const file = selectAccountFiles[0];
    readAccountFromFile(file);
  }

  /**
   * 清空选择令牌文件夹
   */
  function onClearMaFiles(event: Event) {
    selectMaFiles = null;
    event.preventDefault();
  }

  /**
   * 更新账号数量
   */
  function updateAccountCount(): number {
    if (!accountText) {
      return 0;
    }

    let count = 0;
    const lines = accountText.split('\n');

    for (const line of lines) {
      if (!line.trim()) {
        continue;
      }

      const parts = line.split(separatorRegex).filter((x) => x);
      if (parts.length >= 2) {
        count++;
      }
    }

    return count;
  }

  /**
   * 解析账号信息
   */
  async function parseAccounts(fileMap: {
    [key: string]: File;
  }): Promise<ImportBotsMessagePayload[]> {
    const lines = accountText.split('\n');
    const result: ImportBotsMessagePayload[] = [];

    for (const line of lines) {
      if (!line.trim()) {
        continue;
      }

      const parts = line.split(separatorRegex).filter((x) => x);

      if (parts.length >= 2) {
        const username = parts[0].trim();
        const password = parts[1].trim();

        const payload: ImportBotsMessagePayload = {
          Enabled: enableBot,
          Paused: !allowFarming,
          BotName: username,
          SteamLogin: username,
          SteamPassword: password,
          IdentitySecret: undefined,
          SharedSecret: undefined,
          Message: '',
          Processed: false
        };

        const fileName = username + '.mafile';
        const jsonFile = fileMap[fileName];
        if (jsonFile) {
          const json = await readJsonFile(jsonFile);
          payload.IdentitySecret = json?.identity_secret ?? undefined;
          payload.SharedSecret = json?.shared_secret ?? undefined;
        }

        result.push(payload);
      }
    }

    return result;
  }

  /**
   * 读取令牌文件
   * @param file
   */
  function readJsonFile(file: File): Promise<MaFileData | undefined> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        try {
          const content = e.target?.result as string;
          const json = JSON.parse(content) as MaFileData;
          resolve(json);
        } catch {
          resolve(undefined);
        }
      };
      reader.onerror = () => {
        resolve(undefined);
      };
      reader.readAsText(file);
    });
  }

  /**
   * 执行导入操作
   */
  async function doImport() {
    importResult = [];

    if (!accountText.trim()) {
      alert($_('importPage.needInputAccountText'));
      return;
    }

    isBusy = true;
    try {
      const fileMap: { [key: string]: File } = {};
      if (selectMaFiles) {
        for (const file of selectMaFiles) {
          const fileName = file.name.toString().toLowerCase();
          fileMap[fileName] = file;
        }
      }

      // 解析账号信息
      importResult = await parseAccounts(fileMap);

      // 按 10 个一组分批调用 importBots，顺序执行并更新每个 bot 的 Message 字段
      const batchSize = 10;
      for (let i = 0; i < importResult.length; i += batchSize) {
        const batch = importResult.slice(i, i + batchSize);
                                                  
        try {
          const response = await importBots(batch, allowReplace, ipcPassword);

          if (response?.Result && response.Success) {
            for (const botName in response.Result) {
              const payload = batch.find((b) => b.BotName === botName);

              console.log(payload, botName);
 
              if (payload) {
                var { Success, Message } = response.Result[botName];

                payload.Message =
                  Message ||
                  (Success ? $_('importPage.importSuccess') : $_('importPage.importFailed'));
                payload.Processed = true;
              }
            }
          } else {
            throw response.Message || $_('importPage.networkError');
          } 
        } catch (err: any) {
          const msg = err?.message ?? err.toString() ?? $_('importPage.unknownError');
          for (const bot of batch) {
            bot.Message = `${$_('importPage.importFailed')}: ${msg}`; 
            bot.Processed = true;
          }
        }
      }
    } finally {
      isBusy = false;
    }
  }

  function toBooleanString(value: any) {
    return value ? '✅' : '❌';
  }
</script>

<div class="space-y-4 p-4 mx-auto h-full w-full">
  <LabelFor forId="ipc" text={$_('botListPage.ipcPassword')} />
  <PasswordInput id="ipc" bind:value={ipcPassword} saveKey="asf-ui:ipc-password" />

  <!-- 账号信息输入区域 -->
  <LabelFor forId="accounts" text={$_('importPage.accountInfo')} />
  <Textarea
    id="accounts"
    bind:value={accountText}
    ondrop={onAccountFileDrop}
    class="min-h-30 p-1 dark:bg-gray-700 w-full"
    placeholder={$_('importPage.accountInfoPlaceholder')}
  />

  <Fileupload
    id="accountFile"
    class="border-2 border-dashed"
    clearable
    bind:files={selectAccountFiles}
    ondrop={onAccountFileDrop}
    onchange={onSelectAccounts}
    
  />

  <Helper class="text-sm text-orange-500 dark:text-orange-400 my-2 text-right">
    {$_('importPage.total')}
    {accountCount}
    {$_('importPage.total2')}
  </Helper>

  <!-- 令牌输入区域 -->
  <LabelFor forId="maFiles" text={$_('importPage.2faInfo')} />
  <Dropzone
    id="maFiles"
    class="p-4 h-[100px] border-2"
    bind:files={selectMaFiles}
    webkitdirectory
    multiple
    accept=".mafile"
  >
    <UploadOutline class="mb-2 h-6 w-6 text-gray-400" />

    {#if !selectMaFiles || selectMaFiles.length === 0}
      <span class="text-sm">
        {$_('importPage.dropZoneText')}
      </span>
    {:else}
      <div class="space-x-4 flex-col">
        <span class="text-sm">
          {$_('importPage.select')}
          {selectMaFiles.length}
          {$_('importPage.select2')}
        </span>
        <Button size="xs" color="light" onclick={onClearMaFiles}>
          {$_('importPage.clearSelection')}
        </Button>
      </div>
    {/if}
  </Dropzone>

  <!-- 上传选项 -->
  <LabelFor text={$_('importPage.uploadOptions')} />
  <div class="gap-3 flex flex-wrap">
    <Checkbox bind:checked={enableBot}>{$_('importPage.enableBot')}</Checkbox>
    <Checkbox bind:checked={allowFarming}>{$_('importPage.allowFarming')}</Checkbox>
    <Checkbox bind:checked={allowReplace}>{$_('importPage.allowOverride')}</Checkbox>
  </div>

  <!-- 上传 -->
  <div class="space-x-4 flex w-full items-center justify-between">
    <Button class="w-full" loading={isBusy} onclick={doImport}>{$_('importPage.start')}</Button>
    {#if importResult.length > 0}
      <span>{$_('importPage.importProcess')} {importProcess}%</span>
      <div class="flex-1">
        <Progressbar progress={importProcess} size="h-6" />
      </div>
    {/if}
  </div>

  <!-- 数据表格 -->
  <div class="section">
    <LabelFor forId="ipc" text={$_('importPage.importResult')} />
    <div class="table-wrapper">
      <Table shadow hoverable striped>
        <TableHead>
          <TableHeadCell>{$_('importPage.botName')}</TableHeadCell>
          <TableHeadCell>{$_('importPage.login')}</TableHeadCell>
          <TableHeadCell>{$_('importPage.password')}</TableHeadCell>
          <TableHeadCell>{$_('importPage.2fa')}</TableHeadCell>
          <TableHeadCell>{$_('importPage.importResult')}</TableHeadCell>
        </TableHead>

        <TableBody>
          {#if importResult.length === 0}
            <TableBodyRow>
              <TableBodyCell colspan={6}>
                <Alert color="gray">
                  {#snippet icon()}<InfoCircleSolid />{/snippet}
                  <span>{$_('importPage.noData')}</span>
                </Alert>
              </TableBodyCell>
            </TableBodyRow>
          {:else}
            {#each importResult as bot}
              <TableBodyRow>
                <TableBodyCell>{bot.BotName}</TableBodyCell>
                <TableBodyCell>{toBooleanString(bot.SteamLogin)}</TableBodyCell>
                <TableBodyCell>{toBooleanString(bot.SteamPassword)}</TableBodyCell>
                <TableBodyCell>
                  {toBooleanString(bot.IdentitySecret && bot.SharedSecret)}
                </TableBodyCell>
                <TableBodyCell>{bot.Message}</TableBodyCell>
              </TableBodyRow>
            {/each}
          {/if}
        </TableBody>
      </Table>
    </div>
  </div>
</div>
