<template>
  <div class="avatar-container" :class="containerClasses" @click="handleClick">
    <div class="avatar-wrapper" :class="wrapperClasses">
      <img
        v-if="src"
        :src="src"
        :alt="alt"
        class="avatar-image"
        :class="imageClasses"
        @error="handleImageError"
        @load="handleImageLoad"
      />
      <div v-else class="avatar-placeholder" :class="placeholderClasses">
        <component :is="placeholderIcon" :size="placeholderIconSize" />
      </div>

      <!-- 等级标识 -->
      <div v-if="showLevel && level" class="avatar-level" :class="levelClasses">
        <span class="level-text">Lv.{{ level }}</span>
      </div>

      <!-- 状态指示器 -->
      <div v-if="showStatus" class="avatar-status" :class="statusClasses">
        <div class="status-dot" :class="statusDotClasses"></div>
      </div>

      <!-- 徽章 -->
      <div v-if="badge && badgeContent" class="avatar-badge" :class="badgeClasses">
        <span class="badge-content">{{ badgeContent }}</span>
      </div>
    </div>

    <!-- 额外信息 -->
    <div v-if="showInfo && (name || description)" class="avatar-info">
      <div v-if="name" class="avatar-name" :class="nameClasses">{{ name }}</div>
      <div v-if="description" class="avatar-description" :class="descriptionClasses">
        {{ description }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, type Component } from 'vue'
import { User } from 'lucide-vue-next'

interface Props {
  src?: string
  alt?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  shape?: 'circle' | 'square'
  level?: number
  showLevel?: boolean
  status?: 'online' | 'offline' | 'away' | 'busy'
  showStatus?: boolean
  badge?: boolean
  badgeContent?: string | number
  name?: string
  description?: string
  showInfo?: boolean
  placeholderIcon?: Component
  clickable?: boolean
  bordered?: boolean
  shadow?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  src: '',
  alt: '',
  size: 'md',
  shape: 'circle',
  level: 0,
  showLevel: false,
  status: 'offline',
  showStatus: false,
  badge: false,
  badgeContent: '',
  name: '',
  description: '',
  showInfo: false,
  placeholderIcon: User,
  clickable: false,
  bordered: false,
  shadow: false,
})

const emit = defineEmits<{
  click: [event: Event]
  imageError: []
  imageLoad: []
}>()

const imageError = ref(false)

const handleImageError = () => {
  imageError.value = true
  emit('imageError')
}

const handleImageLoad = () => {
  imageError.value = false
  emit('imageLoad')
}

const handleClick = (event: Event) => {
  if (props.clickable) {
    emit('click', event)
  }
}

// 尺寸映射
const sizeMap = {
  xs: { width: 24, height: 24, fontSize: 10, iconSize: 12 },
  sm: { width: 32, height: 32, fontSize: 11, iconSize: 16 },
  md: { width: 40, height: 40, fontSize: 12, iconSize: 20 },
  lg: { width: 48, height: 48, fontSize: 14, iconSize: 24 },
  xl: { width: 64, height: 64, fontSize: 16, iconSize: 32 },
}

const currentSize = computed(() => sizeMap[props.size])

// 计算样式类
const containerClasses = computed(() => [
  'avatar-container',
  `size-${props.size}`,
  {
    clickable: props.clickable,
    'with-info': props.showInfo && (props.name || props.description),
  },
])

const wrapperClasses = computed(() => [
  'avatar-wrapper',
  `shape-${props.shape}`,
  {
    bordered: props.bordered,
    shadow: props.shadow,
  },
])

const imageClasses = computed(() => ['avatar-image', `size-${props.size}`, `shape-${props.shape}`])

const placeholderClasses = computed(() => [
  'avatar-placeholder',
  `size-${props.size}`,
  `shape-${props.shape}`,
])

const levelClasses = computed(() => ['avatar-level', `size-${props.size}`])

const statusClasses = computed(() => [
  'avatar-status',
  `status-${props.status}`,
  `size-${props.size}`,
])

const statusDotClasses = computed(() => ['status-dot', `status-${props.status}`])

const badgeClasses = computed(() => ['avatar-badge', `size-${props.size}`])

const nameClasses = computed(() => ['avatar-name', `size-${props.size}`])

const descriptionClasses = computed(() => ['avatar-description', `size-${props.size}`])

const placeholderIconSize = computed(() => currentSize.value.iconSize)
</script>

<style scoped>
.avatar-container {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.avatar-container.clickable {
  cursor: pointer;
}

.avatar-container.with-info {
  align-items: flex-start;
}

.avatar-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #f3f4f6;
  transition: all 0.3s ease;
}

