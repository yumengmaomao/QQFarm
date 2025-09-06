<template>
  <div class="quick-actions">
    <div class="section-header">
      <h2 class="section-title">
        <Zap :size="20" />
        <span>快速操作</span>
      </h2>
    </div>
    <div class="quick-actions-grid">
      <div
        v-for="action in quickActions"
        :key="action.id"
        class="quick-action-item"
        @click="$emit('action-click', action)"
      >
        <div class="action-icon">
          <component :is="action.icon" :size="24" />
        </div>
        <div class="action-info">
          <div class="action-name">{{ action.name }}</div>
          <div class="action-count">{{ action.count }}个</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import { Zap } from 'lucide-vue-next'

interface QuickAction {
  id: string
  name: string
  icon: Component
  count: number
}

defineProps<{
  quickActions: QuickAction[]
}>()

defineEmits<{
  'action-click': [action: QuickAction]
}>()
</script>

<style scoped>
.quick-actions {
  margin-bottom: 24px;
}

.section-header {
  margin-bottom: 16px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text);
}

.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.quick-action-item {
  display: flex;
  align-items: center;
  padding: 16px;
  border-radius: 8px;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  cursor: pointer;
  transition: all 0.2s ease;
}

.quick-action-item:hover {
  background: var(--color-background-hover);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.action-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  margin-right: 12px;
  background: var(--color-background-muted);
  border-radius: 8px;
  color: var(--color-primary);
}

.action-info {
  flex: 1;
}

.action-name {
  font-weight: 600;
  margin-bottom: 4px;
  color: var(--color-text);
}

.action-count {
  font-size: 14px;
  color: var(--color-text-secondary);
}

@media (max-width: 768px) {
  .quick-actions-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 8px;
  }

  .quick-action-item {
    padding: 12px;
  }

  .action-icon {
    width: 40px;
    height: 40px;
    margin-right: 8px;
  }
}
</style>
