-- FarmMate Database Initialization Script
-- This script sets up the initial database schema and sample data

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS farmmate;

-- Use the farmmate database
\c farmmate;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    wallet_address VARCHAR(42) UNIQUE NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'farmer',
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    location VARCHAR(200),
    incentive_points BIGINT DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create farms table
CREATE TABLE IF NOT EXISTS farms (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(200) NOT NULL,
    coordinates JSONB,
    size DECIMAL(10,2),
    soil_type VARCHAR(50),
    certification JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create produce_batches table
CREATE TABLE IF NOT EXISTS produce_batches (
    id SERIAL PRIMARY KEY,
    batch_id BIGINT UNIQUE NOT NULL,
    farm_id INTEGER REFERENCES farms(id) ON DELETE CASCADE,
    crop_type VARCHAR(50) NOT NULL,
    variety VARCHAR(100),
    quantity DECIMAL(10,2) NOT NULL,
    unit VARCHAR(20) DEFAULT 'kg',
    harvest_date DATE NOT NULL,
    quality_score INTEGER DEFAULT 0 CHECK (quality_score >= 0 AND quality_score <= 100),
    data_verified BOOLEAN DEFAULT FALSE,
    ai_analysis JSONB,
    images JSONB,
    metadata_cid VARCHAR(100),
    price_wei BIGINT NOT NULL,
    buyer_address VARCHAR(42),
    state VARCHAR(20) DEFAULT 'Created',
    provenance_cids JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_farms_user_id ON farms(user_id);
CREATE INDEX IF NOT EXISTS idx_produce_batches_batch_id ON produce_batches(batch_id);
CREATE INDEX IF NOT EXISTS idx_produce_batches_farm_id ON produce_batches(farm_id);
CREATE INDEX IF NOT EXISTS idx_produce_batches_state ON produce_batches(state);
CREATE INDEX IF NOT EXISTS idx_produce_batches_crop_type ON produce_batches(crop_type);

-- Insert sample users
INSERT INTO users (wallet_address, role, name, email, location, is_verified) VALUES
('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', 'farmer', 'John Smith', 'john@example.com', 'California, USA', TRUE),
('0x70997970C51812dc3A010C7d01b50e0d17dc79C8', 'farmer', 'Maria Garcia', 'maria@example.com', 'Texas, USA', TRUE),
('0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC', 'buyer', 'Green Grocer Co.', 'orders@greengrocer.com', 'New York, USA', TRUE),
('0x90F79bf6EB2c4f870365E785982E1f101E9b2Be6', 'auditor', 'AgriCert Inc.', 'audit@agricert.com', 'Oregon, USA', TRUE)
ON CONFLICT (wallet_address) DO NOTHING;

-- Insert sample farms
INSERT INTO farms (user_id, name, location, coordinates, size, soil_type, certification) VALUES
(1, 'Sunrise Organic Farm', 'Napa Valley, California', '{"lat": 38.2975, "lng": -122.2869}', 25.5, 'loam', '[{"type": "organic", "issuer": "USDA", "validUntil": "2025-12-31"}]'),
(2, 'Rio Grande Valley Farm', 'McAllen, Texas', '{"lat": 26.2034, "lng": -98.2300}', 40.0, 'clay', '[{"type": "sustainable", "issuer": "Texas Organic", "validUntil": "2024-12-31"}]')
ON CONFLICT DO NOTHING;

-- Insert sample produce batches
INSERT INTO produce_batches (batch_id, farm_id, crop_type, variety, quantity, unit, harvest_date, quality_score, data_verified, price_wei, state, ai_analysis) VALUES
(1, 1, 'tomato', 'Roma', 500.0, 'kg', '2024-01-15', 85, TRUE, 1000000000000000000, 'Listed', '{"disease": "Healthy", "confidence": 0.92, "recommendations": ["Continue current practices"]}'),
(2, 1, 'tomato', 'Cherry', 200.0, 'kg', '2024-01-20', 78, TRUE, 1200000000000000000, 'Listed', '{"disease": "Leaf Spot", "confidence": 0.75, "recommendations": ["Apply fungicide", "Improve air circulation"]}'),
(3, 2, 'potato', 'Russet', 1000.0, 'kg', '2024-01-18', 92, TRUE, 800000000000000000, 'EscrowFunded', '{"disease": "Healthy", "confidence": 0.95, "recommendations": ["Excellent quality", "Ready for premium market"]}'),
(4, 2, 'corn', 'Sweet Corn', 750.0, 'kg', '2024-01-22', 88, TRUE, 1500000000000000000, 'Delivered', '{"disease": "Healthy", "confidence": 0.89, "recommendations": ["Maintain current practices"]}')
ON CONFLICT (batch_id) DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_farms_updated_at BEFORE UPDATE ON farms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_produce_batches_updated_at BEFORE UPDATE ON produce_batches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE farmmate TO farmmate;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO farmmate;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO farmmate;
