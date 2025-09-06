<template>
  <div class="tab-navigation" :class="navigationClasses">
    <!-- 标签列表 -->
    <div class="tab-list" :class="listClasses" ref="tabListRef">
      <div
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-item"
        :class="tabClasses(tab)"
        @click="handleTabClick(tab)"
        @mouseenter="handleTabHover(tab, true)"
        @mouseleave="handleTabHover(tab, false)"
      >
        <!-- 标签图标 -->
        <component v-if="tab.icon" :is="tab.icon" :size="iconSize" class="tab-icon" />

        <!-- 标签文本 -->
        <span class="tab-text">{{ tab.label }}</span>

        <!-- 标签徽章 -->
        <span v-if="getTabBadge(tab)" class="tab-badge" :class="badgeClasses(tab)">
          {{ getTabBadge(tab) }}
        </span>

        <!-- 关闭按钮（可选） -->
        <button
          v-if="closable && tab.closable !== false"
          class="tab-close"
          @click.stop="handleTabClose(tab)"
        >
          <X :size="12" />
        </button>
      </div>
    </div>

    <!-- 滚动按钮 -->
    <template v-if="scrollable">
      <button v-show="canScrollLeft" class="scroll-btn scroll-left" @click="scroll('left')">
        <ChevronLeft :size="16" />
      </button>
      <button v-show="canScrollRight" class="scroll-btn scroll-right" @click="scroll('right')">
        <ChevronRight :size="16" />
      </button>
    </template>

    <!-- 更多菜单（可选） -->
    <div v-if="showMoreMenu && overflowTabs.length > 0" class="more-menu">
      <button class="more-btn" @click="toggleMoreMenu">
        <MoreHorizontal :size="16" />
      </button>
      <div v-if="moreMenuOpen" class="more-dropdown">
        <div
          v-for="tab in overflowTabs"
          :key="tab.key"
          class="more-item"
          :class="{ active: activeTab === tab.key }"
          @click="handleTabClick(tab)"
        >
          <component v-if="tab.icon" :is="tab.icon" :size="14" class="more-icon" />
          <span class="more-text">{{ tab.label }}</span>
          <span v-if="getTabBadge(tab)" class="more-badge">
            {{ getTabBadge(tab) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, type Component } from 'vue'
import { X, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-vue-next'

interface TabItem {
  key: string
  label: string
  icon?: Component
  badge?: string | number
  disabled?: boolean
  closable?: boolean
  hover?: boolean
  onClick?: () => void
  onClose?: () => void
}

interface Props {
  tabs: TabItem[]
  modelValue?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'line' | 'card' | 'pill' | 'underline'
  align?: 'left' | 'center' | 'right' | 'stretch'
  scrollable?: boolean
  closable?: boolean
  showMoreMenu?: boolean
  animated?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  size: 'md',
  variant: 'line',
  align: 'left',
  scrollable: false,
  closable: false,
  showMoreMenu: false,
  animated: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  tabClick: [tab: TabItem]
  tabClose: [tab: TabItem]
}>()

// 响应式状态
const tabListRef = ref<HTMLElement>()
const moreMenuOpen = ref(false)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)
const overflowTabs = ref<TabItem[]>([])

// 计算属性
const activeTab = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const navigationClasses = computed(() => [
  'tab-navigation',
  `size-${props.size}`,
  `variant-${props.variant}`,
  `align-${props.align}`,
  {
    scrollable: props.scrollable,
    'with-more-menu': props.showMoreMenu,
    animated: props.animated,
  },
])

const listClasses = computed(() => ['tab-list', `align-${props.align}`])

const iconSize = computed(() => {
  const sizeMap = {
    sm: 14,
    md: 16,
    lg: 18,
  }
  return sizeMap[props.size]
})

// 方法
const tabClasses = (tab: TabItem) => [
  'tab-item',
  {
    active: activeTab.value === tab.key,
    disabled: tab.disabled,
    hover: tab.hover,
  },
]

const badgeClasses = (tab: TabItem) => [
  'tab-badge',
  {
    active: activeTab.value === tab.key,
  },
]

const getTabBadge = (tab: TabItem) => {
  if (typeof tab.badge === 'number' && tab.badge > 99) {
    return '99+'
  }
  return tab.badge
}

const handleTabClick = (tab: TabItem) => {
  if (tab.disabled) return

  activeTab.value = tab.key
  emit('tabClick', tab)
  tab.onClick?.()

  // 关闭更多菜单
  moreMenuOpen.value = false
}

const handleTabClose = (tab: TabItem) => {
  emit('tabClose', tab)
  tab.onClose?.()
}

const handleTabHover = (tab: TabItem, isHover: boolean) => {
  tab.hover = isHover
}

const toggleMoreMenu = () => {
  moreMenuOpen.value = !moreMenuOpen.value
}

const scroll = (direction: 'left' | 'right') => {
  if (!tabListRef.value) return

  const scrollAmount = 200
  if (direction === 'left') {
    tabListRef.value.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
  } else {
    tabListRef.value.scrollBy({ left: scrollAmount, behavior: 'smooth' })
  }
}

const checkScroll = () => {
  if (!tabListRef.value || !props.scrollable) return

  const { scrollLeft, scrollWidth, clientWidth } = tabListRef.value
  canScrollLeft.value = scrollLeft > 0
  canScrollRight.value = scrollLeft < scrollWidth - clientWidth

  // 检查溢出的标签
  updateOverflowTabs()
}

const updateOverflowTabs = () => {
  if (!tabListRef.value || !props.showMoreMenu) return

  const { scrollLeft, clientWidth } = tabListRef.value
  const visibleWidth = clientWidth
  const tabs = tabListRef.value.querySelectorAll('.tab-item')

  overflowTabs.value = []
  let accumulatedWidth = 0

  tabs.forEach((tab, index) => {
    const tabWidth = (tab as HTMLElement).offsetWidth
    const tabLeft = accumulatedWidth - scrollLeft

    if (tabLeft + tabWidth > visibleWidth || tabLeft < 0) {
      overflowTabs.value.push(props.tabs[index])
    }

    accumulatedWidth += tabWidth
  })
}

const handleClickOutside = (event: MouseEvent) => {
  if (!moreMenuOpen.value) return

  const target = event.target as HTMLElement
  const moreMenu = document.querySelector('.more-menu')

  if (moreMenu && !moreMenu.contains(target)) {
    moreMenuOpen.value = false
  }
}

// 生命周期
onMounted(() => {
  if (props.scrollable) {
    checkScroll()
    window.addEventListener('resize', checkScroll)
  }

  if (props.showMoreMenu) {
    document.addEventListener('click', handleClickOutside)
  }

  // 设置默认激活标签
  if (!activeTab.value && props.tabs.length > 0) {
    activeTab.value = props.tabs[0].key
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', checkScroll)
  document.removeEventListener('click', handleClickOutside)
})

// 暴露方法
defineExpose({
  scroll,
  checkScroll,
})
</script>

<style scoped>
.tab-navigation {
  position: relative;
  display: flex;
  align-items: center;
}

.tab-list {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
  overflow: hidden;
  scroll-behavior: smooth;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.tab-list::-webkit-scrollbar {
  display: none;
}

.tab-list.align-left {
  justify-content: flex-start;
}

.tab-list.align-center {
  justify-content: center;
}

.tab-list.align-right {
  justify-content: flex-end;
}

.tab-list.align-stretch {
  justify-content: stretch;
}

.tab-list.align-stretch .tab-item {
  flex: 1;
  justify-content: center;
}

/* 标签项 */
.tab-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  white-space: nowrap;
  user-select: none;
}

.tab-icon {
  flex-shrink: 0;
}

.tab-text {
  font-weight: 500;
}

.tab-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  background: #ef4444;
  color: white;
  font-size: 10px;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tab-close {
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px;
  border-radius: 4px;
  color: #6b7280;
  opacity: 0;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tab-item:hover .tab-close {
  opacity: 1;
}

.tab-close:hover {
  background: rgba(0, 0, 0, 0.1);
  color: #374151;
}

/* 尺寸变体 */
.tab-navigation.size-sm .tab-item {
  padding: 6px 12px;
  font-size: 12px;
}

.tab-navigation.size-md .tab-item {
  padding: 8px 16px;
  font-size: 14px;
}

.tab-navigation.size-lg .tab-item {
  padding: 10px 20px;
  font-size: 16px;
}

.tab-navigation.size-sm .tab-badge {
  font-size: 8px;
  min-width: 14px;
  height: 14px;
}

.tab-navigation.size-lg .tab-badge {
  font-size: 11px;
  min-width: 18px;
  height: 18px;
}

/* 样式变体 */
.tab-navigation.variant-line .tab-item {
  border-bottom: 2px solid transparent;
  background: transparent;
  color: #6b7280;
}

.tab-navigation.variant-line .tab-item.active {
  border-bottom-color: #667eea;
  color: #667eea;
}

.tab-navigation.variant-line .tab-item:hover:not(.disabled) {
  color: #374151;
  background: rgba(102, 126, 234, 0.05);
}

.tab-navigation.variant-card .tab-item {
  background: #f3f4f6;
  color: #6b7280;
  border: 1px solid transparent;
}

.tab-navigation.variant-card .tab-item.active {
  background: white;
  color: #667eea;
  border-color: #667eea;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.tab-navigation.variant-card .tab-item:hover:not(.disabled) {
  background: #f9fafb;
  color: #374151;
}

.tab-navigation.variant-pill .tab-item {
  background: #f3f4f6;
  color: #6b7280;
  border-radius: 20px;
}

.tab-navigation.variant-pill .tab-item.active {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.tab-navigation.variant-pill .tab-item:hover:not(.disabled) {
  background: #f9fafb;
  color: #374151;
}

.tab-navigation.variant-underline .tab-item {
  border-bottom: 2px solid transparent;
  background: transparent;
  color: #6b7280;
  padding-bottom: 6px;
}

.tab-navigation.variant-underline .tab-item.active {
  border-bottom-color: #667eea;
  color: #667eea;
}

.tab-navigation.variant-underline .tab-item:hover:not(.disabled) {
  color: #374151;
}

/* 禁用状态 */
.tab-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 滚动按钮 */
.scroll-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  padding: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
}

.scroll-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.scroll-btn.scroll-left {
  left: 0;
}

.scroll-btn.scroll-right {
  right: 0;
}

.tab-navigation.scrollable .tab-list {
  margin: 0 24px;
}

/* 更多菜单 */
.more-menu {
  position: relative;
  margin-left: 8px;
}

.more-btn {
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
}

.more-btn:hover {
  background: #f9fafb;
  color: #374151;
}

.more-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 180px;
  max-height: 300px;
  overflow-y: auto;
  z-index: 1000;
}

.more-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #374151;
}

.more-item:hover {
  background: #f3f4f6;
}

.more-item.active {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

.more-icon {
  flex-shrink: 0;
}

.more-text {
  flex: 1;
  font-size: 14px;
}

.more-badge {
  background: #ef4444;
  color: white;
  font-size: 10px;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 动画效果 */
.tab-navigation.animated .tab-item {
  transition: all 0.3s ease;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .tab-navigation {
    flex-wrap: wrap;
  }

  .tab-list.align-stretch .tab-item {
    flex: 1;
    min-width: 80px;
  }

  .more-dropdown {
    right: -8px;
    min-width: 160px;
  }
}

@media (max-width: 480px) {
  .tab-navigation.size-sm .tab-item {
    padding: 4px 8px;
    font-size: 11px;
  }

  .tab-navigation.size-md .tab-item {
    padding: 6px 12px;
    font-size: 12px;
  }

  .tab-navigation.size-lg .tab-item {
    padding: 8px 16px;
    font-size: 14px;
  }

  .tab-badge {
    font-size: 8px;
    min-width: 14px;
    height: 14px;
  }

  .more-dropdown {
    min-width: 140px;
  }
}
</style>
