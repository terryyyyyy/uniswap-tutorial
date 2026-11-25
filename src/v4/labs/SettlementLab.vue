<script setup lang="ts">
import { computed, ref } from 'vue'
import { settlementAt, settlementSteps } from '../simulation'
import FlowStepper from './FlowStepper.vue'

const step = ref(0)
const skipPayment = ref(false)
const state = computed(() => settlementAt(step.value, skipPayment.value))
const currencies = ['USDC', 'WETH', 'DAI']
</script>

<template>
  <div class="lab-box">
    <div class="toggle-row">
      <label><input v-model="skipPayment" type="checkbox" /> 模拟漏付 USDC</label>
    </div>
    <FlowStepper v-model="step" :steps="settlementSteps">
      <template v-if="state.status === 'reverted'">
        <strong class="is-warning">结算失败 · 交易回滚</strong>
        <p>结算检查时仍欠 100 USDC。回滚会撤销两次兑换和领取 DAI 的操作。</p>
      </template>
      <template v-else>
        <strong :class="{ 'is-positive': state.status === 'settled' }">{{ settlementSteps[step]?.title }}</strong>
        <p>{{ settlementSteps[step]?.description }}</p>
      </template>
    </FlowStepper>
    <div class="ledger">
      <p>{{ state.status === 'reverted' ? '回滚前的净额' : '调用者净额' }}</p>
      <dl>
        <div v-for="(delta, i) in state.deltas" :key="currencies[i]">
          <dt>{{ currencies[i] }}</dt>
          <dd :key="delta" :class="delta > 0 ? 'is-positive' : delta < 0 ? 'is-warning' : ''">{{ delta > 0 ? '+' : '' }}{{ delta }}</dd>
        </div>
      </dl>
      <small>负数 · 应付 <span>正数 · 应收</span></small>
    </div>
  </div>
</template>
