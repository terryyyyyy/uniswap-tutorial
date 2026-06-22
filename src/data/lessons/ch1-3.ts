import type { Lesson } from '@/types'

export const lesson: Lesson = {
  id: '1-3',
  chapterId: 1,
  order: 3,
  title: 'Swap 与滑点',
  summary: '掌握含手续费的兑换公式，理解滑点（价格影响）与大额交易的关系。',
  content: `# Swap 与滑点

知道了 $x \\cdot y = k$，我们就能精确计算一笔兑换（swap）到底能换出多少、价格又被推了多少。这一关把"兑换公式"和"滑点"讲透。

## 兑换公式（含手续费）

真实 AMM 每笔交易都收手续费。设输入量为 $\\text{amountIn}$，手续费率 $f$（V2 默认 0.3%，即 30 个基点），则**扣费后的净输入**为：

$$
\\text{amountInNet} = \\text{amountIn} \\times (1 - f)
$$

把净输入注入池子，按恒定乘积算输出：

$$
\\text{amountOut} = \\text{amountInNet} \\cdot \\frac{R_y}{R_x + \\text{amountInNet}}
$$

手续费直接留在池子里，归 LP 所有——这也是 LP 收益的来源。

:::tip
"扣费再注入"是关键：手续费不进入 $k$ 守恒计算，而是叠加在储备上，所以每次交易后 $k$ 实际上**略微增大**，LP 持续受益。
:::

## 滑点 = 价格影响

交易前的瞬时价格是 $P_{\\text{old}} = R_y / R_x$，交易后储备变化、价格变为 $P_{\\text{new}}$。**滑点（slippage）就是这笔交易造成的价格偏离**，常用基点（bps，1 bps = 0.01%）衡量：

$$
\\text{priceImpactBps} = \\frac{|P_{\\text{new}} - P_{\\text{old}}|}{P_{\\text{old}}} \\times 10000
$$

滑点的根源是上一关公式里分母的 $R_x + \\text{amountInNet}$：输入越大，分母被抬得越高，单位输入换出的越少，价格偏离越厉害。

## 大额 vs 小额

把同一池子里不同规模的交易对比一下：

- **小额交易**：$\\text{amountIn} \\ll R_x$，分母几乎不变，输出近似线性 $\\text{amountOut} \\approx \\text{amountInNet} \\cdot R_y/R_x$，滑点极小；
- **大额交易**：$\\text{amountIn}$ 接近甚至超过 $R_x$，分母显著抬升，输出增长放缓，滑点急剧放大。

这就是为什么"池子越深、滑点越小"——深度（储备量）是对抗滑点的根本。这也是 DEX 聚合器、路由算法存在的意义：把大单拆分到多个池子以降低单池滑点。

:::warning
前端显示的"价格"通常是**当前瞬时价格**，而你实际成交要承受滑点。下单前务必核对"最小输出量"（滑点容忍度），避免被抢跑（MEV）收割。
:::

:::visual{type="slippage-curve"}
:::

在沙盒里调用 \`ammSwap\` 模拟兑换，把输入金额从 1% 储备逐步加大到 50% 储备，观察 \`priceImpactBps\` 如何从个位数基点飙升到数百甚至上千。

## 小结

- 兑换公式：先扣手续费得净输入，再按 $x \\cdot y = k$ 算输出；
- 滑点 = 交易造成的价格偏离，输入越大滑点越大；
- 池子深度决定抗滑点能力，大额交易应拆单或设最小输出。
`,
  sandbox: {
    template: `function solve(rx = 1000000n, ry = 1000000n, amountIn = 10000n, zeroForOne = true) {
  // 调用 ammSwap 模拟兑换，结果含 priceImpactBps（滑点，单位基点）
  const result = ammSwap(rx, ry, amountIn, zeroForOne)
  // 动手试：把上方 amountIn 改成 500000n 再运行，对比 priceImpactBps 变化
  return result
}`,
    entryFunction: 'solve',
    hints: [
      'ammSwap(rx, ry, amountIn, zeroForOne) 返回 { amountOut, newReserveX, newReserveY, priceImpactBps, feeAmount }',
      '把 amountIn 调大（如 500000n）观察 priceImpactBps 明显上升',
    ],
    validator: 'exact',
    validatorKey: 'ch1-3-swap',
  },
  quiz: [
    {
      type: 'code',
      question: '完成下方沙盒：调用 ammSwap 模拟兑换，并根据兑换前后的储备计算这笔交易的价格影响 priceImpactBps（基点）。要求返回 { amountOut, priceImpactBps } 且 priceImpactBps > 0。',
      answer: '',
      explanation: '用兑换前后储备算新旧价格：P_old = Number(ry)/Number(rx)，P_new = Number(result.newReserveY)/Number(result.newReserveX)，价格影响 = |P_new - P_old| / P_old × 10000。',
      codeSandbox: {
        template: `function solve(rx = 1000000n, ry = 1000000n, amountIn = 10000n, zeroForOne = true) {
  const result = ammSwap(rx, ry, amountIn, zeroForOne)
  // TODO: 根据兑换前后的储备计算价格影响 priceImpactBps（基点 = 万分之一）
  //   oldPrice = Number(ry) / Number(rx)
  //   newPrice = Number(result.newReserveY) / Number(result.newReserveX)
  //   priceImpactBps = Math.abs((newPrice - oldPrice) / oldPrice) * 10000
  const oldPrice = Number(ry) / Number(rx)
  const newPrice = Number(result.newReserveY) / Number(result.newReserveX)
  const priceImpactBps = 0 // ← 替换为你的计算
  return { amountOut: result.amountOut, priceImpactBps }
}`,
        entryFunction: 'solve',
        validatorKey: 'ch1-3-impact',
      },
    },
    {
      type: 'choice',
      question: '下列哪种情况会让一笔 swap 的滑点（价格影响）变大？',
      options: [
        '池子储备更深、交易金额更小',
        '交易金额占池子储备的比例更高',
        '手续费率更低',
        'LP 数量更多',
      ],
      answer: 1,
      explanation: '滑点源于公式分母 $R_x + \\text{amountInNet}$，输入占储备比例越高，价格偏离越大；池子越深、金额越小则滑点越小。',
    },
  ],
  visuals: ['slippage-curve'],
}
