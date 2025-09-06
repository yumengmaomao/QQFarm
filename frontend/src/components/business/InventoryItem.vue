<template>
  <div class="inventory-item" :class="itemClasses" @click="handleClick">
    <!-- 图片区域 -->
    <div class="item-image" :class="imageClasses">
      <img
        :src="item.image || defaultImage"
        :alt="item.name"
        @error="handleImageError"
        @load="handleImageLoad"
      />
      <!-- 数量徽章 -->
      <div v-if="showQuantityBadge && item.quantity > 1" class="quantity-badge">
        {{ item.quantity }}
      </div>
      <!-- 类型标识 -->
      <div v-if="showTypeBadge" class="type-badge" :class="typeBadgeClasses">
        {{ typeText }}
      </div>
    </div>

    <!-- 信息区域 -->
    <div class="item-info">
      <div class="item-name">{{ item.name }}</div>
      <div v-if="showQuantity" class="item-quantity">
        <Package :size="12" />
        <span>x{{ item.quantity }}</span>
      </div>
      <div v-if="showValue && itemValue" class="item-value">
        <Coins :size="12" />
        <span>{{ itemValue }}</span>
      </div>
    </div>

    <!-- 操作区域 -->
    <div class="item-actions">
      <button
        v-if="showUseButton"
        class="action-btn use"
        @click.stop="handleUse"
        :disabled="!canUse"
        v-tooltip="useTooltip"
      >
        <component :is="useIcon" :size="14" />
        <span>{{ useButtonText }}</span>
      </button>
      <button
        v-if="showSellButton && canSell"
        class="action-btn sell"
        @click.stop="handleSell"
        v-tooltip="sellTooltip"
      >
        <ShoppingCart :size="14" />
        <span>出售</span>
      </button>
      <button
        v-if="showDetailButton"
        class="action-btn detail"
        @click.stop="handleDetail"
        v-tooltip="'查看详情'"
      >
        <Eye :size="14" />
      </button>
    </div>

    <!-- 状态指示器 -->
    <div v-if="showStatus && itemStatus" class="item-status">
      <StatusIndicator :status="itemStatus" size="xs" :show-text="false" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Package, Coins, ShoppingCart, Eye, Sprout, Wrench, Droplets, Wheat } from 'lucide-vue-next'
import StatusIndicator from '../common/StatusIndicator.vue'

interface InventoryItemData {
  itemId: number
  name: string
  quantity: number
  image?: string
  itemType?: 'SEED' | 'FRUIT' | 'PROP' | 'TOOL'
  value?: string
  status?: 'available' | 'limited' | 'unavailable'
  canUse?: boolean
  canSell?: boolean
}

interface Props {
  item: InventoryItemData
  size?: 'sm' | 'md' | 'lg'
  showQuantity?: boolean
  showQuantityBadge?: boolean
  showValue?: boolean
  showStatus?: boolean
  showTypeBadge?: boolean
  showUseButton?: boolean
  showSellButton?: boolean
  showDetailButton?: boolean
  variant?: 'default' | 'compact' | 'detailed'
  clickable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  showQuantity: true,
  showQuantityBadge: true,
  showValue: false,
  showStatus: false,
  showTypeBadge: true,
  showUseButton: true,
  showSellButton: false,
  showDetailButton: false,
  variant: 'default',
  clickable: true,
})

const emit = defineEmits<{
  click: [item: InventoryItemData]
  use: [item: InventoryItemData]
  sell: [item: InventoryItemData]
  detail: [item: InventoryItemData]
}>()

// 响应式状态
const imageError = ref(false)

// 计算属性
const itemClasses = computed(() => [
  'inventory-item',
  `size-${props.size}`,
  `variant-${props.variant}`,
  `type-${props.item.itemType?.toLowerCase() || 'default'}`,
  {
    clickable: props.clickable,
    'can-use': canUse.value,
    'can-sell': canSell.value,
    'has-status': props.showStatus && itemStatus.value,
    'limited-stock': limitedStock.value,
  },
])

const imageClasses = computed(() => [
  'item-image',
  `size-${props.size}`,
  {
    'image-error': imageError.value,
  },
])

const defaultImage = computed(() => {
  const typeMap = {
    SEED: '/default-seed.png',
    FRUIT: '/default-fruit.png',
    PROP: '/default-prop.png',
    TOOL: '/default-tool.png',
  }
  return typeMap[props.item.itemType || 'SEED']
})

