<script setup lang="ts">defineProps<{ percent: number }>()</script>
<template><div class="progress"><div class="bar" :style="{ width: percent + '%' }" /></div></template>
<style scoped lang="scss">
@use '@/styles/variables.scss' as *;
.progress { height: 6px; background: $bg-elevated; border-radius: 3px; overflow: hidden; }
.bar { height: 100%; background: linear-gradient(90deg, $accent-cyan, $accent-purple); transition: width .3s; }
</style>
