<script setup lang="ts">
import { computed, onMounted, useTemplateRef, watch, watchEffect, type Component } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowDown, ArrowLeft, ArrowRight, TopRight, CircleCheck } from '@element-plus/icons-vue'
import { lessons, type LessonId } from './course'
import { courseIcons } from './courseIcons'
import { implementationAnchor, useCourseProgress } from './progress'
import { implementation } from './implementation/course'
import ImplementationContent from './implementation/ImplementationContent.vue'
import LessonQuiz from './LessonQuiz.vue'
import SwapLab from './labs/SwapLab.vue'
import RangeLab from './labs/RangeLab.vue'
import PoolLab from './labs/PoolLab.vue'
import HooksLab from './labs/HooksLab.vue'
import FeesLab from './labs/FeesLab.vue'
import SettlementLab from './labs/SettlementLab.vue'

const props = defineProps<{ id: string }>()
const progress = useCourseProgress()
const route = useRoute()
const index = computed(() => lessons.findIndex(lesson => lesson.id === props.id))
const lesson = computed(() => lessons[index.value])
const next = computed(() => lessons[index.value + 1])
const sourceLesson = computed(() => lesson.value && implementation[lesson.value.id])
const labs = {
  swap: SwapLab,
  liquidity: RangeLab,
  'pool-manager': PoolLab,
  hooks: HooksLab,
  fees: FeesLab,
  settlement: SettlementLab,
} satisfies Record<LessonId, Component>
const lessonNav = useTemplateRef('lesson-nav')
const sourceHeading = useTemplateRef('source-heading')

onMounted(() => {
  const nav = lessonNav.value
  const active = nav?.querySelector<HTMLElement>('[aria-current="page"]')
  if (nav && active) nav.scrollLeft = active.offsetLeft - nav.offsetLeft
})

watch(lesson, (current) => {
  if (current) progress.visit(current.id)
  document.title = current ? `${current.title} · Uniswap v4 教程` : '找不到课程 · Uniswap v4'
}, { immediate: true })

watchEffect(() => {
  if (route.hash === implementationAnchor) sourceHeading.value?.focus({ preventScroll: true })
}, { flush: 'post' })
</script>

<template>
  <div v-if="lesson && sourceLesson" class="site-width lesson-layout" :class="`tone-${index}`">
    <aside class="lesson-nav">
      <RouterLink class="back-link" :to="{ name: 'home', hash: '#curriculum' }"><ArrowLeft aria-hidden="true" /> 全部课程</RouterLink>
      <nav ref="lesson-nav" aria-label="学习路径">
        <RouterLink v-for="(item, i) in lessons" :key="item.id" :to="{ name: 'v4-lesson', params: { id: item.id } }">
          <span class="lesson-number">{{ String(i + 1).padStart(2, '0') }}</span>
          {{ item.title }}
          <CircleCheck v-if="progress.completedTopics.includes(item.id)" class="nav-done" aria-label="已完成" role="img" />
        </RouterLink>
      </nav>
      <progress :value="progress.completedTopics.length" :max="lessons.length" aria-label="课程进度"></progress>
    </aside>
    <article class="lesson-article">
      <header class="lesson-heading">
        <span class="lesson-icon"><component :is="courseIcons[lesson.id]" aria-hidden="true" /></span>
        <div>
          <p class="lesson-meta">第 {{ index + 1 }} / {{ lessons.length }} 课 <span>·</span> {{ lesson.topic }}</p>
          <h1>{{ lesson.title }}</h1>
          <p>{{ lesson.description }}</p>
        </div>
      </header>
      <section class="lab-panel" aria-labelledby="lab-heading">
        <div class="lab-header">
          <p class="section-label">应用原理与实验</p>
          <h2 id="lab-heading">{{ lesson.lab.title }}</h2>
        </div>
        <p class="lab-instruction">{{ lesson.lab.instruction }}</p>
        <component :is="labs[lesson.id]" />
      </section>
      <section class="takeaways" aria-labelledby="takeaway-heading">
        <h2 id="takeaway-heading">你刚刚看到了什么</h2>
        <div class="takeaway-grid">
          <div v-for="item in lesson.takeaways" :key="item.title" class="takeaway">
            <h3>{{ item.title }}</h3>
            <p>{{ item.text }}</p>
          </div>
        </div>
        <details class="deep-dive">
          <summary>补充说明</summary>
          <p>{{ lesson.deeper.text }}</p>
          <pre v-if="lesson.deeper.code">{{ lesson.deeper.code }}</pre>
          <a :href="lesson.deeper.link" target="_blank" rel="noopener noreferrer">{{ lesson.deeper.label }} <TopRight aria-hidden="true" /></a>
        </details>
      </section>
      <LessonQuiz
        label="应用原理测验"
        :quiz="lesson.quiz"
        :completed="progress.done('application').includes(lesson.id)"
        @passed="progress.complete(lesson.id, 'application')"
      />
      <div class="lesson-bridge">
        <p>{{ sourceLesson.bridge }}</p>
        <RouterLink class="button button-primary" :to="{ name: 'v4-lesson', params: { id: lesson.id }, hash: implementationAnchor }">
          接着看 Solidity 实现 <ArrowDown aria-hidden="true" />
        </RouterLink>
      </div>
      <section id="implementation" class="implementation-stage" aria-labelledby="implementation-heading">
        <header class="implementation-heading">
          <p class="section-label">Solidity 实现</p>
          <h2 id="implementation-heading" ref="source-heading" tabindex="-1">{{ sourceLesson.title }}</h2>
          <p>{{ sourceLesson.summary }}</p>
        </header>
        <ImplementationContent :id="lesson.id" :lesson="sourceLesson" />
        <LessonQuiz
          label="Solidity 实现测验"
          :quiz="sourceLesson.quiz"
          :completed="progress.done('implementation').includes(lesson.id)"
          @passed="progress.complete(lesson.id, 'implementation')"
        />
      </section>
      <nav class="lesson-footer" aria-label="继续学习">
        <span v-if="progress.completedTopics.includes(lesson.id)" class="is-positive completion-label"><CircleCheck aria-hidden="true" /> 本课已完成</span>
        <RouterLink v-if="next" class="button button-primary" :to="{ name: 'v4-lesson', params: { id: next.id } }">
          下一课 · {{ next.title }} <ArrowRight aria-hidden="true" />
        </RouterLink>
        <RouterLink v-else class="button button-primary" :to="{ name: 'home', hash: '#curriculum' }">返回课程目录 <ArrowRight aria-hidden="true" /></RouterLink>
      </nav>
    </article>
  </div>
  <div v-else class="site-width missing-lesson">
    <h1>找不到这节课</h1>
    <RouterLink class="button button-primary" :to="{ name: 'home', hash: '#curriculum' }">查看课程目录 <ArrowRight aria-hidden="true" /></RouterLink>
  </div>
</template>
