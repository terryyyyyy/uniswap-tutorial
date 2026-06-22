import type { Lesson } from '@/types'

export const lesson: Lesson = {
  id: '7-5',
  chapterId: 7,
  order: 5,
  title: '核心合约综合',
  summary: '串联完整流程：createPool → initialize → mint → swap，综合模拟核心合约交互。',
  content: `# 核心合约综合

本关把第 7 章前 4 关串联，模拟 V3 核心合约的完整生命周期：创建池 → 初始化 → 添加流动性 → 执行 swap → 观察状态变化。

## 完整流程

\`\`\`
1. Factory.createPool(token0, token1, fee)
   → 部署新 Pool（CREATE2，地址确定）
2. Pool.initialize(sqrtPriceX96)
   → 设首个价格与 tick（只能一次）
3. Pool.mint(owner, tickLower, tickUpper, amount0, amount1, data)
   → LP 注入流动性：算 L、更新 tick/position、若区间含当前价则活跃 L += L
   → callback：调用方转入 token0/token1
4. Pool.swap(recipient, zeroForOne, amountSpecified, sqrtPriceLimit, data)
   → 主循环分段 swap，跨 tick 调整活跃 L
   → callback：调用方转入输入代币、收输出代币
5. （后续）LP collect 领取手续费
\`\`\`

:::visual{type="flow-diagram"}
:::

## 状态流转

- createPool：池从无到有（地址确定）；
- initialize：slot0 设价，池可交易；
- mint：tick/position 初始化，活跃 L 增；
- swap：slot0.sqrtPriceX96/tick 变，feeGrowthGlobal 累计，可能 cross tick 改活跃 L；
- collect：position.tokensOwed 清零并转出。

## 实操

沙盒里用 \`createPool\` + \`initialize\` + \`mint\` + \`swap\` 完成全流程，返回 swap 结果与最终价格。

:::visual{type="swap-animation"}
:::

## 小结

- 完整流程：createPool → initialize → mint → swap → collect；
- 每步更新特定状态，状态间严格时序；
- 核心合约只管数学与状态，转账靠 callback。

第 7 章结束。下一章（最后一章）讲外围合约。
`,
  sandbox: {
    template: `// 综合模拟：createPool -> initialize -> mint -> swap
function solve() {
  // TODO:
  // 1) createPool('WETH','USDC',3000)
  // 2) initialize(2n**96n)
  // 3) mint('alice', -600, 600, 1000000n*10n**18n, 1000000n*10n**18n)
  // 4) swap(10n*10n**18n, true)
  // 返回 swap 结果

  return null
}`,
    entryFunction: 'solve',
    hints: [
      'p = createPool("WETH","USDC",3000); p.initialize(2n**96n); p.mint("alice",-600,600,1000000n*10n**18n,1000000n*10n**18n); return p.swap(10n*10n**18n, true)',
      '返回对象含 amountIn, amountOut, sqrtPriceX96End, tickEnd, tickCrossed, feeAmount',
    ],
    validator: 'exact',
    validatorKey: 'ch7-5-full',
  },
  quiz: [
    {
      type: 'choice',
      question: 'V3 核心合约的完整生命周期顺序是？',
      options: [
        'mint → createPool → swap → initialize',
        'createPool → initialize → mint → swap',
        'initialize → swap → createPool → mint',
        'swap → mint → initialize → createPool',
      ],
      answer: 1,
      explanation: '先创建池、初始化价格、注入流动性、才能 swap。',
    },
    {
      type: 'choice',
      question: '核心合约 Pool 在 swap/mint 时如何处理代币转账？',
      options: [
        '合约主动 transfer',
        '用 callback 模式，状态更新后让调用方转账',
        '不转账，只记账',
        '由 Factory 转账',
      ],
      answer: 1,
      explanation: '核心合约先更新状态，再 callback 让调用方转账，防重入。',
    },
  ],
  visuals: ['flow-diagram', 'swap-animation'],
}
