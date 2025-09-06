<template>
  <div class="product-card" :class="cardClasses" @click="handleClick">
    <!-- 图片区域 -->
    <div class="product-image" :class="imageClasses">
      <img
        :src="product.image || defaultImage"
        :alt="product.name"
        @error="handleImageError"
        @load="handleImageLoad"
      />
      <div v-if="showBadge && productBadge" class="product-badge">
        {{ productBadge }}
      </div>
    </div>

    <!-- 信息区域 -->
    <div class="product-info">
      <div class="product-name">{{ product.name }}</div>
      <div v-if="showDescription && product.description" class="product-description">
        {{ product.description }}
      </div>
      <div class="product-meta">
        <div v-if="showPrice" class="product-price">
          <Coins :size="14" />
          <span>{{ formatPrice(product.buyPrice) }}</span>
        </div>
        <div v-if="showLevel && product.requiredLevel" class="product-level">
          <Crown :size="14" />
          <span>Lv.{{ product.requiredLevel }}</span>
        </div>
      </div>
    </div>

    <!-- 操作区域 -->
    <div class="product-actions">
      <button
        class="action-btn buy"
        @click.stop="handleBuy"
        :disabled="!canBuy"
        v-tooltip="buyTooltip"
      >
        <ShoppingCart :size="16" />
        <span>{{ buyButtonText }}</span>
      </button>
      <button
        v-if="showDetailButton"
        class="action-btn detail"
        @click.stop="handleDetail"
        v-tooltip="'查看详情'"
      >
        <Eye :size="16" />
      </button>
    </div>

    <!-- 库存信息 -->
    <div v-if="showStock && product.stock !== undefined" class="product-stock">
      <Package :size="12" />
      <span>库存: {{ product.stock }}</span>
    </div>

    <!-- 限时优惠 -->
    <div v-if="showDiscount && product.discount" class="product-discount">
      <Tag :size="12" />
      <span>{{ product.discount }}% OFF</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Coins, Crown, ShoppingCart, Eye, Package, Tag } from 'lucide-vue-next'

interface ProductData {
  itemId: number
  name: string
  description?: string
  image?: string
  buyPrice: string
  requiredLevel?: number
  stock?: number
  discount?: number
  itemType?: 'SEED' | 'PROP' | 'TOOL'
}

interface Props {
  product: ProductData
  size?: 'sm' | 'md' | 'lg'
  showDescription?: boolean
  showPrice?: boolean
  showLevel?: boolean
  showStock?: boolean
  showDiscount?: boolean
  showBadge?: boolean
  showDetailButton?: boolean
  variant?: 'default' | 'compact' | 'detailed'
  clickable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  showDescription: true,
  showPrice: true,
  showLevel: true,
  showStock: false,
  showDiscount: false,
  showBadge: false,
  showDetailButton: true,
  variant: 'default',
  clickable: true,
})

const emit = defineEmits<{
  click: [product: ProductData]
  buy: [product: ProductData]
  detail: [product: ProductData]
}>()

// 响应式状态
const imageError = ref(false)

// 计算属性
const cardClasses = computed(() => [
  'product-card',
  `size-${props.size}`,
  `variant-${props.variant}`,
  {
    clickable: props.clickable,
    'can-buy': canBuy.value,
    'out-of-stock': outOfStock.value,
    'has-discount': hasDiscount.value,
  },
])

const imageClasses = computed(() => [
  'product-image',
  `size-${props.size}`,
  {
    'image-error': imageError.value,
  },
])

const defaultImage = computed(() => {
  const typeMap = {
    SEED: '/default-seed.png',
    PROP: '/default-prop.png',
    TOOL: '/default-tool.png',
  }
  return typeMap[props.product.itemType || 'SEED']
})

const productBadge = computed(() => {
  if (props.showBadge && props.product.discount) {
    return `-${props.product.discount}%`
  }
  if (props.showBadge && outOfStock.value) {
    return '缺货'
  }
  if (props.showBadge && isNew.value) {
    return '新品'
  }
  return null
})

const canBuy = computed(() => {
  if (outOfStock.value) return false
  if (props.product.requiredLevel && userLevel.value < props.product.requiredLevel) return false
  return true
})

const outOfStock = computed(() => {
  return props.product.stock !== undefined && props.product.stock <= 0
})

const hasDiscount = computed(() => {
  return props.product.discount !== undefined && props.product.discount > 0
})

const isNew = computed(() => {
  // 这里可以根据业务逻辑判断是否为新品
  return false
})

const buyButtonText = computed(() => {
  if (outOfStock.value) return '缺货'
  if (props.product.requiredLevel && userLevel.value < props.product.requiredLevel) {
    return `Lv.${props.product.requiredLevel}`
  }
  return '购买'
})

const buyTooltip = computed(() => {
  if (outOfStock.value) return '商品缺货'
  if (props.product.requiredLevel && userLevel.value < props.product.requiredLevel) {
    return `需要等级 ${props.product.requiredLevel}`
  }
  return '购买商品'
})

// 模拟用户等级（实际项目中应该从store获取）
const userLevel = ref(1)

// 方法
const formatPrice = (price: string) => {
  const num = parseInt(price)
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num.toLocaleString()
}

