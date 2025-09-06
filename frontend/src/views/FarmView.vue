<template>
  <div class="farm-view">
    <!-- 桌面端布局 -->
    <div class="desktop-layout">
      <AppHeader
        :show-search="false"
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
          <div class="farm-header-actions">
            <div class="farm-stats">
              <div class="stat-item">
                <Coins :size="20" />
                <span>{{ formatCoins(userCoins) }}</span>
              </div>
              <div class="stat-item">
                <TrendingUp :size="20" />
                <span>等级 {{ userLevel }}</span>
              </div>
              <div class="stat-item">
                <Clock :size="20" />
                <span>{{ formatTime(lastUpdateTime) }}</span>
              </div>
            </div>
            <div class="farm-actions">
              <button class="action-btn primary" @click="handleHarvestAll">
                <Wheat :size="16" />
                <span>一键收获</span>
              </button>
              <button class="action-btn secondary" @click="handleWaterAll">
                <Droplets :size="16" />
                <span>一键浇水</span>
              </button>
              <button class="action-btn tertiary" @click="handleFertilizeAll">
                <Flower :size="16" />
                <span>一键施肥</span>
              </button>
            </div>
          </div>
        </template>

        <!-- 农场网格 -->
        <div class="farm-grid">
          <div
            v-for="plot in farmPlots"
            :key="plot.id"
            class="plot-item"
            :class="getPlotClasses(plot)"
            @click="handlePlotClick(plot)"
          >
            <!-- 地块状态图标 -->
            <div class="plot-status">
              <component
                :is="getPlotStatusIcon(plot)"
                :size="32"
                :class="getPlotStatusIconClasses(plot)"
              />
            </div>
            
            <!-- 作物信息 -->
            <div v-if="plot.crop" class="crop-info">
              <div class="crop-name">{{ plot.crop.name }}</div>
              <div class="crop-progress">
                <div class="progress-bar">
                  <div
                    class="progress-fill"
                    :style="{ width: `${plot.crop.growthPercentage}%` }"
                  ></div>
                </div>
                <div class="progress-text">{{ plot.crop.growthPercentage }}%</div>
              </div>
              <div class="crop-time">
                <Clock :size="12" />
                <span>{{ formatTime(plot.crop.remainingTime) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态操作 -->
        <template v-if="showEmptyAction" #empty-action>
          <button class="empty-action-btn" @click="handlePlantFirstCrop">
            <Sprout :size="16" />
            <span>种植第一个作物</span>
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
      <div class="mobile-farm-content">
        <!-- 农场统计 -->
        <div class="mobile-farm-stats">
          <div class="stats-grid">
            <div class="stat-card">
              <Coins :size="20" />
              <div>
                <div class="stat-value">{{ formatCoins(userCoins) }}</div>
                <div class="stat-label">金币</div>
              </div>
            </div>
            <div class="stat-card">
              <TrendingUp :size="20" />
              <div>
                <div class="stat-value">{{ userLevel }}</div>
                <div class="stat-label">等级</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 快捷操作 -->
        <div class="mobile-farm-actions">
          <div class="actions-grid">
            <button class="action-btn" @click="handleHarvestAll">
              <Wheat :size="16" />
              <span>收获</span>
            </button>
            <button class="action-btn" @click="handleWaterAll">
              <Droplets :size="16" />
              <span>浇水</span>
            </button>
            <button class="action-btn" @click="handleFertilizeAll">
              <Flower :size="16" />
              <span>施肥</span>
            </button>
          </div>
        </div>

        <!-- 农场网格 -->
        <div class="mobile-farm-grid">
          <div
            v-for="plot in farmPlots"
            :key="plot.id"
            class="plot-item"
            :class="getPlotClasses(plot)"
            @click="handlePlotClick(plot)"
          >
            <!-- 地块状态图标 -->
            <div class="plot-status">
              <component
                :is="getPlotStatusIcon(plot)"
                :size="24"
                :class="getPlotStatusIconClasses(plot)"
              />
            </div>
            
            <!-- 作物信息 -->
            <div v-if="plot.crop" class="crop-info">
              <div class="crop-name">{{ plot.crop.name }}</div>
              <div class="crop-progress">
                <div class="progress-bar">
                  <div
                    class="progress-fill"
                    :style="{ width: `${plot.crop.growthPercentage}%` }"
                  ></div>
                </div>
                <div class="progress-text">{{ plot.crop.growthPercentage }}%</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 移动端操作栏 -->
        <template #mobile-actions>
          <div class="mobile-actions-bar">
            <button class="mobile-action-btn" @click="handleShowShop">
              <ShoppingCart :size="20" />
              <span>商店</span>
            </button>
            <button class="mobile-action-btn" @click="handleShowWarehouse">
              <Package :size="20" />
              <span>仓库</span>
            </button>
            <button class="mobile-action-btn" @click="handleShowFriends">
              <Users :size="20" />
              <span>好友</span>
            </button>
          </div>
        </template>
      </div>
    </MobileLayout>

    <!-- 作物操作弹窗 -->
    <ModalDialog
      v-if="showCropDialog"
      :visible="showCropDialog"
      :title="selectedPlot?.crop ? '作物信息' : '种植作物'"
      :icon="selectedPlot?.crop ? 'Wheat' : 'Sprout'"
      :show-cancel="true"
      :show-confirm="selectedPlot?.crop && selectedPlot.crop.canHarvest"
      :cancel-text="selectedPlot?.crop ? '关闭' : '取消'"
      :confirm-text="selectedPlot?.crop && selectedPlot.crop.canHarvest ? '收获' : '种植'"
      @cancel="handleCropDialogCancel"
      @confirm="handleCropDialogConfirm"
    >
      <div class="crop-dialog-content">
        <!-- 作物信息 -->
        <div v-if="selectedPlot?.crop" class="crop-details">
          <div class="crop-header">
            <img :src="selectedPlot.crop.image" :alt="selectedPlot.crop.name" class="crop-image" />
            <div class="crop-info">
              <h3 class="crop-name">{{ selectedPlot.crop.name }}</h3>
              <div class="crop-stats">
                <div class="crop-stat">
                  <span class="stat-label">等级:</span>
                  <span class="stat-value">{{ selectedPlot.crop.level }}</span>
                </div>
                <div class="crop-stat">
                  <span class="stat-label">产量:</span>
                  <span class="stat-value">{{ selectedPlot.crop.yield }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="crop-progress">
            <div class="progress-info">
              <span class="progress-label">生长进度</span>
              <span class="progress-value">{{ selectedPlot.crop.growthPercentage }}%</span>
            </div>
            <div class="progress-bar">
              <div
                class="progress-fill"
                :style="{ width: `${selectedPlot.crop.growthPercentage}%` }"
              ></div>
            </div>
          </div>
          
          <div class="crop-time">
            <Clock :size="16" />
            <span>{{ formatTime(selectedPlot.crop.remainingTime) }}后可收获</span>
          </div>
          
          <div class="crop-actions">
            <button
              v-if="selectedPlot.crop.canWater"
              class="action-btn water"
              @click="handleWaterCrop"
            >
              <Droplets :size="16" />
              <span>浇水</span>
            </button>
            <button
              v-if="selectedPlot.crop.canFertilize"
              class="action-btn fertilize"
              @click="handleFertilizeCrop"
            >
              <Flower :size="16" />
              <span>施肥</span>
            </button>
            <button
              v-if="selectedPlot.crop.canHarvest"
              class="action-btn harvest"
              @click="handleHarvestCrop"
            >
              <Wheat :size="16" />
              <span>收获</span>
            </button>
          </div>
        </div>
        
        <!-- 种植选择 -->
        <div v-else class="plant-selection">
          <h4 class="selection-title">选择要种植的作物</h4>
          <div class="seeds-grid">
            <div
              v-for="seed in availableSeeds"
              :key="seed.id"
              class="seed-item"
              :class="{ 'selected': selectedSeed?.id === seed.id }"
              @click="handleSeedSelect(seed)"
            >
              <img :src="seed.image" :alt="seed.name" class="seed-image" />
              <div class="seed-info">
                <div class="seed-name">{{ seed.name }}</div>
                <div class="seed-price">{{ formatCoins(parseInt(seed.price)) }}</div>
              </div>
            </div>
          </div>
          
          <div v-if="selectedSeed" class="selection-actions">
            <button class="confirm-btn" @click="handlePlantCrop">
              <Sprout :size="16" />
              <span>种植</span>
            </button>
          </div>
        </div>
      </div>
    </ModalDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  Coins,
  TrendingUp,
  Clock,
  Wheat,
  Droplets,
  Flower,
  Sprout,
  ShoppingCart,
  Package,
  Users,
  Home,
  X,
  Check,
  AlertTriangle,
} from 'lucide-vue-next'
import AppHeader from '../layouts/AppHeader.vue'
import AppMain from '../layouts/AppMain.vue'
import AppFooter from '../layouts/AppFooter.vue'
import MobileLayout from '../layouts/MobileLayout.vue'
import ModalDialog from '../components/common/ModalDialog.vue'

interface Plot {
  id: number
  status: 'empty' | 'planted' | 'growing' | 'ready' | 'withered'
  crop?: Crop
  lastWatered?: Date
  lastFertilized?: Date
}

interface Crop {
  id: number
  name: string
  image: string
  level: number
  growthPercentage: number
  remainingTime: number
  canWater: boolean
  canFertilize: boolean
  canHarvest: boolean
  yield: number
  plantTime: Date
}

interface Seed {
  id: number
  name: string
  image: string
  price: string
  growTime: number
  yield: number
}

// 响应式状态
const router = useRouter()
const loading = ref(false)
const error = ref(false)
const isEmpty = ref(false)
const loadingMessage = ref('加载中...')
const errorMessage = ref('加载失败，请稍后重试')
const emptyIcon = ref('Home')
const emptyTitle = ref('暂无地块')
const emptyDescription = ref('请先购买地块开始种植')
const showEmptyAction = ref(true)

// 用户数据
const userCoins = ref(25800)
const userLevel = ref(12)
const lastUpdateTime = ref(new Date())

// 农场数据
const farmPlots = ref<Plot[]>([
  { id: 1, status: 'ready', crop: {
    id: 1,
    name: '胡萝卜',
    image: '/carrot.png',
    level: 5,
    growthPercentage: 100,
    remainingTime: 0,
    canWater: false,
    canFertilize: false,
    canHarvest: true,
    yield: 10,
    plantTime: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2小时前种植
  }},
  { id: 2, status: 'growing', crop: {
    id: 2,
    name: '番茄',
    image: '/tomato.png',
    level: 3,
    growthPercentage: 75,
    remainingTime: 1000 * 60 * 30, // 30分钟
    canWater: true,
    canFertilize: true,
    canHarvest: false,
    yield: 8,
    plantTime: new Date(Date.now() - 1000 * 60 * 60 * 1), // 1小时前种植
  }},
  { id: 3, status: 'planted', crop: {
    id: 3,
    name: '玉米',
    image: '/corn.png',
    level: 2,
    growthPercentage: 25,
    remainingTime: 1000 * 60 * 60, // 1小时
    canWater: true,
    canFertilize: true,
    canHarvest: false,
    yield: 12,
    plantTime: new Date(Date.now() - 1000 * 60 * 30), // 30分钟前种植
  }},
  { id: 4, status: 'empty' },
  { id: 5, status: 'empty' },
  { id: 6, status: 'empty' },
  { id: 7, status: 'empty' },
  { id: 8, status: 'empty' },
  { id: 9, status: 'withered', crop: {
    id: 4,
    name: '土豆',
    image: '/potato.png',
    level: 1,
    growthPercentage: 0,
    remainingTime: 0,
    canWater: false,
    canFertilize: false,
    canHarvest: false,
    yield: 0,
    plantTime: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3小时前种植，已枯萎
  }},
])

// 可用的种子
const availableSeeds = ref<Seed[]>([
  {
    id: 1,
    name: '胡萝卜种子',
    image: '/carrot-seed.png',
    price: '100',
    growTime: 7200, // 2小时
    yield: 10,
  },
  {
    id: 2,
    name: '番茄种子',
    image: '/tomato-seed.png',
    price: '150',
    growTime: 10800, // 3小时
    yield: 8,
  },
  {
    id: 3,
    name: '玉米种子',
    image: '/corn-seed.png',
    price: '200',
    growTime: 14400, // 4小时
    yield: 12,
  },
  {
    id: 4,
    name: '土豆种子',
    image: '/potato-seed.png',
    price: '80',
    growTime: 5400, // 1.5小时
    yield: 6,
  },
])

// 弹窗状态
const showCropDialog = ref(false)
const selectedPlot = ref<Plot | null>(null)
const selectedSeed = ref<Seed | null>(null)

// 计算属性
const pageTitle = computed(() => '我的农场')

// 方法
const formatCoins = (coins: number) => {
  if (coins >= 10000) {
    return (coins / 10000).toFixed(1) + '万'
  }
  return coins.toLocaleString()
}

const formatTime = (time: number) => {
  if (time <= 0) return '已成熟'
  
  const hours = Math.floor(time / (1000 * 60 * 60))
  const minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60))
  
  if (hours > 0) {
    return `${hours}小时${minutes > 0 ? `${minutes}分钟` : ''}`
  }
  return `${minutes}分钟`
}

