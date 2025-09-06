<template>
  <div class="product-detail" :class="detailClasses">
    <!-- 产品图片区域 -->
    <div class="product-image-section">
      <div class="main-image">
        <img
          :src="product.image || defaultImage"
          :alt="product.name"
          @error="handleImageError"
          @load="handleImageLoad"
        />
      </div>
      <div v-if="product.images && product.images.length > 0" class="thumbnail-list">
        <div
          v-for="(image, index) in product.images"
          :key="index"
          class="thumbnail-item"
          :class="{ active: currentImageIndex === index }"
          @click="currentImageIndex = index"
        >
          <img :src="image" :alt="`${product.name} ${index + 1}`" />
        </div>
      </div>
    </div>

    <!-- 产品信息区域 -->
    <div class="product-info-section">
      <div class="product-header">
        <h1 class="product-name">{{ product.name }}</h1>
        <div class="product-badges">
          <span v-if="product.discount" class="discount-badge"> {{ product.discount }}% OFF </span>
          <span v-if="isNew" class="new-badge">新品</span>
          <span v-if="product.requiredLevel" class="level-badge">
            Lv.{{ product.requiredLevel }}
          </span>
        </div>
      </div>

      <div class="product-price">
        <div class="current-price">
          <Coins :size="20" />
          <span class="price-text">{{ formatPrice(product.buyPrice) }}</span>
        </div>
        <div v-if="product.originalPrice" class="original-price">
          <span class="price-text">{{ formatPrice(product.originalPrice) }}</span>
        </div>
      </div>

      <div class="product-description">
        <h3>商品描述</h3>
        <p>{{ product.description || '暂无描述' }}</p>
      </div>

      <div class="product-stats">
        <div class="stat-item">
          <Package :size="16" />
          <span>库存: {{ product.stock || '充足' }}</span>
        </div>
        <div class="stat-item">
          <TrendingUp :size="16" />
          <span>销量: {{ product.salesCount || 0 }}</span>
        </div>
        <div class="stat-item">
          <Star :size="16" />
          <span>评分: {{ product.rating || '5.0' }}</span>
        </div>
      </div>
    </div>

    <!-- 操作区域 -->
    <div class="product-actions">
      <div class="quantity-selector">
        <span class="quantity-label">数量:</span>
        <div class="quantity-controls">
          <button class="quantity-btn" @click="decreaseQuantity" :disabled="quantity <= 1">
            <Minus :size="16" />
          </button>
          <input
            v-model="quantity"
            type="number"
            min="1"
            :max="maxQuantity"
            class="quantity-input"
          />
          <button
            class="quantity-btn"
            @click="increaseQuantity"
            :disabled="quantity >= maxQuantity"
          >
            <Plus :size="16" />
          </button>
        </div>
      </div>

      <div class="action-buttons">
        <button
          class="action-btn buy"
          @click="handleBuy"
          :disabled="!canBuy"
          v-tooltip="buyTooltip"
        >
          <ShoppingCart :size="16" />
          <span>{{ buyButtonText }}</span>
        </button>
        <button
          v-if="showAddToCart"
          class="action-btn add-to-cart"
          @click="handleAddToCart"
          :disabled="!canAddToCart"
          v-tooltip="'加入购物车'"
        >
          <ShoppingBag :size="16" />
          <span>加入购物车</span>
        </button>
      </div>
    </div>

    <!-- 产品详情标签页 -->
    <div class="product-tabs">
      <TabNavigation v-model="activeTab" :tabs="tabs" variant="underline" size="md" />

      <!-- 详细信息标签页 -->
      <div v-if="activeTab === 'details'" class="tab-content">
        <div class="detail-item">
          <h4>商品类型</h4>
          <p>{{ getProductTypeText(product.itemType) }}</p>
        </div>
        <div class="detail-item">
          <h4>商品ID</h4>
          <p>{{ product.itemId }}</p>
        </div>
        <div class="detail-item">
          <h4>上架时间</h4>
          <p>{{ product.createdAt || '未知' }}</p>
        </div>
        <div class="detail-item">
          <h4>最后更新</h4>
          <p>{{ product.updatedAt || '未知' }}</p>
        </div>
      </div>

      <!-- 使用说明标签页 -->
      <div v-if="activeTab === 'usage'" class="tab-content">
        <div class="usage-instructions">
          <h4>使用说明</h4>
          <p>{{ product.usageInstructions || '暂无使用说明' }}</p>
        </div>
        <div v-if="product.effects" class="usage-effects">
          <h4>效果说明</h4>
          <p>{{ product.effects }}</p>
        </div>
      </div>

      <!-- 相关商品标签页 -->
      <div v-if="activeTab === 'related'" class="tab-content">
        <div v-if="relatedProducts.length > 0" class="related-products">
          <h4>相关商品</h4>
          <div class="related-grid">
            <ProductCard
              v-for="relatedProduct in relatedProducts"
              :key="relatedProduct.itemId"
              :product="relatedProduct"
              size="sm"
              variant="compact"
              @click="handleRelatedProductClick(relatedProduct)"
            />
          </div>
        </div>
        <EmptyState
          v-else
          icon="Package"
          title="暂无相关商品"
          description="该商品暂无相关推荐"
          size="sm"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  Coins,
  Package,
  TrendingUp,
  Star,
  Minus,
  Plus,
  ShoppingCart,
  ShoppingBag,
} from 'lucide-vue-next'
import ProductCard from './ProductCard.vue'
import TabNavigation from '../common/TabNavigation.vue'
import EmptyState from '../common/EmptyState.vue'

