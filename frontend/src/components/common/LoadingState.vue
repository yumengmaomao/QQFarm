<template>
  <div class="loading-state" :class="stateClasses">
    <!-- 加载动画区域 -->
    <div class="loading-animation" :class="animationClasses">
      <!-- 圆形加载器 -->
      <div v-if="type === 'spinner'" class="spinner">
        <div class="spinner-circle"></div>
      </div>

      <!-- 点状加载器 -->
      <div v-else-if="type === 'dots'" class="dots">
        <div
          v-for="i in 3"
          :key="i"
          class="dot"
          :style="{ animationDelay: `${(i - 1) * 0.2}s` }"
        ></div>
      </div>

      <!-- 脉冲加载器 -->
      <div v-else-if="type === 'pulse'" class="pulse">
        <div class="pulse-circle"></div>
      </div>

      <!-- 条形加载器 -->
      <div v-else-if="type === 'bars'" class="bars">
        <div
          v-for="i in 4"
          :key="i"
          class="bar"
          :style="{ animationDelay: `${(i - 1) * 0.1}s` }"
        ></div>
      </div>

      <!-- 自定义图标加载器 -->
      <div v-else-if="type === 'custom' && icon" class="custom-loader">
        <component :is="icon" :size="iconSize" class="custom-icon" />
      </div>
    </div>

    <!-- 加载文本 -->
    <div v-if="text" class="loading-text" :class="textClasses">
      {{ text }}
    </div>

    <!-- 进度信息 -->
    <div v-if="showProgress && progress !== undefined" class="loading-progress">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
      </div>
      <div class="progress-text">{{ progress }}%</div>
    </div>

    <!-- 副标题 -->
    <div v-if="subtitle" class="loading-subtitle">
      {{ subtitle }}
    </div>

    <!-- 插槽区域 -->
    <div v-if="$slots.default" class="loading-custom">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, type Component } from 'vue'
import { Loader, RefreshCw, Activity, Zap } from 'lucide-vue-next'

interface Props {
  type?: 'spinner' | 'dots' | 'pulse' | 'bars' | 'custom'
  size?: 'sm' | 'md' | 'lg'
  text?: string
  subtitle?: string
  icon?: Component
  progress?: number
  showProgress?: boolean
  variant?: 'default' | 'overlay' | 'inline'
  animated?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'spinner',
  size: 'md',
  text: '加载中...',
  subtitle: '',
  icon: undefined,
  progress: undefined,
  showProgress: false,
  variant: 'default',
  animated: true,
})

// 计算属性
const stateClasses = computed(() => [
  'loading-state',
  `size-${props.size}`,
  `type-${props.type}`,
  `variant-${props.variant}`,
  {
    animated: props.animated,
    'with-progress': props.showProgress && props.progress !== undefined,
    'with-subtitle': !!props.subtitle,
  },
])

const animationClasses = computed(() => [
  'loading-animation',
  `size-${props.size}`,
  `type-${props.type}`,
])

const textClasses = computed(() => ['loading-text', `size-${props.size}`])

const iconSize = computed(() => {
  const sizeMap = {
    sm: 20,
    md: 24,
    lg: 32,
  }
  return sizeMap[props.size]
})

// 预设图标映射
const presetIcons = {
  loader: Loader,
  refresh: RefreshCw,
  activity: Activity,
  zap: Zap,
}

// 暴露预设图标
defineExpose({
  icons: presetIcons,
})
</script>

<style scoped>
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 12px;
  padding: 20px;
}

/* 变体样式 */
.loading-state.variant-default {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.8);
}

.loading-state.variant-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 9999;
  color: white;
}

.loading-state.variant-inline {
  background: transparent;
  color: rgba(255, 255, 255, 0.8);
  padding: 12px;
}

/* 尺寸样式 */
.loading-state.size-sm {
  gap: 8px;
  padding: 16px;
}

.loading-state.size-lg {
  gap: 16px;
  padding: 24px;
}