const getPlotClasses = (plot: Plot) => [
  'plot-item',
  `status-${plot.status}`,
  {
    'can-interact': plot.status !== 'empty' && plot.status !== 'withered',
  },
]

const getPlotStatusIcon = (plot: Plot) => {
  const iconMap: Record<string, any> = {
    empty: 'Plus',
    planted: 'Sprout',
    growing: 'Droplets',
    ready: 'Wheat',
    withered: 'X',
  }
  return iconMap[plot.status] || 'Plus'
}

const getPlotStatusIconClasses = (plot: Plot) => {
  const classMap: Record<string, string> = {
    empty: 'status-empty',
    planted: 'status-planted',
    growing: 'status-growing',
    ready: 'status-ready',
    withered: 'status-withered',
  }
  return classMap[plot.status] || 'status-empty'
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
  loadFarmData()
}

const handlePlotClick = (plot: Plot) => {
  if (plot.status === 'empty') {
    selectedPlot.value = plot
    selectedSeed.value = null
    showCropDialog.value = true
  } else if (plot.crop) {
    selectedPlot.value = plot
    showCropDialog.value = true
  }
}

const handleHarvestAll = () => {
  const readyPlots = farmPlots.value.filter(plot => plot.status === 'ready')
  if (readyPlots.length === 0) {
    alert('没有可收获的作物')
    return
  }
  
  if (confirm(`确定要收获 ${readyPlots.length} 个作物吗？`)) {
    readyPlots.forEach(plot => {
      if (plot.crop) {
        harvestCrop(plot)
      }
    })
  }
}

