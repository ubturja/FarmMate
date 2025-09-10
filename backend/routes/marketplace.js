const express = require('express');
const router = express.Router();
const blockchainService = require('../services/blockchain');
const ipfsService = require('../services/ipfs');
const aiService = require('../services/ai');

// Get all listed batches
router.get('/batches', async (req, res) => {
  try {
    const { User, Farm, ProduceBatch } = req.app.locals.models;
    const { page = 1, limit = 10, cropType, minQuality, maxPrice } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {
      state: ['Listed', 'EscrowFunded']
    };

    if (cropType) whereClause.cropType = cropType;
    if (minQuality) whereClause.qualityScore = { [require('sequelize').Op.gte]: minQuality };
    if (maxPrice) whereClause.priceWei = { [require('sequelize').Op.lte]: maxPrice };

    const batches = await ProduceBatch.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Farm,
          include: [{ model: User, attributes: ['name', 'location', 'isVerified'] }]
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        batches: batches.rows,
        total: batches.count,
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get batches error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch batches' });
  }
});

// Get batch details
router.get('/batches/:batchId', async (req, res) => {
  try {
    const { User, Farm, ProduceBatch } = req.app.locals.models;
    const { batchId } = req.params;
    
    const batch = await ProduceBatch.findOne({
      where: { batchId: parseInt(batchId) },
      include: [
        {
          model: Farm,
          include: [{ model: User, attributes: ['name', 'location', 'isVerified'] }]
        }
      ]
    });

    if (!batch) {
      return res.status(404).json({ success: false, error: 'Batch not found' });
    }

    // Get blockchain data
    const blockchainData = await blockchainService.getBatch(parseInt(batchId));
    const provenanceCIDs = await blockchainService.getProvenanceCIDs(parseInt(batchId));

    res.json({
      success: true,
      data: {
        ...batch.toJSON(),
        blockchain: blockchainData,
        provenanceCIDs
      }
    });
  } catch (error) {
    console.error('Get batch error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch batch details' });
  }
});

// Create new batch
router.post('/batches', async (req, res) => {
  try {
    const { User, Farm, ProduceBatch } = req.app.locals.models;
    const { farmId, cropType, variety, quantity, unit, harvestDate, priceWei, images } = req.body;
    const farmerAddress = req.headers['x-wallet-address'];

    if (!farmerAddress) {
      return res.status(400).json({ success: false, error: 'Wallet address required' });
    }

    // Find farmer user
    const farmer = await User.findOne({ where: { walletAddress: farmerAddress } });
    if (!farmer) {
      return res.status(404).json({ success: false, error: 'Farmer not found' });
    }

    // Verify farm ownership
    const farm = await Farm.findOne({ 
      where: { id: farmId, userId: farmer.id } 
    });
    if (!farm) {
      return res.status(403).json({ success: false, error: 'Farm not found or access denied' });
    }

    // Process images and create metadata
    let processedImages = [];
    if (images && images.length > 0) {
      for (const image of images) {
        const aiAnalysis = await aiService.scoreQuality(Buffer.from(image.data, 'base64'), cropType);
        processedImages.push({
          url: image.url,
          ipfsHash: image.ipfsHash,
          type: image.type,
          aiAnalysis
        });
      }
    }

    // Create metadata for IPFS
    const metadata = ipfsService.createBatchMetadata({
      cropType,
      variety,
      quantity,
      unit,
      harvestDate,
      qualityScore: 0,
      dataVerified: false,
      aiAnalysis: processedImages[0]?.aiAnalysis || null,
      images: processedImages,
      farmInfo: {
        name: farm.name,
        location: farm.location,
        farmer: farmer.name
      }
    });

    const metadataCID = await ipfsService.addJSON(metadata);

    // Create batch on blockchain
    const txHash = await blockchainService.createBatch(metadataCID, priceWei);
    
    // Get the batch ID from blockchain (in real implementation, parse from events)
    const batchId = Date.now(); // Mock batch ID

    // Create batch in database
    const batch = await ProduceBatch.create({
      batchId,
      farmId,
      cropType,
      variety,
      quantity,
      unit,
      harvestDate: new Date(harvestDate),
      priceWei,
      metadataCID,
      images: processedImages,
      state: 'Created'
    });

    res.json({
      success: true,
      data: {
        batch: batch.toJSON(),
        txHash,
        metadataCID
      }
    });
  } catch (error) {
    console.error('Create batch error:', error);
    res.status(500).json({ success: false, error: 'Failed to create batch' });
  }
});

// List batch for sale
router.post('/batches/:batchId/list', async (req, res) => {
  try {
    const { User, Farm, ProduceBatch } = req.app.locals.models;
    const { batchId } = req.params;
    const { priceWei } = req.body;
    const farmerAddress = req.headers['x-wallet-address'];

    const batch = await ProduceBatch.findOne({ where: { batchId: parseInt(batchId) } });
    if (!batch) {
      return res.status(404).json({ success: false, error: 'Batch not found' });
    }

    // Verify ownership
    const farm = await Farm.findByPk(batch.farmId);
    const farmer = await User.findByPk(farm.userId);
    if (farmer.walletAddress !== farmerAddress) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    // Update blockchain
    const txHash = await blockchainService.listBatch(parseInt(batchId), priceWei);
    
    // Update database
    await batch.update({ 
      priceWei, 
      state: 'Listed' 
    });

    res.json({
      success: true,
      data: { txHash }
    });
  } catch (error) {
    console.error('List batch error:', error);
    res.status(500).json({ success: false, error: 'Failed to list batch' });
  }
});

