import { ref, onUnmounted } from 'vue'
import { Howl } from 'howler'
import { useGameStore } from '../stores/gameStore'

// Global background music instance (singleton)
let globalMusic = null
let riverSound = null
let isInitialized = false
let currentTrackIndexValue = 0
let currentVolumeValue = 0.6

// Playlist of background music tracks (exported for UI)
export const musicTracks = [
  { src: 'audio/Forest Dawn.wav', name: 'Forest Dawn' },
  { src: 'audio/Ambient Woods.wav', name: 'Ambient Woods' },
  { src: 'audio/Misty Path.wav', name: 'Misty Path' },
  { src: 'audio/Quiet Grove.wav', name: 'Quiet Grove' },
  { src: 'audio/Woodland Whisper.wav', name: 'Woodland Whisper' },
  { src: 'audio/Gentle Canopy.wav', name: 'Gentle Canopy' },
  { src: 'audio/Sunlit Clearing.wav', name: 'Sunlit Clearing' },
]

// -10dB ≈ 0.316 linear volume (10^(-10/20))
const RIVER_VOLUME = 0.316

export function useAudio() {
  const store = useGameStore()
  
  const isPlaying = ref(false)
  const isLoading = ref(false)
  const currentTrackIndex = ref(currentTrackIndexValue)
  const volume = ref(currentVolumeValue)

  // Play next track in playlist
  function playNextTrack() {
    currentTrackIndexValue = (currentTrackIndexValue + 1) % musicTracks.length
    currentTrackIndex.value = currentTrackIndexValue
    console.log('[Audio] Playing next track:', musicTracks[currentTrackIndexValue].name)
    
    if (globalMusic) {
      globalMusic.unload()
    }
    
    globalMusic = new Howl({
      src: [musicTracks[currentTrackIndexValue].src],
      loop: false,
      volume: store.isMuted ? 0 : currentVolumeValue,
      html5: true,
      preload: true,
      onend: () => {
        console.log('[Audio] Track ended, playing next')
        playNextTrack()
      },
      onplay: () => {
        console.log('[Audio] Now playing:', musicTracks[currentTrackIndexValue].name)
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

  // Play specific track by index
  function playTrack(index) {
    if (index < 0 || index >= musicTracks.length) return
    
    currentTrackIndexValue = index
    currentTrackIndex.value = index
    console.log('[Audio] Switching to track:', musicTracks[index].name)
    
    if (globalMusic) {
      globalMusic.unload()
    }
    
    globalMusic = new Howl({
      src: [musicTracks[index].src],
      loop: false,
      volume: store.isMuted ? 0 : currentVolumeValue,
      html5: true,
      preload: true,
      onend: () => {
        console.log('[Audio] Track ended, playing next')
        playNextTrack()
      },
      onplay: () => {
        console.log('[Audio] Now playing:', musicTracks[index].name)
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

  // Set volume (0-1)
  function setVolume(vol) {
    currentVolumeValue = Math.max(0, Math.min(1, vol))
    volume.value = currentVolumeValue
    
    if (globalMusic && !store.isMuted) {
      globalMusic.volume(currentVolumeValue)
    }
    console.log('[Audio] Volume set to:', currentVolumeValue)
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
    currentTrackIndexValue = 0
    currentTrackIndex.value = 0

    globalMusic = new Howl({
      src: [musicTracks[currentTrackIndexValue].src],
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
        console.log('[Audio] Background music now playing:', musicTracks[currentTrackIndexValue].name)
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
        const targetVolume = store.isMuted ? 0 : currentVolumeValue
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
        globalMusic.fade(currentVolume, currentVolumeValue, 1000)
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
    currentTrackIndex,
    volume,
    initBackgroundMusic,
    playRiverSound,
    stopRiverSound,
    setMuted,
    setVolume,
    playTrack,
    getIsPlaying,
    stopMusic
  }
}
