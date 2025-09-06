<template>
  <div class="category-section">
    <div class="section-header">
      <h2 class="section-title">
        <component :is="category.icon" :size="20" />
        <span>{{ category.name }}</span>
      </h2>
      <div class="category-stats">
        <span class="stat-item">总计: {{ category.totalItems }}个</span>
        <span class="stat-item">价值: {{ formatCoins(category.totalValue) }}</span>
      </div>
    </div>
    <div class="category-items-grid">
      <WarehouseItem
        v-for="item in category.items"
        :key="item.id"
        :item="item"
        @click="$emit('item-click', $event)"
        @use="$emit('item-use', $event)"
        @sell="$emit('item-sell', $event)"
        @gift="$emit('item-gift', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import WarehouseItem from './WarehouseItem.vue'

interface Item {
  id: string
  name: string
  image: string
  quantity: number
  value: number
  expiryTime?: string
  canUse: boolean
  canSell: boolean
  canGift: boolean
  isExpiring?: boolean
}

interface CategoryItem {
  id: string
  name: string
  icon: Component
  totalItems: number
  totalValue: number
  items: Item[]
}

defineProps<{
  category: CategoryItem
}>()

defineEmits<{
  'item-click': [item: Item]
  'item-use': [item: Item]
  'item-sell': [item: Item]
  'item-gift': [item: Item]
}>()

const formatCoins = (value: number) => {
  return `${value.toLocaleString()} 金币`
}
</script>

<style scoped>
.category-section {
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-border);
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

.category-stats {
  display: flex;
  gap: 16px;
  font-size: 14px;
  color: var(--color-text-secondary);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.category-items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
}

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .section-title {
    font-size: 16px;
  }

  .category-stats {
    font-size: 12px;
  }

  .category-items-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 8px;
  }
}
</style>
