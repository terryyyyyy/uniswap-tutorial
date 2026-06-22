import type { Lesson } from '@/types'

export const lesson: Lesson = {
  id: '8-2',
  chapterId: 8,
  order: 2,
  title: 'NonfungiblePositionManager',
  summary: '理解 NPM 的 mint/increaseLiquidity/decreaseLiquidity/collect 完整仓位操作。',
  content: `# NonfungiblePositionManager

NPM 是 LP 端的外围合约，用 ERC721 管理仓位（第 4-4 关已介绍角色）。本关详述其四大方法。

## mint

\`\`\`solidity
function mint(MintParams params) returns (uint256 tokenId, uint128 liquidity, uint256 amount0, uint256 amount1)
\`\`\`

params：token0/1、fee、tickLower/Upper、amount0Desired/1Desired、amount0Min/1Min（滑点保护）、recipient、deadline。

流程：

1. 算池地址；
2. 以 NPM 为 owner 调 Pool.mint（核心池记 NPM 为 LP）；
3. callback 里 NPM 转入用户的 token0/1；
4. 铸造新 tokenId，记录 (pool, tickLower, tickUpper)；
5. 发 NFT 给 recipient。

## increaseLiquidity

向已有 tokenId 仓位追加流动性：调 Pool.mint（同 owner 同区间累加），转入额外代币。

## decreaseLiquidity

减少仓位流动性：调 Pool.burn，退回本金记入 tokensOwed（不直接转账）。

## collect

领取该 tokenId 的 tokensOwed（本金退回 + 手续费），转给指定收款人。

:::code-ref{id="npm-methods"}
:::

:::visual{type="flow-diagram"}
:::

## 滑点保护

mint/increaseLiquidity 的 \`amountMin\` 参数：实际投入若低于 min（价格在交易确认期间移动了），revert。这防矿工延迟打包导致 LP 在不利价格建仓。

## 小结

- mint 建仓铸 NFT；increaseLiquidity 追加；decreaseLiquidity 减少记欠款；collect 领取；
- NPM 以自己为 Pool 的 owner，用户通过 NFT 间接持有；
- amountMin 提供滑点保护。

下一关讲 Quoter 与 Lens 查询。
`,
  sandbox: {
    template: `// 模拟 NPM.mint：建仓并返回 tokenId 与流动性
function solve() {
  // TODO: createPool + initialize + mint，返回 { tokenId: 1, liquidity: bigint }
  // 用 createPool 模拟，tokenId 简化为 1

  return { tokenId: 1, liquidity: 0n }
}`,
    entryFunction: 'solve',
    hints: [
      'p = createPool("A","B",3000); p.initialize(2n**96n); const m = p.mint("npm",-600,600,1000000n*10n**18n,1000000n*10n**18n); return { tokenId: 1, liquidity: m.liquidity }',
      'mint 返回 { liquidity, amount0, amount1 }',
    ],
    validator: 'exact',
    validatorKey: 'ch8-2-npm',
  },
  quiz: [
    {
      type: 'choice',
      question: 'NPM.mint 时，核心 Pool 看到的 owner 是谁？',
      options: ['用户账户', 'NPM 合约本身', '零地址', 'SwapRouter'],
      answer: 1,
      explanation: 'NPM 以自己为 owner 调 Pool.mint，用户通过 NFT 间接持有仓位。',
    },
    {
      type: 'choice',
      question: 'mint 参数中的 amount0Min/amount1Min 作用是？',
      options: [
        '最低投入门槛',
        '滑点保护：实际投入低于 min 则 revert',
        '手续费',
        'Gas 限制',
      ],
      answer: 1,
      explanation: 'min 参数防矿工延迟打包导致在不利价格建仓。',
    },
  ],
  visuals: ['flow-diagram'],
}
