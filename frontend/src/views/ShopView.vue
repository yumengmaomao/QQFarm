<template>
  <div class="shop-view">
    <!-- 桌面端布局 -->
    <div class="desktop-layout">
      <AppHeader
        :show-search="true"
        :show-mobile-menu="false"
        :fixed="true"
        :transparent="false"
        @logo:click="handleLogoClick"
        @search="handleSearch"
        @tab:change="handleTabChange"
        @mobile-menu:click="handleMobileMenuClick"
      />
      
      <AppMain
        :loading="loading"
        :loading-message="loadingMessage"
        :loading-size="lg"
        :loading-variant="overlay"
        :isEmpty="isEmpty"
        :empty-icon="emptyIcon"
        :empty-title="emptyTitle"
        :empty-description="emptyDescription"
        :empty-size="md"
        :show-empty-action="showEmptyAction"
        :error="error"
        :error-message="errorMessage"
        :show-page-header="true"
        :show-mobile-actions="false"
        :padding="lg"
        :max-width="xl"
        :centered="false"
        :scrollable="true"
        :page-title="pageTitle"
        @back="handleBack"
        @retry="handleRetry"
      >
        <!-- 页面标题栏 -->
        <template #page-actions>
          <div class="shop-header-actions">
            <div class="shop-stats">
              <div class="stat-item">
                <Coins :size="20" />
                <span>{{ formatCoins(userCoins) }}</span>
              </div>
              <div class="stat-item">
                <ShoppingBag :size="20" />
                <span>背包 {{ inventoryCount }}</span>
              </div>
              <div class="stat-item">
                <Star :size="20" />
                <span>等级 {{ userLevel }}</span>
              </div>
            </div>
            <div class="shop-actions">
              <button class="action-btn primary" @click="handleQuickBuy">
                <Zap :size="16" />
                <span>快速购买</span>
              </button>
              <button class="action-btn secondary" @click="handleViewWarehouse">
                <Package :size="16" />
                <span>查看仓库</span>
              </button>
              <button class="action-btn tertiary" @click="handleViewHistory">
                <Clock :size="16" />
                <span>购买记录</span>
              </button>
            </div>
          </div>
        </template>

        <!-- 商品分类 -->
        <div class="shop-categories">
          <div class="categories-scroll">
            <button
              class="category-btn"
              :class="{ active: activeCategory === 'all' }"
              @click="handleCategoryChange('all')"
            >
              <Package :size="20" />
              <span>全部商品</span>
            </button>
            <button
              class="category-btn"
              :class="{ active: activeCategory === 'seeds' }"
              @click="handleCategoryChange('seeds')"
            >
              <Sprout :size="20" />
              <span>种子</span>
            </button>
            <button
              class="category-btn"
              :class="{ active: activeCategory === 'tools' }"
              @click="handleCategoryChange('tools')"
            >
              <Wrench :size="20" />
              <span>工具</span>
            </button>
            <button
              class="category-btn"
              :class="{ active: activeCategory === 'decorations' }"
              @click="handleCategoryChange('decorations')"
            >
              <Sparkles :size="20" />
              <span>装饰</span>
            </button>
            <button
              class="category-btn"
              :class="{ active: activeCategory === 'special' }"
              @click="handleCategoryChange('special')"
            >
              <Gem :size="20" />
              <span>特价</span>
            </button>
          </div>
        </div>

        <!-- 商品展示区 -->
        <div class="shop-content">
          <!-- 特价商品区 -->
          <div v-if="showSpecialOffers" class="special-offers">
            <div class="section-header">
              <h2 class="section-title">
                <Flame :size="20" />
                <span>限时特价</span>
              </h2>
              <div class="section-timer">
                <Clock :size="16" />
                <span>{{ formatTime(specialOfferEndTime) }}</span>
              </div>
            </div>
            <div class="special-offers-grid">
              <div
                v-for="product in specialOfferProducts"
                :key="product.id"
                class="special-offer-item"
                @click="handleProductClick(product)"
              >
                <div class="special-badge">特价</div>
                <div class="special-discount">-{{ product.discount }}%</div>
                <ProductCard
                  :product="product"
                  :show-discount="true"
                  :show-original-price="true"
                  :size="md"
                />
              </div>
            </div>
          </div>

          <!-- 热门商品区 -->
          <div class="popular-products">
            <div class="section-header">
              <h2 class="section-title">
                <TrendingUp :size="20" />
                <span>热门商品</span>
              </h2>
              <button class="view-all-btn" @click="handleViewAll('popular')">
                查看全部
                <ChevronRight :size="16" />
              </button>
            </div>
            <div class="popular-products-grid">
              <div
                v-for="product in popularProducts"
                :key="product.id"
                class="popular-product-item"
                @click="handleProductClick(product)"
              >
                <ProductCard
                  :product="product"
                  :show-discount="product.discount > 0"
                  :show-original-price="product.discount > 0"
                  :size="md"
                />
              </div>
            </div>
          </div>

          <!-- 分类商品区 -->
          <div v-for="category in filteredCategories" :key="category.id" class="category-section">
            <div class="section-header">
              <h2 class="section-title">
                <component :is="category.icon" :size="20" />
                <span>{{ category.name }}</span>
              </h2>
              <button class="view-all-btn" @click="handleViewAll(category.id)">
                查看全部
                <ChevronRight :size="16" />
              </button>
            </div>
            <div class="category-products-grid">
              <div
                v-for="product in category.products"
                :key="product.id"
                class="category-product-item"
                @click="handleProductClick(product)"
              >
                <ProductCard
                  :product="product"
                  :show-discount="product.discount > 0"
                  :show-original-price="product.discount > 0"
                  :size="md"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态操作 -->
        <template v-if="showEmptyAction" #empty-action>
          <button class="empty-action-btn" @click="handleRefresh">
            <RefreshCw :size="16" />
            <span>刷新商品</span>
          </button>
        </template>
      </AppMain>
      
      <AppFooter
        :fixed="true"
        :simple="false"
        @logo:click="handleLogoClick"
        @nav:click="handleNavClick"
        @social:click="handleSocialClick"
      />
    </div>

    <!-- 移动端布局 -->
    <MobileLayout
      :show-sidebar="true"
      :show-bottom-nav="true"
      :show-page-header="false"
      :show-mobile-actions="true"
      :loading="loading"
      :loading-message="loadingMessage"
      :loading-size="md"
      :loading-variant="spinner"
      :isEmpty="isEmpty"
      :empty-icon="emptyIcon"
      :empty-title="emptyTitle"
      :empty-description="emptyDescription"
      :empty-size="md"
      :show-empty-action="showEmptyAction"
      :error="error"
      :error-message="errorMessage"
      :content-padding="sm"
      :content-max-width="full"
      :content-centered="false"
      :content-scrollable="true"
      :page-title="pageTitle"
      @menu:click="handleMobileMenuClick"
      @title:click="handleLogoClick"
      @user:click="handleUserClick"
      @nav:click="handleNavClick"
      @feature:click="handleFeatureClick"
      @legal:click="handleLegalClick"
      @logout="handleLogout"
      @back="handleBack"
      @retry="handleRetry"
      @empty-action:click="handleEmptyAction"
    >
      <!-- 移动端内容 -->
      <div class="mobile-shop-content">
        <!-- 商店统计 -->
        <div class="mobile-shop-stats">
          <div class="stats-grid">
            <div class="stat-card">
              <Coins :size="20" />
              <div>
                <div class="stat-value">{{ formatCoins(userCoins) }}</div>
                <div class="stat-label">金币</div>
              </div>
            </div>
            <div class="stat-card">
              <ShoppingBag :size="20" />
              <div>
                <div class="stat-value">{{ inventoryCount }}</div>
                <div class="stat-label">背包</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 搜索框 -->
        <div class="mobile-search-section">
          <SearchBox
            placeholder="搜索商品..."
            :value="searchQuery"
            @input="handleSearchInput"
            @search="handleSearch"
          />
        </div>

        <!-- 分类标签 -->
        <div class="mobile-categories">
          <div class="categories-scroll">
            <button
              class="category-btn"
              :class="{ active: activeCategory === 'all' }"
              @click="handleCategoryChange('all')"
            >
              <Package :size="20" />
              <span>全部</span>
            </button>
            <button
              class="category-btn"
              :class="{ active: activeCategory === 'seeds' }"
              @click="handleCategoryChange('seeds')"
            >
              <Sprout :size="20" />
              <span>种子</span>
            </button>
            <button
              class="category-btn"
              :class="{ active: activeCategory === 'tools' }"
              @click="handleCategoryChange('tools')"
            >
              <Wrench :size="20" />
              <span>工具</span>
            </button>
            <button
              class="category-btn"
              :class="{ active: activeCategory === 'decorations' }"
              @click="handleCategoryChange('decorations')"
            >
              <Sparkles :size="20" />
              <span>装饰</span>
            </button>
            <button
              class="category-btn"
              :class="{ active: activeCategory === 'special' }"
              @click="handleCategoryChange('special')"
            >
              <Gem :size="20} />
              <span>特价</span>
            </button>
          </div>
        </div>

        <!-- 特价商品区 -->
        <div v-if="showSpecialOffers" class="mobile-special-offers">
          <div class="section-header">
            <h3 class="section-title">
              <Flame :size="16} />
              <span>限时特价</span>
            </h3>
            <div class="section-timer">
              <Clock :size="14} />
              <span>{{ formatTime(specialOfferEndTime) }}</span>
            </div>
          </div>
          <div class="special-offers-grid">
            <div
              v-for="product in specialOfferProducts.slice(0, 2)"
              :key="product.id"
              class="special-offer-item"
              @click="handleProductClick(product)"
            >
              <div class="special-badge">特价</div>
              <div class="special-discount">-{{ product.discount }}%</div>
              <ProductCard
                :product="product"
                :show-discount="true"
                :show-original-price="true"
                :size="sm"
              />
            </div>
          </div>
        </div>

        <!-- 热门商品区 -->
        <div class="mobile-popular-products">
          <div class="section-header">
            <h3 class="section-title">
              <TrendingUp :size="16} />
              <span>热门商品</span>
            </h3>
            <button class="view-all-btn" @click="handleViewAll('popular')">
              查看全部
              <ChevronRight :size="14} />
            </button>
          </div>
          <div class="popular-products-grid">
            <div
              v-for="product in popularProducts.slice(0, 3)"
              :key="product.id"
              class="popular-product-item"
              @click="handleProductClick(product)"
            >
              <ProductCard
                :product="product"
                :show-discount="product.discount > 0"
                :show-original-price="product.discount > 0"
                :size="sm"
              />
            </div>
          </div>
        </div>

        <!-- 分类商品区 -->
        <div v-for="category in filteredCategories" :key="category.id" class="mobile-category-section">
          <div class="section-header">
            <h3 class="section-title">
              <component :is="category.icon" :size="16" />
              <span>{{ category.name }}</span>
            </h3>
            <button class="view-all-btn" @click="handleViewAll(category.id)">
              查看全部
              <ChevronRight :size="14} />
            </button>
          </div>
          <div class="category-products-grid">
            <div
              v-for="product in category.products.slice(0, 2)"
              :key="product.id"
              class="category-product-item"
              @click="handleProductClick(product)"
            >
              <ProductCard
                :product="product"
                :show-discount="product.discount > 0"
                :show-original-price="product.discount > 0"
                :size="sm"
              />
            </div>
          </div>
        </div>

        <!-- 移动端操作栏 -->
        <template #mobile-actions>
          <div class="mobile-actions-bar">
            <button class="mobile-action-btn" @click="handleQuickBuy">
              <Zap :size="20} />
              <span>购买</span>
            </button>
            <button class="mobile-action-btn" @click="handleViewWarehouse">
              <Package :size="20} />
              <span>仓库</span>
            </button>
            <button class="mobile-action-btn" @click="handleViewHistory">
              <Clock :size="20} />
              <span>记录</span>
            </button>
          </div>
        </template>
      </div>
    </MobileLayout>

    <!-- 商品详情弹窗 -->
    <ProductDetail
      v-if="showProductDetail"
      :visible="showProductDetail"
      :product="selectedProduct"
      :user-coins="userCoins"
      :inventory-count="getProductInventory(selectedProduct)"
      @close="handleProductDetailClose"
      @buy="handleBuyProduct"
      @add-to-cart="handleAddToCart"
    />

    <!-- 购买确认弹窗 -->
    <ConfirmDialog
      v-if="showBuyConfirm"
      :visible="showBuyConfirm"
      :title="`确认购买`"
      :message="`确定要购买 ${buyQuantity} 个 ${selectedProduct?.name || ''} 吗？`"
      :icon="ShoppingCart"
      :type="info"
      @cancel="handleBuyConfirmCancel"
      @confirm="handleBuyConfirmConfirm"
    >
      <div class="buy-confirm-content">
        <div class="product-summary">
          <img :src="selectedProduct?.image" :alt="selectedProduct?.name" class="product-image" />
          <div class="product-info">
            <h4 class="product-name">{{ selectedProduct?.name }}</h4>
            <div class="product-price">
              <span class="price-label">单价:</span>
              <span class="price-value">{{ formatCoins(selectedProduct?.price || 0) }}</span>
            </div>
          </div>
        </div>
        <div class="quantity-selector">
          <div class="quantity-label">购买数量:</div>
          <div class="quantity-controls">
            <button class="quantity-btn" @click="handleQuantityDecrease">
              <Minus :size="16} />
            </button>
            <input
              type="number"
              v-model.number="buyQuantity"
              :min="1"
              :max="maxBuyQuantity"
              class="quantity-input"
            />
            <button class="quantity-btn" @click="handleQuantityIncrease">
              <Plus :size="16} />
            </button>
          </div>
        </div>
        <div class="total-summary">
          <div class="summary-item">
            <span class="summary-label">总价:</span>
            <span class="summary-value">{{ formatCoins((selectedProduct?.price || 0) * buyQuantity) }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">当前金币:</span>
            <span class="summary-value">{{ formatCoins(userCoins) }}</span>
          </div>
        </div>
      </div>
    </ConfirmDialog>

    <!-- 购买历史弹窗 -->
    <ModalDialog
      v-if="showPurchaseHistory"
      :visible="showPurchaseHistory"
      title="购买记录"
      icon="Clock"
      :show-cancel="true"
      :show-confirm="false"
      cancel-text="关闭"
      @cancel="handlePurchaseHistoryClose"
    >
      <div class="purchase-history-content">
        <div class="history-list">
          <div
            v-for="record in purchaseHistory"
            :key="record.id"
            class="history-item"
          >
            <div class="history-info">
              <div class="history-product">{{ record.productName }}</div>
              <div class="history-details">
                <span class="history-quantity">{{ record.quantity }}个</span>
                <span class="history-price">{{ formatCoins(record.totalPrice) }}</span>
              </div>
              <div class="history-time">{{ formatTime(record.purchaseTime) }}</div>
            </div>
          </div>
        </div>
      </div>
    </ModalDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Coins,
  ShoppingBag,
  Star,
  Zap,
  Package,
  Sprout,
  Wrench,
  Sparkles,
  Gem,
  TrendingUp,
  Clock,
  ChevronRight,
  Flame,
  RefreshCw,
  Minus,
  Plus,
  ShoppingCart,
} from 'lucide-vue-next'
import AppHeader from '../layouts/AppHeader.vue'
import AppMain from '../layouts/AppMain.vue'
import AppFooter from '../layouts/AppFooter.vue'
import MobileLayout from '../layouts/MobileLayout.vue'
import ProductCard from '../components/business/ProductCard.vue'
import ProductDetail from '../components/business/ProductDetail.vue'
import SearchBox from '../components/common/SearchBox.vue'
import ConfirmDialog from '../components/common/ConfirmDialog.vue'
import ModalDialog from '../components/common/ModalDialog.vue'

