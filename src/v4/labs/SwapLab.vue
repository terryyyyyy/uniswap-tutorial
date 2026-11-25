<script setup lang="ts">
import { computed, ref } from 'vue'
import { ArrowDown, CircleCheck, RefreshLeft } from '@element-plus/icons-vue'
import { quoteEth } from '../simulation'

const amount = ref(500)
const swapped = ref(false)
const quote = computed(() => quoteEth(amount.value))
const dollars = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 })
</script>

<template>
  <div class="swap-grid">
    <div class="swap-tokens">
      <div class="token-row">
        <div><span>你支付</span><strong>{{ dollars.format(amount) }}</strong></div>
        <span class="token-name"><b class="token token-usdc">$</b> USDC</span>
      </div>
      <span class="swap-arrow" :class="{ 'swap-confirmed': swapped }"><ArrowDown aria-hidden="true" /></span>
      <div class="token-row">
        <div><span>预计收到</span><strong>{{ quote.eth.toFixed(4) }}</strong></div>
        <span class="token-name"><b class="token token-eth">♦</b> ETH</span>
      </div>
    </div>
    <div class="swap-controls">
      <div class="control-heading">
        <label for="swap-amount">调整兑换金额</label>
        <button type="button" class="text-button" @click="amount = 500; swapped = false"><RefreshLeft aria-hidden="true" /> 重置</button>
      </div>
      <input id="swap-amount" v-model.number="amount" class="lab-range" type="range" min="100" max="3000" step="50" @input="swapped = false" :aria-valuetext="`${amount} USDC`" />
      <div class="range-labels"><span>100 USDC</span><span>3,000 USDC</span></div>
      <dl class="metrics">
        <div><dt>起始报价</dt><dd>2,000 USDC / ETH</dd></div>
        <div><dt>平均成交价</dt><dd>{{ dollars.format(quote.averagePrice) }} USDC / ETH</dd></div>
        <div><dt>价格影响（扣除手续费）</dt><dd class="accent-text">{{ quote.priceImpact.toFixed(2) }}%</dd></div>
        <div><dt>LP 手续费</dt><dd>{{ quote.fee.toFixed(2) }} USDC</dd></div>
      </dl>
    </div>
  </div>
  <div class="swap-actions">
    <button type="button" class="button button-primary" @click="swapped = true" :disabled="swapped">模拟兑换</button>
    <div role="status">
      <p v-if="swapped" class="is-positive swap-receipt"><CircleCheck aria-hidden="true" /> 已用 {{ dollars.format(amount) }} USDC 换得 {{ quote.eth.toFixed(4) }} ETH</p>
    </div>
  </div>
</template>
