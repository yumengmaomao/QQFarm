<template>
  <div class="not-found-view">
    <div
      class="not-found-content"
      v-motion
      :initial="{ opacity: 0, scale: 0.8 }"
      :enter="{ opacity: 1, scale: 1 }"
      :delay="200"
    >
      <div class="error-icon">
        <AlertCircle :size="64" />
      </div>
      <h1>404</h1>
      <h2>页面未找到</h2>
      <p>抱歉，您访问的页面不存在或已被移除。</p>
      <div class="actions">
        <button class="btn primary" @click="goHome">
          <Home :size="20" />
          返回首页
        </button>
        <button class="btn secondary" @click="goBack">
          <ArrowLeft :size="20" />
          返回上页
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { AlertCircle, Home, ArrowLeft } from 'lucide-vue-next'

const router = useRouter()

const goHome = () => {
  router.push('/farm')
}

const goBack = () => {
  router.go(-1)
}
</script>

<style scoped>
.not-found-view {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.not-found-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: rgba(255, 255, 255, 0.95);
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 100%;
}

.error-icon {
  color: #ff6b6b;
  margin-bottom: 20px;
}

h1 {
  font-size: 72px;
  font-weight: 700;
  color: #333;
  margin: 0 0 16px 0;
  line-height: 1;
}

h2 {
  font-size: 24px;
  font-weight: 600;
  color: #666;
  margin: 0 0 16px 0;
}

p {
  font-size: 16px;
  color: #888;
  margin: 0 0 32px 0;
  line-height: 1.5;
}

.actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
}

.btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
}

.btn.primary {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.btn.secondary {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  border: 1px solid rgba(102, 126, 234, 0.3);
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
}

.btn.secondary:hover {
  background: rgba(102, 126, 234, 0.2);
}

@media (max-width: 480px) {
  .not-found-content {
    padding: 30px 20px;
    margin: 20px;
  }

  h1 {
    font-size: 60px;
  }

  h2 {
    font-size: 20px;
  }

  p {
    font-size: 14px;
  }

  .actions {
    flex-direction: column;
    width: 100%;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
