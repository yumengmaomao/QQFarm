// src/api/request.ts
import axios, { type AxiosRequestConfig } from 'axios';
import { useLoadingStore } from '@/stores/loading';
import { useUserStore } from '@/stores/userStore'; // 您的 userStore
import type { ApiResponse } from '@qqfarm/shared-types';

// --- Axios 实例创建 ---
const service = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
});

// --- 请求拦截器 ---
service.interceptors.request.use(
  (config) => {
    // 显示加载提示
    const loadingStore = useLoadingStore();
    if (!config.headers?.['X-No-Loading']) { // 允许部分请求不显示loading
      loadingStore.showLoading();
    }
    
    // 自动附加 Token
    const userStore = useUserStore();
    const token = userStore.accessToken; // 从您的 userStore 获取 token
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    // 请求错误时，也需要隐藏加载提示
    useLoadingStore().hideLoading();
    return Promise.reject(error);
  },
);


// --- 响应拦截器 ---
let isRefreshing = false; // 控制刷新状态，防止重复刷新
let failedQueue: Array<(token: string) => void> = []; // 存储因token过期而失败的请求

const processQueue = (token: string) => {
  failedQueue.forEach(callback => callback(token));
  failedQueue = [];
};

service.interceptors.response.use(
  (response) => {
    useLoadingStore().hideLoading();
    const res: ApiResponse = response.data;
    
    // 后端通过 { success: boolean } 判断
    if (!res.success) {
      // 在这里可以进行统一的业务错误提示
      console.error(`[API Error] ${res.message}`);
      // 例如：Message.error(res.message);
      return Promise.reject(new Error(res.message || 'Error'));
    }

    // 正确响应，直接返回 `data` 字段
    return res.data;
  },
  async (error) => {
    useLoadingStore().hideLoading();
    const originalRequest = error.config;
    
    // 当状态码为401时，尝试刷新Token
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // 如果正在刷新token，将当前请求加入队列
        return new Promise(resolve => {
          failedQueue.push(token => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            resolve(service(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const userStore = useUserStore();
      try {
        const newAccessToken = await userStore.refreshToken(); // 调用 Pinia store 中的刷新方法
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        
        // 重新执行队列中所有失败的请求
        processQueue(newAccessToken);
        
        // 重新执行当前请求
        return await service(originalRequest);
      } catch (refreshError) {
        // 刷新失败，清除用户信息并重定向到登录页
        userStore.logout();
        // router.push('/login');
        console.error('Token refresh failed, redirecting to login.');
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    // 其他错误直接抛出
    console.error(`[Request Error] ${error.message}`);
    return Promise.reject(error);
  },
);

// --- 导出封装的请求方法 ---
// 使用泛型 T 约束返回的 data 类型
const request = <T = any>(config: AxiosRequest-Config): Promise<T> => {
  return service(config) as Promise<T>;
};

export default request;