const handleWaterAll = () => {
  const needWaterPlots = farmPlots.value.filter(plot => 
    plot.crop && plot.crop.canWater
  )
  if (needWaterPlots.length === 0) {
    alert('没有需要浇水的作物')
    return
  }
  
  if (confirm(`确定要浇水 ${needWaterPlots.length} 个作物吗？`)) {
    needWaterPlots.forEach(plot => {
      if (plot.crop) {
        waterCrop(plot)
      }
    })
  }
}

const handleFertilizeAll = () => {
  const needFertilizePlots = farmPlots.value.filter(plot => 
    plot.crop && plot.crop.canFertilize
  )
  if (needFertilizePlots.length === 0) {
    alert('没有需要施肥的作物')
    return
  }
  
  if (confirm(`确定要施肥 ${needFertilizePlots.length} 个作物吗？`)) {
    needFertilizePlots.forEach(plot => {
      if (plot.crop) {
        fertilizeCrop(plot)
      }
    })
  }
}

const handlePlantFirstCrop = () => {
  const emptyPlot = farmPlots.value.find(plot => plot.status === 'empty')
  if (emptyPlot) {
    selectedPlot.value = emptyPlot
    selectedSeed.value = null
    showCropDialog.value = true
  }
}

const handleCropDialogCancel = () => {
  showCropDialog.value = false
  selectedPlot.value = null
  selectedSeed.value = null
}

