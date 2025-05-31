<template>
  <div class="study-card-wrapper">
    <div 
      class="study-card" 
      :class="{ 
        'flipped': showBack, 
        'study-mode': studyMode,
        'interactive': interactive 
      }"
      @click="handleClick"
    >
      <!-- Front Side -->
      <div class="card-side card-front">
        <div class="card-content">
          <div class="card-text" v-html="formatText(card.front)"></div>
          <div v-if="!studyMode" class="card-label">Front</div>
        </div>
        
        <div v-if="interactive" class="card-actions" @click.stop>
          <button @click="$emit('edit', card)" class="action-btn edit">
            <i class="fas fa-edit"></i>
          </button>
          <button @click="$emit('delete', card)" class="action-btn delete">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>

      <!-- Back Side -->
      <div class="card-side card-back">
        <div class="card-content">
          <div class="card-text" v-html="formatText(card.back)"></div>
          <div v-if="!studyMode" class="card-label">Back</div>
        </div>
        
        <div v-if="interactive" class="card-actions" @click.stop>
          <button @click="$emit('edit', card)" class="action-btn edit">
            <i class="fas fa-edit"></i>
          </button>
          <button @click="$emit('delete', card)" class="action-btn delete">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Study Mode Flip Button -->
    <div v-if="studyMode && !showBack" class="flip-hint">
      <i class="fas fa-hand-pointer"></i>
      <span>Tap to reveal answer</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StudyCard',
  props: {
    card: {
      type: Object,
      required: true
    },
    studyMode: {
      type: Boolean,
      default: false
    },
    showBack: {
      type: Boolean,
      default: false
    },
    interactive: {
      type: Boolean,
      default: false
    }
  },

  emits: ['flip', 'edit', 'delete'],

  methods: {
    handleClick() {
      if (this.studyMode || this.interactive) {
        this.$emit('flip')
      }
    },

    formatText(text) {
      // Simple text formatting
      return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>')
    }
  }
}
</script>

<style scoped>
.study-card-wrapper {
  position: relative;
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}

.study-card {
  position: relative;
  width: 100%;
  height: 280px;
  transform-style: preserve-3d;
  transition: transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  cursor: pointer;
  border-radius: 16px;
}

.study-card.study-mode {
  height: 320px;
  cursor: pointer;
}

.study-card.interactive {
  height: 240px;
}

.study-card.flipped {
  transform: rotateY(180deg);
}

.card-side {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-shadow: 
    0 8px 32px rgba(138, 173, 244, 0.2),
    0 4px 16px rgba(138, 173, 244, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(20px);
  overflow: hidden;
}

.card-front {
  background: linear-gradient(135deg, 
    var(--primary-50) 0%, 
    var(--primary-100) 50%, 
    var(--primary-200) 100%);
}

.card-back {
  background: linear-gradient(135deg, 
    var(--secondary-50) 0%, 
    var(--secondary-100) 50%, 
    var(--secondary-200) 100%);
  transform: rotateY(180deg);
}

.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  position: relative;
}

.card-text {
  font-size: 1.1rem;
  line-height: 1.6;
  color: var(--text-900);
  font-weight: 500;
  word-wrap: break-word;
  max-width: 100%;
}

.study-card.study-mode .card-text {
  font-size: 1.25rem;
  line-height: 1.7;
  font-weight: 600;
}

.card-label {
  position: absolute;
  top: -8px;
  right: -8px;
  background: var(--primary-600);
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.card-back .card-label {
  background: var(--secondary-600);
}

.card-actions {
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.study-card:hover .card-actions {
  opacity: 1;
}

.action-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
}

.action-btn.edit {
  background: rgba(255, 255, 255, 0.9);
  color: var(--primary-600);
}

.action-btn.delete {
  background: rgba(255, 255, 255, 0.9);
  color: var(--error-600);
}

.action-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.action-btn.edit:hover {
  background: var(--primary-50);
}

.action-btn.delete:hover {
  background: var(--error-50);
}

.flip-hint {
  margin-top: 16px;
  text-align: center;
  color: var(--text-600);
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .study-card {
    height: 240px;
  }
  
  .study-card.study-mode {
    height: 280px;
  }
  
  .card-side {
    padding: 20px;
  }
  
  .card-text {
    font-size: 1rem;
  }
  
  .study-card.study-mode .card-text {
    font-size: 1.1rem;
  }
}
</style>
