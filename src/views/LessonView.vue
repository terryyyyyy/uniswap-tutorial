<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { lessons } from '@/data/lessons'
import { useProgressStore } from '@/stores/progress'
import { useSandboxStore } from '@/stores/sandbox'
import { getValidator } from '@/data/lessons/validators'
import LessonContent from '@/components/lesson/LessonContent.vue'
import CodeSandbox from '@/components/lesson/CodeSandbox.vue'
import QuizBlock from '@/components/lesson/QuizBlock.vue'
import TaskCard from '@/components/lesson/TaskCard.vue'
import HintPanel from '@/components/lesson/HintPanel.vue'
import StarRating from '@/components/game/StarRating.vue'

const props = defineProps<{ id: string }>()
const router = useRouter()
const store = useProgressStore()
const sandboxStore = useSandboxStore()

const lesson = computed(() => lessons.find((l) => l.id === props.id))
const stage = ref<'lecture' | 'sandbox' | 'quiz'>('lecture')
const lectureDone = ref(false)
const sandboxDone = ref(false)

const onSandboxRun = (success: boolean) => { if (success) sandboxDone.value = true }

const onQuizPass = ({ firstTry }: { firstTry: boolean }) => {
  const usedHint = sandboxStore.hintsUsed > 0
  if (lesson.value) {
    store.completeLesson(lesson.value.id, firstTry, usedHint)
    ElMessage.success('🎉 关卡完成！')
  }
}

const next = () => {
  const [c, o] = props.id.split('-').map(Number)
  router.push(`/lesson/${c}-${o + 1}`)
}

const validator = (key: string, output: unknown) => getValidator(key)(output)
</script>

<template>
  <div class="lesson" v-if="lesson">
    <div class="head">
      <el-button text @click="router.back()">← 返回</el-button>
      <h2>第{{ lesson.chapterId }}章 · 关卡{{ lesson.order }}：{{ lesson.title }}</h2>
      <StarRating :stars="store.stars[lesson.id] ?? 0" />
    </div>
    <el-tabs v-model="stage">
      <el-tab-pane label="📖 知识讲解" name="lecture">
        <LessonContent :lesson="lesson" />
        <el-button type="primary" @click="lectureDone = true; stage = 'sandbox'">进入实操 →</el-button>
      </el-tab-pane>
      <el-tab-pane label="💻 沙盒实操" name="sandbox" :disabled="!lectureDone">
        <TaskCard title="实操任务" :description="lesson.summary" />
        <HintPanel :hints="lesson.sandbox?.hints ?? []" />
        <CodeSandbox v-if="lesson.sandbox" :config="lesson.sandbox" @run="onSandboxRun" />
        <el-button type="primary" :disabled="!sandboxDone" @click="stage = 'quiz'">进入测验 →</el-button>
      </el-tab-pane>
      <el-tab-pane label="✅ 测验验证" name="quiz" :disabled="!sandboxDone">
        <QuizBlock :quizzes="lesson.quiz" :validator="validator" @all-passed="onQuizPass" />
        <el-button
          type="success"
          v-if="store.completedLessons.includes(lesson.id)"
          @click="next"
        >下一关 →</el-button>
      </el-tab-pane>
    </el-tabs>
  </div>
  <div v-else class="not-found">关卡 {{ id }} 不存在</div>
</template>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;
.lesson { max-width: 1100px; margin: 0 auto; }
.head { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; h2 { flex: 1; color: $accent-cyan; } }
.not-found { color: $text-secondary; text-align: center; padding: 60px; }
</style>
