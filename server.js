const express = require('express');
const cors = require('cors');
const path = require('path');
const dbConnection = require('./db/connection');
const DatabaseModels = require('./db/models');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

let db = null;
let models = null;

// Initialize database connection
async function initializeDatabase() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    db = await dbConnection.connect();
    models = new DatabaseModels(db);
    
    // Seed initial data if needed
    await dbConnection.seedData();
    
    console.log('✅ MongoDB connected and initialized');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.log('⚠️  Using in-memory storage as fallback');
    
    // Fallback to in-memory storage if MongoDB is not available
    models = createInMemoryModels();
  }
}

// Create in-memory models as fallback
function createInMemoryModels() {
  const memoryData = {
    folders: [
      { id: '1', name: "Programação", created_at: new Date() },
      { id: '2', name: "Matemática", created_at: new Date() }
    ],
    decks: [
      {
        id: '1', name: "JavaScript Básico", description: "Conceitos fundamentais do JavaScript",
        folder_id: '1', color: "#E3F2FD", created_at: new Date(), card_count: 2
      },
      {
        id: '2', name: "Álgebra Linear", description: "Matrizes e vetores",
        folder_id: '2', color: "#F3E5F5", created_at: new Date(), card_count: 1
      }
    ],
    cards: [
      {
        id: '1', deck_id: '1', front: "O que é uma variável em JavaScript?",
        back: "Uma variável é um container que armazena dados. Pode ser declarada com var, let ou const.",
        created_at: new Date(), last_studied: null, difficulty: 0
      },
      {
        id: '2', deck_id: '1', front: "Qual a diferença entre let e const?",
        back: "let permite reatribuição de valor, const não permite. Ambas têm escopo de bloco.",
        created_at: new Date(), last_studied: null, difficulty: 0
      },
      {
        id: '3', deck_id: '2', front: "O que é uma matriz identidade?",
        back: "É uma matriz quadrada onde os elementos da diagonal principal são 1 e os demais são 0.",
        created_at: new Date(), last_studied: null, difficulty: 0
      }
    ]
  };

  let nextId = 4;

  return {
    async getFolders() { return memoryData.folders; },
    async createFolder(data) {
      const folder = { id: (nextId++).toString(), name: data.name, created_at: new Date() };
      memoryData.folders.push(folder);
      return folder;
    },
    async deleteFolder(id) {
      const index = memoryData.folders.findIndex(f => f.id === id);
      if (index > -1) {
        memoryData.folders.splice(index, 1);
        return true;
      }
      return false;
    },
    async getDecks(folderId) {
      return folderId ? memoryData.decks.filter(d => d.folder_id === folderId) : memoryData.decks;
    },
    async getDeckById(id) {
      return memoryData.decks.find(d => d.id === id) || null;
    },
    async createDeck(data) {
      const deck = {
        id: (nextId++).toString(), name: data.name, description: data.description || '',
        folder_id: data.folder_id, color: data.color || '#E3F2FD',
        created_at: new Date(), card_count: 0
      };
      memoryData.decks.push(deck);
      return deck;
    },
    async updateDeck(id, updates) {
      const deck = memoryData.decks.find(d => d.id === id);
      if (deck) {
        Object.assign(deck, updates);
        return deck;
      }
      return null;
    },
    async deleteDeck(id) {
      memoryData.cards = memoryData.cards.filter(c => c.deck_id !== id);
      const index = memoryData.decks.findIndex(d => d.id === id);
      if (index > -1) {
        memoryData.decks.splice(index, 1);
        return true;
      }
      return false;
    },
    async getCards(deckId) {
      return deckId ? memoryData.cards.filter(c => c.deck_id === deckId) : memoryData.cards;
    },
    async getCardById(id) {
      return memoryData.cards.find(c => c.id === id) || null;
    },
    async createCard(data) {
      const card = {
        id: (nextId++).toString(), deck_id: data.deck_id, front: data.front, back: data.back,
        created_at: new Date(), last_studied: null, difficulty: 0
      };
      memoryData.cards.push(card);
      
      // Update deck card count
      const deck = memoryData.decks.find(d => d.id === data.deck_id);
      if (deck) deck.card_count = memoryData.cards.filter(c => c.deck_id === data.deck_id).length;
      
      return card;
    },
    async updateCard(id, updates) {
      const card = memoryData.cards.find(c => c.id === id);
      if (card) {
        Object.assign(card, updates);
        if (updates.difficulty !== undefined) card.last_studied = new Date();
        return card;
      }
      return null;
    },
    async deleteCard(id) {
      const cardIndex = memoryData.cards.findIndex(c => c.id === id);
      if (cardIndex > -1) {
        const card = memoryData.cards[cardIndex];
        memoryData.cards.splice(cardIndex, 1);
        
        // Update deck card count
        const deck = memoryData.decks.find(d => d.id === card.deck_id);
        if (deck) deck.card_count = memoryData.cards.filter(c => c.deck_id === card.deck_id).length;
        
        return true;
      }
      return false;
    },
    async searchContent(query) {
      const lowerQuery = query.toLowerCase();
      return {
        decks: memoryData.decks.filter(d => 
          d.name.toLowerCase().includes(lowerQuery) || 
          d.description.toLowerCase().includes(lowerQuery)
        ),
        cards: memoryData.cards.filter(c => 
          c.front.toLowerCase().includes(lowerQuery) || 
          c.back.toLowerCase().includes(lowerQuery)
        )
      };
    }
  };
}

