<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vitepress'

const router = useRouter()
const route = useRoute()
const isOpen = ref(false)
const containerRef = ref<HTMLElement | null>(null)

const options = [
  { label: 'Yurba.js', value: 'yurba.js', path: '/yurba.js/' },
  { label: '@yurbajs/rest', value: '@yurbajs/rest', path: '/@yurbajs/rest/' },
  { label: '@yurbajs/ws', value: '@yurbajs/ws', path: '/@yurbajs/ws/' },
  { label: '@yurbajs/types', value: '@yurbajs/types', path: '/@yurbajs/types/' }
]

const selected = ref(options[0].label)

watch(() => route.path, (path) => {
  if (path === '/' || path === '/index.html') {
    selected.value = 'Yurba.js'
    return
  }
  const option = options.find(o => path.startsWith(o.path))
  if (option) {
    selected.value = option.label
  }
}, { immediate: true })

function toggle() {
  isOpen.value = !isOpen.value
}

function select(option: { label: string, value: string, path: string }) {
  selected.value = option.label
  isOpen.value = false
  router.go(option.path)
}

function handleClickOutside(event: MouseEvent) {
  if (containerRef.value && !containerRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="sidebar-select-container" ref="containerRef">
    <button class="select-button" @click="toggle" :aria-expanded="isOpen">
      <span class="label">{{ selected }}</span>
      <span class="icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="chevron" :class="{ rotate: isOpen }"><polyline points="6 9 12 15 18 9"></polyline></svg>
      </span>
    </button>
    <transition name="dropdown">
      <div v-if="isOpen" class="dropdown-menu">
        <div 
          v-for="option in options" 
          :key="option.value" 
          class="option" 
          :class="{ active: selected === option.label }"
          @click="select(option)"
        >
          {{ option.label }}
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.sidebar-select-container {
  padding: 16px 20px 0;
  position: relative;
  margin-bottom: 8px;
}

.select-button {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: var(--vp-c-bg-alt);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  color: var(--vp-c-text-1);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: border-color 0.25s, background-color 0.25s;
}

.select-button:hover {
  border-color: var(--vp-c-brand);
}

.icon {
  display: flex;
  align-items: center;
  color: var(--vp-c-text-2);
}

.chevron {
  transition: transform 0.25s;
}

.chevron.rotate {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% - 4px);
  left: 24px;
  right: 24px;
  background-color: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  box-shadow: var(--vp-shadow-3);
  z-index: 100;
  overflow: hidden;
  padding: 4px;
  transform-origin: top;
}

.option {
  padding: 6px 12px;
  font-size: 13px;
  color: var(--vp-c-text-2);
  cursor: pointer;
  border-radius: 4px;
  transition: color 0.25s, background-color 0.25s;
}

.option:hover {
  color: var(--vp-c-text-1);
  background-color: var(--vp-c-bg-soft);
}

.option.active {
  color: var(--vp-c-brand);
  background-color: var(--vp-c-bg-soft);
  font-weight: 600;
}

/* Transitions */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.96);
}
</style>
