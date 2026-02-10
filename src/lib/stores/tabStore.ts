/*
 * @Author       : Chr_
 * @Date         : 2025-08-06 23:43:32
 * @LastEditors  : Chr_
 * @LastEditTime : 2026-02-10 19:05:15
 * @Description  :
 */
import { writable } from 'svelte/store';

export const pageTitle = writable<string>('ASFEnhance UI');
export const ipcPassword = writable<string>('');
export const activePage = writable<string>('bot-list');
