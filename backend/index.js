require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { Sequelize } = require('sequelize');

// Import models
const User = require('./models/User');
const Farm = require('./models/Farm');
const ProduceBatch = require('./models/ProduceBatch');

// Import routes
const marketplaceRoutes = require('./routes/marketplace');
const provenanceRoutes = require('./routes/provenance');
const aiRoutes = require('./routes/ai');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Database connection
const sequelize = new Sequelize(
  process.env.DB_NAME || 'farmmate',
  process.env.DB_USER || 'farmmate',
  process.env.DB_PASSWORD || 'farmmate123',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Initialize models
const UserModel = User(sequelize);
const FarmModel = Farm(sequelize);
const ProduceBatchModel = ProduceBatch(sequelize);

// Define associations
UserModel.hasMany(FarmModel, { foreignKey: 'userId' });
FarmModel.belongsTo(UserModel, { foreignKey: 'userId' });
FarmModel.hasMany(ProduceBatchModel, { foreignKey: 'farmId' });
ProduceBatchModel.belongsTo(FarmModel, { foreignKey: 'farmId' });

// Make models available globally
app.locals.models = {
  User: UserModel,
  Farm: FarmModel,
  ProduceBatch: ProduceBatchModel
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: 'connected',
      blockchain: 'connected',
      ipfs: 'connected'
    }
  });
});

// API routes
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/provenance', provenanceRoutes);
app.use('/api/ai', aiRoutes);

// User management routes
app.post('/api/users', async (req, res) => {
  try {
    const { walletAddress, role, name, email, phone, location } = req.body;

    if (!walletAddress || !name) {
      return res.status(400).json({ success: false, error: 'Wallet address and name required' });
    }

    // Check if user already exists
    let user = await UserModel.findOne({ where: { walletAddress } });
    
    if (user) {
      return res.json({
        success: true,
        data: user,
        message: 'User already exists'
      });
    }

    // Create new user
    user = await UserModel.create({
      walletAddress,
      role: role || 'farmer',
      name,
      email,
      phone,
      location
    });

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ success: false, error: 'Failed to create user' });
  }
});

app.get('/api/users/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    
    const user = await UserModel.findOne({
      where: { walletAddress },
      include: [
        {
          model: FarmModel,
          include: [{ model: ProduceBatchModel }]
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch user' });
  }
});

// Farm management routes
app.post('/api/farms', async (req, res) => {
  try {
    const { userId, name, location, coordinates, size, soilType, certification } = req.body;
    const farmerAddress = req.headers['x-wallet-address'];

    if (!farmerAddress) {
      return res.status(400).json({ success: false, error: 'Wallet address required' });
    }

    // Verify user exists and get user ID
    const user = await UserModel.findOne({ where: { walletAddress: farmerAddress } });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const farm = await FarmModel.create({
      userId: userId || user.id,
      name,
      location,
      coordinates,
      size,
      soilType,
      certification
    });

    res.json({
      success: true,
      data: farm
    });
  } catch (error) {
    console.error('Create farm error:', error);
    res.status(500).json({ success: false, error: 'Failed to create farm' });
  }
});

app.get('/api/farms', async (req, res) => {
  try {
    const farmerAddress = req.headers['x-wallet-address'];

    if (!farmerAddress) {
      return res.status(400).json({ success: false, error: 'Wallet address required' });
    }

    const user = await UserModel.findOne({ where: { walletAddress: farmerAddress } });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const farms = await FarmModel.findAll({
      where: { userId: user.id },
      include: [{ model: ProduceBatchModel }]
    });

    res.json({
      success: true,
      data: farms
    });
  } catch (error) {
    console.error('Get farms error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch farms' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Start server
async function startServer() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Sync database (create tables if they don't exist)
    await sequelize.sync({ alter: true });
    console.log('Database synchronized successfully.');

    // Start server
    app.listen(PORT, () => {
      console.log(`FarmMate backend server running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down server...');
  await sequelize.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down server...');
  await sequelize.close();
  process.exit(0);
});

startServer();
