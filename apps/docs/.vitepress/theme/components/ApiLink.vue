<template>
  <a :href="href" class="api-link" @mouseenter="onEnter" @mouseleave="onLeave" ref="linkRef">
    <slot>{{ name }}</slot>
    <div v-if="show && content" class="tooltip" :class="{ 'tooltip-bottom': showBelow }" v-html="content" @mouseenter="onTooltipEnter" @mouseleave="onTooltipLeave"></div>
  </a>
</template>

<script setup>
import { ref } from 'vue';
const props = defineProps({ href: String, name: String });
const show = ref(false);
const content = ref('');
const showBelow = ref(false);
const linkRef = ref(null);
let hideTimeout = null;

const onEnter = async () => {
  clearTimeout(hideTimeout);
  show.value = true;
  
  if (linkRef.value) {
    const rect = linkRef.value.getBoundingClientRect();
    const tooltipHeight = 500;
    const navbarHeight = 60;
    showBelow.value = rect.top - tooltipHeight < navbarHeight;
  }
  
  if (content.value) return;
  
  try {
    const mdPath = props.href.replace('.html', '.md');
    const res = await fetch(mdPath);
    const text = await res.text();
    
    const lines = text.split('\n');
    const propsIdx = lines.findIndex(l => l === '## Properties');
    if (propsIdx === -1) return;
    
    const items = [];
    for (let i = propsIdx + 1; i < lines.length; i++) {
      const line = lines[i];
      if (line.startsWith('### ')) {
        const name = line.replace('### ', '');
        const typeLine = lines[i + 2];
        if (typeLine?.startsWith('> **')) {
          const type = typeLine.match(/\*\*.*?\*\*: (.+)/)?.[1] || '';
          items.push(`<div><code>${name}</code>: ${type}</div>`);
        }
      }
      if (line.startsWith('## ') && i > propsIdx + 1) break;
    }
    
    content.value = `<strong>${props.name}</strong>${items.join('')}`;
  } catch (e) {}
};

const onLeave = () => {
  hideTimeout = setTimeout(() => {
    show.value = false;
  }, 300);
};

const onTooltipEnter = () => {
  clearTimeout(hideTimeout);
};

const onTooltipLeave = () => {
  show.value = false;
};
</script>

<style scoped>
.api-link { position: relative; }
.tooltip {
  position: absolute;
  bottom: 100%;
  left: 0;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 12px;
  width: 400px;
  max-height: 500px;
  overflow-y: auto;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 100;
  margin-bottom: 8px;
  pointer-events: auto;
}
.tooltip strong { display: block; margin-bottom: 8px; font-size: 15px; }
.tooltip p { margin: 0; font-size: 14px; color: var(--vp-c-text-2); }
.tooltip code { background: var(--vp-code-bg); padding: 2px 6px; border-radius: 4px; font-size: 13px; }
.tooltip-bottom {
  bottom: auto;
  top: 100%;
  margin-bottom: 0;
  margin-top: 8px;
}
</style>
