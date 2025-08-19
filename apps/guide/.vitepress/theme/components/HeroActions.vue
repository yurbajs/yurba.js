<script setup>
import { useData } from 'vitepress'
import { ref, onMounted } from 'vue'
import links from '../../links.json'

const { isDark } = useData()
const isClient = ref(false)

onMounted(() => {
  isClient.value = true
})
</script>

<template>
  <div class="VPHero">
    <div class="container">
      <div class="actions">
          <div class="action">
            <a class="Button brand" href="/introduction">
              Guide
            </a>
          </div>
          <div class="action">
            <a class="Button alt" :href="links.docs">
              Documentation
            </a>
          </div>
          <div class="action">
            <a class="Button" :href="links.npm">
              <img src="/icons/npm.svg" width="16" height="16" alt="NPM">
              NPM
            </a>
          </div>
          <div class="action">
            <a class="Button" :href="links.github">
              <img :src="isClient && isDark ? '/icons/github-mark-white.svg' : '/icons/github-mark.svg'" width="16" height="16" alt="GitHub">
              GitHub
            </a>
          </div>
          <div class="action">
            <a class="Button" :href="links.yurba">
              <img :src="isClient && isDark ? '/icons/yurba.svg' : '/icons/yurba-blue.svg'" width="16" height="16" alt="Yurba" class="yurba-icon">
              Yurba
            </a>
          </div>
        </div>
      </div>
    </div>
</template>

<style scoped>
@import './HeroActions.css';
</style>