const typeText = computed(() => {
  const typeMap = {
    SEED: '种子',
    FRUIT: '果实',
    PROP: '道具',
    TOOL: '工具',
  }
  return typeMap[props.item.itemType || 'SEED']
})

const typeBadgeClasses = computed(() => [
  'type-badge',
  `type-${props.item.itemType?.toLowerCase() || 'default'}`,
])

const itemValue = computed(() => {
  if (!props.showValue || !props.item.value) return null
  const value = parseInt(props.item.value)
  if (value >= 10000) {
    return (value / 10000).toFixed(1) + '万'
  }
  return value.toLocaleString()
})

const itemStatus = computed(() => {
  if (!props.showStatus) return null
  if (props.item.status === 'limited') return 'warning'
  if (props.item.status === 'unavailable') return 'error'
  return 'success'
})

const canUse = computed(() => {
  return props.item.canUse !== false && props.item.quantity > 0
})

const canSell = computed(() => {
  return props.item.canSell !== false && props.item.quantity > 0 && props.item.itemType === 'FRUIT'
})

const limitedStock = computed(() => {
  return props.item.quantity <= 5 && props.item.quantity > 0
})

const useIcon = computed(() => {
  const iconMap = {
    SEED: Sprout,
    FRUIT: Wheat,
    PROP: Wrench,
    TOOL: Droplets,
  }
  return iconMap[props.item.itemType || 'SEED']
})

const useButtonText = computed(() => {
  const textMap = {
    SEED: '种植',
    FRUIT: '使用',
    PROP: '使用',
    TOOL: '使用',
  }
  return textMap[props.item.itemType || 'SEED']
})

const useTooltip = computed(() => {
  if (!canUse.value) return '无法使用'
  return useButtonText.value
})

const sellTooltip = computed(() => {
  if (!canSell.value) return '无法出售'
  return '出售物品'
})

// 方法
const handleClick = () => {
  if (props.clickable) {
    emit('click', props.item)
  }
}

const handleUse = () => {
  if (!canUse.value) return
  emit('use', props.item)
}

const handleSell = () => {
  if (!canSell.value) return
  emit('sell', props.item)
}

const handleDetail = () => {
  emit('detail', props.item)
}

const handleImageError = () => {
  imageError.value = true
}

const handleImageLoad = () => {
  imageError.value = false
}
</script>

<style scoped>
.inventory-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.inventory-item.clickable {
  cursor: pointer;
}

.inventory-item.clickable:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.inventory-item.can-use {
  border-color: rgba(16, 185, 129, 0.3);
}

.inventory-item.can-sell {
  border-color: rgba(245, 158, 11, 0.3);
}

.inventory-item.has-status {
  border-color: rgba(239, 68, 68, 0.3);
}

.inventory-item.limited-stock {
  border-color: rgba(245, 158, 11, 0.3);
}

/* 类型样式 */
.inventory-item.type-seed {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05));
}

.inventory-item.type-fruit {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.05), rgba(217, 119, 6, 0.05));
}

.inventory-item.type-prop {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.05), rgba(124, 58, 237, 0.05));
}

.inventory-item.type-tool {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(37, 99, 235, 0.05));
}

/* 尺寸变体 */
.inventory-item.size-sm {
  padding: 8px;
  gap: 8px;
}

.inventory-item.size-lg {
  padding: 16px;
  gap: 16px;
}

/* 样式变体 */
.inventory-item.variant.compact {
  padding: 6px 8px;
  gap: 8px;
}

.inventory-item.variant.detailed {
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
}

.inventory-item.variant.detailed .item-image {
  align-self: center;
}

/* 图片区域 */
.item-image {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  overflow: hidden;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  flex-shrink: 0;
}

.inventory-item.size-sm .item-image {
  width: 36px;
  height: 36px;
}

.inventory-item.size-lg .item-image {
  width: 64px;
  height: 64px;
}

.inventory-item.variant.compact .item-image {
  width: 32px;
  height: 32px;
}

