<template>
  <div class="scene-container">
    <!-- Scene background/image -->
    <Transition name="scene" mode="out-in">
      <div 
        :key="store.currentSceneId"
        class="absolute inset-0"
      >
        <!-- Real image background -->
        <div 
          v-if="store.currentScene?.image"
          class="absolute inset-0"
        >
          <img 
            :src="store.currentScene.image"
            :alt="store.currentScene.title"
            class="absolute inset-0 w-full h-full object-cover"
            @load="imageLoaded = true"
            @error="imageLoaded = false"
          />
          <!-- Dark overlay for better hotspot visibility -->
          <div class="absolute inset-0 bg-black/15"></div>
        </div>

        <!-- Fallback placeholder if no image -->
        <div 
          v-else
          class="scene-placeholder"
          :data-scene-name="store.currentScene?.title"
        >
          <div class="absolute inset-0 overflow-hidden">
            <div 
              class="absolute inset-0 transition-opacity duration-1000"
              :style="layerGradient"
            ></div>
          </div>
        </div>

        <!-- Floating particles overlay -->
        <div class="absolute inset-0 pointer-events-none overflow-hidden">
          <div 
            v-for="i in 6" 
            :key="i"
            class="absolute w-1 h-1 bg-gold-muted/30 rounded-full"
            :style="getParticleStyle(i)"
          ></div>
        </div>

        <!-- Hotspots -->
        <Hotspot 
          v-for="hotspot in store.currentScene?.hotspots" 
          :key="hotspot.id"
          :hotspot="hotspot"
        />

        <!-- Scene title overlay -->
        <Transition name="title-fade">
          <div 
            v-if="showSceneTitle && store.currentScene?.title && !store.currentScene?.isEnding"
            class="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
          >
            <h2 class="font-serif text-2xl md:text-4xl text-gold-muted/90 tracking-widest text-center px-8 drop-shadow-lg">
              {{ store.currentScene.title }}
            </h2>
          </div>
        </Transition>
      </div>
    </Transition>

    <!-- Ending screen -->
    <Transition name="fade">
      <div 
        v-if="store.currentScene?.isEnding"
        class="absolute inset-0 z-20 flex flex-col items-center justify-center bg-forest-dark/90"
      >
        <div class="text-center px-8 max-w-lg">
          <h2 class="font-serif text-3xl md:text-4xl text-gold-muted tracking-wider mb-6">
            走出森林
          </h2>
          <p class="text-gold-muted/60 leading-relaxed mb-8">
            你走了很遠的路。<br>
            陽光就在前方。
          </p>
          
          <!-- Stats -->
          <div class="text-gold-muted/40 text-sm mb-8">
            <p>走過了 {{ store.visitedScenesCount }} 個地方</p>
            <p>停留了 {{ store.visitedStopPointsCount }} 次</p>
          </div>

          <div class="flex flex-col gap-4">
            <button 
              @click="store.goBack"
              class="text-gold-muted/50 text-sm tracking-wider hover:text-gold-muted transition-colors"
            >
              ← 再走一會兒
            </button>
            <button 
              @click="restartGame"
              class="btn-primary"
            >
              從頭漫步
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Loading overlay -->
    <Transition name="fade">
      <div 
        v-if="store.isTransitioning"
        class="absolute inset-0 z-30 bg-forest-dark/50 pointer-events-none"
      ></div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useGameStore } from '../stores/gameStore'
import { usePreload } from '../composables/usePreload'
import Hotspot from './Hotspot.vue'

const store = useGameStore()
const { preloadAdjacentScenes } = usePreload()
const imageLoaded = ref(false)
const showSceneTitle = ref(false)

// Preload adjacent scenes when scene changes
watch(() => store.currentSceneId, (sceneId) => {
  if (sceneId) {
    imageLoaded.value = false
    preloadAdjacentScenes(sceneId)
    store.saveProgress()
    
    // Show scene title on scene change
    showSceneTitle.value = true
    setTimeout(() => {
      showSceneTitle.value = false
    }, 2500)
  }
}, { immediate: true })

// Generate different gradients based on layer (fallback)
const layerGradient = computed(() => {
  const layer = store.currentScene?.layer || 0
  const gradients = [
    'background: radial-gradient(ellipse at 50% 30%, rgba(200, 184, 150, 0.08) 0%, transparent 50%), linear-gradient(180deg, #1a2f1a 0%, #0d1a0d 100%)',
    'background: radial-gradient(ellipse at 30% 40%, rgba(45, 74, 53, 0.15) 0%, transparent 60%), linear-gradient(135deg, #1a2f1a 0%, #0d1a0d 100%)',
    'background: radial-gradient(ellipse at 70% 60%, rgba(45, 74, 53, 0.1) 0%, transparent 50%), linear-gradient(160deg, #152515 0%, #0a0a0a 100%)',
    'background: radial-gradient(ellipse at 50% 50%, rgba(139, 90, 139, 0.05) 0%, transparent 40%), linear-gradient(180deg, #0d1a0d 0%, #050505 100%)',
    'background: radial-gradient(ellipse at 40% 30%, rgba(200, 184, 150, 0.03) 0%, transparent 60%), linear-gradient(170deg, #151515 0%, #0a0a0a 100%)',
    'background: radial-gradient(ellipse at 50% 20%, rgba(232, 217, 184, 0.06) 0%, transparent 50%), linear-gradient(180deg, #1a1a1a 0%, #0d0d0d 100%)',
    'background: radial-gradient(ellipse at 50% 40%, rgba(200, 184, 150, 0.1) 0%, transparent 60%), linear-gradient(180deg, #1a2010 0%, #0a0a0a 100%)',
    'background: radial-gradient(ellipse at 50% 50%, rgba(232, 217, 184, 0.08) 0%, transparent 70%), linear-gradient(180deg, #1a1a1a 0%, #0d0d0d 100%)',
  ]
  return gradients[Math.min(layer, gradients.length - 1)]
})

// Generate particle positions
function getParticleStyle(index) {
  const positions = [
    { left: '20%', top: '30%', animationDelay: '0s' },
    { left: '70%', top: '20%', animationDelay: '1s' },
    { left: '40%', top: '60%', animationDelay: '2s' },
    { left: '80%', top: '50%', animationDelay: '0.5s' },
    { left: '15%', top: '70%', animationDelay: '1.5s' },
    { left: '60%', top: '80%', animationDelay: '2.5s' },
  ]
  const pos = positions[index - 1] || positions[0]
  return {
    ...pos,
    animation: `float ${8 + index}s ease-in-out infinite`,
    animationDelay: pos.animationDelay
  }
}

function restartGame() {
  store.clearProgress()
  store.startGame()
}
</script>

<style scoped>
.scene-enter-active {
  transition: opacity 0.6s ease;
}

.scene-leave-active {
  transition: opacity 0.4s ease;
}

.scene-enter-from {
  opacity: 0;
}

.scene-leave-to {
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) translateX(0);
    opacity: 0.2;
  }
  25% {
    transform: translateY(-20px) translateX(10px);
    opacity: 0.4;
  }
  50% {
    transform: translateY(-10px) translateX(-5px);
    opacity: 0.2;
  }
  75% {
    transform: translateY(-30px) translateX(5px);
    opacity: 0.3;
  }
}

/* Scene title transition */
.title-fade-enter-active {
  transition: opacity 0.8s ease-out;
}

.title-fade-leave-active {
  transition: opacity 1.2s ease-in;
}

.title-fade-enter-from,
.title-fade-leave-to {
  opacity: 0;
}
</style>
