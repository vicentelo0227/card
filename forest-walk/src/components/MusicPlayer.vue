<template>
  <div class="fixed bottom-6 right-6 z-50">
    <!-- Toggle Button -->
    <button
      @click="isExpanded = !isExpanded"
      class="w-12 h-12 flex items-center justify-center bg-forest-dark/80 backdrop-blur-sm 
             border border-gold-muted/30 rounded-full text-gold-muted/70 
             transition-all duration-300 hover:bg-forest-dark hover:border-gold-muted/50 hover:text-gold-muted"
      :class="{ 'rounded-b-none border-b-0': isExpanded }"
    >
      <svg v-if="!isExpanded" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </svg>
      <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>

    <!-- Expanded Panel -->
    <Transition name="panel">
      <div
        v-if="isExpanded"
        class="absolute bottom-12 right-0 w-56 bg-forest-dark/60 backdrop-blur-md 
               border border-gold-muted/30 rounded-lg rounded-br-none overflow-hidden"
      >
        <!-- Header -->
        <div class="px-4 py-3 border-b border-gold-muted/20">
          <p class="text-gold-muted/50 text-xs tracking-wider mb-1">正在播放</p>
          <p class="text-gold-muted text-sm font-medium truncate">
            {{ currentTrackName }}
          </p>
        </div>

        <!-- Track List -->
        <div class="max-h-48 overflow-y-auto">
          <button
            v-for="(track, index) in musicTracks"
            :key="index"
            @click="selectTrack(index)"
            class="w-full px-4 py-2 text-left text-sm transition-colors duration-200 flex items-center gap-2"
            :class="index === currentTrackIndex 
              ? 'bg-gold-muted/10 text-gold-muted' 
              : 'text-gold-muted/60 hover:bg-gold-muted/5 hover:text-gold-muted/80'"
          >
            <span class="w-4 h-4 flex items-center justify-center">
              <span v-if="index === currentTrackIndex && isPlaying" class="w-2 h-2 bg-gold-muted rounded-full animate-pulse"></span>
              <span v-else class="text-xs text-gold-muted/40">{{ index + 1 }}</span>
            </span>
            <span class="truncate">{{ track.name }}</span>
          </button>
        </div>

        <!-- Volume Control -->
        <div class="px-4 py-3 border-t border-gold-muted/20">
          <div class="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-gold-muted/50 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path v-if="volume > 0" d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              <path v-if="volume > 0.5" d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            </svg>
            <input
              type="range"
              min="0"
              max="100"
              :value="volume * 100"
              @input="onVolumeChange"
              class="volume-slider flex-1"
            />
            <span class="text-gold-muted/50 text-xs w-8 text-right">{{ Math.round(volume * 100) }}%</span>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAudio, musicTracks } from '../composables/useAudio'

const { 
  isPlaying, 
  currentTrackIndex: currentTrackIndexRef, 
  volume: volumeRef,
  playTrack, 
  setVolume 
} = useAudio()

const isExpanded = ref(false)

const currentTrackIndex = computed(() => currentTrackIndexRef.value)
const volume = computed(() => volumeRef.value)
const currentTrackName = computed(() => musicTracks[currentTrackIndex.value]?.name || 'Loading...')

function selectTrack(index) {
  playTrack(index)
}

function onVolumeChange(event) {
  const value = parseInt(event.target.value) / 100
  setVolume(value)
}
</script>

<style scoped>
.panel-enter-active {
  transition: all 0.3s ease-out;
}

.panel-leave-active {
  transition: all 0.2s ease-in;
}

.panel-enter-from,
.panel-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.95);
}

/* Custom volume slider */
.volume-slider {
  -webkit-appearance: none;
  appearance: none;
  height: 4px;
  background: rgba(200, 184, 150, 0.2);
  border-radius: 2px;
  outline: none;
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 12px;
  height: 12px;
  background: #c8b896;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.15s ease;
}

.volume-slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}

.volume-slider::-moz-range-thumb {
  width: 12px;
  height: 12px;
  background: #c8b896;
  border-radius: 50%;
  cursor: pointer;
  border: none;
}

/* Scrollbar styling */
.max-h-48::-webkit-scrollbar {
  width: 4px;
}

.max-h-48::-webkit-scrollbar-track {
  background: transparent;
}

.max-h-48::-webkit-scrollbar-thumb {
  background: rgba(200, 184, 150, 0.3);
  border-radius: 2px;
}

.max-h-48::-webkit-scrollbar-thumb:hover {
  background: rgba(200, 184, 150, 0.5);
}
</style>
