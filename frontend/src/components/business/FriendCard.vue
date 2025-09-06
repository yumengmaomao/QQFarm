<template>
  <div class="friend-card" :class="cardClasses" @click="handleClick">
    <!-- 头像区域 -->
    <div class="friend-avatar-section">
      <Avatar
        :src="friend.avatar"
        :alt="friend.nickName"
        :size="avatarSize"
        :level="friend.level"
        :show-level="showLevel"
        :status="friend.isOnline ? 'online' : 'offline'"
        :show-status="showStatus"
        :clickable="false"
        :bordered="true"
        :shadow="true"
      />
    </div>

    <!-- 信息区域 -->
    <div class="friend-info">
      <div class="friend-name">{{ friend.nickName }}</div>
      <div v-if="showStats" class="friend-stats">
        <div class="stat-item">
          <Wheat :size="14" />
          <span>{{ friend.harvestCount || 0 }}</span>
        </div>
        <div v-if="friend.rank !== undefined" class="stat-item">
          <Crown :size="14" />
          <span>第{{ friend.rank }}名</span>
        </div>
      </div>
      <div v-if="showStatus" class="friend-status-text">
        <StatusIndicator
          :status="friend.isOnline ? 'online' : 'offline'"
          :show-text="true"
          size="xs"
        />
      </div>
    </div>

    <!-- 操作区域 -->
    <div class="friend-actions">
      <button
        class="action-btn visit"
        @click.stop="handleVisit"
        :disabled="!friend.isOnline"
        v-tooltip="'访问农场'"
      >
        <Sprout :size="16" />
      </button>
      <button
        v-if="showHelpButton"
        class="action-btn help"
        @click.stop="handleHelp"
        :disabled="!friend.isOnline || !friend.needsHelp"
        v-tooltip="'帮助好友'"
      >
        <Heart :size="16" />
      </button>
      <button
        v-if="showStealButton"
        class="action-btn steal"
        @click.stop="handleSteal"
        :disabled="!friend.isOnline || !friend.canSteal"
        v-tooltip="'偷菜'"
      >
        <Zap :size="16" />
      </button>
    </div>

    <!-- 徽章/状态标识 -->
    <div v-if="friend.badge" class="friend-badge">
      {{ friend.badge }}
    </div>

    <!-- 在线状态脉冲效果 -->
    <div v-if="friend.isOnline && showPulse" class="online-pulse"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Wheat, Crown, Sprout, Heart, Zap } from 'lucide-vue-next'
import Avatar from '../common/Avatar.vue'
import StatusIndicator from '../common/StatusIndicator.vue'

interface FriendData {
  userId: number
  nickName: string
  avatar?: string
  level: number
  isOnline: boolean
  harvestCount?: number
  rank?: number
  needsHelp?: boolean
  canSteal?: boolean
  badge?: string
}

interface Props {
  friend: FriendData
  size?: 'sm' | 'md' | 'lg'
  showLevel?: boolean
  showStatus?: boolean
  showStats?: boolean
  showHelpButton?: boolean
  showStealButton?: boolean
  showPulse?: boolean
  clickable?: boolean
  variant?: 'default' | 'compact' | 'detailed'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  showLevel: true,
  showStatus: true,
  showStats: true,
  showHelpButton: true,
  showStealButton: true,
  showPulse: true,
  clickable: true,
  variant: 'default',
})

const emit = defineEmits<{
  click: [friend: FriendData]
  visit: [friend: FriendData]
  help: [friend: FriendData]
  steal: [friend: FriendData]
}>()

// 计算属性
const cardClasses = computed(() => [
  'friend-card',
  `size-${props.size}`,
  `variant-${props.variant}`,
  {
    clickable: props.clickable,
    online: props.friend.isOnline,
    offline: !props.friend.isOnline,
    'with-pulse': props.showPulse && props.friend.isOnline,
  },
])

const avatarSize = computed(() => {
  const sizeMap = {
    sm: 'sm' as const,
    md: 'md' as const,
    lg: 'lg' as const,
  }
  return sizeMap[props.size]
})

// 方法
const handleClick = () => {
  if (props.clickable) {
    emit('click', props.friend)
  }
}

const handleVisit = () => {
  emit('visit', props.friend)
}

const handleHelp = () => {
  emit('help', props.friend)
}

const handleSteal = () => {
  emit('steal', props.friend)
}
</script>

<style scoped>
.friend-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  overflow: hidden;
}

.friend-card.clickable {
  cursor: pointer;
}

.friend-card.clickable:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.friend-card.online {
  border-color: rgba(16, 185, 129, 0.3);
}

.friend-card.offline {
  border-color: rgba(107, 114, 128, 0.3);
}