interface Product {
  id: number
  name: string
  image: string
  price: number
  originalPrice?: number
  discount: number
  category: string
  description: string
  stock: number
  sales: number
  rating: number
  isSpecial: boolean
  tags: string[]
}

interface Category {
  id: string
  name: string
  icon: any
  products: Product[]
}

interface PurchaseRecord {
  id: number
  productName: string
  quantity: number
  totalPrice: number
  purchaseTime: Date
}

// 响应式状态
const router = useRouter()
const loading = ref(false)
const error = ref(false)
const isEmpty = ref(false)
const loadingMessage = ref('加载中...')
const errorMessage = ref('加载失败，请稍后重试')
const emptyIcon = ref('ShoppingCart')
const emptyTitle = ref('商店暂时空了')
const emptyDescription = ref('商品正在补货中，请稍后再来查看')
const showEmptyAction = ref(true)

// 用户数据
const userCoins = ref(25800)
const userLevel = ref(12)
const inventoryCount = ref(23)

// 商品数据
const products = ref<Product[]>([
  {
    id: 1,
    name: '胡萝卜种子',
    image: '/carrot-seed.png',
    price: 100,
    discount: 0,
    category: 'seeds',
    description: '生长快速，产量丰富的胡萝卜种子',
    stock: 999,
    sales: 156,
    rating: 4.5,
    isSpecial: false,
    tags: ['种子', '热销'],
  },
  {
    id: 2,
    name: '番茄种子',
    image: '/tomato-seed.png',
    price: 150,
    discount: 0,
    category: 'seeds',
    description: '品质优良的番茄种子',
    stock: 888,
    sales: 89,
    rating: 4.3,
    isSpecial: false,
    tags: ['种子'],
  },
  {
    id: 3,
    name: '玉米种子',
    image: '/corn-seed.png',
    price: 200,
    discount: 0,
    category: 'seeds',
    description: '高产的玉米种子',
    stock: 666,
    sales: 67,
    rating: 4.7,
    isSpecial: false,
    tags: ['种子', '高产'],
  },
  {
    id: 4,
    name: '土豆种子',
    image: '/potato-seed.png',
    price: 80,
    discount: 0,
    category: 'seeds',
    description: '生长周期短的土豆种子',
    stock: 1200,
    sales: 234,
    rating: 4.2,
    isSpecial: false,
    tags: ['种子', '快速'],
  },
  {
    id: 5,
    name: '化肥',
    image: '/fertilizer.png',
    price: 50,
    discount: 0,
    category: 'tools',
    description: '提高作物产量的化肥',
    stock: 500,
    sales: 345,
    rating: 4.1,
    isSpecial: false,
    tags: ['工具', '必需'],
  },
  {
    id: 6,
    name: '浇水壶',
    image: '/watering-can.png',
    price: 30,
    discount: 0,
    category: 'tools',
    description: '方便浇水的浇水壶',
    stock: 800,
    sales: 567,
    rating: 4.0,
    isSpecial: false,
    tags: ['工具'],
  },
  {
    id: 7,
    name: '小铲子',
    image: '/small-shovel.png',
    price: 40,
    discount: 0,
    category: 'tools',
    description: '轻便耐用的园艺小铲子',
    stock: 600,
    sales: 234,
    rating: 3.9,
    isSpecial: false,
    tags: ['工具'],
  },
  {
    id: 8,
    name: '精美花盆',
    image: '/flower-pot.png',
    price: 120,
    discount: 0,
    category: 'decorations',
    description: '装饰农场的精美花盆',
    stock: 300,
    sales: 123,
    rating: 4.6,
    isSpecial: false,
    tags: ['装饰'],
  },
  {
    id: 9,
    name: '稻草人',
    image: '/scarecrow.png',
    price: 200,
    discount: 0,
    category: 'decorations',
    description: '驱赶鸟类的稻草人',
    stock: 150,
    sales: 89,
    rating: 3.8,
    isSpecial: false,
    tags: ['装饰'],
  },
  {
    id: 10,
    name: '超级胡萝卜种子',
    image: '/super-carrot-seed.png',
    price: 300,
    originalPrice: 400,
    discount: 25,
    category: 'special',
    description: '限时特价！超级胡萝卜种子，生长速度提升50%',
    stock: 100,
    sales: 234,
    rating: 4.9,
    isSpecial: true,
    tags: ['特价', '限时'],
  },
  {
    id: 11,
    name: '黄金肥料',
    image: '/gold-fertilizer.png',
    price: 150,
    originalPrice: 200,
    discount: 25,
    category: 'special',
    description: '限时特价！黄金肥料，效果提升100%',
    stock: 80,
    sales: 567,
    rating: 4.8,
    isSpecial: true,
    tags: ['特价', '限时'],
  },
])

