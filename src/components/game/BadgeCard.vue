<script setup lang="ts">
import { BADGES } from '@/data/badges'
import { useProgressStore } from '@/stores/progress'
const store = useProgressStore()
</script>
<template>
  <div class="badges">
    <div v-for="b in BADGES" :key="b.id" class="badge" :class="{ earned: store.badges.includes(b.id) }">
      <div class="icon">{{ b.icon }}</div>
      <div class="name">{{ b.name }}</div>
      <div class="desc">{{ b.desc }}</div>
    </div>
  </div>
</template>
<style scoped lang="scss">
@use '@/styles/variables.scss' as *;
.badges { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 12px; }
.badge { padding: 14px; background: $bg-base; border: 1px solid $border; border-radius: 8px; text-align: center; opacity: .4; filter: grayscale(1); transition: .3s; &.earned { opacity: 1; filter: none; border-color: $accent-cyan; } }
.icon { font-size: 28px; } .name { font-size: 13px; color: $text-primary; margin: 4px 0; } .desc { font-size: 11px; color: $text-secondary; }
</style>
