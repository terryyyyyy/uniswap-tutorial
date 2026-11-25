<script setup lang="ts">
import { ElCard } from 'element-plus'

defineProps<{ title: string; description: string }>()
</script>

<template>
  <el-card class="task">
    <div class="t">🎯 {{ title }}</div>
    <div class="d">{{ description }}</div>
  </el-card>
</template>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;
.task { margin-bottom: 16px; }
.t { font-weight: 600; color: $accent-cyan; }
.d { color: $text-secondary; font-size: 14px; margin-top: 4px; }
</style>
