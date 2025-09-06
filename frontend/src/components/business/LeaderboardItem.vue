<template>
  <div class="leaderboard-item" :class="itemClasses" @click="handleClick">
    <!-- 排名标识 -->
    <div class="rank-section" :class="rankClasses">
      <div v-if="isTopThree" class="rank-crown">
        <Crown :size="crownSize" />
      </div>
      <div class="rank-number">{{ item.rank }}</div>
    </div>

    <!-- 用户信息 -->
    <div class="user-section">
      <Avatar
        :src="item.avatar"
        :alt="item.nickName"
        :size="avatarSize"
        :level="item.level"
        :show-level="showLevel"
        :clickable="false"
        :bordered="true"
        :shadow="true"
      />
      <div class="user-info">
        <div class="user-name">{{ item.nickName }}</div>
        <div class="user-level">Lv.{{ item.level }}</div>
      </div>
    </div>

    <!-- 数值显示 -->
    <div class="value-section">
      <div class="value-label">{{ valueLabel }}</div>
      <div class="value-number">{{ formatValue(item.value) }}</div>
    </div>

    <!-- 变化趋势 -->
    <div v-if="showTrend && item.trend" class="trend-section">
      <component :is="trendIcon" :size="16" :class="trendClasses" />
      <span class="trend-text">{{ trendText }}</span>
    </div>

    <!-- 状态标识 -->
    <div v-if="showStatus && item.status" class="status-section">
      <StatusIndicator :status="item.status" size="xs" :show-text="false" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Crown, TrendingUp, TrendingDown, Minus } from 'lucide-vue-next'
import Avatar from '../common/Avatar.vue'
import StatusIndicator from '../common/StatusIndicator.vue'

interface LeaderboardItemData {
  userId: number
  nickName: string
  avatar?: string
  level: number
  rank: number
  value: string
  trend?: 'up' | 'down' | 'stable'
  status?: 'online' | 'offline' | 'away' | 'busy'
}

interface Props {
  item: LeaderboardItemData
  size?: 'sm' | 'md' | 'lg'
  valueType?: 'wealth' | 'level' | 'steal_count' | 'harvest_count' | 'help_count'
  showLevel?: boolean
  showTrend?: boolean
  showStatus?: boolean
  variant?: 'default' | 'compact' | 'detailed'
  clickable?: boolean
  highlightCurrentUser?: boolean
  currentUserId?: number
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  valueType: 'wealth',
  showLevel: true,
  showTrend: true,
  showStatus: false,
  variant: 'default',
  clickable: true,
  highlightCurrentUser: false,
  currentUserId: 0,
})

const emit = defineEmits<{
  click: [item: LeaderboardItemData]
}>()

// 计算属性
const itemClasses = computed(() => [
  'leaderboard-item',
  `size-${props.size}`,
  `variant-${props.variant}`,
  `type-${props.valueType}`,
  {
    clickable: props.clickable,
    'top-three': isTopThree.value,
    'current-user': isCurrentUser.value,
    highlighted: props.highlightCurrentUser && isCurrentUser.value,
  },
])

const rankClasses = computed(() => [
  'rank-section',
  `rank-${props.item.rank}`,
  `size-${props.size}`,
])

const isTopThree = computed(() => {
  return props.item.rank <= 3
})

const isCurrentUser = computed(() => {
  return props.item.userId === props.currentUserId
})

const crownSize = computed(() => {
  const sizeMap = {
    sm: 16,
    md: 20,
    lg: 24,
  }
  return sizeMap[props.size]
})

const avatarSize = computed(() => {
  const sizeMap = {
    sm: 'sm' as const,
    md: 'md' as const,
    lg: 'lg' as const,
  }
  return sizeMap[props.size]
})

const valueLabel = computed(() => {
  const labelMap = {
    wealth: '金币',
    level: '等级',
    steal_count: '偷菜',
    harvest_count: '收获',
    help_count: '助人',
  }
  return labelMap[props.valueType]
})

