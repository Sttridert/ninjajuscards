const { ObjectId } = require('mongodb');

class DatabaseModels {
  constructor(db) {
    this.db = db;
  }

  // Folders Model
  async getFolders() {
    try {
      const folders = await this.db.collection('folders').find({}).toArray();
      return folders.map(folder => ({
        id: folder._id.toString(),
        name: folder.name,
        created_at: folder.created_at
      }));
    } catch (error) {
      throw new Error(`Error fetching folders: ${error.message}`);
    }
  }

  async createFolder(folderData) {
    try {
      const folder = {
        name: folderData.name,
        created_at: new Date()
      };
      
      const result = await this.db.collection('folders').insertOne(folder);
      
      return {
        id: result.insertedId.toString(),
        name: folder.name,
        created_at: folder.created_at
      };
    } catch (error) {
      throw new Error(`Error creating folder: ${error.message}`);
    }
  }

  async deleteFolder(folderId) {
    try {
      const objectId = new ObjectId(folderId);
      
      // Check if folder has decks
      const deckCount = await this.db.collection('decks').countDocuments({ folder_id: objectId });
      if (deckCount > 0) {
        throw new Error('Cannot delete folder with decks');
      }
      
      const result = await this.db.collection('folders').deleteOne({ _id: objectId });
      return result.deletedCount > 0;
    } catch (error) {
      throw new Error(`Error deleting folder: ${error.message}`);
    }
  }

  // Decks Model
  async getDecks(folderId = null) {
    try {
      const query = folderId ? { folder_id: new ObjectId(folderId) } : {};
      const decks = await this.db.collection('decks').find(query).toArray();
      
      return decks.map(deck => ({
        id: deck._id.toString(),
        name: deck.name,
        description: deck.description,
        folder_id: deck.folder_id.toString(),
        color: deck.color,
        created_at: deck.created_at,
        card_count: deck.card_count || 0
      }));
    } catch (error) {
      throw new Error(`Error fetching decks: ${error.message}`);
    }
  }

  async getDeckById(deckId) {
    try {
      const deck = await this.db.collection('decks').findOne({ _id: new ObjectId(deckId) });
      
      if (!deck) {
        return null;
      }
      
      return {
        id: deck._id.toString(),
        name: deck.name,
        description: deck.description,
        folder_id: deck.folder_id.toString(),
        color: deck.color,
        created_at: deck.created_at,
        card_count: deck.card_count || 0
      };
    } catch (error) {
      throw new Error(`Error fetching deck: ${error.message}`);
    }
  }

  async createDeck(deckData) {
    try {
      const deck = {
        name: deckData.name,
        description: deckData.description || '',
        folder_id: new ObjectId(deckData.folder_id),
        color: deckData.color || '#E3F2FD',
        created_at: new Date(),
        card_count: 0
      };
      
      const result = await this.db.collection('decks').insertOne(deck);
      
      return {
        id: result.insertedId.toString(),
        name: deck.name,
        description: deck.description,
        folder_id: deck.folder_id.toString(),
        color: deck.color,
        created_at: deck.created_at,
        card_count: deck.card_count
      };
    } catch (error) {
      throw new Error(`Error creating deck: ${error.message}`);
    }
  }

