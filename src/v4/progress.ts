import { defineStore } from 'pinia'
import { lessons } from './course'

export const implementationAnchor = '#implementation'
type LessonSection = 'application' | 'implementation'

export const useCourseProgress = defineStore('v4Progress', {
  state: () => ({
    completed: [] as string[],
    lastLesson: '',
    implementationCompleted: [] as string[],
    lastImplementationLesson: '',
    lastTopic: '',
  }),
  getters: {
    done: (state) => (section: LessonSection) => section === 'application' ? state.completed : state.implementationCompleted,
    completedTopics: (state) => lessons.filter(({ id }) => state.completed.includes(id) && state.implementationCompleted.includes(id)).map(({ id }) => id),
    hasStarted: (state) => Boolean(
      state.lastTopic || state.lastLesson || state.lastImplementationLesson || state.completed.length || state.implementationCompleted.length,
    ),
    resumeTarget(): { id: string; hash: string } {
      const unfinished = lessons.filter(({ id }) => !this.completedTopics.includes(id))
      const recent = this.lastTopic ? [this.lastTopic] : [this.lastLesson, this.lastImplementationLesson]
      const current = (recent.map(id => unfinished.find(lesson => lesson.id === id)).find(Boolean) ?? unfinished[0] ?? lessons[0])!
      const implementationNext = this.completed.includes(current.id) && !this.implementationCompleted.includes(current.id)
      return { id: current.id, hash: implementationNext ? implementationAnchor : '' }
    },
  },
  actions: {
    visit(id: string) {
      this.lastTopic = id
    },
    complete(id: string, section: LessonSection) {
      const completed = this.done(section)
      if (!completed.includes(id)) completed.push(id)
    },
  },
  persist: { key: 'uniswap-v4-progress' },
})