// Fund escrow (buyer action)
router.post('/batches/:batchId/fund-escrow', async (req, res) => {
  try {
    const { User, Farm, ProduceBatch } = req.app.locals.models;
    const { batchId } = req.params;
    const { value } = req.body;
    const buyerAddress = req.headers['x-wallet-address'];

    const batch = await ProduceBatch.findOne({ where: { batchId: parseInt(batchId) } });
    if (!batch) {
      return res.status(404).json({ success: false, error: 'Batch not found' });
    }

    if (batch.state !== 'Listed') {
      return res.status(400).json({ success: false, error: 'Batch not available for purchase' });
    }

    if (value !== batch.priceWei) {
      return res.status(400).json({ success: false, error: 'Incorrect payment amount' });
    }

    // Fund escrow on blockchain
    const txHash = await blockchainService.fundEscrow(parseInt(batchId), value);
    
    // Update database
    await batch.update({ 
      buyerAddress,
      state: 'EscrowFunded' 
    });

    res.json({
      success: true,
      data: { txHash }
    });
  } catch (error) {
    console.error('Fund escrow error:', error);
    res.status(500).json({ success: false, error: 'Failed to fund escrow' });
  }
});

// Mark as delivered (farmer action)
router.post('/batches/:batchId/deliver', async (req, res) => {
  try {
    const { User, Farm, ProduceBatch } = req.app.locals.models;
    const { batchId } = req.params;
    const farmerAddress = req.headers['x-wallet-address'];

    const batch = await ProduceBatch.findOne({ where: { batchId: parseInt(batchId) } });
    if (!batch) {
      return res.status(404).json({ success: false, error: 'Batch not found' });
    }

    // Verify ownership
    const farm = await Farm.findByPk(batch.farmId);
    const farmer = await User.findByPk(farm.userId);
    if (farmer.walletAddress !== farmerAddress) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    if (batch.state !== 'EscrowFunded') {
      return res.status(400).json({ success: false, error: 'Invalid state for delivery' });
    }

    // Mark delivered on blockchain
    const txHash = await blockchainService.markDelivered(parseInt(batchId));
    
    // Update database
    await batch.update({ state: 'Delivered' });

    res.json({
      success: true,
      data: { txHash }
    });
  } catch (error) {
    console.error('Mark delivered error:', error);
    res.status(500).json({ success: false, error: 'Failed to mark as delivered' });
  }
});

// Release funds (buyer action)
router.post('/batches/:batchId/release', async (req, res) => {
  try {
    const { User, Farm, ProduceBatch } = req.app.locals.models;
    const { batchId } = req.params;
    const buyerAddress = req.headers['x-wallet-address'];

    const batch = await ProduceBatch.findOne({ where: { batchId: parseInt(batchId) } });
    if (!batch) {
      return res.status(404).json({ success: false, error: 'Batch not found' });
    }

    if (batch.buyerAddress !== buyerAddress) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    if (batch.state !== 'Delivered') {
      return res.status(400).json({ success: false, error: 'Invalid state for release' });
    }

    // Release funds on blockchain
    const txHash = await blockchainService.releaseToFarmer(parseInt(batchId));
    
    // Update database
    await batch.update({ state: 'Released' });

    res.json({
      success: true,
      data: { txHash }
    });
  } catch (error) {
    console.error('Release funds error:', error);
    res.status(500).json({ success: false, error: 'Failed to release funds' });
  }
});

// Refund (buyer or farmer action)
router.post('/batches/:batchId/refund', async (req, res) => {
  try {
    const { User, Farm, ProduceBatch } = req.app.locals.models;
    const { batchId } = req.params;
    const requesterAddress = req.headers['x-wallet-address'];

    const batch = await ProduceBatch.findOne({ where: { batchId: parseInt(batchId) } });
    if (!batch) {
      return res.status(404).json({ success: false, error: 'Batch not found' });
    }

    // Verify requester is buyer or farmer
    const farm = await Farm.findByPk(batch.farmId);
    const farmer = await User.findByPk(farm.userId);
    
    if (requesterAddress !== batch.buyerAddress && requesterAddress !== farmer.walletAddress) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    if (batch.state !== 'EscrowFunded') {
      return res.status(400).json({ success: false, error: 'Invalid state for refund' });
    }

    // Process refund on blockchain
    const txHash = await blockchainService.refundBuyer(parseInt(batchId));
    
    // Update database
    await batch.update({ state: 'Refunded' });

    res.json({
      success: true,
      data: { txHash }
    });
  } catch (error) {
    console.error('Refund error:', error);
    res.status(500).json({ success: false, error: 'Failed to process refund' });
  }
});

module.exports = router;
