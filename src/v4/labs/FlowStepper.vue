<script setup lang="ts">
import { ArrowLeft, ArrowRight, RefreshLeft, VideoPause, VideoPlay } from '@element-plus/icons-vue'
import { computed, onUnmounted, ref, watch } from 'vue'

const props = withDefaults(defineProps<{ steps: readonly { label: string }[]; interval?: number }>(), { interval: 1500 })
const step = defineModel<number>({ required: true })
const playing = ref(false)
const last = computed(() => step.value === props.steps.length - 1)
let timer: ReturnType<typeof setInterval> | undefined

function pause() {
  clearInterval(timer)
  playing.value = false
}

function goTo(index: number) {
  pause()
  step.value = index
}

function togglePlay() {
  if (playing.value) {
    pause()
    return
  }
  if (last.value) step.value = 0
  playing.value = true
  timer = setInterval(() => {
    const next = step.value + 1
    step.value = next
    if (next === props.steps.length - 1) pause()
  }, props.interval)
}

watch(() => props.steps, pause)
onUnmounted(pause)
</script>

<template>
  <div class="flow-stepper">
    <ol class="flow-steps" aria-label="流程步骤" :style="{ '--steps': steps.length }">
      <li v-for="(item, i) in steps" :key="item.label">
        <button type="button" :class="{ done: i < step }" :aria-current="i === step ? 'step' : undefined" @click="goTo(i)">
          <span class="flow-num">{{ i + 1 }}</span>
          <span>{{ item.label }}</span>
        </button>
      </li>
    </ol>
    <div class="flow-content" aria-live="polite" aria-atomic="true">
      <div :key="step" class="flow-detail"><slot /></div>
    </div>
    <div class="flow-controls">
      <button type="button" class="button button-ghost" :disabled="step === 0" @click="goTo(step - 1)"><ArrowLeft aria-hidden="true" /> 上一步</button>
      <button type="button" class="button button-ghost" :disabled="steps.length < 2" @click="togglePlay">
        <component :is="playing ? VideoPause : VideoPlay" aria-hidden="true" /> {{ playing ? '暂停' : '自动播放' }}
      </button>
      <button type="button" class="button button-primary" :disabled="steps.length < 2" @click="goTo(last ? 0 : step + 1)">
        {{ last ? '重来' : '下一步' }} <component :is="last ? RefreshLeft : ArrowRight" aria-hidden="true" />
      </button>
    </div>
  </div>
</template>
