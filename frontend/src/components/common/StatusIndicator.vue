<template>
  <div class="status-indicator" :class="indicatorClasses">
    <div class="status-dot" :class="dotClasses"></div>
    <span v-if="showText" class="status-text">{{ statusText }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  status: 'online' | 'offline' | 'away' | 'busy' | 'loading' | 'success' | 'error' | 'warning'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  shape?: 'circle' | 'square'
  showText?: boolean
  animated?: boolean
  pulse?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  status: 'offline',
  size: 'md',
  shape: 'circle',
  showText: false,
  animated: false,
  pulse: false,
})

// 状态文本映射
const statusTextMap = {
  online: '在线',
  offline: '离线',
  away: '离开',
  busy: '忙碌',
  loading: '加载中',
  success: '成功',
  error: '错误',
  warning: '警告',
}

// 状态颜色映射
const statusColorMap = {
  online: '#10b981',
  offline: '#6b7280',
  away: '#f59e0b',
  busy: '#ef4444',
  loading: '#3b82f6',
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
}

// 计算属性
const statusText = computed(() => statusTextMap[props.status])
const statusColor = computed(() => statusColorMap[props.status])

const indicatorClasses = computed(() => [
  'status-indicator',
  `size-${props.size}`,
  `shape-${props.shape}`,
  {
    'with-text': props.showText,
    animated: props.animated,
    pulse: props.pulse,
  },
])

const dotClasses = computed(() => [
  'status-dot',
  `status-${props.status}`,
  `size-${props.size}`,
  `shape-${props.shape}`,
  {
    animated: props.animated,
    pulse: props.pulse,
  },
])
</script>

<style scoped>
.status-indicator {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #666;
}

.status-indicator.with-text {
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
}

.status-dot {
  border-radius: 50%;
  position: relative;
}

.status-dot.shape-square {
  border-radius: 4px;
}

/* 尺寸样式 */
.status-dot.size-xs {
  width: 6px;
  height: 6px;
}

.status-dot.size-sm {
  width: 8px;
  height: 8px;
}

.status-dot.size-md {
  width: 10px;
  height: 10px;
}

.status-dot.size-lg {
  width: 12px;
  height: 12px;
}

/* 状态颜色 */
.status-dot.status-online {
  background: v-bind('statusColor');
}

.status-dot.status-offline {
  background: v-bind('statusColor');
}

.status-dot.status-away {
  background: v-bind('statusColor');
}

.status-dot.status-busy {
  background: v-bind('statusColor');
}

.status-dot.status-loading {
  background: v-bind('statusColor');
}

.status-dot.status-success {
  background: v-bind('statusColor');
}

.status-dot.status-error {
  background: v-bind('statusColor');
}

.status-dot.status-warning {
  background: v-bind('statusColor');
}

/* 动画效果 */
.status-dot.animated {
  animation: pulse 2s infinite;
}

.status-dot.pulse::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 50%;
  background: v-bind('statusColor');
  opacity: 0.3;
  animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
}

.status-dot.shape-square.pulse::after {
  border-radius: 4px;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes ping {
  75%,
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

/* 加载状态特殊动画 */
.status-dot.status-loading.animated {
  animation: spin 1s linear infinite;
  border: 2px solid transparent;
  border-top-color: v-bind('statusColor');
  border-right-color: v-bind('statusColor');
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 文本样式 */
.status-text {
  font-size: inherit;
  font-weight: 500;
  white-space: nowrap;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .status-indicator {
    font-size: 11px;
  }

  .status-dot.size-lg {
    width: 10px;
    height: 10px;
  }

  .status-indicator.with-text {
    padding: 3px 6px;
  }
}
</style>
