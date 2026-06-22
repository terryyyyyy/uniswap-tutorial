<script setup lang="ts">
import { computed } from 'vue'
import VChart from './VChart.vue'
const props = defineProps<{ liquidityByTick?: Record<number, bigint>; currentTick?: number }>()
// Default sample data if no props (so it renders standalone)
const sample: Record<number, bigint> = { '-600': 1_000_000n * 10n ** 18n, '-300': 2_000_000n * 10n ** 18n, 0: 3_000_000n * 10n ** 18n, 300: 2_000_000n * 10n ** 18n, 600: 1_000_000n * 10n ** 18n }
const data = computed(() => {
  const src = props.liquidityByTick ?? sample
  return Object.entries(src).map(([tick, liq]) => [Number(tick), Number(liq / 10n ** 18n)] as [number, number])
})
const option = computed(() => ({
  title: { text: '流动性分布', textStyle: { color: '#e6edf3' } },
  tooltip: { trigger: 'axis' },
  xAxis: { type: 'value', name: 'Tick', axisLabel: { color: '#8b949e' } },
  yAxis: { type: 'value', name: '流动性', axisLabel: { color: '#8b949e' } },
  series: [{ type: 'bar', data: data.value, itemStyle: { color: '#2dd4bf' } },
    { type: 'line', markLine: props.currentTick != null ? { data: [{ xAxis: props.currentTick }], lineStyle: { color: '#f59e0b' }, label: { formatter: '当前' } } : undefined }],
}))
</script>
<template><VChart :option="option" /></template>
