import type { Lesson } from '@/types'

export const lesson: Lesson = {
  id: '1-1',
  chapterId: 1,
  order: 1,
  title: '什么是 AMM',
  summary: '理解订单簿与自动做市商（AMM）的区别，掌握 AMM 用储备池定价的原理。',
  content: `# 什么是 AMM

在去中心化交易所（DEX）出现之前，数字资产的交易主要依赖**订单簿（Order Book）**模型。理解它的局限，就能明白自动做市商（AMM）为何会成为 DeFi 的基石。

## 传统订单簿：等待对手方

订单簿把买单和卖单按价格排队撮合。你想买入 1 ETH，必须有另一个用户在对应价格挂出 1 ETH 的卖单，交易才能成交。做市商通过持续挂双边报价提供流动性，赚取买卖价差。

这套机制在中心化交易所运转良好，但在链上面临两大难题：

- **链上撮合成本高**：每次挂单、撤单都要写区块，Gas 昂贵；
- **需要持续对手方**：若无人挂卖单，买方就只能干等，市场可能"有价无市"。

:::warning
订单簿的健康程度完全取决于做市商的活跃度。一旦做市商撤离，流动性枯竭，价格会剧烈波动。
:::

## 自动做市商：用储备池定价

AMM 换了一个思路：**不再撮合对手方，而是用一个储备池（流动性池）自动给出价格**。池子里同时存放两种代币，记储备量为 $R_x$ 和 $R_y$，AMM 根据两者的比值实时报价：

$$
P = \\frac{R_y}{R_x}
$$

这里 $x$ 是基础资产（base），$y$ 是报价资产（quote）。比如一个 ETH/USDC 池中有 10 ETH 和 20000 USDC，那么 ETH 的瞬时价格就是 $20000/10 = 2000$ USDC。

当你用 USDC 买入 ETH，池子的 $R_y$（USDC）增加、$R_x$（ETH）减少，比值 $R_y/R_x$ 上升——**你买得越多，价格越贵**。这种"自我定价"机制让 AMM 永远有报价、永远可以成交，无需等待对手方。

:::tip
AMM 把"做市"这件事从依赖专业做市商，变成了"任何人存入代币即可做市"。提供代币的人叫**流动性提供者（LP）**，赚取交易手续费。
:::

## 为什么 AMM 永远可用

订单簿要求买卖双方同时在场，而 AMM 的对手方就是**池子本身**。只要池子里还有储备，任何时刻都能成交。这带来三个关键优势：

1. **7×24 可用**：无需做市商在线，链上合约自动报价；
2. **抗审查**：任何人都能向池子提供流动性或交易；
3. **长尾资产友好**：哪怕是冷门代币，只要有 LP 愿意建池，就能立即拥有市场。

:::visual{type="reserve-curve"}
:::

调一调右侧可视化里的储备量 $R_x$、$R_y$，观察价格 $P$ 如何随储备比值变化——这正是 AMM 定价的核心直觉。

## 小结

- 订单簿依赖对手方撮合，链上成本高、易缺流动性；
- AMM 用储备池 $R_x$、$R_y$ 自动定价，$P = R_y / R_x$；
- AMM 永远可用，把做市权交给了所有 LP。

下一关我们推导让 AMM 稳定运行的"恒定乘积公式" $x \\cdot y = k$。
`,
  sandbox: {
    template: `function solve(rx = 1000n, ry = 2000n) {
  // TODO: 返回 AMM 的瞬时价格（y 储备 / x 储备），用 Number 类型
  // 提示：return Number(ry) / Number(rx)
  // 动手试：把上方 rx 改成 500n、ry 改成 2000n，价格应变 4
  return 0
}`,
    entryFunction: 'solve',
    hints: [
      'AMM 瞬时价格 = 报价资产储备 / 基础资产储备',
      'BigInt 要先转 Number 再做除法：Number(ry) / Number(rx)',
    ],
    validator: 'exact',
    validatorKey: 'ch1-1-price',
  },
  quiz: [
    {
      type: 'choice',
      question: 'AMM 与订单簿的主要区别是什么？',
      options: [
        'AMM 需要买卖双方同时挂单，订单簿不需要',
        'AMM 不需要交易对手方，价格由储备池的储备量决定',
        'AMM 只能交易稳定币，订单簿可交易任何资产',
        'AMM 的手续费比订单簿高十倍',
      ],
      answer: 1,
      explanation: 'AMM 用储备池自动定价，对手方就是池子本身，无需等待挂单对手方；价格由 $R_y/R_x$ 决定。',
    },
    {
      type: 'choice',
      question: '一个 ETH/USDC 的 AMM 池中，ETH 储备 $R_x=10$、USDC 储备 $R_y=20000$，ETH 的瞬时价格是多少？',
      options: ['0.0005 USDC', '2000 USDC', '20000 USDC', '10 USDC'],
      answer: 1,
      explanation: '瞬时价格 $P = R_y / R_x = 20000 / 10 = 2000$ USDC。',
    },
  ],
  visuals: ['reserve-curve'],
}
