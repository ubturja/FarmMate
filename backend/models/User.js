const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    walletAddress: {
      type: DataTypes.STRING(42),
      allowNull: false,
      unique: true
    },
    role: {
      type: DataTypes.ENUM('farmer', 'buyer', 'auditor'),
      allowNull: false,
      defaultValue: 'farmer'
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    location: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    incentivePoints: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: 0
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
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

  return User;
};
