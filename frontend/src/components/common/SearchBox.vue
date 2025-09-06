<template>
  <div class="search-box" :class="{ 'with-background': withBackground }">
    <component :is="icon" :size="iconSize" class="search-icon" />
    <input
      ref="inputRef"
      type="text"
      :value="modelValue"
      :placeholder="placeholder"
      @input="handleInput"
      @keyup.enter="handleEnter"
      @keyup.esc="handleEscape"
      @focus="handleFocus"
      @blur="handleBlur"
      :disabled="disabled"
      :readonly="readonly"
    />
    <button v-if="modelValue && clearable" class="clear-btn" @click="handleClear" type="button">
      <X :size="16" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, type Component } from 'vue'
import { Search, X } from 'lucide-vue-next'

interface Props {
  modelValue?: string
  placeholder?: string
  icon?: Component
  iconSize?: number
  clearable?: boolean
  disabled?: boolean
  readonly?: boolean
  withBackground?: boolean
  autofocus?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: '搜索...',
  icon: Search,
  iconSize: 20,
  clearable: true,
  disabled: false,
  readonly: false,
  withBackground: true,
  autofocus: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  search: [value: string]
  clear: []
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
  enter: [value: string]
  escape: []
}>()

const inputRef = ref<HTMLInputElement>()

const handleInput = (event: Event) => {
  const value = (event.target as HTMLInputElement).value
  emit('update:modelValue', value)
}

const handleClear = () => {
  emit('update:modelValue', '')
  emit('clear')
  nextTick(() => {
    inputRef.value?.focus()
  })
}

const handleFocus = (event: FocusEvent) => {
  emit('focus', event)
}

const handleBlur = (event: FocusEvent) => {
  emit('blur', event)
}

const handleEnter = () => {
  emit('search', props.modelValue)
  emit('enter', props.modelValue)
}

const handleEscape = () => {
  emit('escape')
}

// 自动聚焦
if (props.autofocus) {
  nextTick(() => {
    inputRef.value?.focus()
  })
}

// 暴露方法供外部调用
defineExpose({
  focus: () => inputRef.value?.focus(),
  blur: () => inputRef.value?.blur(),
  select: () => inputRef.value?.select(),
})
</script>

<style scoped>
.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 12px;
  transition: all 0.3s ease;
  position: relative;
}

.search-box.with-background {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.search-box:hover {
  background: rgba(255, 255, 255, 0.15);
}

.search-box:focus-within {
  background: rgba(255, 255, 255, 0.2);
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.3);
}

.search-icon {
  color: rgba(255, 255, 255, 0.7);
  flex-shrink: 0;
}

.search-box input {
  flex: 1;
  background: none;
  border: none;
  color: white;
  font-size: 14px;
  outline: none;
  width: 100%;
}

.search-box input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.search-box input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.search-box input:read-only {
  cursor: default;
}

.clear-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  color: rgba(255, 255, 255, 0.6);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.clear-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
}

/* 深色背景下的样式 */
.search-box:not(.with-background) {
  background: rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.search-box:not(.with-background):hover {
  background: rgba(0, 0, 0, 0.15);
  border-color: rgba(255, 255, 255, 0.2);
}

.search-box:not(.with-background):focus-within {
  background: rgba(0, 0, 0, 0.2);
  border-color: rgba(102, 126, 234, 0.5);
}

.search-box:not(.with-background) .search-icon {
  color: rgba(255, 255, 255, 0.6);
}

.search-box:not(.with-background) input {
  color: rgba(255, 255, 255, 0.9);
}

.search-box:not(.with-background) input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.search-box:not(.with-background) .clear-btn {
  color: rgba(255, 255, 255, 0.5);
}

.search-box:not(.with-background) .clear-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.7);
}

@media (max-width: 480px) {
  .search-box {
    padding: 10px 12px;
  }

  .search-icon {
    width: 16px;
    height: 16px;
  }

  .search-box input {
    font-size: 13px;
  }

  .clear-btn {
    padding: 2px;
  }
}
</style>
