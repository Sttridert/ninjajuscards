<template>
  <div class="home">
    <div class="container">
      <!-- Header -->
      <header class="page-header">
        <h1 class="page-title">
          <i class="fas fa-graduation-cap"></i>
          Study Cards
        </h1>
        <p class="page-subtitle">Organize your learning with beautiful, animated study cards</p>
      </header>

      <!-- Search Bar -->
      <div class="search-section">
        <div class="search-bar">
          <i class="fas fa-search"></i>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Search decks and cards..."
            @input="handleSearch"
          >
        </div>
      </div>

      <!-- Search Results -->
      <div v-if="searchQuery && searchResults" class="search-results">
        <h3>Search Results</h3>
        <div v-if="searchResults.decks.length === 0 && searchResults.cards.length === 0" class="empty-state">
          <i class="fas fa-search"></i>
          <p>No results found for "{{ searchQuery }}"</p>
        </div>
        <div v-else>
          <div v-if="searchResults.decks.length > 0" class="search-section">
            <h4>Decks</h4>
            <div class="deck-grid">
              <DeckCard 
                v-for="deck in searchResults.decks" 
                :key="deck.id" 
                :deck="deck"
                @click="viewDeck(deck.id)"
              />
            </div>
          </div>
          <div v-if="searchResults.cards.length > 0" class="search-section">
            <h4>Cards</h4>
            <div class="card-results">
              <div 
                v-for="card in searchResults.cards" 
                :key="card.id"
                class="card-result"
                @click="viewDeckFromCard(card.deck_id)"
              >
                <div class="card-content">
                  <strong>{{ card.front }}</strong>
                  <p>{{ card.back }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Folders and Decks -->
      <div v-else>
        <!-- Quick Actions -->
        <div class="quick-actions">
          <button @click="showFolderForm = true" class="action-btn primary">
            <i class="fas fa-folder-plus"></i>
            New Folder
          </button>
          <button @click="showDeckForm = true" class="action-btn secondary">
            <i class="fas fa-plus"></i>
            New Deck
          </button>
        </div>

        <!-- Folders -->
        <div v-if="loading" class="loading">
          <i class="fas fa-spinner fa-spin"></i>
          <p>Loading your study materials...</p>
        </div>

        <div v-else-if="folders.length === 0" class="empty-state">
          <i class="fas fa-folder-open"></i>
          <h3>No folders yet</h3>
          <p>Create your first folder to organize your study decks</p>
          <button @click="showFolderForm = true" class="action-btn primary">
            <i class="fas fa-folder-plus"></i>
            Create Folder
          </button>
        </div>

        <div v-else class="folders-container">
          <FolderView 
            v-for="folder in folders" 
            :key="folder.id" 
            :folder="folder"
            :decks="getDecksByFolder(folder.id)"
            @deck-selected="viewDeck"
            @create-deck="createDeckInFolder"
          />
        </div>
      </div>

      <!-- Folder Form Modal -->
      <div v-if="showFolderForm" class="modal-overlay" @click="showFolderForm = false">
        <div class="modal" @click.stop>
          <h3>Create New Folder</h3>
          <form @submit.prevent="createFolder">
            <div class="form-group">
              <label>Folder Name</label>
              <input 
                v-model="newFolderName" 
                type="text" 
                placeholder="Enter folder name..."
                required
                autofocus
              >
            </div>
            <div class="form-actions">
              <button type="button" @click="showFolderForm = false" class="btn secondary">
                Cancel
              </button>
              <button type="submit" class="btn primary">
                Create Folder
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Deck Form Modal -->
      <DeckForm 
        v-if="showDeckForm"
        :folders="folders"
        @close="showDeckForm = false"
        @created="onDeckCreated"
      />
    </div>
  </div>
</template>

<script>
import { useStudyStore } from '../stores/index.js'
import FolderView from '../components/FolderView.vue'
import DeckCard from '../components/DeckCard.vue'
import DeckForm from '../components/DeckForm.vue'

export default {
  name: 'Home',
  components: {
    FolderView,
    DeckCard,
    DeckForm
  },
  
  data() {
    return {
      showFolderForm: false,
      showDeckForm: false,
      newFolderName: '',
      searchQuery: '',
      searchResults: null,
      searchTimeout: null
    }
  },

  computed: {
    folders() {
      return this.store.folders
    },
    
    loading() {
      return this.store.loading
    }
  },

  async mounted() {
    this.store = useStudyStore()
    await Promise.all([
      this.store.fetchFolders(),
      this.store.fetchDecks()
    ])
  },

  methods: {
    getDecksByFolder(folderId) {
      return this.store.getDecksByFolder(folderId)
    },

    async createFolder() {
      if (!this.newFolderName.trim()) return
      
      try {
        await this.store.createFolder(this.newFolderName.trim())
        this.newFolderName = ''
        this.showFolderForm = false
      } catch (error) {
        alert('Failed to create folder: ' + error.message)
      }
    },

    createDeckInFolder(folderId) {
      this.selectedFolderId = folderId
      this.showDeckForm = true
    },

    onDeckCreated() {
      this.showDeckForm = false
      this.store.fetchDecks()
    },

    viewDeck(deckId) {
      this.$router.push(`/deck/${deckId}`)
    },

    viewDeckFromCard(deckId) {
      this.$router.push(`/deck/${deckId}`)
    },

    async handleSearch() {
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout)
      }

      if (!this.searchQuery.trim()) {
        this.searchResults = null
        return
      }

      this.searchTimeout = setTimeout(async () => {
        try {
          this.searchResults = await this.store.searchContent(this.searchQuery)
        } catch (error) {
          console.error('Search failed:', error)
        }
      }, 300)
    }
  }
}
</script>
