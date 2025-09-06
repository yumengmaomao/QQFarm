import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { PlotState } from '@qqfarm/shared-types'

export const useFarmStore = defineStore(
  'farm',
  () => {
    // 状态
    const plots = ref<PlotState[]>([])
    const isLoading = ref(false)
    const error = ref<string | null>(null)
    const lastUpdate = ref<Date | null>(null)

    // 计算属性
    const totalPlots = computed(() => plots.value.length)
    const growingPlots = computed(
      () => plots.value.filter((plot) => plot.status === 'growing').length,
    )
    const maturedPlots = computed(
      () => plots.value.filter((plot) => plot.status === 'matured').length,
    )
    const emptyPlots = computed(() => plots.value.filter((plot) => plot.status === 'empty').length)
    const needsWaterPlots = computed(
      () => plots.value.filter((plot) => plot.waterState < 50).length,
    )
    const hasWeedsPlots = computed(() => plots.value.filter((plot) => plot.hasWeeds).length)
    const hasPestsPlots = computed(() => plots.value.filter((plot) => plot.hasPests).length)

    // 方法
    const setPlots = (newPlots: PlotState[]) => {
      plots.value = newPlots
      lastUpdate.value = new Date()
    }

    const updatePlot = (plotIndex: number, updatedPlot: Partial<PlotState>) => {
      const plot = plots.value.find((p) => p.plotIndex === plotIndex)
      if (plot) {
        Object.assign(plot, updatedPlot)
        lastUpdate.value = new Date()
      }
    }

    const addPlot = (plot: PlotState) => {
      plots.value.push(plot)
      lastUpdate.value = new Date()
    }

    const removePlot = (plotIndex: number) => {
      const index = plots.value.findIndex((p) => p.plotIndex === plotIndex)
      if (index !== -1) {
        plots.value.splice(index, 1)
        lastUpdate.value = new Date()
      }
    }

    const clearPlots = () => {
      plots.value = []
      lastUpdate.value = null
    }

    const setLoading = (loading: boolean) => {
      isLoading.value = loading
    }

    const setError = (err: string | null) => {
      error.value = err
    }

    const getPlotByIndex = (plotIndex: number) => {
      return plots.value.find((p) => p.plotIndex === plotIndex)
    }

    const getPlotsByStatus = (status: 'empty' | 'growing' | 'matured') => {
      return plots.value.filter((plot) => plot.status === status)
    }

    const getPlotsNeedingAttention = () => {
      return plots.value.filter((plot) => plot.waterState < 50 || plot.hasWeeds || plot.hasPests)
    }

    return {
      // 状态
      plots,
      isLoading,
      error,
      lastUpdate,

      // 计算属性
      totalPlots,
      growingPlots,
      maturedPlots,
      emptyPlots,
      needsWaterPlots,
      hasWeedsPlots,
      hasPestsPlots,

      // 方法
      setPlots,
      updatePlot,
      addPlot,
      removePlot,
      clearPlots,
      setLoading,
      setError,
      getPlotByIndex,
      getPlotsByStatus,
      getPlotsNeedingAttention,
    }
  },
  {
    persist: {
      key: 'qqfarm-farm-store',
      storage: localStorage,
      pick: ['plots', 'lastUpdate'],
    },
  },
)
