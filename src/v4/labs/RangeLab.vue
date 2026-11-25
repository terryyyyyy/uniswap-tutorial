<script setup lang="ts">
import { computed, ref } from 'vue'
import { rangePresets, rangeState } from '../simulation'

const min = 1500
const max = 2500
const price = ref(2000)
const preset = ref(1)
const range = computed(() => rangePresets[preset.value]!)
const percentAt = (value: number) => (value - min) / (max - min) * 100
const state = computed(() => rangeState(price.value, range.value.lower, range.value.upper))
const format = (value: number) => value.toLocaleString('en-US')
</script>

<template>
  <div class="lab-box">
    <div class="lab-toolbar">
      <div class="segmented" role="group" aria-label="选择价格区间">
        <button v-for="(item, i) in rangePresets" :key="item.label" type="button" :aria-pressed="preset === i" @click="preset = i">{{ item.label }}</button>
      </div>
      <span class="range-caption">{{ format(range.lower) }}–{{ format(range.upper) }} USDC</span>
    </div>
    <div class="range-viz" aria-hidden="true">
      <span class="range-band" :class="{ muted: state !== 'active' }" :style="{ left: percentAt(range.lower) + '%', right: (100 - percentAt(range.upper)) + '%' }"></span>
      <span class="range-marker" :style="{ left: percentAt(price) + '%' }"></span>
    </div>
    <div class="range-labels"><span>1,500</span><span>2,000</span><span>2,500</span></div>
    <div class="control-heading range-control">
      <label for="simulated-price">当前 ETH 价格</label>
      <output id="price-value" for="simulated-price">{{ format(price) }} USDC</output>
    </div>
    <input id="simulated-price" v-model.number="price" type="range" class="lab-range" :min="min" :max="max" step="25" :aria-valuetext="`${price} USDC`" />
    <p class="lab-result" :class="state === 'active' ? 'is-positive' : 'is-warning'">
      <strong>{{ state === 'active' ? '区间内' : state === 'below' ? '低于区间' : '达到或超过上界' }}</strong>
      {{ state === 'active' ? '仓位参与成交，可获得新的交易手续费。' : '仓位暂停参与成交，直到价格回到区间内。' }}
    </p>
  </div>
</template>
