<script setup lang="ts">
import { useProgressStore } from '@/stores/progress'
import { storeToRefs } from 'pinia'
const { totalStars, badges } = storeToRefs(useProgressStore())
</script>
<template>
  <header class="app-header">
    <div class="brand">🦄 Uniswap V3 合约教程</div>
    <div class="stats"><span>⭐ {{ totalStars }}</span><span>🏆 {{ badges.length }}</span></div>
  </header>
</template>
<style scoped lang="scss">
@use '@/styles/variables.scss' as *;
.app-header { height: 60px; display: flex; align-items: center; justify-content: space-between; padding: 0 24px; background: $bg-base; border-bottom: 1px solid $border; }
.brand { font-size: 18px; font-weight: 600; color: $accent-cyan; }
.stats span { margin-left: 16px; color: $text-secondary; }
</style>
