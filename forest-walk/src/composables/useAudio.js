import { ref, onUnmounted } from 'vue'
import { Howl } from 'howler'
import { useGameStore } from '../stores/gameStore'

// Global background music instance (singleton)
let globalMusic = null
let riverSound = null
let isInitialized = false
let currentTrackIndex = 0

// Playlist of background music tracks
const musicTracks = [
  'audio/Zen 2 (1).wav',
  'audio/Zen 2 (2).wav',
  'audio/Zen 2 (3).wav',
  'audio/Zen 2 (4).wav',
  'audio/Zen 2 (5).wav',
  'audio/Zen 2 (6).wav',
  'audio/Zen 2 (7).wav',
]

// -15dB ≈ 0.178 linear volume (10^(-15/20))
const RIVER_VOLUME = 0.178

export function useAudio() {
  const store = useGameStore()
  
  const isPlaying = ref(false)
  const isLoading = ref(false)

  // Play next track in playlist
  function playNextTrack() {
    currentTrackIndex = (currentTrackIndex + 1) % musicTracks.length
    console.log('[Audio] Playing next track:', musicTracks[currentTrackIndex])
    
    if (globalMusic) {
      globalMusic.unload()
    }
    
    globalMusic = new Howl({
      src: [musicTracks[currentTrackIndex]],
      loop: false,
      volume: store.isMuted ? 0 : 0.6,
      html5: true,
      preload: true,
      onend: () => {
        console.log('[Audio] Track ended, playing next')
        playNextTrack()
      },
      onplay: () => {
        console.log('[Audio] Now playing:', musicTracks[currentTrackIndex])
        isPlaying.value = true
      },
      onplayerror: (id, error) => {
        console.error('[Audio] Failed to play:', error)
        globalMusic?.once('unlock', () => {
          globalMusic?.play()
        })
      }
    })
    
    globalMusic.play()
  }

  // Initialize and play background music (only once)
  function initBackgroundMusic() {
    if (isInitialized || globalMusic) {
      console.log('[Audio] Background music already initialized')
      isPlaying.value = globalMusic?.playing() || false
      return
    }

    console.log('[Audio] Initializing background music playlist')
    isLoading.value = true
    isInitialized = true
    currentTrackIndex = 0

    globalMusic = new Howl({
      src: [musicTracks[currentTrackIndex]],
      loop: false,
      volume: 0,
      html5: true,
      preload: true,
      onload: () => {
        console.log('[Audio] First track loaded')
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
        globalMusic?.once('unlock', () => {
          console.log('[Audio] Unlocked, trying to play again')
          globalMusic?.play()
        })
      },
      onplay: () => {
        console.log('[Audio] Background music now playing:', musicTracks[currentTrackIndex])
        isPlaying.value = true
      },
      onpause: () => {
        isPlaying.value = false
      },
      onstop: () => {
        isPlaying.value = false
      },
      onend: () => {
        console.log('[Audio] Track ended, playing next')
        playNextTrack()
      }
    })

    // Start playing with volume set directly
    setTimeout(() => {
      if (globalMusic && !globalMusic.playing()) {
        const targetVolume = store.isMuted ? 0 : 0.6
        console.log('[Audio] Starting playback, target volume:', targetVolume)
        
        globalMusic.volume(targetVolume)
        globalMusic.play()
        
        isPlaying.value = true
        isLoading.value = false
      }
    }, 100)
  }

  // Play river/stream ambient sound
  function playRiverSound() {
    if (riverSound?.playing()) {
      console.log('[Audio] River sound already playing')
      return
    }
    
    console.log('[Audio] Starting river sound')
    
    if (!riverSound) {
      riverSound = new Howl({
        src: ['audio/River.wav'],
        loop: true,
        volume: 0,
        html5: true,
        preload: true,
        onplay: () => {
          console.log('[Audio] River sound now playing')
        }
      })
    }
    
    const targetVolume = store.isMuted ? 0 : RIVER_VOLUME
    riverSound.play()
    // Fade in over 1.5 seconds
    riverSound.fade(0, targetVolume, 1500)
  }

  // Stop river sound with fade out
  function stopRiverSound() {
    if (riverSound && riverSound.playing()) {
      console.log('[Audio] Fading out river sound')
      const currentVolume = riverSound.volume()
      // Fade out over 2 seconds
      riverSound.fade(currentVolume, 0, 2000)
      setTimeout(() => {
        riverSound?.stop()
      }, 2000)
    }
  }

  // Toggle mute with fade effect
  function setMuted(muted) {
    if (globalMusic) {
      const currentVolume = globalMusic.volume()
      if (muted) {
        globalMusic.fade(currentVolume, 0, 1000)
      } else {
        globalMusic.fade(currentVolume, 0.6, 1000)
      }
    }
    
    // Also handle river sound
    if (riverSound && riverSound.playing()) {
      const currentRiverVolume = riverSound.volume()
      if (muted) {
        riverSound.fade(currentRiverVolume, 0, 1000)
      } else {
        riverSound.fade(currentRiverVolume, RIVER_VOLUME, 1000)
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
    
    if (riverSound) {
      riverSound.fade(riverSound.volume(), 0, 1000)
      setTimeout(() => {
        riverSound?.stop()
        riverSound?.unload()
        riverSound = null
      }, 1000)
    }
  }

  return {
    isPlaying,
    isLoading,
    initBackgroundMusic,
    playRiverSound,
    stopRiverSound,
    setMuted,
    getIsPlaying,
    stopMusic
  }
}