// 分类数据
const categories = ref<Category[]>([
  {
    id: 'seeds',
    name: '种子',
    icon: 'Sprout',
    products: products.filter(p => p.category === 'seeds'),
  },
  {
    id: 'tools',
    name: '工具',
    icon: 'Wrench',
    products: products.filter(p => p.category === 'tools'),
  },
  {
    id: 'decorations',
    name: '装饰',
    icon: 'Sparkles',
    products: products.filter(p => p.category === 'decorations'),
  },
])

// 搜索和筛选状态
const searchQuery = ref('')
const activeCategory = ref('all')
const sortBy = ref<'default' | 'price-asc' | 'price-desc' | 'sales-desc' | 'rating-desc'>('default')

// 弹窗状态
const showProductDetail = ref(false)
const showBuyConfirm = ref(false)
const showPurchaseHistory = ref(false)
const selectedProduct = ref<Product | null>(null)
const buyQuantity = ref(1)

// 特价商品状态
const showSpecialOffers = ref(true)
const specialOfferEndTime = ref(new Date(Date.now() + 1000 * 60 * 60 * 2)) // 2小时后结束

// 购买历史
const purchaseHistory = ref<PurchaseRecord[]>([
  {
    id: 1,
    productName: '胡萝卜种子',
    quantity: 5,
    totalPrice: 500,
    purchaseTime: new Date(Date.now() - 1000 * 60 * 60 * 1),
  },
  {
    id: 2,
    productName: '化肥',
    quantity: 10,
    totalPrice: 500,
    purchaseTime: new Date(Date.now() - 1000 * 60 * 60 * 3),
  },
  {
    id: 3,
    productName: '超级胡萝卜种子',
    quantity: 2,
    totalPrice: 600,
    purchaseTime: new Date(Date.now() - 1000 * 60 * 60 * 5),
  },
])

