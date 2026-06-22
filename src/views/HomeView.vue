<script setup lang="ts">
import LevelMap from '@/components/game/LevelMap.vue'
import BadgeCard from '@/components/game/BadgeCard.vue'
</script>
<template>
  <div class="home">
    <div class="hero">
      <h1>🦄 Uniswap V3 合约交互式教程</h1>
      <p>由浅入深，从 AMM 基础到 V3 源码逐行解析。8 章 35 关，闯关式学习，交互式实操。</p>
    </div>
    <LevelMap />
    <section class="badge-section">
      <h2>🏆 成就徽章</h2>
      <BadgeCard />
    </section>
  </div>
</template>
<style scoped lang="scss">
@use '@/styles/variables.scss' as *;
.home { max-width: 1100px; margin: 0 auto; }
.hero { text-align: center; padding: 32px 16px; h1 { font-size: 28px; color: $accent-cyan; } p { color: $text-secondary; margin-top: 8px; } }
.badge-section { margin-top: 40px; h2 { color: $text-primary; margin-bottom: 16px; } }
</style>
