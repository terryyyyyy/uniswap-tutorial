// BigInt 数学辅助

export const abs = (n: bigint): bigint => (n < 0n ? -n : n)
export const max = (a: bigint, b: bigint): bigint => (a > b ? a : b)
export const min = (a: bigint, b: bigint): bigint => (a < b ? a : b)

// 向上取整除法
export const divCeil = (a: bigint, b: bigint): bigint => (a + b - 1n) / b