interface ProductData {
  itemId: number
  name: string
  description?: string
  image?: string
  images?: string[]
  buyPrice: string
  originalPrice?: string
  discount?: number
  requiredLevel?: number
  stock?: number
  salesCount?: number
  rating?: number
  itemType?: 'SEED' | 'PROP' | 'TOOL'
  usageInstructions?: string
  effects?: string
  createdAt?: string
  updatedAt?: string
}

interface Props {
  product: ProductData
  relatedProducts?: ProductData[]
  showAddToCart?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  relatedProducts: () => [],
  showAddToCart: true,
})

const emit = defineEmits<{
  buy: [product: ProductData, quantity: number]
  addToCart: [product: ProductData, quantity: number]
  relatedProductClick: [product: ProductData]
}>()

// 响应式状态
const currentImageIndex = ref(0)
const quantity = ref(1)
const activeTab = ref('details')
const imageError = ref(false)

// 计算属性
const detailClasses = computed(() => ['product-detail'])

const defaultImage = computed(() => {
  const typeMap: Record<string, string> = {
    SEED: '/default-seed.png',
    PROP: '/default-prop.png',
    TOOL: '/default-tool.png',
  }
  return typeMap[props.product.itemType || 'SEED']
})

const isNew = computed(() => {
  // 根据上架时间判断是否为新品（30天内）
  if (!props.product.createdAt) return false
  const createdDate = new Date(props.product.createdAt)
  const now = new Date()
  const daysDiff = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
  return daysDiff <= 30
})

const maxQuantity = computed(() => {
  const stock = props.product.stock
  return stock ? Math.min(stock, 99) : 99
})

const canBuy = computed(() => {
  return props.product.stock !== undefined && props.product.stock > 0
})

const canAddToCart = computed(() => {
  return props.product.stock !== undefined && props.product.stock > 0
})

const buyButtonText = computed(() => {
  if (!canBuy.value) return '缺货'
  return '立即购买'
})

const buyTooltip = computed(() => {
  if (!canBuy.value) return '商品缺货'
  return '购买商品'
})

const tabs = computed(() => [
  { key: 'details', label: '详细信息' },
  { key: 'usage', label: '使用说明' },
  { key: 'related', label: '相关商品' },
])

// 方法
const formatPrice = (price: string) => {
  const num = parseInt(price)
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num.toLocaleString()
}

const getProductTypeText = (itemType?: string) => {
  const typeMap: Record<string, string> = {
    SEED: '种子',
    PROP: '道具',
    TOOL: '工具',
  }
  return typeMap[itemType || 'SEED']
}

const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--
  }
}

const increaseQuantity = () => {
  if (quantity.value < maxQuantity.value) {
    quantity.value++
  }
}

const handleBuy = () => {
  if (!canBuy.value) return
  emit('buy', props.product, quantity.value)
}

const handleAddToCart = () => {
  if (!canAddToCart.value) return
  emit('addToCart', props.product, quantity.value)
}

const handleRelatedProductClick = (product: ProductData) => {
  emit('relatedProductClick', product)
}

const handleImageError = () => {
  imageError.value = true
}

const handleImageLoad = () => {
  imageError.value = false
}

// 生命周期
onMounted(() => {
  // 重置数量
  quantity.value = 1
})
</script>

