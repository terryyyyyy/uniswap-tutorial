import type { Lesson } from '@/types'

export const lesson: Lesson = {
  id: '1-2',
  chapterId: 1,
  order: 2,
  title: '恒定乘积公式',
  summary: '推导 x·y=k 不变量，理解价格 P=Ry/Rx 与储备的守恒关系。',
  content: `# 恒定乘积公式

上一关我们看到 AMM 用 $P = R_y/R_x$ 报价。但仅凭比值定价还不够——必须有一条规则约束"每次交易后储备如何变化"，才能保证池子不会被掏空、价格不会失控。这条规则就是**恒定乘积公式**。

## 从"守恒"推导 $k = R_x \\cdot R_y$

Uniswap V2 的核心思想极其简洁：**交易前后，两种储备的乘积保持不变**。设交易前储备为 $R_x, R_y$，交易后变为 $R_x', R_y'$，则：

$$
R_x \\cdot R_y = R_x' \\cdot R_y' = k
$$

$k$ 是一个常数，称为**不变量（invariant）**。它的几何意义是一条双曲线：储备组合 $(R_x, R_y)$ 始终落在 $x \\cdot y = k$ 这条曲线上，交易只是沿着曲线滑动。

为什么是乘积？想象你用 $\\Delta x$ 的 x 换出 $\\Delta y$ 的 y。注入让 $R_x$ 增加、$R_y$ 减少，但乘积不变：

$$
(R_x + \\Delta x)(R_y - \\Delta y) = R_x \\cdot R_y
$$

解出能换出的 y：

$$
\\Delta y = R_y \\cdot \\frac{\\Delta x}{R_x + \\Delta x}
$$

:::tip
注意分母是 $R_x + \\Delta x$ 而不是 $R_x$——正是这个"加项"让大额交易换出的 y 越来越少，自然产生**滑点**。下一关详谈。
:::

## 价格即储备比

在恒定乘积曲线上任意一点，瞬时价格就是该点切线的斜率，恰好等于储备比值：

$$
P = \\frac{R_y}{R_x}
$$

所以"价格"和"储备量"是同一枚硬币的两面：交易移动了储备点，价格随之改变。

## 实例演算

设一个池子 $R_x = 1000$、$R_y = 2000$，则：

$$
P = \\frac{2000}{1000} = 2, \\qquad k = 1000 \\times 2000 = 2{,}000{,}000
$$

若有人注入 $\\Delta x = 100$ 的 x，按公式换出：

$$
\\Delta y = 2000 \\times \\frac{100}{1000 + 100} \\approx 181.8
$$

交易后储备变为 $(1100,\\ 1818.2)$，乘积 $1100 \\times 1818.2 \\approx 2{,}000{,}000$，$k$ 守恒。新价格 $P' = 1818.2/1100 \\approx 1.653$——注入 x 增加了 x 的供给，于是 x 变便宜了（以 y 计价下降）。

:::warning
$k$ 并非永远不变：当 LP 存入或取出流动性时，$k$ 会随之增减。只有"纯交易"过程才严格守恒 $k$。
:::

:::visual{type="reserve-curve"}
:::

在沙盒里输入不同的 $R_x, R_y$，算出价格 $P$ 与不变量 $k$，观察它们如何随储备变化。

## 小结

- 恒定乘积公式 $x \\cdot y = k$ 约束交易前后储备；
- 瞬时价格 $P = R_y / R_x$；
- 大额交易因分母 $R_x + \\Delta x$ 产生滑点——这正是下一关的主题。
`,
  sandbox: {
    template: `function solve(rx = 1000n, ry = 2000n) {
  // TODO: 返回 { price: number, k: bigint }
  //   price = Number(ry) / Number(rx)
  //   k = rx * ry   （bigint 乘法，如 1000n * 2000n = 2000000n）
  return { price: 0, k: 0n }
}`,
    entryFunction: 'solve',
    hints: [
      'price 是 Number 类型：Number(ry) / Number(rx)',
      'k 是 bigint 类型：直接 rx * ry，不要转 Number',
    ],
    validator: 'exact',
    validatorKey: 'ch1-2-invariant',
  },
  quiz: [
    {
      type: 'fill',
      question: '某池 $R_x = 1000$、$R_y = 2000$，瞬时价格 $P = R_y/R_x$ 等于多少？（填数字）',
      answer: '2',
      explanation: '$P = 2000 / 1000 = 2$。',
    },
    {
      type: 'fill',
      question: '同上池子，恒定乘积不变量 $k = R_x \\cdot R_y$ 等于多少？（填整数，不要逗号）',
      answer: '2000000',
      explanation: '$k = 1000 \\times 2000 = 2000000$。',
    },
  ],
  visuals: ['reserve-curve'],
}
