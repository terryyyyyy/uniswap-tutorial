<script setup lang="ts">
import { computed } from 'vue'
import VChart from './VChart.vue'
import { PoolSimulator } from '@/simulations/pool'
import { Q96 } from '@/constants/uniswap'
const points = computed(() => {
  const pool = new PoolSimulator('A', 'B', 3000)
  pool.initialize(Q96)
  pool.mint('lp', -600, 600, 1_000_000n * 10n ** 18n, 1_000_000n * 10n ** 18n)
  const data: [number, number][] = []
  for (let i = 1; i <= 20; i++) {
    pool.swap(1_000n * 10n ** 18n, i % 2 === 0)
    data.push([i, Number(pool.s.feeGrowthGlobal0X128 / (Q96 << 32n))])
  }
  return data
})
const option = computed(() => ({
  title: { text: 'feeGrowth 累积', textStyle: { color: '#e6edf3' } },
  xAxis: { name: 'Swap 次数', type: 'value', axisLabel: { color: '#8b949e' } },
  yAxis: { type: 'value', axisLabel: { color: '#8b949e' } },
  tooltip: { trigger: 'axis' },
  series: [{ type: 'line', data: points.value, smooth: true, lineStyle: { color: '#4ade80' }, areaStyle: { opacity: .2 } }],
}))
</script>
<template><VChart :option="option" /></template>
