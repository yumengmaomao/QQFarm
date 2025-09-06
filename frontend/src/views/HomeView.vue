<template>
  <div class="home-view">
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
        :isEmpty="false"
        :error="error"
        :error-message="errorMessage"
        :show-page-header="false"
        :show-mobile-actions="false"
        :padding="lg"
        :max-width="xl"
        :centered="true"
        :scrollable="true"
        @back="handleBack"
        @retry="handleRetry"
      >
        <!-- 欢迎横幅 -->
        <div class="welcome-banner">
          <div class="banner-content">
            <div class="banner-text">
              <h1 class="welcome-title">欢迎来到QQ农场</h1>
              <p class="welcome-subtitle">与好友一起享受田园乐趣，种植作物，收获果实！</p>
              <div class="banner-actions">
                <button class="banner-btn primary" @click="handleStartFarming">
                  <Sprout :size="20" />
                  <span>开始农场</span>
                </button>
                <button class="banner-btn secondary" @click="handleVisitFriends">
                  <Users :size="20" />
                  <span>访问好友</span>
                </button>
              </div>
            </div>
          </div>
          <div class="banner-image">
            <img src="/farm-banner.jpg" alt="农场横幅" class="banner-img" />
          </div>
        </div>

        <!-- 快速入口 -->
        <div class="quick-entries">
          <h2 class="section-title">快速入口</h2>
          <div class="entries-grid">
            <div class="entry-card" @click="handleEntryClick('farm')">
              <div class="entry-icon farm">
                <Home :size="32" />
              </div>
              <div class="entry-content">
                <h3 class="entry-title">我的农场</h3>
                <p class="entry-description">管理你的农场，种植作物</p>
              </div>
            </div>
            
            <div class="entry-card" @click="handleEntryClick('friends')">
              <div class="entry-icon friends">
                <Users :size="32" />
              </div>
              <div class="entry-content">
                <h3 class="entry-title">好友农场</h3>
                <p class="entry-description">访问好友的农场，互相帮助</p>
              </div>
            </div>
            
            <div class="entry-card" @click="handleEntryClick('shop')">
              <div class="entry-icon shop">
                <ShoppingCart :size="32" />
              </div>
              <div class="entry-content">
                <h3 class="entry-title">商店</h3>
                <p class="entry-description">购买种子、道具和工具</p>
              </div>
            </div>
            
            <div class="entry-card" @click="handleEntryClick('warehouse')">
              <div class="entry-icon warehouse">
                <Package :size="32" />
              </div>
              <div class="entry-content">
                <h3 class="entry-title">仓库</h3>
                <p class="entry-description">查看你的物品库存</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 游戏统计 -->
        <div class="game-stats">
          <h2 class="section-title">游戏统计</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">
                <TrendingUp :size="24" />
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ formatNumber(gameStats.totalPlants) }}</div>
                <div class="stat-label">总种植数</div>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon">
                <Coins :size="24" />
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ formatCoins(gameStats.totalCoins) }}</div>
                <div class="stat-label">总金币</div>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon">
                <Trophy :size="24" />
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ gameStats.rank }}</div>
                <div class="stat-label">好友排名</div>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon">
                <Calendar :size="24} />
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ gameStats.loginDays }}</div>
                <div class="stat-label">登录天数</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 好友动态 -->
        <div class="friends-activity">
          <div class="section-header">
            <h2 class="section-title">好友动态</h2>
            <button class="view-all-btn" @click="handleViewAllFriends">
              查看全部
              <ChevronRight :size="16" />
            </button>
          </div>
          
          <div class="activity-list">
            <div
              v-for="activity in friendActivities"
              :key="activity.id"
              class="activity-item"
              @click="handleActivityClick(activity)"
            >
              <Avatar
                :src="activity.avatar"
                :alt="activity.name"
                :level="activity.level"
                :show-level="true"
                :status="activity.status"
                :show-status="true"
                :size="sm"
              />
              <div class="activity-content">
                <div class="activity-user">{{ activity.name }}</div>
                <div class="activity-action">{{ activity.action }}</div>
                <div class="activity-time">{{ formatTime(activity.time) }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 排行榜预览 -->
        <div class="leaderboard-preview">
          <div class="section-header">
            <h2 class="section-title">排行榜</h2>
            <button class="view-all-btn" @click="handleViewLeaderboard">
              查看全部
              <ChevronRight :size="16" />
            </button>
          </div>
          
          <div class="leaderboard-list">
            <div
              v-for="(user, index) in leaderboardUsers"
              :key="user.id"
              class="leaderboard-item"
              :class="{ 'is-current': user.isCurrent }"
              @click="handleLeaderboardClick(user)"
            >
              <div class="rank">{{ index + 1 }}</div>
              <Avatar
                :src="user.avatar"
                :alt="user.name"
                :level="user.level"
                :show-level="true"
                :size="sm"
              />
              <div class="user-info">
                <div class="user-name">{{ user.name }}</div>
                <div class="user-stats">
                  <span class="stat-value">{{ formatNumber(user.coins) }}金币</span>
                  <span class="stat-value">{{ user.plants }}作物</span>
                </div>
              </div>
            </div>
          </div>
        </div>
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
      :show-mobile-actions="false"
      :loading="loading"
      :loading-message="loadingMessage"
      :loading-size="md"
      :loading-variant="spinner"
      :isEmpty="false"
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
      <div class="mobile-home-content">
        <!-- 欢迎横幅 -->
        <div class="mobile-welcome-banner">
          <div class="banner-content">
            <h1 class="welcome-title">欢迎来到QQ农场</h1>
            <p class="welcome-subtitle">与好友一起享受田园乐趣</p>
            <div class="banner-actions">
              <button class="banner-btn primary" @click="handleStartFarming">
                <Sprout :size="16" />
                <span>开始农场</span>
              </button>
            </div>
          </div>
          <div class="banner-image">
            <img src="/farm-banner-mobile.jpg" alt="农场横幅" class="banner-img" />
          </div>
        </div>

        <!-- 快速入口 -->
        <div class="mobile-quick-entries">
          <div class="entries-grid">
            <div class="entry-card" @click="handleEntryClick('farm')">
              <Home :size="24" />
              <span>我的农场</span>
            </div>
            <div class="entry-card" @click="handleEntryClick('friends')">
              <Users :size="24" />
              <span>好友</span>
            </div>
            <div class="entry-card" @click="handleEntryClick('shop')">
              <ShoppingCart :size="24" />
              <span>商店</span>
            </div>
            <div class="entry-card" @click="handleEntryClick('warehouse')">
              <Package :size="24" />
              <span>仓库</span>
            </div>
          </div>
        </div>

        <!-- 游戏统计 -->
        <div class="mobile-game-stats">
          <h3 class="section-title">游戏统计</h3>
          <div class="stats-grid">
            <div class="stat-card">
              <TrendingUp :size="20" />
              <div>
                <div class="stat-value">{{ formatNumber(gameStats.totalPlants) }}</div>
                <div class="stat-label">种植数</div>
              </div>
            </div>
            <div class="stat-card">
              <Coins :size="20" />
              <div>
                <div class="stat-value">{{ formatCoins(gameStats.totalCoins) }}</div>
                <div class="stat-label">金币</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 好友动态 -->
        <div class="mobile-friends-activity">
          <div class="section-header">
            <h3 class="section-title">好友动态</h3>
            <button class="view-all-btn" @click="handleViewAllFriends">
              查看全部
              <ChevronRight :size="14" />
            </button>
          </div>
          
          <div class="activity-list">
            <div
              v-for="activity in friendActivities.slice(0, 3)"
              :key="activity.id"
              class="activity-item"
              @click="handleActivityClick(activity)"
            >
              <Avatar
                :src="activity.avatar"
                :alt="activity.name"
                :level="activity.level"
                :show-level="true"
                :status="activity.status"
                :show-status="true"
                :size="xs"
              />
              <div class="activity-content">
                <div class="activity-user">{{ activity.name }}</div>
                <div class="activity-action">{{ activity.action }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 排行榜预览 -->
        <div class="mobile-leaderboard-preview">
          <div class="section-header">
            <h3 class="section-title">排行榜</h3>
            <button class="view-all-btn" @click="handleViewLeaderboard">
              查看全部
              <ChevronRight :size="14" />
            </button>
          </div>
          
          <div class="leaderboard-list">
            <div
              v-for="(user, index) in leaderboardUsers.slice(0, 3)"
              :key="user.id"
              class="leaderboard-item"
              :class="{ 'is-current': user.isCurrent }"
              @click="handleLeaderboardClick(user)"
            >
              <div class="rank">{{ index + 1 }}</div>
              <Avatar
                :src="user.avatar"
                :alt="user.name"
                :level="user.level"
                :show-level="true"
                :size="xs"
              />
              <div class="user-info">
                <div class="user-name">{{ user.name }}</div>
                <div class="user-coins">{{ formatCoins(user.coins) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MobileLayout>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Home,
  Users,
  ShoppingCart,
  Package,
  TrendingUp,
  Coins,
  Trophy,
  Calendar,
  ChevronRight,
  Sprout,
} from 'lucide-vue-next'
import AppHeader from '../layouts/AppHeader.vue'
import AppMain from '../layouts/AppMain.vue'
import AppFooter from '../layouts/AppFooter.vue'
import MobileLayout from '../layouts/MobileLayout.vue'
import Avatar from '../components/common/Avatar.vue'

interface GameStats {
  totalPlants: number
  totalCoins: number
  rank: number
  loginDays: number
}

interface FriendActivity {
  id: number
  name: string
  avatar: string
  level: number
  status: 'online' | 'offline' | 'away' | 'busy'
  action: string
  time: Date
}

interface LeaderboardUser {
  id: number
  name: string
  avatar: string
  level: number
  coins: number
  plants: number
  isCurrent: boolean
}

// 响应式状态
const router = useRouter()
const loading = ref(false)
const error = ref(false)
const loadingMessage = ref('加载中...')
const errorMessage = ref('加载失败，请稍后重试')

// 游戏统计数据
const gameStats = ref<GameStats>({
  totalPlants: 156,
  totalCoins: 25800,
  rank: 12,
  loginDays: 45,
})

// 好友动态
const friendActivities = ref<FriendActivity[]>([
  {
    id: 1,
    name: '小明',
    avatar: '/avatar1.jpg',
    level: 15,
    status: 'online',
    action: '收获了10个胡萝卜',
    time: new Date(Date.now() - 1000 * 60 * 5), // 5分钟前
  },
  {
    id: 2,
    name: '小红',
    avatar: '/avatar2.jpg',
    level: 12,
    status: 'online',
    action: '种植了5个番茄',
    time: new Date(Date.now() - 1000 * 60 * 15), // 15分钟前
  },
  {
    id: 3,
    name: '小刚',
    avatar: '/avatar3.jpg',
    level: 18,
    status: 'away',
    action: '给作物浇水',
    time: new Date(Date.now() - 1000 * 60 * 30), // 30分钟前
  },
  {
    id: 4,
    name: '小美',
    avatar: '/avatar4.jpg',
    level: 14,
    status: 'offline',
    action: '偷了小明的菜',
    time: new Date(Date.now() - 1000 * 60 * 60), // 1小时前
  },
])

// 排行榜用户
const leaderboardUsers = ref<LeaderboardUser[]>([
  {
    id: 1,
    name: '农场达人',
    avatar: '/leader1.jpg',
    level: 25,
    coins: 50000,
    plants: 89,
    isCurrent: false,
  },
  {
    id: 2,
    name: '种植高手',
    avatar: '/leader2.jpg',
    level: 23,
    coins: 45000,
    plants: 76,
    isCurrent: false,
  },
  {
    id: 3,
    name: 'QQ用户',
    avatar: '/default-avatar.png',
    level: 1,
    coins: 10000,
    plants: 12,
    isCurrent: true,
  },
  {
    id: 4,
    name: '新手玩家',
    avatar: '/leader4.jpg',
    level: 8,
    coins: 8000,
    plants: 5,
    isCurrent: false,
  },
])

// 计算属性
const pageTitle = computed(() => 'QQ农场 - 首页')

// 方法
const formatNumber = (num: number) => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num.toLocaleString()
}

const formatCoins = (coins: number) => {
  if (coins >= 10000) {
    return (coins / 10000).toFixed(1) + '万'
  }
  return coins.toLocaleString()
}

const formatTime = (time: Date) => {
  const now = new Date()
  const diff = now.getTime() - time.getTime()
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

// 事件处理
const handleLogoClick = () => {
  router.push('/')
}

const handleSearch = (query: string) => {
  console.log('搜索:', query)
  // 实现搜索逻辑
}

const handleTabChange = (tab: string) => {
  console.log('标签切换:', tab)
  // 实现标签切换逻辑
}

const handleMobileMenuClick = () => {
  console.log('移动端菜单点击')
  // 实现移动端菜单逻辑
}

const handleStartFarming = () => {
  router.push('/farm')
}

const handleVisitFriends = () => {
  router.push('/friends')
}

const handleEntryClick = (entry: string) => {
  router.push(`/${entry}`)
}

const handleActivityClick = (activity: FriendActivity) => {
  console.log('好友动态点击:', activity)
  // 实现好友动态点击逻辑
}

const handleViewAllFriends = () => {
  router.push('/friends')
}

const handleViewLeaderboard = () => {
  router.push('/leaderboard')
}

const handleLeaderboardClick = (user: LeaderboardUser) => {
  console.log('排行榜用户点击:', user)
  // 实现排行榜用户点击逻辑
}

const handleNavClick = (page: string) => {
  router.push(`/${page}`)
}

const handleSocialClick = (platform: string) => {
  console.log('社交点击:', platform)
  // 实现社交分享逻辑
}

const handleLegalClick = (type: string) => {
  console.log('法律链接点击:', type)
  // 实现法律链接点击逻辑
}

const handleLogout = () => {
  console.log('退出登录')
  // 实现退出登录逻辑
  router.push('/login')
}

const handleBack = () => {
  router.back()
}

const handleRetry = () => {
  console.log('重试')
  // 实现重试逻辑
}

const handleEmptyAction = () => {
  console.log('空状态操作')
  // 实现空状态操作逻辑
}

const handleMobileMenuClick2 = () => {
  console.log('移动端菜单点击')
}

const handleUserClick = () => {
  console.log('用户点击')
}

const handleFeatureClick = (feature: string) => {
  console.log('功能点击:', feature)
  // 实现功能点击逻辑
}

// 模拟数据更新
const updateGameStats = () => {
  // 模拟数据变化
  gameStats.value = {
    totalPlants: Math.floor(Math.random() * 50) + 150,
    totalCoins: Math.floor(Math.random() * 5000) + 25000,
    rank: Math.floor(Math.random() * 20) + 1,
    loginDays: Math.floor(Math.random() * 30) + 30,
  }
}

// 生命周期
onMounted(() => {
  // 每30秒更新一次游戏统计
  const statsInterval = setInterval(updateGameStats, 30000)
  
  // 清理定时器
  onUnmounted(() => {
    clearInterval(statsInterval)
  })
})

onUnmounted(() => {
  // 清理工作在onMounted中处理
})
</script>

<style scoped>
.home-view {
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

/* 欢迎横幅 */
.welcome-banner {
  display: flex;
  align-items: stretch;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 32px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

.banner-content {
  flex: 1;
  padding: 40px;
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 16px;
}

.welcome-title {
  font-size: 32px;
  font-weight: 700;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.welcome-subtitle {
  font-size: 18px;
  font-weight: 500;
  margin: 0;
  opacity: 0.9;
}

.banner-actions {
  display: flex;
  gap: 16px;
}

.banner-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.banner-btn.primary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.banner-btn.secondary {
  background: white;
  color: #667eea;
}

.banner-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.banner-image {
  width: 400px;
  flex-shrink: 0;
}

.banner-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 移动端欢迎横幅 */
.mobile-welcome-banner {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 20px;
  position: relative;
  height: 200px;
}

.mobile-welcome-banner .banner-content {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px;
  z-index: 1;
}

.mobile-welcome-banner .welcome-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.mobile-welcome-banner .welcome-subtitle {
  font-size: 14px;
  font-weight: 500;
  margin: 0;
  opacity: 0.9;
}

.mobile-welcome-banner .banner-actions {
  display: flex;
  justify-content: center;
}

.mobile-welcome-banner .banner-btn {
  padding: 8px 16px;
  font-size: 14px;
}

.mobile-welcome-banner .banner-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.3;
}

/* 快速入口 */
.quick-entries {
  margin-bottom: 32px;
}

.section-title {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin: 0 0 20px;
}

.entries-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.entry-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 16px;
}

.entry-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.entry-icon {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.entry-icon.farm {
  background: linear-gradient(135deg, #10b981, #059669);
}

.entry-icon.friends {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
}

.entry-icon.shop {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.entry-icon.warehouse {
  background: linear-gradient(135deg, #8b5cf6, #6366f1);
}

.entry-content {
  flex: 1;
}

.entry-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 4px;
}

.entry-description {
  font-size: 14px;
  color: #666;
  margin: 0;
}

/* 移动端快速入口 */
.mobile-quick-entries {
  margin-bottom: 20px;
}

.mobile-quick-entries .entries-grid {
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.mobile-quick-entries .entry-card {
  padding: 16px;
  flex-direction: column;
  text-align: center;
  gap: 8px;
}

.mobile-quick-entries .entry-icon {
  width: 48px;
  height: 48px;
}

.mobile-quick-entries .entry-title {
  font-size: 14px;
  margin: 0;
}

/* 游戏统计 */
.game-stats {
  margin-bottom: 32px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 16px;
}

  .stat-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
  }

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #333;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

/* 移动端游戏统计 */
.mobile-game-stats {
  margin-bottom: 20px;
}

.mobile-game-stats .section-title {
  font-size: 18px;
  margin: 0 0 12px;
}

.mobile-game-stats .stats-grid {
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.mobile-game-stats .stat-card {
  padding: 16px;
}

.mobile-game-stats .stat-icon {
  width: 40px;
  height: 40px;
}

.mobile-game-stats .stat-value {
  font-size: 18px;
}

.mobile-game-stats .stat-label {
  font-size: 12px;
}

/* 好友动态 */
.friends-activity {
  margin-bottom: 32px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.view-all-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  background: #f3f4f6;
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.view-all-btn:hover {
  background: #e5e7eb;
  color: #374151;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.activity-item {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 12px;
}

.activity-item:hover {
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.activity-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.activity-user {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.activity-action {
  font-size: 12px;
  color: #666;
}

.activity-time {
  font-size: 11px;
  color: #9ca3af;
}

/* 移动端好友动态 */
.mobile-friends-activity {
  margin-bottom: 20px;
}

.mobile-friends-activity .section-title {
  font-size: 16px;
  margin: 0 0 12px;
}

.mobile-friends-activity .view-all-btn {
  padding: 6px 12px;
  font-size: 12px;
}

.mobile-friends-activity .activity-item {
  padding: 12px;
}

.mobile-friends-activity .activity-user {
  font-size: 12px;
}

.mobile-friends-activity .activity-action {
  font-size: 11px;
}

/* 排行榜预览 */
.leaderboard-preview {
  margin-bottom: 32px;
}

.leaderboard-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.leaderboard-item {
  background: white;
  border-radius: 8px;
  padding: 12px 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 12px;
}

.leaderboard-item:hover {
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.leaderboard-item.is-current {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border: 1px solid #fbbf24;
}

.rank {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.user-stats {
  display: flex;
  gap: 8px;
}

.stat-value {
  font-size: 12px;
  color: #666;
}

/* 移动端排行榜预览 */
.mobile-leaderboard-preview {
  margin-bottom: 20px;
}

.mobile-leaderboard-preview .section-title {
  font-size: 16px;
  margin: 0 0 12px;
}

.mobile-leaderboard-preview .view-all-btn {
  padding: 6px 12px;
  font-size: 12px;
}

.mobile-leaderboard-preview .leaderboard-item {
  padding: 8px 12px;
}

.mobile-leaderboard-preview .rank {
  width: 24px;
  height: 24px;
  font-size: 12px;
}

.mobile-leaderboard-preview .user-name {
  font-size: 12px;
}

.mobile-leaderboard-preview .user-coins {
  font-size: 11px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .desktop-layout {
    display: none;
  }
  
  .mobile-layout {
    display: block;
  }
  
  .welcome-banner {
    margin-bottom: 20px;
  }
  
  .banner-content {
    padding: 20px;
  }
  
  .welcome-title {
    font-size: 24px;
  }
  
  .welcome-subtitle {
    font-size: 14px;
  }
  
  .banner-actions {
    flex-direction: column;
    gap: 8px;
  }
  
  .banner-btn {
    padding: 8px 16px;
    font-size: 14px;
  }
  
  .banner-image {
    display: none;
  }
  
  .quick-entries {
    margin-bottom: 20px;
  }
  
  .section-title {
    font-size: 20px;
    margin: 0 0 16px;
  }
  
  .entries-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  
  .entry-card {
    padding: 16px;
    flex-direction: column;
    text-align: center;
    gap: 8px;
  }
  
  .entry-icon {
    width: 48px;
    height: 48px;
  }
  
  .entry-title {
    font-size: 14px;
    margin: 0;
  }
  
  .game-stats {
    margin-bottom: 20px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  
  .stat-card {
    padding: 16px;
  }
  
  .stat-icon {
    width: 40
