<script setup lang="ts">
import { ElButton } from 'element-plus'
import { ref, watch } from 'vue'
import { useSandbox } from '@/composables/useSandbox'
import type { SandboxConfig } from '@/types'

const props = defineProps<{ config: SandboxConfig }>()
const emit = defineEmits<{ (e: 'run', success: boolean): void }>()

const { code, result, running, run } = useSandbox()
const localCode = ref(props.config.template)

watch(localCode, (c) => { code.value = c }, { immediate: true })

const formatOutput = (o: unknown) => {
  if (o == null) return ''
  if (typeof o === 'bigint') return o.toString() + 'n'
  if (typeof o === 'object') {
    return JSON.stringify(o, (_k, v) => (typeof v === 'bigint' ? v.toString() + 'n' : v), 2)
  }
  return String(o)
}

const onRun = async () => {
  await run(props.config.entryFunction)
  emit('run', !!result.value?.success)
}
</script>

<template>
  <div class="sandbox">
    <div class="toolbar">
      <el-button type="primary" size="small" :loading="running" @click="onRun">▶ 运行</el-button>
      <el-button size="small" @click="localCode = config.template">🔄 重置</el-button>
    </div>
    <textarea v-model="localCode" class="editor" spellcheck="false" />
    <div class="output" v-if="result">
      <div class="status" :class="{ ok: result.success, err: !result.success }">
        {{ result.success ? '✓ 运行成功' : '✗ ' + result.error }}
      </div>
      <pre class="logs" v-if="result.logs.length">{{ result.logs.join('\n') }}</pre>
      <pre class="ret" v-if="result.success">{{ formatOutput(result.output) }}</pre>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;
.sandbox { display: flex; flex-direction: column; gap: 8px; }
.toolbar { display: flex; gap: 8px; }
.editor {
  width: 100%; min-height: 240px;
  background: $bg-deep; color: $text-primary;
  border: 1px solid $border; border-radius: 6px; padding: 12px;
  font-family: $code-font; font-size: 13px; resize: vertical;
}
.output { background: $bg-deep; border: 1px solid $border; border-radius: 6px; padding: 12px; font-family: $code-font; font-size: 13px; }
.status.ok { color: $success; }
.status.err { color: $danger; }
pre { white-space: pre-wrap; word-break: break-all; margin-top: 6px; }
.ret { color: $accent-cyan; }
</style>
