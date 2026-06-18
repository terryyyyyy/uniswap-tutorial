// 源码片段：从 ../v3-core 摘录关键函数为字符串，供 CodeRef 组件高亮展示
// 在 Chunk 8 内容编写时按需填充

export interface Snippet {
  id: string
  file: string
  lines: [number, number]
  code: string
  lang: 'solidity'
}

export const SNIPPETS: Record<string, Snippet> = {}
// Chunk 8 按需填充：
// computeSwapStep, getSqrtRatioAtTick, getAmount0Delta, getAmount1Delta,
// tick.update, tick.cross, tick.getFeeGrowthInside, position.update,
// pool.swap, pool.mint, pool.initialize, factory.createPool,
// SwapRouter.exactInputSingle, NPM.mint
