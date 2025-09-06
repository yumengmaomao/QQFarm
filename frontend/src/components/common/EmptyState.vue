<template>
  <div class="empty-state" :class="stateClasses">
    <!-- 图标区域 -->
    <div class="empty-icon" :class="iconClasses">
      <component :is="icon" :size="iconSize" />
    </div>

    <!-- 标题区域 -->
    <div v-if="title" class="empty-title">
      {{ title }}
    </div>

    <!-- 描述区域 -->
    <div v-if="description" class="empty-description">
      {{ description }}
    </div>

    <!-- 操作按钮区域 -->
    <div v-if="action" class="empty-action">
      <button
        class="action-btn"
        :class="[`type-${action.type}`, { disabled: action.disabled }]"
        @click="handleActionClick"
        :disabled="action.disabled"
      >
        <component v-if="action.icon" :is="action.icon" :size="16" />
        <span>{{ action.text }}</span>
      </button>
    </div>

    <!-- 插槽区域 -->
    <div v-if="$slots.default" class="empty-custom">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, type Component } from 'vue'
import {
  Search,
  Inbox,
  Users,
  Package,
  AlertCircle,
  Frown,
  Meh,
  Smile,
  Star,
  Heart,
  Zap,
  Wheat,
  Crown,
} from 'lucide-vue-next'

interface ActionItem {
  text: string
  icon?: Component
  type?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
  disabled?: boolean
  onClick?: () => void
}

interface Props {
  icon?: Component
  title?: string
  description?: string
  action?: ActionItem
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'card' | 'minimal'
  animated?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  icon: Inbox,
  title: '',
  description: '',
  action: undefined,
  size: 'md',
  variant: 'default',
  animated: true,
})

const emit = defineEmits<{
  actionClick: []
}>()

// 计算属性
const stateClasses = computed(() => [
  'empty-state',
  `size-${props.size}`,
  `variant-${props.variant}`,
  {
    animated: props.animated,
    'with-action': !!props.action,
  },
])

const iconClasses = computed(() => ['empty-icon', `size-${props.size}`])

const iconSize = computed(() => {
  const sizeMap = {
    sm: 32,
    md: 48,
    lg: 64,
  }
  return sizeMap[props.size]
})

// 方法
const handleActionClick = () => {
  emit('actionClick')
  props.action?.onClick?.()
}

// 预设图标映射
const presetIcons = {
  search: Search,
  inbox: Inbox,
  users: Users,
  package: Package,
  alert: AlertCircle,
  frown: Frown,
  meh: Meh,
  smile: Smile,
  star: Star,
  heart: Heart,
  zap: Zap,
  wheat: Wheat,
  crown: Crown,
}

// 暴露预设图标
defineExpose({
  icons: presetIcons,
})
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px 20px;
  gap: 16px;
  min-height: 200px;
}

/* 变体样式 */
.empty-state.variant-default {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  color: rgba(255, 255, 255, 0.7);
}

.empty-state.variant-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  color: #6b7280;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.empty-state.variant-minimal {
  background: transparent;
  color: rgba(255, 255, 255, 0.6);
}

/* 尺寸样式 */
.empty-state.size-sm {
  padding: 24px 16px;
  min-height: 120px;
  gap: 12px;
}

.empty-state.size-lg {
  padding: 60px 30px;
  min-height: 300px;
  gap: 20px;
}

/* 图标样式 */
.empty-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.8;
  transition: all 0.3s ease;
}

.empty-state.variant-default .empty-icon {
  color: rgba(255, 255, 255, 0.5);
}

.empty-state.variant-card .empty-icon {
  color: #d1d5db;
}

.empty-state.variant-minimal .empty-icon {
  color: rgba(255, 255, 255, 0.4);
}

.empty-icon.size-sm {
  width: 32px;
  height: 32px;
}

.empty-icon.size-md {
  width: 48px;
  height: 48px;
}

.empty-icon.size-lg {
  width: 64px;
  height: 64px;
}

/* 标题样式 */
.empty-title {
  font-size: 16px;
  font-weight: 600;
  line-height: 1.4;
  margin: 0;
}

.empty-state.variant-default .empty-title {
  color: rgba(255, 255, 255, 0.9);
}

.empty-state.variant-card .empty-title {
  color: #374151;
}

.empty-state.variant-minimal .empty-title {
  color: rgba(255, 255, 255, 0.8);
}

.empty-state.size-sm .empty-title {
  font-size: 14px;
}

.empty-state.size-lg .empty-title {
  font-size: 18px;
}

/* 描述样式 */
.empty-description {
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
  max-width: 400px;
}

.empty-state.variant-default .empty-description {
  color: rgba(255, 255, 255, 0.7);
}

.empty-state.variant-card .empty-description {
  color: #6b7280;
}

.empty-state.variant-minimal .empty-description {
  color: rgba(255, 255, 255, 0.6);
}

.empty-state.size-sm .empty-description {
  font-size: 12px;
}

.empty-state.size-lg .empty-description {
  font-size: 16px;
}

/* 操作按钮样式 */
.empty-action {
  margin-top: 8px;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
}

.action-btn.type-primary {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.action-btn.type-secondary {
  background: #f3f4f6;
  color: #6b7280;
}

.action-btn.type-success {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.action-btn.type-warning {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
}

.action-btn.type-danger {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
}

.action-btn:hover:not(.disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.action-btn.type-secondary:hover:not(.disabled) {
  background: #e5e7eb;
  color: #374151;
}

.action-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.empty-state.size-sm .action-btn {
  padding: 6px 12px;
  font-size: 12px;
}

.empty-state.size-lg .action-btn {
  padding: 10px 20px;
  font-size: 16px;
}

/* 自定义区域 */
.empty-custom {
  margin-top: 16px;
  width: 100%;
}

.empty-state.size-sm .empty-custom {
  margin-top: 12px;
}

.empty-state.size-lg .empty-custom {
  margin-top: 20px;
}

/* 动画效果 */
.empty-state.animated .empty-icon {
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .empty-state {
    padding: 32px 16px;
    min-height: 150px;
  }

  .empty-state.size-sm {
    padding: 20px 12px;
    min-height: 100px;
  }

  .empty-state.size-lg {
    padding: 48px 24px;
    min-height: 250px;
  }

  .empty-description {
    max-width: 300px;
    font-size: 13px;
  }

  .empty-state.size-sm .empty-description {
    font-size: 11px;
  }

  .empty-state.size-lg .empty-description {
    font-size: 15px;
  }
}

@media (max-width: 480px) {
  .empty-state {
    padding: 24px 12px;
    min-height: 120px;
    gap: 12px;
  }

  .empty-state.size-sm {
    padding: 16px 8px;
    min-height: 80px;
    gap: 8px;
  }

  .empty-state.size-lg {
    padding: 36px 18px;
    min-height: 200px;
    gap: 16px;
  }

  .empty-title {
    font-size: 14px;
  }

  .empty-state.size-sm .empty-title {
    font-size: 12px;
  }

  .empty-state.size-lg .empty-title {
    font-size: 16px;
  }

  .empty-description {
    font-size: 12px;
    max-width: 250px;
  }

  .empty-state.size-sm .empty-description {
    font-size: 10px;
  }

  .empty-state.size-lg .empty-description {
    font-size: 14px;
  }

  .action-btn {
    padding: 6px 12px;
    font-size: 12px;
  }

  .empty-state.size-sm .action-btn {
    padding: 4px 8px;
    font-size: 11px;
  }

  .empty-state.size-lg .action-btn {
    padding: 8px 16px;
    font-size: 14px;
  }
}
</style>
