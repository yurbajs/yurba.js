<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vitepress'

const visible = ref(false)
const content = ref('')
const position = ref({ x: 0, y: 0 })
const loading = ref(false)
const docsIndex = new Map<string, any>()
let docsLoaded = false
let hoverTimer: any = null

const route = useRoute()

// Types for our index
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
    const res = await fetch('/docs.json')
    const data = await res.json()
    buildIndex(data)
    docsLoaded = true
  } catch (e) {
    console.error('Failed to load docs.json', e)
  }
}

function buildIndex(node: DocNode, parentPath: string[] = []) {
  if (node.name) {
    // Index by name (simple lookup)
    // We might have collisions, but usually for unique exports it's fine
    // or we can use the full path if needed.
    // For now, let's index by name as it's what's in the URL mostly.
    if (!docsIndex.has(node.name)) {
      docsIndex.set(node.name, node)
    }
    
    // Also index by "Package.Name" if we can infer package
    // The top level children of root are packages
    if (parentPath.length > 0) {
       const fullPath = [...parentPath, node.name].join('.')
       docsIndex.set(fullPath, node)
    }

    if (node.children) {
      const currentPath = [...parentPath, node.name]
      node.children.forEach(child => buildIndex(child, currentPath))
    }
  }
}

function renderType(type: any): string {
  if (!type) return 'any'
  if (type.type === 'intrinsic') return `<span class="k">` + type.name + `</span>`
  if (type.type === 'reference') return `<span class="t">` + type.name + `</span>`
  if (type.type === 'union') return type.types.map(renderType).join(' | ')
  if (type.type === 'array') return renderType(type.elementType) + '[]'
  if (type.type === 'reflection' && type.declaration) {
      return '{ ... }' // Simplified for inline object types
  }
  return type.name || 'any'
}

function renderNode(node: DocNode): string {
  let html = `<div class="preview-header"><span class="k">${getKindString(node.kind)}</span> <span class="n">${node.name}</span></div>`
  
  // Interface / Class Properties
  if (node.children && (node.kind === 256 || node.kind === 128)) { // Interface or Class
    html += `<div class="preview-body">`
    html += `<span class="p">{</span>`
    
    // Filter relevant children (properties, methods)
    const props = node.children.filter(c => c.kind === 1024 || c.kind === 2048) // Property or Method
    
    // Limit to 5 items to keep preview small
    const displayProps = props.slice(0, 8)
    
    displayProps.forEach(child => {
      html += `<div class="preview-line">`
      html += `  <span class="pn">${child.name}</span>`
      
      if (child.kind === 2048 && child.signatures) { // Method
         const sig = child.signatures[0]
         const params = sig.parameters?.map((p: any) => `${p.name}: ${renderType(p.type)}`).join(', ') || ''
         const ret = renderType(sig.type)
         html += `(<span class="params">${params}</span>): <span class="t">${ret}</span>`
      } else { // Property
         html += `: <span class="t">${renderType(child.type)}</span>`
      }
      
      html += `</div>`
    })
    
    if (props.length > 8) {
       html += `<div class="preview-line comment">... and ${props.length - 8} more</div>`
    }
    
    html += `<span class="p">}</span>`
    html += `</div>`
  } 
  // Type Alias
  else if (node.kind === 4194304 && node.type) {
     html += `<div class="preview-body">`
     html += `<span class="k">type</span> <span class="n">${node.name}</span> = <span class="t">${renderType(node.type)}</span>`
     html += `</div>`
  }
  
  return html
}

function getKindString(kind: number): string {
  switch (kind) {
    case 128: return 'class'
    case 256: return 'interface'
    case 4194304: return 'type'
    case 64: return 'function'
    case 32: return 'variable'
    default: return 'symbol'
  }
}

async function handleMouseOver(e: MouseEvent) {
  const target = (e.target as HTMLElement).closest('a')
  if (!target) return

  // Restrict to main content area only
  if (!target.closest('.vp-doc')) return

  const href = target.getAttribute('href')
  if (!href || href.startsWith('http') || href.startsWith('#')) return

  // Check if it looks like an API link
  if (!href.includes('/classes/') && !href.includes('/interfaces/') && !href.includes('/type-aliases/') && !href.includes('/variables/')) return

  // Extract name from URL
  // e.g. /@yurbajs/rest/classes/PostResource.html -> PostResource
  const match = href.match(/\/([^/]+)\.html$/)
  if (!match) return
  const name = match[1]

  // Clear any existing timer
  if (hoverTimer) clearTimeout(hoverTimer)

  // Set position
  const rect = target.getBoundingClientRect()
  position.value = { 
    x: rect.left + window.scrollX, 
    y: rect.bottom + window.scrollY + 10 
  }

  hoverTimer = setTimeout(async () => {
    visible.value = true
    loading.value = true
    content.value = ''

    if (!docsLoaded) {
      await fetchDocs()
    }
    
    const node = docsIndex.get(name)
    if (node) {
      content.value = renderNode(node)
    } else {
      content.value = `<div class="preview-error">Definition not found for ${name}</div>`
    }
    loading.value = false
  }, 300)
}

function handleMouseOut() {
  if (hoverTimer) clearTimeout(hoverTimer)
  visible.value = false
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
      v-if="visible" 
      class="type-preview-tooltip"
      :style="{ top: `${position.y}px`, left: `${position.x}px` }"
    >
      <div v-if="loading" class="preview-loading">
        <div class="spinner"></div>
      </div>
      <div v-else class="preview-content" v-html="content"></div>
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
  max-width: 450px;
  max-height: 400px;
  overflow: auto;
  pointer-events: none;
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
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

/* Syntax Highlighting Colors */
.k { color: var(--vp-c-brand); } /* Keyword */
.n { color: var(--vp-c-text-1); } /* Name */
.t { color: var(--vp-c-brand-1); } /* Type */
.p { color: var(--vp-c-text-2); } /* Punctuation */
.pn { color: var(--vp-c-text-1); } /* Property Name */
.params { color: var(--vp-c-text-2); }

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
