<template>
  <main class="app-main" :class="mainClasses">
    <!-- 页面标题栏 -->
    <PageHeader
      v-if="showPageHeader"
      :title="pageTitle"
      :subtitle="pageSubtitle"
      :show-back="showBackButton"
      :show-actions="showPageActions"
      @back="handleBack"
    >
      <template #actions>
        <slot name="page-actions"></slot>
      </template>
    </PageHeader>

    <!-- 主要内容区域 -->
    <div class="main-content" :class="contentClasses">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <LoadingState :message="loadingMessage" :size="loadingSize" :variant="loadingVariant" />
      </div>

      <!-- 空状态 -->
      <div v-else-if="isEmpty" class="empty-container">
        <EmptyState
          :icon="emptyIcon"
          :title="emptyTitle"
          :description="emptyDescription"
          :size="emptySize"
          :show-action="showEmptyAction"
        >
          <template #action>
            <slot name="empty-action"></slot>
          </template>
        </EmptyState>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="error-container">
        <div class="error-content">
          <AlertCircle :size="48" class="error-icon" />
          <h3 class="error-title">出错了</h3>
          <p class="error-message">{{ errorMessage }}</p>
          <button class="error-retry" @click="handleRetry">
            <RefreshCw :size="16" />
            <span>重试</span>
          </button>
        </div>
      </div>

      <!-- 正常内容 -->
      <div v-else class="content-wrapper">
        <slot></slot>
      </div>
    </div>

    <!-- 底部操作栏（移动端） -->
    <div v-if="showMobileActions" class="mobile-actions">
      <div class="actions-container">
        <slot name="mobile-actions"></slot>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, type Component } from 'vue'
import { useRouter } from 'vue-router'
import { AlertCircle, RefreshCw } from 'lucide-vue-next'
import PageHeader from '../components/common/PageHeader.vue'
import LoadingState from '../components/common/LoadingState.vue'
import EmptyState from '../components/common/EmptyState.vue'

interface Props {
  loading?: boolean
  loadingMessage?: string
  loadingSize?: 'sm' | 'md' | 'lg'
  loadingVariant?: 'default' | 'overlay' | 'inline'

  isEmpty?: boolean
  emptyIcon?: Component
  emptyTitle?: string
  emptyDescription?: string
  emptySize?: 'sm' | 'md' | 'lg'
  showEmptyAction?: boolean

  error?: boolean
  errorMessage?: string

  showPageHeader?: boolean
  pageTitle?: string
  pageSubtitle?: string
  showBackButton?: boolean
  showPageActions?: boolean

  showMobileActions?: boolean

  padding?: 'none' | 'sm' | 'md' | 'lg'
  maxWidth?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
  centered?: boolean
  scrollable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  loadingMessage: '加载中...',
  loadingSize: 'md',
  loadingVariant: 'spinner',

  isEmpty: false,
  emptyIcon: undefined,
  emptyTitle: '暂无数据',
  emptyDescription: '这里还没有任何内容',
  emptySize: 'md',
  showEmptyAction: false,

  error: false,
  errorMessage: '加载失败，请稍后重试',

  showPageHeader: true,
  pageTitle: '',
  pageSubtitle: '',
  showBackButton: false,
  showPageActions: false,

  showMobileActions: false,

  padding: 'md',
  maxWidth: 'lg',
  centered: false,
  scrollable: true,
})

const emit = defineEmits<{
  back: []
  retry: []
}>()

// 响应式状态
const router = useRouter()

// 计算属性
const mainClasses = computed(() => [
  'app-main',
  `padding-${props.padding}`,
  `max-width-${props.maxWidth}`,
  {
    centered: props.centered,
    scrollable: props.scrollable,
  },
])

const contentClasses = computed(() => [
  'main-content',
  {
    'has-header': props.showPageHeader,
    'has-mobile-actions': props.showMobileActions,
  },
])

// 方法
const handleBack = () => {
  emit('back')
  router.back()
}

const handleRetry = () => {
  emit('retry')
}
</script>

<style scoped>
.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  position: relative;
}

/* 内边距 */
.app-main.padding-none {
  padding: 0;
}

.app-main.padding-sm {
  padding: 12px;
}

.app-main.padding-md {
  padding: 20px;
}

.app-main.padding-lg {
  padding: 32px;
}

/* 最大宽度 */
.app-main.max-width-none {
  max-width: none;
}

.app-main.max-width-sm {
  max-width: 640px;
}

.app-main.max-width-md {
  max-width: 768px;
}

.app-main.max-width-lg {
  max-width: 1024px;
}

.app-main.max-width-xl {
  max-width: 1280px;
}

.app-main.max-width-full {
  max-width: 100%;
}

/* 居中对齐 */
.app-main.centered {
  margin: 0 auto;
}

/* 可滚动 */
.app-main.scrollable {
  overflow-y: auto;
  overflow-x: hidden;
}

.app-main.scrollable::-webkit-scrollbar {
  width: 6px;
}

.app-main.scrollable::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

.app-main.scrollable::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 3px;
}

.app-main.scrollable::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.5);
}

/* 主要内容区域 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.main-content.has-header {
  padding-top: 0;
}

.main-content.has-mobile-actions {
  padding-bottom: 60px;
}

/* 状态容器 */
.loading-container,
.empty-container,
.error-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.error-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
}

.error-icon {
  color: #ef4444;
}

.error-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.error-message {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.error-retry {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  background: #f3f4f6;
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.error-retry:hover {
  background: #e5e7eb;
  color: #374151;
}

/* 内容包装器 */
.content-wrapper {
  flex: 1;
  width: 100%;
}

/* 移动端操作栏 */
.mobile-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.actions-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 12px 16px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .app-main.padding-sm {
    padding: 8px;
  }

  .app-main.padding-md {
    padding: 12px;
  }

  .app-main.padding-lg {
    padding: 16px;
  }

  .main-content.has-mobile-actions {
    padding-bottom: 56px;
  }
}

@media (max-width: 480px) {
  .app-main.padding-sm {
    padding: 6px;
  }

  .app-main.padding-md {
    padding: 8px;
  }

  .app-main.padding-lg {
    padding: 12px;
  }

  .error-title {
    font-size: 16px;
  }

  .error-message {
    font-size: 12px;
  }

  .error-retry {
    padding: 6px 12px;
    font-size: 12px;
  }

  .actions-container {
    padding: 8px 12px;
    gap: 8px;
  }
}

/* 深色主题支持 */
@media (prefers-color-scheme: dark) {
  .app-main {
    background: transparent;
  }

  .error-title {
    color: #f9fafb;
  }

  .error-message {
    color: #9ca3af;
  }

  .error-retry {
    background: #374151;
    color: #9ca3af;
  }

  .error-retry:hover {
    background: #4b5563;
    color: #f9fafb;
  }

  .mobile-actions {
    background: rgba(31, 41, 55, 0.95);
    border-top-color: rgba(255, 255, 255, 0.1);
  }
}
</style>
