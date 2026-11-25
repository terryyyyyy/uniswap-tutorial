<script setup lang="ts">
import { ArrowDown, ArrowRight, CircleCheck, Reading } from '@element-plus/icons-vue'
import { lessons } from './course'
import { courseIcons } from './courseIcons'
import { implementation } from './implementation/course'
import { useCourseProgress } from './progress'

const progress = useCourseProgress()
document.title = 'Uniswap v4 互动教程'
</script>

<template>
  <div class="site-width home">
    <section class="hero" aria-labelledby="hero-heading">
      <div class="hero-art" aria-hidden="true"></div>
      <div class="hero-body">
        <p class="hero-kicker"><span></span> 应用原理 / Solidity 源码</p>
        <h1 id="hero-heading">从应用到源码<br /><em>Uniswap v4</em></h1>
        <p class="hero-description">每节课先用实验看懂协议行为，<br class="desktop-break" />接着读 Solidity 代码，看同一个操作如何实现。</p>
        <div class="hero-actions">
          <RouterLink class="button button-primary"
            :to="{ name: 'v4-lesson', params: { id: progress.resumeTarget.id }, hash: progress.resumeTarget.hash }">
            {{ progress.completedTopics.length === lessons.length ? '复习课程' : progress.hasStarted ? '继续学习' : '开始学习' }}
            <ArrowRight aria-hidden="true" />
          </RouterLink>
          <RouterLink class="button button-ghost" :to="{ name: 'home', hash: '#curriculum' }">
            浏览课程 <ArrowDown aria-hidden="true" />
          </RouterLink>
        </div>
      </div>
    </section>

    <section id="curriculum" class="curriculum" aria-labelledby="curriculum-heading">
      <div class="section-heading">
        <div>
          <h2 id="curriculum-heading">学习路径</h2>
          <p>每课依次学习应用原理、Solidity 实现和 Foundry 实操。</p>
        </div>
        <div class="course-meta">
          <span><Reading aria-hidden="true" /> {{ lessons.length }} 节课</span>
        </div>
      </div>
      <div class="course-grid">
        <RouterLink v-for="(lesson, index) in lessons" :key="lesson.id" class="course-card" :class="`tone-${index}`"
          :to="{ name: 'v4-lesson', params: { id: lesson.id } }">
          <div class="card-top">
            <span class="lesson-icon"><component :is="courseIcons[lesson.id]" aria-hidden="true" /></span>
            <span v-if="progress.completedTopics.includes(lesson.id)" class="card-done"><CircleCheck aria-hidden="true" /> 已完成</span>
            <span v-else class="card-chapter">{{ lesson.topic }}</span>
          </div>
          <h3>{{ lesson.title }}</h3>
          <p>{{ lesson.description }}</p>
          <div class="card-bottom">
            <span>{{ implementation[lesson.id].title }}</span>
            <ArrowRight aria-hidden="true" />
          </div>
        </RouterLink>
      </div>
    </section>
  </div>
</template>