// 计算属性
const pageTitle = computed(() => '商店')
const specialOfferProducts = computed(() => 
  products.filter(p => p.isSpecial)
)
const popularProducts = computed(() => 
  products
    .filter(p => !p.isSpecial)
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 4)
)
const filteredCategories = computed(() => {
  if (activeCategory.value === 'all') {
    return categories
  }
  return categories.filter(cat => cat.id === activeCategory.value)
})
const maxBuyQuantity = computed(() => {
  if (!selectedProduct.value) return 1
  return Math.min(selectedProduct.value.stock, 99)
})

// 方法
const formatCoins = (coins: number) => {
  if (coins >= 10000) {
    return (coins / 10000).toFixed(1) + '万'
  }
  return coins.toLocaleString()
}

const formatTime = (date: Date) => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days > 0) {
    return `${days}天前`
  } else if (hours > 0) {
    return `${hours}小时前`
  } else if (minutes > 0) {
    return `${minutes}分钟前`
  } else {
    return '刚刚'
  }
}

const getProductInventory = (product: Product | null) => {
  if (!product) return 0
  // 模拟从用户库存中获取数量
  return Math.floor(Math.random() * 10) + 1
}

// 事件处理
const handleLogoClick = () => {
  router.push('/')
}

const handleSearch = (query: string) => {
  console.log('搜索:', query)
}

