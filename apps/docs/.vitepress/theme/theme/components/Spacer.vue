<template>
  <div :style="{ height: height }" />
</template>

<script setup lang="ts">
interface Props {
  height?: string
}

withDefaults(defineProps<Props>(), {
  height: '2rem'
})
</script>