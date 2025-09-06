<template>
  <div class="inventory-item" :class="getItemClasses(item)" @click="handleItemClick(item)">
    <div class="item-image">
      <img :src="item.image" :alt="item.name" class="item-img" />
      <div class="item-quantity">{{ item.quantity }}</div>
      <div v-if="item.isExpiring" class="expiry-badge">即将过期</div>
    </div>
    <div class="item-info">
      <div class="item-name">{{ item.name }}</div>
      <div class="item-details">
        <span class="item-value">{{ formatCoins(item.value) }}</span>
        <span class="item-expiry" v-if="item.expiryTime">
          {{ formatTime(item.expiryTime) }}
        </span>
      </div>
    </div>
    <div class="item-actions">
      <button v-if="item.canUse" class="item-action-btn use" @click.stop="handleUseItem(item)">
        <Wrench :size="16" />
      </button>
      <button v-if="item.canSell" class="item-action-btn sell" @click.stop="handleSellItem(item)">
        <ShoppingCart :size="16" />
      </button>
      <button v-if="item.canGift" class="item-action-btn gift" @click.stop="handleGiftItem(item)">
        <Gift :size="16" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Wrench, ShoppingCart, Gift } from 'lucide-vue-next'

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
  item: Item
}>()

const emit = defineEmits<{
  click: [item: Item]
  use: [item: Item]
  sell: [item: Item]
  gift: [item: Item]
}>()

const getItemClasses = (item: Item) => {
  return {
    expired: item.expiryTime && new Date(item.expiryTime) < new Date(),
    expiring: item.isExpiring,
    usable: item.canUse,
    sellable: item.canSell,
    giftable: item.canGift,
  }
}

const formatCoins = (value: number) => {
  return `${value.toLocaleString()} 金币`
}

const formatTime = (time: string) => {
  const date = new Date(time)
  const now = new Date()
  const diff = date.getTime() - now.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(hours / 24)

  if (days > 0) {
    return `${days}天后过期`
  } else if (hours > 0) {
    return `${hours}小时后过期`
  } else {
    return '即将过期'
  }
}

const handleItemClick = (item: Item) => {
  emit('click', item)
}

const handleUseItem = (item: Item) => {
  emit('use', item)
}

const handleSellItem = (item: Item) => {
  emit('sell', item)
}

const handleGiftItem = (item: Item) => {
  emit('gift', item)
}
</script>

<style scoped>
.inventory-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  cursor: pointer;
  transition: all 0.2s ease;
}

.inventory-item:hover {
  background: var(--color-background-hover);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.inventory-item.expired {
  opacity: 0.6;
  background: var(--color-background-muted);
}

.inventory-item.expiring {
  border-color: var(--color-warning);
  background: linear-gradient(135deg, var(--color-background) 0%, rgba(255, 193, 7, 0.05) 100%);
}

.item-image {
  position: relative;
  width: 60px;
  height: 60px;
  margin-right: 12px;
}

.item-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.item-quantity {
  position: absolute;
  bottom: 2px;
  right: 2px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 2px 6px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.expiry-badge {
  position: absolute;
  top: 2px;
  left: 2px;
  background: var(--color-warning);
  color: white;
  padding: 2px 6px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-name {
  font-weight: 600;
  margin-bottom: 4px;
  color: var(--color-text);
}

.item-details {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--color-text-secondary);
}

.item-value {
  font-weight: 500;
  color: var(--color-primary);
}

.item-expiry {
  font-size: 12px;
  color: var(--color-warning);
}

.item-actions {
  display: flex;
  gap: 4px;
}

.item-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: none;
  background: var(--color-background);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.item-action-btn:hover {
  background: var(--color-background-hover);
  color: var(--color-text);
}

.item-action-btn.use:hover {
  background: var(--color-success);
  color: white;
}

.item-action-btn.sell:hover {
  background: var(--color-primary);
  color: white;
}

.item-action-btn.gift:hover {
  background: var(--color-info);
  color: white;
}

@media (max-width: 768px) {
  .inventory-item {
    padding: 8px;
  }

  .item-image {
    width: 50px;
    height: 50px;
    margin-right: 8px;
  }

  .item-name {
    font-size: 14px;
  }

  .item-details {
    font-size: 12px;
  }

  .item-action-btn {
    width: 28px;
    height: 28px;
  }
}
</style>
