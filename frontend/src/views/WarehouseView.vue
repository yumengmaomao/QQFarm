<template>
  <div class="warehouse-view">
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
        :loading-size="'lg'"
        :loading-variant="'overlay'"
        :isEmpty="isEmpty"
        :empty-icon="emptyIcon"
        :empty-title="emptyTitle"
        :empty-description="emptyDescription"
        :empty-size="'md'"
        :show-empty-action="showEmptyAction"
        :error="error"
        :error-message="errorMessage"
        :show-page-header="true"
        :show-mobile-actions="false"
        :padding="'lg'"
        :max-width="'xl'"
        :centered="false"
        :scrollable="true"
        :page-title="pageTitle"
        @back="handleBack"
        @retry="handleRetry"
      >
        <!-- 页面标题栏 -->
        <template #page-actions>
          <div class="warehouse-header-actions">
            <div class="warehouse-stats">
              <div class="stat-item">
                <Package :size="20" />
                <span>背包 {{ totalItems }}</span>
              </div>
              <div class="stat-item">
                <Coins :size="20" />
                <span>{{ formatCoins(totalValue) }}</span>
              </div>
              <div class="stat-item">
                <Star :size="20" />
                <span>等级 {{ userLevel }}</span>
              </div>
            </div>
            <div class="warehouse-actions">
              <button class="action-btn primary" @click="handleOrganize">
                <LayoutGrid :size="16" />
                <span>整理背包</span>
              </button>
              <button class="action-btn secondary" @click="handleUseItem">
                <Wrench :size="16" />
                <span>使用物品</span>
              </button>
              <button class="action-btn tertiary" @click="handleSellItem">
                <ShoppingCart :size="16" />
                <span>出售物品</span>
              </button>
            </div>
          </div>
        </template>

        <!-- 物品分类 -->
        <WarehouseCategories
          :active-category="activeCategory"
          @category-change="handleCategoryChange"
        />

        <!-- 搜索和筛选 -->
        <div class="warehouse-controls">
          <div class="search-section">
            <SearchBox
              placeholder="搜索物品..."
              :value="searchQuery"
              @input="handleSearchInput"
              @search="handleSearch"
            />
          </div>
          <div class="filter-section">
            <div class="filter-tabs">
              <button
                class="filter-tab"
                :class="{ active: activeFilter === 'all' }"
                @click="handleFilterChange('all')"
              >
                全部
              </button>
              <button
                class="filter-tab"
                :class="{ active: activeFilter === 'usable' }"
                @click="handleFilterChange('usable')"
              >
                可使用
              </button>
              <button
                class="filter-tab"
                :class="{ active: activeFilter === 'expired' }"
                @click="handleFilterChange('expired')"
              >
                已过期
              </button>
            </div>
            <div class="sort-options">
              <select class="sort-select" @change="handleSortChange">
                <option value="name-asc">名称升序</option>
                <option value="name-desc">名称降序</option>
                <option value="quantity-asc">数量升序</option>
                <option value="quantity-desc">数量降序</option>
                <option value="value-asc">价值升序</option>
                <option value="value-desc">价值降序</option>
                <option value="expiry-asc">过期时间升序</option>
                <option value="expiry-desc">过期时间降序</option>
              </select>
            </div>
          </div>
        </div>

        <!-- 物品展示区 -->
        <div class="warehouse-content">
          <!-- 快速操作区 -->
          <WarehouseQuickActions
            :quick-actions="quickActions"
            @action-click="handleQuickAction"
          />

          <!-- 分类物品区 -->
          <WarehouseCategory
            v-for="category in filteredCategories"
            :key="category.id"
            :category="category"
            @item-click="handleItemClick"
            @item-use="handleUseItem"
            @item-sell="handleSellItem"
            @item-gift="handleGiftItem"
          />

          <!-- 即将过期物品 -->
          <WarehouseExpiringItems
            v-if="showExpiringItems"
            :expiring-items="expiringItems"
            @item-click="handleItemClick"
            @item-use="handleUseItem"
            @item-sell="handleSellItem"
            @item-gift="handleGiftItem"
          />

          <!-- 仓库状态 -->
          <WarehouseStatus
            :max-capacity="maxCapacity"
            :total-items="totalItems"
            :usage-percentage="usagePercentage"
          />
        </div>

        <!-- 空状态操作 -->
        <template v-if="showEmptyAction" #empty-action>
          <button class="empty-action-btn" @click="handleRefresh">
            <RefreshCw :size="16" />
            <span>刷新仓库</span>
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
      :loading-size="'md'"
      :loading-variant="'spinner'"
      :isEmpty="isEmpty"
      :empty-icon="emptyIcon"
      :empty-title="emptyTitle"
      :empty-description="emptyDescription"
      :empty-size="'md'"
      :show-empty-action="showEmptyAction"
      :error="error"
      :error-message="errorMessage"
      :content-padding="'sm'"
      :content-max-width="'full'"
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
      <div class="mobile-warehouse-content">
        <!-- 仓库统计 -->
        <div class="mobile-warehouse-stats">
          <div class="stats-grid">
            <div class="stat-card">
              <Package :size="20" />
              <div>
                <div class="stat-value">{{ totalItems }}</div>
                <div class="stat-label">物品</div>
              </div>
            </div>
            <div class="stat-card">
              <Coins :size="20" />
              <div>
                <div class="stat-value">{{ formatCoins(totalValue) }}</div>
                <div class="stat-label">价值</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 搜索框 -->
        <div class="mobile-search-section">
          <SearchBox
            placeholder="搜索物品..."
            :value="searchQuery"
            @input="handleSearchInput"
            @search="handleSearch"
          />
        </div>

        <!-- 分类标签 -->
        <WarehouseCategories
          :active-category="activeCategory"
          @category-change="handleCategoryChange"
        />

        <!-- 快速操作 -->
        <WarehouseQuickActions
          :quick-actions="quickActions"
          @action-click="handleQuickAction"
        />

        <!-- 即将过期物品 -->
        <WarehouseExpiringItems
          v-if="showExpiringItems"
          :expiring-items="expiringItems.slice(0, 3)"
          @item-click="handleItemClick"
          @item-use="handleUseItem"
          @item-sell="handleSellItem"
          @item-gift="handleGiftItem"
        />

        <!-- 分类物品区 -->
        <WarehouseCategory
          v-for="category in filteredCategories"
          :key="category.id"
          :category="category"
          @item-click="handleItemClick"
          @item-use="handleUseItem"
          @item-sell="handleSellItem"
          @item-gift="handleGiftItem"
        />

        <!-- 仓库状态 -->
        <WarehouseStatus
          :max-capacity="maxCapacity"
          :total-items="totalItems"
          :usage-percentage="usagePercentage"
        />

        <!-- 移动端操作栏 -->
        <template #mobile-actions>
          <div class="mobile-actions-bar">
            <button class="mobile-action-btn" @click="handleOrganize">
              <LayoutGrid :size="20" />
              <span>整理</span>
            </button>
            <button class="mobile-action-btn" @click="handleUseItem">
              <Wrench :size="20" />
              <span>使用</span>
            </button>
            <button class="mobile-action-btn" @click="handleSellItem">
              <ShoppingCart :size="20" />
              <span>出售</span>
            </button>
          </div>
        </template>
      </div>
    </MobileLayout>

    <!-- 物品详情弹窗 -->
    <ModalDialog
      v-if="showItemDetail"
      :visible="showItemDetail"
      :title="`${selectedItem?.name || ''} 的详情`"
      :icon="Package"
      :show-cancel="true"
      :show-confirm="false"
      cancel-text="关闭"
      @cancel="handleItemDetailClose"
    >
      <div class="item-detail-content">
        <div class="item-header">
          <div class="item-image-large">
            <img :src="selectedItem?.image" :alt="selectedItem?.name" class="item-img" />
            <div class="item-quantity-large">{{ selectedItem?.quantity }}</div>
          </div>
          <div class="item-info">
            <h3 class="item-name">{{ selectedItem?.name }}</h3>
            <div class="item-description">{{ selectedItem?.description }}</div>
            <div class="item-stats">
              <div class="item-stat">
                <span class="stat-label">价值:</span>
                <span class="stat-value">{{ formatCoins(selectedItem?.value || 0) }}</span>
              </div>
              <div class="item-stat">
                <span class="stat-label">数量:</span>
                <span class="stat-value">{{ selectedItem?.quantity }}</span>
              </div>
              <div class="item-stat" v-if="selectedItem?.expiryTime">
                <span class="stat-label">过期时间:</span>
                <span class="stat-value">{{ formatTime(selectedItem.expiryTime) }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="item-actions">
          <button
            v-if="selectedItem?.canUse"
            class="action-btn primary"
            @click="handleUseItem(selectedItem)"
          >
            <Wrench :size="16" />
            <span>使用物品</span>
          </button>
          <button
            v-if="selectedItem?.canSell"
            class="action-btn secondary"
            @click="handleSellItem(selectedItem)"
          >
            <ShoppingCart :size="16" />
            <span>出售物品</span>
          </button>
          <button
            v-if="selectedItem?.canGift"
            class="action-btn tertiary"
            @click="handleGiftItem(selectedItem)"
          >
            <Gift :size="16" />
            <span>赠送好友</span>
          </button>
        </div>
      </div>
    </ModalDialog>

    <!-- 使用物品弹窗 -->
    <ModalDialog
      v-if="showUseItemDialog"
      :visible="showUseItemDialog"
      :title="`使用 ${selectedItem?.name || ''}`"
      :icon="Wrench"
      :show-cancel="true"
      :show-confirm="false"
      cancel-text="关闭"
      @cancel="handleUseItemDialogCancel"
    >
      <div class="use-item-content">
        <div class="use-item-header">
          <div class="item-image">
            <img :src="selectedItem?.image" :alt="selectedItem?.name" class="item-img" />
          </div>
          <div class="item-info">
            <h3 class="item-name">{{ selectedItem?.name }}</h3>
            <div class="item-description">{{ selectedItem?.description }}</div>
          </div>
        </div>
        
        <div class="use-item-details">
          <div class="detail-item">
            <span class="detail-label">当前数量:</span>
            <span class="detail-value">{{ selectedItem?.quantity }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">使用数量:</span>
            <div class="quantity-controls">
              <button class="quantity-btn" @click="handleQuantityDecrease">
                <Minus :size="16" />
              </button>
              <input
                type="number"
                v-model.number="useQuantity"
                :min="1"
                :max="maxUseQuantity"
                class="quantity-input"
              />
              <button class="quantity-btn" @click="handleQuantityIncrease">
                <Plus :size="16" />
              </button>
            </div>
          </div>
        </div>
        
        <div class="use-item-effects">
          <h4 class="section-title">使用效果</h4>
          <div class="effects-list">
            <div class="effect-item">
              <span class="effect-icon">+</span>
              <span class="effect-text">{{ getUseEffect(selectedItem) }}</span>
            </div>
          </div>
        </div>
        
        <div class="use-item-summary">
          <div class="summary-item">
            <span class="summary-label">使用后剩余:</span>
            <span class="summary-value">{{ (selectedItem?.quantity || 0) - useQuantity }}个</span>
          </div>
        </div>
      </div>
    </ModalDialog>

    <!-- 出售物品弹窗 -->
    <ModalDialog
      v-if="showSellItemDialog"
      :visible="showSellItemDialog"
      :title="`出售 ${selectedItem?.name || ''}`"
      :icon="ShoppingCart"
      :show-cancel="true"
      :show-confirm="false"
      cancel-text="关闭"
      @cancel="handleSellItemDialogCancel"
    >
      <div class="sell-item-content">
        <div class="sell-item-header">
          <div class="item-image">
            <img :src="selectedItem?.image" :alt="selectedItem?.name" class="item-img" />
          </div>
          <div class="item-info">
            <h3 class="item-name">{{ selectedItem?.name }}</h3>
            <div class="item-description">{{ selectedItem?.description }}</div>
          </div>
        </div>
        
        <div class="sell-item-details">
          <div class="detail-item">
            <span class="detail-label">当前数量:</span>
            <span class="detail-value">{{ selectedItem?.quantity }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">单价:</span>
            <span class="detail-value">{{ formatCoins(selectedItem?.value || 0) }}</span>
          </div>
        </div>
        
        <div class="sell-item-controls">
          <div class="quantity-selector">
            <div class="quantity-label">出售数量:</div>
            <div class="quantity-controls">
              <button class="quantity-btn" @click="handleQuantityDecrease">
                <Minus :size="16" />
              </button>
              <input
                type="number"
                v-model.number="sellQuantity"
                :min="1"
                :max="maxSellQuantity"
                class="quantity-input"
              />
              <button class="quantity-btn" @click="handleQuantityIncrease">
                <Plus :size="16" />
              </button>
            </div>
          </div>
        </div>
        
        <div class="sell-item-summary">
          <div class="summary-item">
            <span class="summary-label">总收入:</span>
            <span class="summary-value">{{ formatCoins((selectedItem?.value || 0) * sellQuantity) }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">出售后剩余:</span>
            <span class="summary-value">{{ (selectedItem?.quantity || 0) - sellQuantity }}个</span>
          </div>
        </div>
      </div>
    </ModalDialog>

    <!-- 赠送物品弹窗 -->
    <ModalDialog
      v-if="showGiftItemDialog"
      :visible="showGiftItemDialog"
      :title="`赠送 ${selectedItem?.name || ''}`"
      :icon="Gift"
      :show-cancel="true"
      :show-confirm="false"
      cancel-text="关闭"
      @cancel="handleGiftItemDialogCancel"
    >
      <div class="gift-item-content">
        <div class="gift-item-header">
          <div class="item-image">
            <img :src="selectedItem?.image" :alt="selectedItem?.name" class="item-img" />
          </div>
          <div class="item-info">
            <h3 class="item-name">{{ selectedItem?.name }}</h3>
            <div class="item-description">{{ selectedItem?.description }}</div>
          </div>
        </div>
        
        <div class="friend-selector">
          <h4 class="section-title">选择好友</h4>
          <div class="friends-list">
            <div
              v-for="friend in friends"
              :key="friend.id"
              class="friend-item"
              :class="{ 'selected': selectedFriend?.id === friend.id }"
              @click="handleFriendSelect(friend)"
            >
              <Avatar
                :src="friend.avatar"
                :alt="friend.name"
                :level="friend.level"
                :show-level="true"
                :status="friend.status"
                :show-status="true"
                :size="'md'"
              />
              <div class="friend-info">
                <div class="friend-name">{{ friend.name }}</div>
                <div class="friend-level">等级 {{ friend.level }}</div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="gift-details">
          <div class="detail-item">
            <span class="detail-label">赠送数量:</span>
            <div class="quantity-controls">
              <button class="quantity-btn" @click="handleQuantityDecrease">
                <Minus :size="16" />
              </button>
              <input
                type="number"
                v-model.number="giftQuantity"
                :min="1"
                :max="maxGiftQuantity"
                class="quantity-input"
              />
              <button class="quantity-btn" @click="handleQuantityIncrease">
                <Plus :size="16" />
              </button>
            </div>
          </div>
          <div class="detail-item">
            <span class="detail-label">亲密度加成:</span>
            <span class="detail-value">+{{ getGiftIntimacy(selectedItem) }}</span>
          </div>
        </div>
      </div>
    </ModalDialog>

    <!-- 整理背包弹窗 -->
    <ModalDialog
      v-if="showOrganizeDialog"
      :visible="showOrganizeDialog"
      title="整理背包"
      :icon="LayoutGrid"
      :show-cancel="true"
      :show-confirm="false"
      cancel-text="关闭"
      @cancel="handleOrganizeDialogCancel"
    >
      <div class="organize-content">
        <div class="organize-header">
          <h3 class="organize-title">整理背包</h3>
          <p class="organize-subtitle">系统将自动整理您的背包物品</p>
        </div>
        
        <div class="organize-options">
          <div class="option-item">
            <div class="option-icon">
              <Package :size="24" />
            </div>
            <div class="option-info">
              <div class="option-name">按类型整理</div>
              <div class="option-description">将相同类型的物品放在一起</div>
            </div>
          </div>
          <div class="option-item">
            <div class="option-icon">
              <TrendingUp :size="24" />
            </div>
            <div class="option-info">
              <div class="option-name">按价值整理</div>
              <div class="option-description">价值高的物品放在前面</div>
            </div>
          </div>
          <div class="option-item">
            <div class="option-icon">
              <Clock :size="24" />
            </div>
            <div class="option-info">
              <div class="option-name">按过期时间整理</div>
              <div class="option-description">即将过期的物品放在前面</div>
            </div>
          </div>
        </div>
        
        <div class="organize-preview">
          <h4 class="section-title">整理预览</h4>
          <div class="preview-stats">
            <div class="preview-stat">
              <span class="stat-label">整理前:</span>
              <span class="stat-value">{{ totalItems }}个物品</span>
            </div>
            <div class="preview-stat">
              <span class="stat-label">整理后:</span>
              <span class="stat-value">{{ totalItems }}个物品</span>
            </div>
          </div>
        </div>
        
        <div class="organize-actions">
          <button class="confirm-btn" @click="handleConfirmOrganize">
            <LayoutGrid :size="16" />
            <span>开始整理</span>
          </button>
        </div>
      </div>
    </ModalDialog>

    <!-- 扩容仓库弹窗 -->
    <ModalDialog
      v-if="showExpandDialog"
      :visible="showExpandDialog"
      title="扩容仓库"
      :icon="Maximize"
      :show-cancel="true"
      :show-confirm="false"
      cancel-text="关闭"
      @cancel="handleExpandDialogCancel"
    >
      <div class="expand-content">
        <div class="expand-header">
          <h3 class="expand-title">仓库扩容</h3>
          <p class="expand-subtitle">增加仓库容量，存储更多物品</p>
        </div>
        
        <div class="expand-options">
          <div class="expand-option">
            <div class="expand-icon">
              <Package :size="32" />
            </div>
            <div class="expand-info">
              <div class="expand-name">小型仓库</div>
              <div class="expand-description">+50个容量</div>
              <div class="expand-price">{{ formatCoins(1000) }}</div>
            </div>
          </div>
          <div class="expand-option">
            <div class="expand-icon">
              <Package :size="32" />
            </div>
            <div class="expand-info">
              <div class="expand-name">中型仓库</div>
              <div class="expand-description">+100个容量</div>
              <div class="expand-price">{{ formatCoins(2000) }}</div>
            </div>
          </div>
          <div class="expand-option">
            <div class="expand-icon">
              <Package :size="32" />
            </div>
            <div class="expand-info">
              <div class="expand-name">大型仓库</div>
              <div class="expand-description">+200个容量</div>
              <div class="expand-price">{{ formatCoins(5000) }}</div>
            </div>
          </div>
        </div>
        
        <div class="expand-summary">
          <div class="summary-item">
            <span class="summary-label">当前容量:</span>
            <span class="summary-value">{{ maxCapacity }}个</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">当前金币:</span>
            <span class="summary-value">{{ formatCoins(userCoins) }}</span>
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
  Package,
  Coins,
  Star,
  Sprout,
  Wrench,
  Sparkles,
  Gem,
  Zap,
  LayoutGrid,
  ShoppingCart,
  Gift,
  Clock,
  Info,
  RefreshCw,
  Minus,
  Plus,
  TrendingUp,
  Maximize,
  Home,
  UserPlus,
  MessageCircle,
  MessageSquare,
  Link2,
} from 'lucide-vue-next'
import AppHeader from '../layouts/AppHeader.vue'
import AppMain from '../layouts/AppMain.vue'
import AppFooter from '../layouts/AppFooter.vue'
import MobileLayout from '../layouts/MobileLayout.vue'
import Avatar from '../components/common/Avatar.vue'
import SearchBox from '../components/common/SearchBox.vue'
import ModalDialog from '../components/common/ModalDialog.vue'
import WarehouseItem from '../components/business/WarehouseItem.vue'
import WarehouseCategory from '../components/business/WarehouseCategory.vue'
import WarehouseQuickActions from '../components/business/WarehouseQuickActions.vue'
import WarehouseExpiringItems from '../components/business/WarehouseExpiringItems.vue'
import WarehouseStatus from '../components/business/WarehouseStatus.vue'
import WarehouseCategories from '../components/business/WarehouseCategories.vue'

// 类型定义
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

interface Category {
  id: string
  name: string
  icon: any
  totalItems: number
  totalValue: number
  items: Item[]
}

interface QuickAction {
  id: string
  name: string
  icon: any
  count: number
}

interface Friend {
  id: string
  name: string
  avatar: string
  level: number
  status: string
}

// 响应式式数据
const router = useRouter()

// 状态管理
const loading = ref(false)
const loadingMessage = ref('加载中...')
const isEmpty = ref(false)
const emptyIcon = ref(Package)
const emptyTitle = ref('仓库为空')
const emptyDescription = ref('您的仓库中还没有任何物品')
const showEmptyAction = ref(true)
const error = ref(false)
const errorMessage = ref('加载失败，请重试')
const pageTitle = ref('仓库')

// 搜索和筛选状态
const searchQuery = ref('')
const activeCategory = ref('all')
const activeFilter = ref('all')
const sortOption = ref('name-asc')

// 物品状态
const selectedItem = ref<Item | null>(null)
const selectedFriend = ref<Friend | null>(null)
const useQuantity = ref(1)
const sellQuantity = ref(1)
const giftQuantity = ref(1)

// 弹窗状态
const showItemDetail = ref(false)
const showUseItemDialog = ref(false)
const showSellItemDialog = ref(false)
const showGiftItemDialog = ref(false)
const showOrganizeDialog = ref(false)
const showExpandDialog = ref(false)

// 模拟数据
const userLevel = ref(15)
const userCoins = ref(5000)
const maxCapacity = ref(200)

const items = ref<Item[]>([
  {
    id: '1',
    name: '小麦种子',
    image: '/images/items/wheat-seed.png',
    quantity: 50,
    value: 10,
    canUse: true,
    canSell: true,
    canGift: true,
    expiryTime: '2024-12-31T23:59:59',
    isExpiring: true
  },
  {
    id: '2',
    name: '玉米种子',
    image: '/images/items/corn-seed.png',
    quantity: 30,
    value: 15,
    canUse: true,
    canSell: true,
    canGift: true
  },
  {
    id: '3',
    name: '胡萝卜种子',
    image: '/images/items/carrot-seed.png',
    quantity: 25,
    value: 12,
    canUse: true,
    canSell: true,
    canGift: true
  },
  {
    id: '4',
    name: '铁锄',
    image: '/images/items/iron-hoe.png',
    quantity: 1,
    value: 100,
    canUse: true,
    canSell: false,
    canGift: false
  },
  {
    id: '5',
    name: '水壶',
    image: '/images/items/watering-can.png',
    quantity: 1,
    value: 50,
    canUse: true,
    canSell: false,
    canGift: false
  },
  {
    id: '6',
    name: '玫瑰花种子',
    image: '/images/items/rose-seed.png',
    quantity: 10,
    value: 20,
    canUse: true,
    canSell: true,
    canGift: true
  },
  {
    id: '7',
    name: '向日葵种子',
    image: '/images/items/sunflower-seed.png',
    quantity: 15,
    value: 25,
    canUse: true,
    canSell: true,
    canGift: true
  }
])

const friends = ref<Friend[]>([
  {
    id: '1',
    name: '小明',
    avatar: '/images/avatars/user1.png',
    level: 12,
    status: 'online'
  },
  {
    id: '2',
    name: '小红',
    avatar: '/images/avatars/user2.png',
    level: 10,
    status: 'offline'
  },
  {
    id: '3',
    name: '小刚',
    avatar: '/images/avatars/user3.png',
    level: 8,
    status: 'online'
  }
])

// 计算属性
const totalItems = computed(() => items.value.reduce((sum, item) => sum + item.quantity, 0))
const totalValue = computed(() => items.value.reduce((sum, item) => sum + item.value * item.quantity, 0))
const usagePercentage = computed(() => Math.round((totalItems.value / maxCapacity.value) * 100))

// 快速操作
const quickActions = computed<QuickAction[]>(() => [
  {
    id: 'seeds',
    name: '种子',
    icon: Sprout,
    count: items.value.filter(item => item.name.includes('种子')).reduce((sum, item) => sum + item.quantity, 0)
  },
  {
    id: 'tools',
    name: '工具',
    icon: Wrench,
    count: items.value.filter(item => item.name.includes('锄') || item.name.includes('壶')).reduce((sum, item) => sum + item.quantity, 0)
  },
  {
    id: 'flowers',
    name: '花卉',
    icon: Sparkles,
    count: items.value.filter(item => item.name.includes('花')).reduce((sum, item) => sum + item.quantity, 0)
  }
])

// 过滤和分类
const filteredItems = computed(() => {
  let result = [...items.value]
  
  // 搜索过滤
  if (searchQuery.value) {
    result = result.filter(item => 
      item.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }
  
  // 分类过滤
  if (activeCategory.value !== 'all') {
    const categoryMap: Record<string, string[]> = {
      'seeds': ['小麦种子', '玉米种子', '胡萝卜种子'],
      'tools': ['铁锄', '水壶'],
      'decorations': ['玫瑰花种子', '向日葵种子'],
      'special': []
    }
    
    const categoryItems = categoryMap[activeCategory.value] || []
    result = result.filter(item => categoryItems.includes(item.name))
  }
  
  // 状态过滤
  if (activeFilter.value === 'usable') {
    result = result.filter(item => item.canUse)
  } else if (activeFilter.value === 'expired') {
    result = result.filter(item => item.expiryTime && new Date(item.expiryTime) < new Date())
  }
  
  // 排序
  const [sortKey, sortOrder] = sortOption.value.split('-') as [keyof Item, 'asc' | 'desc']
  result.sort((a, b) => {
    if (sortOrder === 'asc') {
      return a[sortKey] > b[sortKey] ? 1 : -1
    } else {
      return a[sortKey] < b[sortKey] ? 1 : -1
    }
  })
  
  return result
})

const filteredCategories = computed<Category[]>(() => {
  const categories: Record<string, Category> = {
    'seeds': {
      id: 'seeds',
      name: '种子',
      icon: Sprout,
      totalItems: 0,
      totalValue: 0,
      items: []
    },
    'tools': {
      id: 'tools',
      name: '工具',
      icon: Wrench,
      totalItems: 0,
      totalValue: 0,
      items: []
    },
    'decorations': {
      id: 'decorations',
      name: '装饰',
      icon: Sparkles,
      totalItems: 0,
      totalValue: 0,
      items: []
    },
    'special': {
      id: 'special',
      name: '特殊物品',
      icon: Gem,
      totalItems: 0,
      totalValue: 0,
      items: []
    }
  }
  
  // 分类物品
  filteredItems.value.forEach(item => {
    if (item.name.includes('种子')) {
      categories.seeds.items.push(item)
      categories.seeds.totalItems += item.quantity
      categories.seeds.totalValue += item.value * item.quantity
    } else if (item.name.includes('锄') || item.name.includes('壶')) {
      categories.tools.items.push(item)
      categories.tools.totalItems += item.quantity
      categories.tools.totalValue += item.value * item.quantity
    } else if (item.name.includes('花')) {
      categories.decorations.items.push(item)
      categories.decorations.totalItems += item.quantity
      categories.decorations.totalValue += item.value * item.quantity
    } else {
      categories.special.items.push(item)
      categories.special.totalItems += item.quantity
      categories.special.totalValue += item.value * item.quantity
    }
  })
  
  // 过滤空分类
  return Object.values(categories).filter(cat => cat.items.length > 0)
})

const expiringItems = computed(() => {
  const now = new Date()
  const oneDayLater = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  
  return items.value.filter(item => {
    if (!item.expiryTime) return false
    const expiryDate = new Date(item.expiryTime)
    return expiryDate > now && expiryDate <= oneDayLater
  })
})

const showExpiringItems = computed(() => expiringItems.value.length > 0)

// 数量控制
const maxUseQuantity = computed(() => selectedItem.value?.quantity || 1)
const maxSellQuantity = computed(() => selectedItem.value?.quantity || 1)
const maxGiftQuantity = computed(() => selectedItem.value?.quantity || 1)

// 方法
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

const getUseEffect = (item: Item | null) => {
  if (!item) return '无效果'
  
  if (item.name.includes('种子')) {
    return '种植后获得作物'
  } else if (item.name.includes('锄')) {
    return '耕地效率提升'
  } else
