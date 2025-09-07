// src/api/modules/friends.ts
import request from '../request'
import type { FriendListResponse, FriendRequestResponse, UserProfile } from '@qqfarm/shared-types'

/**
 * 获取当前用户的好友列表
 * @returns {Promise<FriendListResponse>} 包含好友列表
 */
export const getFriendsApi = (): Promise<FriendListResponse> => {
  return request<FriendListResponse>({
    url: '/friends',
    method: 'get',
  })
}

/**
 * 根据 QQ 号或昵称搜索用户
 * @param query - 搜索关键词
 * @returns {Promise<UserProfile[]>} 匹配的用户信息列表
 */
export const searchUsersApi = (query: string): Promise<UserProfile[]> => {
  return request<UserProfile[]>({
    url: '/friends/search',
    method: 'get',
    params: { query },
  })
}

/**
 * 向指定用户发送好友请求
 * @param friendId - 目标用户的 ID
 * @returns {Promise<{ message: string }>} 操作成功信息
 */
export const sendFriendRequestApi = (friendId: number): Promise<{ message: string }> => {
  return request<{ message: string }>({
    url: '/friends/request',
    method: 'post',
    data: { friendId },
  })
}

/**
 * 获取收到的待处理好友请求列表
 * @returns {Promise<FriendRequestResponse>} 包含好友请求列表
 */
export const getFriendRequestsApi = (): Promise<FriendRequestResponse> => {
  return request<FriendRequestResponse>({
    url: '/friends/requests',
    method: 'get',
  })
}

/**
 * 接受一个好友请求
 * @param requestId - 好友请求的 ID
 * @returns {Promise<{ message: string }>} 操作成功信息
 */
export const acceptFriendRequestApi = (requestId: number): Promise<{ message: string }> => {
  return request<{ message: string }>({
    url: '/friends/accept',
    method: 'post',
    data: { requestId },
  })
}

/**
 * 拒绝一个好友请求
 * @param requestId - 好友请求的 ID
 * @returns {Promise<{ message: string }>} 操作成功信息
 */
export const rejectFriendRequestApi = (requestId: number): Promise<{ message: string }> => {
  return request<{ message: string }>({
    url: '/friends/reject',
    method: 'post',
    data: { requestId },
  })
}

/**
 * 删除一个好友
 * @param friendId - 要删除的好友的用户 ID
 * @returns {Promise<{ message: string }>} 操作成功信息
 */
export const removeFriendApi = (friendId: number): Promise<{ message: string }> => {
  return request<{ message: string }>({
    url: '/friends/remove',
    method: 'delete',
    data: { friendId },
  })
}
