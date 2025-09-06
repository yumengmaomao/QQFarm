<template>
  <div class="expiring-items">
    <div class="section-header">
      <h2 class="section-title">
        <Clock :size="20" />
        <span>即将过期</span>
      </h2>
      <div class="expiry-timer">
        <Clock :size="16" />
        <span>24小时内过期</span>
      </div>
    </div>
    <div class="expiring-items-grid">
      <WarehouseItem
        v-for="item in expiringItems"
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
import { Clock } from 'lucide-vue-next'
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

defineProps<{
  expiringItems: Item[]
}>()

defineEmits<{
  'item-click': [item: Item]
  'item-use': [item: Item]
  'item-sell': [item: Item]
  'item-gift': [item: Item]
}>()
</script>

<style scoped>
.expiring-items {
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

.expiry-timer {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: var(--color-warning);
}

.expiring-items-grid {
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

  .expiry-timer {
    font-size: 12px;
  }

  .expiring-items-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 8px;
  }
}
</style>
