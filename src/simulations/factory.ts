// V3 Factory（对照 v3-core/contracts/UniswapV3Factory.sol）：按 token0<token1 排序 + fee 创建/查找池
import { PoolSimulator } from './pool'

export class FactorySimulator {
  pools = new Map<string, PoolSimulator>()
  owner = 'deployer'

  poolKey(token0: string, token1: string, fee: number): string {
    const [a, b] = token0 < token1 ? [token0, token1] : [token1, token0]
    return `${a}:${b}:${fee}`
  }
  createPool(token0: string, token1: string, fee: number): PoolSimulator {
    const key = this.poolKey(token0, token1, fee)
    if (this.pools.has(key)) throw new Error('POOL_EXISTS')
    const [a, b] = token0 < token1 ? [token0, token1] : [token1, token0]
    const pool = new PoolSimulator(a, b, fee)
    this.pools.set(key, pool)
    return pool
  }
  getPool(token0: string, token1: string, fee: number) {
    return this.pools.get(this.poolKey(token0, token1, fee))
  }
}