<style scoped>
.product-detail {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 图片区域 */
.product-image-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.main-image {
  width: 100%;
  height: 400px;
  border-radius: 12px;
  overflow: hidden;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
}

.main-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.main-image.image-error::after {
  content: '图片加载失败';
  position: absolute;
  font-size: 16px;
  color: #6b7280;
}

.thumbnail-list {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.thumbnail-item {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.thumbnail-item:hover {
  transform: scale(1.05);
}

.thumbnail-item.active {
  border-color: #667eea;
}

.thumbnail-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 信息区域 */
.product-info-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.product-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.product-name {
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin: 0;
}

.product-badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.discount-badge {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  font-size: 12px;
  font-weight: bold;
  padding: 4px 8px;
  border-radius: 12px;
}

.new-badge {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  font-size: 12px;
  font-weight: bold;
  padding: 4px 8px;
  border-radius: 12px;
}

.level-badge {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  font-size: 12px;
  font-weight: bold;
  padding: 4px 8px;
  border-radius: 12px;
}

.product-price {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.current-price {
  display: flex;
  align-items: center;
  gap: 8px;
}

.price-text {
  font-size: 24px;
  font-weight: 700;
  color: #f59e0b;
}

.original-price .price-text {
  font-size: 16px;
  color: #9ca3af;
  text-decoration: line-through;
}

.product-description {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.product-description h3 {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.product-description p {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin: 0;
}

.product-stats {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #666;
}

/* 操作区域 */
.product-actions {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
}

.quantity-selector {
  display: flex;
  align-items: center;
  gap: 12px;
}

.quantity-label {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  min-width: 60px;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.quantity-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: white;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quantity-btn:hover:not(:disabled) {
  background: #f3f4f6;
  color: #374151;
}

.quantity-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quantity-input {
  width: 60px;
  height: 32px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn.buy {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.action-btn.add-to-cart {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
}

.action-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 标签页区域 */
.product-tabs {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tab-content {
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
}

.detail-item {
  margin-bottom: 16px;
}

.detail-item:last-child {
  margin-bottom: 0;
}

.detail-item h4 {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px;
}

.detail-item p {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  margin: 0;
}

.usage-instructions,
.usage-effects {
  margin-bottom: 16px;
}

.usage-instructions:last-child,
.usage-effects:last-child {
  margin-bottom: 0;
}

.usage-instructions h4,
.usage-effects h4 {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px;
}

.usage-instructions p,
.usage-effects p {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  margin: 0;
}

.related-products h4 {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin: 0 0 12px;
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .product-detail {
    padding: 16px;
    gap: 16px;
  }

  .main-image {
    height: 300px;
  }

  .product-name {
    font-size: 24px;
  }

  .price-text {
    font-size: 20px;
  }

  .product-actions {
    padding: 12px;
  }

  .action-btn {
    padding: 10px 16px;
    font-size: 14px;
  }

  .related-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }
}

@media (max-width: 480px) {
  .product-detail {
    padding: 12px;
    gap: 12px;
  }

  .main-image {
    height: 200px;
  }

  .product-name {
    font-size: 20px;
  }

  .product-price {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .price-text {
    font-size: 18px;
  }

  .product-stats {
    flex-direction: column;
    gap: 8px;
  }

  .product-actions {
    padding: 8px;
  }

  .quantity-selector {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .action-buttons {
    flex-direction: column;
    gap: 8px;
  }

  .action-btn {
    width: 100%;
    padding: 8px 12px;
    font-size: 14px;
  }

  .related-grid {
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  }
}

/* 深色主题支持 */
@media (prefers-color-scheme: dark) {
  .product-detail {
    background: rgba(31, 41, 55, 0.95);
  }

  .main-image {
    background: #1f2937;
  }

  .product-name {
    color: #f9fafb;
  }

  .product-description h3 {
    color: #f9fafb;
  }

  .product-description p {
    color: #9ca3af;
  }

  .product-actions {
    background: #1f2937;
  }

  .quantity-label {
    color: #f9fafb;
  }

  .quantity-input {
    background: #374151;
    border-color: #4b5563;
    color: #f9fafb;
  }

  .detail-item h4 {
    color: #f9fafb;
  }

  .detail-item p {
    color: #9ca3af;
  }

  .usage-instructions h4,
  .usage-effects h4 {
    color: #f9fafb;
  }

  .usage-instructions p,
  .usage-effects p {
    color: #9ca3af;
  }

  .related-products h4 {
    color: #f9fafb;
  }

  .tab-content {
    background: #1f2937;
  }
}
</style>
