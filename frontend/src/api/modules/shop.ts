// src/api/modules/shop.ts
import request from '../request'
import type { ShopResponse, InventoryState } from '@qqfarm/shared-types'

/**
 * 获取商店中所有可购买的商品列表
 * @returns {Promise<ShopResponse>} 包含商品分类和商品列表
 */
export const getShopItemsApi = (): Promise<ShopResponse> => {
  return request<ShopResponse>({
    url: '/shop',
    method: 'get',
  })
}

/**
 * 购买指定商品
 * @param itemId - 要购买的物品 ID
 * @param quantity - 购买数量
 * @returns {Promise<InventoryState>} 更新后的用户背包状态
 */
export const buyItemApi = (itemId: number, quantity: number): Promise<InventoryState> => {
  return request<InventoryState>({
    url: '/shop/buy',
    method: 'post',
    data: { itemId, quantity },
  })
}
