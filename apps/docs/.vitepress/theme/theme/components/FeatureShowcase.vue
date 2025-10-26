<template>
  <div class="feature-showcase">
    <div class="container">
      <div class="section-header">
        <h2 class="section-title">Чому Yurba.js?</h2>
        <p class="section-subtitle">
          Сучасна бібліотека з усім необхідним для створення потужних ботів
        </p>
      </div>
      
      <div class="features-grid">
        <div 
          v-for="(feature, index) in features" 
          :key="index"
          class="feature-card"
          :class="{ 'featured': feature.featured }"
          @mouseenter="playHoverSound"
        >
          <div class="feature-icon">
            <span class="icon">{{ feature.icon }}</span>
            <div class="icon-glow"></div>
          </div>
          
          <div class="feature-content">
            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-description">{{ feature.description }}</p>
            
            <div v-if="feature.code" class="feature-code">
              <pre><code>{{ feature.code }}</code></pre>
            </div>
            
            <div v-if="feature.stats" class="feature-stats">
              <div 
                v-for="(stat, statIndex) in feature.stats" 
                :key="statIndex"
                class="stat"
              >
                <span class="stat-value">{{ stat.value }}</span>
                <span class="stat-label">{{ stat.label }}</span>
              </div>
            </div>
          </div>
          
          <div class="feature-overlay"></div>
        </div>
      </div>
      
      <!-- Порівняння з іншими бібліотеками -->
      <div class="comparison-section">
        <h3 class="comparison-title">Порівняння з іншими рішеннями</h3>
        <div class="comparison-table">
          <div class="comparison-header">
            <div class="feature-name">Функція</div>
            <div class="library-name">Yurba.js</div>
            <div class="library-name">Інші</div>
          </div>
          
          <div 
            v-for="(comparison, index) in comparisons" 
            :key="index"
            class="comparison-row"
          >
            <div class="feature-name">{{ comparison.feature }}</div>
            <div class="library-value yurba">
              <span class="status" :class="comparison.yurba.status">
                {{ comparison.yurba.value }}
              </span>
            </div>
            <div class="library-value other">
              <span class="status" :class="comparison.other.status">
                {{ comparison.other.value }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const features = ref([
  {
    icon: '⚡',
    title: 'Швидкість',
    description: 'Оптимізована архітектура для максимальної продуктивності',
    featured: true,
    stats: [
      { value: '<50ms', label: 'Час відповіді' },
      { value: '99.9%', label: 'Uptime' }
    ],
    code: `const bot = new YurbaClient()
await bot.login(token) // Миттєве підключення`
  },
  {
    icon: '🛡️',
    title: 'Безпека',
    description: 'Вбудовані механізми захисту та валідації даних',
    code: `// Автоматична валідація
bot.on('message', (msg) => {
  // Безпечна обробка
})`
  },
  {
    icon: '🎯',
    title: 'Простота',
    description: 'Інтуїтивний API, схожий на Discord.js',
    code: `// Знайомий синтаксис
bot.on('ready', () => {
  console.log('Bot is ready!')
})`
  },
  {
    icon: '🔧',
    title: 'Гнучкість',
    description: 'Модульна архітектура для будь-яких потреб',
    featured: true,
    stats: [
      { value: '50+', label: 'Методів API' },
      { value: '20+', label: 'Подій' }
    ]
  },
  {
    icon: '📚',
    title: 'TypeScript',
    description: 'Повна підтримка TypeScript з автодоповненням',
    code: `interface BotConfig {
  token: string
  prefix?: string
}`
  },
  {
    icon: '🌐',
    title: 'Спільнота',
    description: 'Активна спільнота та регулярні оновлення',
    stats: [
      { value: '1000+', label: 'Користувачів' },
      { value: '24/7', label: 'Підтримка' }
    ]
  }
])

const comparisons = ref([
  {
    feature: 'Швидкість запуску',
    yurba: { value: '< 1 сек', status: 'excellent' },
    other: { value: '3-5 сек', status: 'average' }
  },
  {
    feature: 'Розмір бібліотеки',
    yurba: { value: '< 500KB', status: 'excellent' },
    other: { value: '> 2MB', status: 'poor' }
  },
  {
    feature: 'TypeScript підтримка',
    yurba: { value: 'Повна', status: 'excellent' },
    other: { value: 'Часткова', status: 'average' }
  },
  {
    feature: 'Документація',
    yurba: { value: 'Детальна', status: 'excellent' },
    other: { value: 'Базова', status: 'average' }
  },
  {
    feature: 'Оновлення',
    yurba: { value: 'Щотижня', status: 'excellent' },
    other: { value: 'Рідко', status: 'poor' }
  }
])

const playHoverSound = () => {
  // Можна додати звуковий ефект при наведенні
}
</script>

<style scoped>
.feature-showcase {
  padding: 6rem 0;
  background: 
    radial-gradient(circle at 30% 20%, rgba(189, 52, 254, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 70% 80%, rgba(65, 209, 255, 0.05) 0%, transparent 50%);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.section-header {
  text-align: center;
  margin-bottom: 4rem;
}

.section-title {
  font-size: 3rem;
  font-weight: 800;
  background: linear-gradient(135deg, #bd34fe, #41d1ff);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 1rem;
}

.section-subtitle {
  font-size: 1.25rem;
  color: var(--vp-c-text-2);
  max-width: 600px;
  margin: 0 auto;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  margin-bottom: 6rem;
}

.feature-card {
  position: relative;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(65, 209, 255, 0.1);
  border-radius: 20px;
  padding: 2rem;
  backdrop-filter: blur(20px);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  cursor: pointer;
}

.feature-card:hover {
  transform: translateY(-8px);
  border-color: rgba(65, 209, 255, 0.3);
  box-shadow: 0 20px 60px rgba(65, 209, 255, 0.2);
}

.feature-card.featured {
  background: linear-gradient(135deg, rgba(189, 52, 254, 0.1), rgba(65, 209, 255, 0.1));
  border-color: rgba(65, 209, 255, 0.3);
}

.feature-card.featured::before {
  content: '⭐ Рекомендовано';
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: var(--yurba-gradient-main);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.feature-icon {
  position: relative;
  display: inline-block;
  margin-bottom: 1.5rem;
}

.icon {
  font-size: 3rem;
  display: block;
  position: relative;
  z-index: 2;
}

.icon-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  background: radial-gradient(circle, rgba(65, 209, 255, 0.3) 0%, transparent 70%);
  border-radius: 50%;
  filter: blur(20px);
  animation: pulse 2s ease-in-out infinite;
}

.feature-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--vp-c-brand-1);
  margin-bottom: 1rem;
}

.feature-description {
  color: var(--vp-c-text-2);
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.feature-code {
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(65, 209, 255, 0.2);
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.9rem;
  overflow-x: auto;
}

.feature-code pre {
  margin: 0;
  color: #e2e8f0;
}

.feature-stats {
  display: flex;
  gap: 2rem;
}

.stat {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--vp-c-brand-1);
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.8rem;
  color: var(--vp-c-text-3);
  font-weight: 500;
}

.feature-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(189, 52, 254, 0.05), rgba(65, 209, 255, 0.05));
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.feature-card:hover .feature-overlay {
  opacity: 1;
}

/* Порівняння */
.comparison-section {
  margin-top: 4rem;
}

.comparison-title {
  font-size: 2rem;
  font-weight: 700;
  text-align: center;
  color: var(--vp-c-brand-1);
  margin-bottom: 2rem;
}

.comparison-table {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(65, 209, 255, 0.1);
  border-radius: 16px;
  overflow: hidden;
  backdrop-filter: blur(20px);
}

.comparison-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  background: rgba(65, 209, 255, 0.1);
  padding: 1rem;
  font-weight: 700;
  color: var(--vp-c-brand-1);
}

.comparison-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  padding: 1rem;
  border-top: 1px solid rgba(65, 209, 255, 0.1);
  transition: background 0.2s ease;
}

.comparison-row:hover {
  background: rgba(65, 209, 255, 0.05);
}

.feature-name {
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.library-name {
  text-align: center;
  font-weight: 600;
}

.library-value {
  text-align: center;
}

.status {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
}

.status.excellent {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
}

.status.average {
  background: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
}

.status.poor {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

/* Анімації */
@keyframes pulse {
  0%, 100% { opacity: 0.3; transform: translate(-50%, -50%) scale(1); }
  50% { opacity: 0.6; transform: translate(-50%, -50%) scale(1.1); }
}

/* Адаптивність */
@media (max-width: 768px) {
  .features-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .feature-card {
    padding: 1.5rem;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .comparison-header,
  .comparison-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
    text-align: center;
  }
  
  .feature-name {
    font-weight: 700;
    margin-bottom: 0.5rem;
  }
  
  .library-value {
    margin-bottom: 0.5rem;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0 1rem;
  }
  
  .feature-showcase {
    padding: 4rem 0;
  }
  
  .feature-stats {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>