<template>
  <nav class="navigation">
    <div class="nav-container">
      <!-- Logo/Brand -->
      <router-link to="/" class="nav-brand">
        <i class="fas fa-graduation-cap"></i>
        <span>Study Cards</span>
      </router-link>

      <!-- Navigation Links -->
      <div class="nav-links">
        <router-link to="/" class="nav-link">
          <i class="fas fa-home"></i>
          <span>Home</span>
        </router-link>
      </div>

      <!-- Actions -->
      <div class="nav-actions">
        <button @click="toggleSearch" class="nav-action">
          <i class="fas fa-search"></i>
        </button>
      </div>
    </div>

    <!-- Search Overlay -->
    <div v-if="showSearch" class="search-overlay" @click="closeSearch">
      <div class="search-container" @click.stop>
        <div class="search-header">
          <h3>Search Study Materials</h3>
          <button @click="closeSearch" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="search-input-container">
          <i class="fas fa-search"></i>
          <input
            ref="searchInput"
            v-model="searchQuery"
            type="text"
            placeholder="Search decks and cards..."
            @input="handleSearch"
          >
        </div>

        <div v-if="searchResults" class="search-results">
          <div v-if="searchResults.decks.length === 0 && searchResults.cards.length === 0" class="no-results">
            <i class="fas fa-search"></i>
            <p>No results found</p>
          </div>
          
          <div v-else class="results-content">
            <div v-if="searchResults.decks.length > 0" class="result-section">
              <h4>Decks</h4>
              <div class="result-items">
                <div
                  v-for="deck in searchResults.decks"
                  :key="deck.id"
                  class="result-item"
                  @click="viewDeck(deck.id)"
                >
                  <i class="fas fa-layer-group"></i>
                  <div class="result-content">
                    <span class="result-title">{{ deck.name }}</span>
                    <span class="result-subtitle">{{ deck.description }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="searchResults.cards.length > 0" class="result-section">
              <h4>Cards</h4>
              <div class="result-items">
                <div
                  v-for="card in searchResults.cards"
                  :key="card.id"
                  class="result-item"
                  @click="viewCard(card)"
                >
                  <i class="fas fa-file-alt"></i>
                  <div class="result-content">
                    <span class="result-title">{{ card.front }}</span>
                    <span class="result-subtitle">{{ card.back }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import { useStudyStore } from '../stores/index.js'

export default {
  name: 'Navigation',
  data() {
    return {
      showSearch: false,
      searchQuery: '',
      searchResults: null,
      searchTimeout: null
    }
  },

  mounted() {
    this.store = useStudyStore()
  },

  methods: {
    toggleSearch() {
      this.showSearch = !this.showSearch
      if (this.showSearch) {
        this.$nextTick(() => {
          this.$refs.searchInput?.focus()
        })
      }
    },

    closeSearch() {
      this.showSearch = false
      this.searchQuery = ''
      this.searchResults = null
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
    },

    viewDeck(deckId) {
      this.$router.push(`/deck/${deckId}`)
      this.closeSearch()
    },

    viewCard(card) {
      this.$router.push(`/deck/${card.deck_id}`)
      this.closeSearch()
    }
  }
}
</script>

<style scoped>
.navigation {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(138, 173, 244, 0.2);
  z-index: 100;
  height: 70px;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: var(--primary-700);
  font-size: 1.25rem;
  font-weight: 700;
  transition: all 0.2s ease;
}

.nav-brand:hover {
  color: var(--primary-800);
  transform: scale(1.05);
}

.nav-brand i {
  font-size: 1.5rem;
}

.nav-links {
  display: flex;
  gap: 24px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: var(--text-600);
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: var(--primary-700);
  background: var(--primary-50);
}

.nav-actions {
  display: flex;
  gap: 12px;
}

.nav-action {
  width: 40px;
  height: 40px;
  border: none;
  background: var(--gray-100);
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-600);
  transition: all 0.2s ease;
}

.nav-action:hover {
  background: var(--gray-200);
  color: var(--text-900);
}

/* Search Overlay */
.search-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 80px 20px 20px;
}

.search-container {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 600px;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  animation: searchSlideDown 0.3s ease-out;
}

@keyframes searchSlideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.search-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px 16px;
  border-bottom: 1px solid var(--border-200);
}

.search-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-900);
}

.close-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: var(--gray-100);
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-600);
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: var(--gray-200);
  color: var(--text-900);
}

.search-input-container {
  position: relative;
  padding: 20px 24px;
}

.search-input-container i {
  position: absolute;
  left: 36px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-400);
}

.search-input-container input {
  width: 100%;
  padding: 12px 16px 12px 40px;
  border: 2px solid var(--border-200);
  border-radius: 10px;
  font-size: 1rem;
  background: var(--gray-50);
  transition: all 0.2s ease;
}

.search-input-container input:focus {
  outline: none;
  border-color: var(--primary-500);
  background: white;
  box-shadow: 0 0 0 3px rgba(138, 173, 244, 0.1);
}

.search-results {
  padding: 0 24px 24px;
}

.no-results {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-500);
}

.no-results i {
  font-size: 3rem;
  margin-bottom: 16px;
  display: block;
}

.result-section {
  margin-bottom: 24px;
}

.result-section h4 {
  margin: 0 0 12px 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-700);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.result-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.result-item:hover {
  background: var(--primary-25);
  border-color: var(--primary-200);
}

.result-item i {
  color: var(--primary-600);
  width: 20px;
  text-align: center;
}

.result-content {
  flex: 1;
  min-width: 0;
}

.result-title {
  display: block;
  font-weight: 600;
  color: var(--text-900);
  margin-bottom: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.result-subtitle {
  display: block;
  font-size: 0.875rem;
  color: var(--text-600);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .nav-container {
    padding: 0 16px;
  }
  
  .nav-brand span {
    display: none;
  }
  
  .nav-link span {
    display: none;
  }
  
  .search-overlay {
    padding: 70px 10px 10px;
  }
  
  .search-container {
    max-height: calc(100vh - 90px);
  }
  
  .search-header,
  .search-input-container,
  .search-results {
    padding-left: 16px;
    padding-right: 16px;
  }
}
</style>
