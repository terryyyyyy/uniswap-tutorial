<script setup lang="ts">
import { computed } from 'vue'
import { chapters } from '@/data/chapters'
import { useProgressStore } from '@/stores/progress'
import { useRouter } from 'vue-router'
const props = defineProps<{ id: string }>()
const router = useRouter()
const store = useProgressStore()
const ch = computed(() => chapters.find((c) => c.id === Number(props.id)))
const go = (id: string) => router.push(`/lesson/${id}`)
</script>

<template>
  <div class="chapter" v-if="ch">
    <h1>{{ ch.icon }} 第{{ ch.id }}章 · {{ ch.title }}</h1>
    <p class="desc">{{ ch.description }}</p>
    <div v-for="l in ch.lessons" :key="l.id" class="lesson-card"
         :class="{ locked: !store.isLessonUnlocked(l.id) }"
         @click="store.isLessonUnlocked(l.id) && go(l.id)">
      <div class="row">
        <span class="order">关卡 {{ l.order }}</span>
        <span class="title">{{ l.title }}</span>
        <span class="summary">{{ l.summary }}</span>
        <span class="stars">⭐{{ store.stars[l.id] ?? 0 }}</span>
        <span class="lock">{{ store.isLessonUnlocked(l.id) ? '▶' : '🔒' }}</span>
      </div>
    </div>
    <div v-if="ch.lessons.length === 0" class="empty">本章关卡即将开放</div>
  </div>
  <div v-else class="not-found">章节 {{ id }} 不存在</div>
</template>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;
.chapter { max-width: 800px; margin: 0 auto; h1 { color: $accent-cyan; } .desc { color: $text-secondary; margin: 8px 0 24px; } }
.lesson-card { margin-bottom: 12px; cursor: pointer; background: $bg-base; border: 1px solid $border; border-radius: 8px; padding: 14px 16px; transition: .2s;
  &:hover { border-color: $accent-cyan; }
  &.locked { opacity: .5; cursor: not-allowed; &:hover { border-color: $border; } } }
.row { display: flex; align-items: center; gap: 12px; .order { color: $accent-purple; font-size: 13px; } .title { font-weight: 600; } .summary { flex: 1; color: $text-secondary; font-size: 13px; } .stars { color: $warning; } .lock { color: $accent-cyan; } }
.empty { color: $text-secondary; text-align: center; padding: 40px; }
.not-found { color: $danger; text-align: center; padding: 60px; }
</style>
