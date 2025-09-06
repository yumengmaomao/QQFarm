<template>
  <div class="mobile-layout" :class="layoutClasses">
    <!-- 顶部导航栏 -->
    <div class="mobile-header" :class="headerClasses">
      <div class="header-left">
        <button class="menu-btn" @click="handleMenuClick">
          <Menu :size="24" />
        </button>
        <div class="app-title" @click="handleTitleClick">
          <img src="/logo.svg" alt="QQ农场" class="logo" />
          <span>QQ农场</span>
        </div>
      </div>

      <div class="header-right">
        <!-- 金币显示 -->
        <div class="coin-display">
          <Coins :size="20" />
          <span class="coin-amount">{{ formatCoins(userCoins) }}</span>
        </div>

        <!-- 用户头像 -->
        <Avatar
          :src="userAvatar"
          :alt="userName"
          :level="userLevel"
          :show-level="true"
          :status="userStatus"
          :show-status="true"
          :size="sm"
          :clickable="true"
          @click="handleUserClick"
        />
      </div>
    </div>

    <!-- 侧边栏菜单 -->
    <div v-if="showSidebar" class="sidebar" :class="{ 'is-open': isSidebarOpen }">
      <div class="sidebar-header">
        <div class="user-info">
          <Avatar
            :src="userAvatar"
            :alt="userName"
            :level="userLevel"
            :show-level="true"
            :status="userStatus"
            :show-status="true"
            :size="md"
            :clickable="false"
          />
          <div class="user-details">
            <div class="user-name">{{ userName }}</div>
            <div class="user-level">Lv.{{ userLevel }}</div>
          </div>
        </div>
        <button class="close-btn" @click="toggleSidebar">
          <X :size="20" />
        </button>
      </div>

      <div class="sidebar-menu">
        <div class="menu-section">
          <h4 class="menu-title">游戏</h4>
          <ul class="menu-list">
            <li
              class="menu-item"
              :class="{ active: activeTab === 'farm' }"
              @click="handleMenuClick('farm')"
            >
              <Home :size="20" />
              <span>我的农场</span>
            </li>
            <li
              class="menu-item"
              :class="{ active: activeTab === 'friends' }"
              @click="handleMenuClick('friends')"
            >
              <Users :size="20" />
              <span>好友农场</span>
            </li>
            <li
              class="menu-item"
              :class="{ active: activeTab === 'shop' }"
              @click="handleMenuClick('shop')"
            >
              <ShoppingCart :size="20" />
              <span>商店</span>
            </li>
            <li
              class="menu-item"
              :class="{ active: activeTab === 'leaderboard' }"
              @click="handleMenuClick('leaderboard')"
            >
              <Trophy :size="20" />
              <span>排行榜</span>
            </li>
          </ul>
        </div>

        <div class="menu-section">
          <h4 class="menu-title">功能</h4>
          <ul class="menu-list">
            <li class="menu-item" @click="handleFeatureClick('warehouse')">
              <Package :size="20" />
              <span>仓库</span>
            </li>
            <li class="menu-item" @click="handleFeatureClick('settings')">
              <Settings :size="20" />
              <span>设置</span>
            </li>
            <li class="menu-item" @click="handleFeatureClick('help')">
              <HelpCircle :size="20" />
              <span>帮助</span>
            </li>
          </ul>
        </div>
      </div>

      <div class="sidebar-footer">
        <div class="footer-links">
          <a href="#" @click="handleLegalClick('privacy')">隐私政策</a>
          <a href="#" @click="handleLegalClick('terms')">服务条款</a>
        </div>
        <div class="logout-btn" @click="handleLogout">
          <LogOut :size="16" />
          <span>退出登录</span>
        </div>
      </div>
    </div>

    <!-- 遮罩层 -->
    <div v-if="showSidebar && isSidebarOpen" class="sidebar-overlay" @click="toggleSidebar"></div>

    <!-- 主要内容区域 -->
    <div class="mobile-content" :class="contentClasses">
      <AppMain
        :loading="loading"
        :loading-message="loadingMessage"
        :loading-size="loadingSize"
        :loading-variant="loadingVariant"
        :isEmpty="isEmpty"
        :empty-icon="emptyIcon"
        :empty-title="emptyTitle"
        :empty-description="emptyDescription"
        :empty-size="emptySize"
        :show-empty-action="showEmptyAction"
        :error="error"
        :error-message="errorMessage"
        :show-page-header="false"
        :show-mobile-actions="showMobileActions"
        :padding="contentPadding"
        :max-width="contentMaxWidth"
        :centered="contentCentered"
        :scrollable="contentScrollable"
        @back="handleBack"
        @retry="handleRetry"
      >
        <!-- 页面标题栏 -->
        <template v-if="showPageHeader" #page-actions>
          <div class="page-actions">
            <button class="action-btn" @click="handleBack">
              <ArrowLeft :size="20" />
            </button>
            <h2 class="page-title">{{ pageTitle }}</h2>
          </div>
        </template>

        <!-- 空状态操作 -->
        <template v-if="showEmptyAction" #empty-action>
          <button class="empty-action-btn" @click="handleEmptyAction">
            <Plus :size="16" />
            <span>添加</span>
          </button>
        </template>

        <!-- 主要内容 -->
        <slot></slot>
      </AppMain>
    </div>

    <!-- 底部导航栏 -->
    <div v-if="showBottomNav" class="bottom-nav" :class="bottomNavClasses">
      <div
        class="nav-item"
        :class="{ active: activeTab === 'farm' }"
        @click="handleNavClick('farm')"
      >
        <Home :size="20" />
        <span>农场</span>
      </div>
      <div
        class="nav-item"
        :class="{ active: activeTab === 'friends' }"
        @click="handleNavClick('friends')"
      >
        <Users :size="20" />
        <span>好友</span>
      </div>
      <div
        class="nav-item"
        :class="{ active: activeTab === 'shop' }"
        @click="handleNavClick('shop')"
      >
        <ShoppingCart :size="20" />
        <span>商店</span>
      </div>
      <div
        class="nav-item"
        :class="{ active: activeTab === 'leaderboard' }"
        @click="handleNavClick('leaderboard')"
      >
        <Trophy :size="20" />
        <span>排行</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  Menu,
  X,
  Home,
  Users,
  ShoppingCart,
  Trophy,
  Package,
  Settings,
  HelpCircle,
  LogOut,
  Coins,
  ArrowLeft,
} from 'lucide-vue-next'
import Avatar from '../components/common/Avatar.vue'
import AppMain from './AppMain.vue'

