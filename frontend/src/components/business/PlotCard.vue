<template>
  <div class="plot-card" :class="cardClasses" @click="handleClick">
    <!-- 地块背景 -->
    <div class="plot-background" :class="backgroundClasses">
      <!-- 作物图像 -->
      <div v-if="plot.crop" class="crop-image">
        <img
          :src="plot.crop.image || defaultCropImage"
          :alt="plot.crop.name"
          @error="handleImageError"
          @load="handleImageLoad"
        />
      </div>

      <!-- 生长阶段指示器 -->
      <div v-if="plot.crop" class="growth-indicator">
        <div class="growth-bar">
          <div class="growth-fill" :style="{ width: `${growthPercentage}%` }"></div>
        </div>
        <div class="growth-text">{{ plot.crop.growthStage }}/{{ plot.crop.totalStages }}</div>
      </div>
    </div>

    <!-- 地块信息 -->
    <div class="plot-info">
      <div class="plot-name">{{ plot.name }}</div>
      <div class="plot-status">
        <StatusIndicator :status="plotStatus" size="xs" :show-text="true" />
      </div>
      <div v-if="showTimeRemaining && timeRemaining" class="plot-time">
        <Clock :size="12" />
        <span>{{ timeRemaining }}</span>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="plot-actions">
      <button
        v-if="showHarvestButton && canHarvest"
        class="action-btn harvest"
        @click.stop="handleHarvest"
        v-tooltip="'收获作物'"
      >
        <Wheat :size="16" />
        <span>收获</span>
      </button>
      <button
        v-if="showWaterButton && canWater"
        class="action-btn water"
        @click.stop="handleWater"
        :disabled="!canWater"
        v-tooltip="waterTooltip"
      >
        <Droplets :size="16" />
        <span>浇水</span>
      </button>
      <button
        v-if="showFertilizeButton && canFertilize"
        class="action-btn fertilize"
        @click.stop="handleFertilize"
        :disabled="!canFertilize"
        v-tooltip="fertilizeTooltip"
      >
        <Sprout :size="16" />
        <span>施肥</span>
      </button>
      <button
        v-if="showStealButton && canSteal"
        class="action-btn steal"
        @click.stop="handleSteal"
        v-tooltip="'偷菜'"
      >
        <Zap :size="16" />
        <span>偷菜</span>
      </button>
    </div>

    <!-- 状态徽章 -->
    <div v-if="plot.badge" class="plot-badge">
      {{ plot.badge }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Wheat, Clock, Droplets, Sprout, Zap } from 'lucide-vue-next'
import StatusIndicator from '../common/StatusIndicator.vue'

interface CropData {
  cropId: number
  name: string
  image?: string
  growthStage: number
  totalStages: number
  plantTime?: string
  harvestTime?: string
}

interface PlotData {
  plotId: number
  name: string
  crop?: CropData
  status?: 'empty' | 'planted' | 'growing' | 'ready' | 'withered'
  lastWatered?: string
  lastFertilized?: string
  canWater?: boolean
  canFertilize?: boolean
  canSteal?: boolean
  badge?: string
  isLocked?: boolean
  ownerId?: number
}

interface Props {
  plot: PlotData
  size?: 'sm' | 'md' | 'lg'
  showTimeRemaining?: boolean
  showHarvestButton?: boolean
  showWaterButton?: boolean
  showFertilizeButton?: boolean
  showStealButton?: boolean
  variant?: 'default' | 'compact' | 'detailed'
  clickable?: boolean
  currentUserId?: number
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  showTimeRemaining: true,
  showHarvestButton: true,
  showWaterButton: true,
  showFertilizeButton: true,
  showStealButton: false,
  variant: 'default',
  clickable: true,
  currentUserId: 0,
})

const emit = defineEmits<{
  click: [plot: PlotData]
  harvest: [plot: PlotData]
  water: [plot: PlotData]
  fertilize: [plot: PlotData]
  steal: [plot: PlotData]
}>()

// 响应式状态
const imageError = ref(false)

// 计算属性
const cardClasses = computed(() => [
  'plot-card',
  `size-${props.size}`,
  `variant-${props.variant}`,
  `status-${props.plot.status || 'empty'}`,
  {
    clickable: props.clickable,
    'can-harvest': canHarvest.value,
    'can-water': canWater.value,
    'can-fertilize': canFertilize.value,
    'can-steal': canSteal.value,
    'is-locked': props.plot.isLocked,
    'is-owned': isOwned.value,
    'needs-water': needsWater.value,
    'needs-fertilize': needsFertilize.value,
  },
])

