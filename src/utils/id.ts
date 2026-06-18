// lessonId 解析与生成（'3-2' → {chapter:3, order:2}）

export const parseLessonId = (id: string): { chapter: number; order: number } => {
  const [c, o] = id.split('-').map(Number)
  return { chapter: c, order: o }
}

export const makeLessonId = (chapter: number, order: number): string => `${chapter}-${order}`