interface Props {
  showSidebar?: boolean
  showBottomNav?: boolean
  showPageHeader?: boolean
  showMobileActions?: boolean

  // AppMain props
  loading?: boolean
  loadingMessage?: string
  loadingSize?: 'sm' | 'md' | 'lg'
  loadingVariant?: 'default' | 'overlay' | 'inline'

  isEmpty?: boolean
  emptyIcon?: any
  emptyTitle?: string
  emptyDescription?: string
  emptySize?: 'sm' | 'md' | 'lg'
  showEmptyAction?: boolean

  error?: boolean
  errorMessage?: string

  contentPadding?: 'none' | 'sm' | 'md' | 'lg'
  contentMaxWidth?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
  contentCentered?: boolean
  contentScrollable?: boolean

  pageTitle?: string
}

const props = withDefaults(defineProps<Props>(), {
  showSidebar: true,
  showBottomNav: true,
  showPageHeader: true,
  showMobileActions: true,

  loading: false,
  loadingMessage: '加载中...',
  loadingSize: 'md',
  loadingVariant: 'spinner',

  isEmpty: false,
  emptyIcon: undefined,
  emptyTitle: '暂无数据',
  emptyDescription: '这里还没有任何内容',
  emptySize: 'md',
  showEmptyAction: false,

  error: false,
  errorMessage: '加载失败，请稍后重试',

  contentPadding: 'sm',
  contentMaxWidth: 'full',
  contentCentered: false,
  contentScrollable: true,

  pageTitle: '',
})

const emit = defineEmits<{
  'menu:click': []
  'title:click': []
  'user:click': []
  'nav:click': [tab: string]
  'feature:click': [feature: string]
  'legal:click': [type: string]
  logout: []
  back: []
  retry: []
  'empty-action:click': []
}>()

// 响应式状态
const router = useRouter()
const route = useRoute()
const isSidebarOpen = ref(false)
const activeTab = ref('farm')

// 模拟用户数据（实际项目中应该从store获取）
const userName = ref('QQ用户')
const userAvatar = ref('/default-avatar.png')
const userLevel = ref(1)
const userStatus = ref<'online' | 'offline' | 'away' | 'busy'>('online')
const userCoins = ref(10000)

// 计算属性
const layoutClasses = computed(() => [
  'mobile-layout',
  {
    'has-sidebar': props.showSidebar,
    'has-bottom-nav': props.showBottomNav,
  },
])

