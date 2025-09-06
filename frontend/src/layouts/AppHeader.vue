<template>
  <header class="app-header" :class="headerClasses">
    <!-- Logo区域 -->
    <div class="logo-section" @click="handleLogoClick">
      <img src="/logo.svg" alt="QQ农场" class="logo" />
      <span class="app-title">QQ农场</span>
    </div>

    <!-- 搜索框 -->
    <div v-if="showSearch" class="search-section">
      <SearchBox
        v-model="searchQuery"
        :placeholder="searchPlaceholder"
        @search="handleSearch"
        @clear="handleSearchClear"
      />
    </div>

    <!-- 导航菜单 -->
    <nav class="nav-section">
      <TabNavigation
        v-model="activeTab"
        :tabs="navigationTabs"
        variant="underline"
        size="md"
        @change="handleTabChange"
      />
    </nav>

    <!-- 用户信息区域 -->
    <div class="user-section">
      <!-- 金币显示 -->
      <div class="coin-display">
        <Coins :size="20" />
        <span class="coin-amount">{{ formatCoins(userCoins) }}</span>
      </div>

      <!-- 用户头像和下拉菜单 -->
      <div class="user-menu" :class="{ 'is-open': isMenuOpen }">
        <Avatar
          :src="userAvatar"
          :alt="userName"
          :level="userLevel"
          :show-level="true"
          :status="userStatus"
          :show-status="true"
          :clickable="true"
          @click="toggleMenu"
        />

        <!-- 下拉菜单 -->
        <div v-if="isMenuOpen" class="dropdown-menu">
          <div class="menu-header">
            <div class="user-info">
              <div class="user-name">{{ userName }}</div>
              <div class="user-level">Lv.{{ userLevel }}</div>
            </div>
          </div>

          <div class="menu-divider"></div>

          <div class="menu-items">
            <div class="menu-item" @click="handleProfileClick">
              <User :size="16" />
              <span>个人资料</span>
            </div>
            <div class="menu-item" @click="handleSettingsClick">
              <Settings :size="16" />
              <span>设置</span>
            </div>
            <div class="menu-item" @click="handleHelpClick">
              <HelpCircle :size="16" />
              <span>帮助</span>
            </div>
          </div>

          <div class="menu-divider"></div>

          <div class="menu-actions">
            <button class="menu-btn logout" @click="handleLogout">
              <LogOut :size="16" />
              <span>退出登录</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 移动端菜单按钮 -->
    <button v-if="showMobileMenu" class="mobile-menu-btn" @click="handleMobileMenuClick">
      <Menu :size="24" />
    </button>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Coins, User, Settings, HelpCircle, LogOut, Menu } from 'lucide-vue-next'
import Avatar from '../components/common/Avatar.vue'
import SearchBox from '../components/common/SearchBox.vue'
import TabNavigation from '../components/common/TabNavigation.vue'

interface Props {
  showSearch?: boolean
  showMobileMenu?: boolean
  fixed?: boolean
  transparent?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showSearch: true,
  showMobileMenu: true,
  fixed: true,
  transparent: false,
})

const emit = defineEmits<{
  'update:searchQuery': [query: string]
  search: [query: string]
  'search:clear': []
  'tab:change': [tab: string]
  'logo:click': []
  'profile:click': []
  'settings:click': []
  'help:click': []
  logout: []
  'mobile-menu:click': []
}>()

// 响应式状态
const router = useRouter()
const route = useRoute()
const isMenuOpen = ref(false)
const searchQuery = ref('')

// 计算属性
const headerClasses = computed(() => [
  'app-header',
  {
    fixed: props.fixed,
    transparent: props.transparent,
    scrolled: isScrolled.value,
  },
])

const navigationTabs = computed(() => [
  { key: 'home', label: '农场' },
  { key: 'friends', label: '好友' },
  { key: 'shop', label: '商店' },
  { key: 'leaderboard', label: '排行榜' },
])

const activeTab = computed({
  get: () => {
    const pathMap: Record<string, string> = {
      '/': 'home',
      '/farm': 'home',
      '/friends': 'friends',
      '/shop': 'shop',
      '/leaderboard': 'leaderboard',
    }
    return pathMap[route.path] || 'home'
  },
  set: (value: string) => {
    const routeMap: Record<string, string> = {
      home: '/farm',
      friends: '/friends',
      shop: '/shop',
      leaderboard: '/leaderboard',
    }
    router.push(routeMap[value] || '/farm')
  },
})

// 模拟用户数据（实际项目中应该从store获取）
const userName = ref('QQ用户')
const userAvatar = ref('/default-avatar.png')
const userLevel = ref(1)
const userStatus = ref<'online' | 'offline' | 'away' | 'busy'>('online')
const userCoins = ref(10000)

const searchPlaceholder = ref('搜索好友、商品...')

// 滚动状态
const isScrolled = ref(false)

// 方法
const formatCoins = (coins: number) => {
  if (coins >= 10000) {
    return (coins / 10000).toFixed(1) + '万'
  }
  return coins.toLocaleString()
}

const handleLogoClick = () => {
  emit('logo:click')
  router.push('/')
}

const handleSearch = (query: string) => {
  emit('search', query)
}

const handleSearchClear = () => {
  emit('search:clear')
}

const handleTabChange = (tab: string) => {
  emit('tab:change', tab)
}

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const handleProfileClick = () => {
  emit('profile:click')
  isMenuOpen.value = false
}