const handleTabChange = (tab: string) => {
  console.log('标签切换:', tab)
}

const handleMobileMenuClick = () => {
  console.log('移动端菜单点击')
}

const handleBack = () => {
  router.back()
}

const handleRetry = () => {
  console.log('重试')
  loadShopData()
}

const handleProductClick = (product: Product) => {
  selectedProduct.value = product
  showProductDetail.value = true
}

const handleQuickBuy = () => {
  // 快速购买功能
  alert('快速购买功能开发中...')
}

const handleViewWarehouse = () => {
  router.push('/warehouse')
}

const handleViewHistory = () => {
  showPurchaseHistory.value = true
}

const handleCategoryChange = (category: string) => {
  activeCategory.value = category
}

const handleViewAll = (type: string) => {
  router.push(`/shop/${type}`)
}

const handleSearchInput = (query: string) => {
  searchQuery.value = query
}

const handleRefresh = () => {
  loadShopData()
}

const handleProductDetailClose = () => {
  showProductDetail.value = false
  selectedProduct.value = null
}

const handleBuyProduct = (product: Product, quantity: number) => {
  selectedProduct.value = product
  buyQuantity.value = quantity
  showBuyConfirm.value = true
}

const handleAddToCart = (product: Product, quantity: number) => {
  // 添加到购物车功能
  alert(`已添加${quantity}个${product.name}到购物车`)
}

