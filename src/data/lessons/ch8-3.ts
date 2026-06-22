import type { Lesson } from '@/types'

export const lesson: Lesson = {
  id: '8-3',
  chapterId: 8,
  order: 3,
  title: 'Quoter 与 Lens',
  summary: '理解 Quoter 用 staticcall 估算 swap 输出，以及 Lens 合约查询链上数据。',
  content: `# Quoter 与 Lens

用户 swap 前想知道"输入 X 能换多少 Y"。直接调 Pool.swap 会真执行（改状态、要转账）。\`Quoter\` 合约解决：**只报价不执行**。

## Quoter.quoteExactInputSingle

\`\`\`solidity
function quoteExactInputSingle(...) returns (uint256 amountOut)
\`\`\`

内部实际调 Pool.swap，但用 \`try/catch\` + 在 callback 里 revert 把执行回滚——只拿到计算出的 amountOut 而不落状态。前端用 \`staticcall\`（只读）调 Quoter，不花 gas、不改链。

:::tip
Quoter 的精髓：用 revert 把"模拟 swap"的结果带出来，链上状态零变化。它不是 view 函数（因为内部 revert），但用 staticcall 调用等价于只读。
:::

## Lens 合约

V3 没有统一的 "Lens"，但有多个只读辅助库/合约：

- \`PoolTicksCounter\`：数某价格区间内有多少已初始化 tick（辅助 Quoter 估算跨 tick）；
- \`LiquidityAmounts\`：L ↔ amount0/amount1 换算（第 2 章已用）；
- \`PositionValue\`：估算某 NFT 仓位的当前价值；
- \`OracleLibrary\`：读 TWAP 预言机。

这些是纯查询/数学，不交易，帮前端与集成方获取链上状态。

## 小结

- Quoter 用 revert + staticcall 实现"报价不执行"；
- Lens 系列库提供 tick 计数、L 换算、仓位估值、预言机读取等只读能力；
- 前端集成靠这些拿到展示数据。

下一关是毕业项目，综合应用。
`,
  sandbox: {
    template: `// 模拟 Quoter：估算 swap 输出而不改状态
function solve() {
  // TODO: 创建池+mint 后，调用 swap 拿 amountOut
  // 真实 Quoter 用 revert 回滚，这里简化为直接读 swap 结果
  // 返回 amountOut（bigint）

  return 0n
}`,
    entryFunction: 'solve',
    hints: [
      'p = createPool("A","B",3000); p.initialize(2n**96n); p.mint("lp",-600,600,1000000n*10n**18n,1000000n*10n**18n); return p.swap(10n*10n**18n,true).amountOut',
      '返回 swap 的 amountOut',
    ],
    validator: 'exact',
    validatorKey: 'ch8-3-quote',
  },
  quiz: [
    {
      type: 'choice',
      question: 'Quoter 如何实现"报价不执行"？',
      options: [
        '不调 Pool.swap',
        '内部调 Pool.swap 但用 try/catch + callback revert 回滚状态，用 staticcall 调用',
        '缓存历史价格',
        '用预言机',
      ],
      answer: 1,
      explanation: 'Quoter 实际执行 swap 计算，但在 callback revert 把状态回滚，staticcall 保证只读。',
    },
    {
      type: 'choice',
      question: 'LiquidityAmounts 库的作用是？',
      options: [
        '报价 swap',
        'L 与 amount0/amount1 的换算',
        '读预言机',
        '部署池子',
      ],
      answer: 1,
      explanation: 'LiquidityAmounts 提供 L↔代币数量的换算（getLiquidityForAmounts 等）。',
    },
  ],
  visuals: ['flow-diagram'],
}
