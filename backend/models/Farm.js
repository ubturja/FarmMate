const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Farm = sequelize.define('Farm', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    location: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    coordinates: {
      type: DataTypes.JSON,
      allowNull: true // {lat: number, lng: number}
    },
    size: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true // acres
    },
    soilType: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    certification: {
      type: DataTypes.JSON,
      allowNull: true // [{type: string, issuer: string, validUntil: date}]
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
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

  return Farm;
};
