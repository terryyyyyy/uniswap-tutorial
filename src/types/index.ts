import type { VisualComponentType } from './visual'

// 沙盒配置：用户可编辑的代码模板 + 校验
export interface SandboxConfig {
  template: string // 预置代码模板
  entryFunction: string // 入口函数名（运行时调用）
  hints: string[] // 提示列表
  validator: 'exact' | 'range' | 'contains'
  expected?: unknown
  // 校验函数 key，运行时由 useSandbox/QuizBlock 按 lessonId 路由到 validators 表
  validatorKey?: string
}

// 测验题目
export interface Quiz {
  type: 'choice' | 'fill' | 'code'
  question: string
  options?: string[] // 选择题选项
  answer: string | number // choice: 选项索引；fill: 字符串答案
  explanation: string
  // code 题专用：沙盒模板 + 入口 + validatorKey
  codeSandbox?: {
    template: string
    entryFunction: string
    validatorKey: string
  }
}

// 单关课程
export interface Lesson {
  id: string // '1-1', '3-2' 等
  chapterId: number
  order: number
  title: string
  summary: string
  content: string // Markdown 教程内容
  sandbox?: SandboxConfig // 纯讲解关可省略
  quiz: Quiz[]
  visuals: VisualComponentType[]
}

// 章节
export interface Chapter {
  id: number
  title: string
  description: string
  icon: string
  lessons: Lesson[]
}

// 用户学习进度（localStorage 持久化）
export interface UserProgress {
  completedLessons: string[]
  stars: Record<string, number> // 每关 0-3 星
  badges: string[]
  currentChapter: number
  currentLesson: number
}
