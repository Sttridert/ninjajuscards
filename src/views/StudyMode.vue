<template>
  <div class="study-mode">
    <div class="container">
      <!-- Study Header -->
      <header class="study-header">
        <button @click="exitStudy" class="back-btn">
          <i class="fas fa-times"></i>
          Exit Study
        </button>
        
        <div v-if="deck" class="study-info">
          <h1 class="study-title">{{ deck.name }}</h1>
          <div class="progress-info">
            <span>{{ currentIndex + 1 }} / {{ cards.length }}</span>
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: progressPercentage + '%' }"
              ></div>
            </div>
          </div>
        </div>
      </header>

      <!-- Study Content -->
      <div v-if="loading" class="loading">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Loading study session...</p>
      </div>

      <div v-else-if="cards.length === 0" class="empty-state">
        <i class="fas fa-layer-group"></i>
        <h3>No cards to study</h3>
        <p>This deck doesn't have any cards yet</p>
        <button @click="$router.push(`/deck/${id}`)" class="action-btn primary">
          <i class="fas fa-plus"></i>
          Add Cards
        </button>
      </div>

      <div v-else-if="studyComplete" class="study-complete">
        <div class="completion-card">
          <i class="fas fa-trophy"></i>
          <h2>Study Session Complete!</h2>
          <p>You've reviewed {{ cards.length }} cards</p>
          
          <div class="study-stats">
            <div class="stat">
              <span class="stat-number">{{ correctAnswers }}</span>
              <span class="stat-label">Correct</span>
            </div>
            <div class="stat">
              <span class="stat-number">{{ incorrectAnswers }}</span>
              <span class="stat-label">Needs Review</span>
            </div>
            <div class="stat">
              <span class="stat-number">{{ Math.round((correctAnswers / cards.length) * 100) }}%</span>
              <span class="stat-label">Accuracy</span>
            </div>
          </div>

          <div class="completion-actions">
            <button @click="restartStudy" class="action-btn secondary">
              <i class="fas fa-redo"></i>
              Study Again
            </button>
            <button @click="exitStudy" class="action-btn primary">
              <i class="fas fa-check"></i>
              Done
            </button>
          </div>
        </div>
      </div>

      <div v-else class="study-card-container">
        <StudyCard
          :card="currentCard"
          :study-mode="true"
          :show-back="showBack"
          @flip="flipCard"
          class="study-card"
        />

        <div class="study-controls">
          <button 
            v-if="!showBack" 
            @click="flipCard" 
            class="control-btn flip-btn"
          >
            <i class="fas fa-eye"></i>
            Show Answer
          </button>
          
          <div v-else class="difficulty-controls">
            <p class="difficulty-prompt">How well did you know this?</p>
            <div class="difficulty-buttons">
              <button 
                @click="answerCard(0)" 
                class="difficulty-btn hard"
              >
                <i class="fas fa-times"></i>
                Hard
              </button>
              <button 
                @click="answerCard(1)" 
                class="difficulty-btn medium"
              >
                <i class="fas fa-minus"></i>
                Medium
              </button>
              <button 
                @click="answerCard(2)" 
                class="difficulty-btn easy"
              >
                <i class="fas fa-check"></i>
                Easy
              </button>
            </div>
          </div>
        </div>

        <!-- Navigation -->
        <div class="study-navigation">
          <button 
            @click="previousCard" 
            :disabled="currentIndex === 0"
            class="nav-btn"
          >
            <i class="fas fa-chevron-left"></i>
            Previous
          </button>
          
          <span class="card-counter">
            {{ currentIndex + 1 }} of {{ cards.length }}
          </span>
          
          <button 
            @click="nextCard" 
            :disabled="currentIndex >= cards.length - 1"
            class="nav-btn"
          >
            Next
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useStudyStore } from '../stores/index.js'
import StudyCard from '../components/StudyCard.vue'

export default {
  name: 'StudyMode',
  components: {
    StudyCard
  },
  
  props: {
    id: {
      type: String,
      required: true
    }
  },

  data() {
    return {
      currentIndex: 0,
      showBack: false,
      studyComplete: false,
      correctAnswers: 0,
      incorrectAnswers: 0,
      answeredCards: new Set()
    }
  },

  computed: {
    deck() {
      return this.store.getDeckById(parseInt(this.id))
    },

    cards() {
      return this.store.getCardsByDeck(parseInt(this.id))
    },

    currentCard() {
      return this.cards[this.currentIndex]
    },

    loading() {
      return this.store.loading
    },

    progressPercentage() {
      if (this.cards.length === 0) return 0
      return ((this.currentIndex + 1) / this.cards.length) * 100
    }
  },

  async mounted() {
    this.store = useStudyStore()
    
    // Fetch deck and cards data
    await Promise.all([
      this.store.fetchDecks(),
      this.store.fetchCards(parseInt(this.id))
    ])

    // Shuffle cards for study session
    this.shuffleCards()
  },

  methods: {
    shuffleCards() {
      // Fisher-Yates shuffle algorithm
      const shuffled = [...this.cards]
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
      }
      this.store.cards = shuffled
    },

    flipCard() {
      this.showBack = !this.showBack
    },

    async answerCard(difficulty) {
      const cardId = this.currentCard.id
      
      // Track answer for statistics
      if (!this.answeredCards.has(cardId)) {
        this.answeredCards.add(cardId)
        if (difficulty >= 1) {
          this.correctAnswers++
        } else {
          this.incorrectAnswers++
        }
      }

      // Update card difficulty in backend
      try {
        await this.store.updateCard(cardId, { difficulty })
      } catch (error) {
        console.error('Failed to update card difficulty:', error)
      }

      // Move to next card
      this.nextCard()
    },

    nextCard() {
      if (this.currentIndex < this.cards.length - 1) {
        this.currentIndex++
        this.showBack = false
      } else {
        this.completeStudy()
      }
    },

    previousCard() {
      if (this.currentIndex > 0) {
        this.currentIndex--
        this.showBack = false
      }
    },

    completeStudy() {
      this.studyComplete = true
    },

    restartStudy() {
      this.currentIndex = 0
      this.showBack = false
      this.studyComplete = false
      this.correctAnswers = 0
      this.incorrectAnswers = 0
      this.answeredCards.clear()
      this.shuffleCards()
    },

    exitStudy() {
      this.$router.push(`/deck/${this.id}`)
    }
  }
}
</script>
