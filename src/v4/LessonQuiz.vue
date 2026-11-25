<script setup lang="ts">
import { computed, ref, useId } from 'vue'
import { CircleCheck, InfoFilled } from '@element-plus/icons-vue'
import type { Lesson } from './course'

const props = defineProps<{ quiz: Lesson['quiz']; completed: boolean; label: string }>()
const headingId = useId()
const emit = defineEmits<{ passed: [] }>()
const selected = ref<number | null>(null)
const checked = ref<number | null>(null)
const correct = computed(() => checked.value === props.quiz.answer)

function checkAnswer() {
  if (selected.value === null) return
  checked.value = selected.value
  if (correct.value) emit('passed')
}
</script>

<template>
  <section class="quiz-panel" :aria-labelledby="headingId">
    <p :id="headingId" class="section-label">{{ label }}</p>
    <form @submit.prevent="checkAnswer">
      <fieldset :disabled="correct">
        <legend>{{ quiz.question }}</legend>
        <label
          v-for="(choice, index) in quiz.choices" :key="choice"
          class="quiz-option"
          :class="{ selected: selected === index, correct: correct && checked === index, incorrect: !correct && checked === index }"
        >
          <input v-model="selected" type="radio" :value="index" name="answer" @change="checked = null" />
          <span>{{ choice }}</span>
        </label>
      </fieldset>
      <div role="status">
        <p v-if="checked !== null" class="quiz-feedback" :class="correct ? 'is-positive' : 'is-warning'">
          <component :is="correct ? CircleCheck : InfoFilled" aria-hidden="true" />
          {{ correct ? quiz.explanation : `再试一次。${quiz.hint}` }}
        </p>
      </div>
      <div class="quiz-actions">
        <button v-if="!correct" type="submit" class="button button-primary" :disabled="selected === null || checked !== null">检查答案</button>
        <span v-if="completed" class="is-positive completion-label"><CircleCheck aria-hidden="true" /> 已通过</span>
      </div>
    </form>
  </section>
</template>
