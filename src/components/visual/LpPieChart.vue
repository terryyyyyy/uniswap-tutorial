<script setup lang="ts">
import { computed } from 'vue'
import VChart from './VChart.vue'
import { distributeFee } from '@/simulations/fee'
const lps = [{ name: 'LP-Alice', liquidity: 3n }, { name: 'LP-Bob', liquidity: 2n }, { name: 'LP-Carol', liquidity: 5n }]
const shares = computed(() => distributeFee(1000n, lps))
const option = computed(() => ({
  tooltip: { trigger: 'item' },
  legend: { textStyle: { color: '#8b949e' } },
  series: [{ type: 'pie', radius: '60%', data: lps.map((l, i) => ({ name: l.name, value: Number(shares.value[i]) })), itemStyle: { color: ['#2dd4bf', '#f59e0b', '#a78bfa'] } }],
}))
</script>
<template><VChart :option="option" /></template>
