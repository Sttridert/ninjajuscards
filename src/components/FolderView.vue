<template>
  <div class="folder-view">
    <div class="folder-header">
      <div class="folder-info">
        <i class="fas fa-folder-open folder-icon"></i>
        <h2 class="folder-name">{{ folder.name }}</h2>
        <span class="deck-count">{{ decks.length }} deck{{ decks.length !== 1 ? 's' : '' }}</span>
      </div>
      
      <div class="folder-actions">
        <button 
          @click="$emit('create-deck', folder.id)" 
          class="action-btn secondary"
          title="Add deck to this folder"
        >
          <i class="fas fa-plus"></i>
          Add Deck
        </button>
      </div>
    </div>

    <!-- Empty Folder State -->
    <div v-if="decks.length === 0" class="empty-folder">
      <i class="fas fa-layer-group"></i>
      <p>No decks in this folder</p>
      <button @click="$emit('create-deck', folder.id)" class="action-btn primary">
        <i class="fas fa-plus"></i>
        Create First Deck
      </button>
    </div>

    <!-- Decks Grid -->
    <div v-else class="decks-grid">
      <DeckCard
        v-for="deck in decks"
        :key="deck.id"
        :deck="deck"
        @click="$emit('deck-selected', deck.id)"
        @edit="editDeck"
        @delete="deleteDeck"
        @study="startStudy"
      />
    </div>
  </div>
</template>

<script>
import DeckCard from './DeckCard.vue'

export default {
  name: 'FolderView',
  components: {
    DeckCard
  },
  
  props: {
    folder: {
      type: Object,
      required: true
    },
    decks: {
      type: Array,
      default: () => []
    }
  },

  emits: ['deck-selected', 'create-deck'],

  methods: {
    editDeck(deck) {
      // TODO: Implement deck editing
      console.log('Edit deck:', deck)
    },

    async deleteDeck(deck) {
      if (confirm(`Are you sure you want to delete the deck "${deck.name}"?\n\nThis will also delete all cards in the deck.`)) {
        try {
          await this.$store.deleteDeck(deck.id)
        } catch (error) {
          alert('Failed to delete deck: ' + error.message)
        }
      }
    },

    startStudy(deckId) {
      this.$router.push(`/study/${deckId}`)
    }
  }
}
</script>

<style scoped>
.folder-view {
  background: rgba(255, 255, 255, 0.7);
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 32px;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 
    0 8px 32px rgba(138, 173, 244, 0.15),
    0 4px 16px rgba(138, 173, 244, 0.1);
  transition: all 0.3s ease;
}

.folder-view:hover {
  box-shadow: 
    0 12px 48px rgba(138, 173, 244, 0.2),
    0 6px 24px rgba(138, 173, 244, 0.15);
  transform: translateY(-2px);
}

.folder-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(138, 173, 244, 0.2);
}

.folder-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.folder-icon {
  font-size: 1.5rem;
  color: var(--primary-600);
}

.folder-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-900);
  margin: 0;
}

.deck-count {
  background: var(--primary-100);
  color: var(--primary-700);
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
}

.folder-actions {
  display: flex;
  gap: 12px;
}

.empty-folder {
  text-align: center;
  padding: 48px 20px;
  color: var(--text-600);
}

.empty-folder i {
  font-size: 3rem;
  color: var(--text-400);
  margin-bottom: 16px;
  display: block;
}

.empty-folder p {
  font-size: 1.1rem;
  margin-bottom: 24px;
}

.decks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .folder-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .folder-info {
    width: 100%;
  }
  
  .folder-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .decks-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}

@media (max-width: 480px) {
  .folder-view {
    padding: 16px;
    margin-bottom: 20px;
  }
  
  .folder-header {
    margin-bottom: 16px;
    padding-bottom: 12px;
  }
  
  .folder-name {
    font-size: 1.25rem;
  }
  
  .folder-actions {
    justify-content: center;
  }
}
</style>