const handleCropDialogConfirm = () => {
  if (selectedPlot.value?.crop && selectedPlot.value.crop.canHarvest) {
    harvestCrop(selectedPlot.value)
  } else if (selectedPlot.value && selectedSeed.value) {
    plantCrop(selectedPlot.value, selectedSeed.value)
  }
  showCropDialog.value = false
}

const handleWaterCrop = () => {
  if (selectedPlot.value?.crop) {
    waterCrop(selectedPlot.value)
  }
}

const handleFertilizeCrop = () => {
  if (selectedPlot.value?.crop) {
    fertilizeCrop(selectedPlot.value)
  }
}

const handleHarvestCrop = () => {
  if (selectedPlot.value?.crop) {
    harvestCrop(selectedPlot.value)
  }
}

const handleSeedSelect = (seed: Seed) => {
  selectedSeed.value = seed
}

const handlePlantCrop = () => {
  if (selectedPlot.value && selectedSeed.value) {
    plantCrop(selectedPlot.value, selectedSeed.value)
    showCropDialog.value = false
  }
}

const handleShowShop = () => {
  router.push('/shop')
}

const handleShowWarehouse = () => {
  router.push('/warehouse')
}

const handleShowFriends = () => {
  router.push('/friends')
}

const handleNavClick = (page: string) => {
  router.push(`/${page}`)
}

