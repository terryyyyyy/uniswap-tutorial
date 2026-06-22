// code 题/沙盒校验函数集中表。每个 validator 接收 sandbox 输出，返回是否正确。
// Chunk 8 内容编写时按 lessonId 添加具体 validator。
export const validators: Record<string, (output: unknown) => boolean> = {}

export function getValidator(key: string): (output: unknown) => boolean {
  return validators[key] ?? ((_output: unknown) => false)
}
