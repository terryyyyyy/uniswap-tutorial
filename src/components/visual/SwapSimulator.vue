<script setup lang="ts">
import { ElButton } from 'element-plus'
import { ref } from 'vue'
import { PoolSimulator } from '@/simulations/pool'
import { Q96 } from '@/constants/uniswap'
import { formatSqrtPriceX96 } from '@/utils/format'

const amountStr = ref('10')
const price = ref(1)
const crossedTicks = ref<number[]>([])
const amountOut = ref('0')

const buildPool = () => {
  const pool = new PoolSimulator('WETH', 'USDC', 3000)
  pool.initialize(Q96)
  pool.mint('lp', -600, 600, 1_000_000n * 10n ** 18n, 1_000_000n * 10n ** 18n)
  return pool
}

const run = () => {
  const pool = buildPool()
  const amt = Number(amountStr.value)
  if (!Number.isFinite(amt) || amt <= 0) return
  const amountIn = BigInt(Math.floor(amt)) * 10n ** 18n
  const r = pool.swap(amountIn, true)
  price.value = formatSqrtPriceX96(pool.s.sqrtPriceX96)
  crossedTicks.value = r.tickCrossed
  amountOut.value = (r.amountOut / 10n ** 18n).toString()
}
run()
</script>
<template>
  <div class="swap-sim">
    <div class="ctrl">
      <label>输入 token0: </label>
      <input v-model="amountStr" />
      <el-button @click="run">▶ 模拟 Swap</el-button>
    </div>
    <div class="flow">
      <div class="token in">token0 →</div>
      <div class="pool">Pool<br/>价格 {{ price.toFixed(4) }}<br/>→ token1: {{ amountOut }}</div>
      <div class="token out">→ token1</div>
    </div>
    <div class="ticks" v-if="crossedTicks.length">跨越 tick: {{ crossedTicks.join(', ') }}</div>
  </div>
</template>
<style scoped lang="scss">
@use '@/styles/variables.scss' as *;
.swap-sim { background: $bg-base; border: 1px solid $border; border-radius: 8px; padding: 16px; }
.ctrl { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; input { background: $bg-deep; color: $text-primary; border: 1px solid $border; border-radius: 4px; padding: 4px 8px; font-family: $code-font; font-size: 12px; width: 120px; } }
.flow { display: flex; align-items: center; justify-content: center; gap: 16px; }
.token { padding: 16px 20px; background: $bg-elevated; border-radius: 8px; color: $accent-cyan; font-size: 14px; }
.pool { padding: 24px; background: rgba(167,139,250,.15); border: 1px solid $accent-purple; border-radius: 12px; text-align: center; color: $accent-purple; }
.ticks { margin-top: 12px; font-size: 12px; color: $text-secondary; font-family: $code-font; }
</style>
