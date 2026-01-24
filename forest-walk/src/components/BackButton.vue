<template>
  <Transition name="fade">
    <button 
      v-if="store.canGoBack && !store.activeStopPoint"
      @click="store.goBack"
      class="back-button"
      aria-label="返回上一個場景"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 19l-7-7 7-7" />
      </svg>
    </button>
  </Transition>
</template>

<script setup>
import { useGameStore } from '../stores/gameStore'

const store = useGameStore()
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
