import { useProgressStore } from '@/stores/progress'

export function useProgress() {
  const s = useProgressStore()
  return {
    store: s,
    totalStars: s.totalStars,
    isLessonUnlocked: s.isLessonUnlocked,
    isChapterUnlocked: s.isChapterUnlocked,
    chapterProgress: s.chapterProgress,
  }
}
