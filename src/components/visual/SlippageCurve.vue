<script setup lang="ts">
import { computed } from 'vue'
import VChart from './VChart.vue'
import { AMMSimulator } from '@/simulations/amm'
const points = computed(() => {
  const data: [number, number][] = []
  for (let pct = 1; pct <= 100; pct++) {
    const amm = new AMMSimulator(1_000_000n, 1_000_000n)
    const r = amm.swap(BigInt(pct) * 10_000n, true, 0)
    data.push([pct, r.priceImpactBps])
  }
  return data
})
const option = computed(() => ({
  title: { text: '滑点 vs Swap 规模', textStyle: { color: '#e6edf3' } },
  xAxis: { name: 'Swap 占储备 %', type: 'value', axisLabel: { color: '#8b949e' } },
  yAxis: { name: '滑点(bps)', type: 'value', axisLabel: { color: '#8b949e' } },
  tooltip: { trigger: 'axis' },
  series: [{ type: 'line', data: points.value, smooth: true, areaStyle: { opacity: .2 }, lineStyle: { color: '#f59e0b' } }],
}))
</script>
<template><VChart :option="option" /></template>
