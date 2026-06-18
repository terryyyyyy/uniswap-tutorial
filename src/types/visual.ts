// 可视化组件类型枚举（对应 components/visual/ 下的组件）
export type VisualComponentType =
  | 'reserve-curve'       // x-y 储备曲线（Ch1）
  | 'slippage-curve'      // 滑点曲线（Ch1）
  | 'liquidity-chart'     // 流动性分布直方图（Ch2, Ch4）
  | 'comparison-panel'    // V2/V3 对比面板（Ch2）
  | 'price-range-slider'  // 价格区间滑块（Ch2）
  | 'tick-axis'           // Tick 数轴可视化（Ch3）
  | 'position-range'      // 仓位区间展示（Ch4）
  | 'swap-animation'      // Swap 执行动画（Ch5, Ch7）
  | 'fee-growth-chart'    // 手续费增长曲线（Ch6）
  | 'lp-pie-chart'        // LP 收益饼图（Ch6）
  | 'flow-diagram'        // 合约调用流程图（Ch7）
