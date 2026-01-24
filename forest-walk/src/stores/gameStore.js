import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import scenesData from '../data/scenes.json'
import stopPointsData from '../data/stopPoints.json'

export const useGameStore = defineStore('game', () => {
  // State
  const hasStarted = ref(false)
  const currentSceneId = ref(null)
  const previousSceneId = ref(null)
  const sceneHistory = ref([])
  const visitedScenes = ref(new Set())
  const visitedStopPoints = ref(new Set())
  const isTransitioning = ref(false)
  const activeStopPoint = ref(null)
  const isMuted = ref(false)

  // Getters
  const scenes = computed(() => scenesData.scenes)
  const stopPoints = computed(() => stopPointsData.stopPoints)
  const startScene = computed(() => scenesData.startScene)

  const currentScene = computed(() => {
    if (!currentSceneId.value) return null
    return scenes.value[currentSceneId.value]
  })

  const canGoBack = computed(() => {
    return sceneHistory.value.length > 0
  })

  const totalScenes = computed(() => Object.keys(scenes.value).length)
  const totalStopPoints = computed(() => Object.keys(stopPoints.value).length)
  const visitedScenesCount = computed(() => visitedScenes.value.size)
  const visitedStopPointsCount = computed(() => visitedStopPoints.value.size)

  const currentStopPointData = computed(() => {
    if (!activeStopPoint.value) return null
    return stopPoints.value[activeStopPoint.value]
  })

  // Actions
  function startGame() {
    hasStarted.value = true
    goToScene(startScene.value, false)
  }

  function goToScene(sceneId, addToHistory = true) {
    if (isTransitioning.value) return
    if (!scenes.value[sceneId]) {
      console.warn(`Scene not found: ${sceneId}`)
      return
    }

    isTransitioning.value = true

    // Close any open stop point
    closeStopPoint()

    // Add current scene to history before navigating
    if (addToHistory && currentSceneId.value) {
      sceneHistory.value.push(currentSceneId.value)
    }

    previousSceneId.value = currentSceneId.value
    currentSceneId.value = sceneId
    visitedScenes.value.add(sceneId)

    // Transition delay
    setTimeout(() => {
      isTransitioning.value = false
    }, 800)
  }

  function goBack() {
    if (!canGoBack.value || isTransitioning.value) return

    const previousScene = sceneHistory.value.pop()
    if (previousScene) {
      goToScene(previousScene, false)
    }
  }

  function openStopPoint(stopPointId) {
    if (!stopPoints.value[stopPointId]) {
      console.warn(`Stop point not found: ${stopPointId}`)
      return
    }
    activeStopPoint.value = stopPointId
    visitedStopPoints.value.add(stopPointId)
  }

  function closeStopPoint() {
    activeStopPoint.value = null
  }

  function toggleMute() {
    isMuted.value = !isMuted.value
  }

  function resetGame() {
    hasStarted.value = false
    currentSceneId.value = null
    previousSceneId.value = null
    sceneHistory.value = []
    visitedScenes.value = new Set()
    visitedStopPoints.value = new Set()
    isTransitioning.value = false
    activeStopPoint.value = null
  }

  // Load saved progress from localStorage
  function loadProgress() {
    try {
      const saved = localStorage.getItem('forest-walk-progress')
      if (saved) {
        const data = JSON.parse(saved)
        visitedScenes.value = new Set(data.visitedScenes || [])
        visitedStopPoints.value = new Set(data.visitedStopPoints || [])
        return data.currentSceneId || null
      }
    } catch (e) {
      console.warn('Failed to load progress:', e)
    }
    return null
  }

  // Save progress to localStorage
  function saveProgress() {
    try {
      const data = {
        currentSceneId: currentSceneId.value,
        visitedScenes: Array.from(visitedScenes.value),
        visitedStopPoints: Array.from(visitedStopPoints.value),
      }
      localStorage.setItem('forest-walk-progress', JSON.stringify(data))
    } catch (e) {
      console.warn('Failed to save progress:', e)
    }
  }

  function clearProgress() {
    localStorage.removeItem('forest-walk-progress')
    resetGame()
  }

  return {
    // State
    hasStarted,
    currentSceneId,
    previousSceneId,
    sceneHistory,
    visitedScenes,
    visitedStopPoints,
    isTransitioning,
    activeStopPoint,
    isMuted,

    // Getters
    scenes,
    stopPoints,
    startScene,
    currentScene,
    canGoBack,
    totalScenes,
    totalStopPoints,
    visitedScenesCount,
    visitedStopPointsCount,
    currentStopPointData,

    // Actions
    startGame,
    goToScene,
    goBack,
    openStopPoint,
    closeStopPoint,
    toggleMute,
    resetGame,
    loadProgress,
    saveProgress,
    clearProgress,
  }
})
