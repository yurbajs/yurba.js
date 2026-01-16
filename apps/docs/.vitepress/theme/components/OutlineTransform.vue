<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { useRoute } from 'vitepress';

const route = useRoute();

function transformOutline() {
  const outlineLinks = document.querySelectorAll('.VPDocAsideOutline .outline-link');
  outlineLinks.forEach((link) => {
    const text = link.textContent || '';
    const match = text.match(/^\.?(\w+)\([^)]*\)/);
    if (match) {
      const methodName = match[1];
      link.textContent = `.${methodName}`;
    }
  });
}

onMounted(() => {
  setTimeout(transformOutline, 100);
});

watch(() => route.path, () => {
  setTimeout(transformOutline, 100);
});
</script>

<template>
  <div style="display: none;"></div>
</template>