const backgroundClasses = computed(() => [
  'plot-background',
  `size-${props.size}`,
  `status-${props.plot.status || 'empty'}`,
])

const defaultCropImage = computed(() => '/default-crop.png')

const plotStatus = computed(() => {
  if (!props.plot.crop) return 'offline' // 空地块显示为离线状态
  if (props.plot.status === 'withered') return 'error'
  if (props.plot.status === 'ready') return 'success'
  return 'success' // 其他状态都显示为成功
})

const growthPercentage = computed(() => {
  if (!props.plot.crop) return 0
  const { growthStage, totalStages } = props.plot.crop
  return Math.round((growthStage / totalStages) * 100)
})

const canHarvest = computed(() => {
  return props.plot.crop && props.plot.status === 'ready'
})

const canWater = computed(() => {
  return props.plot.crop && props.plot.canWater && !needsWater.value
})

const canFertilize = computed(() => {
  return props.plot.crop && props.plot.canFertilize && !needsFertilize.value
})

const canSteal = computed(() => {
  return props.plot.canSteal && props.plot.status === 'ready' && !isOwned.value
})

const isOwned = computed(() => {
  return props.plot.ownerId === props.currentUserId
})

const needsWater = computed(() => {
  if (!props.plot.lastWatered) return true
  const lastWatered = new Date(props.plot.lastWatered)
  const now = new Date()
  const hoursSinceWater = (now.getTime() - lastWatered.getTime()) / (1000 * 60 * 60)
  return hoursSinceWater >= 8 // 8小时需要浇水
})

const needsFertilize = computed(() => {
  if (!props.plot.lastFertilized) return true
  const lastFertilized = new Date(props.plot.lastFertilized)
  const now = new Date()
  const hoursSinceFertilize = (now.getTime() - lastFertilized.getTime()) / (1000 * 60 * 60)
  return hoursSinceFertilize >= 24 // 24小时需要施肥
})

const timeRemaining = computed(() => {
  if (!props.plot.crop || !props.plot.crop.harvestTime) return null

  const harvestTime = new Date(props.plot.crop.harvestTime)
  const now = new Date()
  const timeDiff = harvestTime.getTime() - now.getTime()

  if (timeDiff <= 0) return '已成熟'

  const hours = Math.floor(timeDiff / (1000 * 60 * 60))
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))

  if (hours > 0) {
    return `${hours}小时${minutes}分钟`
  }
  return `${minutes}分钟`
})

const waterTooltip = computed(() => {
  if (!canWater.value) return '无需浇水'
  return '给作物浇水'
})

const fertilizeTooltip = computed(() => {
  if (!canFertilize.value) return '无需施肥'
  return '给作物施肥'
})

// 方法
const handleClick = () => {
  if (props.clickable) {
    emit('click', props.plot)
  }
}

const handleHarvest = () => {
  if (!canHarvest.value) return
  emit('harvest', props.plot)
}

const handleWater = () => {
  if (!canWater.value) return
  emit('water', props.plot)
}

const handleFertilize = () => {
  if (!canFertilize.value) return
  emit('fertilize', props.plot)
}

const handleSteal = () => {
  if (!canSteal.value) return
  emit('steal', props.plot)
}

const handleImageError = () => {
  imageError.value = true
}

const handleImageLoad = () => {
  imageError.value = false
}
</script>

