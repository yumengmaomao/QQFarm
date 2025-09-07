// src/api/modules/auth.ts
import request from '../request'
import type { LoginResponse, UserCredentials } from '@qqfarm/shared-types'

/**
 * 用户登录
 * @param credentials - 包含 qq 和 password
 */
export const loginApi = (credentials: UserCredentials): Promise<LoginResponse> => {
  return request<LoginResponse>({
    url: '/login',
    method: 'post',
    data: credentials,
  })
}

/**
 * 刷新 Access Token
 * @param refreshToken - 用于刷新的 Refresh Token
 */
export const refreshTokenApi = (refreshToken: string): Promise<{ accessToken: string }> => {
  return request<{ accessToken: string }>({
    url: '/login/refresh',
    method: 'post',
    data: { refreshToken },
    headers: { 'X-No-Loading': 'true' }, // 刷新请求通常是无感知的，不显示全局loading
  })
}
