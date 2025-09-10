require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: 'simulated',
      blockchain: 'simulated',
      ipfs: 'simulated'
    }
  });
});

// In-memory storage for batches (in production, this would be a database)
let batches = [
  {
    id: 1,
    batchId: 1001,
    cropType: 'Tomatoes',
    variety: 'Cherry',
    quantity: 50,
    unit: 'kg',
    priceWei: '1000000000000000000', // 1 ETH
    state: 'Listed',
    farmName: 'Green Valley Farm',
    farmerName: 'John Doe',
    farmerAddress: '0x1234567890123456789012345678901234567890',
    harvestDate: '2024-09-01',
    qualityScore: 85,
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    batchId: 1002,
    cropType: 'Lettuce',
    variety: 'Romaine',
    quantity: 25,
    unit: 'kg',
    priceWei: '500000000000000000', // 0.5 ETH
    state: 'Listed',
    farmName: 'Sunny Acres',
    farmerName: 'Jane Smith',
    farmerAddress: '0x2345678901234567890123456789012345678901',
    harvestDate: '2024-09-02',
    qualityScore: 92,
    createdAt: new Date().toISOString()
  }
];

let nextBatchId = 1003;

// In-memory storage for incentives and sustainability data
let farmers = [
  {
    id: 1,
    walletAddress: '0x1234567890123456789012345678901234567890',
    name: 'John Doe',
    farmName: 'Green Valley Farm',
    location: 'California, USA',
    sustainabilityScore: 85,
    totalTokens: 1250,
    certifications: ['Organic', 'Fair Trade'],
    practices: ['No-till farming', 'Cover crops', 'Water conservation'],
    carbonFootprint: 2.3, // tons CO2 per acre
    verifiedDataPoints: 45,
    lastUpdated: new Date().toISOString()
  },
  {
    id: 2,
    walletAddress: '0x2345678901234567890123456789012345678901',
    name: 'Jane Smith',
    farmName: 'Sunny Acres',
    location: 'Texas, USA',
    sustainabilityScore: 92,
    totalTokens: 2100,
    certifications: ['USDA Organic', 'Regenerative Agriculture'],
    practices: ['Crop rotation', 'Composting', 'Renewable energy'],
    carbonFootprint: 1.8,
    verifiedDataPoints: 67,
    lastUpdated: new Date().toISOString()
  }
];

let incentives = [
  {
    id: 1,
    name: 'Organic Certification',
    description: 'Reward for maintaining organic farming practices',
    tokenReward: 500,
    requirements: ['No synthetic pesticides', 'Soil health monitoring', 'Biodiversity preservation'],
    category: 'certification',
    isActive: true
  },
  {
    id: 2,
    name: 'Water Conservation',
    description: 'Incentive for implementing water-saving techniques',
    tokenReward: 300,
    requirements: ['Drip irrigation', 'Rainwater harvesting', 'Water usage tracking'],
    category: 'environmental',
    isActive: true
  },
  {
    id: 3,
    name: 'Carbon Reduction',
    description: 'Reward for reducing carbon footprint',
    tokenReward: 400,
    requirements: ['Renewable energy', 'Electric vehicles', 'Carbon sequestration'],
    category: 'climate',
    isActive: true
  },
  {
    id: 4,
    name: 'Data Verification',
    description: 'Bonus for providing verified farm data',
    tokenReward: 50,
    requirements: ['AI analysis completion', 'Quality score > 80', 'Provenance tracking'],
    category: 'data',
    isActive: true
  },
  {
    id: 5,
    name: 'Biodiversity Protection',
    description: 'Reward for protecting and enhancing biodiversity',
    tokenReward: 350,
    requirements: ['Wildlife corridors', 'Native species planting', 'Habitat preservation'],
    category: 'biodiversity',
    isActive: true
  }
];

let farmerAchievements = [
  {
    id: 1,
    farmerId: 1,
    incentiveId: 1,
    completedAt: '2024-08-15T10:00:00Z',
    tokensEarned: 500,
    status: 'completed'
  },
  {
    id: 2,
    farmerId: 1,
    incentiveId: 4,
    completedAt: '2024-09-01T14:30:00Z',
    tokensEarned: 50,
    status: 'completed'
  },
  {
    id: 3,
    farmerId: 2,
    incentiveId: 1,
    completedAt: '2024-07-20T09:15:00Z',
    tokensEarned: 500,
    status: 'completed'
  },
  {
    id: 4,
    farmerId: 2,
    incentiveId: 2,
    completedAt: '2024-08-10T16:45:00Z',
    tokensEarned: 300,
    status: 'completed'
  }
];

