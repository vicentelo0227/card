import { ref } from 'vue'
import { useGameStore } from '../stores/gameStore'

const preloadedImages = new Set()
const loadingImages = new Map()

export function usePreload() {
  const store = useGameStore()
  const isPreloading = ref(false)

  // Preload a single image
  function preloadImage(src) {
    if (!src || preloadedImages.has(src)) {
      return Promise.resolve()
    }

    if (loadingImages.has(src)) {
      return loadingImages.get(src)
    }

    const promise = new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        preloadedImages.add(src)
        loadingImages.delete(src)
        resolve()
      }
      img.onerror = () => {
        loadingImages.delete(src)
        resolve() // Resolve anyway to not block
      }
      img.src = src
    })

    loadingImages.set(src, promise)
    return promise
  }

  // Preload images for adjacent scenes
  function preloadAdjacentScenes(sceneId) {
    const scene = store.scenes[sceneId]
    if (!scene) return

    isPreloading.value = true

    const imagesToPreload = []

    // Get images from hotspot targets
    scene.hotspots?.forEach(hotspot => {
      if (hotspot.type === 'direction' && hotspot.target) {
        const targetScene = store.scenes[hotspot.target]
        if (targetScene?.image) {
          imagesToPreload.push(targetScene.image)
        }
      }
    })

    // Preload all images
    Promise.all(imagesToPreload.map(preloadImage))
      .finally(() => {
        isPreloading.value = false
      })
  }

  // Check if an image is preloaded
  function isImagePreloaded(src) {
    return preloadedImages.has(src)
  }

  return {
    isPreloading,
    preloadImage,
    preloadAdjacentScenes,
    isImagePreloaded
  }
}
