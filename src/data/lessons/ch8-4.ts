import type { Lesson } from '@/types'

export const lesson: Lesson = {
  id: '8-4',
  chapterId: 8,
  order: 4,
  title: '毕业项目',
  summary: '综合应用：配置一个完整交易场景——选 token 对、设区间、mint、swap、查手续费、collect。',
  content: `# 毕业项目 🎓

恭喜来到最后一关！本关综合应用全部所学，模拟一个完整的 V3 交易场景。

## 场景

你是 USDC/WETH 0.3% 池的 LP 与交易者：

1. **建池初始化**：USDC/WETH，0.3% 费率，初始价 1 WETH = 2000 USDC；
2. **添加流动性**：在 $[1900, 2100]$（USDC per WETH）区间注入 100 万 USDC + 对应 WETH；
3. **执行 swap**：用户用 10 WETH 换 USDC（token1→token0 或反向，取决于 token 排序）；
4. **查询手续费**：读取该区间 LP 累计的 feeGrowth；
5. **collect**：LP 领取手续费。

## 你需要综合运用的知识

- 第 1-2 章：AMM 与集中流动性的定价直觉；
- 第 3 章：tick/spacing，价格↔tick 转换；
- 第 4 章：mint/burn/collect 仓位管理；
- 第 5 章：swap 跨 tick 执行；
- 第 6 章：feeGrowth 与 LP 分配；
- 第 7 章：核心合约 createPool/initialize/mint/swap 时序；
- 第 8 章：外围合约封装。

## 实操

在沙盒里完成上述全流程。提示：

- 价格 2000 对应 tick ≈ $\\log_{1.0001} 2000 \\approx 76009$；
- 区间 $[1900, 2100]$ 对应 tick 约 $[75940, 76075]$，对齐 tickSpacing=60；
- 用 \`createPool\` + \`initialize\` + \`mint\` + \`swap\` 完成。

:::visual{type="flow-diagram"}
:::

:::visual{type="swap-animation"}
:::

## 回顾：你学到了什么

完成本教程，你已系统掌握：

1. **AMM 基础**：恒定乘积、滑点、V2 局限；
2. **集中流动性**：价格区间、资本效率、L；
3. **Tick 机制**：离散化、spacing、状态、位图遍历；
4. **仓位管理**：Position 结构、mint/burn/collect、NFT；
5. **Swap 执行**：computeSwapStep、跨 tick、价格影响；
6. **手续费**：feeGrowth、区间分配、惰性结算；
7. **核心合约**：Factory、Pool、slot0、NoDelegateCall；
8. **外围合约**：SwapRouter、NPM、Quoter。

## 小结

V3 的设计哲学：**用复杂换效率**——集中流动性、tick 离散、惰性手续费结算、核心+外围分层。理解了这些，你就能读懂 V3 源码、构建自己的 LP 策略、甚至设计下一代 AMM。

🎉 教程完成！继续探索：阅读 v3-core/v3-periphery 源码、尝试部署到测试网、研究 V4 的 hook 机制。
`,
  sandbox: {
    template: `// 毕业项目：完整交易场景
function solve() {
  // TODO:
  // 1) createPool('USDC','WETH',3000)
  // 2) initialize(初始 sqrtPrice，价格 2000 -> sqrt(2000)*2^96)
  // 3) mint('lp', tickLower, tickUpper, amount0, amount1)  区间约 [75940, 76075]
  // 4) swap(10 WETH worth, 方向)
  // 5) 返回 { amountOut, feeGrowth0, feeGrowth1, tickCrossed }
  // 简化：可用 2n**96n 作初始价（价格1），区间 [-600,600]

  return { amountOut: 0n, feeGrowth0: 0n, feeGrowth1: 0n, tickCrossed: [] }
}`,
    entryFunction: 'solve',
    hints: [
      '简化版：p = createPool("USDC","WETH",3000); p.initialize(2n**96n); p.mint("lp",-600,600,1000000n*10n**18n,1000000n*10n**18n); const r = p.swap(10n*10n**18n,true); return { amountOut: r.amountOut, feeGrowth0: p.s.feeGrowthGlobal0X128, feeGrowth1: p.s.feeGrowthGlobal1X128, tickCrossed: r.tickCrossed }',
      '返回对象含四个字段',
    ],
    validator: 'exact',
    validatorKey: 'ch8-4-grad',
  },
  quiz: [
    {
      type: 'choice',
      question: 'V3 的设计哲学可以概括为？',
      options: [
        '简单优先，牺牲效率',
        '用复杂换效率：集中流动性、tick 离散、惰性结算、分层架构',
        '完全去中心化无合约',
        '只支持稳定币',
      ],
      answer: 1,
      explanation: 'V3 用更高的实现复杂度换取资本效率与 gas 优化。',
    },
    {
      type: 'choice',
      question: '完成本教程后，以下哪项是合理的后续探索？',
      options: [
        '阅读 v3-core/v3-periphery 源码',
        '部署到测试网实操',
        '研究 V4 的 hook 机制',
        '以上都是',
      ],
      answer: 3,
      explanation: '三者都是自然的进阶方向。',
    },
  ],
  visuals: ['flow-diagram', 'swap-animation'],
}