// Mock API endpoints
app.get('/api/marketplace/batches', (req, res) => {
  const { cropType, minQuality } = req.query;
  
  let filteredBatches = [...batches];
  
  // Apply filters
  if (cropType) {
    filteredBatches = filteredBatches.filter(batch => 
      batch.cropType.toLowerCase() === cropType.toLowerCase()
    );
  }
  
  if (minQuality) {
    filteredBatches = filteredBatches.filter(batch => 
      batch.qualityScore >= parseInt(minQuality)
    );
  }
  
  res.json({
    success: true,
    data: filteredBatches
  });
});

// Create new batch
app.post('/api/marketplace/batches', (req, res) => {
  try {
    const {
      cropType,
      variety,
      quantity,
      unit,
      priceWei,
      harvestDate,
      qualityScore,
      farmName,
      farmerName,
      images,
      metadata
    } = req.body;
    
    const farmerAddress = req.headers['x-wallet-address'];
    
    if (!farmerAddress) {
      return res.status(400).json({
        success: false,
        error: 'Wallet address required'
      });
    }
    
    if (!cropType || !quantity || !priceWei || !harvestDate) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: cropType, quantity, priceWei, harvestDate'
      });
    }
    
    const newBatch = {
      id: batches.length + 1,
      batchId: nextBatchId++,
      cropType,
      variety: variety || '',
      quantity: parseFloat(quantity),
      unit: unit || 'kg',
      priceWei: priceWei.toString(),
      state: 'Listed',
      farmName: farmName || 'Unknown Farm',
      farmerName: farmerName || 'Unknown Farmer',
      farmerAddress,
      harvestDate,
      qualityScore: qualityScore || 0,
      images: images || [],
      metadata: metadata || {},
      createdAt: new Date().toISOString()
    };
    
    batches.push(newBatch);
    
    res.json({
      success: true,
      data: newBatch
    });
  } catch (error) {
    console.error('Create batch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create batch'
    });
  }
});

// Get specific batch
app.get('/api/marketplace/batches/:batchId', (req, res) => {
  const { batchId } = req.params;
  const batch = batches.find(b => b.batchId === parseInt(batchId));
  
  if (!batch) {
    return res.status(404).json({
      success: false,
      error: 'Batch not found'
    });
  }
  
  res.json({
    success: true,
    data: batch
  });
});

// Sustainable Incentives API endpoints

// Get farmer profile and sustainability data
app.get('/api/incentives/farmer/:walletAddress', (req, res) => {
  try {
    const { walletAddress } = req.params;
    const farmer = farmers.find(f => f.walletAddress === walletAddress);
    
    if (!farmer) {
      return res.status(404).json({
        success: false,
        error: 'Farmer not found'
      });
    }
    
    // Get farmer's achievements
    const achievements = farmerAchievements.filter(a => a.farmerId === farmer.id);
    
    // Calculate sustainability metrics
    const sustainabilityMetrics = {
      overallScore: farmer.sustainabilityScore,
      carbonFootprint: farmer.carbonFootprint,
      verifiedDataPoints: farmer.verifiedDataPoints,
      totalTokens: farmer.totalTokens,
      certifications: farmer.certifications,
      practices: farmer.practices,
      achievements: achievements.map(a => ({
        incentiveId: a.incentiveId,
        completedAt: a.completedAt,
        tokensEarned: a.tokensEarned,
        status: a.status
      }))
    };
    
    res.json({
      success: true,
      data: {
        farmer: {
          id: farmer.id,
          name: farmer.name,
          farmName: farmer.farmName,
          location: farmer.location,
          walletAddress: farmer.walletAddress
        },
        sustainability: sustainabilityMetrics
      }
    });
  } catch (error) {
    console.error('Get farmer profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch farmer profile'
    });
  }
});

