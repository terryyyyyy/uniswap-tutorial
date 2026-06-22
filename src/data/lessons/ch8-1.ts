import type { Lesson } from '@/types'

export const lesson: Lesson = {
  id: '8-1',
  chapterId: 8,
  order: 1,
  title: 'SwapRouter',
  summary: '理解 SwapRouter 的 exactInputSingle/exactOutput 与多跳 Path 编码。',
  content: `# SwapRouter

用户不直接调核心 Pool.swap——太底层（要管 callback、转账、价格限制）。外围合约 \`SwapRouter\` 封装成友好接口。

## exactInputSingle

"指定输入量，单池 swap"：

\`\`\`solidity
function exactInputSingle(ExactInputSingleParams params) returns (uint256 amountOut)
\`\`\`

params：tokenIn、tokenOut、fee、recipient、deadline、amountIn、sqrtPriceLimitX96。

流程：

1. 算出池地址（CREATE2，由 tokenIn/Out + fee）；
2. transferFrom 用户转入 tokenIn 到 Router；
3. approve Pool 拿 tokenIn；
4. 调 Pool.swap，回调里 Router 已持有 tokenIn 自动付款；
5. 输出 tokenOut 直接转给 recipient。

## exactInput（多跳）

支持跨多个池的路径，如 USDC → WETH → DAI。路径用一个 bytes 编码：

\`\`\`
[tokenIn, fee, tokenMiddle, fee, tokenOut]
\`\`\`

每段是一个 (token, fee) 对，Router 顺序调每个池的 swap，前一个的输出作后一个的输入。

## exactOutput 系列

\`exactOutputSingle\` / \`exactOutput\`：指定**输出量**，算需要多少输入。与 exactInput 对偶——从路径末端倒推。

:::tip
Router 还处理 deadline（防矿工延迟打包套利）、sqrtPriceLimit（滑点保护）。用户只需关心"换多少、接受多少滑点"。
:::

:::code-ref{id="swap-router"}
:::

:::visual{type="flow-diagram"}
:::

## 小结

- SwapRouter 封装 Pool.swap，处理转账/callback/滑点；
- exactInputSingle 单池，exactInput 多跳（Path 编码）；
- exactOutput 指定输出倒推输入。

下一关讲 NonfungiblePositionManager。
`,
  sandbox: {
    template: `// 模拟 SwapRouter.exactInputSingle：单池 swap
function solve() {
  // TODO: createPool + initialize + mint 后 swap，返回 amountOut
  // 简化：用 createPool 模拟
  // 1) createPool('USDC','WETH',3000); initialize(2n**96n)
  // 2) mint('lp',-600,600,1000000n*10n**18n,1000000n*10n**18n)
  // 3) swap(10n*10n**18n, true) 返回 amountOut

  return 0n
}`,
    entryFunction: 'solve',
    hints: [
      'p = createPool("USDC","WETH",3000); p.initialize(2n**96n); p.mint("lp",-600,600,1000000n*10n**18n,1000000n*10n**18n); return p.swap(10n*10n**18n,true).amountOut',
      '返回 amountOut（bigint）',
    ],
    validator: 'exact',
    validatorKey: 'ch8-1-router',
  },
  quiz: [
    {
      type: 'choice',
      question: 'SwapRouter.exactInputSingle 与 exactInput 的区别？',
      options: [
        '前者单池，后者支持多跳路径',
        '前者指定输出，后者指定输入',
        '前者免费，后者收费',
        '两者完全相同',
      ],
      answer: 0,
      explanation: 'exactInputSingle 单池 swap；exactInput 支持跨多池路径（Path 编码）。',
    },
    {
      type: 'choice',
      question: '多跳路径 Path 如何编码？',
      options: [
        '数组 [tokenIn, tokenOut, fee]',
        'bytes 拼接 [tokenIn, fee, tokenMiddle, fee, tokenOut]',
        'JSON',
        '单独传参每个池',
      ],
      answer: 1,
      explanation: 'Path 用 bytes 紧凑编码 token 与 fee 交替，省 calldata。',
    },
  ],
  visuals: ['flow-diagram'],
}
