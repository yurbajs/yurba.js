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
  padding: 3rem 2rem;
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  background-size: 300% 300%;
  animation: gradient 8s ease infinite;
  border-radius: 16px;
  margin: 2rem 0;
}

@keyframes gradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.cta-content h2 {
  font-size: 2.2rem;
  font-weight: 700;
  color: white;
  margin-bottom: 1rem;
}

.cta-content p {
  font-size: 1.1rem;
  color: rgba(255,255,255,0.95);
  margin-bottom: 2rem;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

.cta-button {
  display: inline-block;
  padding: 14px 28px;
  background: rgba(255,255,255,0.2);
  color: white;
  text-decoration: none;
  border-radius: 25px;
  font-weight: 600;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255,255,255,0.3);
  transition: all 0.3s ease;
}

.cta-button:hover {
  background: rgba(255,255,255,0.3);
  transform: translateY(-2px);
}
</style>