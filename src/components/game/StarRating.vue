<script setup lang="ts">defineProps<{ stars: number; max?: number }>()</script>
<template>
  <div class="stars"><span v-for="i in (max ?? 3)" :key="i" :class="{ on: i <= stars }">⭐</span></div>
</template>
<style scoped lang="scss">
.stars span { opacity: .25; &.on { opacity: 1; animation: pop-in .4s; } }
@keyframes pop-in { 0% { transform: scale(0); } 60% { transform: scale(1.2); } 100% { transform: scale(1); } }
</style>
