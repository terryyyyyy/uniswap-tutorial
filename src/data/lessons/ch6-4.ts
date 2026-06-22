import type { Lesson } from '@/types'

export const lesson: Lesson = {
  id: '6-4',
  chapterId: 6,
  order: 4,
  title: '手续费源码解析',
  summary: '解析 _modifyPosition 中的手续费逻辑，理解结算时序与 Position.update。',
  content: `# 手续费源码解析

本关聚焦手续费在合约中的结算时机——主要发生在 \`_modifyPosition\`（mint/burn 共用）和 swap 中。

## _modifyPosition 流程

当 LP mint 或 burn 时，合约先**结算该仓位累积的手续费**，再修改流动性：

\`\`\`
1. 若首次建仓：tick.update 初始化边界，记录 feeGrowthOutside 快照
2. 算 feeGrowthInside = getFeeGrowthInside(tickLower, tickUpper, current, global0, global1)
3. position.update(liquidityDelta, feeGrowthInside0, feeGrowthInside1)
   - 累计 tokensOwed += (inside - last) * L / 2^128
   - 更新 last = inside
   - liquidity += liquidityDelta
4. 更新 tick gross/net、活跃 L
\`\`\`

:::code-ref{id="position-update-source"}
:::

## 关键时序

1. **先结算后改 L**：必须用**旧的 L** 算手续费（旧 L 在场时赚的），再更新 L。若先改 L 会算错；
2. **last 快照**：结算后更新 last，下次只算增量；
3. **tick 初始化时设 outside**：首次用某 tick 时，按当前价设 outside（current 侧 = global，另一侧 = 0），保证后续 getFeeGrowthInside 正确。

## swap 中的手续费

swap 每段产生 feeAmount，累计到 feeGrowthGlobal（按方向）。**不直接给 position**——LP 下次 _modifyPosition 或 collect 时才结算。这就是"惰性"。

## Position.update 详解

\`\`\`solidity
function update(Position.Info _self, int128 liquidityDelta, ...) {
    uint128 liquidityNext = _self.liquidity + liquidityDelta;
    // 用旧 liquidity 算欠款
    tokensOwed0 += mulDiv(feeGrowthInside0 - _self.feeGrowthInside0Last, _self.liquidity, Q128);
    tokensOwed1 += mulDiv(feeGrowthInside1 - _self.feeGrowthInside1Last, _self.liquidity, Q128);
    _self.liquidity = liquidityNext;
    _self.feeGrowthInside0Last = feeGrowthInside0;
    _self.feeGrowthInside1Last = feeGrowthInside1;
}
\`\`\`

:::tip
注意 mulDiv 的取整：手续费给 LP 时**向上取整**（多给 LP 一点 wei），与 swap 取整方向一致（总有利于池子或 LP）。这些微小取整是 V3 精心设计的。
:::

## 小结

- _modifyPosition 先用旧 L 结算 tokensOwed，再改 L；
- last 快照实现增量结算；
- swap 只更新 feeGrowthGlobal，LP 惰性 collect；
- 取整方向有利于 LP/池子。

第 6 章结束。下一章逐行解析核心合约源码。
`,
  sandbox: {
    template: `// 验证：先结算后改 L 的正确性
// 给定旧 L、feeGrowthInside 增量，返回应累计的 tokensOwed
// 可用全局 calculatePositionFee(fgInside, fgLast, liquidity) -> bigint
function solve(fgInside = 1000n, fgLast = 200n, liquidity = 500n) {
  // TODO: 返回 (fgInside - fgLast) * liquidity / 2^128 的结果

  return 0n
}`,
    entryFunction: 'solve',
    hints: [
      'return calculatePositionFee(fgInside, fgLast, liquidity)',
      '增量 = fgInside - fgLast，乘以 L 除以 2^128',
    ],
    validator: 'exact',
    validatorKey: 'ch6-4-owed',
  },
  quiz: [
    {
      type: 'choice',
      question: '_modifyPosition 中，结算手续费与修改 L 的顺序是？',
      options: [
        '先改 L 再结算（用新 L）',
        '先结算再改 L（用旧 L）',
        '同时进行',
        '只改 L 不结算',
      ],
      answer: 1,
      explanation: '必须用旧 L 结算（旧 L 在场时赚的），再更新 L。',
    },
    {
      type: 'choice',
      question: 'swap 产生的手续费何时进入具体 LP 的 tokensOwed？',
      options: [
        'swap 时立即分配到每个 LP',
        'LP 下次 _modifyPosition 或 collect 时惰性结算',
        '每天结算',
        '永不分配',
      ],
      answer: 1,
      explanation: 'swap 只更新 feeGrowthGlobal，LP 操作时用增量算 tokensOwed，惰性结算。',
    },
  ],
  visuals: ['fee-growth-chart'],
}
