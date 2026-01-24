<template>
  <div class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-forest-dark">
    <!-- Blurred forest background image -->
    <div class="absolute inset-0">
      <img 
        src="/images/Lucid_Origin_Cinematic_nature_photography_slowmoving_firstpers_0.jpg"
        alt=""
        class="absolute inset-0 w-full h-full object-cover blur-md scale-105"
      />
      <!-- Dark overlay for mystery effect -->
      <div class="absolute inset-0 bg-forest-dark/70"></div>
    </div>
    
    <!-- Decorative elements -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute top-1/4 left-1/4 w-64 h-64 bg-gold-muted/5 rounded-full blur-3xl animate-pulse-slow"></div>
      <div class="absolute bottom-1/3 right-1/4 w-48 h-48 bg-forest-light/10 rounded-full blur-2xl animate-breathe"></div>
    </div>

    <!-- Content -->
    <div class="relative z-10 flex flex-col items-center text-center px-8 max-w-lg">
      <!-- Title -->
      <h1 class="font-serif text-4xl md:text-5xl lg:text-6xl text-gold-muted tracking-[0.15em] mb-4 animate-fade-in">
        森林漫步
      </h1>
      
      <p class="font-serif text-lg md:text-xl text-gold-muted/60 tracking-[0.2em] mb-12 animate-fade-in" style="animation-delay: 0.3s;">
        FOREST WALK
      </p>

      <!-- Description -->
      <p class="text-gold-muted/50 text-sm md:text-base leading-relaxed mb-12 animate-fade-in" style="animation-delay: 0.6s;">
        在這裡，你可以慢慢地走。<br>
        沒有目的地，只有此刻。
      </p>

      <!-- Continue button (if has saved progress) -->
      <div v-if="hasSavedProgress" class="flex flex-col gap-4 animate-fade-in" style="animation-delay: 0.9s;">
        <button 
          @click="continueGame"
          class="btn-primary"
        >
          繼續漫步
        </button>
        <button 
          @click="startNewGame"
          class="text-gold-muted/40 text-sm tracking-wider hover:text-gold-muted/60 transition-colors"
        >
          從頭開始
        </button>
      </div>

      <!-- Start button -->
      <button 
        v-else
        @click="startNewGame"
        class="btn-primary animate-fade-in"
        style="animation-delay: 0.9s;"
      >
        開始漫步
      </button>

      <!-- Audio hint -->
      <p class="text-gold-muted/30 text-xs mt-8 tracking-wide animate-fade-in" style="animation-delay: 1.2s;">
        建議戴上耳機，開啟聲音
      </p>
    </div>

    <!-- Bottom decoration -->
    <div class="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/50 to-transparent"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useGameStore } from '../stores/gameStore'
import { useAudio } from '../composables/useAudio'

const store = useGameStore()
const { initBackgroundMusic } = useAudio()

const hasSavedProgress = ref(false)
const savedSceneId = ref(null)

onMounted(() => {
  savedSceneId.value = store.loadProgress()
  hasSavedProgress.value = !!savedSceneId.value
  
  // Start background music immediately when intro screen loads
  initBackgroundMusic()
})

function startNewGame() {
  store.clearProgress()
  store.startGame()
}

function continueGame() {
  store.startGame()
  if (savedSceneId.value) {
    store.goToScene(savedSceneId.value, false)
  }
}
</script>