const handleSocialClick = (platform: string) => {
  console.log('社交点击:', platform)
}

const handleLegalClick = (type: string) => {
  console.log('法律链接点击:', type)
}

const handleLogout = () => {
  console.log('退出登录')
  router.push('/login')
}

const handleUserClick = () => {
  console.log('用户点击')
}

const handleFeatureClick = (feature: string) => {
  console.log('功能点击:', feature)
}

const handleEmptyAction = () => {
  handlePlantFirstCrop()
}

// 农场操作方法
const plantCrop = (plot: Plot, seed: Seed) => {
  if (userCoins.value < parseInt(seed.price)) {
    alert('金币不足')
    return
  }
  
  userCoins.value -= parseInt(seed.price)
  
  const newCrop: Crop = {
    id: Date.now(),
    name: seed.name.replace('种子', ''),
    image: seed.image.replace('-seed', '.png'),
    level: 1,
    growthPercentage: 0,
    remainingTime: seed.growTime,
    canWater: true,
    canFertilize: true,
    canHarvest: false,
    yield: seed.yield,
    plantTime: new Date(),
  }
  
  // 更新地块
  const plotIndex = farmPlots.value.findIndex(p => p.id === plot.id)
  if (plotIndex !== -1) {
    farmPlots.value[plotIndex] = {
      ...plot,
      status: 'planted',
      crop: newCrop,
      lastWatered: new Date(),
      lastFertilized: new Date(),
    }
  }
  
  // 开始生长
  startCropGrowth(newCrop)
  
  alert(`成功种植${seed.name}！`)
}

const waterCrop = (plot: Plot) => {
  if (!plot.crop || !plot.crop.canWater) return
  
  plot.crop.canWater = false
  plot.lastWatered = new Date()
  
  // 更新地块
  const plotIndex = farmPlots.value.findIndex(p => p.id === plot.id)
  if (plotIndex !== -1) {
    farmPlots.value[plotIndex] = { ...plot }
  }
  
  alert('浇水成功！')
}

const fertilizeCrop = (plot: Plot) => {
  if (!plot.crop || !plot.crop.canFertilize) return
  
  plot.crop.canFertilize = false
  plot.lastFertilized = new Date()
  plot.crop.level += 1
  
  // 更新地块
  const plotIndex = farmPlots.value.findIndex(p => p.id === plot.id)
  if (plotIndex !== -1) {
    farmPlots.value[plotIndex] = { ...plot }
  }
  
  alert('施肥成功！')
}

const harvestCrop = (plot: Plot) => {
  if (!plot.crop || !plot.crop.canHarvest) return
  
  const crop = plot.crop
  const yieldAmount = crop.yield * crop.level
  
  // 收获作物
  userCoins.value += yieldAmount * 10 // 假设每个作物价值10金币
  
  // 更新地块
  const plotIndex = farmPlots.value.findIndex(p => p.id === plot.id)
  if (plotIndex !== -1) {
    farmPlots.value[plotIndex] = {
      ...plot,
      status: 'empty',
      crop: undefined,
    }
  }
  
  alert(`收获成功！获得${yieldAmount}个${crop.name}，价值${yieldAmount * 10}金币`)
}

