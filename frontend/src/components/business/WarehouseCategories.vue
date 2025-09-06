<template>
  <div class="warehouse-categories">
    <div class="categories-scroll">
      <button
        class="category-btn"
        :class="{ active: activeCategory === 'all' }"
        @click="$emit('category-change', 'all')"
      >
        <Package :size="20" />
        <span>全部物品</span>
      </button>
      <button
        class="category-btn"
        :class="{ active: activeCategory === 'seeds' }"
        @click="$emit('category-change', 'seeds')"
      >
        <Sprout :size="20" />
        <span>种子</span>
      </button>
      <button
        class="category-btn"
        :class="{ active: activeCategory === 'tools' }"
        @click="$emit('category-change', 'tools')"
      >
        <Wrench :size="20" />
        <span>工具</span>
      </button>
      <button
        class="category-btn"
        :class="{ active: activeCategory === 'decorations' }"
        @click="$emit('category-change', 'decorations')"
      >
        <Sparkles :size="20" />
        <span>装饰</span>
      </button>
      <button
        class="category-btn"
        :class="{ active: activeCategory === 'special' }"
        @click="$emit('category-change', 'special')"
      >
        <Gem :size="20" />
        <span>特殊物品</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Package, Sprout, Wrench, Sparkles, Gem } from 'lucide-vue-next'

defineProps<{
  activeCategory: string
}>()

defineEmits<{
  'category-change': [category: string]
}>()
</script>

<style scoped>
.warehouse-categories {
  margin-bottom: 24px;
}

.categories-scroll {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
  scrollbar-width: thin;
  scrollbar-color: var(--color-border);
}

.categories-scroll::-webkit-scrollbar {
  height: 4px;
}

.categories-scroll::-webkit-scrollbar-track {
  background: var(--color-background-muted);
  border-radius: 2px;
}

.categories-scroll::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 2px;
}

.category-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: 1px solid var(--color-border);
  border-radius: 20px;
  background: var(--color-background);
  color: var(--color-text-secondary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.category-btn:hover {
  background: var(--color-background-hover);
  color: var(--color-text);
}

.category-btn.active {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.category-btn .icon {
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .category-btn {
    padding: 8px 12px;
    font-size: 12px;
  }

  .category-btn .icon {
    width: 16px;
    height: 16px;
  }
}
</style>
