<script setup lang="ts">
import { computed, ref } from 'vue'
import { dynamicFee, fixedFee } from '../simulation'

const volatility = ref(30)
const percent = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })
const usdc = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 3 })
const quotes = computed(() => [
  { label: '固定费率池', fee: fixedFee, color: 'fixed' },
  { label: '动态费率池', fee: dynamicFee(volatility.value), color: 'dynamic' },
])
</script>

<template>
  <div class="lab-box">
    <div class="control-heading">
      <label for="volatility">示例市场波动程度</label>
      <output id="volatility-value" for="volatility">{{ volatility }} / 100</output>
    </div>
    <input id="volatility" v-model.number="volatility" class="lab-range" type="range" min="0" max="100" :aria-valuetext="`${volatility} / 100`" />
    <div class="range-labels"><span>平稳</span><span>剧烈波动</span></div>
    <div class="fee-comparison">
      <div v-for="quote in quotes" :key="quote.label" class="fee-card" :class="quote.color">
        <span>{{ quote.label }}</span>
        <strong>{{ percent.format(quote.fee / 10_000) }}%</strong>
        <div class="fee-track" aria-hidden="true"><span :style="{ width: (quote.fee / 80) + '%' }"></span></div>
        <small>支付 {{ usdc.format(quote.fee / 1_000) }} USDC</small>
      </div>
    </div>
  </div>
</template>
