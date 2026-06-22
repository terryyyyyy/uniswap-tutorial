<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps<{ swapVolume?: bigint }>()
const vol = computed(() => props.swapVolume ?? 1_000_000n * 10n ** 18n)
const result = computed(() => {
  const v2Fee = (vol.value * 30n) / 10000n
  const v3Fee = v2Fee * 5n
  return { v2Fee, v3Fee }
})
const fmt = (v: bigint) => (v / 10n ** 18n).toString()
</script>
<template>
  <div class="cmp">
    <div class="col"><div class="t">V2 全区间</div><div class="v">{{ fmt(result.v2Fee) }}</div></div>
    <div class="col v3"><div class="t">V3 集中 (5x)</div><div class="v">{{ fmt(result.v3Fee) }}</div></div>
  </div>
</template>
<style scoped lang="scss">
@use '@/styles/variables.scss' as *;
.cmp { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.col { background: $bg-base; border: 1px solid $border; border-radius: 8px; padding: 16px; text-align: center; &.v3 { border-color: $accent-cyan; } .t { color: $text-secondary; font-size: 13px; } .v { color: $accent-cyan; font-size: 22px; font-weight: 600; margin-top: 6px; } }
</style>