/* 尺寸变体 */
.friend-card.size-sm {
  padding: 12px;
  gap: 8px;
}

.friend-card.size-lg {
  padding: 20px;
  gap: 16px;
}

/* 样式变体 */
.friend-card.variant.compact {
  padding: 8px 12px;
  gap: 8px;
}

.friend-card.variant.compact .friend-info {
  flex: 1;
  min-width: 0;
}

.friend-card.variant.detailed {
  padding: 20px;
  gap: 16px;
  flex-direction: column;
  align-items: flex-start;
}

.friend-card.variant.detailed .friend-avatar-section {
  align-self: center;
}

/* 头像区域 */
.friend-avatar-section {
  flex-shrink: 0;
}

/* 信息区域 */
.friend-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.friend-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.friend-card.size-sm .friend-name {
  font-size: 14px;
}

.friend-card.size-lg .friend-name {
  font-size: 18px;
}

.friend-stats {
  display: flex;
  gap: 12px;
  align-items: center;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #666;
}

.friend-card.size-sm .stat-item {
  font-size: 11px;
  gap: 3px;
}

.friend-status-text {
  display: flex;
  align-items: center;
}

/* 操作区域 */
.friend-actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.friend-card.size-sm .friend-actions {
  gap: 4px;
}

.friend-card.size-lg .friend-actions {
  gap: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #f3f4f6;
  color: #6b7280;
}

.action-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn.visit {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.action-btn.visit:hover:not(:disabled) {
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.action-btn.help {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
}

.action-btn.help:hover:not(:disabled) {
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.action-btn.steal {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
}

.action-btn.steal:hover:not(:disabled) {
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.friend-card.size-sm .action-btn {
  padding: 6px;
  width: 32px;
  height: 32px;
}

.friend-card.size-lg .action-btn {
  padding: 10px;
  width: 40px;
  height: 40px;
}

/* 徽章 */
.friend-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  font-size: 10px;
  font-weight: bold;
  padding: 2px 8px;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  z-index: 2;
}

/* 在线脉冲效果 */
.online-pulse {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05));
  animation: pulse 2s ease-in-out infinite;
  pointer-events: none;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .friend-card {
    padding: 12px;
    gap: 8px;
  }

  .friend-card.size-sm {
    padding: 8px;
    gap: 6px;
  }

  .friend-card.size-lg {
    padding: 16px;
    gap: 12px;
  }

  .friend-name {
    font-size: 14px;
  }

  .friend-card.size-sm .friend-name {
    font-size: 12px;
  }

  .friend-card.size-lg .friend-name {
    font-size: 16px;
  }

  .friend-stats {
    gap: 8px;
  }

  .stat-item {
    font-size: 11px;
  }

  .friend-actions {
    gap: 4px;
  }

  .action-btn {
    padding: 6px;
    width: 28px;
    height: 28px;
  }

  .friend-card.size-sm .action-btn {
    padding: 4px;
    width: 24px;
    height: 24px;
  }

  .friend-card.size-lg .action-btn {
    padding: 8px;
    width: 36px;
    height: 36px;
  }
}

@media (max-width: 480px) {
  .friend-card {
    flex-direction: column;
    text-align: center;
    gap: 8px;
    padding: 16px 12px;
  }

  .friend-card.size-sm {
    padding: 12px 8px;
    gap: 6px;
  }

  .friend-card.size-lg {
    padding: 20px 16px;
    gap: 12px;
  }

  .friend-card.variant.compact {
    flex-direction: row;
    text-align: left;
  }

  .friend-card.variant.detailed {
    flex-direction: column;
    text-align: center;
  }

  .friend-info {
    align-items: center;
    gap: 2px;
  }

  .friend-stats {
    justify-content: center;
    flex-wrap: wrap;
  }

  .friend-actions {
    justify-content: center;
    width: 100%;
  }

  .action-btn {
    flex: 1;
    max-width: 80px;
  }

  .friend-badge {
    top: 4px;
    right: 4px;
    font-size: 9px;
    padding: 1px 6px;
  }
}

/* 深色主题支持 */
@media (prefers-color-scheme: dark) {
  .friend-card {
    background: rgba(31, 41, 55, 0.95);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .friend-name {
    color: #f9fafb;
  }

  .stat-item {
    color: #9ca3af;
  }

  .action-btn {
    background: #374151;
    color: #9ca3af;
  }

  .action-btn:hover:not(:disabled) {
    background: #4b5563;
    color: #f9fafb;
  }

  .friend-card.online {
    border-color: rgba(16, 185, 129, 0.5);
  }

  .friend-card.offline {
    border-color: rgba(107, 114, 128, 0.5);
  }
}
</style>