const handleClick = () => {
  if (props.clickable) {
    emit('click', props.product)
  }
}

const handleBuy = () => {
  if (!canBuy.value) return
  emit('buy', props.product)
}

const handleDetail = () => {
  emit('detail', props.product)
}

const handleImageError = () => {
  imageError.value = true
}

const handleImageLoad = () => {
  imageError.value = false
}
</script>

<style scoped>
.product-card {
  position: relative;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.product-card.clickable {
  cursor: pointer;
}

.product-card.clickable:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.product-card.can-buy {
  border-color: rgba(102, 126, 234, 0.3);
}

.product-card.out-of-stock {
  border-color: rgba(239, 68, 68, 0.3);
  opacity: 0.8;
}

.product-card.has-discount {
  border-color: rgba(245, 158, 11, 0.3);
}

/* 尺寸变体 */
.product-card.size-sm {
  width: 140px;
  min-height: 180px;
}

.product-card.size-md {
  width: 160px;
  min-height: 220px;
}

.product-card.size-lg {
  width: 200px;
  min-height: 280px;
}

/* 样式变体 */
.product-card.variant.compact {
  width: 120px;
  min-height: 160px;
}

.product-card.variant.detailed {
  width: 220px;
  min-height: 320px;
}

/* 图片区域 */
.product-image {
  width: 100%;
  height: 120px;
  overflow: hidden;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.product-card.size-sm .product-image {
  height: 80px;
}

.product-card.size-md .product-image {
  height: 120px;
}

.product-card.size-lg .product-image {
  height: 160px;
}

.product-card.variant.compact .product-image {
  height: 70px;
}

.product-card.variant.detailed .product-image {
  height: 180px;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.product-card.clickable:hover .product-image img {
  transform: scale(1.05);
}

.product-image.image-error {
  background: #f3f4f6;
}

.product-image.image-error::after {
  content: '图片加载失败';
  position: absolute;
  font-size: 12px;
  color: #6b7280;
}

/* 徽章 */
.product-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  font-size: 10px;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  z-index: 2;
}

/* 信息区域 */
.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
}

.product-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-card.size-sm .product-name {
  font-size: 12px;
}

.product-card.size-lg .product-name {
  font-size: 16px;
}

.product-description {
  font-size: 11px;
  color: #666;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-card.size-sm .product-description {
  font-size: 10px;
}

.product-card.size-lg .product-description {
  font-size: 12px;
}

.product-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.product-price {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  font-weight: 600;
  color: #f59e0b;
}

.product-level {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #667eea;
  font-weight: 500;
}

/* 操作区域 */
.product-actions {
  display: flex;
  gap: 8px;
  padding: 0 12px 12px;
}

.product-card.size-sm .product-actions {
  gap: 4px;
  padding: 0 8px 8px;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px 12px;
  border: none;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn.buy {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.action-btn.buy:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.action-btn.detail {
  background: #f3f4f6;
  color: #6b7280;
}

.action-btn.detail:hover {
  background: #e5e7eb;
  color: #374151;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 库存信息 */
.product-stock {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #6b7280;
  padding: 0 12px 8px;
}

.product-stock.low-stock {
  color: #ef4444;
}

/* 限时优惠 */
.product-discount {
  position: absolute;
  top: 8px;
  left: 8px;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  font-size: 10px;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  z-index: 2;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .product-card {
    width: calc(50% - 8px);
    margin: 4px;
  }

  .product-card.size-sm {
    width: calc(33.333% - 8px);
    min-height: 160px;
  }

  .product-card.size-md {
    width: calc(50% - 8px);
    min-height: 200px;
  }

  .product-card.size-lg {
    width: calc(50% - 8px);
    min-height: 260px;
  }

  .product-card.variant.compact {
    width: calc(25% - 8px);
    min-height: 140px;
  }

  .product-card.variant.detailed {
    width: calc(50% - 8px);
    min-height: 300px;
  }
}

@media (max-width: 480px) {
  .product-card {
    width: 100%;
    margin: 0 0 12px;
  }

  .product-card.size-sm {
    min-height: 140px;
  }

  .product-card.size-md {
    min-height: 180px;
  }

  .product-card.size-lg {
    min-height: 240px;
  }

  .product-card.variant.compact {
    min-height: 120px;
  }

  .product-card.variant.detailed {
    min-height: 280px;
  }

  .product-actions {
    flex-direction: column;
    gap: 6px;
  }

  .action-btn {
    width: 100%;
  }
}

/* 深色主题支持 */
@media (prefers-color-scheme: dark) {
  .product-card {
    background: rgba(31, 41, 55, 0.95);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .product-name {
    color: #f9fafb;
  }

  .product-description {
    color: #9ca3af;
  }

  .product-price {
    color: #fbbf24;
  }

  .product-level {
    color: #818cf8;
  }

  .action-btn.detail {
    background: #374151;
    color: #9ca3af;
  }

  .action-btn.detail:hover {
    background: #4b5563;
    color: #f9fafb;
  }

  .product-stock {
    color: #9ca3af;
  }

  .product-image {
    background: #1f2937;
  }

  .product-image.image-error::after {
    color: #6b7280;
  }
}
</style>
