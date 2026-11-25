<script setup lang="ts">
import { useTemplateRef, watch } from 'vue'
import { useRoute } from 'vue-router'
import { TopRight, CircleCheck } from '@element-plus/icons-vue'
import { lessons } from './course'
import { useCourseProgress } from './progress'
import './course.css'

const progress = useCourseProgress()
const route = useRoute()
const main = useTemplateRef('main')
watch(() => route.path, () => main.value?.focus({ preventScroll: true }), { flush: 'post' })
const documentation = 'https://developers.uniswap.org/docs/protocols/v4/overview'
</script>

<template>
  <div class="v4-app">
    <a class="skip-link" href="#course-main">跳到正文</a>
    <header class="site-header">
      <div class="site-width header-inner">
        <RouterLink class="brand" to="/" aria-label="Uniswap v4 学习实验室首页">
          <span class="brand-mark" aria-hidden="true"></span>
          <span>Uniswap <span class="brand-version">v4</span><small>学习实验室</small></span>
        </RouterLink>
        <nav class="header-nav" aria-label="主导航">
          <RouterLink :to="{ name: 'home', hash: '#curriculum' }">课程目录</RouterLink>
          <a class="header-docs" :href="documentation" target="_blank" rel="noopener noreferrer">
            官方文档 <TopRight aria-hidden="true" />
          </a>
        </nav>
        <span class="header-progress" :aria-label="`已完成 ${progress.completedTopics.length} 节，共 ${lessons.length} 节`">
          <CircleCheck aria-hidden="true" /> <span class="progress-label">课程进度</span>
          <strong>{{ progress.completedTopics.length }} / {{ lessons.length }}</strong>
        </span>
      </div>
    </header>
    <main id="course-main" ref="main" tabindex="-1">
      <RouterView v-slot="{ Component, route }">
        <component :is="Component" :key="route.path" />
      </RouterView>
    </main>
    <footer class="site-footer site-width">
      <span>Uniswap v4 学习实验室</span>
      <RouterLink :to="{ name: 'v3' }">v3 原版教程 <TopRight aria-hidden="true" /></RouterLink>
    </footer>
  </div>
</template>
