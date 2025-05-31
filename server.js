const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 8000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// In-memory storage
let data = {
  folders: [
    {
      id: 1,
      name: "Programming",
      created_at: new Date().toISOString()
    }
  ],
  decks: [
    {
      id: 1,
      name: "JavaScript Basics",
      description: "Fundamental JavaScript concepts",
      folder_id: 1,
      color: "#E3F2FD",
      created_at: new Date().toISOString(),
      card_count: 0
    }
  ],
  cards: []
};

let nextId = {
  folders: 2,
  decks: 2,
  cards: 1
};

// Helper function to update card count
function updateDeckCardCount(deckId) {
  const deck = data.decks.find(d => d.id === deckId);
  if (deck) {
    deck.card_count = data.cards.filter(c => c.deck_id === deckId).length;
  }
}

// API Routes

// Folders
app.get('/api/folders', (req, res) => {
  res.json(data.folders);
});

app.post('/api/folders', (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  
  const folder = {
    id: nextId.folders++,
    name,
    created_at: new Date().toISOString()
  };
  
  data.folders.push(folder);
  res.status(201).json(folder);
});

app.delete('/api/folders/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const folderIndex = data.folders.findIndex(f => f.id === id);
  
  if (folderIndex === -1) {
    return res.status(404).json({ error: 'Folder not found' });
  }
  
  // Check if folder has decks
  const hasDecks = data.decks.some(d => d.folder_id === id);
  if (hasDecks) {
    return res.status(400).json({ error: 'Cannot delete folder with decks' });
  }
  
  data.folders.splice(folderIndex, 1);
  res.status(204).send();
});

// Decks
app.get('/api/decks', (req, res) => {
  const { folder_id } = req.query;
  let decks = data.decks;
  
  if (folder_id) {
    decks = decks.filter(d => d.folder_id === parseInt(folder_id));
  }
  
  res.json(decks);
});

app.get('/api/decks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const deck = data.decks.find(d => d.id === id);
  
  if (!deck) {
    return res.status(404).json({ error: 'Deck not found' });
  }
  
  res.json(deck);
});

app.post('/api/decks', (req, res) => {
  const { name, description, folder_id, color } = req.body;
  
  if (!name || !folder_id) {
    return res.status(400).json({ error: 'Name and folder_id are required' });
  }
  
  const deck = {
    id: nextId.decks++,
    name,
    description: description || '',
    folder_id: parseInt(folder_id),
    color: color || '#E3F2FD',
    created_at: new Date().toISOString(),
    card_count: 0
  };
  
  data.decks.push(deck);
  res.status(201).json(deck);
});

app.put('/api/decks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const deckIndex = data.decks.findIndex(d => d.id === id);
  
  if (deckIndex === -1) {
    return res.status(404).json({ error: 'Deck not found' });
  }
  
  const { name, description, color } = req.body;
  const deck = data.decks[deckIndex];
  
  if (name) deck.name = name;
  if (description !== undefined) deck.description = description;
  if (color) deck.color = color;
  
  res.json(deck);
});

app.delete('/api/decks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const deckIndex = data.decks.findIndex(d => d.id === id);
  
  if (deckIndex === -1) {
    return res.status(404).json({ error: 'Deck not found' });
  }
  
  // Delete all cards in the deck
  data.cards = data.cards.filter(c => c.deck_id !== id);
  data.decks.splice(deckIndex, 1);
  
  res.status(204).send();
});

// Cards
app.get('/api/cards', (req, res) => {
  const { deck_id } = req.query;
  let cards = data.cards;
  
  if (deck_id) {
    cards = cards.filter(c => c.deck_id === parseInt(deck_id));
  }
  
  res.json(cards);
});

app.get('/api/cards/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const card = data.cards.find(c => c.id === id);
  
  if (!card) {
    return res.status(404).json({ error: 'Card not found' });
  }
  
  res.json(card);
});

app.post('/api/cards', (req, res) => {
  const { deck_id, front, back } = req.body;
  
  if (!deck_id || !front || !back) {
    return res.status(400).json({ error: 'deck_id, front, and back are required' });
  }
  
  const card = {
    id: nextId.cards++,
    deck_id: parseInt(deck_id),
    front,
    back,
    created_at: new Date().toISOString(),
    last_studied: null,
    difficulty: 0
  };
  
  data.cards.push(card);
  updateDeckCardCount(card.deck_id);
  res.status(201).json(card);
});

app.put('/api/cards/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const cardIndex = data.cards.findIndex(c => c.id === id);
  
  if (cardIndex === -1) {
    return res.status(404).json({ error: 'Card not found' });
  }
  
  const { front, back, difficulty } = req.body;
  const card = data.cards[cardIndex];
  
  if (front) card.front = front;
  if (back) card.back = back;
  if (difficulty !== undefined) {
    card.difficulty = difficulty;
    card.last_studied = new Date().toISOString();
  }
  
  res.json(card);
});

app.delete('/api/cards/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const cardIndex = data.cards.findIndex(c => c.id === id);
  
  if (cardIndex === -1) {
    return res.status(404).json({ error: 'Card not found' });
  }
  
  const card = data.cards[cardIndex];
  data.cards.splice(cardIndex, 1);
  updateDeckCardCount(card.deck_id);
  
  res.status(204).send();
});

// Search
app.get('/api/search', (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.json({ decks: [], cards: [] });
  }
  
  const query = q.toLowerCase();
  
  const matchingDecks = data.decks.filter(deck => 
    deck.name.toLowerCase().includes(query) ||
    deck.description.toLowerCase().includes(query)
  );
  
  const matchingCards = data.cards.filter(card =>
    card.front.toLowerCase().includes(query) ||
    card.back.toLowerCase().includes(query)
  );
  
  res.json({ decks: matchingDecks, cards: matchingCards });
});

// Serve Vue app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Study Cards API server running on port ${port}`);
});
