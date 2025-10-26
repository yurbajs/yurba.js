<template>
  <div class="enhanced-hero">
    <!-- Анімований фон -->
    <div class="hero-background">
      <div class="floating-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
      </div>
    </div>
    
    <!-- Основний контент -->
    <div class="hero-content">
      <div class="hero-badge">
        <span class="badge-text">🚀 Нова версія v{{ version }}</span>
      </div>
      
      <h1 class="hero-title">
        <span class="title-main">Yurba.js</span>
        <span class="title-sub">- Let's go?</span>
      </h1>
      
      <p class="hero-description">
        Потужна бібліотека для створення ботів та інтеграції з Yurba API.
        Швидка, надійна та проста у використанні.
      </p>
      
      <!-- Статистика -->
      <div class="hero-stats">
        <div class="stat-item">
          <div class="stat-number">{{ downloads }}</div>
          <div class="stat-label">Завантажень</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ stars }}</div>
          <div class="stat-label">GitHub Stars</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ contributors }}</div>
          <div class="stat-label">Контрибюторів</div>
        </div>
      </div>
      
      <!-- Кнопки дій -->
      <div class="hero-actions">
        <a href="/start" class="action-btn primary">
          <span class="btn-icon">📚</span>
          <span class="btn-text">Почати</span>
        </a>
        <a :href="links.docs" class="action-btn secondary">
          <span class="btn-icon">📖</span>
          <span class="btn-text">Документація</span>
        </a>
        <a :href="links.github" class="action-btn outline">
          <span class="btn-icon">⭐</span>
          <span class="btn-text">GitHub</span>
        </a>
      </div>
      
      <!-- Швидкий старт -->
      <div class="quick-start">
        <div class="quick-start-title">Швидкий старт:</div>
        <div class="code-snippet">
          <code>npm install yurba.js</code>
          <button class="copy-btn" @click="copyToClipboard('npm install yurba.js')">
            <span v-if="!copied">📋</span>
            <span v-else>✅</span>
          </button>
        </div>
      </div>
    </div>
    
    <!-- Декоративні елементи -->
    <div class="hero-decoration">
      <div class="glow-orb glow-1"></div>
      <div class="glow-orb glow-2"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useData } from 'vitepress'
import links from '../../links.json'
import versions from '../../versions.json'

const { isDark } = useData()
const copied = ref(false)
const version = ref(versions.current)
const downloads = ref('10K+')
const stars = ref('50+')
const contributors = ref('5+')

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy: ', err)
  }
}

// Анімація чисел при завантаженні
onMounted(() => {
  // Тут можна додати API виклики для отримання реальної статистики
})
</script>

<style scoped>
.enhanced-hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: 
    radial-gradient(circle at 20% 80%, rgba(189, 52, 254, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(65, 209, 255, 0.1) 0%, transparent 50%);
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.floating-shapes {
  position: relative;
  width: 100%;
  height: 100%;
}

.shape {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(189, 52, 254, 0.3), rgba(65, 209, 255, 0.3));
  filter: blur(40px);
  animation: float 6s ease-in-out infinite;
}

.shape-1 {
  width: 200px;
  height: 200px;
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}

.shape-2 {
  width: 150px;
  height: 150px;
  top: 60%;
  right: 15%;
  animation-delay: 2s;
}

.shape-3 {
  width: 100px;
  height: 100px;
  bottom: 20%;
  left: 60%;
  animation-delay: 4s;
}

.hero-content {
  text-align: center;
  max-width: 800px;
  padding: 2rem;
  z-index: 10;
  position: relative;
}

.hero-badge {
  display: inline-block;
  background: rgba(65, 209, 255, 0.1);
  border: 1px solid rgba(65, 209, 255, 0.3);
  border-radius: 50px;
  padding: 0.5rem 1.5rem;
  margin-bottom: 2rem;
  backdrop-filter: blur(10px);
  animation: slideInDown 0.8s ease-out;
}