.avatar-wrapper.shape-circle {
  border-radius: 50%;
}

.avatar-wrapper.shape-square {
  border-radius: 12px;
}

.avatar-wrapper.bordered {
  border: 2px solid #e5e7eb;
}

.avatar-wrapper.shadow {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.avatar-container.clickable .avatar-wrapper:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

/* 尺寸样式 */
.avatar-wrapper.size-xs {
  width: 24px;
  height: 24px;
}

.avatar-wrapper.size-sm {
  width: 32px;
  height: 32px;
}

.avatar-wrapper.size-md {
  width: 40px;
  height: 40px;
}

.avatar-wrapper.size-lg {
  width: 48px;
  height: 48px;
}

.avatar-wrapper.size-xl {
  width: 64px;
  height: 64px;
}

.avatar-image,
.avatar-placeholder {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-placeholder {
  background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
  color: #9ca3af;
}

/* 等级标识 */
.avatar-level {
  position: absolute;
  bottom: -2px;
  right: -2px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  font-weight: bold;
  border-radius: 8px;
  padding: 2px 4px;
  font-size: 10px;
  min-width: 24px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  z-index: 2;
}

.avatar-level.size-xs {
  bottom: -4px;
  right: -4px;
  font-size: 8px;
  min-width: 16px;
  padding: 1px 3px;
}

.avatar-level.size-sm {
  bottom: -3px;
  right: -3px;
  font-size: 9px;
  min-width: 20px;
  padding: 2px 3px;
}

.avatar-level.size-xl {
  bottom: -1px;
  right: -1px;
  font-size: 12px;
  min-width: 28px;
  padding: 3px 6px;
}

/* 状态指示器 */
.avatar-status {
  position: absolute;
  bottom: 0;
  right: 0;
  border-radius: 50%;
  padding: 2px;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 2;
}

.avatar-status.size-xs {
  bottom: -1px;
  right: -1px;
  padding: 1px;
}

.avatar-status.size-sm {
  bottom: -2px;
  right: -2px;
  padding: 2px;
}

.avatar-status.size-xl {
  bottom: 2px;
  right: 2px;
  padding: 3px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-dot.status-online {
  background: #10b981;
}

.status-dot.status-offline {
  background: #6b7280;
}

.status-dot.status-away {
  background: #f59e0b;
}

.status-dot.status-busy {
  background: #ef4444;
}

.avatar-status.size-xs .status-dot {
  width: 6px;
  height: 6px;
}

.avatar-status.size-xl .status-dot {
  width: 12px;
  height: 12px;
}

/* 徽章 */
.avatar-badge {
  position: absolute;
  top: -2px;
  right: -2px;
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
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  z-index: 2;
}

.avatar-badge.size-xs {
  top: -4px;
  right: -4px;
  font-size: 8px;
  min-width: 12px;
  height: 12px;
  padding: 1px 4px;
}

.avatar-badge.size-sm {
  top: -3px;
  right: -3px;
  font-size: 9px;
  min-width: 14px;
  height: 14px;
  padding: 2px 5px;
}

.avatar-badge.size-xl {
  top: -1px;
  right: -1px;
  font-size: 12px;
  min-width: 20px;
  height: 20px;
  padding: 3px 8px;
}

/* 信息区域 */
.avatar-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  text-align: center;
}

.avatar-name {
  font-weight: 600;
  color: #333;
  line-height: 1.2;
}

.avatar-name.size-xs {
  font-size: 10px;
}

.avatar-name.size-sm {
  font-size: 11px;
}

.avatar-name.size-md {
  font-size: 12px;
}

.avatar-name.size-lg {
  font-size: 14px;
}

.avatar-name.size-xl {
  font-size: 16px;
}

.avatar-description {
  font-size: 11px;
  color: #666;
  line-height: 1.2;
}

.avatar-description.size-xs {
  font-size: 9px;
}

.avatar-description.size-sm {
  font-size: 10px;
}

.avatar-description.size-md {
  font-size: 11px;
}

.avatar-description.size-lg {
  font-size: 12px;
}

.avatar-description.size-xl {
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .avatar-wrapper.size-xl {
    width: 56px;
    height: 56px;
  }

  .avatar-level.size-xl {
    font-size: 11px;
    min-width: 24px;
  }

  .avatar-status.size-xl .status-dot {
    width: 10px;
    height: 10px;
  }

  .avatar-badge.size-xl {
    font-size: 11px;
    min-width: 18px;
    height: 18px;
  }
}
</style>
