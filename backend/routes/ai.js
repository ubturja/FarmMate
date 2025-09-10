const express = require('express');
const router = express.Router();
const multer = require('multer');
const aiService = require('../services/ai');
const ipfsService = require('../services/ipfs');

// Configure multer for image uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Disease detection endpoint
router.post('/detect-disease', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Image file required' });
    }

    const { cropType } = req.body;
    if (!cropType) {
      return res.status(400).json({ success: false, error: 'Crop type required' });
    }

    // Detect disease
    const result = await aiService.detectDisease(req.file.buffer);

    // Store result in IPFS for future reference
    const resultCID = await ipfsService.addJSON({
      ...result,
      cropType,
      timestamp: new Date().toISOString(),
      imageHash: req.file.buffer.toString('base64').substring(0, 32) // Simple hash
    });

    res.json({
      success: true,
      data: {
        ...result,
        resultCID
      }
    });
  } catch (error) {
    console.error('Disease detection error:', error);
    res.status(500).json({ success: false, error: 'Failed to detect disease' });
  }
});

// Quality scoring endpoint
router.post('/score-quality', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Image file required' });
    }

    const { cropType } = req.body;
    if (!cropType) {
      return res.status(400).json({ success: false, error: 'Crop type required' });
    }

    // Score quality
    const result = await aiService.scoreQuality(req.file.buffer, cropType);

    // Store result in IPFS
    const resultCID = await ipfsService.addJSON({
      ...result,
      cropType,
      timestamp: new Date().toISOString(),
      imageHash: req.file.buffer.toString('base64').substring(0, 32)
    });

    res.json({
      success: true,
      data: {
        ...result,
        resultCID
      }
    });
  } catch (error) {
    console.error('Quality scoring error:', error);
    res.status(500).json({ success: false, error: 'Failed to score quality' });
  }
});

// Yield forecasting endpoint
router.post('/forecast-yield', async (req, res) => {
  try {
    const { farmData, historicalData } = req.body;

    if (!farmData) {
      return res.status(400).json({ success: false, error: 'Farm data required' });
    }

    // Generate yield forecast
    const forecast = await aiService.forecastYield(farmData, historicalData);

    // Store forecast in IPFS
    const forecastCID = await ipfsService.addJSON({
      ...forecast,
      farmData,
      historicalData,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      data: {
        ...forecast,
        forecastCID
      }
    });
  } catch (error) {
    console.error('Yield forecast error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate yield forecast' });
  }
});

// Price forecasting endpoint
router.post('/forecast-price', async (req, res) => {
  try {
    const { cropType, marketData } = req.body;

    if (!cropType) {
      return res.status(400).json({ success: false, error: 'Crop type required' });
    }

    // Generate price forecast
    const forecast = await aiService.forecastPrice(cropType, marketData);

    // Store forecast in IPFS
    const forecastCID = await ipfsService.addJSON({
      ...forecast,
      cropType,
      marketData,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      data: {
        ...forecast,
        forecastCID
      }
    });
  } catch (error) {
    console.error('Price forecast error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate price forecast' });
  }
});

// Batch analysis endpoint (combines multiple AI services)
router.post('/analyze-batch', upload.array('images', 10), async (req, res) => {
  try {
    const { cropType, variety, farmData } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, error: 'At least one image required' });
    }

    if (!cropType) {
      return res.status(400).json({ success: false, error: 'Crop type required' });
    }

    const results = {
      images: [],
      overallQuality: 0,
      diseases: [],
      recommendations: [],
      analysisCID: null
    };

    let totalQuality = 0;
    const diseases = new Set();
    const recommendations = new Set();

    // Analyze each image
    for (const file of req.files) {
      const [qualityResult, diseaseResult] = await Promise.all([
        aiService.scoreQuality(file.buffer, cropType),
        aiService.detectDisease(file.buffer)
      ]);

      const imageAnalysis = {
        filename: file.originalname,
        quality: qualityResult.overallScore,
        disease: diseaseResult.disease,
        confidence: diseaseResult.confidence,
        breakdown: qualityResult.breakdown
      };

      results.images.push(imageAnalysis);
      totalQuality += qualityResult.overallScore;

      if (diseaseResult.disease !== 'Healthy') {
        diseases.add(diseaseResult.disease);
      }

      diseaseResult.recommendations.forEach(rec => recommendations.add(rec));
    }

    // Calculate overall quality
    results.overallQuality = Math.round(totalQuality / req.files.length);
    results.diseases = Array.from(diseases);
    results.recommendations = Array.from(recommendations);

    // Generate yield forecast if farm data provided
    if (farmData) {
      const yieldForecast = await aiService.forecastYield(farmData);
      results.yieldForecast = yieldForecast;
    }

    // Store complete analysis in IPFS
    const analysisCID = await ipfsService.addJSON({
      ...results,
      cropType,
      variety,
      farmData,
      timestamp: new Date().toISOString()
    });

    results.analysisCID = analysisCID;

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Batch analysis error:', error);
    res.status(500).json({ success: false, error: 'Failed to analyze batch' });
  }
});

// Federated learning update endpoint
router.post('/federated-update', async (req, res) => {
  try {
    const { modelUpdate, farmId, dataHash } = req.body;

    if (!modelUpdate) {
      return res.status(400).json({ success: false, error: 'Model update required' });
    }

    // Process federated learning update
    const result = await aiService.federatedTrainingUpdate({
      modelUpdate,
      farmId,
      dataHash,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Federated learning error:', error);
    res.status(500).json({ success: false, error: 'Failed to process federated learning update' });
  }
});

// Get AI model status
router.get('/status', async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        services: {
          diseaseDetection: 'available',
          qualityScoring: 'available',
          yieldForecasting: 'available',
          priceForecasting: 'available',
          federatedLearning: 'available'
        },
        models: {
          leafDisease: 'mobilenet-v1',
          yieldForecast: 'lstm-v1',
          priceForecast: 'linear-regression-v1'
        },
        version: '1.0.0',
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('AI status error:', error);
    res.status(500).json({ success: false, error: 'Failed to get AI status' });
  }
});

module.exports = router;
