import { createRouter, createWebHistory } from 'vue-router'

export default createRouter({
  history: createWebHistory(),
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) {
      const withinLesson = to.path === from.path && to.hash === '#implementation'
      const behavior = withinLesson && !window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'smooth' : 'auto'
      return { el: to.hash, top: 90, behavior }
    }
    if (to.path !== from.path) return { top: 0 }
  },
  routes: [
    {
      path: '/',
      component: () => import('@/v4/CourseShell.vue'),
      children: [
        { path: '', name: 'home', component: () => import('@/v4/CourseHome.vue') },
        { path: 'lesson/:id', name: 'v4-lesson', component: () => import('@/v4/CourseLesson.vue'), props: true },
        {
          path: 'implementation/:id',
          redirect: to => ({ name: 'v4-lesson', params: to.params, hash: '#implementation' }),
        },
      ],
    },
    {
      path: '/v3',
      component: () => import('@/LegacyApp.vue'),
      children: [
        { path: '', name: 'v3', component: () => import('@/views/HomeView.vue') },
        { path: 'chapter/:id', name: 'chapter', component: () => import('@/views/ChapterView.vue'), props: true },
        { path: 'lesson/:id', name: 'lesson', component: () => import('@/views/LessonView.vue'), props: true },
      ],
    },
    { path: '/chapter/:id(\\d+)', redirect: to => ({ name: 'chapter', params: to.params }) },
    { path: '/lesson/:id(\\d+-\\d+)', redirect: to => ({ name: 'lesson', params: to.params }) },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})
