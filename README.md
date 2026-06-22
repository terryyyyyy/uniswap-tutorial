# 🦄 Uniswap V3 合约交互式教程

一个由浅入深、闯关式学习 Uniswap V3 合约设计理念与实现细节的中文交互教程。8 章 35 关，纯前端 BigInt 模拟引擎，无需连接区块链即可交互实操。

## ✨ 特性

- **闯关式学习**：8 章 35 关，线性解锁，星星评分 + 徽章成就
- **三阶段闭环**：每关「📖 知识讲解 → 💻 沙盒实操 → ✅ 测验验证」
- **纯前端模拟**：BigInt 精确复刻 V3 合约数学，无需钱包/测试币
- **代码沙盒**：Web Worker 隔离执行用户代码，注入模拟 API
- **11 个可视化组件**：流动性图、Tick 数轴、Swap 动画、手续费曲线等
- **Markdown 教程**：支持 LaTeX 公式、源码片段引用、自定义提示框
- **深色科技风 UI**：响应式布局，桌面/平板/移动端适配

## 📚 章节概览

| 章 | 标题 | 关卡 | 核心内容 |
|---|---|---|---|
| 1 | AMM 基础 | 4 | 恒定乘积公式、滑点、V2 局限 |
| 2 | 集中流动性 | 4 | 价格区间、流动性 L、资本效率 |
| 3 | Tick 机制 | 5 | tick 离散化、tickSpacing、位图遍历 |
| 4 | 仓位管理 | 4 | Position、mint/burn/collect、NFT |
| 5 | Swap 执行 | 5 | computeSwapStep、跨 tick、价格影响 |
| 6 | 手续费计算 | 4 | feeGrowth、区间分配、惰性结算 |
| 7 | 核心合约源码 | 5 | Factory、Pool、slot0、NoDelegateCall |
| 8 | 外围合约 | 4 | SwapRouter、NPM、Quoter、毕业项目 |

## 🚀 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 运行模拟引擎测试
npm test

# 生产构建
npm run build
```

打开浏览器访问 `http://localhost:5174`，从第 1 章第 1 关开始闯关。

## 🧠 学习路径建议

1. **按顺序通关**：章节间线性解锁，前置知识是后置关卡的基础
2. **动手改沙盒**：每关沙盒代码可修改参数，观察模拟结果变化
3. **善用提示**：卡住时可点「💡 提示」，但不用提示能得更高星数（3 星）
4. **对照源码**：教程引用了 `v3-core` / `v3-periphery` 真实源码片段，建议配合阅读

## 🏗️ 技术架构

三层架构：

- **模拟引擎层**（`src/simulations/`）：纯 TypeScript + BigInt，1:1 复刻 V3 合约库（FullMath、TickMath、SwapMath、SqrtPriceMath、TickBitmap、Pool 等），对照 `v3-core/contracts/libraries/` 源码实现，38 个单元测试验证
- **应用层**（`src/components/` + `src/stores/` + `src/sandbox/`）：Vue3 组件 + Pinia 状态 + Web Worker 沙盒
- **内容层**（`src/data/`）：35 关 Markdown 教程 + 题库 + 源码片段，与代码解耦

### 技术栈

Vue 3 · TypeScript · Vite · Element Plus · Pinia · Vue Router · markdown-it · KaTeX · highlight.js · ECharts · Sass · vitest

## 📂 项目结构

```
src/
├── simulations/    # 模拟引擎（BigInt，对照合约源码）
├── sandbox/        # Web Worker 代码沙盒
├── stores/         # Pinia 状态（进度持久化）
├── components/     # layout / lesson / visual / markdown / game
├── views/          # Home / Chapter / Lesson
├── data/           # chapters / badges / lessons(35) / snippets
└── markdown/       # markdown-it 插件（容器/代码引用/公式）
```

## 🙏 致谢

- [Uniswap V3 Core](https://github.com/Uniswap/v3-core) — 模拟引擎的数学真值来源
- [Uniswap V3 Periphery](https://github.com/Uniswap/v3-periphery) — LiquidityAmounts 等库参考

本教程的模拟引擎为教学精度实现（行为等价，非字节级匹配），核心数学取整方向与合约一致，适合学习理解 V3 设计。如需生产级精度请直接使用合约。

## 📄 License

MIT
