<template>
  <div class="deck-view">
    <div class="container">
      <!-- Header -->
      <header class="deck-header">
        <button @click="$router.go(-1)" class="back-btn">
          <i class="fas fa-arrow-left"></i>
          Back
        </button>
        
        <div v-if="deck" class="deck-info">
          <h1 class="deck-title">{{ deck.name }}</h1>
          <p v-if="deck.description" class="deck-description">{{ deck.description }}</p>
          <div class="deck-stats">
            <span class="stat">
              <i class="fas fa-layer-group"></i>
              {{ cards.length }} cards
            </span>
            <span class="stat">
              <i class="fas fa-clock"></i>
              Created {{ formatDate(deck.created_at) }}
            </span>
          </div>
        </div>

        <div class="deck-actions">
          <button 
            v-if="cards.length > 0"
            @click="startStudy" 
            class="action-btn primary study-btn"
          >
            <i class="fas fa-play"></i>
            Study Now
          </button>
          <button @click="showCardForm = true" class="action-btn secondary">
            <i class="fas fa-plus"></i>
            Add Card
          </button>
        </div>
      </header>

      <!-- Loading State -->
      <div v-if="loading" class="loading">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Loading deck...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="cards.length === 0" class="empty-state">
        <i class="fas fa-layer-group"></i>
        <h3>No cards in this deck</h3>
        <p>Add your first study card to get started</p>
        <button @click="showCardForm = true" class="action-btn primary">
          <i class="fas fa-plus"></i>
          Add First Card
        </button>
      </div>

      <!-- Cards Grid -->
      <div v-else class="cards-grid">
        <StudyCard
          v-for="card in cards"
          :key="card.id"
          :card="card"
          :interactive="true"
          @edit="editCard"
          @delete="deleteCard"
        />
      </div>

      <!-- Add Card Form Modal -->
      <CardForm
        v-if="showCardForm"
        :deck-id="parseInt(id)"
        :editing-card="editingCard"
        @close="closeCardForm"
        @saved="onCardSaved"
      />
    </div>
  </div>
</template>

<script>
import { useStudyStore } from '../stores/index.js'
import StudyCard from '../components/StudyCard.vue'
import CardForm from '../components/CardForm.vue'

export default {
  name: 'DeckView',
  components: {
    StudyCard,
    CardForm
  },
  
  props: {
    id: {
      type: String,
      required: true
    }
  },

  data() {
    return {
      showCardForm: false,
      editingCard: null
    }
  },

  computed: {
    deck() {
      return this.store.getDeckById(parseInt(this.id))
    },

    cards() {
      return this.store.getCardsByDeck(parseInt(this.id))
    },

    loading() {
      return this.store.loading
    }
  },

  async mounted() {
    this.store = useStudyStore()
    
    // Fetch deck and cards data
    await Promise.all([
      this.store.fetchDecks(),
      this.store.fetchCards(parseInt(this.id))
    ])
  },

  methods: {
    startStudy() {
      this.$router.push(`/study/${this.id}`)
    },

    editCard(card) {
      this.editingCard = card
      this.showCardForm = true
    },

    async deleteCard(card) {
      if (confirm(`Are you sure you want to delete this card?\n\nFront: ${card.front}`)) {
        try {
          await this.store.deleteCard(card.id)
        } catch (error) {
          alert('Failed to delete card: ' + error.message)
        }
      }
    },

    closeCardForm() {
      this.showCardForm = false
      this.editingCard = null
    },

    onCardSaved() {
      this.closeCardForm()
    },

    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString()
    }
  }
}
</script>
