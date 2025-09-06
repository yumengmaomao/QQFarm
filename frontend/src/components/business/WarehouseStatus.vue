<template>
  <div class="warehouse-status">
    <div class="status-card">
      <h3 class="status-title">
        <Info :size="20" />
        <span>仓库状态</span>
      </h3>
      <div class="status-content">
        <div class="status-stats">
          <div class="status-stat">
            <span class="stat-label">总容量:</span>
            <span class="stat-value">{{ maxCapacity }}个</span>
          </div>
          <div class="status-stat">
            <span class="stat-label">已使用:</span>
            <span class="stat-value">{{ totalItems }}个</span>
          </div>
          <div class="status-stat">
            <span class="stat-label">使用率:</span>
            <span class="stat-value">{{ usagePercentage }}%</span>
          </div>
        </div>
        <div class="capacity-bar">
          <div class="capacity-fill" :style="{ width: `${usagePercentage}%` }"></div>
        </div>
        <div class="status-tips">
          <p class="tip-text">
            仓库已{{
              usagePercentage > 80 ? '即将满仓' : usagePercentage > 50 ? '半满' : '空间充足'
            }}
          </p>
          <p class="tip-text" v-if="usagePercentage > 80">建议及时清理或扩容仓库</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Info } from 'lucide-vue-next'

defineProps<{
  maxCapacity: number
  totalItems: number
  usagePercentage: number
}>()
</script>

<style scoped>
.warehouse-status {
  margin-bottom: 24px;
}

.status-card {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 20px;
}

.status-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
}

.status-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.status-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-label {
  font-size: 14px;
  color: var(--color-text-secondary);
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text);
}

.capacity-bar {
  width: 100%;
  height: 8px;
  background: var(--color-background-muted);
  border-radius: 4px;
  overflow: hidden;
}

.capacity-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary) 0%, var(--color-primary) 100%);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.status-tips {
  margin-top: 8px;
}

.tip-text {
  margin: 0;
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.5;
}

@media (max-width: 768px) {
  .status-card {
    padding: 16px;
  }

  .status-title {
    font-size: 14px;
  }

  .status-stats {
    flex-direction: column;
    gap: 12px;
  }

  .stat-value {
    font-size: 16px;
  }

  .capacity-bar {
    height: 6px;
  }
}
</style>
