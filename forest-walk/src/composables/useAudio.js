import { ref, onUnmounted } from 'vue'
import { Howl } from 'howler'
import { useGameStore } from '../stores/gameStore'

// Global background music instance (singleton)
let globalMusic = null
let riverSound = null
let birdsSound = null
let waterfallSound = null
let ambientSound = null
let forestWindSound = null
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
// -7dB ≈ 0.447 linear volume (10^(-7/20))
const BIRDS_VOLUME = 0.447
// -7.5dB ≈ 0.422 linear volume (10^(-7.5/20))
const WATERFALL_VOLUME = 0.422
// -23dB ≈ 0.071 linear volume (10^(-23/20)) for default ambient sound
const AMBIENT_VOLUME = 0.071
// -1dB ≈ 0.891 linear volume for forest wind sound (bamboo-path)
const FOREST_WIND_VOLUME = 0.891

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
    // Reset volume to 0 before playing to ensure fade works correctly after stop()
    riverSound.volume(0)
    riverSound.play()
    // Fade in over 1.5 seconds
    riverSound.fade(0, targetVolume, 1500)
  }

  // Stop river sound with fade out
  function stopRiverSound() {
    if (riverSound) {
      const isCurrentlyPlaying = riverSound.playing()
      if (isCurrentlyPlaying) {
        console.log('[Audio] Fading out river sound')
        const currentVolume = riverSound.volume()
        // Fade out over 2 seconds, then unload
        riverSound.fade(currentVolume, 0, 2000)
        const soundToStop = riverSound
        riverSound = null // Clear reference immediately
        setTimeout(() => {
          soundToStop?.stop()
          soundToStop?.unload()
        }, 2000)
      } else {
        riverSound.unload()
        riverSound = null
      }
    }
  }

  // Play birds ambient sound (for forest-entrance)
  function playBirdsSound() {
    if (birdsSound?.playing()) {
      console.log('[Audio] Birds sound already playing')
      return
    }

    console.log('[Audio] Starting birds sound')

    if (!birdsSound) {
      birdsSound = new Howl({
        src: ['audio/birds-forest-river-409229.mp3'],
        loop: true,
        volume: 0,
        html5: true,
        preload: true,
        onplay: () => {
          console.log('[Audio] Birds sound now playing')
        }
      })
    }

    const targetVolume = store.isMuted ? 0 : BIRDS_VOLUME
    // Reset volume to 0 before playing to ensure fade works correctly after stop()
    birdsSound.volume(0)
    birdsSound.play()
    // Fade in over 1.5 seconds
    birdsSound.fade(0, targetVolume, 1500)
  }

  // Stop birds sound with fade out
  function stopBirdsSound() {
    if (birdsSound) {
      const isCurrentlyPlaying = birdsSound.playing()
      if (isCurrentlyPlaying) {
        console.log('[Audio] Fading out birds sound')
        const currentVolume = birdsSound.volume()
        // Fade out over 2 seconds, then unload
        birdsSound.fade(currentVolume, 0, 2000)
        const soundToStop = birdsSound
        birdsSound = null // Clear reference immediately
        setTimeout(() => {
          soundToStop?.stop()
          soundToStop?.unload()
        }, 2000)
      } else {
        birdsSound.unload()
        birdsSound = null
      }
    }
  }

  // Play waterfall ambient sound
  function playWaterfallSound() {
    if (waterfallSound?.playing()) {
      console.log('[Audio] Waterfall sound already playing')
      return
    }

    console.log('[Audio] Starting waterfall sound')

    if (!waterfallSound) {
      waterfallSound = new Howl({
        src: ['audio/Waterfall-Sound.wav'],
        loop: true,
        volume: 0,
        html5: true,
        preload: true,
        onplay: () => {
          console.log('[Audio] Waterfall sound now playing')
        }
      })
    }

    const targetVolume = store.isMuted ? 0 : WATERFALL_VOLUME
    // Reset volume to 0 before playing to ensure fade works correctly after stop()
    waterfallSound.volume(0)
    waterfallSound.play()
    // Fade in over 1.5 seconds
    waterfallSound.fade(0, targetVolume, 1500)
  }

  // Stop waterfall sound with fade out
  function stopWaterfallSound() {
    if (waterfallSound) {
      const isCurrentlyPlaying = waterfallSound.playing()
      if (isCurrentlyPlaying) {
        console.log('[Audio] Fading out waterfall sound')
        const currentVolume = waterfallSound.volume()
        // Fade out over 2 seconds, then unload
        waterfallSound.fade(currentVolume, 0, 2000)
        const soundToStop = waterfallSound
        waterfallSound = null // Clear reference immediately
        setTimeout(() => {
          soundToStop?.stop()
          soundToStop?.unload()
        }, 2000)
      } else {
        waterfallSound.unload()
        waterfallSound = null
      }
    }
  }

  // Play forest wind sound (for bamboo-path)
  function playForestWindSound() {
    if (forestWindSound?.playing()) {
      console.log('[Audio] Forest wind sound already playing')
      return
    }

    console.log('[Audio] Starting forest wind sound')

    if (!forestWindSound) {
      forestWindSound = new Howl({
        src: ['audio/forest-wind-and-birds-6881.mp3'],
        loop: true,
        volume: 0,
        html5: true,
        preload: true,
        onplay: () => {
          console.log('[Audio] Forest wind sound now playing')
        }
      })
    }

    const targetVolume = store.isMuted ? 0 : FOREST_WIND_VOLUME
    // Reset volume to 0 before playing to ensure fade works correctly after stop()
    forestWindSound.volume(0)
    forestWindSound.play()
    // Fade in over 1.5 seconds
    forestWindSound.fade(0, targetVolume, 1500)
  }

  // Stop forest wind sound with fade out
  function stopForestWindSound() {
    if (forestWindSound) {
      const isCurrentlyPlaying = forestWindSound.playing()
      if (isCurrentlyPlaying) {
        console.log('[Audio] Fading out forest wind sound')
        const currentVolume = forestWindSound.volume()
        // Fade out over 2 seconds, then unload
        forestWindSound.fade(currentVolume, 0, 2000)
        const soundToStop = forestWindSound
        forestWindSound = null // Clear reference immediately
        setTimeout(() => {
          soundToStop?.stop()
          soundToStop?.unload()
        }, 2000)
      } else {
        forestWindSound.unload()
        forestWindSound = null
      }
    }
  }

  // Play default ambient sound (for scenes without specific sounds)
  function playAmbientSound() {
    if (ambientSound?.playing()) {
      console.log('[Audio] Ambient sound already playing')
      return
    }

    console.log('[Audio] Starting ambient sound')

    if (!ambientSound) {
      ambientSound = new Howl({
        src: ['audio/forest-ambience-296528.mp3'],
        loop: true,
        volume: 0,
        html5: true,
        preload: true,
        onplay: () => {
          console.log('[Audio] Ambient sound now playing')
        }
      })
    }

    const targetVolume = store.isMuted ? 0 : AMBIENT_VOLUME
    // Reset volume to 0 before playing to ensure fade works correctly after stop()
    ambientSound.volume(0)
    ambientSound.play()
    // Fade in over 1.5 seconds
    ambientSound.fade(0, targetVolume, 1500)
  }

  // Stop ambient sound with fade out
  function stopAmbientSound() {
    if (ambientSound) {
      const isCurrentlyPlaying = ambientSound.playing()
      if (isCurrentlyPlaying) {
        console.log('[Audio] Fading out ambient sound')
        const currentVolume = ambientSound.volume()
        // Fade out over 2 seconds, then unload to allow fresh re-creation
        ambientSound.fade(currentVolume, 0, 2000)
        const soundToStop = ambientSound
        ambientSound = null // Clear reference immediately to allow new instance
        setTimeout(() => {
          soundToStop?.stop()
          soundToStop?.unload()
        }, 2000)
      } else {
        // Not playing, just unload immediately
        ambientSound.unload()
        ambientSound = null
      }
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

    // Handle birds sound
    if (birdsSound && birdsSound.playing()) {
      const currentBirdsVolume = birdsSound.volume()
      if (muted) {
        birdsSound.fade(currentBirdsVolume, 0, 1000)
      } else {
        birdsSound.fade(currentBirdsVolume, BIRDS_VOLUME, 1000)
      }
    }

    // Handle waterfall sound
    if (waterfallSound && waterfallSound.playing()) {
      const currentWaterfallVolume = waterfallSound.volume()
      if (muted) {
        waterfallSound.fade(currentWaterfallVolume, 0, 1000)
      } else {
        waterfallSound.fade(currentWaterfallVolume, WATERFALL_VOLUME, 1000)
      }
    }

    // Handle ambient sound
    if (ambientSound && ambientSound.playing()) {
      const currentAmbientVolume = ambientSound.volume()
      if (muted) {
        ambientSound.fade(currentAmbientVolume, 0, 1000)
      } else {
        ambientSound.fade(currentAmbientVolume, AMBIENT_VOLUME, 1000)
      }
    }

    // Handle forest wind sound
    if (forestWindSound && forestWindSound.playing()) {
      const currentForestWindVolume = forestWindSound.volume()
      if (muted) {
        forestWindSound.fade(currentForestWindVolume, 0, 1000)
      } else {
        forestWindSound.fade(currentForestWindVolume, FOREST_WIND_VOLUME, 1000)
      }
    }
  }

  // Get current playing state
  function getIsPlaying() {
    return globalMusic?.playing() || false
  }

  // Toggle play/pause for main music
  function togglePlayPause() {
    if (!globalMusic) return

    if (globalMusic.playing()) {
      globalMusic.pause()
      isPlaying.value = false
    } else {
      globalMusic.play()
      isPlaying.value = true
    }
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

    if (birdsSound) {
      birdsSound.fade(birdsSound.volume(), 0, 1000)
      setTimeout(() => {
        birdsSound?.stop()
        birdsSound?.unload()
        birdsSound = null
      }, 1000)
    }

    if (waterfallSound) {
      waterfallSound.fade(waterfallSound.volume(), 0, 1000)
      setTimeout(() => {
        waterfallSound?.stop()
        waterfallSound?.unload()
        waterfallSound = null
      }, 1000)
    }

    if (ambientSound) {
      ambientSound.fade(ambientSound.volume(), 0, 1000)
      setTimeout(() => {
        ambientSound?.stop()
        ambientSound?.unload()
        ambientSound = null
      }, 1000)
    }

    if (forestWindSound) {
      forestWindSound.fade(forestWindSound.volume(), 0, 1000)
      setTimeout(() => {
        forestWindSound?.stop()
        forestWindSound?.unload()
        forestWindSound = null
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
    playBirdsSound,
    stopBirdsSound,
    playWaterfallSound,
    stopWaterfallSound,
    playForestWindSound,
    stopForestWindSound,
    playAmbientSound,
    stopAmbientSound,
    setMuted,
    setVolume,
    playTrack,
    togglePlayPause,
    getIsPlaying,
    stopMusic
  }
}
