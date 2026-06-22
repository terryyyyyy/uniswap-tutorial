<script setup lang="ts">
defineProps<{ type: string }>()

// Chunk 7 将用真实可视化组件替换占位。当前按 type 给出标签。
const labels: Record<string, string> = {
  'reserve-curve': 'x-y 储备曲线',
  'slippage-curve': '滑点曲线',
  'liquidity-chart': '流动性分布图',
  'comparison-panel': 'V2/V3 对比面板',
  'price-range-slider': '价格区间滑块',
  'tick-axis': 'Tick 数轴',
  'position-range': '仓位区间',
  'swap-animation': 'Swap 执行动画',
  'fee-growth-chart': '手续费增长曲线',
  'lp-pie-chart': 'LP 收益饼图',
  'flow-diagram': '合约调用流程图',
}
</script>

<template>
  <div class="visual-embed">
    <div class="placeholder">📊 {{ labels[type] ?? type }}（可视化组件）</div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;
.visual-embed { margin-bottom: 16px; }
.placeholder {
  padding: 24px;
  background: $bg-base;
  border: 1px dashed $border;
  border-radius: 8px;
  text-align: center;
  color: $text-secondary;
  font-size: 14px;
}
</style>
