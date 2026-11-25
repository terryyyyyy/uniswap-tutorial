<script setup lang="ts">
import { computed, ref } from 'vue'
import FlowStepper from './FlowStepper.vue'

const before = ref(true)
const after = ref(true)
const step = ref(0)
const steps = computed(() => {
  const result = []
  if (before.value) result.push({
    label: 'beforeSwap',
    title: '先检查交易条件',
    description: '假想 Hook 检查这笔交易是否符合池子的规则。条件满足后，才进入核心兑换。',
  })
  result.push({
    label: 'Swap',
    title: '执行核心兑换',
    description: 'PoolManager 根据池子的价格、流动性和费率更新状态，并计算应付与应收。',
  })
  if (after.value) result.push({
    label: 'afterSwap',
    title: '记录兑换后的信息',
    description: '假想 Hook 记录这笔兑换完成后的价格，供后续操作参考。',
  })
  return result
})
</script>

<template>
  <div class="lab-box">
    <div class="toggle-row" role="group" aria-label="选择示例 Hook 回调">
      <label><input v-model="before" type="checkbox" @change="step = 0" /> beforeSwap</label>
      <label><input v-model="after" type="checkbox" @change="step = 0" /> afterSwap</label>
    </div>
    <FlowStepper v-model="step" :steps="steps">
      <strong>{{ steps[step]?.title }}</strong>
      <p>{{ steps[step]?.description }}</p>
    </FlowStepper>
  </div>
</template>
