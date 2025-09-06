<template>
  <div class="leaderboard-view">
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
          <div class="leaderboard-header-actions">
            <div class="leaderboard-stats">
              <div class="stat-item">
                <Trophy :size="20" />
                <span>我的排名 {{ userRank }}</span>
              </div>
              <div class="stat-item">
                <Coins :size="20} />
                <span>{{ formatCoins(userCoins) }}</span>
              </div>
              <div class="stat-item">
                <TrendingUp :size="20} />
                <span>等级 {{ userLevel }}</span>
              </div>
            </div>
            <div class="leaderboard-actions">
              <button class="action-btn primary" @click="handleRefresh">
                <RefreshCw :size="16} />
                <span>刷新排名</span>
              </button>
              <button class="action-btn secondary" @click="handleViewRewards">
                <Gift :size="16} />
                <span>查看奖励</span>
              </button>
              <button class="action-btn tertiary" @click="handleShare">
                <Share2 :size="16} />
                <span>分享成就</span>
              </button>
            </div>
          </div>
        </template>

        <!-- 排行榜类型选择 -->
        <div class="leaderboard-tabs">
          <div class="tabs-scroll">
            <button
              class="tab-btn"
              :class="{ active: activeTab === 'wealth' }"
              @click="handleTabChange('wealth')"
            >
              <Coins :size="20} />
              <span>财富榜</span>
            </button>
            <button
              class="tab-btn"
              :class="{ active: activeTab === 'level' }"
              @click="handleTabChange('level')"
            >
              <Star :size="20} />
              <span>等级榜</span>
            </button>
            <button
              class="tab-btn"
              :class="{ active: activeTab === 'harvest' }"
              @click="handleTabChange('harvest')"
            >
              <Wheat :size="20} />
              <span>收获榜</span>
            </button>
            <button
              class="tab-btn"
              :class="{ active: activeTab === 'friends' }"
              @click="handleTabChange('friends')"
            >
              <Users :size="20} />
              <span>好友榜</span>
            </button>
          </div>
        </div>

        <!-- 排行榜内容 -->
        <div class="leaderboard-content">
          <!-- 前三名特殊展示 -->
          <div class="top-three">
            <div class="top-three-header">
              <h2 class="section-title">
                <Crown :size="24} />
                <span>排行榜前三名</span>
              </h2>
              <div class="update-time">
                <Clock :size="16} />
                <span>{{ formatTime(lastUpdateTime) }}更新</span>
              </div>
            </div>
            
            <div class="top-three-grid">
              <div
                v-for="(user, index) in topThreeUsers"
                :key="user.id"
                class="top-three-item"
                :class="getTopThreeClass(index)"
                @click="handleUserClick(user)"
              >
                <div class="rank-badge">{{ getRankBadge(index) }}</div>
                <div class="user-avatar">
                  <Avatar
                    :src="user.avatar"
                    :alt="user.name"
                    :level="user.level"
                    :show-level="true"
                    :size="lg"
                  />
                </div>
                <div class="user-info">
                  <div class="user-name">{{ user.name }}</div>
                  <div class="user-stats">
                    <div class="user-stat">
                      <span class="stat-label">排名:</span>
                      <span class="stat-value">#{{ index + 1 }}</span>
                    </div>
                    <div class="user-stat">
                      <span class="stat-label">{{ getStatLabel(activeTab) }}:</span>
                      <span class="stat-value">{{ formatStatValue(user, activeTab) }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="crown-decoration" v-if="index === 0">
                <Crown :size="48} />
              </div>
            </div>
          </div>

          <!-- 其他排名 -->
          <div class="other-ranks">
            <div class="section-header">
              <h3 class="section-title">其他排名</h3>
              <div class="rank-range">4-20名</div>
            </div>
            
            <div class="other-ranks-grid">
              <div
                v-for="user in otherRankUsers"
                :key="user.id"
                class="rank-item"
                @click="handleUserClick(user)"
              >
                <div class="rank-number">{{ user.rank }}</div>
                <Avatar
                  :src="user.avatar"
                  :alt="user.name"
                  :level="user.level"
                  :show-level="true"
                  :size="md"
                />
                <div class="user-info">
                  <div class="user-name">{{ user.name }}</div>
                  <div class="user-stat">
                    <span class="stat-value">{{ formatStatValue(user, activeTab) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 排行榜说明 -->
          <div class="leaderboard-info">
            <div class="info-card">
              <h3 class="info-title">
                <Info :size="20} />
                <span>排行榜说明</span>
              </h3>
              <div class="info-content">
                <p class="info-text">
                  排行榜根据不同维度进行排名，每小时更新一次。财富榜按照总金币数量排名，等级榜按照用户等级排名，收获榜按照总收获数量排名，好友榜按照好友数量排名。
                </p>
                <div class="info-rules">
                  <div class="rule-item">
                    <span class="rule-number">1.</span>
                    <span class="rule-text">排名实时更新，反映最新数据</span>
                  </div>
                  <div class="rule-item">
                    <span class="rule-number">2.</span>
                    <span class="rule-text">相同数值的用户，按照达到时间先后排名</span>
                  </div>
                  <div class="rule-item">
                    <span class="rule-number">3.</span>
                    <span class="rule-text">排行榜数据每日0点重置</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态操作 -->
        <template v-if="showEmptyAction" #empty-action>
          <button class="empty-action-btn" @click="handleRefresh">
            <RefreshCw :size="16} />
            <span>刷新排行榜</span>
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
      <div class="mobile-leaderboard-content">
        <!-- 排行榜统计 -->
        <div class="mobile-leaderboard-stats">
          <div class="stats-grid">
            <div class="stat-card">
              <Trophy :size="20} />
              <div>
                <div class="stat-value">#{{ userRank }}</div>
                <div class="stat-label">我的排名</div>
              </div>
            </div>
            <div class="stat-card">
              <Coins :size="20} />
              <div>
                <div class="stat-value">{{ formatCoins(userCoins) }}</div>
                <div class="stat-label">金币</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 排行榜类型选择 -->
        <div class="mobile-leaderboard-tabs">
          <div class="tabs-scroll">
            <button
              class="tab-btn"
              :class="{ active: activeTab === 'wealth' }"
              @click="handleTabChange('wealth')"
            >
              <Coins :size="20} />
              <span>财富</span>
            </button>
            <button
              class="tab-btn"
              :class="{ active: activeTab === 'level' }"
              @click="handleTabChange('level')"
            >
              <Star :size="20} />
              <span>等级</span>
            </button>
            <button
              class="tab-btn"
              :class="{ active: activeTab === 'harvest' }"
              @click="handleTabChange('harvest')"
            >
              <Wheat :size="20} />
              <span>收获</span>
            </button>
            <button
              class="tab-btn"
              :class="{ active: activeTab === 'friends' }"
              @click="handleTabChange('friends')"
            >
              <Users :size="20} />
              <span>好友</span>
            </button>
          </div>
        </div>

        <!-- 前三名特殊展示 -->
        <div class="mobile-top-three">
          <div class="top-three-header">
            <h3 class="section-title">
              <Crown :size="16} />
              <span>前三名</span>
            </h3>
          </div>
          
          <div class="top-three-grid">
            <div
              v-for="(user, index) in topThreeUsers"
              :key="user.id"
              class="top-three-item"
              :class="getTopThreeClass(index)"
              @click="handleUserClick(user)"
            >
              <div class="rank-badge">{{ getRankBadge(index) }}</div>
              <div class="user-avatar">
                <Avatar
                  :src="user.avatar"
                  :alt="user.name"
                  :level="user.level"
                  :show-level="true"
                  :size="md"
                />
              </div>
              <div class="user-info">
                <div class="user-name">{{ user.name }}</div>
                <div class="user-stat">
                  <span class="stat-value">{{ formatStatValue(user, activeTab) }}</span>
                </div>
              </div>
              <div class="crown-decoration" v-if="index === 0">
                <Crown :size="32} />
              </div>
            </div>
          </div>
        </div>

        <!-- 其他排名 -->
        <div class="mobile-other-ranks">
          <div class="section-header">
            <h3 class="section-title">其他排名</h3>
            <div class="rank-range">4-20名</div>
          </div>
          
          <div class="other-ranks-list">
            <div
              v-for="user in otherRankUsers"
              :key="user.id"
              class="rank-item"
              @click="handleUserClick(user)"
            >
              <div class="rank-number">{{ user.rank }}</div>
              <Avatar
                :src="user.avatar"
                :alt="user.name"
                :level="user.level"
                :show-level="true"
                :size="sm"
              />
              <div class="user-info">
                <div class="user-name">{{ user.name }}</div>
                <div class="user-stat">
                  <span class="stat-value">{{ formatStatValue(user, activeTab) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 排行榜说明 -->
        <div class="mobile-leaderboard-info">
          <div class="info-card">
            <h4 class="info-title">
              <Info :size="16} />
              <span>排行榜说明</span>
            </h4>
            <div class="info-content">
              <p class="info-text">
                排行榜根据不同维度进行排名，每小时更新一次。
              </p>
            </div>
          </div>
        </div>

        <!-- 移动端操作栏 -->
        <template #mobile-actions>
          <div class="mobile-actions-bar">
            <button class="mobile-action-btn" @click="handleRefresh">
              <RefreshCw :size="20} />
              <span>刷新</span>
            </button>
            <button class="mobile-action-btn" @click="handleViewRewards">
              <Gift :size="20} />
              <span>奖励</span>
            </button>
            <button class="mobile-action-btn" @click="handleShare">
              <Share2 :size="20} />
              <span>分享</span>
            </button>
          </div>
        </template>
      </div>
    </MobileLayout>

    <!-- 用户详情弹窗 -->
    <ModalDialog
      v-if="showUserDetail"
      :visible="showUserDetail"
      :title="`${selectedUser?.name || ''} 的详情`"
      :icon="User"
      :show-cancel="true"
      :show-confirm="false"
      cancel-text="关闭"
      @cancel="handleUserDetailClose"
    >
      <div class="user-detail-content">
        <div class="user-header">
          <Avatar
            :src="selectedUser?.avatar"
            :alt="selectedUser?.name"
            :level="selectedUser?.level"
            :show-level="true"
            :size="lg"
          />
          <div class="user-info">
            <h3 class="user-name">{{ selectedUser?.name }}</h3>
            <div class="user-rank">
              <span class="rank-label">当前排名:</span>
              <span class="rank-value">#{{ selectedUser?.rank }}</span>
            </div>
          </div>
        </div>
        
        <div class="user-stats">
          <div class="stats-grid">
            <div class="stat-card">
              <Coins :size="20} />
              <div>
                <div class="stat-value">{{ formatCoins(selectedUser?.coins || 0) }}</div>
                <div class="stat-label">总金币</div>
              </div>
            </div>
            <div class="stat-card">
              <Star :size="20} />
              <div>
                <div class="stat-value">{{ selectedUser?.level || 0 }}</div>
                <div class="stat-label">等级</div>
              </div>
            </div>
            <div class="stat-card">
              <Wheat :size="20} />
              <div>
                <div class="stat-value">{{ selectedUser?.totalHarvest || 0 }}</div>
                <div class="stat-label">总收获</div>
              </div>
            </div>
            <div class="stat-card">
              <Users :size="20} />
              <div>
                <div class="stat-value">{{ selectedUser?.friendsCount || 0 }}</div>
                <div class="stat-label">好友数</div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="user-rankings">
          <h4 class="section-title">各项排名</h4>
          <div class="rankings-list">
            <div class="ranking-item">
              <span class="ranking-label">财富榜:</span>
              <span class="ranking-value">#{{ selectedUser?.wealthRank || 'N/A' }}</span>
            </div>
            <div class="ranking-item">
              <span class="ranking-label">等级榜:</span>
              <span class="ranking-value">#{{ selectedUser?.levelRank || 'N/A' }}</span>
            </div>
            <div class="ranking-item">
              <span class="ranking-label">收获榜:</span>
              <span class="ranking-value">#{{ selectedUser?.harvestRank || 'N/A' }}</span>
            </div>
            <div class="ranking-item">
              <span class="ranking-label">好友榜:</span>
              <span class="ranking-value">#{{ selectedUser?.friendsRank || 'N/A' }}</span>
            </div>
          </div>
        </div>
        
        <div class="user-actions">
          <button class="action-btn" @click="handleVisitUser">
            <Home :size="16} />
            <span>访问农场</span>
          </button>
          <button class="action-btn" @click="handleSendGift">
            <Gift :size="16} />
            <span>赠送礼物</span>
          </button>
          <button class="action-btn" @click="handleAddFriend">
            <UserPlus :size="16} />
            <span>添加好友</span>
          </button>
        </div>
      </div>
    </ModalDialog>

    <!-- 排行榜奖励弹窗 -->
    <ModalDialog
      v-if="showRewards"
      :visible="showRewards"
      title="排行榜奖励"
      icon="Gift"
      :show-cancel="true"
      :show-confirm="false"
      cancel-text="关闭"
      @cancel="handleRewardsClose"
    >
      <div class="rewards-content">
        <div class="rewards-header">
          <h3 class="rewards-title">恭喜获得排行榜奖励！</h3>
          <p class="rewards-subtitle">根据您的排名，您已获得以下奖励</p>
        </div>
        
        <div class="rewards-list">
          <div class="reward-item">
            <div class="reward-icon">
              <Coins :size="24} />
            </div>
            <div class="reward-info">
              <div class="reward-name">金币奖励</div>
              <div class="reward-amount">+{{ formatCoins(getRewardCoins()) }}</div>
            </div>
          </div>
          
          <div class="reward-item">
            <div class="reward-icon">
              <Star :size="24} />
            </div>
            <div class="reward-info">
              <div class="reward-name">经验值</div>
              <div class="reward-amount">+{{ getRewardExp() }} EXP</div>
            </div>
          </div>
          
          <div class="reward-item">
            <div class="reward-icon">
              <Gift :size="24} />
            </div>
            <div class="reward-info">
              <div class="reward-name">特殊称号</div>
              <div class="reward-name">{{ getRewardTitle() }}</div>
            </div>
          </div>
        </div>
        
        <div class="rewards-actions">
          <button class="claim-btn" @click="handleClaimRewards">
            <Gift :size="16} />
            <span>领取奖励</span>
          </button>
        </div>
      </div>
    </ModalDialog>

    <!-- 分享成就弹窗 -->
    <ModalDialog
      v-if="showShare"
      :visible="showShare"
      title="分享成就"
      icon="Share2"
      :show-cancel="true"
      :show-confirm="false"
      cancel-text="关闭"
      @cancel="handleShareClose"
    >
      <div class="share-content">
        <div class="share-header">
          <h3 class="share-title">分享您的排行榜成就</h3>
          <p class="share-subtitle">让好友们看到您的优秀成绩！</p>
        </div>
        
        <div class="share-options">
          <div class="share-option" @click="handleShareToWeChat">
            <MessageCircle :size="24} />
            <span>分享到微信</span>
          </div>
          <div class="share-option" @click="handleShareToQQ">
            <MessageSquare :size="24} />
            <span>分享到QQ</span>
          </div>
          <div class="share-option" @click="handleCopyLink">
            <Link2 :size="24} />
            <span>复制链接</span>
          </div>
        </div>
        
        <div class="share-preview">
          <div class="preview-card">
            <div class="preview-header">
              <Trophy :size="20} />
              <span>QQ农场排行榜</span>
            </div>
            <div class="preview-content">
              <div class="preview-user">
                <Avatar
                  :src="userAvatar"
                  :alt="userName"
                  :level="userLevel"
                  :show-level="true"
                  :size="md"
                />
                <div class="preview-info">
                  <div class="preview-name">{{ userName }}</div>
                  <div class="preview-rank">排名第{{ userRank }}名</div>
                </div>
              </div>
              <div class="preview-stats">
                <div class="preview-stat">
                  <span class="stat-label">{{ getStatLabel(activeTab) }}:</span>
                  <span class="stat-value">{{ formatStatValue(currentUser, activeTab) }}</span>
                </div>
              </div>
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
  Trophy,
  Coins,
  Star,
  Wheat,
  Users,
  Crown,
  RefreshCw,
  Gift,
  TrendingUp,
  Clock,
  Info,
  Home,
  UserPlus,
  Share2,
  MessageCircle,
  MessageSquare,
  Link2,
} from 'lucide-vue-next'
import AppHeader from '../layouts/AppHeader.vue'
import AppMain from '../layouts/AppMain.vue'
import AppFooter from '../layouts/AppFooter.vue'
import MobileLayout from '../layouts/MobileLayout.vue'
import Avatar from '../components/common/Avatar.vue'
import ModalDialog from '../components/common/ModalDialog.vue'

interface User {
  id: number
  name: string
  avatar: string
  level: number
  coins: number
  totalHarvest: number
  friendsCount: number
  wealthRank: number
  levelRank: number
  harvestRank: number
  friendsRank: number
  rank: number
}

// 响应式状态
const router = useRouter()
const loading = ref(false)
const error = ref(false)
const isEmpty = ref(false)
const loadingMessage = ref('加载中...')
const errorMessage = ref('加载失败，请稍后重试')
const emptyIcon = ref('Trophy')
const emptyTitle = ref('排行榜暂时为空')
const emptyDescription = ref('请稍后再来查看排行榜')
const showEmptyAction = ref(true)

// 用户数据
const userCoins = ref(25800)
const userLevel = ref(12)
const userRank = ref(12)
const userAvatar = ref('/default-avatar.png')
const userName = ref('QQ用户')
const currentUser = ref<User | null>(null)

// 排行榜数据
const users = ref<User[]>([
  {
    id: 1,
    name: '农场达人',
    avatar: '/leader1.jpg',
    level: 25,
    coins: 50000,
    totalHarvest: 289,
    friendsCount: 45,
    wealthRank: 1,
    levelRank: 1,
    harvestRank: 1,
    friendsRank: 1,
    rank: 1,
  },
  {
    id: 2,
    name: '种植高手',
    avatar: '/leader2.jpg',
    level: 23,
    coins: 45000,
    totalHarvest: 276,
    friendsCount: 38,
    wealthRank: 2,
    levelRank: 2,
    harvestRank: 2,
    friendsRank: 2,
    rank: 2,
  },
  {
    id: 3,
    name: 'QQ用户',
    avatar: '/default-avatar.png',
    level: 12,
    coins: 25800,
    totalHarvest: 156,
    friendsCount: 5,
    wealthRank: 12,
    levelRank: 12,
    harvestRank: 12,
    friendsRank: 12,
    rank: 3,
  },
  {
    id: 4,
    name: '新手玩家',
    avatar: '/leader4.jpg',
    level: 8,
    coins: 8000,
    totalHarvest: 45,
    friendsCount: 12,
    wealthRank: 20,
    levelRank: 20,
    harvestRank: 20,
    friendsRank: 20,
    rank: 4,
  },
  {
    id: 5,
    name: '勤劳农夫',
    avatar: '/leader5.jpg',
    level: 18,
    coins: 35000,
    totalHarvest: 234,
    friendsCount: 28,
    wealthRank: 3,
    levelRank: 3,
    harvestRank: 3,
    friendsRank: 3,
    rank: 5,
  },
  {
    id: 6,
    name: '农场主',
    avatar: '/leader6.jpg',
    level: 20,
    coins: 32000,
    totalHarvest: 198,
    friendsCount: 22,
    wealthRank: 4,
    levelRank: 4,
    harvestRank: 4,
    friendsRank: 4,
    rank: 6,
  },
  {
    id: 7,
    name: '收获达人',
    avatar: '/leader7.jpg',
    level: 15,
    coins: 28000,
    totalHarvest: 345,
    friendsCount: 35,
    wealthRank: 5,
    levelRank: 5,
    harvestRank: 5,
    friendsRank: 5,
    rank: 7,
  },
  {
    id: 8,
    name: '社交达人',
    avatar: '/leader8.jpg',
    level: 16,
    coins: 22000,
    totalHarvest: 167,
    friendsCount: 89,
    wealthRank: 6,
    levelRank: 6,
    harvestRank: 6,
    friendsRank: 6,
    rank: 8,
  },
  {
    id: 9,
    name: '富有的农场主',
    avatar: '/leader9.jpg',
    level: 14,
    coins: 18000,
    totalHarvest: 123,
    friendsCount: 15,
    wealthRank: 7,
    levelRank: 7,
    harvestRank: 7,
    friendsRank: 7,
    rank: 9,
  },
  {
    id: 10,
    name: '新手农场主',
    avatar: '/leader10.jpg',
    level: 10,
    coins: 12000,
    totalHarvest: 67,
    friendsCount: 8,
    wealthRank: 8,
    levelRank: 8,
    harvestRank: 8,
    friendsRank: 8,
    rank: 10,
  },
  {
    id: 11,
    name: '经验丰富的玩家',
    avatar: '/leader11.jpg',
    level: 22,
    coins: 25000,
    totalHarvest: 289,
    friendsCount: 42,
    wealthRank: 11,
    levelRank: 11,
    harvestRank: 11,
    friendsRank: 11,
    rank: 11,
  },
  {
    id: 12,
    name: '高等级玩家',
    avatar: '/leader12.jpg',
    level: 21,
    coins: 24000,
    totalHarvest: 276,
    friendsCount: 39,
    wealthRank: 12,
    levelRank: 12,
    harvestRank: 12,
    friendsRank: 12,
    rank: 12,
  },
  {
    id: 13,
    name: '活跃玩家',
    avatar: '/leader13.jpg',
    level: 19,
    coins: 21000,
    totalHarvest: 234,
    friendsCount: 67,
    wealthRank: 13,
    levelRank: 13,
    harvestRank: 13,
    friendsRank: 13,
    rank: 13,
  },
  {
    id: 14,
    name: '农场爱好者',
    avatar: '/leader14.jpg',
    level: 17,
    coins: 19000,
    totalHarvest: 198,
    friendsCount: 89,
    wealthRank: 14,
    levelRank: 14,
    harvestRank: 14,
    friendsRank: 14,
    rank: 14,
  },
  {
    id: 15,
    name: '中等玩家',
    avatar: '/leader15.jpg',
    level: 13,
    coins: 15000,
    totalHarvest: 156,
    friendsCount: 23,
    wealthRank: 15,
    levelRank: 15,
    harvestRank: 15,
    friendsRank: 15,
    rank: 15,
  },
  {
    id: 16,
    name: '初级玩家',
    avatar: '/leader16.jpg',
    level: 9,
    coins: 8000,
    totalHarvest: 67,
    friendsCount: 12,
    wealthRank: 16,
    levelRank: 16,
    harvestRank: 16,
    friendsRank: 16,
    rank: 16,
  },
  {
    id: 17,
    name: '新手玩家',
    avatar: '/leader17.jpg',
    level: 6,
    coins: 5000,
    totalHarvest: 34,
    friendsCount: 5,
    wealthRank: 17,
    levelRank: 17,
    harvestRank: 17,
    friendsRank: 17,
    rank: 17,
  },
  {
    id: 18,
    name: '经验丰富的老玩家',
    avatar: '/leader18.jpg',
    level: 24,
    coins: 30000,
    totalHarvest: 445,
    friendsCount: 56,
    wealthRank: 18,
    levelRank: 18,
    harvestRank: 18,
    friendsRank: 18,
    rank: 18,
  },
  {
    id: 19,
    name: '高等级玩家',
    avatar: '/leader19.jpg',
    level: 23,
    coins: 28000,
    totalHarvest: 389,
    friendsCount: 78,
    wealthRank: 19,
    levelRank: 19,
    harvestRank: 19,
    friendsRank: 19,
    rank: 19,
  },
  {
    id: 20,
    name: '社交达人',
    avatar: '/leader20.jpg',
    level: 20,
    coins: 22000,
    totalHarvest: 267,
    friendsCount: 156,
    wealthRank: 20,
    levelRank: 20,
    harvestRank: 20,
    friendsRank: 20,
    rank: 20,
  },
])

// 排行榜状态
const activeTab = ref<'wealth' | 'level' | 'harvest' | 'friends'>('wealth')
const lastUpdateTime = ref(new Date())

// 弹窗状态
const showUserDetail = ref(false)
const showRewards = ref(false)
const showShare = ref(false)
const selectedUser = ref<User | null>(null)

// 计算属性
const pageTitle = computed(() => '排行榜')
const topThreeUsers = computed(() => users.value.slice(0, 3))
const otherRankUsers = computed(() => users.value.slice(3, 20))

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

const getTopThreeClass = (index: number) => [
  'top-three-item',
  `rank-${index + 1}`,
]

const getRankBadge = (index: number) => {
  const badges = ['🥇', '🥈', '🥉']
  return badges[index]
}

const getStatLabel = (tab: string) => {
  const labels = {
    wealth: '总金币',
    level: '等级',
    harvest: '总收获',
    friends: '好友数',
  }
  return labels[tab]
}

const formatStatValue = (user: User, tab: string) => {
  const values = {
    wealth: user.coins,
    level: user.level,
    harvest: user.totalHarvest,
    friends: user.friendsCount,
  }
  return formatCoins(values[tab])
}

const getRewardCoins = () => {
  const rank = currentUser.value?.rank || 20
  if (rank <= 3) {
    return 5000 // 前三名奖励
  } else if (rank <= 10) {
    return 2000 // 前10名奖励
  } else if (rank <= 20) {
    return 1000 // 前20名奖励
  }
  return 500 // 参与奖励
}

const getRewardExp = () => {
  const rank = currentUser.value?.rank || 20
  if (rank <= 3) {
    return 500 // 前三名经验
  } else if (rank <= 10) {
    return 200 // 前10名经验
  } else if (rank <= 20) {
    return 100 // 前20名经验
  }
  return 50 // 参与经验
}

const getRewardTitle = () => {
  const rank = currentUser.value?.rank || 20
  if (rank === 1) {
    return '农场之王'
  } else if (rank === 2) {
    return '农场精英'
  } else if (rank === 3) {
    return '农场达人'
  } else if (rank <= 10) {
    return '排行榜高手'
  } else if (rank <= 20) {
    return '优秀农场主'
  }
  return '农场爱好者'
}

// 事件处理
const handleLogoClick = () => {
  router.push('/')
}

const handleSearch = (query: string) => {
  console.log('搜索:', query)
}

const handleTabChange = (tab: string) => {
  activeTab.value = tab as 'wealth' | '
