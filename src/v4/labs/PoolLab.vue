<script setup lang="ts">
import { computed, ref } from 'vue'
import { Grid } from '@element-plus/icons-vue'

const version = ref('v4')
const selected = ref(0)
const pools = {
  v3: [
    { pair: 'WETH / USDC', fee: '0.30%', spacing: 60, hook: '—' },
    { pair: 'WETH / USDC', fee: '0.05%', spacing: 10, hook: '—' },
    { pair: 'DAI / USDC', fee: '0.01%', spacing: 1, hook: '—' },
  ],
  v4: [
    { pair: 'ETH / USDC', fee: '0.30%', spacing: 60, hook: '零地址（无 Hook）' },
    { pair: 'ETH / USDC', fee: '0.30%', spacing: 60, hook: '池子 B 的示例 Hook' },
    { pair: 'DAI / USDC', fee: '0.01%', spacing: 1, hook: '零地址（无 Hook）' },
  ],
}
const current = computed(() => pools[version.value === 'v4' ? 'v4' : 'v3'])
const pool = computed(() => current.value[selected.value]!)
</script>

<template>
  <div class="lab-box">
    <div class="lab-toolbar">
      <div class="segmented" role="group" aria-label="切换协议版本">
        <button type="button" :aria-pressed="version === 'v3'" @click="version = 'v3'">Uniswap v3</button>
        <button type="button" :aria-pressed="version === 'v4'" @click="version = 'v4'">Uniswap v4</button>
      </div>
    </div>
    <div class="pool-network" :class="{ singleton: version === 'v4' }">
      <div class="network-heading"><Grid aria-hidden="true" /> {{ version === 'v4' ? 'PoolManager · 一个合约' : '由 Factory 创建 · 三个独立合约' }}</div>
      <div class="pool-choices" role="group" aria-label="查看池子">
        <button v-for="(item, i) in current" :key="i" type="button" :aria-pressed="selected === i" @click="selected = i">
          <span>池子 {{ ['A', 'B', 'C'][i] }}</span>
          <strong>{{ item.pair }}</strong>
          <span>{{ item.fee }} LP 费率</span>
        </button>
      </div>
    </div>
    <div class="pool-detail" aria-live="polite">
      <strong>{{ version === 'v4' ? '池标识 PoolKey' : '池合约配置' }}</strong>
      <dl class="metrics">
        <div><dt>资产对</dt><dd>{{ pool.pair }}</dd></div>
        <div><dt>LP 费率</dt><dd>{{ pool.fee }}</dd></div>
        <div><dt>Tick 间距</dt><dd>{{ pool.spacing }}</dd></div>
        <div v-if="version === 'v4'"><dt>Hook</dt><dd>{{ pool.hook }}</dd></div>
      </dl>
    </div>
  </div>
</template>
