const { MongoClient } = require('mongodb');

class DatabaseConnection {
  constructor() {
    this.client = null;
    this.db = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      // Use MongoDB Atlas connection string or local MongoDB
      const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
      
      this.client = new MongoClient(uri, {
        serverSelectionTimeoutMS: 5000, // 5 second timeout
        connectTimeoutMS: 5000,
      });
      
      // Test connection with timeout
      await Promise.race([
        this.client.connect(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout')), 5000)
        )
      ]);
      
      this.db = this.client.db(process.env.MONGODB_DATABASE || 'studycards');
      this.isConnected = true;
      
      console.log('✅ Connected to MongoDB successfully');
      
      // Create collections if they don't exist (non-blocking)
      this.initializeCollections().catch(err => 
        console.warn('Warning: Could not initialize collections:', err.message)
      );
      
      return this.db;
    } catch (error) {
      console.error('❌ Failed to connect to MongoDB:', error.message);
      throw error;
    }
  }

  async initializeCollections() {
    try {
      const collections = await this.db.listCollections().toArray();
      const collectionNames = collections.map(col => col.name);

      // Create folders collection if it doesn't exist
      if (!collectionNames.includes('folders')) {
        await this.db.createCollection('folders');
        console.log('📁 Created folders collection');
      }

      // Create decks collection if it doesn't exist
      if (!collectionNames.includes('decks')) {
        await this.db.createCollection('decks');
        console.log('🎴 Created decks collection');
      }

      // Create cards collection if it doesn't exist
      if (!collectionNames.includes('cards')) {
        await this.db.createCollection('cards');
        console.log('📝 Created cards collection');
      }

      // Create indexes for better performance
      await this.createIndexes();
    } catch (error) {
      console.error('Error initializing collections:', error);
    }
  }

  async createIndexes() {
    try {
      // Index for faster deck queries by folder
      await this.db.collection('decks').createIndex({ folder_id: 1 });
      
      // Index for faster card queries by deck
      await this.db.collection('cards').createIndex({ deck_id: 1 });
      
      // Text indexes for search functionality
      await this.db.collection('decks').createIndex({ 
        name: 'text', 
        description: 'text' 
      });
      
      await this.db.collection('cards').createIndex({ 
        front: 'text', 
        back: 'text' 
      });
      
      console.log('📊 Database indexes created successfully');
    } catch (error) {
      console.error('Error creating indexes:', error);
    }
  }

  async seedData() {
    try {
      // Check if data already exists
      const foldersCount = await this.db.collection('folders').countDocuments();
      
      if (foldersCount === 0) {
        console.log('🌱 Seeding initial data...');
        
        // Insert initial folders
        const folders = [
          {
            name: "Programação",
            created_at: new Date()
          },
          {
            name: "Matemática", 
            created_at: new Date()
          }
        ];
        
        const folderResult = await this.db.collection('folders').insertMany(folders);
        const folderIds = Object.values(folderResult.insertedIds);
        
        // Insert initial decks
        const decks = [
          {
            name: "JavaScript Básico",
            description: "Conceitos fundamentais do JavaScript",
            folder_id: folderIds[0],
            color: "#E3F2FD",
            created_at: new Date(),
            card_count: 0
          },
          {
            name: "Álgebra Linear",
            description: "Matrizes e vetores",
            folder_id: folderIds[1],
            color: "#F3E5F5",
            created_at: new Date(),
            card_count: 0
          }
        ];
        
        const deckResult = await this.db.collection('decks').insertMany(decks);
        const deckIds = Object.values(deckResult.insertedIds);
        
        // Insert initial cards
        const cards = [
          {
            deck_id: deckIds[0],
            front: "O que é uma variável em JavaScript?",
            back: "Uma variável é um container que armazena dados. Pode ser declarada com var, let ou const.",
            created_at: new Date(),
            last_studied: null,
            difficulty: 0
          },
          {
            deck_id: deckIds[0],
            front: "Qual a diferença entre let e const?",
            back: "let permite reatribuição de valor, const não permite. Ambas têm escopo de bloco.",
            created_at: new Date(),
            last_studied: null,
            difficulty: 0
          },
          {
            deck_id: deckIds[1],
            front: "O que é uma matriz identidade?",
            back: "É uma matriz quadrada onde os elementos da diagonal principal são 1 e os demais são 0.",
            created_at: new Date(),
            last_studied: null,
            difficulty: 0
          }
        ];
        
        await this.db.collection('cards').insertMany(cards);
        
        // Update card counts
        for (let i = 0; i < deckIds.length; i++) {
          const cardCount = await this.db.collection('cards').countDocuments({ deck_id: deckIds[i] });
          await this.db.collection('decks').updateOne(
            { _id: deckIds[i] },
            { $set: { card_count: cardCount } }
          );
        }
        
        console.log('✅ Initial data seeded successfully');
      }
    } catch (error) {
      console.error('Error seeding data:', error);
    }
  }

  getDatabase() {
    if (!this.isConnected || !this.db) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.db;
  }

  async close() {
    if (this.client) {
      await this.client.close();
      this.isConnected = false;
      console.log('📦 Disconnected from MongoDB');
    }
  }
}

module.exports = new DatabaseConnection();