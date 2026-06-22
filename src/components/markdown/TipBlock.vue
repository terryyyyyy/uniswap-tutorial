<script setup lang="ts">defineProps<{ kind: 'tip' | 'warning' }>()</script>

<template>
  <div :class="kind"><slot /></div>
</template>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;
.tip { background: rgba(45, 212, 191, .1); border-left: 3px solid $accent-cyan; padding: 10px 14px; border-radius: 4px; margin: 12px 0; }
.warning { background: rgba(245, 158, 11, .1); border-left: 3px solid $accent-orange; padding: 10px 14px; border-radius: 4px; margin: 12px 0; }
</style>