/* 加载动画容器 */
.loading-animation {
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-animation.size-sm {
  width: 24px;
  height: 24px;
}

.loading-animation.size-md {
  width: 32px;
  height: 32px;
}

.loading-animation.size-lg {
  width: 48px;
  height: 48px;
}

/* 圆形加载器 */
.spinner {
  width: 100%;
  height: 100%;
  position: relative;
}

.spinner-circle {
  width: 100%;
  height: 100%;
  border: 3px solid transparent;
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-state.size-sm .spinner-circle {
  border-width: 2px;
}

.loading-state.size-lg .spinner-circle {
  border-width: 4px;
}

/* 点状加载器 */
.dots {
  display: flex;
  gap: 4px;
  align-items: center;
}

.dot {
  width: 8px;
  height: 8px;
  background: currentColor;
  border-radius: 50%;
  animation: dotPulse 1.4s ease-in-out infinite both;
}

.loading-state.size-sm .dot {
  width: 6px;
  height: 6px;
}

.loading-state.size-lg .dot {
  width: 10px;
  height: 10px;
}

/* 脉冲加载器 */
.pulse {
  width: 100%;
  height: 100%;
  position: relative;
}

.pulse-circle {
  width: 100%;
  height: 100%;
  background: currentColor;
  border-radius: 50%;
  animation: pulseScale 1.5s ease-in-out infinite;
}

/* 条形加载器 */
.bars {
  display: flex;
  gap: 3px;
  align-items: center;
  height: 100%;
}

.bar {
  width: 4px;
  height: 100%;
  background: currentColor;
  border-radius: 2px;
  animation: barStretch 1.2s ease-in-out infinite both;
}

.loading-state.size-sm .bar {
  width: 3px;
}

.loading-state.size-lg .bar {
  width: 5px;
}

/* 自定义加载器 */
.custom-loader {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.custom-icon {
  animation: customSpin 2s linear infinite;
  color: currentColor;
}

/* 文本样式 */
.loading-text {
  font-size: 14px;
  font-weight: 500;
  color: inherit;
}

.loading-text.size-sm {
  font-size: 12px;
}

.loading-text.size-lg {
  font-size: 16px;
}

/* 进度条样式 */
.loading-progress {
  width: 100%;
  max-width: 200px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 12px;
  color: inherit;
  text-align: center;
}

/* 副标题样式 */
.loading-subtitle {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
  max-width: 300px;
  line-height: 1.4;
}

.loading-state.size-sm .loading-subtitle {
  font-size: 11px;
}

.loading-state.size-lg .loading-subtitle {
  font-size: 13px;
}

/* 自定义区域 */
.loading-custom {
  width: 100%;
  margin-top: 8px;
}

/* 动画定义 */
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes dotPulse {
  0%,
  80%,
  100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes pulseScale {
  0%,
  100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.8;
  }
}

@keyframes barStretch {
  0%,
  40%,
  100% {
    transform: scaleY(0.4);
  }
  20% {
    transform: scaleY(1);
  }
}

@keyframes customSpin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .loading-state.variant-default {
    padding: 16px;
  }

  .loading-state.size-sm {
    padding: 12px;
  }

  .loading-state.size-lg {
    padding: 20px;
  }

  .loading-progress {
    max-width: 150px;
  }

  .loading-subtitle {
    max-width: 250px;
    font-size: 11px;
  }

  .loading-state.size-sm .loading-subtitle {
    font-size: 10px;
  }

  .loading-state.size-lg .loading-subtitle {
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .loading-state.variant-default {
    padding: 12px;
    gap: 8px;
  }

  .loading-state.size-sm {
    padding: 8px;
    gap: 6px;
  }

  .loading-state.size-lg {
    padding: 16px;
    gap: 12px;
  }

  .loading-text {
    font-size: 12px;
  }

  .loading-state.size-sm .loading-text {
    font-size: 11px;
  }

  .loading-state.size-lg .loading-text {
    font-size: 14px;
  }

  .loading-progress {
    max-width: 120px;
    gap: 6px;
  }

  .progress-bar {
    height: 3px;
  }

  .progress-text {
    font-size: 11px;
  }

  .loading-subtitle {
    font-size: 10px;
    max-width: 200px;
  }

  .loading-state.size-sm .loading-subtitle {
    font-size: 9px;
  }

  .loading-state.size-lg .loading-subtitle {
    font-size: 11px;
  }
}

/* 深色主题支持 */
@media (prefers-color-scheme: dark) {
  .loading-state.variant-default {
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .progress-bar {
    background: rgba(255, 255, 255, 0.1);
  }
}
</style>
