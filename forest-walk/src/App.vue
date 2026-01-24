<template>
  <div class="w-full h-screen overflow-hidden bg-forest-dark">
    <!-- Intro Screen -->
    <IntroScreen v-if="!store.hasStarted" />

    <!-- Main Game -->
    <template v-else>
      <!-- Scene View -->
      <SceneView />

      <!-- UI Overlay -->
      <BackButton />
      <SceneTitle />
      <MuteButton />
      <GuidePanel />
    </template>
  </div>
</template>

<script setup>
import { useGameStore } from './stores/gameStore'
import IntroScreen from './components/IntroScreen.vue'
import SceneView from './components/SceneView.vue'
import BackButton from './components/BackButton.vue'
import SceneTitle from './components/SceneTitle.vue'
import MuteButton from './components/MuteButton.vue'
import GuidePanel from './components/GuidePanel.vue'

const store = useGameStore()
</script>
