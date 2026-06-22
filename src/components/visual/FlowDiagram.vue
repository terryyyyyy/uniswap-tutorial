<script setup lang="ts">
const flow = ['Factory.createPool', 'Pool.initialize', 'Pool.mint', 'Pool.swap', 'Pool.collect']
</script>
<template>
  <div class="flow-diagram">
    <div v-for="(f, i) in flow" :key="f" class="step">
      <div class="node">{{ f }}</div>
      <div class="arrow" v-if="i < flow.length - 1">→</div>
    </div>
  </div>
</template>
<style scoped lang="scss">
@use '@/styles/variables.scss' as *;
.flow-diagram { display: flex; flex-wrap: wrap; align-items: center; gap: 4px; }
.step { display: flex; align-items: center; }
.node { padding: 10px 14px; background: $bg-base; border: 1px solid $accent-cyan; border-radius: 6px; color: $accent-cyan; font-family: $code-font; font-size: 12px; }
.arrow { color: $text-secondary; padding: 0 6px; }
</style>
