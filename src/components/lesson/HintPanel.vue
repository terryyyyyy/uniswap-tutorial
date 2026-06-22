<script setup lang="ts">
import { ref } from 'vue'
import { useSandboxStore } from '@/stores/sandbox'

const props = defineProps<{ hints: string[] }>()
const shown = ref(0)
const store = useSandboxStore()

const reveal = () => {
  if (shown.value < props.hints.length) {
    shown.value++
    store.useHint()
  }
}
</script>

<template>
  <div class="hints" v-if="hints.length">
    <el-button size="small" @click="reveal" :disabled="shown >= hints.length">💡 显示提示</el-button>
    <div v-for="(h, i) in hints.slice(0, shown)" :key="i" class="hint">{{ h }}</div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;
.hint {
  background: rgba(245, 158, 11, .1);
  border-left: 3px solid $accent-orange;
  padding: 8px 12px;
  margin-top: 6px;
  border-radius: 4px;
  font-size: 13px;
}
</style>
