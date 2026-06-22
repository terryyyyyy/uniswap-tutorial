/// <reference lib="webworker" />
import { sandboxApi } from './api'

const ctx: DedicatedWorkerGlobalScope = self as any

ctx.onmessage = (e: MessageEvent) => {
  const { code, entry } = e.data as { code: string; entry: string }
  const logs: string[] = []
  const sandboxConsole = { log: (...a: any[]) => logs.push(a.map(fmt).join(' ')) }
  try {
    const keys = Object.keys(sandboxApi)
    const fn = new Function(
      'console', ...keys,
      `"use strict";\n${code}\n;return typeof ${entry} === 'function' ? ${entry}() : ${entry};`,
    )
    const output = fn(sandboxConsole, ...keys.map((k) => (sandboxApi as any)[k]))
    ctx.postMessage({ success: true, output: serialize(output), logs })
  } catch (err: any) {
    ctx.postMessage({ success: false, error: String(err?.message ?? err), logs })
  }
}

function fmt(v: any): string {
  if (typeof v === 'bigint') return v.toString() + 'n'
  if (v && typeof v === 'object') {
    try { return JSON.stringify(v, (_k, x) => (typeof x === 'bigint' ? x.toString() + 'n' : x)) } catch { return String(v) }
  }
  return String(v)
}

function serialize(v: any): any {
  if (typeof v === 'bigint') return { __bigint: v.toString() }
  if (Array.isArray(v)) return v.map(serialize)
  if (v && typeof v === 'object') {
    const o: any = {}
    for (const k in v) o[k] = serialize(v[k])
    return o
  }
  return v
}
