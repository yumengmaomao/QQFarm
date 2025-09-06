<template>
  <ModalDialog
    :visible="visible"
    :title="title"
    :size="size"
    :closable="closable"
    :mask-closable="maskClosable"
    @update:visible="handleVisibleChange"
    @close="handleClose"
  >
    <div class="confirm-content">
      <!-- 图标区域 -->
      <div class="confirm-icon" :class="iconClasses">
        <component :is="icon" :size="iconSize" />
      </div>

      <!-- 消息内容 -->
      <div class="confirm-message">
        <div class="message-text">{{ message }}</div>
        <div v-if="subMessage" class="sub-message-text">{{ subMessage }}</div>
      </div>

      <!-- 警告信息 -->
      <div v-if="warning" class="confirm-warning">
        <AlertTriangle :size="16" />
        <span>{{ warning }}</span>
      </div>

      <!-- 自定义内容 -->
      <div v-if="$slots.default" class="confirm-custom">
        <slot></slot>
      </div>
    </div>

    <!-- 底部按钮 -->
    <template #footer>
      <div class="confirm-actions">
        <button class="action-btn cancel" @click="handleCancel">
          {{ cancelText }}
        </button>
        <button
          class="action-btn confirm"
          :class="confirmButtonClasses"
          @click="handleConfirm"
          :disabled="confirmDisabled"
        >
          <component v-if="confirmIcon" :is="confirmIcon" :size="16" />
          <span>{{ confirmText }}</span>
        </button>
      </div>
    </template>
  </ModalDialog>
</template>

<script setup lang="ts">
import { computed, type Component } from 'vue'
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  HelpCircle,
  Trash2,
  LogOut,
  Shield,
  ShoppingCart,
} from 'lucide-vue-next'
import ModalDialog from '../common/ModalDialog.vue'

interface Props {
  visible: boolean
  title?: string
  message: string
  subMessage?: string
  warning?: string
  icon?: Component
  iconType?: 'info' | 'success' | 'error' | 'warning' | 'question' | 'danger'
  confirmText?: string
  cancelText?: string
  confirmIcon?: Component
  confirmButtonType?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
  size?: 'small' | 'medium' | 'large'
  closable?: boolean
  maskClosable?: boolean
  confirmDisabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  title: '确认操作',
  message: '',
  subMessage: '',
  warning: '',
  icon: undefined,
  iconType: 'question',
  confirmText: '确认',
  cancelText: '取消',
  confirmIcon: undefined,
  confirmButtonType: 'primary',
  size: 'medium',
  closable: true,
  maskClosable: true,
  confirmDisabled: false,
})

const emit = defineEmits<{
  'update:visible': [visible: boolean]
  confirm: []
  cancel: []
  close: []
}>()

// 计算属性
const iconClasses = computed(() => ['confirm-icon', `type-${props.iconType}`])

const iconSize = computed(() => {
  const sizeMap: Record<string, number> = {
    small: 32,
    medium: 48,
    large: 64,
  }
  return sizeMap[props.size]
})

const confirmButtonClasses = computed(() => [
  'action-btn',
  'confirm',
  `type-${props.confirmButtonType}`,
])

// 预设图标映射
const presetIcons = {
  info: HelpCircle,
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  question: HelpCircle,
  danger: XCircle,
}

// 方法
const handleVisibleChange = (visible: boolean) => {
  emit('update:visible', visible)
}

const handleConfirm = () => {
  emit('confirm')
}

const handleCancel = () => {
  emit('cancel')
  emit('update:visible', false)
}

const handleClose = () => {
  emit('close')
  emit('update:visible', false)
}

// 暴露预设图标
defineExpose({
  icons: {
    info: HelpCircle,
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    question: HelpCircle,
    danger: XCircle,
    delete: Trash2,
    logout: LogOut,
    shield: Shield,
    buy: ShoppingCart,
  },
})
</script>

<style scoped>
.confirm-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 20px;
  text-align: center;
}

/* 图标区域 */
.confirm-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.confirm-icon.type-info {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
}

.confirm-icon.type-success {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.confirm-icon.type-error {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
}

.confirm-icon.type-warning {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
}

.confirm-icon.type-question {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.confirm-icon.type-danger {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
}

/* 消息内容 */
.confirm-message {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 400px;
}

.message-text {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  line-height: 1.4;
}

.sub-message-text {
  font-size: 14px;
  color: #666;
  line-height: 1.4;
}

/* 警告信息 */
.confirm-warning {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #fef3c7;
  border: 1px solid #fde68a;
  border-radius: 8px;
  color: #92400e;
  font-size: 14px;
  font-weight: 500;
}

/* 自定义内容 */
.confirm-custom {
  width: 100%;
  margin-top: 16px;
}

/* 操作按钮 */
.confirm-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  width: 100%;
}

.action-btn {
  flex: 1;
  min-width: 100px;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn.cancel {
  background: #f3f4f6;
  color: #6b7280;
}

.action-btn.cancel:hover {
  background: #e5e7eb;
  color: #374151;
}

.action-btn.confirm {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.action-btn.confirm.type-secondary {
  background: #f3f4f6;
  color: #6b7280;
}

.action-btn.confirm.type-success {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.action-btn.confirm.type-warning {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
}

.action-btn.confirm.type-danger {
  background: linear-gradient(135deg, #ef4444, #dc2626);
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

/* 尺寸变体 */
:deep(.modal-dialog.size-sm) .confirm-content {
  padding: 16px;
}

:deep(.modal-dialog.size-sm) .confirm-icon {
  width: 60px;
  height: 60px;
}

:deep(.modal-dialog.size-sm) .message-text {
  font-size: 14px;
}

:deep(.modal-dialog.size-sm) .sub-message-text {
  font-size: 12px;
}

:deep(.modal-dialog.size-sm) .action-btn {
  padding: 8px 16px;
  font-size: 12px;
}

:deep(.modal-dialog.size-lg) .confirm-content {
  padding: 24px;
}

:deep(.modal-dialog.size-lg) .confirm-icon {
  width: 100px;
  height: 100px;
}

:deep(.modal-dialog.size-lg) .message-text {
  font-size: 18px;
}

:deep(.modal-dialog.size-lg) .sub-message-text {
  font-size: 16px;
}

:deep(.modal-dialog.size-lg) .action-btn {
  padding: 12px 24px;
  font-size: 16px;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .confirm-content {
    padding: 16px;
  }

  .confirm-icon {
    width: 60px;
    height: 60px;
  }

  .message-text {
    font-size: 14px;
  }

  .sub-message-text {
    font-size: 12px;
  }

  .confirm-warning {
    padding: 8px 12px;
    font-size: 12px;
  }

  .confirm-actions {
    flex-direction: column;
    gap: 8px;
  }

  .action-btn {
    width: 100%;
  }
}

/* 深色主题支持 */
@media (prefers-color-scheme: dark) {
  .message-text {
    color: #f9fafb;
  }

  .sub-message-text {
    color: #9ca3af;
  }

  .confirm-warning {
    background: #451a03;
    border-color: #78350f;
    color: #fbbf24;
  }

  .action-btn.cancel {
    background: #374151;
    color: #9ca3af;
  }

  .action-btn.cancel:hover {
    background: #4b5563;
    color: #f9fafb;
  }
}
</style>
