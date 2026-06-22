import type { SandboxResult } from '@/types/simulation'

let worker: Worker | null = null
function getWorker() {
  if (!worker) worker = new Worker(new URL('./sandbox.worker.ts', import.meta.url), { type: 'module' })
  return worker
}

// 把 {__bigint:"n"} 还原为 bigint
function deserialize(v: any): any {
  if (v && typeof v === 'object' && '__bigint' in v) return BigInt(v.__bigint)
  if (Array.isArray(v)) return v.map(deserialize)
  if (v && typeof v === 'object') {
    const o: any = {}
    for (const k in v) o[k] = deserialize(v[k])
    return o
  }
  return v
}

export function runSandbox(code: string, entry: string): Promise<SandboxResult> {
  return new Promise((resolve) => {
    const w = getWorker()
    let done = false
    const timer = setTimeout(() => {
      if (done) return
      done = true
      w.terminate()
      worker = null
      resolve({ success: false, output: null, logs: [], error: '执行超时（5s）', duration: 5000 })
    }, 5000)
    w.onmessage = (e) => {
      if (done) return
      done = true
      clearTimeout(timer)
      resolve({ ...e.data, output: e.data.success ? deserialize(e.data.output) : null, duration: 0 })
    }
    w.postMessage({ code, entry })
  })
}