.badge-text {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--vp-c-brand-1);
}

.hero-title {
  margin-bottom: 1.5rem;
  animation: slideInUp 0.8s ease-out 0.2s both;
}

.title-main {
  display: block;
  font-size: 4rem;
  font-weight: 900;
  background: linear-gradient(135deg, #bd34fe 0%, #41d1ff 50%, #00f5ff 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1.1;
  margin-bottom: 0.5rem;
}

.title-sub {
  display: block;
  font-size: 2rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
  opacity: 0.8;
}

.hero-description {
  font-size: 1.25rem;
  line-height: 1.6;
  color: var(--vp-c-text-2);
  margin-bottom: 3rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  animation: slideInUp 0.8s ease-out 0.4s both;
}

.hero-stats {
  display: flex;
  justify-content: center;
  gap: 3rem;
  margin-bottom: 3rem;
  animation: slideInUp 0.8s ease-out 0.6s both;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 2rem;
  font-weight: 800;
  color: var(--vp-c-brand-1);
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.9rem;
  color: var(--vp-c-text-3);
  font-weight: 500;
}

.hero-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 3rem;
  flex-wrap: wrap;
  animation: slideInUp 0.8s ease-out 0.8s both;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.action-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.action-btn:hover::before {
  left: 100%;
}

.action-btn.primary {
  background: linear-gradient(135deg, #bd34fe, #41d1ff);
  color: white;
  box-shadow: 0 8px 32px rgba(65, 209, 255, 0.3);
}

.action-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(65, 209, 255, 0.4);
}

.action-btn.secondary {
  background: rgba(65, 209, 255, 0.1);
  border: 1px solid rgba(65, 209, 255, 0.3);
  color: var(--vp-c-brand-1);
  backdrop-filter: blur(10px);
}

.action-btn.secondary:hover {
  background: rgba(65, 209, 255, 0.2);
  transform: translateY(-2px);
}

.action-btn.outline {
  background: transparent;
  border: 2px solid rgba(65, 209, 255, 0.3);
  color: var(--vp-c-brand-1);
}

.action-btn.outline:hover {
  background: rgba(65, 209, 255, 0.1);
  border-color: rgba(65, 209, 255, 0.5);
  transform: translateY(-2px);
}

.quick-start {
  animation: slideInUp 0.8s ease-out 1s both;
}

.quick-start-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
  margin-bottom: 1rem;
}

.code-snippet {
  display: inline-flex;
  align-items: center;
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(65, 209, 255, 0.2);
  border-radius: 12px;
  padding: 1rem 1.5rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 1rem;
  color: #e2e8f0;
  backdrop-filter: blur(10px);
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

.hero-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.glow-orb {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(65, 209, 255, 0.4) 0%, transparent 70%);
  filter: blur(60px);
  animation: pulse 4s ease-in-out infinite;
}

.glow-1 {
  width: 300px;
  height: 300px;
  top: 10%;
  right: 10%;
  animation-delay: 0s;
}

.glow-2 {
  width: 200px;
  height: 200px;
  bottom: 20%;
  left: 20%;
  animation-delay: 2s;
}

/* Анімації */
@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}

@keyframes pulse {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.1); }
}

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Адаптивність */
@media (max-width: 768px) {
  .title-main {
    font-size: 3rem;
  }
  
  .title-sub {
    font-size: 1.5rem;
  }
  
  .hero-description {
    font-size: 1.1rem;
  }
  
  .hero-stats {
    gap: 2rem;
  }
  
  .stat-number {
    font-size: 1.5rem;
  }
  
  .hero-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .action-btn {
    width: 100%;
    max-width: 280px;
  }
}

@media (max-width: 480px) {
  .enhanced-hero {
    min-height: 80vh;
  }
  
  .hero-content {
    padding: 1rem;
  }
  
  .title-main {
    font-size: 2.5rem;
  }
  
  .hero-stats {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>