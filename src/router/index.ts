import { createRouter, createWebHistory } from 'vue-router'

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: () => import('@/views/HomeView.vue') },
    { path: '/chapter/:id', name: 'chapter', component: () => import('@/views/ChapterView.vue'), props: true },
    { path: '/lesson/:id', name: 'lesson', component: () => import('@/views/LessonView.vue'), props: true },
  ],
})
