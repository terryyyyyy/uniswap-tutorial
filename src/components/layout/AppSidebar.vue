<script setup lang="ts">
import { ref } from 'vue'
import { chapters } from '@/data/chapters'
import { useProgressStore } from '@/stores/progress'
import { useRouter } from 'vue-router'
const store = useProgressStore()
const router = useRouter()
const collapsed = ref(false)
const go = (id: number) => { if (store.isChapterUnlocked(id)) router.push(`/chapter/${id}`) }
</script>
<template>
  <nav class="sidebar" :class="{ collapsed }">
    <el-button text @click="collapsed = !collapsed" class="toggle">{{ collapsed ? '☰' : '✕' }}</el-button>
    <div v-for="ch in chapters" :key="ch.id" class="chapter-item"
         :class="{ locked: !store.isChapterUnlocked(ch.id) }"
         @click="go(ch.id)">
      <span class="icon">{{ ch.icon }}</span>
      <span v-if="!collapsed" class="title">第{{ ch.id }}章 {{ ch.title }}</span>
      <span v-if="!collapsed && !store.isChapterUnlocked(ch.id)" class="lock">🔒</span>
    </div>
  </nav>
</template>
<style scoped lang="scss">
@use '@/styles/variables.scss' as *;
.sidebar { width: 240px; padding: 16px 12px; background: $bg-base; border-right: 1px solid $border; transition: width .2s; &.collapsed { width: 56px; } }
.toggle { margin-bottom: 8px; }
.chapter-item { display: flex; align-items: center; gap: 8px; padding: 10px 12px; border-radius: $radius; cursor: pointer; color: $text-primary; margin-bottom: 4px; &:hover { background: $bg-elevated; } &.locked { opacity: .4; cursor: not-allowed; } }
.icon { font-size: 18px; } .title { flex: 1; font-size: 14px; }
@media (max-width: 768px) { .sidebar { width: 56px; .title, .lock { display: none; } } }
</style>
