<script setup lang="ts">
import { computed, ref } from 'vue'
import { CopyDocument, TopRight } from '@element-plus/icons-vue'
import type { LessonId } from '../course'
import FlowStepper from '../labs/FlowStepper.vue'
import ImplementationLab from './ImplementationLab.vue'
import type { ImplementationLesson } from './course'
import { coreCommit, peripheryCommit } from './model'

const props = defineProps<{ id: LessonId; lesson: ImplementationLesson }>()
const step = ref(0)
const current = computed(() => props.lesson.steps[step.value]!)
const command = computed(() => `forge test --root solidity-lab --match-test ${props.lesson.foundry} -vvvv`)
const copyStatus = ref('')

async function copy() {
  try {
    await navigator.clipboard.writeText(command.value)
    copyStatus.value = '已复制'
  } catch {
    copyStatus.value = '请选中命令并手动复制'
  }
}
</script>

<template>
  <section class="lab-panel implementation-trace" aria-labelledby="trace-heading">
    <p class="section-label">源码调用链</p>
    <h2 id="trace-heading">逐步阅读实现</h2>
    <p class="lab-instruction">{{ lesson.invariant }}</p>
    <FlowStepper v-model="step" :steps="lesson.steps" :interval="9500">
      <div class="source-row">
        <strong>{{ current.location }}</strong>
        <a :href="current.source" target="_blank" rel="noopener noreferrer">源码 <TopRight aria-hidden="true" /></a>
      </div>
      <p>{{ current.explanation }}</p>
      <pre class="solidity-code"><code>{{ current.code }}</code></pre>
    </FlowStepper>
    <div class="source-revisions" aria-label="源码版本">
      <span>Core <code>{{ coreCommit.slice(0, 8) }}</code></span>
      <span>Periphery <code>{{ peripheryCommit.slice(0, 8) }}</code></span>
    </div>
  </section>
  <section class="lab-panel implementation-exercise" aria-labelledby="exercise-heading">
    <p class="section-label">交互实验</p>
    <h2 id="exercise-heading">{{ lesson.exercise.title }}</h2>
    <p class="lab-instruction">{{ lesson.exercise.instruction }}</p>
    <ImplementationLab :id="id" />
  </section>
  <section class="lab-panel implementation-exercise" aria-labelledby="foundry-heading">
    <p class="section-label">Foundry 实操</p>
    <h2 id="foundry-heading">在本地 EVM 验证</h2>
    <p class="lab-instruction">在项目根目录首次运行 <code>npm run solidity:setup</code>，之后执行下方命令。测试使用固定版本的 PoolManager 和 V4Router，可用详细 trace 对照上面的调用链。</p>
    <div class="command-row">
      <pre class="solidity-code"><code>{{ command }}</code></pre>
      <button type="button" class="button button-ghost" @click="copy"><CopyDocument aria-hidden="true" /> 复制命令</button>
    </div>
    <p class="lab-instruction practice-instruction">{{ lesson.practice }}</p>
    <p v-if="copyStatus" class="copy-status" role="status">{{ copyStatus }}</p>
  </section>
</template>
