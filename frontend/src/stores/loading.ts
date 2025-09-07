// src/stores/loading.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useLoadingStore = defineStore('loading', () => {
  const isLoading = ref(false)
  let requestCount = 0

  function showLoading() {
    if (requestCount === 0) {
      isLoading.value = true
      // 在这里可以调用您的UI库的加载组件，例如：
      // ElLoading.service({ fullscreen: true, text: '加载中...' })
      console.log('显示加载提示...')
    }
    requestCount++
  }

  function hideLoading() {
    requestCount--
    if (requestCount === 0) {
      isLoading.value = false
      // 在这里关闭您的UI库的加载组件
      // ElLoading.service().close()
      console.log('隐藏加载提示...')
    }
  }

  return { isLoading, showLoading, hideLoading }
})
