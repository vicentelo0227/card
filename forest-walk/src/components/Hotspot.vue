<template>
  <button
    :class="[
      'hotspot',
      hotspot.type === 'stop' ? 'hotspot-stop hotspot-breathe' : 'hotspot-direction hotspot-pulse',
      hotspot.enhancedGlow ? 'enhanced-glow' : ''
    ]"
    :style="hotspotStyle"
    :aria-label="hotspot.accessibleLabel || hotspot.label"
    @click="handleClick"
    @mouseenter="showHint = true"
    @mouseleave="showHint = false"
    @focus="showHint = true"
    @blur="showHint = false"
  >
    <!-- Glow effect -->
    <div class="absolute inset-0 rounded-inherit opacity-60">
      <div 
        :class="[
          'absolute inset-0 rounded-inherit',
          hotspot.type === 'stop' ? 'bg-gold-bright/30' : 'bg-gold-muted/20'
        ]"
      ></div>
    </div>

    <!-- Label -->
    <span class="hotspot-label">
      {{ hotspot.label }}
    </span>

    <!-- Hint text on hover -->
    <Transition name="hint">
      <span 
        v-if="showHint && hotspot.hintText"
        class="absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-gold-muted pointer-events-none"
        style="top: calc(100% + 24px); text-shadow: 0 2px 4px rgba(0, 0, 0, 0.9), 0 4px 12px rgba(0, 0, 0, 0.6);"
      >
        {{ hotspot.hintText }}
      </span>
    </Transition>
  </button>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useGameStore } from '../stores/gameStore'

const props = defineProps({
  hotspot: {
    type: Object,
    required: true
  }
})

const store = useGameStore()
const showHint = ref(false)

const hotspotStyle = computed(() => {
  const baseSize = props.hotspot.type === 'stop' ? 48 : 40
  const width = props.hotspot.size?.width || 10
  const height = props.hotspot.size?.height || 10

  return {
    left: `${props.hotspot.position.x}%`,
    top: `${props.hotspot.position.y}%`,
    width: `${Math.max(width * 4, baseSize)}px`,
    height: `${Math.max(height * 4, baseSize)}px`,
    minWidth: '44px',
    minHeight: '44px'
  }
})

function handleClick() {
  if (props.hotspot.type === 'stop' && props.hotspot.stopPoint) {
    store.openStopPoint(props.hotspot.stopPoint)
  } else if (props.hotspot.type === 'direction' && props.hotspot.target) {
    store.goToScene(props.hotspot.target)
  }
}
</script>

<style scoped>
.hint-enter-active,
.hint-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.hint-enter-from,
.hint-leave-to {
  opacity: 0;
  transform: translate(-50%, 4px);
}

.rounded-inherit {
  border-radius: inherit;
}

.hotspot-breathe {
  animation: hotspot-breathe 4s ease-in-out infinite;
}

.hotspot-pulse {
  animation: hotspot-pulse 3s ease-in-out infinite;
}

@keyframes hotspot-breathe {
  0%, 100% { 
    opacity: 0.7;
    box-shadow: 0 0 12px rgba(232, 217, 184, 0.4);
  }
  50% { 
    opacity: 1;
    box-shadow: 0 0 20px rgba(232, 217, 184, 0.65);
  }
}

@keyframes hotspot-pulse {
  0%, 100% { 
    opacity: 0.6;
    box-shadow: 0 0 10px rgba(200, 184, 150, 0.35);
  }
  50% { 
    opacity: 0.95;
    box-shadow: 0 0 16px rgba(200, 184, 150, 0.55);
  }
}
</style>
