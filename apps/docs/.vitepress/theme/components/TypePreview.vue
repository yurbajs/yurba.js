<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vitepress'

const visible = ref(false)
const content = ref('')
const position = ref({ x: 0, y: 0 })
const loading = ref(false)
const cache = new Map<string, string>()
let hoverTimer: any = null

const route = useRoute()

// Function to extract relevant content from the fetched HTML
function extractContent(html: string): string | null {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  
  // Try to find the main signature or definition
  // TypeDoc usually puts the main signature in .tsd-signature or similar
  // Or for interfaces, the code block
  
  // Strategy 1: Look for the first code block which usually contains the definition
  const codeBlock = doc.querySelector('.vp-doc pre code') || doc.querySelector('.tsd-signature')
  
  if (codeBlock) {
    // Limit length to avoid huge popups
    return codeBlock.innerHTML
  }
  
  // Strategy 2: Look for a summary or short description
  const summary = doc.querySelector('.vp-doc p')
  if (summary) {
    return summary.innerHTML
  }

  return null
}

async function handleMouseOver(e: MouseEvent) {
  const target = (e.target as HTMLElement).closest('a')
  if (!target) return

  const href = target.getAttribute('href')
  if (!href || href.startsWith('http') || href.startsWith('#')) return

  // Check if it looks like an API link (e.g. classes, interfaces, types)
  if (!href.includes('/classes/') && !href.includes('/interfaces/') && !href.includes('/type-aliases/')) return

  // Clear any existing timer
  if (hoverTimer) clearTimeout(hoverTimer)

  // Set position near the cursor/element
  const rect = target.getBoundingClientRect()
  position.value = { 
    x: rect.left + window.scrollX, 
    y: rect.bottom + window.scrollY + 10 
  }

  hoverTimer = setTimeout(async () => {
    visible.value = true
    
    if (cache.has(href)) {
      content.value = cache.get(href)!
      return
    }

    loading.value = true
    content.value = '' // Clear previous content while loading

    try {
      const res = await fetch(href)
      const text = await res.text()
      const extracted = extractContent(text)
      
      if (extracted) {
        content.value = extracted
        cache.set(href, extracted)
      } else {
        visible.value = false // Hide if nothing useful found
      }
    } catch (err) {
      console.error('Failed to fetch preview', err)
      visible.value = false
    } finally {
      loading.value = false
    }
  }, 300) // 300ms delay
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
      <div v-else-if="content" class="preview-content" v-html="content"></div>
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
  max-height: 300px;
  overflow: auto;
  pointer-events: none; /* Let clicks pass through to underlying elements if needed, or allow interaction? usually tooltips are non-interactive */
  transform: translateY(0);
  transition: opacity 0.2s, transform 0.2s;
}

.preview-content pre {
  margin: 0;
  padding: 8px;
  background: var(--vp-c-bg-alt);
  border-radius: 4px;
  font-size: 13px;
  overflow-x: auto;
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

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
