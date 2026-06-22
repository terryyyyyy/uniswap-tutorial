<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps<{ initializedTicks?: number[]; currentTick?: number; tickSpacing?: number; highlightRange?: [number, number] }>()
const initialized = computed(() => props.initializedTicks ?? [-600, -300, 0, 300, 600])
const current = computed(() => props.currentTick ?? 0)
const minT = computed(() => Math.min(...initialized.value, current.value) - 60)
const maxT = computed(() => Math.max(...initialized.value, current.value) + 60)
const ticks = computed(() => {
  const arr: number[] = []; const step = props.tickSpacing ?? 60
  for (let t = minT.value; t <= maxT.value; t += step) arr.push(t)
  return arr
})
const pct = (t: number) => ((t - minT.value) / (maxT.value - minT.value)) * 100
</script>
<template>
  <div class="tick-axis">
    <div class="line">
      <div v-for="t in ticks" :key="t" class="tick"
           :class="{ init: initialized.includes(t), inrange: highlightRange && t >= highlightRange[0] && t <= highlightRange[1] }"
           :style="{ left: pct(t) + '%' }" :title="'tick ' + t" />
      <div class="current" :style="{ left: pct(current) + '%' }">▲<div class="lbl">当前 {{ current }}</div></div>
    </div>
  </div>
</template>
<style scoped lang="scss">
@use '@/styles/variables.scss' as *;
.tick-axis { padding: 24px 0; }
.line { position: relative; height: 40px; border-bottom: 1px solid $border; }
.tick { position: absolute; bottom: 0; width: 2px; height: 10px; background: $border; &.init { height: 18px; background: $accent-cyan; } &.inrange { background: $accent-orange; } }
.current { position: absolute; bottom: 0; transform: translateX(-50%); color: $accent-orange; .lbl { font-size: 11px; white-space: nowrap; } }
</style>
