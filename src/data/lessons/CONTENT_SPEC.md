# 课程内容编写规范（供各章生成 subagent 参考）

## 文件结构
每关一个 ts 文件 `src/data/lessons/chX-Y.ts`，导出 `lesson: Lesson`：

```typescript
import type { Lesson } from '@/types'

export const lesson: Lesson = {
  id: 'X-Y',
  chapterId: X,
  order: Y,
  title: '关卡标题',
  summary: '一句话概括本关学什么',
  content: `# Markdown 内容...`,
  sandbox: { template: '...', entryFunction: 'solve', hints: ['提示1','提示2'], validator: 'exact', validatorKey: 'chX-Y-xxx' },
  quiz: [ ... ],
  visuals: ['reserve-curve'],
}
```

## 沙盒可用 API（用户代码中可直接调用）
```
Q96                      // 2n**96n 常量
ammSwap(rx, ry, amountIn, zeroForOne)           // V2 swap
ammAddLiquidity(rx, ry, ax, ay)
priceToTick(price) → number
tickToPrice(tick) → number
getSqrtRatioAtTick(tick) → bigint
getTickAtSqrtRatio(sqrtX96) → number
computeSwapStep(sqrtCur, sqrtTarget, liquidity, amountRemaining, feePips)
getLiquidityForAmounts(tickLower, tickUpper, amount0, amount1) → bigint
getAmountsForLiquidity(tickLower, tickUpper, L) → {amount0, amount1}
calculateFeeGrowth(fg, feeAmount, liquidity)
calculateLPShare(totalFee, lps)
calculatePositionFee(fgInside, fgLast, liquidity)
createPool(token0, token1, fee) → PoolSimulator
```
**注意：用户代码用 `function solve() { ... }` 定义入口，必须 return 结果。**
**bigint 字面量在沙盒中可用（Worker 支持 BigInt），写 `1000n` 即可。**

## content Markdown 规范
- 800-1500 字，由浅入深
- 标题用 `#`/`##`/`###`
- 公式用 `$$...$$`（katex）
- 提示框 `:::tip ... :::` / `:::warning ... :::`
- 可视化锚点 `:::visual{type="..."} :::`（实际由 lesson.visuals 在右侧渲染）
- 源码引用 `:::code-ref{id="snippetId"} :::`（snippets 中需有对应条目）
- 代码块 ```solidity / ```typescript

## quiz 规范
- choice: `{ type:'choice', question, options:[...], answer: 索引, explanation }`
- fill: `{ type:'fill', question, answer:'字符串', explanation }`
- code: `{ type:'code', question, explanation, codeSandbox:{ template, entryFunction, validatorKey } }`
  - code 题的校验在 `src/data/lessons/validators.ts` 注册：`validators['chX-Y-xxx'] = (output) => boolean`
  - template 给出函数骨架 + TODO 注释，让用户填关键计算

## visuals（必须与章节表一致）
- Ch1: reserve-curve / slippage-curve / comparison-panel
- Ch2: price-range-slider / liquidity-chart / comparison-panel
- Ch3: tick-axis
- Ch4: position-range
- Ch5: swap-animation
- Ch6: fee-growth-chart / lp-pie-chart
- Ch7: flow-diagram / swap-animation
- Ch8: flow-diagram / swap-animation

## index.ts 注册
每章生成后在 `src/data/lessons/index.ts` 中 import 并 push（主线程统一处理，subagent 只生成单关文件）。
