import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import TabsPage from '../views/TabsPage.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/splash'
  },
  {
    path: '/splash',
    component: () => import('@/views/SplashPage.vue')
  },
  {
    path: '/tabs/',
    component: TabsPage,
    children: [
      {
        path: '',
        redirect: '/tabs/home'
      },
      {
        path: 'home',
        component: () => import('@/views/HomePage.vue')
      },
      {
        path: 'history',
        component: () => import('@/views/HistoryPage.vue')
      },
      {
        path: 'charts',
        component: () => import('@/views/ChartsPage.vue')
      },
      {
        path: 'categories',
        component: () => import('@/views/CategoriesPage.vue')
      },
      {
        path: 'register',
        component: () => import('@/views/MovementFormPage.vue')
      },
      {
        path: 'movement/:id',
        component: () => import('@/views/MovementDetailPage.vue')
      },
      {
        path: 'movement/:id/edit',
        component: () => import('@/views/MovementFormPage.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
