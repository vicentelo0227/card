<template>
  <Transition name="title">
    <div 
      v-if="store.currentScene && !store.activeStopPoint"
      class="scene-title"
    >
      {{ store.currentScene.title }}
    </div>
  </Transition>
</template>

<script setup>
import { useGameStore } from '../stores/gameStore'

const store = useGameStore()
</script>

<style scoped>
.title-enter-active {
  transition: opacity 0.6s ease 0.4s, transform 0.6s ease 0.4s;
}

.title-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.title-enter-from {
  opacity: 0;
  transform: translate(-50%, -10px);
}

.title-leave-to {
  opacity: 0;
  transform: translate(-50%, 10px);
}
</style>
