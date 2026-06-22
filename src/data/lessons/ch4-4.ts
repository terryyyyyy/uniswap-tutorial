import type { Lesson } from '@/types'

export const lesson: Lesson = {
  id: '4-4',
  chapterId: 4,
  order: 4,
  title: 'NFT 仓位与 NPM',
  summary: '理解 NonfungiblePositionManager 如何用 ERC721 管理仓位，tokenId 与 Position 的映射关系。',
  content: `# NFT 仓位与 NPM

核心合约 UniswapV3Pool 只认 (owner, tickLower, tickUpper)——它不关心 owner 是谁的外部账户。真正把仓位"NFT 化"、对外提供友好接口的，是外围合约 **NonfungiblePositionManager（NPM）**。

## NPM 的角色

NPM 是一个 ERC721 合约，每个 mint 操作：

1. 铸造一个新 tokenId（递增）；
2. 在内部映射 tokenId → (pool, tickLower, tickUpper)；
3. 以 **NPM 自己**作为 owner 调用核心池的 mint（核心池只认 NPM 为 LP）；
4. 把 NFT 发给用户。

用户持有 NFT = 持有仓位产权。转让 NFT 即转让仓位。

## 主要方法

- mint(params)：建新仓位，返回 tokenId。params 含 token0/1、fee、tickLower/Upper、amount0/1 期望、滑点保护、收款人；
- increaseLiquidity(tokenId, amount0, amount1, ...)：向已有仓位追加流动性；
- decreaseLiquidity(tokenId, liquidity, ...)：减少流动性（调核心 burn），本金记入 tokensOwed；
- collect(tokenId, ...)：领取该 tokenId 的 tokensOwed；
- burn(tokenId)：当 tokensOwed 为 0 时销毁 NFT（彻底关闭仓位）。

:::code-ref{id="npm-mint"}
:::

## 为何这种分层

V3 的"核心 + 外围"架构：

- **核心（Pool）**：极简、只处理数学与状态，不转账代币（用 callback 让调用方转），最安全；
- **外围（NPM/SwapRouter）**：处理转账、滑点、NFT、用户友好接口，可升级、可替换。

这种分层让核心合约无需改动即可支持新外围功能。NPM 的 NFT 只是外围的一种实现——理论上你也可以写一个用 ERC20 聚合仓位的外围（但会丧失区间灵活性）。

:::tip
NPM 的 NFT metadata（图像）会根据仓位实时生成（价格区间、token 对、费率），让仓位可视化。这是 V3 一个有趣的外围应用。
:::

:::visual{type="position-range"}
:::

## 小结

- NPM 用 ERC721 管理仓位，tokenId ↔ (pool, tickLower, tickUpper)；
- mint/increaseLiquidity/decreaseLiquidity/collect/burn 五大方法；
- 核心+外围分层：核心只做数学，外围做转账与用户体验。

第 4 章结束。下一章进入 swap 执行的细节。
`,
  sandbox: {
    template: `// NPM 用 tokenId 标识仓位。模拟：给定 tokenId 查询对应仓位信息
function solve(tokenId = 1) {
  // TODO: 返回该 tokenId 的仓位描述字符串
  // 简化：return "Position #" + tokenId

  return ''
}`,
    entryFunction: 'solve',
    hints: [
      'return "Position #" + tokenId',
    ],
    validator: 'exact',
    validatorKey: 'ch4-4-nft',
  },
  quiz: [
    {
      type: 'choice',
      question: 'NonfungiblePositionManager（NPM）的作用是？',
      options: [
        '替代核心池做 swap',
        '用 ERC721 管理仓位，提供 mint/collect 等用户友好接口',
        '部署新池子',
        '计算手续费',
      ],
      answer: 1,
      explanation: 'NPM 把仓位 NFT 化，封装核心池操作，处理转账与用户体验。',
    },
    {
      type: 'choice',
      question: '在 NPM 模型下，核心池看到的 LP（owner）是谁？',
      options: [
        '用户的外部账户',
        'NPM 合约本身',
        '零地址',
        '工厂合约',
      ],
      answer: 1,
      explanation: 'NPM 以自己为 owner 调用核心池 mint，核心池只认 NPM；用户通过 NFT 间接持有。',
    },
  ],
  visuals: ['position-range'],
}
