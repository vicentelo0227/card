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

        <!-- Snow particles overlay -->
        <div class="absolute inset-0 pointer-events-none overflow-hidden z-5">
          <div 
            v-for="i in 30" 
            :key="i"
            class="snowflake"
            :style="getSnowflakeStyle(i)"
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

// Generate snowflake styles for falling snow effect
function getSnowflakeStyle(index) {
  // Random horizontal position across the screen
  const left = Math.random() * 100
  // Random size between 3px and 8px
  const size = 3 + Math.random() * 5
  // Random animation duration between 8s and 18s (slow falling)
  const duration = 8 + Math.random() * 10
  // Random delay so they don't all start at once
  const delay = Math.random() * 15
  // Random opacity between 0.3 and 0.7
  const opacity = 0.3 + Math.random() * 0.4
  // Random horizontal drift
  const drift = -20 + Math.random() * 40

  return {
    left: `${left}%`,
    width: `${size}px`,
    height: `${size}px`,
    opacity: opacity,
    animationDuration: `${duration}s`,
    animationDelay: `${delay}s`,
    '--drift': `${drift}px`
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

/* Snowflake styles */
.snowflake {
  position: absolute;
  top: -10px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.9) 0%, rgba(200, 184, 150, 0.6) 50%, transparent 70%);
  border-radius: 50%;
  filter: blur(0.5px);
  animation: snowfall linear infinite;
}

@keyframes snowfall {
  0% {
    transform: translateY(-10px) translateX(0) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) translateX(var(--drift, 0px)) rotate(360deg);
    opacity: 0;
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
