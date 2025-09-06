<template>
  <footer class="app-footer" :class="footerClasses">
    <!-- 主要内容区域 -->
    <div class="footer-content">
      <!-- Logo和简介 -->
      <div class="footer-section brand-section">
        <div class="brand-logo" @click="handleLogoClick">
          <img src="/logo.svg" alt="QQ农场" class="logo" />
          <span class="brand-name">QQ农场</span>
        </div>
        <p class="brand-description">
          快乐农场，轻松种菜，与好友一起享受田园乐趣！
        </p>
        <div class="social-links">
          <a href="#" class="social-link" @click="handleSocialClick('wechat')">
            <MessageCircle :size="20" />
          </a>
          <a href="#" class="social-link" @click="handleSocialClick('weibo')">
            <Share2 :size="20" />
          </a>
          <a href="#" class="social-link" @click="handleSocialClick('qq')">
            <MessageSquare :size="20" />
          </a>
        </div>
      </div>

      <!-- 快速链接 -->
      <div class="footer-section links-section">
        <h3 class="section-title">快速导航</h3>
        <ul class="footer-links">
          <li><a href="/farm" @click="handleNavClick('farm')">我的农场</a></li>
          <li><a href="/friends" @click="handleNavClick('friends')">好友农场</a></li>
          <li><a href="/shop" @click="handleNavClick('shop')">商店</a></li>
          <li><a href="/leaderboard" @click="handleNavClick('leaderboard')">排行榜</a></li>
        </ul>
      </div>

      <!-- 游戏功能 -->
      <div class="footer-section features-section">
        <h3 class="section-title">游戏功能</h3>
        <ul class="footer-links">
          <li><a href="#" @click="handleFeatureClick('plant')">种植作物</a></li>
          <li><a href="#" @click="handleFeatureClick('steal')">偷菜</a></li>
          <li><a href="#" @click="handleFeatureClick('trade')">交易</a></li>
          <li><a href="#" @click="handleFeatureClick('help')">帮助好友</a></li>
        </ul>
      </div>

      <!-- 帮助支持 -->
      <div class="footer-section support-section">
        <h3 class="section-title">帮助支持</h3>
        <ul class="footer-links">
          <li><a href="#" @click="handleSupportClick('guide')">游戏指南</a></li>
          <li><a href="#" @click="handleSupportClick('faq')">常见问题</a></li>
          <li><a href="#" @click="handleSupportClick('contact')">联系我们</a></li>
          <li><a href="#" @click="handleSupportClick('feedback')">意见反馈</a></li>
        </ul>
      </div>
    </div>

    <!-- 底部信息 -->
    <div class="footer-bottom">
      <div class="footer-info">
        <p class="copyright">
          © {{ currentYear }} QQ农场. 保留所有权利.
        </p>
        <div class="footer-links-bottom">
          <a href="#" @click="handleLegalClick('privacy')">隐私政策</a>
          <a href="#" @click="handleLegalClick('terms')">服务条款</a>
          <a href="#" @click="handleLegalClick('about')">关于我们</a>
        </div>
      </div>
      <div class="footer-stats">
        <div class="stat-item">
          <Users :size="16" />
          <span>在线用户: {{ formatNumber(onlineUsers) }}</span>
        </div>
        <div class="stat-item">
          <TrendingUp :size="16" />
          <span>今日活跃: {{ formatNumber(todayActive) }}</span>
        </div>
        <div class="stat-item">
          <Globe :size="16} />
          <span>服务器状态: <span :class="serverStatusClass">{{ serverStatus }}</span></span>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  MessageCircle,
  Share2,
  MessageSquare,
  Users,
  TrendingUp,
  Globe,
} from 'lucide-vue-next'

interface Props {
  fixed?: boolean
  simple?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  fixed: true,
  simple: false,
})

const emit = defineEmits<{
  'logo:click': []
  'nav:click': [page: string]
  'social:click': [platform: string]
  'feature:click': [feature: string]
  'support:click': [type: string]
  'legal:click': [type: string]
}>()

// 响应式状态
const router = useRouter()
const currentYear = new Date().getFullYear()

// 模拟数据（实际项目中应该从API获取）
const onlineUsers = ref(12345)
const todayActive = ref(6789)
const serverStatus = ref<'normal' | 'maintenance' | 'error'>('normal')

// 计算属性
const footerClasses = computed(() => [
  'app-footer',
  {
    'fixed': props.fixed,
    'simple': props.simple,
  },
])

const serverStatusClass = computed(() => [
  'server-status',
  `status-${serverStatus.value}`,
])

// 方法
const formatNumber = (num: number) => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num.toLocaleString()
}

const handleLogoClick = () => {
  emit('logo:click')
  router.push('/')
}

const handleNavClick = (page: string) => {
  emit('nav:click', page)
  router.push(`/${page}`)
}

const handleSocialClick = (platform: string) => {
  emit('social:click', platform)
  // 这里可以添加分享逻辑
}

const handleFeatureClick = (feature: string) => {
  emit('feature:click', feature)
}

const handleSupportClick = (type: string) => {
  emit('support:click', type)
}

const handleLegalClick = (type: string) => {
  emit('legal:click', type)
}

// 模拟数据更新
const updateStats = () => {
  // 模拟用户数量变化
  onlineUsers.value = Math.floor(Math.random() * 5000) + 10000
  todayActive.value = Math.floor(Math.random() * 2000) + 5000
  
  // 模拟服务器状态变化
  const statuses: Array<'normal' | 'maintenance' | 'error'> = ['normal', 'normal', 'normal', 'maintenance', 'error']
  serverStatus.value = statuses[Math.floor(Math.random() * statuses.length)]
}

// 生命周期
onMounted(() => {
  // 每30秒更新一次统计数据
  const statsInterval = setInterval(updateStats, 30000)
  
  // 清理定时器
  onUnmounted(() => {
    clearInterval(statsInterval)
  })
})

onUnmounted(() => {
  // 清理工作在onMounted中处理
})

// 暴露方法供父组件调用
defineExpose({
  updateStats,
})
</script>

<style scoped>
.app-footer {
  background: linear-gradient(135deg, #1f2937, #111827);
  color: #f9fafb;
  padding: 40px 20px 20px;
}

.app-footer.fixed {
  position: relative;
}

.app-footer.simple {
  padding: 20px;
  text-align: center;
}

/* 主要内容区域 */
.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 40px;
}

.app-footer.simple .footer-content {
  grid-template-columns: 1fr;
  gap: 20px;
}

.footer-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 品牌区域 */
.brand-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 12px;
}

.brand-logo:hover {
  transform: scale(1.05);
}

.logo {
  width: 40px;
  height: 40px;
}

.brand-name {
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.brand-description {
  font-size: 14px;
  color: #9ca3af;
  line-height: 1.5;
  margin-bottom: 16px;
}

.social-links {
  display: flex;
  gap: 12px;
}

.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  color: #9ca3af;
  transition: all 0.3s ease;
}

.social-link:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #f9fafb;
  transform: scale(1.1);
}

/* 区域标题 */
.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #f9fafb;
  margin: 0;
  position: relative;
  padding-bottom: 8px;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 40px;
  height: 2px;
  background: linear-gradient(90deg, #667eea, #764ba2);
}

/* 链接列表 */
.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.footer-links li {
  margin: 0;
}

.footer-links a {
  color: #9ca3af;
  text-decoration: none;
  font-size: 14px;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.footer-links a:hover {
  color: #f9fafb;
  transform: translateX(4px);
}

/* 底部信息 */
.footer-bottom {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.app-footer.simple .footer-bottom {
  margin-top: 20px;
  padding-top: 20px;
  flex-direction: column;
  text-align: center;
  gap: 12px;
}

.footer-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.copyright {
  font-size: 12px;
  color: #6b7280;
  margin: 0;
}

.footer-links-bottom {
  display: flex;
  gap: 16px;
}

.footer-links-bottom a {
  color: #6b7280;
  text-decoration: none;
  font-size: 12px;
  transition: all 0.3s ease;
}

.footer-links-bottom a:hover {
  color: #9ca3af;
}

.footer-stats {
  display: flex;
  gap: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #6b7280;
}

.server-status {
  font-weight: 600;
}

.server-status.status-normal {
  color: #10b981;
}

.server-status.status-maintenance {
  color: #f59e0b;
}

.server-status.status-error {
  color: #ef4444;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .app-footer {
    padding: 30px 16px 16px;
  }
  
  .footer-content {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 30px;
  }
  
  .brand-name {
    font-size: 20px;
  }
  
  .section-title {
    font-size: 14px;
  }
  
  .footer-bottom {
    margin-top: 30px;
    flex-direction: column;
    gap: 12px;
  }
  
  .footer-stats {
    justify-content: center;
    gap: 16px;
  }
}

@media (max-width: 480px) {
  .app-footer {
    padding: 20px 12px 12px;
  }
  
  .footer-content {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  
  .brand-logo {
    justify-content: center;
  }
  
  .brand-name {
    font-size: 18px;
  }
  
  .social-links {
    justify-content: center;
  }
  
  .section-title::after {
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
  }
  
  .footer-links {
    align-items: center;
  }
  
  .footer-links a {
    justify-content: center;
  }
  
  .footer-bottom {
    margin-top: 20px;
  }
  
  .footer-links-bottom {
    justify-content: center;
    flex-wrap: wrap;
    gap: 12px;
  }
  
  .footer-stats {
    flex-direction: column;
    gap: 8px;
    align-items: center;
  }
}

/* 深色主题支持（已经是深色，但可以添加一些特殊效果） */
@media (prefers-color-scheme: dark) {
  .app-footer {
    background: linear-gradient(135deg, #0f172a, #1e293b);
  }
  
  .brand-description {
    color: #64748b;
  }
  
  .social-link {
    background: rgba(255, 255, 255, 0.05);
    color: #64748b;
  }
  
  .social-link:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #94a3b8;
  }
  
  .section-title::after {
    background: linear-gradient(90deg, #6366f1, #818cf8);
  }
  
  .footer-links a {
    color: #64748b;
  }
  
  .footer-links a:hover {
    color: #94a3b8;
  }
  
  .copyright {
    color: #475569;
  }
  
  .footer-links-bottom a {
    color: #475569;
  }
  
  .footer-links-bottom a:hover {
    color: #64748b;
  }
  
  .stat-item {
    color: #475569;
  }
}
</style>