const startCropGrowth = (crop: Crop) => {
  const growthInterval = setInterval(() => {
    if (crop.remainingTime <= 0) {
      crop.remainingTime = 0
      crop.growthPercentage = 100
      crop.canHarvest = true
      crop.canWater = false
      crop.canFertilize = false
      
      // 更新地块状态
      const plotIndex = farmPlots.value.findIndex(p => 
        p.crop && p.crop.id === crop.id
      )
      if (plotIndex !== -1) {
        farmPlots.value[plotIndex] = {
          ...farmPlots.value[plotIndex],
          status: 'ready',
        }
      }
      
      clearInterval(growthInterval)
      return
    }
    
    // 更新生长进度
    crop.remainingTime -= 1000 // 每秒更新一次
    crop.growthPercentage = Math.min(100, 
      ((crop.growTime - crop.remainingTime) / crop.growTime) * 100
    )
    
    // 检查是否可以浇水或施肥
    const now = new Date()
    if (crop.lastWatered && now.getTime() - crop.lastWatered.getTime() > 1000 * 60 * 60) {
      crop.canWater = true
    }
    if (crop.lastFertilized && now.getTime() - crop.lastFertilized.getTime() > 1000 * 60 * 60 * 2) {
      crop.canFertilize = true
    }
    
    // 更新地块
    const plotIndex = farmPlots.value.findIndex(p => 
      p.crop && p.crop.id === crop.id
    )
    if (plotIndex !== -1) {
      farmPlots.value[plotIndex] = { ...farmPlots.value[plotIndex] }
    }
  }, 1000)
  
  // 清理定时器
  setTimeout(() => {
    clearInterval(growthInterval)
  }, crop.remainingTime + 1000)
}

// 模拟数据更新
const updateFarmData = () => {
  // 模拟一些随机事件
  const randomPlot = farmPlots.value[Math.floor(Math.random() * farmPlots.value.length)]
  if (randomPlot.crop && Math.random() > 0.7) {
    // 模拟好友偷菜
    if (Math.random() > 0.5) {
      // 偷菜成功
      const stolenAmount = Math.floor(Math.random() * 3) + 1
      randomPlot.crop.yield = Math.max(0, randomPlot.crop.yield - stolenAmount)
      alert(`好友偷了你的${randomPlot.crop.name}！`)
    }
  }
  
  // 更新时间
  lastUpdateTime.value = new Date()
}

// 加载农场数据
const loadFarmData = () => {
  loading.value = true
  error.value = false
  
  // 模拟API调用
  setTimeout(() => {
    loading.value = false
    // 检查是否有地块
    if (farmPlots.value.length === 0) {
      isEmpty.value = true
    }
  }, 1000)
}

// 生命周期
onMounted(() => {
  loadFarmData()
  
  // 每30秒更新一次数据
  const dataInterval = setInterval(updateFarmData, 30000)
  
  // 为每个正在生长的作物启动生长定时器
  farmPlots.value.forEach(plot => {
    if (plot.crop && plot.crop.remainingTime > 0) {
      startCropGrowth(plot.crop)
    }
  })
  
  // 清理定时器
  onUnmounted(() => {
    clearInterval(dataInterval)
  })
})

onUnmounted(() => {
  // 清理工作在onMounted中处理
})
</script>

<style scoped>
.farm-view {
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
.farm-header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
}

.farm-stats {
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

.farm-actions {
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

/* 农场网格 */
.farm-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  padding: 20px 0;
}

.plot-item {
  aspect-ratio: 1;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.plot-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.plot-item.status-empty {
  background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
  border: 2px dashed #d1d5db;
}

.plot-item.status-withered {
  background: linear-gradient(135deg, #fef2f2, #fee2e2);
  border: 2px solid #fbbf24;
}

.plot-item.status-ready {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border: 2px solid #fbbf24;
}

.plot-item.can-interact {
  border: 2px solid transparent;
}

.plot-item.can-interact:hover {
  border-color: #667eea;
}

.plot-status {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
}

.status-empty {
  color: #9ca3af;
}

.status-planted {
  color: #10b981;
}

.status-growing {
  color: #3b82f6;
}

.status-ready {
  color: #f59e0b;
}

.status-withered {
  color: #ef4444;
}

.crop-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}

.crop-name {
  font-size: 12px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.crop-progress {
  margin-bottom: 4px;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #059669);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 10px;
  color: #666;
  text-align: center;
}

.crop-time {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  color: #9ca3af;
}

/* 移动端农场内容 */
.mobile-farm-content {
  padding: 16px;
}

.mobile-farm-stats {
  margin-bottom: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 8px;
