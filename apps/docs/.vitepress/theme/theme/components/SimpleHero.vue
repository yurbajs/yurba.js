<template>
  <div class="simple-hero">
    <div class="hero-content">
      <div class="hero-badge">
        🚀 Нова версія v{{ version }}
      </div>
      
      <h1 class="hero-title">
        <span class="title-main">Yurba.js</span>
        <span class="title-sub">- Let's go?</span>
      </h1>
      
      <p class="hero-description">
        Потужна бібліотека для створення ботів та інтеграції з Yurba API.
        Швидка, надійна та проста у використанні.
      </p>
      
      <div class="quick-start">
        <div class="quick-start-title">Швидкий старт:</div>
        <div class="code-snippet">
          <code>npm install yurba.js</code>
          <button class="copy-btn" @click="copyToClipboard" :title="copied ? 'Скопійовано!' : 'Копіювати'">
            {{ copied ? '✅' : '📋' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import versions from '../../versions.json'

const version = ref(versions.current)
const copied = ref(false)

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText('npm install yurba.js')
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}
</script>

<style scoped>
.simple-hero {
  padding: 4rem 2rem;
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
}

.hero-badge {
  display: inline-block;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 20px;
  padding: 0.5rem 1rem;
  margin-bottom: 2rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--vp-c-brand-1);
}

.hero-title {
  margin-bottom: 1.5rem;
}

.title-main {
  display: block;
  font-size: 3.5rem;
  font-weight: 800;
  color: var(--vp-c-brand-1);
  line-height: 1.1;
  margin-bottom: 0.5rem;
}

.title-sub {
  display: block;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
}

.hero-description {
  font-size: 1.2rem;
  line-height: 1.6;
  color: var(--vp-c-text-2);
  margin-bottom: 3rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.quick-start-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin-bottom: 1rem;
}

.code-snippet {
  display: inline-flex;
  align-items: center;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 1rem 1.5rem;
  font-family: var(--vp-font-family-mono);
  font-size: 1rem;
  gap: 1rem;
}

.copy-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  transition: transform 0.2s ease;
}

.copy-btn:hover {
  transform: scale(1.1);
}

@media (max-width: 768px) {
  .simple-hero {
    padding: 3rem 1rem;
  }
  
  .title-main {
    font-size: 2.5rem;
  }
  
  .title-sub {
    font-size: 1.2rem;
  }
  
  .hero-description {
    font-size: 1.1rem;
  }
}
</style>