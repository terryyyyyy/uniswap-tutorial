<script setup lang="ts">
import { ref, computed } from 'vue'
import VChart from './VChart.vue'
const rx = ref(1000000)
const ry = ref(1000000)
const points = computed(() => {
  const data: [number, number][] = []
  for (let i = 1; i <= 100; i++) {
    const x = rx.value * (i / 100) * 2
    data.push([x, (rx.value * ry.value) / x])
  }
  return data
})
const option = computed(() => ({
  title: { text: '恒定乘积曲线 x·y=k', textStyle: { color: '#e6edf3' } },
  xAxis: { name: '储备X', type: 'value', axisLabel: { color: '#8b949e' } },
  yAxis: { name: '储备Y', type: 'value', axisLabel: { color: '#8b949e' } },
  tooltip: { trigger: 'axis' },
  series: [{ type: 'line', data: points.value, smooth: true, lineStyle: { color: '#2dd4bf' } }],
}))
</script>
<template>
  <div class="card">
    <VChart :option="option" />
    <div class="ctrl">
      <label>储备X: <input type="range" min="100000" max="2000000" step="10000" v-model.number="rx" /> {{ rx }}</label>
      <label>储备Y: <input type="range" min="100000" max="2000000" step="10000" v-model.number="ry" /> {{ ry }}</label>
      <div class="k">k = {{ (rx * ry).toLocaleString() }}</div>
    </div>
  </div>
</template>
<style scoped lang="scss">
@use '@/styles/variables.scss' as *;
.card { background: $bg-base; border: 1px solid $border; border-radius: 8px; padding: 12px; }
.ctrl { margin-top: 8px; color: $text-secondary; font-size: 13px; display: flex; flex-direction: column; gap: 6px; label { display: flex; align-items: center; gap: 8px; } .k { color: $accent-cyan; } }
</style>