// Get sustainability leaderboard (must be before /api/incentives/:incentiveId)
app.get('/api/incentives/leaderboard', (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const leaderboard = farmers
      .map(farmer => ({
        id: farmer.id,
        name: farmer.name,
        farmName: farmer.farmName,
        location: farmer.location,
        sustainabilityScore: farmer.sustainabilityScore,
        totalTokens: farmer.totalTokens,
        certifications: farmer.certifications.length,
        carbonFootprint: farmer.carbonFootprint
      }))
      .sort((a, b) => b.sustainabilityScore - a.sustainabilityScore)
      .slice(0, parseInt(limit));
    
    res.json({
      success: true,
      data: leaderboard
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch leaderboard'
    });
  }
});

// Get all available incentives
app.get('/api/incentives', (req, res) => {
  try {
    const { category } = req.query;
    
    let filteredIncentives = incentives.filter(i => i.isActive);
    
    if (category) {
      filteredIncentives = filteredIncentives.filter(i => i.category === category);
    }
    
    res.json({
      success: true,
      data: filteredIncentives
    });
  } catch (error) {
    console.error('Get incentives error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch incentives'
    });
  }
});

// Get specific incentive details
app.get('/api/incentives/:incentiveId', (req, res) => {
  try {
    const { incentiveId } = req.params;
    const incentive = incentives.find(i => i.id === parseInt(incentiveId));
    
    if (!incentive) {
      return res.status(404).json({
        success: false,
        error: 'Incentive not found'
      });
    }
    
    res.json({
      success: true,
      data: incentive
    });
  } catch (error) {
    console.error('Get incentive error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch incentive'
    });
  }
});

// Claim incentive reward
app.post('/api/incentives/:incentiveId/claim', (req, res) => {
  try {
    const { incentiveId } = req.params;
    const farmerAddress = req.headers['x-wallet-address'];
    
    if (!farmerAddress) {
      return res.status(400).json({
        success: false,
        error: 'Wallet address required'
      });
    }
    
    const farmer = farmers.find(f => f.walletAddress === farmerAddress);
    if (!farmer) {
      return res.status(404).json({
        success: false,
        error: 'Farmer not found'
      });
    }
    
    const incentive = incentives.find(i => i.id === parseInt(incentiveId));
    if (!incentive || !incentive.isActive) {
      return res.status(404).json({
        success: false,
        error: 'Incentive not found or inactive'
      });
    }
    
    // Check if already claimed
    const existingAchievement = farmerAchievements.find(
      a => a.farmerId === farmer.id && a.incentiveId === parseInt(incentiveId)
    );
    
    if (existingAchievement) {
      return res.status(400).json({
        success: false,
        error: 'Incentive already claimed'
      });
    }
    
    // Create new achievement
    const newAchievement = {
      id: farmerAchievements.length + 1,
      farmerId: farmer.id,
      incentiveId: parseInt(incentiveId),
      completedAt: new Date().toISOString(),
      tokensEarned: incentive.tokenReward,
      status: 'completed'
    };
    
    farmerAchievements.push(newAchievement);
    
    // Update farmer's total tokens
    farmer.totalTokens += incentive.tokenReward;
    farmer.lastUpdated = new Date().toISOString();
    
    res.json({
      success: true,
      data: {
        achievement: newAchievement,
        newTotalTokens: farmer.totalTokens
      }
    });
  } catch (error) {
    console.error('Claim incentive error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to claim incentive'
    });
  }
});


// Update farmer sustainability data
app.post('/api/incentives/farmer/:walletAddress/update', (req, res) => {
  try {
    const { walletAddress } = req.params;
    const { 
      sustainabilityScore, 
      carbonFootprint, 
      certifications, 
      practices,
      verifiedDataPoints 
    } = req.body;
    
    const farmer = farmers.find(f => f.walletAddress === walletAddress);
    if (!farmer) {
      return res.status(404).json({
        success: false,
        error: 'Farmer not found'
      });
    }
    
    // Update farmer data
    if (sustainabilityScore !== undefined) farmer.sustainabilityScore = sustainabilityScore;
    if (carbonFootprint !== undefined) farmer.carbonFootprint = carbonFootprint;
    if (certifications !== undefined) farmer.certifications = certifications;
    if (practices !== undefined) farmer.practices = practices;
    if (verifiedDataPoints !== undefined) farmer.verifiedDataPoints = verifiedDataPoints;
    
    farmer.lastUpdated = new Date().toISOString();
    
    res.json({
      success: true,
      data: {
        farmer: {
          id: farmer.id,
          name: farmer.name,
          farmName: farmer.farmName,
          sustainabilityScore: farmer.sustainabilityScore,
          totalTokens: farmer.totalTokens,
          carbonFootprint: farmer.carbonFootprint,
          certifications: farmer.certifications,
          practices: farmer.practices,
          verifiedDataPoints: farmer.verifiedDataPoints
        }
      }
    });
  } catch (error) {
    console.error('Update farmer data error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update farmer data'
    });
  }
});