const trendIcon = computed(() => {
  if (!props.item.trend) return Minus
  const iconMap = {
    up: TrendingUp,
    down: TrendingDown,
    stable: Minus,
  }
  return iconMap[props.item.trend]
})

const trendClasses = computed(() => {
  if (!props.item.trend) return ''
  const classMap = {
    up: 'trend-up',
    down: 'trend-down',
    stable: 'trend-stable',
  }
  return classMap[props.item.trend]
})

const trendText = computed(() => {
  if (!props.item.trend) return '持平'
  const textMap = {
    up: '上升',
    down: '下降',
    stable: '持平',
  }
  return textMap[props.item.trend]
})

// 方法
const formatValue = (value: string) => {
  const num = parseInt(value)
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num.toLocaleString()
}

const handleClick = () => {
  if (props.clickable) {
    emit('click', props.item)
  }
}
</script>

<style scoped>
.leaderboard-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.leaderboard-item.clickable {
  cursor: pointer;
}

.leaderboard-item.clickable:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.leaderboard-item.current-user {
  border-color: rgba(102, 126, 234, 0.5);
  background: rgba(102, 126, 234, 0.05);
}

.leaderboard-item.highlighted {
  border-color: rgba(245, 158, 11, 0.5);
  background: rgba(245, 158, 11, 0.05);
}

/* 类型样式 */
.leaderboard-item.type-wealth {
  border-left: 4px solid #ffd700;
}

.leaderboard-item.type-level {
  border-left: 4px solid #667eea;
}

.leaderboard-item.type-steal_count {
  border-left: 4px solid #ef4444;
}

.leaderboard-item.type-harvest_count {
  border-left: 4px solid #10b981;
}

.leaderboard-item.type-help_count {
  border-left: 4px solid #f59e0b;
}

/* 尺寸变体 */
.leaderboard-item.size-sm {
  padding: 8px 12px;
  gap: 8px;
}

.leaderboard-item.size-lg {
  padding: 16px 20px;
  gap: 16px;
}

/* 样式变体 */
.leaderboard-item.variant.compact {
  padding: 6px 8px;
  gap: 8px;
}

.leaderboard-item.variant.detailed {
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
}

/* 排名区域 */
.rank-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.rank-section.rank-1 {
  color: #ffd700;
}

.rank-section.rank-2 {
  color: #c0c0c0;
}

.rank-section.rank-3 {
  color: #cd7f32;
}

.rank-crown {
  color: inherit;
}

.rank-number {
  font-size: 18px;
  font-weight: bold;
  line-height: 1;
}

.leaderboard-item.size-sm .rank-number {
  font-size: 14px;
}

.leaderboard-item.size-lg .rank-number {
  font-size: 24px;
}

/* 用户区域 */
.user-section {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-level {
  font-size: 11px;
  color: #667eea;
  font-weight: 500;
}

.leaderboard-item.size-sm .user-name {
  font-size: 12px;
}

.leaderboard-item.size-lg .user-name {
  font-size: 16px;
}

.leaderboard-item.size-sm .user-level {
  font-size: 10px;
}

.leaderboard-item.size-lg .user-level {
  font-size: 12px;
}

/* 数值区域 */
.value-section {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  flex-shrink: 0;
  min-width: 80px;
}

.value-label {
  font-size: 11px;
  color: #666;
  font-weight: 500;
}

.value-number {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.leaderboard-item.type-wealth .value-number {
  color: #ffd700;
}

.leaderboard-item.type-level .value-number {
  color: #667eea;
}

.leaderboard-item.type-steal_count .value-number {
  color: #ef4444;
}

.leaderboard-item.type-harvest_count .value-number {
  color: #10b981;
}

.leaderboard-item.type-help_count .value-number {
  color: #f59e0b;
}

.leaderboard-item.size-sm .value-number {
  font-size: 14px;
}

.leaderboard-item.size-lg .value-number {
  font-size: 18px;
}

/* 趋势区域 */
.trend-section {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.trend-up {
  color: #10b981;
}

.trend-down {
  color: #ef4444;
}

.trend-stable {
  color: #6b7280;
}

.trend-text {
  font-size: 11px;
  font-weight: 500;
}

/* 状态区域 */
.status-section {
  position: absolute;
  top: 8px;
  right: 8px;
}

/* 前三名特殊样式 */
.leaderboard-item.top-three {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.05), rgba(255, 215, 0, 0.02));
  border-color: rgba(255, 215, 0, 0.3);
}

.leaderboard-item.top-three.rank-1 {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 215, 0, 0.05));
  border-color: rgba(255, 215, 0, 0.5);
}

