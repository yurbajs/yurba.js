<template>
  <div class="cta-section">
    <div class="cta-content">
      <h2>{{ title }}</h2>
      <p>{{ description }}</p>
      <a :href="link" class="cta-button">{{ buttonText }}</a>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string
  description?: string
  buttonText?: string
  link?: string
}

withDefaults(defineProps<Props>(), {
  title: 'Готові почати?',
  description: 'Подивіться приклади та проекти створені з Yurba.js',
  buttonText: 'Переглянути Showcase',
  link: '/showcase'
})
</script>

<style scoped>
.cta-section {
  padding: 4rem 2rem;
  text-align: center;
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
  margin: 2rem 0;
}

.cta-content h2 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--vp-c-brand-1);
  margin-bottom: 1rem;
}

.cta-content p {
  font-size: 1.1rem;
  color: var(--vp-c-text-2);
  margin-bottom: 2rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.cta-button {
  display: inline-block;
  padding: 12px 24px;
  background: var(--vp-c-brand-1);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.cta-button:hover {
  background: var(--vp-c-brand-2);
  transform: translateY(-2px);
}
</style>