app.get('/api/provenance/batches/:batchId', (req, res) => {
  const { batchId } = req.params;
  res.json({
    success: true,
    data: {
      batchId: parseInt(batchId),
      batchInfo: {
        cropType: 'Tomatoes',
        variety: 'Cherry',
        harvestDate: '2024-09-01',
        qualityScore: 85,
        dataVerified: true,
        quantity: 50,
        unit: 'kg',
        state: 'Listed',
        aiAnalysis: {
          disease: 'None detected',
          confidence: 0.95,
          recommendations: ['Continue current practices', 'Monitor for pests']
        }
      },
      farmInfo: {
        name: 'Green Valley Farm',
        location: 'California, USA',
        farmer: 'John Doe',
        farmerLocation: 'California, USA',
        isVerified: true
      },
      provenanceNotes: [
        {
          cid: 'QmSample1',
          type: 'harvest',
          description: 'Harvested and recorded',
          timestamp: '2024-09-01T10:00:00Z'
        }
      ],
      blockchainEvents: []
    }
  });
});

// Enhanced AI Analysis endpoint with crop-specific disease detection
app.post('/api/ai/analyze', (req, res) => {
  try {
    // Handle both JSON and form-data requests
    let cropType = req.body.cropType;
    let fileName = req.body.fileName;
    
    console.log('Request body:', req.body);
    console.log('Received cropType:', cropType);
    console.log('Received fileName:', fileName);
    
    // If no cropType provided, try to detect from filename
    if (!cropType && fileName) {
      cropType = detectCropFromImage(fileName);
      console.log('Detected crop from filename:', cropType);
    }
    
    // If still no cropType, use 'unknown'
    if (!cropType) {
      cropType = 'unknown';
    }
    
    console.log('Final cropType:', cropType);
    
    // Get crop-specific disease analysis
    const analysis = analyzeCropDisease(cropType, null, fileName);
    
    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('AI analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze image'
    });
  }
});

// Simulate crop detection from image filename or content
function detectCropFromImage(fileName) {
  if (!fileName) return 'unknown';
  
  const fileName_lower = fileName.toLowerCase();
  
  if (fileName_lower.includes('tomato') || fileName_lower.includes('tomatoe')) return 'tomato';
  if (fileName_lower.includes('carrot')) return 'carrot';
  if (fileName_lower.includes('lettuce') || fileName_lower.includes('lettuce')) return 'lettuce';
  if (fileName_lower.includes('potato') || fileName_lower.includes('potatoe')) return 'potato';
  if (fileName_lower.includes('pepper') || fileName_lower.includes('bell')) return 'pepper';
  if (fileName_lower.includes('cucumber') || fileName_lower.includes('cuke')) return 'cucumber';
  if (fileName_lower.includes('onion')) return 'onion';
  if (fileName_lower.includes('corn') || fileName_lower.includes('maize')) return 'corn';
  if (fileName_lower.includes('wheat')) return 'wheat';
  if (fileName_lower.includes('rice')) return 'rice';
  
  return 'unknown';
}

