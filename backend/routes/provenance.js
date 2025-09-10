const express = require('express');
const router = express.Router();
const blockchainService = require('../services/blockchain');
const ipfsService = require('../services/ipfs');

// Get provenance trail for a batch
router.get('/batches/:batchId', async (req, res) => {
  try {
    const { batchId } = req.params;
    const { ProduceBatch, Farm, User } = req.app.locals.models;
    
    if (!ProduceBatch || !Farm || !User) {
      return res.status(500).json({ success: false, error: 'Models not initialized' });
    }
    
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

    // For now, return mock provenance data since blockchain service might not be working
    const provenanceNotes = batch.provenanceCIDs || [];
    const events = [];

    res.json({
      success: true,
      data: {
        batchId: parseInt(batchId),
        batchInfo: {
          cropType: batch.cropType,
          variety: batch.variety,
          harvestDate: batch.harvestDate,
          qualityScore: batch.qualityScore,
          dataVerified: batch.dataVerified,
          quantity: batch.quantity,
          unit: batch.unit,
          state: batch.state,
          aiAnalysis: batch.aiAnalysis
        },
        farmInfo: batch.Farm ? {
          name: batch.Farm.name,
          location: batch.Farm.location,
          farmer: batch.Farm.User ? batch.Farm.User.name : 'Unknown',
          farmerLocation: batch.Farm.User ? batch.Farm.User.location : 'Unknown',
          isVerified: batch.Farm.User ? batch.Farm.User.isVerified : false
        } : null,
        provenanceNotes: provenanceNotes.map(cid => ({
          cid,
          type: 'harvest',
          description: 'Harvested and recorded',
          timestamp: batch.harvestDate
        })),
        blockchainEvents: events
      }
    });
  } catch (error) {
    console.error('Get provenance error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch provenance data' });
  }
});

// Add provenance note
router.post('/batches/:batchId/notes', async (req, res) => {
  try {
    const { batchId } = req.params;
    const { type, description, location, metadata } = req.body;
    const actorAddress = req.headers['x-wallet-address'];

    if (!actorAddress) {
      return res.status(400).json({ success: false, error: 'Wallet address required' });
    }

    const batch = await ProduceBatch.findOne({
      where: { batchId: parseInt(batchId) }
    });

    if (!batch) {
      return res.status(404).json({ success: false, error: 'Batch not found' });
    }

    // Create provenance note
    const noteData = ipfsService.createProvenanceNote({
      type,
      description,
      location,
      actor: actorAddress,
      metadata
    });

    // Add to IPFS
    const noteCID = await ipfsService.addJSON(noteData);

    // Add to blockchain
    const txHash = await blockchainService.addProvenance(parseInt(batchId), noteCID);

    // Update database
    const currentCIDs = batch.provenanceCIDs || [];
    await batch.update({
      provenanceCIDs: [...currentCIDs, noteCID]
    });

    res.json({
      success: true,
      data: {
        noteCID,
        txHash,
        note: noteData
      }
    });
  } catch (error) {
    console.error('Add provenance note error:', error);
    res.status(500).json({ success: false, error: 'Failed to add provenance note' });
  }
});

