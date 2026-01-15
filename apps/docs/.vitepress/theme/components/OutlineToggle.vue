<template>
  <button class="outline-toggle" @click="toggleOutline" :title="isHidden ? 'Показати меню' : 'Приховати меню'">
    <svg v-if="!isHidden" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M18 6L6 18M6 6l12 12"/>
    </svg>
    <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M3 12h18M3 6h18M3 18h18"/>
    </svg>
  </button>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const isHidden = ref(false);

onMounted(() => {
  isHidden.value = localStorage.getItem('outline-hidden') === 'true';
  if (isHidden.value) {
    document.documentElement.classList.add('outline-hidden');
  }
});

const toggleOutline = () => {
  isHidden.value = !isHidden.value;
  localStorage.setItem('outline-hidden', String(isHidden.value));
  document.documentElement.classList.toggle('outline-hidden', isHidden.value);
};
</script>

<style scoped>
.outline-toggle {
  position: fixed;
  top: calc(var(--vp-nav-height) + 12px);
  right: 12px;
  z-index: 40;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-2);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.outline-toggle:hover {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
  transform: scale(1.05);
}

.outline-toggle:active {
  transform: scale(0.95);
}

.outline-toggle svg {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.outline-toggle:hover svg {
  transform: rotate(90deg);
}

@media (max-width: 1279px) {
  .outline-toggle {
    display: none;
  }
}
</style>
