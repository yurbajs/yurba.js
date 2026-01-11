<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vitepress'

const tooltips = ref<Array<{ id: number, content: string, position: { x: number, y: number }, loading: boolean, autoHideTimer?: any, anchorX: number, anchorY: number, side: 'right' | 'left', symbolName: string }>>([])
const docsIndex = new Map<string, any>()
let docsLoaded = false
let hoverTimer: any = null
let hideTimer: any = null
let tooltipIdCounter = 0

const route = useRoute()

interface DocNode {
  id: number
  name: string
  kind: number
  kindString?: string
  comment?: any
  children?: DocNode[]
  type?: any
  signatures?: any[]
}

async function fetchDocs() {
  if (docsLoaded) return
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}docs.json`)
    const data = await res.json()
    buildIndex(data)
    docsLoaded = true
  } catch (e) {
    console.error('Failed to load docs.json', e)
  }
}

function buildIndex(node: DocNode, parentPath: string[] = []) {
  if (node.name) {
    const nodeWithPath = { ...node, _package: parentPath[0] || '' }
    
    // Пріоритет: класи, інтерфейси, типи мають вищий пріоритет ніж властивості
    const existing = docsIndex.get(node.name)
    const isTopLevel = node.kind === 128 || node.kind === 256 || node.kind === 4194304 || node.kind === 2097152 || node.kind === 8
    const existingIsTopLevel = existing && (existing.kind === 128 || existing.kind === 256 || existing.kind === 4194304 || existing.kind === 2097152 || existing.kind === 8)
    
    if (!existing || (isTopLevel && !existingIsTopLevel)) {
      docsIndex.set(node.name, nodeWithPath)
    }
    
    if (parentPath.length > 0) {
       const fullPath = [...parentPath, node.name].join('.')
       docsIndex.set(fullPath, nodeWithPath)
    }
  }

  if (node.children) {
    const currentPath = node.name ? [...parentPath, node.name] : parentPath
    node.children.forEach(child => buildIndex(child, currentPath))
  }
}

function getTypeUrl(name: string, node: any): string {
  const base = import.meta.env.BASE_URL
  const pkg = node._package || ''
  const pkgPath = pkg ? `${pkg}/` : ''
  
  switch (node.kind) {
    case 128: return `${base}${pkgPath}classes/${name}.html`
    case 256: return `${base}${pkgPath}interfaces/${name}.html`
    case 4194304:
    case 2097152: return `${base}${pkgPath}type-aliases/${name}.html`
    case 8: return `${base}${pkgPath}enumerations/${name}.html`
    case 32: return `${base}${pkgPath}variables/${name}.html`
    default: return '#'
  }
}

function renderType(type: any): string {
  if (!type) return 'any'
  if (type.type === 'intrinsic') return `<span class="k">` + type.name + `</span>`
  if (type.type === 'reference') {
    const name = type.name
    const pkg = type.package || ''
    if (name && docsIndex.has(name)) {
      const node = docsIndex.get(name)
      const pkgPath = pkg ? `${pkg}/` : node._package ? `${node._package}/` : ''
      const base = import.meta.env.BASE_URL
      let url = '#'
      switch (node.kind) {
        case 128: url = `${base}${pkgPath}classes/${name}.html`; break
        case 256: url = `${base}${pkgPath}interfaces/${name}.html`; break
        case 4194304:
        case 2097152: url = `${base}${pkgPath}type-aliases/${name}.html`; break
        case 8: url = `${base}${pkgPath}enumerations/${name}.html`; break
        case 32: url = `${base}${pkgPath}variables/${name}.html`; break
      }
      return `<a href="${url}" class="type-link" data-type="${name}"><span class="t">${name}</span></a>`
    }
    return `<span class="t">${name || 'unknown'}</span>`
  }
  if (type.type === 'union') return type.types.map(renderType).join(' | ')
  if (type.type === 'array') return renderType(type.elementType) + '[]'
  if (type.type === 'reflection' && type.declaration) {
      return '{ ... }'
  }
  if (type.type === 'literal' && type.value !== undefined) {
    return `<span class="k">${JSON.stringify(type.value)}</span>`
  }
  return type.name || 'any'
}

function renderNode(node: DocNode): string {
  let html = `<div class="preview-header"><span class="k">${getKindString(node.kind)}</span> <span class="n">${node.name}</span></div>`
  
  if (node.children && (node.kind === 256 || node.kind === 128)) {
    html += `<div class="preview-body">`
    html += `<span class="p">{</span>`
    
    const props = node.children.filter(c => c.kind === 1024)
    const methods = node.children.filter(c => c.kind === 2048)
    
    props.forEach(child => {
      html += `<div class="preview-line">`
      const optional = child.flags?.isOptional ? '<span class="optional">?</span>' : ''
      html += `  <span class="pn">${child.name}${optional}</span>`
      html += `: ${renderType(child.type)}`
      html += `</div>`
    })
    
    methods.forEach(child => {
      html += `<div class="preview-line">`
      if (child.signatures) {
         const sig = child.signatures[0]
         const params = sig.parameters?.map((p: any) => `${p.name}: ${renderType(p.type)}`).join(', ') || ''
         const ret = renderType(sig.type)
         html += `  <span class="pn">${child.name}</span>(<span class="params">${params}</span>): ${ret}`
      }
      html += `</div>`
    })
    
    html += `<span class="p">}</span>`
    html += `</div>`
  } 
  else if (node.kind === 4194304 || node.kind === 2097152) {
     html += `<div class="preview-body">`
     if (node.children) {
       html += `<span class="p">{</span>`
       const props = node.children.filter((c: any) => c.kind === 1024)
       props.forEach((child: any) => {
         html += `<div class="preview-line">`
         const optional = child.flags?.isOptional ? '<span class="optional">?</span>' : ''
         html += `  <span class="pn">${child.name}${optional}</span>`
         html += `: ${renderType(child.type)}`
         html += `</div>`
       })
       html += `<span class="p">}</span>`
     } else if (node.type && node.type.type === 'reflection' && node.type.declaration && node.type.declaration.children) {
       html += `<span class="p">{</span>`
       const props = node.type.declaration.children.filter((c: any) => c.kind === 1024)
       props.forEach((child: any) => {
         html += `<div class="preview-line">`
         const optional = child.flags?.isOptional ? '<span class="optional">?</span>' : ''
         html += `  <span class="pn">${child.name}${optional}</span>`
         html += `: ${renderType(child.type)}`
         html += `</div>`
       })
       html += `<span class="p">}</span>`
     } else if (node.type) {
       html += `<span class="k">type</span> <span class="n">${node.name}</span> = <span class="t">${renderType(node.type)}</span>`
     }
     html += `</div>`
  }
  else if (node.kind === 32 && node.type) {
     html += `<div class="preview-body">`
     html += `<span class="k">const</span> <span class="n">${node.name}</span>: <span class="t">${renderType(node.type)}</span>`
     html += `</div>`
  }
  else if (node.kind === 8 && node.children) {
     html += `<div class="preview-body">`
     html += `<span class="p">{</span>`
     node.children.forEach(child => {
       html += `<div class="preview-line">`
       html += `  <span class="pn">${child.name}</span>`
       if (child.type && child.type.type === 'literal') {
         html += ` = <span class="k">${JSON.stringify(child.type.value)}</span>`
       }
       html += `</div>`
     })
     html += `<span class="p">}</span>`
     html += `</div>`
  }
  else if (node.type) {
     html += `<div class="preview-body">`
     html += `<span class="t">${renderType(node.type)}</span>`
     html += `</div>`
  }
  else {
     html += `<div class="preview-body">`
     html += `<div class="preview-line comment">No additional information available</div>`
     html += `</div>`
  }
  
  return html
}

function getKindString(kind: number): string {
  switch (kind) {
    case 128: return 'class'
    case 256: return 'interface'
    case 4194304:
    case 2097152: return 'type'
    case 8: return 'enum'
    case 64: return 'function'
    case 32: return 'variable'
    default: return 'symbol'
  }
}

async function showPreview(name: string, x: number, y: number, anchorX: number, anchorY: number) {
  // Перевірити чи вже є tooltip для цього елемента (запобігання зацикленню)
  const existing = tooltips.value.find(t => t.symbolName === name)
  if (existing) return
  
  const id = ++tooltipIdCounter
  const tooltipWidth = 400
  const tooltipHeight = 150 // приблизна висота
  const gap = 20
  const viewportWidth = window.innerWidth
  
  let side: 'right' | 'left' = 'right'
  let posX = x + gap
  let posY = y
  
  // Перевірити чи є місце праворуч
  if (posX + tooltipWidth > viewportWidth - 20) {
    side = 'left'
    posX = x - tooltipWidth - gap
    if (posX < 20) posX = 20
  }
  
  // Перевірити перекриття з існуючими tooltips і зсунути вниз якщо потрібно
  for (const existing of tooltips.value) {
    const xOverlap = Math.abs(posX - existing.position.x) < tooltipWidth
    const yOverlap = Math.abs(posY - existing.position.y) < tooltipHeight
    
    if (xOverlap && yOverlap) {
      posY = existing.position.y + tooltipHeight + 10
    }
  }
  
  const newTooltip = { 
    id, 
    content: '', 
    position: { x: posX, y: posY }, 
    loading: true, 
    autoHideTimer: undefined,
    anchorX,
    anchorY,
    side,
    symbolName: name
  }
  tooltips.value.push(newTooltip)

  if (!docsLoaded) {
    await fetchDocs()
  }
  
  const tooltip = tooltips.value.find(t => t.id === id)
  if (!tooltip) return

  const node = docsIndex.get(name)
  if (node) {
    tooltip.content = renderNode(node)
  } else {
    tooltip.content = `<div class="preview-error">Symbol "${name}" not found in index</div>`
  }
  tooltip.loading = false
  
  tooltip.autoHideTimer = setTimeout(() => {
    tooltips.value = tooltips.value.filter(t => t.id !== id)
  }, 3000)
}

async function handleMouseOver(e: MouseEvent) {
  const target = (e.target as HTMLElement).closest('a')
  if (!target) return

  const inSidebar = target.closest('.VPSidebar')
  const inAside = target.closest('.VPAside')
  
  if (inSidebar || inAside) return

  let href = target.getAttribute('href')
  let name: string | null = null

  if (target.classList.contains('type-link')) {
    e.preventDefault()
    name = target.getAttribute('data-type')
  } else {
    if (!href || href.startsWith('http') || href.startsWith('#')) return
    
    const currentPath = window.location.pathname
    const isApiPage = currentPath.includes('/classes/') || currentPath.includes('/interfaces/') || 
                      currentPath.includes('/type-aliases/') || currentPath.includes('/variables/') || 
                      currentPath.includes('/enumerations/')
    
    if (!isApiPage) return
    
    const match = href.match(/([^/]+)\.html$/)
    if (!match) return
    
    name = match[1]
  }

  if (!name) return

  clearTimeout(hoverTimer)
  clearTimeout(hideTimer)

  const rect = target.getBoundingClientRect()
  const anchorX = rect.left + rect.width / 2 + window.scrollX
  const anchorY = rect.top + rect.height / 2 + window.scrollY
  
  // Якщо це посилання всередині tooltip, використовуємо позицію tooltip
  const insideTooltip = target.closest('.type-preview-tooltip')
  let x, y
  
  if (insideTooltip) {
    const tooltipRect = insideTooltip.getBoundingClientRect()
    x = tooltipRect.right + window.scrollX
    y = rect.top + window.scrollY
  } else {
    x = rect.right + window.scrollX
    y = rect.top + window.scrollY
  }

  hoverTimer = setTimeout(() => showPreview(name!, x, y, anchorX, anchorY), 200)
}

function handleMouseOut(e: MouseEvent) {
  const relatedTarget = e.relatedTarget as HTMLElement
  
  if (relatedTarget?.closest('.type-preview-tooltip') || relatedTarget?.closest('a.type-link') || relatedTarget?.closest('a[href*="/classes/"]') || relatedTarget?.closest('a[href*="/interfaces/"]') || relatedTarget?.closest('a[href*="/type-aliases/"]')) {
    return
  }
  
  clearTimeout(hoverTimer)
  clearTimeout(hideTimer)
  hideTimer = setTimeout(() => { tooltips.value = [] }, 200)
}

function handleTooltipEnter() {
  clearTimeout(hideTimer)
  // Скасувати автоматичне ховання коли курсор на tooltip
  tooltips.value.forEach(t => {
    if (t.autoHideTimer) {
      clearTimeout(t.autoHideTimer)
      t.autoHideTimer = undefined
    }
  })
}

function handleTooltipLeave() {
  clearTimeout(hideTimer)
  hideTimer = setTimeout(() => { 
    tooltips.value.forEach(t => {
      if (t.autoHideTimer) clearTimeout(t.autoHideTimer)
    })
    tooltips.value = [] 
  }, 200)
}

function getConnectionPath(tooltip: any): string {
  const startX = tooltip.anchorX
  const startY = tooltip.anchorY
  const endX = tooltip.side === 'right' ? tooltip.position.x : tooltip.position.x + 500
  const endY = tooltip.position.y + 30
  
  const dx = endX - startX
  const dy = endY - startY
  const dist = Math.sqrt(dx * dx + dy * dy)
  
  const controlDist = Math.min(dist * 0.4, 100)
  const controlX1 = startX + (tooltip.side === 'right' ? controlDist : -controlDist)
  const controlY1 = startY
  const controlX2 = endX - (tooltip.side === 'right' ? controlDist : -controlDist)
  const controlY2 = endY
  
  return `M ${startX} ${startY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${endX} ${endY}`
}

onMounted(() => {
  document.addEventListener('mouseover', handleMouseOver)
  document.addEventListener('mouseout', handleMouseOut)
})

onUnmounted(() => {
  document.removeEventListener('mouseover', handleMouseOver)
  document.removeEventListener('mouseout', handleMouseOut)
})
</script>

<template>
  <Teleport to="body">
    <div 
      v-for="tooltip in tooltips"
      :key="tooltip.id"
      class="type-preview-tooltip"
      :class="{ 'slide-in-right': tooltip.side === 'right', 'slide-in-left': tooltip.side === 'left' }"
      :style="{ top: `${tooltip.position.y}px`, left: `${tooltip.position.x}px` }"
      @mouseenter="handleTooltipEnter"
      @mouseleave="handleTooltipLeave"
    >
      <div v-if="tooltip.loading" class="preview-loading">
        <div class="spinner"></div>
      </div>
      <div v-else class="preview-content" v-html="tooltip.content"></div>
    </div>
  </Teleport>
</template>

<style>
.type-preview-tooltip {
  position: absolute;
  z-index: 1000;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  box-shadow: var(--vp-shadow-3);
  padding: 12px;
  max-width: 400px;
  max-height: 400px;
  overflow: auto;
  pointer-events: auto;
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
  animation-duration: 0.3s;
  animation-fill-mode: both;
  animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-in-right {
  animation-name: slideInRight;
}

.slide-in-left {
  animation-name: slideInLeft;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.preview-header {
  margin-bottom: 8px;
  font-weight: 600;
  border-bottom: 1px solid var(--vp-c-divider);
  padding-bottom: 4px;
}

.preview-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.preview-line {
  white-space: nowrap;
  padding-left: 12px;
}

.preview-line.comment {
  color: var(--vp-c-text-3);
  font-style: italic;
}

.preview-loading {
  display: flex;
  justify-content: center;
  padding: 8px;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid var(--vp-c-divider);
  border-top-color: var(--vp-c-brand);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

.type-link {
  text-decoration: none;
  cursor: pointer;
}

.type-link .t {
  color: var(--vp-c-brand-1);
  text-decoration: underline;
  text-decoration-style: dotted;
}

.type-link:hover .t {
  text-decoration-style: solid;
}

.k { color: var(--vp-c-brand); }
.n { color: var(--vp-c-text-1); }
.t { color: var(--vp-c-brand-1); }
.p { color: var(--vp-c-text-2); }
.pn { color: var(--vp-c-text-1); }
.params { color: var(--vp-c-text-2); }
.optional { color: var(--vp-c-text-3); font-weight: normal; }

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
