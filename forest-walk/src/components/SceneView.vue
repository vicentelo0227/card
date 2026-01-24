<template>
  <div class="scene-container">
    <!-- Previous scene image (stays visible during transition to prevent black flash) -->
    <div 
      v-if="previousImage"
      class="absolute inset-0"
    >
      <img 
        :src="previousImage"
        alt=""
        class="absolute inset-0 w-full h-full object-cover"
      />
    </div>

    <!-- Current scene background/image -->
    <Transition name="scene" @after-leave="clearPreviousImage">
      <div 
        :key="store.currentSceneId"
        class="absolute inset-0"
      >
        <!-- Video background with crossfade loop (if scene has video) -->
        <div 
          v-if="store.currentScene?.video"
          class="absolute inset-0 z-0"
        >
          <!-- Video B (底層，始終不透明) -->
          <video
            ref="videoB"
            :src="store.currentScene.video"
            muted
            playsinline
            class="absolute inset-0 w-full h-full object-cover z-0"
            @timeupdate="onVideoTimeUpdate($event, 'B')"
            @loadeddata="onVideoBLoaded"
          />
          <!-- Video A (上層，透過淡出顯示底層) -->
          <video
            ref="videoA"
            :src="store.currentScene.video"
            muted
            playsinline
            class="absolute inset-0 w-full h-full object-cover z-10 video-crossfade"
            :class="{ 'opacity-0': !activeVideo.isA }"
            @timeupdate="onVideoTimeUpdate($event, 'A')"
            @loadeddata="onVideoALoaded"
          />
        </div>

        <!-- Real image background (fallback if no video) -->
        <div 
          v-else-if="store.currentScene?.image"
          class="absolute inset-0 z-0"
        >
          <img 
            :src="store.currentScene.image"
            :alt="store.currentScene.title"
            class="absolute inset-0 w-full h-full object-cover"
            @load="onImageLoaded"
            @error="imageLoaded = false"
          />
        </div>

        <!-- Fallback placeholder if no image or video -->
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

        <!-- Hotspots container with z-index to ensure visibility above video -->
        <div class="absolute inset-0 z-10">
          <Hotspot 
            v-for="hotspot in store.currentScene?.hotspots" 
            :key="hotspot.id"
            :hotspot="hotspot"
          />
        </div>

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

    <!-- Snow particles overlay (outside transition so it doesn't reset) -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden z-5">
      <div 
        v-for="i in 30" 
        :key="i"
        class="snowflake"
        :style="getSnowflakeStyle(i)"
      ></div>
    </div>

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

    <!-- Loading overlay removed to prevent brightness changes during transitions -->
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { useGameStore } from '../stores/gameStore'
import { usePreload } from '../composables/usePreload'
import { useAudio } from '../composables/useAudio'
import Hotspot from './Hotspot.vue'

const store = useGameStore()
const { preloadAdjacentScenes } = usePreload()
const { playRiverSound, stopRiverSound } = useAudio()
const imageLoaded = ref(false)
const showSceneTitle = ref(false)
const previousImage = ref(null)

// Video crossfade refs and state
const videoA = ref(null)
const videoB = ref(null)
const activeVideo = reactive({ isA: true, isB: false })
let crossfadeInProgress = false
const CROSSFADE_THRESHOLD = 3.5 // Start crossfade when 3.5 seconds remaining

// Scenes that should play river sound
const riverScenes = ['moss-steps', 'waterfall']

// Preload adjacent scenes when scene changes
watch(() => store.currentSceneId, (sceneId, oldSceneId) => {
  if (sceneId) {
    // Store previous background to prevent black flash during transition
    // Use image as fallback for video scenes (video scenes also have image property)
    if (oldSceneId && store.scenes[oldSceneId]) {
      const oldScene = store.scenes[oldSceneId]
      previousImage.value = oldScene.image || null
    }
    
    imageLoaded.value = false
    preloadAdjacentScenes(sceneId)
    store.saveProgress()
    
    // Show scene title on scene change
    showSceneTitle.value = true
    setTimeout(() => {
      showSceneTitle.value = false
    }, 2500)
    
    // Handle river sound
    if (riverScenes.includes(sceneId)) {
      playRiverSound()
    } else if (oldSceneId && riverScenes.includes(oldSceneId)) {
      stopRiverSound()
    }
  }
}, { immediate: true })

function onImageLoaded() {
  imageLoaded.value = true
}

// Video A loaded - start playing (上層影片)
function onVideoALoaded() {
  imageLoaded.value = true
  if (videoA.value) {
    videoA.value.play()
    activeVideo.isA = true
    crossfadeInProgress = false
  }
}

// Video B loaded - preload but don't play yet (底層影片)
function onVideoBLoaded() {
  // Video B is ready as backup
}

// Handle video time update for seamless loop
// 策略：Video A 在上層播放，接近結尾時淡出露出底層 Video B
// Video B 從頭開始播放，A 完全淡出後，重置 A 並再次淡入
function onVideoTimeUpdate(event, videoId) {
  const video = event.target
  if (!video || !video.duration) return
  
  const timeRemaining = video.duration - video.currentTime
  
  // 只監聽上層 Video A 的時間
  if (videoId === 'A' && activeVideo.isA && timeRemaining <= CROSSFADE_THRESHOLD && !crossfadeInProgress) {
    crossfadeInProgress = true
    
    // 開始播放底層 Video B
    if (videoB.value) {
      videoB.value.currentTime = 0
      videoB.value.play()
    }
    
    // 淡出上層 Video A（露出底層 Video B）
    activeVideo.isA = false
    
    // 淡出完成後，重置 Video A 並準備下一輪
    setTimeout(() => {
      if (videoA.value && videoB.value) {
        // 將 Video A 重置到 Video B 當前位置，然後淡入
        videoA.value.currentTime = videoB.value.currentTime
        videoA.value.play()
        activeVideo.isA = true
      }
      crossfadeInProgress = false
    }, 3700)
  }
}

// Reset video state when scene changes
watch(() => store.currentScene?.video, (newVideo) => {
  if (newVideo) {
    // Reset to video A when entering a video scene
    nextTick(() => {
      activeVideo.isA = true
      activeVideo.isB = false
      crossfadeInProgress = false
      if (videoA.value) {
        videoA.value.currentTime = 0
        videoA.value.play()
      }
    })
  }
})

function clearPreviousImage() {
  // Clear previous image after new scene fully fades in (1s transition + buffer)
  setTimeout(() => {
    previousImage.value = null
  }, 1200)
}

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
  // Random delay so they don't all start at once (0-5s so snow appears quickly)
  const delay = Math.random() * 5
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
/* 場景轉換：純淡入效果，舊場景瞬間移除（由 previousImage 墊底） */
.scene-enter-active {
  transition: opacity 1s ease-out;
}

.scene-leave-active {
  /* 瞬間移除舊場景，previousImage 會墊底 */
  transition: none;
  position: absolute;
}

.scene-enter-from {
  opacity: 0;
}

.scene-leave-to {
  opacity: 1;
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

/* Video crossfade transition - 3.5 seconds */
.video-crossfade {
  transition: opacity 3.5s ease-in-out;
}
</style>
