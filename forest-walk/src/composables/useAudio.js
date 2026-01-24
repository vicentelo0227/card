import { ref, onUnmounted } from 'vue'
import { Howl } from 'howler'
import { useGameStore } from '../stores/gameStore'

// Global background music instance (singleton)
let globalMusic = null
let isInitialized = false

export function useAudio() {
  const store = useGameStore()
  
  const isPlaying = ref(false)
  const isLoading = ref(false)

  // Initialize and play background music (only once)
  function initBackgroundMusic() {
    if (isInitialized || globalMusic) {
      console.log('[Audio] Background music already initialized')
      isPlaying.value = globalMusic?.playing() || false
      return
    }

    console.log('[Audio] Initializing background music')
    isLoading.value = true
    isInitialized = true

    globalMusic = new Howl({
      src: ['audio/Zen 2 (1).wav'],
      loop: true,
      volume: 0,
      html5: true,
      preload: true,
      onload: () => {
        console.log('[Audio] Background music loaded')
        isLoading.value = false
      },
      onloaderror: (id, error) => {
        console.error('[Audio] Failed to load background music:', error)
        isLoading.value = false
        isInitialized = false
      },
      onplayerror: (id, error) => {
        console.error('[Audio] Failed to play:', error)
        isPlaying.value = false
        // Try to unlock and play again (for mobile browsers)
        globalMusic?.once('unlock', () => {
          console.log('[Audio] Unlocked, trying to play again')
          globalMusic?.play()
        })
      },
      onplay: () => {
        console.log('[Audio] Background music now playing')
        isPlaying.value = true
      },
      onpause: () => {
        isPlaying.value = false
      },
      onstop: () => {
        isPlaying.value = false
      }
    })

    // Start playing with volume set directly (not fading from 0)
    setTimeout(() => {
      if (globalMusic && !globalMusic.playing()) {
        const targetVolume = store.isMuted ? 0 : 0.6
        console.log('[Audio] Starting playback, target volume:', targetVolume)
        
        // Set initial volume to target directly (fade from 0 doesn't work reliably in HTML5 mode)
        globalMusic.volume(targetVolume)
        globalMusic.play()
        
        isPlaying.value = true
        isLoading.value = false
      }
    }, 100)
  }

  // Toggle mute with fade effect
  function setMuted(muted) {
    if (globalMusic) {
      const currentVolume = globalMusic.volume()
      if (muted) {
        // Fade out over 1 second
        globalMusic.fade(currentVolume, 0, 1000)
      } else {
        // Fade in over 1 second
        globalMusic.fade(currentVolume, 0.6, 1000)
      }
    }
  }

  // Get current playing state
  function getIsPlaying() {
    return globalMusic?.playing() || false
  }

  // Cleanup (should rarely be called - music plays continuously)
  function stopMusic() {
    if (globalMusic) {
      globalMusic.fade(globalMusic.volume(), 0, 1000)
      setTimeout(() => {
        globalMusic?.stop()
        globalMusic?.unload()
        globalMusic = null
        isInitialized = false
        isPlaying.value = false
      }, 1000)
    }
  }

  return {
    isPlaying,
    isLoading,
    initBackgroundMusic,
    setMuted,
    getIsPlaying,
    stopMusic
  }
}