const handleBuyConfirmCancel = () => {
  showBuyConfirm.value = false
}

const handleBuyConfirmConfirm = () => {
  if (selectedProduct.value && buyQuantity.value > 0) {
    const totalPrice = selectedProduct.value.price * buyQuantity.value
    
    if (userCoins.value < totalPrice) {
      alert('金币不足')
      return
    }
    
    // 执行购买
    userCoins.value -= totalPrice
    
    // 更新库存
    const productIndex = products.value.findIndex(p => p.id === selectedProduct.value.id)
    if (productIndex !== -1) {
      products.value[productIndex].stock -= buyQuantity.value
      products.value[productIndex].sales += buyQuantity.value
    }
    
    // 添加购买记录
    purchaseHistory.value.unshift({
      id: Date.now(),
      productName: selectedProduct.value.name,
      quantity: buyQuantity.value,
      totalPrice,
      purchaseTime: new Date(),
    })
    
    alert(`成功购买${buyQuantity.value}个${selectedProduct.value.name}！`)
    
    showBuyConfirm.value = false
    selectedProduct.value = null
    buyQuantity.value = 1
  }
}

const handleQuantityDecrease = () => {
  if (buyQuantity.value > 1) {
    buyQuantity.value--
  }
}

const handleQuantityIncrease = () => {
  if (buyQuantity.value < maxBuyQuantity.value) {
    buyQuantity.value++
  }
}

