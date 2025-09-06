<template>
  <div class="page-header" :class="headerClasses">
    <!-- 标题区域 -->
    <div class="header-title">
      <h2 class="title-text">{{ title }}</h2>
      <div v-if="subtitle" class="subtitle-text">{{ subtitle }}</div>
    </div>

    <!-- 统计信息区域 -->
    <div v-if="stats && stats.length > 0" class="header-stats">
      <div
        v-for="stat in stats"
        :key="stat.key"
        class="stat-item"
        :class="{ clickable: stat.clickable }"
        @click="handleStatClick(stat)"
      >
        <component :is="stat.icon" :size="16" class="stat-icon" />
        <span class="stat-value">{{ stat.value }}</span>
        <span v-if="stat.label" class="stat-label">{{ stat.label }}</span>
      </div>
    </div>

    <!-- 操作按钮区域 -->
    <div v-if="actions && actions.length > 0" class="header-actions">
      <button
        v-for="action in actions"
        :key="action.key"
        class="action-btn"
        :class="[`type-${action.type}`, { disabled: action.disabled }]"
        @click="handleActionClick(action)"
        :disabled="action.disabled"
        v-tooltip="action.tooltip"
      >
        <component :is="action.icon" :size="16" />
        <span v-if="action.text">{{ action.text }}</span>
        <span v-if="action.badge" class="action-badge">{{ action.badge }}</span>
      </button>
    </div>

    <!-- 插槽区域 -->
    <div v-if="$slots.default" class="header-custom">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Component } from 'vue'

interface StatItem {
  key: string
  icon: Component
  value: string | number
  label?: string
  clickable?: boolean
  onClick?: () => void
}

interface ActionItem {
  key: string
  icon: Component
  text?: string
  type?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
  disabled?: boolean
  badge?: string | number
  tooltip?: string
  onClick?: () => void
}

interface Props {
  title: string
  subtitle?: string
  stats?: StatItem[]
  actions?: ActionItem[]
  size?: 'sm' | 'md' | 'lg'
  bordered?: boolean
  shadow?: boolean
  transparent?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  subtitle: '',
  stats: () => [],
  actions: () => [],
  size: 'md',
  bordered: false,
  shadow: false,
  transparent: false,
})

const emit = defineEmits<{
  statClick: [stat: StatItem]
  actionClick: [action: ActionItem]
}>()

const headerClasses = computed(() => [
  'page-header',
  `size-${props.size}`,
  {
    bordered: props.bordered,
    shadow: props.shadow,
    transparent: props.transparent,
    'with-stats': props.stats.length > 0,
    'with-actions': props.actions.length > 0,
  },
])

const handleStatClick = (stat: StatItem) => {
  if (stat.clickable) {
    emit('statClick', stat)
    stat.onClick?.()
  }
}

const handleActionClick = (action: ActionItem) => {
  if (!action.disabled) {
    emit('actionClick', action)
    action.onClick?.()
  }
}
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 20px;
  background: white;
  border-radius: 12px;
  transition: all 0.3s ease;
  flex-wrap: wrap;
}

.page-header.transparent {
  background: transparent;
}

.page-header.bordered {
  border: 1px solid #e5e7eb;
}

.page-header.shadow {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.page-header.size-sm {
  padding: 12px 16px;
}

.page-header.size-lg {
  padding: 20px 24px;
}

/* 标题区域 */
.header-title {
  flex: 1;
  min-width: 0;
}

.title-text {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #333;
  line-height: 1.2;
}

.subtitle-text {
  margin-top: 4px;
  font-size: 14px;
  color: #666;
  line-height: 1.4;
}

.page-header.size-sm .title-text {
  font-size: 18px;
}

.page-header.size-lg .title-text {
  font-size: 24px;
}

.page-header.size-sm .subtitle-text {
  font-size: 12px;
}

.page-header.size-lg .subtitle-text {
  font-size: 16px;
}

/* 统计信息区域 */
.header-stats {
  display: flex;
  gap: 16px;
  align-items: center;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #f8fafc;
  border-radius: 8px;
  font-size: 12px;
  color: #666;
  transition: all 0.3s ease;
}

.stat-item.clickable {
  cursor: pointer;
}

.stat-item.clickable:hover {
  background: #f1f5f9;
  transform: translateY(-1px);
}

.stat-icon {
  color: #64748b;
  flex-shrink: 0;
}

.stat-value {
  font-weight: 600;
  color: #333;
}

.stat-label {
  color: #64748b;
  font-size: 11px;
}

/* 操作按钮区域 */
.header-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  white-space: nowrap;
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

.action-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #ef4444;
  color: white;
  font-size: 10px;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 自定义区域 */
.header-custom {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .header-stats {
    width: 100%;
    justify-content: flex-start;
    flex-wrap: wrap;
  }

  .header-actions {
    width: 100%;
    justify-content: flex-end;
    flex-wrap: wrap;
  }

  .action-btn {
    flex: 1;
    justify-content: center;
    min-width: 100px;
  }
}

@media (max-width: 480px) {
  .page-header {
    padding: 12px 16px;
  }

  .page-header.size-sm {
    padding: 10px 12px;
  }

  .page-header.size-lg {
    padding: 16px 20px;
  }

  .title-text {
    font-size: 18px;
  }

  .subtitle-text {
    font-size: 12px;
  }

  .stat-item {
    padding: 4px 8px;
    font-size: 11px;
  }

  .action-btn {
    padding: 6px 12px;
    font-size: 12px;
  }

  .action-badge {
    font-size: 9px;
    min-width: 14px;
    height: 14px;
    padding: 1px 4px;
  }
}

/* 深色主题支持 */
@media (prefers-color-scheme: dark) {
  .page-header:not(.transparent) {
    background: #1f2937;
    border-color: #374151;
  }

  .title-text {
    color: #f9fafb;
  }

  .subtitle-text {
    color: #9ca3af;
  }

  .stat-item {
    background: #374151;
    color: #9ca3af;
  }

  .stat-item.clickable:hover {
    background: #4b5563;
  }

  .stat-value {
    color: #f9fafb;
  }

  .stat-label {
    color: #9ca3af;
  }

  .action-btn.type-secondary {
    background: #374151;
    color: #9ca3af;
  }

  .action-btn.type-secondary:hover:not(.disabled) {
    background: #4b5563;
    color: #f9fafb;
  }
}
</style>