.leaderboard-item.top-three.rank-2 {
  background: linear-gradient(135deg, rgba(192, 192, 192, 0.1), rgba(192, 192, 192, 0.05));
  border-color: rgba(192, 192, 192, 0.5);
}

.leaderboard-item.top-three.rank-3 {
  background: linear-gradient(135deg, rgba(205, 127, 50, 0.1), rgba(205, 127, 50, 0.05));
  border-color: rgba(205, 127, 50, 0.5);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .leaderboard-item {
    padding: 8px 12px;
    gap: 8px;
  }

  .leaderboard-item.size-sm {
    padding: 6px 8px;
    gap: 6px;
  }

  .leaderboard-item.size-lg {
    padding: 12px 16px;
    gap: 12px;
  }

  .rank-number {
    font-size: 14px;
  }

  .leaderboard-item.size-sm .rank-number {
    font-size: 12px;
  }

  .leaderboard-item.size-lg .rank-number {
    font-size: 18px;
  }

  .user-name {
    font-size: 12px;
  }

  .leaderboard-item.size-sm .user-name {
    font-size: 11px;
  }

  .leaderboard-item.size-lg .user-name {
    font-size: 14px;
  }

  .value-section {
    min-width: 60px;
  }

  .value-number {
    font-size: 14px;
  }

  .leaderboard-item.size-sm .value-number {
    font-size: 12px;
  }

  .leaderboard-item.size-lg .value-number {
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .leaderboard-item {
    flex-direction: column;
    text-align: center;
    gap: 8px;
    padding: 12px 8px;
  }

  .leaderboard-item.size-sm {
    padding: 8px 6px;
    gap: 6px;
  }

  .leaderboard-item.size-lg {
    padding: 16px 12px;
    gap: 12px;
  }

  .leaderboard-item.variant.compact {
    flex-direction: row;
    text-align: left;
  }

  .leaderboard-item.variant.detailed {
    flex-direction: column;
    text-align: center;
  }

  .user-section {
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .user-info {
    align-items: center;
    gap: 2px;
  }

  .value-section {
    align-items: center;
    min-width: auto;
    width: 100%;
  }

  .rank-section {
    flex-direction: row;
    gap: 8px;
  }

  .trend-section {
    justify-content: center;
    width: 100%;
  }
}

/* 深色主题支持 */
@media (prefers-color-scheme: dark) {
  .leaderboard-item {
    background: rgba(31, 41, 55, 0.95);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .leaderboard-item.current-user {
    border-color: rgba(102, 126, 234, 0.7);
    background: rgba(102, 126, 234, 0.1);
  }

  .leaderboard-item.highlighted {
    border-color: rgba(245, 158, 11, 0.7);
    background: rgba(245, 158, 11, 0.1);
  }

  .user-name {
    color: #f9fafb;
  }

  .user-level {
    color: #818cf8;
  }

  .value-label {
    color: #9ca3af;
  }

  .value-number {
    color: #f9fafb;
  }

  .leaderboard-item.type-wealth .value-number {
    color: #fbbf24;
  }

  .leaderboard-item.type-level .value-number {
    color: #818cf8;
  }

  .leaderboard-item.type-steal_count .value-number {
    color: #f87171;
  }

  .leaderboard-item.type-harvest_count .value-number {
    color: #34d399;
  }

  .leaderboard-item.type-help_count .value-number {
    color: #fbbf24;
  }

  .trend-text {
    color: #9ca3af;
  }
}
</style>
