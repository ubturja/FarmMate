const { Sequelize } = require('sequelize');
const User = require('./models/User');
const Farm = require('./models/Farm');
const ProduceBatch = require('./models/ProduceBatch');

// Database connection
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'farmmate',
  username: process.env.DB_USER || 'farmmate',
  password: process.env.DB_PASSWORD || 'farmmate123',
  logging: false
});

async function seedSampleData() {
  try {
    console.log('🌱 Starting to seed sample data...');
    
    // Initialize models
    const UserModel = User(sequelize);
    const FarmModel = Farm(sequelize);
    const ProduceBatchModel = ProduceBatch(sequelize);
    
    // Define associations
    UserModel.hasMany(FarmModel, { foreignKey: 'userId' });
    FarmModel.belongsTo(UserModel, { foreignKey: 'userId' });
    FarmModel.hasMany(ProduceBatchModel, { foreignKey: 'farmId' });
    ProduceBatchModel.belongsTo(FarmModel, { foreignKey: 'farmId' });
    
    // Sync database
    await sequelize.sync({ force: true });
    console.log('✅ Database synced');
    
    // Create sample users
    const users = await UserModel.bulkCreate([
      {
        id: 1,
        name: 'John Smith',
        email: 'john@greenvalleyfarm.com',
        walletAddress: '0x1234567890123456789012345678901234567890',
        location: 'California, USA',
        isVerified: true,
        reputationScore: 95
      },
      {
        id: 2,
        name: 'Maria Garcia',
        email: 'maria@organicfarms.com',
        walletAddress: '0x2345678901234567890123456789012345678901',
        location: 'Texas, USA',
        isVerified: true,
        reputationScore: 88
      },
      {
        id: 3,
        name: 'Ahmed Hassan',
        email: 'ahmed@desertbloom.com',
        walletAddress: '0x3456789012345678901234567890123456789012',
        location: 'Arizona, USA',
        isVerified: true,
        reputationScore: 92
      }
    ]);
    console.log('✅ Created sample users');
    
    // Create sample farms
    const farms = await FarmModel.bulkCreate([
      {
        id: 1,
        name: 'Green Valley Farm',
        location: 'Napa Valley, California',
        size: 150.5,
        soilType: 'Loamy',
        climate: 'Mediterranean',
        certifications: ['Organic', 'Fair Trade'],
        userId: 1
      },
      {
        id: 2,
        name: 'Organic Dreams Farm',
        location: 'Hill Country, Texas',
        size: 89.2,
        soilType: 'Clay',
        climate: 'Subtropical',
        certifications: ['Organic', 'Non-GMO'],
        userId: 2
      },
      {
        id: 3,
        name: 'Desert Bloom Farm',
        location: 'Phoenix Valley, Arizona',
        size: 200.0,
        soilType: 'Sandy',
        climate: 'Desert',
        certifications: ['Sustainable', 'Water-Efficient'],
        userId: 3
      }
    ]);
    console.log('✅ Created sample farms');
    
    // Create sample produce batches
    const batches = await ProduceBatchModel.bulkCreate([
      {
        id: 1,
        batchId: 1001,
        cropType: 'Tomatoes',
        variety: 'Heirloom Cherry',
        quantity: 500,
        unit: 'kg',
        harvestDate: new Date('2024-09-01'),
        qualityScore: 95,
        dataVerified: true,
        aiAnalysis: {
          disease: 'None detected',
          confidence: 98,
          recommendations: ['Excellent quality', 'Ready for harvest']
        },
        images: [
          {
            url: 'https://example.com/tomato1.jpg',
            ipfsHash: 'QmSampleHash1',
            type: 'harvest'
          }
        ],
        metadataCID: 'QmTomatoMetadata1',
        priceWei: '4500000000000000000', // 4.5 ETH in wei
        state: 'Listed',
        provenanceCIDs: ['QmProvenance1', 'QmProvenance2'],
        farmId: 1,
        createdAt: new Date('2024-09-01T08:00:00Z'),
        updatedAt: new Date('2024-09-01T08:00:00Z')
      },
      {
        id: 2,
        batchId: 1002,
        cropType: 'Lettuce',
        variety: 'Romaine',
        quantity: 300,
        unit: 'kg',
        harvestDate: new Date('2024-09-05'),
        qualityScore: 88,
        dataVerified: true,
        aiAnalysis: {
          disease: 'Minor leaf spot',
          confidence: 85,
          recommendations: ['Monitor closely', 'Apply organic fungicide']
        },
        images: [
          {
            url: 'https://example.com/lettuce1.jpg',
            ipfsHash: 'QmSampleHash2',
            type: 'harvest'
          }
        ],
        metadataCID: 'QmLettuceMetadata1',
        priceWei: '2250000000000000000', // 2.25 ETH in wei
        buyerAddress: '0x9876543210987654321098765432109876543210',
        state: 'Delivered',
        provenanceCIDs: ['QmProvenance3'],
        farmId: 2,
        createdAt: new Date('2024-09-05T10:30:00Z'),
        updatedAt: new Date('2024-09-05T10:30:00Z')
      },
      {
        id: 3,
        batchId: 1003,
        cropType: 'Carrots',
        variety: 'Rainbow',
        quantity: 750,
        unit: 'kg',
        harvestDate: new Date('2024-09-08'),
        qualityScore: 92,
        dataVerified: true,
        aiAnalysis: {
          disease: 'None detected',
          confidence: 96,
          recommendations: ['Excellent quality', 'Perfect for market']
        },
        images: [
          {
            url: 'https://example.com/carrot1.jpg',
            ipfsHash: 'QmSampleHash3',
            type: 'harvest'
          }
        ],
        metadataCID: 'QmCarrotMetadata1',
        priceWei: '3750000000000000000', // 3.75 ETH in wei
        state: 'Listed',
        provenanceCIDs: ['QmProvenance4', 'QmProvenance5'],
        farmId: 3,
        createdAt: new Date('2024-09-08T14:15:00Z'),
        updatedAt: new Date('2024-09-08T14:15:00Z')
      },
      {
        id: 4,
        batchId: 1004,
        cropType: 'Strawberries',
        variety: 'Sweet Charlie',
        quantity: 200,
        unit: 'kg',
        harvestDate: new Date('2024-09-10'),
        qualityScore: 98,
        dataVerified: true,
        aiAnalysis: {
          disease: 'None detected',
          confidence: 99,
          recommendations: ['Premium quality', 'Perfect ripeness']
        },
        images: [
          {
            url: 'https://example.com/strawberry1.jpg',
            ipfsHash: 'QmSampleHash4',
            type: 'harvest'
          }
        ],
        metadataCID: 'QmStrawberryMetadata1',
        priceWei: '8500000000000000000', // 8.5 ETH in wei
        state: 'EscrowFunded',
        provenanceCIDs: ['QmProvenance6'],
        farmId: 1,
        createdAt: new Date('2024-09-10T06:45:00Z'),
        updatedAt: new Date('2024-09-10T06:45:00Z')
      }
    ]);
    console.log('✅ Created sample produce batches');
    
    console.log('🎉 Sample data seeded successfully!');
    console.log(`Created ${users.length} users, ${farms.length} farms, and ${batches.length} produce batches`);
    
  } catch (error) {
    console.error('❌ Error seeding sample data:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the seeding function
seedSampleData();