const handlePurchaseHistoryClose = () => {
  showPurchaseHistory.value = false
}

// 模拟数据更新
const updateShopData = () => {
  // 模拟商品库存变化
  products.forEach(product => {
    if (Math.random() > 0.9) {
      // 随机补充库存
      product.stock += Math.floor(Math.random() * 50) + 10
    }
    
    // 随机增加销量
    if (Math.random() > 0.8) {
      product.sales += Math.floor(Math.random() * 5) + 1
    }
  })
  
  // 更新特价商品
  const now = new Date()
  if (now.getTime() > specialOfferEndTime.value.getTime()) {
    // 特价结束，恢复原价
    products.forEach(product => {
      if (product.isSpecial) {
        product.isSpecial = false
        product.discount = 0
        product.originalPrice = undefined
      }
    })
    showSpecialOffers.value = false
  }
}

// 加载商店数据
const loadShopData = () => {
  loading.value = true
  error.value = false
  
  // 模拟API调用
  setTimeout(() => {
    loading.value = false
    // 检查是否有商品
    if (products.length === 0) {
      isEmpty.value = true
    }
  }, 1000)
}

// 生命周期
onMounted(() => {
  loadShopData()
  
  // 每30秒更新一次数据
  const dataInterval = setInterval(updateShopData, 30000)
  
  // 每分钟检查特价时间
  const timerInterval = setInterval(() => {
    const now = new Date()
    if (now.getTime() > specialOfferEndTime.value.getTime()) {
      // 特价结束
      products.forEach(product => {
        if (product.isSpecial) {
          product.isSpecial = false
          product.discount = 0
          product.originalPrice = undefined
        }
      })
      showSpecialOffers.value = false
    }
  }, 60000) // 每分钟检查一次
  
  // 清理定时器
  onUnmounted(() => {
    clearInterval(dataInterval)
    clearInterval(timerInterval)
  })
})

onUnmounted(() => {
  // 清理工作在onMounted中处理
})
</script>

<style scoped>
.shop-view {
  min-height: 100vh;
  background: #f8fafc;
}

/* 桌面端布局 */
.desktop-layout {
  display: block;
}

/* 移动端布局 */
.mobile-layout {
  display: none;
}

/* 页面标题栏 */
.shop-header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
}

.shop-stats {
  display: flex;
  gap: 24px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border-radius: 20px;
  font-weight: 600;
}

.stat-item span {
  color: #92400e;
}

.shop-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn.primary {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.action-btn.secondary {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
}

.action-btn.tertiary {
  background: linear-gradient(135deg, #8b5cf6, #6366f1);
  color: white;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* 商品分类 */
.shop-categories {
  margin-bottom: 24px;
}

.categories-scroll {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 8px;
  border-bottom: 1px solid #e5e7eb;
}

.categories-scroll::-webkit-scrollbar {
  height: 4px;
}

.category-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: none;
  border-radius: 20px;
  background: #f3f4f6;
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
  cursor:
