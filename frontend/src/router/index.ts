import { createRouter, createWebHistory } from 'vue-router'

// 路由组件懒加载
const FarmView = () => import('@/views/FarmView.vue')
const ShopView = () => import('@/views/ShopView.vue')
const WarehouseView = () => import('@/views/WarehouseView.vue')
const FriendsView = () => import('@/views/FriendsView.vue')
const LeaderboardView = () => import('@/views/LeaderboardView.vue')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/farm',
    },
    {
      path: '/farm',
      name: 'farm',
      component: FarmView,
      meta: {
        title: '我的农场',
        keepAlive: true,
      },
    },
    {
      path: '/shop',
      name: 'shop',
      component: ShopView,
      meta: {
        title: '商店',
        keepAlive: false,
      },
    },
    {
      path: '/warehouse',
      name: 'warehouse',
      component: WarehouseView,
      meta: {
        title: '仓库',
        keepAlive: true,
      },
    },
    {
      path: '/friends',
      name: 'friends',
      component: FriendsView,
      meta: {
        title: '好友',
        keepAlive: true,
      },
    },
    {
      path: '/leaderboard',
      name: 'leaderboard',
      component: LeaderboardView,
      meta: {
        title: '排行榜',
        keepAlive: true,
      },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
      meta: {
        title: '页面未找到',
      },
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - QQ农场`
  }

  // 这里可以添加登录验证等逻辑
  // const userStore = useUserStore()
  // if (to.meta.requiresAuth && !userStore.isLoggedIn) {
  //   next('/login')
  // } else {
  //   next()
  // }

  next()
})

export default router