const headerClasses = computed(() => [
  'mobile-header',
  {
    scrolled: isScrolled.value,
  },
])

const contentClasses = computed(() => [
  'mobile-content',
  {
    'has-sidebar': props.showSidebar && isSidebarOpen.value,
    'has-bottom-nav': props.showBottomNav,
  },
])

const bottomNavClasses = computed(() => [
  'bottom-nav',
  {
    'is-hidden': props.showSidebar && isSidebarOpen.value,
  },
])

// 滚动状态
const isScrolled = ref(false)

// 方法
const formatCoins = (coins: number) => {
  if (coins >= 10000) {
    return (coins / 10000).toFixed(1) + '万'
  }
  return coins.toLocaleString()
}

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const handleMenuClick = () => {
  emit('menu:click')
  toggleSidebar()
}

const handleTitleClick = () => {
  emit('title:click')
  router.push('/')
}

const handleUserClick = () => {
  emit('user:click')
  toggleSidebar()
}

const handleNavClick = (tab: string) => {
  emit('nav:click', tab)
  activeTab.value = tab
  router.push(`/${tab}`)
}

const handleFeatureClick = (feature: string) => {
  emit('feature:click', feature)
}

const handleLegalClick = (type: string) => {
  emit('legal:click', type)
}

const handleLogout = () => {
  emit('logout')
  // 这里应该调用登出API
  router.push('/login')
}

const handleBack = () => {
  emit('back')
  router.back()
}

const handleRetry = () => {
  emit('retry')
}

const handleEmptyAction = () => {
  emit('empty-action:click')
}

// 监听路由变化
watch(
  () => route.path,
  (newPath) => {
    const pathMap: Record<string, string> = {
      '/': 'farm',
      '/farm': 'farm',
      '/friends': 'friends',
      '/shop': 'shop',
      '/leaderboard': 'leaderboard',
    }
    activeTab.value = pathMap[newPath] || 'farm'
  },
)

// 滚动事件处理
const handleScroll = () => {
  isScrolled.value = window.scrollY > 10
}

// 生命周期
onMounted(() => {
  window.addEventListener('scroll', handleScroll)

  // 初始化当前标签
  const pathMap: Record<string, string> = {
    '/': 'farm',
    '/farm': 'farm',
    '/friends': 'friends',
    '/shop': 'shop',
    '/leaderboard': 'leaderboard',
  }
  activeTab.value = pathMap[route.path] || 'farm'
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

// 暴露方法供父组件调用
defineExpose({
  toggleSidebar,
  setActiveTab: (tab: string) => {
    activeTab.value = tab
  },
})
</script>

<style scoped>
.mobile-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f8fafc;
  overflow: hidden;
}

/* 顶部导航栏 */
.mobile-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 56px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  z-index: 100;
  transition: all 0.3s ease;
}

.mobile-header.scrolled {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.menu-btn {
  border: none;
  background: transparent;
  color: #333;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.menu-btn:hover {
  background: #f3f4f6;
}

.app-title {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.app-title:hover {
  transform: scale(1.05);
}

.logo {
  width: 24px;
  height: 24px;
}

.app-title span {
  font-size: 16px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.coin-display {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border-radius: 12px;
  font-weight: 600;
}

.coin-amount {
  color: #92400e;
  font-size: 12px;
}

/* 侧边栏 */
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 280px;
  background: white;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  transform: translateX(-100%);
  transition: transform 0.3s ease;
  z-index: 200;
  display: flex;
  flex-direction: column;
}

.sidebar.is-open {
  transform: translateX(0);
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.user-level {
  font-size: 12px;
  color: #667eea;
  font-weight: 500;
}

.close-btn {
  border: none;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.sidebar-menu {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.sidebar-menu::-webkit-scrollbar {
  width: 4px;
}

.sidebar-menu::-webkit-scrollbar-track {
  background: #f3f4f6;
}

.sidebar-menu::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 2px;
}

.menu-section {
  margin-bottom: 24px;
}

.menu-section:last-child {
  margin-bottom: 0;
}

.menu-title {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 12px;
}

.menu-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  color: #4b5563;
}

.menu-item:hover {
  background: #f3f4f6;
  color: #374151;
}

.menu-item.active {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.sidebar-footer {
  padding: 20px;
  border-top: 1px solid #f3f4f6;
}

.footer-links {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.footer-links a {
  font-size: 12px;
  color: #6b7280;
  text-decoration: none;
  transition: all 0.3s ease;
}

.footer-links a:hover {
  color: #374151;
}

.logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  background: #fef2f2;
  color: #ef4444;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background: #fee2e2;
  color: #dc2626;
}

/* 遮罩层 */
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 150;
}

/* 主要内容区域 */
.mobile-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all 0.3s ease;
}

.mobile-content.has-sidebar {
  margin-left: 280px;
}

.mobile-content.has-bottom-nav {
  padding-bottom: 60px;
}

.page-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: white;
  border-bottom: 1px solid #f3f4f6;
}

.action-btn {
  border: none;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.action-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.page-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.empty-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.empty-action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

/* 底部导航栏 */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 100;
  transition: all 0.3s ease;
}

.bottom-nav.is-hidden {
  transform: translateY(100%);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #6b7280;
}

.nav-item:hover {
  color: #374151;
}

.nav-item.active {
  color: #667eea;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sidebar {
    width: 240px;
  }

  .mobile-content.has-sidebar {
    margin-left: 240px;
  }
}

