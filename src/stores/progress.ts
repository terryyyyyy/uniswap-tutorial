import { defineStore } from 'pinia'
import type { UserProgress } from '@/types'
import { BADGES } from '@/data/badges'
import { chapters } from '@/data/chapters'

const STORAGE_KEY = 'uniswap-v3-progress'
const parseId = (id: string) => { const [c, o] = id.split('-').map(Number); return { chapter: c, order: o } }

export const useProgressStore = defineStore('progress', {
  state: (): UserProgress => ({
    completedLessons: [],
    stars: {},
    badges: [],
    currentChapter: 1,
    currentLesson: 1,
  }),
  getters: {
    totalStars: (s) => Object.values(s.stars).reduce((a, b) => a + b, 0),
    isLessonUnlocked: (s) => (lessonId: string): boolean => {
      const { chapter, order } = parseId(lessonId)
      if (chapter === 1 && order === 1) return true
      if (order > 1) return s.completedLessons.includes(`${chapter}-${order - 1}`)
      const prevCh = chapters.find((c) => c.id === chapter - 1)
      return !!prevCh && prevCh.lessons.every((l) => s.completedLessons.includes(l.id))
    },
    isChapterUnlocked: (s) => (chapterId: number): boolean => {
      if (chapterId === 1) return true
      const prev = chapters.find((c) => c.id === chapterId - 1)
      return !!prev && prev.lessons.every((l) => s.completedLessons.includes(l.id))
    },
    chapterProgress: (s) => (chapterId: number): number => {
      const ch = chapters.find((c) => c.id === chapterId)
      if (!ch) return 0
      return Math.round((ch.lessons.filter((l) => s.completedLessons.includes(l.id)).length / ch.lessons.length) * 100)
    },
  },
  actions: {
    completeLesson(lessonId: string, firstTry: boolean, usedHint: boolean) {
      const earned = firstTry && !usedHint ? 3 : !usedHint ? 2 : 1
      this.stars[lessonId] = Math.max(this.stars[lessonId] ?? 0, earned)
      if (!this.completedLessons.includes(lessonId)) this.completedLessons.push(lessonId)
      const { chapter, order } = parseId(lessonId)
      this.currentChapter = chapter
      this.currentLesson = order
      this.checkBadges()
    },
    checkBadges() {
      for (const b of BADGES) {
        if (!this.badges.includes(b.id) && b.condition(this.$state)) this.badges.push(b.id)
      }
    },
    reset() {
      this.completedLessons = []
      this.stars = {}
      this.badges = []
      this.currentChapter = 1
      this.currentLesson = 1
    },
  },
  persist: { key: STORAGE_KEY },
})