// Verify batch authenticity
router.get('/batches/:batchId/verify', async (req, res) => {
  try {
    const { batchId } = req.params;
    
    const batch = await ProduceBatch.findOne({
      where: { batchId: parseInt(batchId) }
    });

    if (!batch) {
      return res.status(404).json({ success: false, error: 'Batch not found' });
    }

    // Get blockchain data
    const blockchainData = await blockchainService.getBatch(parseInt(batchId));
    const provenanceCIDs = await blockchainService.getProvenanceCIDs(parseInt(batchId));

    // Verify data consistency
    const verification = {
      batchExists: true,
      blockchainConsistent: true,
      metadataValid: true,
      provenanceValid: true,
      issues: []
    };

    // Check blockchain consistency
    if (blockchainData.farmer !== batch.farmId) {
      verification.blockchainConsistent = false;
      verification.issues.push('Farmer mismatch between database and blockchain');
    }

    if (blockchainData.priceWei !== batch.priceWei) {
      verification.blockchainConsistent = false;
      verification.issues.push('Price mismatch between database and blockchain');
    }

    // Check metadata validity
    try {
      const metadata = await ipfsService.getJSON(batch.metadataCID);
      if (!metadata.cropType || !metadata.harvestDate) {
        verification.metadataValid = false;
        verification.issues.push('Invalid metadata structure');
      }
    } catch (error) {
      verification.metadataValid = false;
      verification.issues.push('Failed to fetch metadata from IPFS');
    }

    // Check provenance validity
    for (const cid of provenanceCIDs) {
      try {
        await ipfsService.getJSON(cid);
      } catch (error) {
        verification.provenanceValid = false;
        verification.issues.push(`Failed to fetch provenance note ${cid}`);
      }
    }

    const isAuthentic = verification.blockchainConsistent && 
                       verification.metadataValid && 
                       verification.provenanceValid;

    res.json({
      success: true,
      data: {
        batchId: parseInt(batchId),
        isAuthentic,
        verification,
        blockchainData,
        provenanceCount: provenanceCIDs.length
      }
    });
  } catch (error) {
    console.error('Verify batch error:', error);
    res.status(500).json({ success: false, error: 'Failed to verify batch' });
  }
});

// Get QR code data for batch
router.get('/batches/:batchId/qr', async (req, res) => {
  try {
    const { batchId } = req.params;
    
    const batch = await ProduceBatch.findOne({
      where: { batchId: parseInt(batchId) },
      include: [
        {
          model: require('../models').Farm,
          include: [{ 
            model: require('../models').User, 
            attributes: ['name', 'location', 'isVerified'] 
          }]
        }
      ]
    });

    if (!batch) {
      return res.status(404).json({ success: false, error: 'Batch not found' });
    }

    // Create QR code data
    const qrData = {
      batchId: parseInt(batchId),
      cropType: batch.cropType,
      variety: batch.variety,
      harvestDate: batch.harvestDate,
      qualityScore: batch.qualityScore,
      dataVerified: batch.dataVerified,
      farmer: batch.Farm.User.name,
      farmLocation: batch.Farm.location,
      isVerified: batch.Farm.User.isVerified,
      blockchainAddress: process.env.CONTRACT_ADDRESS,
      verificationUrl: `${req.protocol}://${req.get('host')}/api/provenance/batches/${batchId}/verify`
    };

    res.json({
      success: true,
      data: qrData
    });
  } catch (error) {
    console.error('Get QR data error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate QR data' });
  }
});

// Search batches by QR data
router.post('/search', async (req, res) => {
  try {
    const { batchId, qrData } = req.body;
    
    let searchBatchId = batchId;
    
    // If QR data provided, extract batch ID
    if (qrData && qrData.batchId) {
      searchBatchId = qrData.batchId;
    }

    if (!searchBatchId) {
      return res.status(400).json({ success: false, error: 'Batch ID or QR data required' });
    }

    const batch = await ProduceBatch.findOne({
      where: { batchId: parseInt(searchBatchId) },
      include: [
        {
          model: require('../models').Farm,
          include: [{ 
            model: require('../models').User, 
            attributes: ['name', 'location', 'isVerified'] 
          }]
        }
      ]
    });

    if (!batch) {
      return res.status(404).json({ success: false, error: 'Batch not found' });
    }

    // Get blockchain data
    const blockchainData = await blockchainService.getBatch(parseInt(searchBatchId));
    const provenanceCIDs = await blockchainService.getProvenanceCIDs(parseInt(searchBatchId));

    res.json({
      success: true,
      data: {
        batch: batch.toJSON(),
        blockchain: blockchainData,
        provenanceCount: provenanceCIDs.length
      }
    });
  } catch (error) {
    console.error('Search batch error:', error);
    res.status(500).json({ success: false, error: 'Failed to search batch' });
  }
});

module.exports = router;
