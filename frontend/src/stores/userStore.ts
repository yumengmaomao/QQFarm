import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserState, InventoryState } from '@qqfarm/shared-types'

export const useUserStore = defineStore(
  'user',
  () => {
    // 状态
    const userState = ref<UserState | null>(null)
    const inventoryState = ref<InventoryState | null>(null)
    const isLoading = ref(false)
    const error = ref<string | null>(null)

    // 计算属性
    const isLoggedIn = computed(() => !!userState.value)
    const userLevel = computed(() => userState.value?.level || 1)
    const userGold = computed(() => userState.value?.gold || '0')
    const userExp = computed(() => userState.value?.exp || 0)
    const userExpToNextLevel = computed(() => userState.value?.expToNextLevel || 100)
    const expPercentage = computed(() => {
      if (!userState.value) return 0
      return Math.min((userExp.value / userExpToNextLevel.value) * 100, 100)
    })

    // 方法
    const setUserState = (state: UserState) => {
      userState.value = state
    }

    const setInventoryState = (state: InventoryState) => {
      inventoryState.value = state
    }

    const updateUserGold = (amount: string) => {
      if (userState.value) {
        userState.value.gold = amount
      }
    }

    const updateUserExp = (exp: number) => {
      if (userState.value) {
        userState.value.exp += exp
      }
    }

    const updateUserLevel = (level: number) => {
      if (userState.value) {
        userState.value.level = level
      }
    }

    const setLoading = (loading: boolean) => {
      isLoading.value = loading
    }

    const setError = (err: string | null) => {
      error.value = err
    }

    const clearUser = () => {
      userState.value = null
      inventoryState.value = null
      error.value = null
    }

    return {
      // 状态
      userState,
      inventoryState,
      isLoading,
      error,

      // 计算属性
      isLoggedIn,
      userLevel,
      userGold,
      userExp,
      userExpToNextLevel,
      expPercentage,

      // 方法
      setUserState,
      setInventoryState,
      updateUserGold,
      updateUserExp,
      updateUserLevel,
      setLoading,
      setError,
      clearUser,
    }
  },
  {
    persist: {
      key: 'qqfarm-user-store',
      storage: localStorage,
      pick: ['userState', 'inventoryState'],
    },
  },
)