<style scoped>
.plot-card {
  position: relative;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.plot-card.clickable {
  cursor: pointer;
}

.plot-card.clickable:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.plot-card.can-harvest {
  border-color: rgba(16, 185, 129, 0.5);
  box-shadow: 0 0 20px rgba(16, 185, 129, 0.3);
}

.plot-card.needs-water {
  border-color: rgba(59, 130, 246, 0.5);
}

.plot-card.needs-fertilize {
  border-color: rgba(139, 92, 246, 0.5);
}

.plot-card.is-locked {
  border-color: rgba(107, 114, 128, 0.5);
  opacity: 0.7;
}

.plot-card.is-owned {
  border-color: rgba(102, 126, 234, 0.5);
}

/* 状态样式 */
.plot-card.status-empty {
  background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
}

.plot-card.status-planted {
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
}

.plot-card.status-growing {
  background: linear-gradient(135deg, #dcfce7, #bbf7d0);
}

.plot-card.status-ready {
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
}

.plot-card.status-withered {
  background: linear-gradient(135deg, #fee2e2, #fecaca);
}

/* 尺寸变体 */
.plot-card.size-sm {
  width: 120px;
  min-height: 140px;
}

.plot-card.size-md {
  width: 160px;
  min-height: 180px;
}

.plot-card.size-lg {
  width: 200px;
  min-height: 220px;
}

/* 样式变体 */
.plot-card.variant.compact {
  width: 100px;
  min-height: 120px;
}

.plot-card.variant.detailed {
  width: 240px;
  min-height: 280px;
}

/* 背景区域 */
.plot-background {
  width: 100%;
  height: 120px;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.plot-card.size-sm .plot-background {
  height: 80px;
}

.plot-card.size-md .plot-background {
  height: 120px;
}

.plot-card.size-lg .plot-background {
  height: 160px;
}

.plot-card.variant.compact .plot-background {
  height: 70px;
}

.plot-card.variant.detailed .plot-background {
  height: 180px;
}

.plot-background.status-empty {
  background: #f8fafc;
}

.plot-background.status-empty::after {
  content: '空地块';
  position: absolute;
  font-size: 14px;
  color: #9ca3af;
}

/* 作物图像 */
.crop-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.plot-card.can-harvest .crop-image {
  animation: harvest-pulse 2s ease-in-out infinite;
}

@keyframes harvest-pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

/* 生长指示器 */
.growth-indicator {
  position: absolute;
  bottom: 8px;
  left: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 8px;
  padding: 4px;
}

.growth-bar {
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  overflow: hidden;
}

.growth-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #059669);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.growth-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 10px;
  font-weight: bold;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

/* 信息区域 */
.plot-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
}

.plot-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  line-height: 1.2;
}

.plot-card.size-sm .plot-name {
  font-size: 12px;
}

.plot-card.size-lg .plot-name {
  font-size: 16px;
}

.plot-status {
  display: flex;
  align-items: center;
}

.plot-time {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #666;
}

/* 操作区域 */
.plot-actions {
  display: flex;
  gap: 6px;
  padding: 0 12px 12px;
}

.plot-card.size-sm .plot-actions {
  gap: 4px;
  padding: 0 8px 8px;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn.harvest {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.action-btn.water {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
}

.action-btn.fertilize {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: white;
}

.action-btn.steal {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
}

.action-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.plot-card.size-sm .action-btn {
  padding: 4px 8px;
  font-size: 10px;
}

.plot-card.size-lg .action-btn {
  padding: 8px 16px;
  font-size: 14px;
}

/* 徽章 */
.plot-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  font-size: 10px;
  font-weight: bold;
  padding: 2px 8px;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  z-index: 2;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .plot-card {
    width: calc(50% - 8px);
    margin: 4px;
  }

  .plot-card.size-sm {
    width: calc(33.333% - 8px);
    min-height: 120px;
  }

  .plot-card.size-md {
    width: calc(50% - 8px);
    min-height: 160px;
  }

  .plot-card.size-lg {
    width: calc(50% - 8px);
    min-height: 200px;
  }

  .plot-card.variant.compact {
    width: calc(25% - 8px);
    min-height: 100px;
  }

  .plot-card.variant.detailed {
    width: calc(50% - 8px);
    min-height: 260px;
  }
}

@media (max-width: 480px) {
  .plot-card {
    width: 100%;
    margin: 0 0 12px;
  }

  .plot-card.size-sm {
    min-height: 100px;
  }

  .plot-card.size-md {
    min-height: 140px;
  }

  .plot-card.size-lg {
    min-height: 180px;
  }

  .plot-card.variant.compact {
    min-height: 80px;
  }

  .plot-card.variant.detailed {
    min-height: 240px;
  }

  .plot-actions {
    flex-direction: column;
    gap: 4px;
  }

  .action-btn {
    width: 100%;
  }
}

/* 深色主题支持 */
@media (prefers-color-scheme: dark) {
  .plot-card {
    background: rgba(31, 41, 55, 0.95);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .plot-name {
    color: #f9fafb;
  }

  .plot-time {
    color: #9ca3af;
  }

  .plot-background.status-empty {
    background: #1f2937;
  }

  .plot-background.status-empty::after {
    color: #6b7280;
  }

  .growth-bar {
    background: rgba(255, 255, 255, 0.1);
  }
}
</style>