.inventory-item.variant.detailed .item-image {
  width: 80px;
  height: 80px;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-image.image-error {
  background: #f3f4f6;
}

.item-image.image-error::after {
  content: '图片加载失败';
  position: absolute;
  font-size: 10px;
  color: #6b7280;
}

/* 徽章 */
.quantity-badge {
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
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  z-index: 2;
}

.type-badge {
  position: absolute;
  bottom: -4px;
  left: -4px;
  font-size: 9px;
  font-weight: 500;
  padding: 2px 6px;
  border-radius: 8px;
  color: white;
  z-index: 2;
}

.type-badge.type-seed {
  background: #667eea;
}

.type-badge.type-fruit {
  background: #f59e0b;
}

.type-badge.type-prop {
  background: #8b5cf6;
}

.type-badge.type-tool {
  background: #3b82f6;
}

/* 信息区域 */
.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.item-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.inventory-item.size-sm .item-name {
  font-size: 12px;
}

.inventory-item.size-lg .item-name {
  font-size: 16px;
}

.item-quantity,
.item-value {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #666;
}

.inventory-item.size-sm .item-quantity,
.inventory-item.size-sm .item-value {
  font-size: 11px;
  gap: 3px;
}

.inventory-item.size-lg .item-quantity,
.inventory-item.size-lg .item-value {
  font-size: 14px;
}

/* 操作区域 */
.item-actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.inventory-item.size-sm .item-actions {
  gap: 4px;
}

.inventory-item.size-lg .item-actions {
  gap: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.action-btn.use {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.action-btn.sell {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
}

.action-btn.detail {
  background: #f3f4f6;
  color: #6b7280;
}

.action-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.inventory-item.size-sm .action-btn {
  padding: 4px 8px;
  font-size: 11px;
}

.inventory-item.size-lg .action-btn {
  padding: 8px 16px;
  font-size: 14px;
}

/* 状态指示器 */
.item-status {
  position: absolute;
  top: 8px;
  right: 8px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .inventory-item {
    padding: 8px;
    gap: 8px;
  }

  .inventory-item.size-sm {
    padding: 6px;
    gap: 6px;
  }

  .inventory-item.size-lg {
    padding: 12px;
    gap: 12px;
  }

  .item-name {
    font-size: 12px;
  }

  .inventory-item.size-sm .item-name {
    font-size: 11px;
  }

  .inventory-item.size-lg .item-name {
    font-size: 14px;
  }

  .item-quantity,
  .item-value {
    font-size: 11px;
  }

  .inventory-item.size-sm .item-quantity,
  .inventory-item.size-sm .item-value {
    font-size: 10px;
  }

  .item-actions {
    gap: 4px;
  }

  .action-btn {
    padding: 4px 8px;
    font-size: 11px;
  }

  .inventory-item.size-sm .action-btn {
    padding: 3px 6px;
    font-size: 10px;
  }

  .inventory-item.size-lg .action-btn {
    padding: 6px 12px;
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .inventory-item {
    flex-direction: column;
    text-align: center;
    gap: 8px;
    padding: 12px 8px;
  }

  .inventory-item.size-sm {
    padding: 8px 6px;
    gap: 6px;
  }

  .inventory-item.size-lg {
    padding: 16px 12px;
    gap: 12px;
  }

  .inventory-item.variant.compact {
    flex-direction: row;
    text-align: left;
  }

  .inventory-item.variant.detailed {
    flex-direction: column;
    text-align: center;
  }

  .item-info {
    align-items: center;
    gap: 2px;
  }

  .item-actions {
    justify-content: center;
    width: 100%;
  }

  .action-btn {
    flex: 1;
    max-width: 80px;
  }

  .quantity-badge {
    top: -4px;
    right: -4px;
    font-size: 9px;
    padding: 1px 4px;
    min-width: 14px;
    height: 14px;
  }

  .type-badge {
    bottom: -4px;
    left: -4px;
    font-size: 8px;
    padding: 1px 4px;
  }
}

/* 深色主题支持 */
@media (prefers-color-scheme: dark) {
  .inventory-item {
    background: rgba(31, 41, 55, 0.95);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .item-name {
    color: #f9fafb;
  }

  .item-quantity,
  .item-value {
    color: #9ca3af;
  }

  .action-btn.detail {
    background: #374151;
    color: #9ca3af;
  }

  .action-btn.detail:hover {
    background: #4b5563;
    color: #f9fafb;
  }

  .item-image {
    background: #1f2937;
  }

  .item-image.image-error::after {
    color: #6b7280;
  }

  .type-badge.type-seed {
    background: #6366f1;
  }

  .type-badge.type-fruit {
    background: #eab308;
  }

  .type-badge.type-prop {
    background: #7c3aed;
  }

  .type-badge.type-tool {
    background: #60a5fa;
  }
}
</style>
