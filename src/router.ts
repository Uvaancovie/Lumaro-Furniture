import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('./App.vue'),
    },
    {
      path: '/catalog',
      name: 'catalog',
      component: () => import('./App.vue'),
    },
    {
      path: '/product/:slug',
      name: 'product',
      component: () => import('./App.vue'),
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('./App.vue'),
    },
    {
      path: '/contact',
      name: 'contact',
      component: () => import('./App.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.name === 'product') return { top: 0 }
    return { top: 0 }
  },
})

export default router