// Comprehensive crop disease analysis
function analyzeCropDisease(cropType, imageData, fileName) {
  const cropDiseases = {
    tomato: {
      diseases: [
        {
          name: 'Early Blight',
          description: 'Dark spots with concentric rings on leaves and stems',
          confidence: 0.85,
          severity: 'moderate',
          treatment: 'Remove affected leaves, apply copper fungicide, improve air circulation'
        },
        {
          name: 'Late Blight',
          description: 'Water-soaked lesions that turn brown and papery',
          confidence: 0.78,
          severity: 'high',
          treatment: 'Apply fungicide immediately, remove infected plants, avoid overhead watering'
        },
        {
          name: 'Bacterial Spot',
          description: 'Small dark spots with yellow halos on leaves and fruit',
          confidence: 0.72,
          severity: 'moderate',
          treatment: 'Copper-based bactericide, remove infected plant parts, improve drainage'
        },
        {
          name: 'Blossom End Rot',
          description: 'Dark, sunken area at the bottom of the fruit',
          confidence: 0.88,
          severity: 'moderate',
          treatment: 'Maintain consistent soil moisture, add calcium, avoid over-fertilizing'
        }
      ],
      healthy: {
        description: 'Healthy tomato plant with no visible disease symptoms',
        confidence: 0.92
      }
    },
    carrot: {
      diseases: [
        {
          name: 'Carrot Rust Fly',
          description: 'Rusty tunnels in roots, yellowing leaves',
          confidence: 0.81,
          severity: 'high',
          treatment: 'Use floating row covers, rotate crops, apply beneficial nematodes'
        },
        {
          name: 'Alternaria Leaf Blight',
          description: 'Dark brown spots on leaves with yellow margins',
          confidence: 0.76,
          severity: 'moderate',
          treatment: 'Apply fungicide, improve air circulation, remove infected leaves'
        },
        {
          name: 'Sclerotinia Rot',
          description: 'White cottony growth on roots, soft rot',
          confidence: 0.83,
          severity: 'high',
          treatment: 'Improve drainage, rotate crops, apply fungicide to soil'
        },
        {
          name: 'Cavity Spot',
          description: 'Small, sunken lesions on carrot surface',
          confidence: 0.79,
          severity: 'moderate',
          treatment: 'Maintain consistent soil moisture, avoid over-fertilizing'
        }
      ],
      healthy: {
        description: 'Healthy carrot with smooth skin and vibrant green tops',
        confidence: 0.89
      }
    },
    lettuce: {
      diseases: [
        {
          name: 'Downy Mildew',
          description: 'Yellow spots on upper leaves, white downy growth underneath',
          confidence: 0.87,
          severity: 'high',
          treatment: 'Apply fungicide, improve air circulation, avoid overhead watering'
        },
        {
          name: 'Bacterial Leaf Spot',
          description: 'Small, dark spots with yellow halos',
          confidence: 0.74,
          severity: 'moderate',
          treatment: 'Remove infected leaves, improve air circulation, avoid wetting leaves'
        },
        {
          name: 'Sclerotinia Drop',
          description: 'White cottony growth at base, wilting leaves',
          confidence: 0.82,
          severity: 'high',
          treatment: 'Remove infected plants, improve drainage, apply fungicide'
        }
      ],
      healthy: {
        description: 'Healthy lettuce with crisp, green leaves',
        confidence: 0.91
      }
    },
    potato: {
      diseases: [
        {
          name: 'Late Blight',
          description: 'Dark, water-soaked lesions on leaves and stems',
          confidence: 0.86,
          severity: 'high',
          treatment: 'Apply fungicide immediately, remove infected plants, improve air circulation'
        },
        {
          name: 'Early Blight',
          description: 'Dark spots with concentric rings on leaves',
          confidence: 0.79,
          severity: 'moderate',
          treatment: 'Apply copper fungicide, remove affected leaves, rotate crops'
        },
        {
          name: 'Common Scab',
          description: 'Rough, corky lesions on potato skin',
          confidence: 0.84,
          severity: 'moderate',
          treatment: 'Maintain soil pH 5.2-5.8, avoid over-fertilizing, rotate crops'
        }
      ],
      healthy: {
        description: 'Healthy potato with smooth skin and vigorous foliage',
        confidence: 0.88
      }
    },
    pepper: {
      diseases: [
        {
          name: 'Anthracnose',
          description: 'Circular, sunken lesions on fruit with dark centers',
          confidence: 0.83,
          severity: 'high',
          treatment: 'Remove infected fruit, apply fungicide, improve air circulation'
        },
        {
          name: 'Bacterial Spot',
          description: 'Small, raised spots on leaves and fruit',
          confidence: 0.77,
          severity: 'moderate',
          treatment: 'Copper-based bactericide, remove infected parts, avoid overhead watering'
        },
        {
          name: 'Blossom End Rot',
          description: 'Dark, sunken area at the bottom of the fruit',
          confidence: 0.85,
          severity: 'moderate',
          treatment: 'Maintain consistent soil moisture, add calcium'
        }
      ],
      healthy: {
        description: 'Healthy pepper plant with glossy, firm fruit',
        confidence: 0.90
      }
    }
  };

  // Get crop-specific diseases or default to generic
  const cropData = cropDiseases[cropType] || {
    diseases: [
      {
        name: 'General Plant Disease',
        description: 'Unidentified disease symptoms detected',
        confidence: 0.65,
        severity: 'unknown',
        treatment: 'Consult with agricultural expert for proper diagnosis'
      }
    ],
    healthy: {
      description: 'Plant appears healthy with no obvious disease symptoms',
      confidence: 0.75
    }
  };

  // Simulate analysis based on image characteristics
  const analysisResult = simulateImageAnalysis(cropData, fileName);
  
  return {
    cropType: cropType || 'unknown',
    detectedCrop: cropType || detectCropFromImage(fileName),
    disease: analysisResult.disease,
    confidence: analysisResult.confidence,
    severity: analysisResult.severity,
    description: analysisResult.description,
    treatment: analysisResult.treatment,
    recommendations: analysisResult.recommendations,
    analysis: {
      healthy: analysisResult.healthy,
      diseased: analysisResult.diseased,
      pest_damage: analysisResult.pest_damage,
      nutrient_deficiency: analysisResult.nutrient_deficiency || 0.1
    },
    qualityScore: analysisResult.qualityScore,
    timestamp: new Date().toISOString()
  };
}

