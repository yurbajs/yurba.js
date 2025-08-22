<script setup>
import { useData } from 'vitepress'
import { ref, onMounted, computed } from 'vue'

const { isDark, frontmatter } = useData()
const isClient = ref(false)

const actions = computed(() => frontmatter.value.HeroActions || [])

const getIconSrc = (action) => {
  if (!isClient.value) return action.icon
  
  if (action.darkIcon && isDark.value) {
    return action.darkIcon
  }
  
  if (action.icon.includes('github') && isDark.value) {
    return action.icon.replace('.svg', '-white.svg')
  }
  
  return action.icon
}

onMounted(() => {
  isClient.value = true
})
</script>

<template>
  <div class="VPHero">
    <div class="container">
      <div class="actions">
        <div v-for="action in actions" :key="action.text" class="action">
          <a 
            :class="['Button', action.theme]"
            :href="action.link"
          >
            <img 
              v-if="action.icon" 
              :src="getIconSrc(action)" 
              width="16" 
              height="16" 
              :alt="action.text"
            >
            {{ action.text }}
            <svg v-if="action.external" class="external-link-icon" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15,3 21,3 21,9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import './HeroActions.css';
</style>