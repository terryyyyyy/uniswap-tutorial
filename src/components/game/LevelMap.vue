<script setup lang="ts">
import { chapters } from '@/data/chapters'
import { useProgressStore } from '@/stores/progress'
import { useRouter } from 'vue-router'
const store = useProgressStore()
const router = useRouter()
const open = (id: string, unlocked: boolean) => { if (unlocked) router.push(`/lesson/${id}`) }
const openChapter = (id: number, unlocked: boolean) => { if (unlocked) router.push(`/chapter/${id}`) }
</script>
<template>
  <div class="level-map">
    <div v-for="ch in chapters" :key="ch.id" class="chapter-block">
      <div class="ch-head"
           :class="{ locked: !store.isChapterUnlocked(ch.id) }"
           @click="openChapter(ch.id, store.isChapterUnlocked(ch.id))">
        <span class="ch-icon">{{ ch.icon }}</span>
        <span class="ch-title">第{{ ch.id }}章 · {{ ch.title }}</span>
        <span class="ch-desc">{{ ch.description }}</span>
        <span class="ch-go">{{ store.isChapterUnlocked(ch.id) ? '▶' : '🔒' }}</span>
      </div>
      <div class="nodes">
        <template v-for="(l, idx) in ch.lessons" :key="l.id">
          <div class="node" :class="{ locked: !store.isLessonUnlocked(l.id) }"
               @click="open(l.id, store.isLessonUnlocked(l.id))">
            <div class="num">{{ l.order }}</div>
            <div class="title">{{ l.title }}</div>
            <div class="stars"><span v-for="i in 3" :key="i" :class="{ on: i <= (store.stars[l.id] ?? 0) }">⭐</span></div>
          </div>
          <div v-if="idx < ch.lessons.length - 1" class="link" />
        </template>
        <div v-if="ch.lessons.length === 0" class="empty">（关卡即将开放）</div>
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
@use '@/styles/variables.scss' as *;
.level-map { max-width: 1100px; margin: 0 auto; }
.chapter-block { margin-bottom: 32px; }
.ch-head { margin-bottom: 12px; cursor: pointer; padding: 8px 4px; border-radius: 6px; transition: .2s; display: flex; align-items: center; flex-wrap: wrap; gap: 4px;
  &:hover { background: $bg-elevated; }
  &.locked { opacity: .4; cursor: not-allowed; &:hover { background: transparent; } }
  .ch-icon { font-size: 22px; } .ch-title { font-size: 16px; color: $accent-cyan; margin: 0 8px; } .ch-desc { font-size: 12px; color: $text-secondary; } .ch-go { margin-left: auto; color: $accent-cyan; } }
.nodes { display: flex; flex-wrap: wrap; align-items: center; gap: 0; }
.node { width: 120px; padding: 12px; background: $bg-base; border: 1px solid $border; border-radius: 8px; text-align: center; cursor: pointer; transition: .2s; &:hover { border-color: $accent-cyan; transform: translateY(-2px); } &.locked { opacity: .35; cursor: not-allowed; &:hover { transform: none; border-color: $border; } } }
.num { width: 28px; height: 28px; line-height: 28px; border-radius: 50%; background: $accent-purple; margin: 0 auto 6px; color: #fff; font-size: 13px; }
.title { font-size: 12px; color: $text-primary; min-height: 32px; }
.stars span { opacity: .2; font-size: 11px; &.on { opacity: 1; } }
.link { width: 28px; height: 2px; background: $border; }
.empty { color: $text-secondary; font-size: 12px; font-style: italic; padding: 12px; }
@media (max-width: 768px) { .nodes { flex-direction: column; } .link { width: 2px; height: 16px; } }
</style>
