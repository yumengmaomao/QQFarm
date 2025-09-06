<template>
  <div v-if="visible" class="modal-overlay" @click="handleOverlayClick">
    <div
      class="modal-content"
      :class="[size, { 'no-padding': noPadding }]"
      @click.stop
      v-motion
      :initial="{ scale: 0.8, opacity: 0 }"
      :enter="{ scale: 1, opacity: 1 }"
    >
      <div v-if="showHeader" class="modal-header">
        <h3>{{ title }}</h3>
        <button class="close-btn" @click="handleClose">
          <X :size="24" />
        </button>
      </div>

      <div class="modal-body" :class="{ 'no-header': !showHeader }">
        <slot></slot>
      </div>

      <div v-if="showFooter" class="modal-footer">
        <slot name="footer">
          <div class="default-footer">
            <button class="btn cancel" @click="handleCancel" v-if="showCancel">
              {{ cancelText }}
            </button>
            <button class="btn confirm" @click="handleConfirm" v-if="showConfirm">
              {{ confirmText }}
            </button>
          </div>
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { X } from 'lucide-vue-next'

interface Props {
  visible: boolean
  title?: string
  size?: 'small' | 'medium' | 'large'
  showHeader?: boolean
  showFooter?: boolean
  showCancel?: boolean
  showConfirm?: boolean
  cancelText?: string
  confirmText?: string
  noPadding?: boolean
  closeOnOverlay?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  title: '',
  size: 'medium',
  showHeader: true,
  showFooter: true,
  showCancel: true,
  showConfirm: true,
  cancelText: '取消',
  confirmText: '确定',
  noPadding: false,
  closeOnOverlay: true,
})

const emit = defineEmits<{
  'update:visible': [value: boolean]
  close: []
  cancel: []
  confirm: []
}>()

const handleClose = () => {
  emit('update:visible', false)
  emit('close')
}

const handleCancel = () => {
  emit('cancel')
  handleClose()
}

const handleConfirm = () => {
  emit('confirm')
}

const handleOverlayClick = () => {
  if (props.closeOnOverlay) {
    handleClose()
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  border-radius: 16px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.modal-content.small {
  width: 90%;
  max-width: 300px;
}

.modal-content.medium {
  width: 90%;
  max-width: 400px;
}

.modal-content.large {
  width: 90%;
  max-width: 500px;
}

.modal-content.no-padding {
  padding: 0;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 8px;
  color: #666;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: #f0f0f0;
}

.modal-body {
  padding: 20px;
  max-height: 60vh;
  overflow-y: auto;
}

.modal-body.no-header {
  padding-top: 20px;
}

.modal-footer {
  padding: 20px;
  border-top: 1px solid #eee;
}

.default-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 80px;
}

.btn.cancel {
  background: #f3f4f6;
  color: #6b7280;
}

.btn.cancel:hover {
  background: #e5e7eb;
}

.btn.confirm {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.btn.confirm:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

@media (max-width: 480px) {
  .modal-content {
    width: 95%;
    margin: 20px;
    max-height: 95vh;
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 16px;
  }

  .default-footer {
    flex-direction: column-reverse;
    gap: 8px;
  }

  .btn {
    width: 100%;
  }
}
</style>
