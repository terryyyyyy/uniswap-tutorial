<script setup lang="ts">
import { ref, computed } from 'vue'
const lower = ref(0.8)
const upper = ref(1.2)
const efficiency = computed(() => {
  const range = upper.value - lower.value
  return range > 0 ? 2 / range : 1
})
</script>
<template>
  <div class="slider">
    <div class="range">价格区间: [{{ lower.toFixed(2) }}, {{ upper.toFixed(2) }}]</div>
    <div class="track">
      <input type="range" min="0.01" max="2" step="0.01" v-model.number="lower" />
      <input type="range" min="0.01" max="2" step="0.01" v-model.number="upper" />
    </div>
    <div class="eff">资本效率提升: <b>{{ efficiency.toFixed(2) }}x</b></div>
  </div>
</template>
<style scoped lang="scss">
@use '@/styles/variables.scss' as *;
.slider { background: $bg-base; border: 1px solid $border; border-radius: 8px; padding: 16px; }
.range, .eff { color: $text-secondary; font-size: 14px; margin: 6px 0; b { color: $accent-cyan; } }
.track { display: flex; flex-direction: column; gap: 8px; }
</style>