  async updateDeck(deckId, updates) {
    try {
      const updateData = {};
      if (updates.name) updateData.name = updates.name;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.color) updateData.color = updates.color;
      
      const result = await this.db.collection('decks').updateOne(
        { _id: new ObjectId(deckId) },
        { $set: updateData }
      );
      
      if (result.matchedCount === 0) {
        return null;
      }
      
      return await this.getDeckById(deckId);
    } catch (error) {
      throw new Error(`Error updating deck: ${error.message}`);
    }
  }

  async deleteDeck(deckId) {
    try {
      const objectId = new ObjectId(deckId);
      
      // Delete all cards in the deck
      await this.db.collection('cards').deleteMany({ deck_id: objectId });
      
      // Delete the deck
      const result = await this.db.collection('decks').deleteOne({ _id: objectId });
      return result.deletedCount > 0;
    } catch (error) {
      throw new Error(`Error deleting deck: ${error.message}`);
    }
  }

  async updateDeckCardCount(deckId) {
    try {
      const objectId = new ObjectId(deckId);
      const cardCount = await this.db.collection('cards').countDocuments({ deck_id: objectId });
      
      await this.db.collection('decks').updateOne(
        { _id: objectId },
        { $set: { card_count: cardCount } }
      );
      
      return cardCount;
    } catch (error) {
      throw new Error(`Error updating deck card count: ${error.message}`);
    }
  }

  // Cards Model
  async getCards(deckId = null) {
    try {
      const query = deckId ? { deck_id: new ObjectId(deckId) } : {};
      const cards = await this.db.collection('cards').find(query).toArray();
      
      return cards.map(card => ({
        id: card._id.toString(),
        deck_id: card.deck_id.toString(),
        front: card.front,
        back: card.back,
        created_at: card.created_at,
        last_studied: card.last_studied,
        difficulty: card.difficulty || 0
      }));
    } catch (error) {
      throw new Error(`Error fetching cards: ${error.message}`);
    }
  }

  async getCardById(cardId) {
    try {
      const card = await this.db.collection('cards').findOne({ _id: new ObjectId(cardId) });
      
      if (!card) {
        return null;
      }
      
      return {
        id: card._id.toString(),
        deck_id: card.deck_id.toString(),
        front: card.front,
        back: card.back,
        created_at: card.created_at,
        last_studied: card.last_studied,
        difficulty: card.difficulty || 0
      };
    } catch (error) {
      throw new Error(`Error fetching card: ${error.message}`);
    }
  }

  async createCard(cardData) {
    try {
      const card = {
        deck_id: new ObjectId(cardData.deck_id),
        front: cardData.front,
        back: cardData.back,
        created_at: new Date(),
        last_studied: null,
        difficulty: 0
      };
      
      const result = await this.db.collection('cards').insertOne(card);
      
      // Update deck card count
      await this.updateDeckCardCount(cardData.deck_id);
      
      return {
        id: result.insertedId.toString(),
        deck_id: card.deck_id.toString(),
        front: card.front,
        back: card.back,
        created_at: card.created_at,
        last_studied: card.last_studied,
        difficulty: card.difficulty
      };
    } catch (error) {
      throw new Error(`Error creating card: ${error.message}`);
    }
  }

  async updateCard(cardId, updates) {
    try {
      const updateData = {};
      if (updates.front) updateData.front = updates.front;
      if (updates.back) updateData.back = updates.back;
      if (updates.difficulty !== undefined) {
        updateData.difficulty = updates.difficulty;
        updateData.last_studied = new Date();
      }
      
      const result = await this.db.collection('cards').updateOne(
        { _id: new ObjectId(cardId) },
        { $set: updateData }
      );
      
      if (result.matchedCount === 0) {
        return null;
      }
      
      return await this.getCardById(cardId);
    } catch (error) {
      throw new Error(`Error updating card: ${error.message}`);
    }
  }

  async deleteCard(cardId) {
    try {
      const card = await this.getCardById(cardId);
      if (!card) {
        return false;
      }
      
      const result = await this.db.collection('cards').deleteOne({ _id: new ObjectId(cardId) });
      
      if (result.deletedCount > 0) {
        // Update deck card count
        await this.updateDeckCardCount(card.deck_id);
        return true;
      }
      
      return false;
    } catch (error) {
      throw new Error(`Error deleting card: ${error.message}`);
    }
  }

  // Search functionality
  async searchContent(query) {
    try {
      const searchQuery = { $text: { $search: query } };
      
      const [decks, cards] = await Promise.all([
        this.db.collection('decks').find(searchQuery).toArray(),
        this.db.collection('cards').find(searchQuery).toArray()
      ]);
      
      return {
        decks: decks.map(deck => ({
          id: deck._id.toString(),
          name: deck.name,
          description: deck.description,
          folder_id: deck.folder_id.toString(),
          color: deck.color,
          created_at: deck.created_at,
          card_count: deck.card_count || 0
        })),
        cards: cards.map(card => ({
          id: card._id.toString(),
          deck_id: card.deck_id.toString(),
          front: card.front,
          back: card.back,
          created_at: card.created_at,
          last_studied: card.last_studied,
          difficulty: card.difficulty || 0
        }))
      };
    } catch (error) {
      // Fallback to regex search if text index fails
      const regexQuery = new RegExp(query, 'i');
      
      const [decks, cards] = await Promise.all([
        this.db.collection('decks').find({
          $or: [
            { name: regexQuery },
            { description: regexQuery }
          ]
        }).toArray(),
        this.db.collection('cards').find({
          $or: [
            { front: regexQuery },
            { back: regexQuery }
          ]
        }).toArray()
      ]);
      
      return {
        decks: decks.map(deck => ({
          id: deck._id.toString(),
          name: deck.name,
          description: deck.description,
          folder_id: deck.folder_id.toString(),
          color: deck.color,
          created_at: deck.created_at,
          card_count: deck.card_count || 0
        })),
        cards: cards.map(card => ({
          id: card._id.toString(),
          deck_id: card.deck_id.toString(),
          front: card.front,
          back: card.back,
          created_at: card.created_at,
          last_studied: card.last_studied,
          difficulty: card.difficulty || 0
        }))
      };
    }
  }
}

module.exports = DatabaseModels;