// API Routes

// Folders
app.get('/api/folders', async (req, res) => {
  try {
    const folders = await models.getFolders();
    res.json(folders);
  } catch (error) {
    console.error('Error fetching folders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/folders', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    const folder = await models.createFolder({ name });
    res.status(201).json(folder);
  } catch (error) {
    console.error('Error creating folder:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/folders/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const success = await models.deleteFolder(id);
    
    if (success) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'Folder not found' });
    }
  } catch (error) {
    console.error('Error deleting folder:', error);
    if (error.message.includes('Cannot delete folder with decks')) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// Decks
app.get('/api/decks', async (req, res) => {
  try {
    const { folder_id } = req.query;
    const decks = await models.getDecks(folder_id);
    res.json(decks);
  } catch (error) {
    console.error('Error fetching decks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/decks/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const deck = await models.getDeckById(id);
    
    if (!deck) {
      return res.status(404).json({ error: 'Deck not found' });
    }
    
    res.json(deck);
  } catch (error) {
    console.error('Error fetching deck:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/decks', async (req, res) => {
  try {
    const { name, description, folder_id, color } = req.body;
    
    if (!name || !folder_id) {
      return res.status(400).json({ error: 'Name and folder_id are required' });
    }
    
    const deck = await models.createDeck({
      name,
      description: description || '',
      folder_id,
      color: color || '#E3F2FD'
    });
    
    res.status(201).json(deck);
  } catch (error) {
    console.error('Error creating deck:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/decks/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { name, description, color } = req.body;
    
    const deck = await models.updateDeck(id, { name, description, color });
    
    if (!deck) {
      return res.status(404).json({ error: 'Deck not found' });
    }
    
    res.json(deck);
  } catch (error) {
    console.error('Error updating deck:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/decks/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const success = await models.deleteDeck(id);
    
    if (success) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'Deck not found' });
    }
  } catch (error) {
    console.error('Error deleting deck:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Cards
app.get('/api/cards', async (req, res) => {
  try {
    const { deck_id } = req.query;
    const cards = await models.getCards(deck_id);
    res.json(cards);
  } catch (error) {
    console.error('Error fetching cards:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/cards/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const card = await models.getCardById(id);
    
    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }
    
    res.json(card);
  } catch (error) {
    console.error('Error fetching card:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/cards', async (req, res) => {
  try {
    const { deck_id, front, back } = req.body;
    
    if (!deck_id || !front || !back) {
      return res.status(400).json({ error: 'deck_id, front, and back are required' });
    }
    
    const card = await models.createCard({ deck_id, front, back });
    res.status(201).json(card);
  } catch (error) {
    console.error('Error creating card:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/cards/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { front, back, difficulty } = req.body;
    
    const card = await models.updateCard(id, { front, back, difficulty });
    
    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }
    
    res.json(card);
  } catch (error) {
    console.error('Error updating card:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/cards/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const success = await models.deleteCard(id);
    
    if (success) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'Card not found' });
    }
  } catch (error) {
    console.error('Error deleting card:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search
app.get('/api/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.json({ decks: [], cards: [] });
    }
    
    const results = await models.searchContent(q);
    res.json(results);
  } catch (error) {
    console.error('Error searching:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Serve index.html for all other routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Initialize database and start server
async function startServer() {
  // Start server first, then try to connect to database
  app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Study Cards API server running on port ${port}`);
  });
  
  // Initialize database in background
  initializeDatabase().then(() => {
    console.log(`📖 Database: ${db ? 'MongoDB' : 'In-Memory (fallback)'}`);
  }).catch(err => {
    console.log(`📖 Database: In-Memory (fallback) - ${err.message}`);
  });
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🔄 Shutting down gracefully...');
  if (dbConnection.isConnected) {
    await dbConnection.close();
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🔄 Shutting down gracefully...');
  if (dbConnection.isConnected) {
    await dbConnection.close();
  }
  process.exit(0);
});

// Start the server
startServer().catch(error => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});