import { defineStore } from 'pinia'

const API_BASE = '/api'

export const useStudyStore = defineStore('study', {
  state: () => ({
    folders: [],
    decks: [],
    cards: [],
    currentDeck: null,
    loading: false,
    error: null
  }),

  getters: {
    getDecksByFolder: (state) => (folderId) => {
      return state.decks.filter(deck => deck.folder_id === folderId)
    },
    
    getCardsByDeck: (state) => (deckId) => {
      return state.cards.filter(card => card.deck_id === deckId)
    },

    getFolderById: (state) => (id) => {
      return state.folders.find(folder => folder.id === id)
    },

    getDeckById: (state) => (id) => {
      return state.decks.find(deck => deck.id === id)
    }
  },

  actions: {
    async fetchFolders() {
      this.loading = true
      try {
        const response = await fetch(`${API_BASE}/folders`)
        if (!response.ok) throw new Error('Failed to fetch folders')
        this.folders = await response.json()
      } catch (error) {
        this.error = error.message
        console.error('Error fetching folders:', error)
      } finally {
        this.loading = false
      }
    },

    async fetchDecks(folderId = null) {
      this.loading = true
      try {
        const url = folderId ? `${API_BASE}/decks?folder_id=${folderId}` : `${API_BASE}/decks`
        const response = await fetch(url)
        if (!response.ok) throw new Error('Failed to fetch decks')
        this.decks = await response.json()
      } catch (error) {
        this.error = error.message
        console.error('Error fetching decks:', error)
      } finally {
        this.loading = false
      }
    },

    async fetchCards(deckId) {
      this.loading = true
      try {
        const response = await fetch(`${API_BASE}/cards?deck_id=${deckId}`)
        if (!response.ok) throw new Error('Failed to fetch cards')
        this.cards = await response.json()
      } catch (error) {
        this.error = error.message
        console.error('Error fetching cards:', error)
      } finally {
        this.loading = false
      }
    },

    async createFolder(name) {
      try {
        const response = await fetch(`${API_BASE}/folders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name })
        })
        if (!response.ok) throw new Error('Failed to create folder')
        const folder = await response.json()
        this.folders.push(folder)
        return folder
      } catch (error) {
        this.error = error.message
        throw error
      }
    },

    async createDeck(deckData) {
      try {
        const response = await fetch(`${API_BASE}/decks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(deckData)
        })
        if (!response.ok) throw new Error('Failed to create deck')
        const deck = await response.json()
        this.decks.push(deck)
        return deck
      } catch (error) {
        this.error = error.message
        throw error
      }
    },

    async createCard(cardData) {
      try {
        const response = await fetch(`${API_BASE}/cards`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cardData)
        })
        if (!response.ok) throw new Error('Failed to create card')
        const card = await response.json()
        this.cards.push(card)
        
        // Update deck card count
        const deck = this.decks.find(d => d.id === card.deck_id)
        if (deck) deck.card_count = (deck.card_count || 0) + 1
        
        return card
      } catch (error) {
        this.error = error.message
        throw error
      }
    },

    async updateCard(cardId, updates) {
      try {
        const response = await fetch(`${API_BASE}/cards/${cardId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates)
        })
        if (!response.ok) throw new Error('Failed to update card')
        const updatedCard = await response.json()
        
        const index = this.cards.findIndex(card => card.id === cardId)
        if (index !== -1) {
          this.cards[index] = updatedCard
        }
        
        return updatedCard
      } catch (error) {
        this.error = error.message
        throw error
      }
    },

    async deleteCard(cardId) {
      try {
        const response = await fetch(`${API_BASE}/cards/${cardId}`, {
          method: 'DELETE'
        })
        if (!response.ok) throw new Error('Failed to delete card')
        
        const cardIndex = this.cards.findIndex(card => card.id === cardId)
        if (cardIndex !== -1) {
          const card = this.cards[cardIndex]
          this.cards.splice(cardIndex, 1)
          
          // Update deck card count
          const deck = this.decks.find(d => d.id === card.deck_id)
          if (deck) deck.card_count = Math.max((deck.card_count || 1) - 1, 0)
        }
      } catch (error) {
        this.error = error.message
        throw error
      }
    },

    async deleteDeck(deckId) {
      try {
        const response = await fetch(`${API_BASE}/decks/${deckId}`, {
          method: 'DELETE'
        })
        if (!response.ok) throw new Error('Failed to delete deck')
        
        this.decks = this.decks.filter(deck => deck.id !== deckId)
        this.cards = this.cards.filter(card => card.deck_id !== deckId)
      } catch (error) {
        this.error = error.message
        throw error
      }
    },

    async searchContent(query) {
      try {
        const response = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`)
        if (!response.ok) throw new Error('Failed to search')
        return await response.json()
      } catch (error) {
        this.error = error.message
        throw error
      }
    },

    clearError() {
      this.error = null
    }
  }
})
