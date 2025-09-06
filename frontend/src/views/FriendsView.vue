<template>
  <div class="friends-view">
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
          <div class="friends-header-actions">
            <div class="friends-stats">
              <div class="stat-item">
                <Users :size="20" />
                <span>好友 {{ friendsCount }}</span>
              </div>
              <div class="stat-item">
                <Heart :size="20" />
                <span>亲密度 {{ totalIntimacy }}</span>
              </div>
              <div class="stat-item">
                <Gift :size="20} />
                <span>礼物 {{ totalGifts }}</span>
              </div>
            </div>
            <div class="friends-actions">
              <button class="action-btn primary" @click="handleAddFriend">
                <UserPlus :size="16" />
                <span>添加好友</span>
              </button>
              <button class="action-btn secondary" @click="handleVisitAll">
                <Home :size="16" />
                <span>全部访问</span>
              </button>
              <button class="action-btn tertiary" @click="handleSendGifts">
                <Gift :size="16} />
                <span>赠送礼物</span>
              </button>
            </div>
          </div>
        </template>

        <!-- 搜索和筛选 -->
        <div class="friends-controls">
          <div class="search-section">
            <SearchBox
              :placeholder="searchPlaceholder"
              :value="searchQuery"
              @input="handleSearchInput"
              @search="handleSearch"
            />
          </div>
          <div class="filter-section">
            <div class="filter-tabs">
              <button
                class="filter-tab"
                :class="{ active: activeTab === 'all' }"
                @click="handleTabChange('all')"
              >
                全部好友
              </button>
              <button
                class="filter-tab"
                :class="{ active: activeTab === 'online' }"
                @click="handleTabChange('online')"
              >
                在线好友
              </button>
              <button
                class="filter-tab"
                :class="{ active: activeTab === 'recent' }"
                @click="handleTabChange('recent')"
              >
                最近互动
              </button>
            </div>
            <div class="sort-options">
              <select class="sort-select" @change="handleSortChange">
                <option value="intimacy-desc">亲密度降序</option>
                <option value="intimacy-asc">亲密度升序</option>
                <option value="level-desc">等级降序</option>
                <option value="level-asc">等级升序</option>
                <option value="recent">最近互动</option>
              </select>
            </div>
          </div>
        </div>

        <!-- 好友列表 -->
        <div class="friends-list">
          <div
            v-for="friend in filteredFriends"
            :key="friend.id"
            class="friend-item"
            @click="handleFriendClick(friend)"
          >
            <FriendCard
              :friend="friend"
              :show-actions="true"
              :show-intimacy="true"
              :show-last-visit="true"
              @visit="handleVisitFriend"
              @gift="handleSendGift"
              @remove="handleRemoveFriend"
            />
          </div>
        </div>

        <!-- 空状态操作 -->
        <template v-if="showEmptyAction" #empty-action>
          <button class="empty-action-btn" @click="handleAddFriend">
            <UserPlus :size="16} />
            <span>添加第一个好友</span>
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
      <div class="mobile-friends-content">
        <!-- 好友统计 -->
        <div class="mobile-friends-stats">
          <div class="stats-grid">
            <div class="stat-card">
              <Users :size="20" />
              <div>
                <div class="stat-value">{{ friendsCount }}</div>
                <div class="stat-label">好友</div>
              </div>
            </div>
            <div class="stat-card">
              <Heart :size="20} />
              <div>
                <div class="stat-value">{{ totalIntimacy }}</div>
                <div class="stat-label">亲密度</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 搜索框 -->
        <div class="mobile-search-section">
          <SearchBox
            :placeholder="searchPlaceholder"
            :value="searchQuery"
            @input="handleSearchInput"
            @search="handleSearch"
          />
        </div>

        <!-- 筛选标签 -->
        <div class="mobile-filter-tabs">
          <div class="filter-tabs-scroll">
            <button
              class="filter-tab"
              :class="{ active: activeTab === 'all' }"
              @click="handleTabChange('all')"
            >
              全部
            </button>
            <button
              class="filter-tab"
              :class="{ active: activeTab === 'online' }"
              @click="handleTabChange('online')"
            >
              在线
            </button>
            <button
              class="filter-tab"
              :class="{ active: activeTab === 'recent' }"
              @click="handleTabChange('recent')"
            >
              最近
            </button>
          </div>
        </div>

        <!-- 好友列表 -->
        <div class="mobile-friends-list">
          <div
            v-for="friend in filteredFriends"
            :key="friend.id"
            class="friend-item"
            @click="handleFriendClick(friend)"
          >
            <FriendCard
              :friend="friend"
              :show-actions="false"
              :show-intimacy="true"
              :show-last-visit="false"
              :size="sm"
              @visit="handleVisitFriend"
              @gift="handleSendGift"
              @remove="handleRemoveFriend"
            />
          </div>
        </div>

        <!-- 移动端操作栏 -->
        <template #mobile-actions>
          <div class="mobile-actions-bar">
            <button class="mobile-action-btn" @click="handleAddFriend">
              <UserPlus :size="20} />
              <span>添加</span>
            </button>
            <button class="mobile-action-btn" @click="handleVisitAll">
              <Home :size="20} />
              <span>访问</span>
            </button>
            <button class="mobile-action-btn" @click="handleSendGifts">
              <Gift :size="20} />
              <span>礼物</span>
            </button>
          </div>
        </template>
      </div>
    </MobileLayout>

    <!-- 添加好友弹窗 -->
    <ModalDialog
      v-if="showAddFriendDialog"
      :visible="showAddFriendDialog"
      title="添加好友"
      icon="UserPlus"
      :show-cancel="true"
      :show-confirm="false"
      cancel-text="取消"
      @cancel="handleAddFriendDialogCancel"
    >
      <div class="add-friend-content">
        <div class="search-section">
          <SearchBox
            placeholder="搜索用户ID或昵称"
            :value="friendSearchQuery"
            @input="handleFriendSearchInput"
            @search="handleFriendSearch"
          />
        </div>
        
        <div class="search-results">
          <div v-if="friendSearchLoading" class="loading-container">
            <LoadingState
              message="搜索中..."
              size="md"
              variant="spinner"
            />
          </div>
          
          <div v-else-if="friendSearchResults.length > 0" class="results-list">
            <div
              v-for="user in friendSearchResults"
              :key="user.id"
              class="search-result-item"
              :class="{ 'is-friend': user.isFriend }"
              @click="handleSearchResultClick(user)"
            >
              <Avatar
                :src="user.avatar"
                :alt="user.name"
                :level="user.level"
                :show-level="true"
                :status="user.status"
                :show-status="true"
                :size="sm"
              />
              <div class="user-info">
                <div class="user-name">{{ user.name }}</div>
                <div class="user-level">等级 {{ user.level }}</div>
              </div>
              <div class="user-status">
                <span v-if="user.isFriend" class="status-friend">已是好友</span>
                <button
                  v-else
                  class="add-btn"
                  @click.stop="handleAddUserAsFriend(user)"
                >
                  <UserPlus :size="16} />
                </button>
              </div>
            </div>
          </div>
          
          <div v-else-if="friendSearchQuery && !friendSearchLoading" class="no-results">
            <EmptyState
              icon="Search"
              title="未找到用户"
              description="请检查搜索条件或尝试其他关键词"
              :show-action="false"
            />
          </div>
        </div>
      </div>
    </ModalDialog>

    <!-- 赠送礼物弹窗 -->
    <ModalDialog
      v-if="showGiftDialog"
      :visible="showGiftDialog"
      :title="`给${selectedFriend?.name || ''}赠送礼物`"
      icon="Gift"
      :show-cancel="true"
      :show-confirm="true"
      :cancel-text="取消"
      :confirm-text="赠送"
      @cancel="handleGiftDialogCancel"
      @confirm="handleGiftDialogConfirm"
    >
      <div class="gift-dialog-content">
        <div class="friend-info">
          <Avatar
            :src="selectedFriend?.avatar"
            :alt="selectedFriend?.name"
            :level="selectedFriend?.level"
            :show-level="true"
            :status="selectedFriend?.status"
            :show-status="true"
            :size="md"
          />
          <div class="friend-details">
            <h3 class="friend-name">{{ selectedFriend?.name }}</h3>
            <div class="friend-stats">
              <div class="friend-stat">
                <span class="stat-label">等级:</span>
                <span class="stat-value">{{ selectedFriend?.level }}</span>
              </div>
              <div class="friend-stat">
                <span class="stat-label">亲密度:</span>
                <span class="stat-value">{{ selectedFriend?.intimacy }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="gift-selection">
          <h4 class="selection-title">选择礼物</h4>
          <div class="gifts-grid">
            <div
              v-for="gift in availableGifts"
              :key="gift.id"
              class="gift-item"
              :class="{ 'selected': selectedGift?.id === gift.id }"
              @click="handleGiftSelect(gift)"
            >
              <img :src="gift.image" :alt="gift.name" class="gift-image" />
              <div class="gift-info">
                <div class="gift-name">{{ gift.name }}</div>
                <div class="gift-price">{{ formatCoins(gift.price) }}</div>
                <div class="gift-intimacy">+{{ gift.intimacy }} 亲密度</div>
              </div>
            </div>
          </div>
        </div>
        
        <div v-if="selectedGift" class="gift-summary">
          <div class="summary-item">
            <span class="summary-label">礼物价值:</span>
            <span class="summary-value">{{ formatCoins(selectedGift.price) }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">亲密度提升:</span>
            <span class="summary-value">+{{ selectedGift.intimacy }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">当前金币:</span>
            <span class="summary-value">{{ formatCoins(userCoins) }}</span>
          </div>
        </div>
      </div>
    </ModalDialog>

    <!-- 移除好友确认弹窗 -->
    <ConfirmDialog
      v-if="showRemoveFriendDialog"
      :visible="showRemoveFriendDialog"
      :title="`移除好友`"
      :message="`确定要移除好友 ${selectedFriend?.name || ''} 吗？此操作不可撤销。`"
      icon="AlertTriangle"
      :type="warning"
      @cancel="handleRemoveFriendDialogCancel"
      @confirm="handleRemoveFriendDialogConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Users,
  Heart,
  Gift,
  UserPlus,
  Home,
  Search,
  AlertTriangle,
  Clock,
  MapPin,
  MessageCircle,
} from 'lucide-vue-next'
import AppHeader from '../layouts/AppHeader.vue'
import AppMain from '../layouts/AppMain.vue'
import AppFooter from '../layouts/AppFooter.vue'
import MobileLayout from '../layouts/MobileLayout.vue'
import FriendCard from '../components/business/FriendCard.vue'
import SearchBox from '../components/common/SearchBox.vue'
import LoadingState from '../components/common/LoadingState.vue'
import EmptyState from '../components/common/EmptyState.vue'
import ModalDialog from '../components/common/ModalDialog.vue'
import ConfirmDialog from '../components/common/ConfirmDialog.vue'
import Avatar from '../components/common/Avatar.vue'

interface Friend {
  id: number
  name: string
  avatar: string
  level: number
  status: 'online' | 'offline' | 'away' | 'busy'
  intimacy: number
  lastVisit: Date
  lastInteraction: Date
  isFriend: boolean
  farmPlots: number
  totalHarvest: number
}

interface Gift {
  id: number
  name: string
  image: string
  price: number
  intimacy: number
}

interface User {
  id: number
  name: string
  avatar: string
  level: number
  status: 'online' | 'offline' | 'away' | 'busy'
  isFriend: boolean
}

// 响应式状态
const router = useRouter()
const loading = ref(false)
const error = ref(false)
const isEmpty = ref(false)
const loadingMessage = ref('加载中...')
const errorMessage = ref('加载失败，请稍后重试')
const emptyIcon = ref('Users')
const emptyTitle = ref('暂无好友')
const emptyDescription = ref('快去添加好友，一起享受农场乐趣吧！')
const showEmptyAction = ref(true)

// 好友数据
const friends = ref<Friend[]>([
  {
    id: 1,
    name: '小明',
    avatar: '/avatar1.jpg',
    level: 15,
    status: 'online',
    intimacy: 850,
    lastVisit: new Date(Date.now() - 1000 * 60 * 30), // 30分钟前
    lastInteraction: new Date(Date.now() - 1000 * 60 * 15), // 15分钟前
    isFriend: true,
    farmPlots: 9,
    totalHarvest: 156,
  },
  {
    id: 2,
    name: '小红',
    avatar: '/avatar2.jpg',
    level: 12,
    status: 'online',
    intimacy: 720,
    lastVisit: new Date(Date.now() - 1000 * 60 * 60), // 1小时前
    lastInteraction: new Date(Date.now() - 1000 * 60 * 45), // 45分钟前
    isFriend: true,
    farmPlots: 6,
    totalHarvest: 89,
  },
  {
    id: 3,
    name: '小刚',
    avatar: '/avatar3.jpg',
    level: 18,
    status: 'away',
    intimacy: 920,
    lastVisit: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2小时前
    lastInteraction: new Date(Date.now() - 1000 * 60 * 60 * 1), // 1小时前
    isFriend: true,
    farmPlots: 9,
    totalHarvest: 234,
  },
  {
    id: 4,
    name: '小美',
    avatar: '/avatar4.jpg',
    level: 14,
    status: 'offline',
    intimacy: 680,
    lastVisit: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3小时前
    lastInteraction: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2小时前
    isFriend: true,
    farmPlots: 4,
    totalHarvest: 67,
  },
  {
    id: 5,
    name: '小华',
    avatar: '/avatar5.jpg',
    level: 10,
    status: 'online',
    intimacy: 450,
    lastVisit: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5小时前
    lastInteraction: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4小时前
    isFriend: true,
    farmPlots: 6,
    totalHarvest: 45,
  },
])

// 用户数据
const userCoins = ref(25800)
const userLevel = ref(12)

// 搜索和筛选状态
const searchQuery = ref('')
const activeTab = ref<'all' | 'online' | 'recent'>('all')
const sortBy = ref<'intimacy-desc' | 'intimacy-asc' | 'level-desc' | 'level-asc' | 'recent'>('intimacy-desc')

// 弹窗状态
const showAddFriendDialog = ref(false)
const showGiftDialog = ref(false)
const showRemoveFriendDialog = ref(false)
const selectedFriend = ref<Friend | null>(null)
const selectedGift = ref<Gift | null>(null)

// 添加好友相关状态
const friendSearchQuery = ref('')
const friendSearchLoading = ref(false)
const friendSearchResults = ref<User[]>([])

// 可用的礼物
const availableGifts = ref<Gift[]>([
  {
    id: 1,
    name: '胡萝卜种子',
    image: '/carrot-seed.png',
    price: 100,
    intimacy: 10,
  },
  {
    id: 2,
    name: '番茄种子',
    image: '/tomato-seed.png',
    price: 150,
    intimacy: 15,
  },
  {
    id: 3,
    name: '玉米种子',
    image: '/corn-seed.png',
    price: 200,
    intimacy: 20,
  },
  {
    id: 4,
    name: '土豆种子',
    image: '/potato-seed.png',
    price: 80,
    intimacy: 8,
  },
  {
    id: 5,
    name: '化肥',
    image: '/fertilizer.png',
    price: 50,
    intimacy: 5,
  },
  {
    id: 6,
    name: '浇水壶',
    image: '/watering-can.png',
    price: 30,
    intimacy: 3,
  },
  {
    id: 7,
    name: '小铲子',
    image: '/small-shovel.png',
    price: 40,
    intimacy: 4,
  },
  {
    id: 8,
    name: '精美花盆',
    image: '/flower-pot.png',
    price: 120,
    intimacy: 12,
  },
])

// 计算属性
const pageTitle = computed(() => '好友农场')
const searchPlaceholder = computed(() => '搜索好友...')
const friendsCount = computed(() => friends.value.length)
const totalIntimacy = computed(() => friends.value.reduce((sum, friend) => sum + friend.intimacy, 0))
const totalGifts = computed(() => friends.value.reduce((sum, friend) => sum + friend.totalHarvest, 0))

const filteredFriends = computed(() => {
  let result = [...friends.value]
  
  // 搜索过滤
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(friend => 
      friend.name.toLowerCase().includes(query)
    )
  }
  
  // 标签过滤
  if (activeTab.value === 'online') {
    result = result.filter(friend => friend.status === 'online')
  } else if (activeTab.value === 'recent') {
    const oneHourAgo = Date.now() - 1000 * 60 * 60
    result = result.filter(friend => friend.lastInteraction.getTime() > oneHourAgo)
  }
  
  // 排序
  result.sort((a, b) => {
    switch (sortBy.value) {
      case 'intimacy-desc':
        return b.intimacy - a.intimacy
      case 'intimacy-asc':
        return a.intimacy - b.intimacy
      case 'level-desc':
        return b.level - a.level
      case 'level-asc':
        return a.level - b.level
      case 'recent':
        return b.lastInteraction.getTime() - a.lastInteraction.getTime()
      default:
        return 0
    }
  })
  
  return result
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

// 事件处理
const handleLogoClick = () => {
  router.push('/')
}

const handleSearch = (query: string) => {
  console.log('搜索:', query)
}

const handleTabChange = (tab: string) => {
  activeTab.value = tab as 'all' | 'online' | 'recent'
}

const handleMobileMenuClick = () => {
  console.log('移动端菜单点击')
}

const handleBack = () => {
  router.back()
}

const handleRetry = () => {
  console.log('重试')
  loadFriendsData()
}

const handleFriendClick = (friend: Friend) => {
  router.push(`/friends/${friend.id}`)
}

const handleAddFriend = () => {
  showAddFriendDialog.value = true
}

const handleVisitAll = () => {
  friends.value.forEach(friend => {
    if (friend.status === 'online') {
      visitFriend(friend)
    }
  })
}

const handleSendGifts = () => {
  // 批量赠送礼物功能
  alert('批量赠送礼物功能开发中...')
}

const handleVisitFriend = (friend: Friend) => {
  visitFriend(friend)
}

const handleSendGift = (friend: Friend) => {
  selectedFriend.value = friend
  selectedGift.value = null
  showGiftDialog.value = true
}

const handleRemoveFriend = (friend: Friend) => {
  selectedFriend.value = friend
  showRemoveFriendDialog.value = true
}

const handleSearchInput = (query: string) => {
  searchQuery.value = query
}

const handleSortChange = (event: Event) => {
  sortBy.value = (event.target as HTMLSelectElement).value as any
}

const handleFriendSearchInput = (query: string) => {
  friendSearchQuery.value = query
}

const handleFriendSearch = () => {
  if (!friendSearchQuery.value.trim()) return
  
  friendSearchLoading.value = true
  
  // 模拟搜索API调用
  setTimeout(() => {
    // 模拟搜索结果
    const mockResults: User[] = [
      {
        id: 101,
        name: '搜索用户1',
        avatar: '/default-avatar.png',
        level: 5,
        status: 'online',
        isFriend: false,
      },
      {
        id: 102,
        name: '搜索用户2',
        avatar: '/default-avatar.png',
        level: 8,
        status: 'offline',
        isFriend: false,
      },
      {
        id: 103,
        name: friendSearchQuery.value,
        avatar: '/default-avatar.png',
        level: 10,
        status: 'online',
        isFriend: false,
      },
    ]
    
    friendSearchResults.value = mockResults
    friendSearchLoading.value = false
  }, 1000)
}

const handleSearchResultClick = (user: User) => {
  if (user.isFriend) {
    // 跳转到好友详情
    const friend = friends.value.find(f => f.id === user.id)
    if (friend) {
      handleFriendClick(friend)
    }
  } else {
    // 添加为好友
    handleAddUserAsFriend(user)
  }
}

const handleAddUserAsFriend = (user: User) => {
  // 模拟添加好友API调用
  setTimeout(() => {
    const newFriend: Friend = {
      id: Date.now(),
      name: user.name,
      avatar: user.avatar,
      level: user.level,
      status: user.status,
      intimacy: 100,
      lastVisit: new Date(),
      lastInteraction: new Date(),
      isFriend: true,
      farmPlots: 0,
      totalHarvest: 0,
    }
    
    friends.value.push(newFriend)
    
    // 更新搜索结果
    const searchResult = friendSearchResults.value.find(u => u.id === user.id)
    if (searchResult) {
      searchResult.isFriend = true
    }
    
    alert(`成功添加${user.name}为好友！`)
  }, 500)
}

const handleGiftSelect = (gift: Gift) => {
  selectedGift.value = gift
}

const handleAddFriendDialogCancel = () => {
  showAddFriendDialog.value = false
  friendSearchQuery.value = ''
  friendSearchResults.value = []
}

const handleGiftDialogCancel = () => {
  showGiftDialog.value = false
  selectedFriend.value = null
  selectedGift.value = null
}

const handleGiftDialogConfirm = () => {
  if (selectedFriend.value && selectedGift.value) {
    sendGift(selectedFriend.value, selectedGift.value)
  }
}

const handleRemoveFriendDialogCancel = () => {
  showRemoveFriendDialog.value = false
  selectedFriend.value = null
}

const handleRemoveFriendDialogConfirm = () => {
  if (selectedFriend.value) {
    removeFriend(selectedFriend.value)
  }
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
  handleAddFriend()
}

// 好友操作方法
const visitFriend = (friend: Friend) => {
  // 更新访问时间
  friend.lastVisit = new Date()
  friend.lastInteraction = new Date()
  
  // 增加亲密度
  friend.intimacy += 5
  
  // 更新好友列表
  const friendIndex = friends.value.findIndex(f => f.id === friend.id)
  if (friendIndex !== -1) {
    friends.value[friendIndex] = { ...friend }
  }
  
  // 跳转到好友农场
  router.push(`/friends/${friend.id}`)
}

const sendGift = (friend: Friend, gift: Gift) => {
  if (userCoins.value < gift.price) {
    alert('金币不足')
    return
  }
  
  userCoins.value -= gift.price
  
  // 更新亲密度
  friend.intimacy += gift.intimacy
  friend.lastInteraction = new Date()
  
  // 更新好友列表
  const friendIndex = friends.value.findIndex(f => f.id === friend.id)
  if (friendIndex !== -1) {
    friends.value[friendIndex] = { ...friend }
  }
  
  alert(`成功赠送${gift.name}给${friend.name}！`)
}

const removeFriend = (friend: Friend) => {
  // 从好友列表中移除
  const friendIndex = friends.value.findIndex(f => f.id === friend.id)
  if (friendIndex !== -1) {
    friends.value.splice(friendIndex, 1)
  }
  
  alert(`已移除好友${friend.name}`)
}

// 模拟数据更新
const updateFriendsData = () => {
  // 模拟好友状态变化
  friends.value.forEach(friend => {
    if (Math.random() > 0.8) {
      // 随机改变状态
      const statuses: Array<'online' | 'offline' | 'away' | 'busy'> = ['online', 'offline', 'away', 'busy']
      friend.status = statuses[Math.floor(Math.random() * statuses.length)]
    }
    
    // 随机增加亲密度（模拟互动）
    if (Math.random() > 0.7) {
      friend.intimacy += Math.floor(Math.random() * 5) + 1
    }
  })
  
  // 更新时间
  const now = new Date()
  friends.value.forEach(friend => {
    if (friend.lastInteraction.getTime() < now.getTime() - 1000 * 60 * 60) {
      // 如果超过1小时没有互动，减少亲密度
      friend.intimacy = Math.max(0, friend.intimacy - 1)
    }
  })
}

// 加载好友数据
const loadFriendsData = () => {
  loading.value = true
  error.value = false
  
  // 模拟API调用
  setTimeout(() => {
    loading.value = false
    // 检查是否有好友
    if (friends.value.length === 0) {
      isEmpty.value = true
    }
  }, 1000)
}

// 生命周期
onMounted(() => {
  loadFriendsData()
  
  // 每30秒更新一次数据
  const dataInterval = setInterval(updateFriendsData, 30000)
  
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
.friends-view {
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
.friends-header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
}

.friends-stats {
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

.friends-actions {
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

/* 搜索和筛选 */
.friends-controls {
  margin-bottom: 24px;
}

.search-section {
  margin-bottom: 16px;
}

.filter-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-tabs {
  display: flex;
  gap: 8px;
}

.filter-tab {
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

.filter-tab.active {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.filter-tab:hover {
  background: #e5e7eb;
  color: #374151;
}

.sort-options {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sort-select {
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  color: #374151;
  font-size: 14px;
  cursor: pointer;
}

/* 好友列表 */
.friends-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.friend-item {
  cursor: pointer;
  transition: all 0.3s ease;
}

.friend-item:hover {
