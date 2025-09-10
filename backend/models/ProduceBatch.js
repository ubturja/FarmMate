const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ProduceBatch = sequelize.define('ProduceBatch', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    batchId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      unique: true // blockchain batch ID
    },
    farmId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Farms',
        key: 'id'
      }
    },
    cropType: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    variety: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    quantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    unit: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'kg'
    },
    harvestDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    qualityScore: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: { min: 0, max: 100 }
    },
    dataVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    aiAnalysis: {
      type: DataTypes.JSON,
      allowNull: true // {disease: string, confidence: number, recommendations: string[]}
    },
    images: {
      type: DataTypes.JSON,
      allowNull: true // [{url: string, ipfsHash: string, type: string}]
    },
    metadataCID: {
      type: DataTypes.STRING(100),
      allowNull: true // IPFS CID for detailed metadata
    },
    priceWei: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    buyerAddress: {
      type: DataTypes.STRING(42),
      allowNull: true
    },
    state: {
      type: DataTypes.ENUM('Created', 'Listed', 'EscrowFunded', 'Delivered', 'Released', 'Refunded'),
      allowNull: false,
      defaultValue: 'Created'
    },
    provenanceCIDs: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [] // array of IPFS CIDs for provenance notes
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  });

  return ProduceBatch;
};
