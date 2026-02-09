/*
 * @Author       : Chr_
 * @Date         : 2026-02-09 14:35:16
 * @LastEditors  : Chr_
 * @LastEditTime : 2026-02-09 14:37:50
 * @Description  :
 */

export interface ItemData {
	PackageId?: number;
	BundleId?: number;
}

export interface AddCartRequest {
	Items: ItemData[];
}
