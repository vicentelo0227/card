<template>
  <div class="music-indicator" :class="{ 'opacity-30': !isActive }">
    <div 
      v-for="i in 5" 
      :key="i" 
      class="music-bar"
      :style="{ 
        animationPlayState: isActive ? 'running' : 'paused',
        height: isActive ? undefined : '4px'
      }"
    ></div>
  </div>
</template>

<script setup>
defineProps({
  isActive: {
    type: Boolean,
    default: true
  }
})
</script>
