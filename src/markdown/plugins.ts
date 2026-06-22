import MarkdownIt from 'markdown-it'
import katex from '@vscode/markdown-it-katex'
import hljs from 'highlight.js'

// 自定义容器：:::tip / :::warning / :::visual / :::code-ref
function containerPlugin(md: MarkdownIt) {
  md.block.ruler.before('paragraph', 'custom_container', (state, startLine, endLine, silent) => {
    const startPos = state.bMarks[startLine] + state.tShift[startLine]
    const m = state.src.slice(startPos, state.eMarks[startLine]).match(/^:::(tip|warning|visual|code-ref)(.*)$/)
    if (!m) return false
    if (silent) return true
    let next = startLine + 1
    const lines: string[] = []
    while (next < endLine) {
      const l = state.src.slice(state.bMarks[next] + state.tShift[next], state.eMarks[next])
      if (l.trim() === ':::') break
      lines.push(l)
      next++
    }
    const content = lines.join('\n')
    const token = state.push('custom_container', 'div', 0)
    token.meta = { kind: m[1], attrs: m[2].trim(), content }
    token.map = [startLine, next]
    state.line = next + 1
    return true
  })
  md.renderer.rules['custom_container'] = (tokens, idx) => {
    const { kind, attrs, content } = tokens[idx].meta as { kind: string; attrs: string; content: string }
    if (kind === 'visual') return `<div class="md-visual-hint">📊（见可视化区）</div>`
    if (kind === 'code-ref') {
      const id = attrs.match(/id="([^"]+)"/)?.[1] ?? ''
      return `<div class="code-ref-slot" data-snippet="${id}"></div>`
    }
    return `<div class="md-${kind}">${md.render(content)}</div>`
  }
}

export function createMarkdown(): MarkdownIt {
  const md = new MarkdownIt({ html: false, linkify: true, breaks: false })
  md.use(katex as any)
  containerPlugin(md)
  md.set({
    highlight: (str, lang) => {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return `<pre class="hljs"><code>${hljs.highlight(str, { language: lang }).value}</code></pre>`
        } catch {
          // 忽略高亮失败，回退到转义输出
        }
      }
      return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`
    },
  })
  return md
}
