<script setup lang="ts">
import 'element-plus/dist/index.css'
import '@/styles/theme.scss'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'

document.title = 'Uniswap v3 原版教程'
</script>
<template>
  <div class="layout">
    <AppHeader />
    <div class="body"><AppSidebar /><main class="content"><router-view /></main></div>
  </div>
</template>
<style scoped lang="scss">
.layout { display: flex; flex-direction: column; height: 100%; }
.body { flex: 1; display: flex; overflow: hidden; }
.content { flex: 1; overflow-y: auto; padding: 24px; }
@media (max-width: 768px) { .content { padding: 12px; } }
</style>
