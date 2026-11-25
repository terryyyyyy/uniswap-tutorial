# Uniswap v4 互动教程

六个主题各对应一节课。每节先动手理解应用原理，再在同一页面沿 Solidity 调用链阅读对应的实现，最后可用 Foundry 验证合约行为。应用和实现两项测验都通过后计为一课完成，进度保存在浏览器里。

| 主题 | 应用原理与实验 | Solidity 实现 |
| --- | --- | --- |
| 兑换 | 调整 USDC 输入，比较报价与价格影响 | `V4Router`、`Pool.swap`、`SwapMath`、Tick 搜索与部分成交 |
| 集中流动性 | 让价格穿过仓位边界 | `PositionManager`、仓位 salt、`liquidityGross/Net`、crossing 与费用增长 |
| PoolManager | 比较 v3 和 v4 的池结构 | `PoolKey` 校验、ABI 编码与 PoolId、Slot0 和读取接口 |
| Hooks | 配置回调并播放一笔兑换 | 地址权限、selector、指定币 Delta 与 Hook 记账 |
| 动态费率 | 比较固定和动态费率 | pips、持久更新、单次覆盖与协议费分成 |
| 净额结算 | 演练两跳兑换及回滚 | `unlockCallback`、动作分发、临时存储、`sync/settle/take` 和退出检查 |

## 运行网页

```bash
npm ci
npm run dev
npm test
npm run build
```

开发站点默认端口为 5174。部署 `dist/` 时，应用路由需要回退到 `index.html`。课程使用 `/lesson/:id`。旧链接 `/implementation/:id` 会跳转到同一课的 Solidity 实现段。原版 v3 可从页脚或 `/v3` 打开，原章节和数字课时链接仍会跳转到对应页面。

## Foundry 实操

安装 Foundry 后，在项目根目录运行以下命令。首次 setup 需要访问 GitHub，Foundry 会按配置使用 Solidity 0.8.26 和 Cancun。测试在本地 EVM 部署官方 PoolManager，并用教学路由器接入官方 V4Router。测试资金由本地 mock 合约提供。

```bash
npm run solidity:setup
npm run solidity:test
forge test --root solidity-lab --match-test testSwap -vvvv
```

六个主题的测试前缀依次是 `testSwap`、`testLiquidity`、`testPoolId`、`testHook`、`testFee`、`testSettlement`。每节课的 Solidity 实现段提供对应命令和修改练习。浏览器实验里的单步定点算术、PoolKey 哈希等有独立测试，完整回调、状态写入和回滚行为可在 Foundry trace 中观察。

源码链接固定在 [v4-core 59d3ecf5](https://github.com/Uniswap/v4-core/tree/59d3ecf53afa9264a16bba0e38f4c5d2231f80bc) 和 [v4-periphery c6e4754d](https://github.com/Uniswap/v4-periphery/tree/c6e4754dab11bd38c6f08ac51c3c868569e93d64)。Core 版本与所选 Periphery 的子模块一致。
