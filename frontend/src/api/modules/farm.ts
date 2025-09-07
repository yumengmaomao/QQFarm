// src/api/modules/farm.ts
import request from '../request'
import type { FarmStateResponse, PlotState, ApiResponse } from '@qqfarm/shared-types'

/**
 * 获取当前用户的完整农场状态，包括所有地块信息
 * @returns {Promise<FarmStateResponse>} 包含地块列表和上次更新时间
 */
export const getFarmStateApi = (): Promise<FarmStateResponse> => {
  return request<FarmStateResponse>({
    url: '/farm',
    method: 'get',
  })
}

/**
 * 在指定地块上种植作物
 * @param plotIndex - 地块的索引 (从 0 开始)
 * @param itemId - 要种植的种子的物品 ID
 * @returns {Promise<PlotState>} 更新后的地块状态
 */
export const plantApi = (plotIndex: number, itemId: number): Promise<PlotState> => {
  return request<PlotState>({
    url: '/farm/plant',
    method: 'post',
    data: { plotIndex, itemId },
  })
}

/**
 * 收获指定地块上的作物
 * @param plotIndex - 地块的索引
 * @returns {Promise<PlotState>} 更新后的地块状态
 */
export const harvestApi = (plotIndex: number): Promise<PlotState> => {
  return request<PlotState>({
    url: '/farm/harvest',
    method: 'post',
    data: { plotIndex },
  })
}

/**
 * 给指定地块的作物浇水
 * @param plotIndex - 地块的索引
 * @returns {Promise<PlotState>} 更新后的地块状态
 */
export const waterApi = (plotIndex: number): Promise<PlotState> => {
  return request<PlotState>({
    url: '/farm/water',
    method: 'post',
    data: { plotIndex },
  })
}

/**
 * 给指定地块除草
 * @param plotIndex - 地块的索引
 * @returns {Promise<PlotState>} 更新后的地块状态
 */
export const weedApi = (plotIndex: number): Promise<PlotState> => {
  return request<PlotState>({
    url: '/farm/weed',
    method: 'post',
    data: { plotIndex },
  })
}

/**
 * 给指定地块除虫
 * @param plotIndex - 地块的索引
 * @returns {Promise<PlotState>} 更新后的地块状态
 */
export const pestApi = (plotIndex: number): Promise<PlotState> => {
  return request<PlotState>({
    url: '/farm/pest',
    method: 'post',
    data: { plotIndex },
  })
}
