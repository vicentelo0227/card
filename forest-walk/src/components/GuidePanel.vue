<template>
  <Transition name="panel">
    <div 
      v-if="store.activeStopPoint && stopPointData"
      class="guide-panel"
    >
      <!-- Close button -->
      <button 
        @click="close"
        class="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-gold-muted/50 hover:text-gold-muted transition-colors"
        aria-label="關閉"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <!-- Content -->
      <div class="max-w-lg mx-auto pt-2">
        <!-- Title -->
        <h2 class="font-serif text-2xl md:text-3xl text-gold-muted tracking-wider mb-8">
          {{ stopPointData.title }}
        </h2>

        <!-- Description -->
        <div class="text-gold-muted/70 leading-relaxed whitespace-pre-line text-base md:text-lg">
          {{ stopPointData.description }}
        </div>

        <!-- Continue button -->
        <button 
          @click="close"
          class="mt-10 text-gold-muted/50 text-sm tracking-wider hover:text-gold-muted transition-colors"
        >
          繼續漫步 →
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue'
import { useGameStore } from '../stores/gameStore'

const store = useGameStore()

const stopPointData = computed(() => store.currentStopPointData)

function close() {
  store.closeStopPoint()
}
</script>

<style scoped>
.panel-enter-active {
  animation: slideUp 0.5s ease-out forwards;
}

.panel-leave-active {
  animation: slideDown 0.4s ease-in forwards;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes slideDown {
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(100%);
    opacity: 0;
  }
}
</style>
