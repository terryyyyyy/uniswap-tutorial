<script setup lang="ts">
import { computed } from 'vue'
import ReserveCurve from '@/components/visual/ReserveCurve.vue'
import SlippageCurve from '@/components/visual/SlippageCurve.vue'
import LiquidityChart from '@/components/visual/LiquidityChart.vue'
import ComparisonPanel from '@/components/visual/ComparisonPanel.vue'
import PriceRangeSlider from '@/components/visual/PriceRangeSlider.vue'
import TickVisualizer from '@/components/visual/TickVisualizer.vue'
import PositionRange from '@/components/visual/PositionRange.vue'
import SwapSimulator from '@/components/visual/SwapSimulator.vue'
import FlowDiagram from '@/components/visual/FlowDiagram.vue'
import FeeChart from '@/components/visual/FeeChart.vue'
import LpPieChart from '@/components/visual/LpPieChart.vue'

const props = defineProps<{ type: string }>()
const map: Record<string, any> = {
  'reserve-curve': ReserveCurve,
  'slippage-curve': SlippageCurve,
  'liquidity-chart': LiquidityChart,
  'comparison-panel': ComparisonPanel,
  'price-range-slider': PriceRangeSlider,
  'tick-axis': TickVisualizer,
  'position-range': PositionRange,
  'swap-animation': SwapSimulator,
  'flow-diagram': FlowDiagram,
  'fee-growth-chart': FeeChart,
  'lp-pie-chart': LpPieChart,
}
const Comp = computed(() => map[props.type])
</script>
<template><component :is="Comp" v-if="Comp" /></template>
