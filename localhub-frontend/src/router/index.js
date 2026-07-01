import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'home', component: () => import('@/views/HomeView.vue') },
  {
    path: '/board/:region',
    name: 'board',
    component: () => import('@/views/BoardListView.vue'),
    props: true
  },
  {
    path: '/board/:region/write',
    name: 'write',
    component: () => import('@/views/PostEditView.vue'),
    props: true
  },
  {
    path: '/post/:id',
    name: 'post',
    component: () => import('@/views/PostDetailView.vue'),
    props: true
  },
  {
    path: '/post/:id/edit',
    name: 'edit',
    component: () => import('@/views/PostEditView.vue'),
    props: true
  },
  { path: '/map', name: 'map', component: () => import('@/views/MapView.vue') },
  { path: '/dashboard', name: 'dashboard', component: () => import('@/views/DashboardView.vue') },
  { path: '/calendar', name: 'calendar', component: () => import('@/views/CalendarView.vue') },
  { path: '/bookmarks', name: 'bookmarks', component: () => import('@/views/BookmarksView.vue') },
  { path: '/:pathMatch(.*)*', name: 'notfound', component: () => import('@/views/NotFoundView.vue') }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 })
})

export default router