// Simulate realistic image analysis
function simulateImageAnalysis(cropData, fileName) {
  // Simulate different outcomes based on filename patterns or random selection
  // For demonstration purposes, increase disease probability
  const isHealthy = Math.random() > 0.6; // 40% chance of being healthy (60% chance of disease)
  
  if (isHealthy) {
    return {
      disease: 'None detected',
      confidence: cropData.healthy.confidence,
      severity: 'none',
      description: cropData.healthy.description,
      treatment: 'Continue current practices, monitor regularly',
      recommendations: [
        'Maintain current growing conditions',
        'Monitor for early signs of disease',
        'Ensure proper nutrition and watering',
        'Practice crop rotation'
      ],
      healthy: cropData.healthy.confidence,
      diseased: 1 - cropData.healthy.confidence,
      pest_damage: 0.05,
      qualityScore: Math.floor(85 + Math.random() * 15) // 85-100
    };
  } else {
    // Select a random disease for this crop
    const diseases = cropData.diseases;
    const selectedDisease = diseases[Math.floor(Math.random() * diseases.length)];
    
    return {
      disease: selectedDisease.name,
      confidence: selectedDisease.confidence,
      severity: selectedDisease.severity,
      description: selectedDisease.description,
      treatment: selectedDisease.treatment,
      recommendations: generateRecommendations(selectedDisease),
      healthy: 0.2,
      diseased: selectedDisease.confidence,
      pest_damage: selectedDisease.name.toLowerCase().includes('fly') ? 0.8 : 0.3,
      qualityScore: Math.floor(40 + Math.random() * 40) // 40-80 for diseased
    };
  }
}

// Generate specific recommendations based on disease
function generateRecommendations(disease) {
  const baseRecommendations = [
    'Monitor plants regularly for disease progression',
    'Maintain proper plant spacing for air circulation',
    'Water at soil level to avoid wetting leaves',
    'Remove and dispose of infected plant material'
  ];

  const specificRecommendations = {
    'Early Blight': [
      'Apply copper-based fungicide every 7-10 days',
      'Remove affected leaves immediately',
      'Improve air circulation around plants',
      'Avoid overhead watering'
    ],
    'Late Blight': [
      'Apply fungicide immediately upon detection',
      'Remove and destroy infected plants',
      'Improve drainage and air circulation',
      'Consider resistant varieties for next season'
    ],
    'Bacterial Spot': [
      'Apply copper-based bactericide',
      'Remove infected plant parts',
      'Improve soil drainage',
      'Avoid working with wet plants'
    ],
    'Blossom End Rot': [
      'Maintain consistent soil moisture',
      'Add calcium to soil',
      'Avoid over-fertilizing with nitrogen',
      'Mulch to retain soil moisture'
    ],
    'Carrot Rust Fly': [
      'Use floating row covers',
      'Rotate crops annually',
      'Apply beneficial nematodes',
      'Plant resistant varieties'
    ],
    'Downy Mildew': [
      'Apply fungicide containing copper or chlorothalonil',
      'Improve air circulation',
      'Avoid overhead watering',
      'Remove infected leaves immediately'
    ]
  };

  return specificRecommendations[disease.name] || baseRecommendations;
}

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
app.listen(PORT, () => {
  console.log(`FarmMate backend server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log('Running in simplified mode with mock data');
});