const handleSettingsClick = () => {
  emit('settings:click')
  isMenuOpen.value = false
}

const handleHelpClick = () => {
  emit('help:click')
  isMenuOpen.value = false
}

const handleLogout = () => {
  emit('logout')
  isMenuOpen.value = false
  // 这里应该调用登出API
  router.push('/login')
}

const handleMobileMenuClick = () => {
  emit('mobile-menu:click')
}

// 监听搜索查询变化
watch(searchQuery, (newValue) => {
  emit('update:searchQuery', newValue)
})

// 滚动事件处理
const handleScroll = () => {
  isScrolled.value = window.scrollY > 10
}

// 生命周期
onMounted(() => {
  window.addEventListener('scroll', handleScroll)

  // 点击外部关闭菜单
  document.addEventListener('click', (e) => {
    const menu = document.querySelector('.user-menu')
    if (menu && !menu.contains(e.target as Node)) {
      isMenuOpen.value = false
    }
  })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  document.removeEventListener('click', (e) => {
    const menu = document.querySelector('.user-menu')
    if (menu && !menu.contains(e.target as Node)) {
      isMenuOpen.value = false
    }
  })
})

// 暴露方法供父组件调用
defineExpose({
  setSearchQuery: (query: string) => {
    searchQuery.value = query
  },
  setActiveTab: (tab: string) => {
    activeTab.value = tab
  },
})
</script>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  z-index: 100;
}

.app-header.fixed {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
}

.app-header.transparent {
  background: rgba(255, 255, 255, 0.8);
}

.app-header.scrolled {
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Logo区域 */
.logo-section {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logo-section:hover {
  transform: scale(1.05);
}

.logo {
  width: 32px;
  height: 32px;
}

.app-title {
  font-size: 18px;
  font-weight: 700;
  color: #333;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* 搜索区域 */
.search-section {
  flex: 1;
  max-width: 400px;
}

/* 导航区域 */
.nav-section {
  flex: 2;
  max-width: 600px;
}

/* 用户区域 */
.user-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.coin-display {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border-radius: 20px;
  font-weight: 600;
}

.coin-amount {
  color: #92400e;
  font-size: 14px;
}

.user-menu {
  position: relative;
}

.user-menu.is-open .dropdown-menu {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 200px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.3s ease;
}

.menu-header {
  padding: 16px;
  border-bottom: 1px solid #f3f4f6;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.user-level {
  font-size: 12px;
  color: #667eea;
  font-weight: 500;
}

.menu-divider {
  height: 1px;
  background: #f3f4f6;
  margin: 8px 0;
}

.menu-items {
  padding: 8px 0;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  color: #333;
}

.menu-item:hover {
  background: #f3f4f6;
}

.menu-actions {
  padding: 8px 16px;
}

.menu-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  background: #f3f4f6;
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.menu-btn.logout {
  background: #fef2f2;
  color: #ef4444;
}

.menu-btn:hover {
  background: #e5e7eb;
  color: #374151;
}

.menu-btn.logout:hover {
  background: #fee2e2;
  color: #dc2626;
}

/* 移动端菜单按钮 */
.mobile-menu-btn {
  display: none;
  border: none;
  background: transparent;
  color: #333;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.mobile-menu-btn:hover {
  background: #f3f4f6;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .app-header {
    padding: 8px 16px;
    gap: 12px;
  }

  .app-title {
    font-size: 16px;
  }

  .search-section {
    max-width: 300px;
  }

  .nav-section {
    flex: 1;
    max-width: none;
  }

  .coin-display {
    padding: 6px 10px;
  }

  .coin-amount {
    font-size: 12px;
  }

  .mobile-menu-btn {
    display: flex;
  }
}

@media (max-width: 480px) {
  .app-header {
    padding: 8px 12px;
    gap: 8px;
  }

  .logo {
    width: 24px;
    height: 24px;
  }

  .app-title {
    font-size: 14px;
  }

  .search-section {
    display: none;
  }

  .nav-section {
    display: none;
  }

  .coin-display {
    padding: 4px 8px;
  }

  .coin-amount {
    font-size: 11px;
  }

  .dropdown-menu {
    min-width: 180px;
    right: -8px;
  }
}

/* 深色主题支持 */
@media (prefers-color-scheme: dark) {
  .app-header {
    background: rgba(31, 41, 55, 0.95);
    border-bottom-color: rgba(255, 255, 255, 0.1);
  }

  .app-header.transparent {
    background: rgba(31, 41, 55, 0.8);
  }

  .app-header.scrolled {
    background: rgba(31, 41, 55, 0.95);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }

  .app-title {
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

  .user-name {
    color: #f9fafb;
  }

  .user-level {
    color: #818cf8;
  }

  .dropdown-menu {
    background: #1f2937;
    border-color: rgba(255, 255, 255, 0.1);
  }

  .menu-divider {
    background: rgba(255, 255, 255, 0.1);
  }

  .menu-item {
    color: #f9fafb;
  }

  .menu-item:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .menu-btn {
    background: #374151;
    color: #9ca3af;
  }

  .menu-btn:hover {
    background: #4b5563;
    color: #f9fafb;
  }

  .menu-btn.logout {
    background: #451a03;
    color: #fbbf24;
  }

  .menu-btn.logout:hover {
    background: #78350f;
    color: #fbbf24;
  }

  .mobile-menu-btn {
    color: #f9fafb;
  }

  .mobile-menu-btn:hover {
    background: rgba(255, 255, 255, 0.1);
  }
}
</style>
