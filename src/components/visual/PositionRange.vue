<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps<{ tickLower?: number; tickUpper?: number; currentTick?: number; label?: string }>()
const lower = computed(() => props.tickLower ?? -600)
const upper = computed(() => props.tickUpper ?? 600)
const current = computed(() => props.currentTick ?? 0)
const pad = 100
const minT = computed(() => Math.min(lower.value, current.value) - pad)
const maxT = computed(() => Math.max(upper.value, current.value) + pad)
const left = computed(() => ((lower.value - minT.value) / (maxT.value - minT.value)) * 100)
const width = computed(() => ((upper.value - lower.value) / (maxT.value - minT.value)) * 100)
const curPct = computed(() => ((current.value - minT.value) / (maxT.value - minT.value)) * 100)
</script>
<template>
  <div class="pos-range">
    <div class="track">
      <div class="bar" :style="{ left: left + '%', width: width + '%' }">{{ label ?? '仓位' }}</div>
      <div class="cur" :style="{ left: curPct + '%' }" />
    </div>
    <div class="labels"><span>tick {{ lower }}</span><span>当前 {{ current }}</span><span>tick {{ upper }}</span></div>
  </div>
</template>
<style scoped lang="scss">
@use '@/styles/variables.scss' as *;
.pos-range { padding: 16px 0; }
.track { position: relative; height: 32px; background: $bg-deep; border-radius: 16px; border: 1px solid $border; }
.bar { position: absolute; top: 2px; height: 28px; background: rgba(45,212,191,.25); border: 1px solid $accent-cyan; border-radius: 14px; color: $accent-cyan; font-size: 12px; line-height: 28px; text-align: center; }
.cur { position: absolute; top: -4px; width: 2px; height: 40px; background: $accent-orange; }
.labels { display: flex; justify-content: space-between; margin-top: 8px; font-size: 11px; color: $text-secondary; }
</style>
