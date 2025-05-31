<template>
  <div 
    class="deck-card" 
    :style="{ backgroundColor: deck.color }"
    @click="$emit('click', deck.id)"
  >
    <div class="deck-card-content">
      <div class="deck-header">
        <h3 class="deck-name">{{ deck.name }}</h3>
        <div class="deck-actions" @click.stop>
          <button @click="$emit('edit', deck)" class="action-icon">
            <i class="fas fa-edit"></i>
          </button>
          <button @click="$emit('delete', deck)" class="action-icon delete">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
      
      <p v-if="deck.description" class="deck-description">{{ deck.description }}</p>
      
      <div class="deck-footer">
        <div class="card-count">
          <i class="fas fa-layer-group"></i>
          <span>{{ deck.card_count || 0 }} cards</span>
        </div>
        
        <button 
          v-if="deck.card_count > 0"
          @click.stop="$emit('study', deck.id)" 
          class="study-btn"
        >
          <i class="fas fa-play"></i>
          Study
        </button>
      </div>
    </div>
    
    <div class="deck-card-overlay"></div>
  </div>
</template>

<script>
export default {
  name: 'DeckCard',
  props: {
    deck: {
      type: Object,
      required: true
    }
  },
  
  emits: ['click', 'edit', 'delete', 'study']
}
</script>

<style scoped>
.deck-card {
  position: relative;
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  transform: translateY(0);
  box-shadow: 
    0 4px 12px rgba(138, 173, 244, 0.15),
    0 2px 4px rgba(138, 173, 244, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  overflow: hidden;
  min-height: 160px;
  display: flex;
  flex-direction: column;
}

.deck-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 
    0 12px 32px rgba(138, 173, 244, 0.25),
    0 8px 16px rgba(138, 173, 244, 0.15);
}

.deck-card:active {
  transform: translateY(-4px) scale(1.01);
}

.deck-card-content {
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.deck-card-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  pointer-events: none;
}

.deck-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.deck-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-900);
  margin: 0;
  line-height: 1.3;
  flex: 1;
  margin-right: 12px;
}

.deck-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.deck-card:hover .deck-actions {
  opacity: 1;
}

.action-icon {
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  color: var(--text-600);
}

.action-icon:hover {
  background: rgba(255, 255, 255, 0.95);
  transform: scale(1.1);
}

.action-icon.delete:hover {
  background: var(--error-100);
  color: var(--error-600);
}

.deck-description {
  color: var(--text-700);
  font-size: 0.9rem;
  line-height: 1.4;
  margin: 0 0 16px 0;
  flex: 1;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.deck-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.card-count {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-600);
  font-size: 0.875rem;
  font-weight: 500;
}

.card-count i {
  font-size: 0.8rem;
}

.study-btn {
  background: var(--primary-600);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.study-btn:hover {
  background: var(--primary-700);
  transform: scale(1.05);
}

.study-btn i {
  font-size: 0.75rem;
}
</style>