@media (max-width: 480px) {
  .mobile-header {
    height: 48px;
    padding: 0 12px;
  }

  .logo {
    width: 20px;
    height: 20px;
  }

  .app-title span {
    font-size: 14px;
  }

  .coin-amount {
    font-size: 11px;
  }

  .sidebar {
    width: 200px;
  }

  .sidebar-header {
    padding: 16px;
  }

  .user-name {
    font-size: 12px;
  }

  .user-level {
    font-size: 10px;
  }

  .sidebar-menu {
    padding: 16px;
  }

  .menu-title {
    font-size: 11px;
  }

  .menu-item {
    font-size: 12px;
    padding: 6px 8px;
  }

  .sidebar-footer {
    padding: 16px;
  }

  .footer-links {
    margin-bottom: 12px;
  }

  .footer-links a {
    font-size: 11px;
  }

  .logout-btn {
    font-size: 12px;
    padding: 6px 8px;
  }

  .mobile-content.has-sidebar {
    margin-left: 200px;
  }

  .page-actions {
    padding: 8px 12px;
  }

  .page-title {
    font-size: 14px;
  }

  .empty-action-btn {
    padding: 6px 12px;
    font-size: 12px;
  }

  .bottom-nav {
    height: 56px;
  }

  .nav-item {
    padding: 6px 8px;
  }
}

/* 深色主题支持 */
@media (prefers-color-scheme: dark) {
  .mobile-layout {
    background: #1f2937;
  }

  .mobile-header {
    background: rgba(31, 41, 55, 0.95);
    border-bottom-color: rgba(255, 255, 255, 0.1);
  }

  .menu-btn {
    color: #f9fafb;
  }

  .menu-btn:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .app-title span {
    background: linear-gradient(135deg, #818cf8, #6366f1);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .coin-display {
    background: linear-gradient(135deg, #451a03, #78350f);
  }

  .coin-amount {
    color: #fbbf24;
  }

  .sidebar {
    background: #1f2937;
    border-color: rgba(255, 255, 255, 0.1);
  }

  .sidebar-header {
    border-bottom-color: rgba(255, 255, 255, 0.1);
  }

  .user-name {
    color: #f9fafb;
  }

  .user-level {
    color: #818cf8;
  }

  .close-btn {
    color: #9ca3af;
  }

  .close-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #f9fafb;
  }

  .menu-title {
    color: #9ca3af;
  }

  .menu-item {
    color: #9ca3af;
  }

  .menu-item:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #f9fafb;
  }

  .menu-item.active {
    background: linear-gradient(135deg, #6366f1, #818cf8);
    color: white;
  }

  .sidebar-footer {
    border-top-color: rgba(255, 255, 255, 0.1);
  }

  .footer-links a {
    color: #9ca3af;
  }

  .footer-links a:hover {
    color: #f9fafb;
  }

  .logout-btn {
    background: #451a03;
    color: #fbbf24;
  }

  .logout-btn:hover {
    background: #78350f;
    color: #fbbf24;
  }

  .page-actions {
    background: #1f2937;
    border-bottom-color: rgba(255, 255, 255, 0.1);
  }

  .action-btn {
    color: #9ca3af;
  }

  .action-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #f9fafb;
  }

  .page-title {
    color: #f9fafb;
  }

  .bottom-nav {
    background: rgba(31, 41, 55, 0.95);
    border-top-color: rgba(255, 255, 255, 0.1);
  }

  .nav-item {
    color: #9ca3af;
  }

  .nav-item:hover {
    color: #f9fafb;
  }

  .nav-item.active {
    color: #818cf8;
  }
}
</style>
