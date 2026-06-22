import type { Lesson } from '@/types'

export const lesson: Lesson = {
  id: '4-3',
  chapterId: 4,
  order: 3,
  title: '移除流动性与领取（burn / collect）',
  summary: '理解 burn 减少流动性、collect 领取累计手续费的流程，以及 tokensOwed 的累计机制。',
  content: `# 移除流动性与领取

移除流动性分两步：**burn** 减少活跃流动性并取出本金，**collect** 领取累计的未领取手续费。两者分离，让 LP 灵活控制。

## burn：减少流动性

burn(tickLower, tickUpper, amount) 减少仓位的 $L$：

1. 计算减少的 $L$ 对应的代币数量（用 getAmountsForLiquidity）；
2. 反向更新 tick（net/gross 减）、position.liquidity 减、若区间含当前价则 pool.liquidity -= L；
3. 把应退还的本金累加到 position.tokensOwed0/1（注意：**不直接转账**，而是记入欠款）。

:::tip
burn 只"声明"减少流动性并把本金记入 tokensOwed，真正转出代币需要再调 collect。这种"两步走"让多个操作可批量结算，省 gas。
:::

## collect：领取代币

collect 把 tokensOwed0/1 转给指定收款人（可不同于 owner）。它处理：

- burn 退回的本金；
- 累计未领的手续费（由 feeGrowthInside 增量计算得出，见第 6 章）。

两者都先记入 tokensOwed，collect 一次性转出。

## 手续费的增量计算

每次 _modifyPosition（mint/burn）时，合约都会：

$$
\\text{tokensOwed} += (\\text{feeGrowthInside}_\\text{now} - \\text{feeGrowthInside}_\\text{last}) \\times L_{\\text{position}} / 2^{128}
$$

即"区间内手续费自上次结算以来的增量 × 仓位流动性"。结算后更新 last 快照。这样手续费**按流动性占比精确分配**，且只在操作时结算（惰性计算，省 gas）。

:::code-ref{id="position-collect"}
:::

## 例

LP 在区间内 mint 了 $L=1000$。一段时间后该区间累计手续费增长 $\\Delta fg = 500$（Q128 单位），则该 LP 应得 $500 \\times 1000 / 2^{128}$，累加到 tokensOwed。LP 调 collect 即可领取。

:::visual{type="position-range"}
:::

## 小结

- burn 减少流动性，本金记入 tokensOwed（不直接转账）；
- collect 把 tokensOwed 转给收款人，一次性领本金 + 手续费；
- 手续费按"feeGrowthInside 增量 × L"惰性结算。

下一关讲 NFT 仓位与外围合约 NPM。
`,
  sandbox: {
    template: `// 模拟 collect：position 有未领取的 tokensOwed0/1
// 返回应领取的数量（直接返回传入的欠款）
function solve(tokensOwed0 = 500n, tokensOwed1 = 300n) {
  // TODO: 返回 { amount0: tokensOwed0, amount1: tokensOwed1 }
  // collect 后 tokensOwed 清零（此处只返回领取额）

  return { amount0: 0n, amount1: 0n }
}`,
    entryFunction: 'solve',
    hints: [
      '直接 return { amount0: tokensOwed0, amount1: tokensOwed1 }',
    ],
    validator: 'exact',
    validatorKey: 'ch4-3-collect',
  },
  quiz: [
    {
      type: 'choice',
      question: 'burn 操作后，退还的本金会怎样？',
      options: [
        '立刻转账给 owner',
        '记入 position.tokensOwed，需 collect 才转出',
        '被池子没收',
        '自动复投',
      ],
      answer: 1,
      explanation: 'burn 把本金记入 tokensOwed，collect 才真正转出，便于批量结算。',
    },
    {
      type: 'choice',
      question: 'LP 应得手续费的计算方式是？',
      options: [
        '按投入代币数量平均分',
        'feeGrowthInside 增量 × 仓位流动性 L',
        '按时间线性分配',
        '由 owner 手动申报',
      ],
      answer: 1,
      explanation: 'tokensOwed += (feeGrowthInside_now - feeGrowthInside_last) × L / 2^128，按流动性占比。',
    },
  ],
  visuals: ['position-range'],
}
