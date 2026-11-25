<script setup lang="ts">
import { ElInput, ElRadio, ElRadioGroup } from 'element-plus'
import { ref } from 'vue'
import type { Quiz } from '@/types'
import CodeSandbox from './CodeSandbox.vue'
import { useSandboxStore } from '@/stores/sandbox'

const props = defineProps<{
  quizzes: Quiz[]
  validator: (key: string, output: unknown) => boolean
}>()
const emit = defineEmits<{ (e: 'allPassed', payload: { firstTry: boolean }): void }>()

const answers = ref<Record<number, string | number>>({})
const results = ref<Record<number, boolean | null>>({})
const firstTryRecord = ref<Record<number, boolean>>({})
const sandboxStore = useSandboxStore()

const markResult = (i: number, ok: boolean) => {
  if (results.value[i] === true) return
  results.value[i] = ok
  if (firstTryRecord.value[i] === undefined) firstTryRecord.value[i] = ok
  if (props.quizzes.every((_, idx) => results.value[idx] === true)) {
    const firstTry = Object.values(firstTryRecord.value).every((v) => v === true)
    emit('allPassed', { firstTry })
  }
}

const check = (i: number) => {
  const q = props.quizzes[i]
  const raw = answers.value[i]
  const ans = raw == null ? '' : String(raw).trim()
  let ok = false
  if (q.type === 'choice') ok = Number(ans) === Number(q.answer)
  else if (q.type === 'fill') ok = ans === String(q.answer)
  markResult(i, ok)
}

// code 题：CodeSandbox run 后读 sandboxStore.result.output 调 validator
const onCodeRun = (i: number, success: boolean) => {
  if (!success) { markResult(i, false); return }
  const q = props.quizzes[i]
  const output = sandboxStore.result?.output
  const ok = q.codeSandbox ? props.validator(q.codeSandbox.validatorKey, output) : false
  markResult(i, ok)
}
</script>

<template>
  <div class="quiz-block">
    <div v-for="(q, i) in quizzes" :key="i" class="quiz-item">
      <div class="q">Q{{ i + 1 }}. {{ q.question }}</div>
      <template v-if="q.type === 'choice'">
        <el-radio-group v-model="answers[i]" @change="check(i)">
          <el-radio v-for="(opt, oi) in (q.options ?? [])" :key="oi" :value="oi">{{ opt }}</el-radio>
        </el-radio-group>
      </template>
      <template v-else-if="q.type === 'fill'">
        <el-input v-model="answers[i]" @blur="check(i)" placeholder="填写答案" />
      </template>
      <template v-else>
        <CodeSandbox
          v-if="q.codeSandbox"
          :config="{ template: q.codeSandbox.template, entryFunction: q.codeSandbox.entryFunction, hints: [], validator: 'exact' }"
          @run="(s: boolean) => onCodeRun(i, s)"
        />
      </template>
      <div
        class="fb"
        v-if="results[i] !== null && results[i] !== undefined"
        :class="{ ok: results[i], no: !results[i] }"
      >
        {{ results[i] ? '✓ 正确' : '✗ 再想想' }} — {{ q.explanation }}
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;
.quiz-item { background: $bg-base; border: 1px solid $border; border-radius: 8px; padding: 14px; margin-bottom: 12px; }
.q { font-weight: 600; margin-bottom: 8px; }
.fb { font-size: 13px; margin-top: 8px; }
.fb.ok { color: $success; }
.fb.no { color: $danger; }
</style>
