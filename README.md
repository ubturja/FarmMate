# FarmMate - Decentralized Precision Agriculture Marketplace

🌾 **FarmMate** is a comprehensive prototype of a decentralized precision agriculture marketplace that connects farmers, buyers, and AI-powered insights for sustainable farming practices.

## 🚀 Quick Start (For Supervisors)

**Want to see the system running in 5 minutes? Use the automated script:**

```bash
./quick-start.sh
```

**Or manually follow these 3 steps:**

1. **Start Database**: `docker run -d --name farmmate-postgres -e POSTGRES_DB=farmmate -e POSTGRES_USER=farmmate -e POSTGRES_PASSWORD=farmmate123 -p 5432:5432 postgres:15-alpine`

2. **Start Backend**: `cd backend && node simple-server.js`

3. **Start Frontend**: `cd frontend && npm start`

4. **Open Browser**: Go to http://localhost:3000

**That's it!** The system will be running with sample data. You can browse the marketplace and create new produce batches.

*For detailed setup instructions, see the [Step-by-Step Setup Guide](#-step-by-step-setup-guide) below.*

## 🚀 Features

### Core Functionality
- **Blockchain-Backed Marketplace**: Fair pricing, traceability, and escrow payments
- **AI-Powered Analysis**: On-device disease detection and quality scoring
- **Provenance Tracking**: Immutable supply chain from farm to table
- **Federated Learning**: Privacy-preserving model training across farms
- **Token Incentives**: Rewards for verified data and sustainable practices

### Technology Stack
- **Smart Contracts**: Solidity + Hardhat (Polygon testnet/local dev)
- **Backend**: Node.js + Express + PostgreSQL
- **Frontend**: React.js with wallet integration
- **AI Models**: TFLite/ONNX for on-device inference
- **Storage**: IPFS for images and large files
- **Blockchain**: Ethereum-compatible (MetaMask integration)

## 🏗️ Architecture

```
farmmate-prototype/
├── contract/                # Smart contracts (Solidity + Hardhat)
├── backend/                 # Node.js API server
├── frontend/                # React web application
├── ai/                      # AI inference and federated learning
├── scripts/                 # Deployment and test scripts
└── docker-compose.yml       # Container orchestration
```

## 🚀 Step-by-Step Setup Guide

### Prerequisites

**Required Software:**
- **Docker** (version 20.10+) and **Docker Compose** (version 2.0+)
- **Node.js** (version 18.19.1 or higher)
- **Git** (for cloning the repository)
- **Web Browser** with **MetaMask extension** (for wallet functionality)

**System Requirements:**
- **RAM**: Minimum 8GB (16GB recommended)
- **Storage**: At least 5GB free space
- **OS**: Linux, macOS, or Windows with WSL2

### Step 1: Verify Prerequisites

**Check Docker Installation:**
```bash
docker --version
docker-compose --version
```
Expected output: Docker version 20.10+ and Docker Compose version 2.0+

**Check Node.js Installation:**
```bash
node --version
npm --version
```
Expected output: Node.js v18.19.1+ and npm 9.0+

### Step 2: Clone and Navigate to Project

```bash
# Clone the repository (replace with actual repository URL)
git clone <repository-url>
cd farmmate-prototype

# Verify you're in the correct directory
pwd
ls -la
```
You should see directories: `backend/`, `frontend/`, `contract/`, `ai/`, `scripts/`

### Step 3: Start PostgreSQL Database

**Start PostgreSQL using Docker:**
```bash
# Start PostgreSQL container
docker run -d --name farmmate-postgres \
  -e POSTGRES_DB=farmmate \
  -e POSTGRES_USER=farmmate \
  -e POSTGRES_PASSWORD=farmmate123 \
  -p 5432:5432 \
  postgres:15-alpine

# Verify PostgreSQL is running
docker ps | grep postgres
```
Expected output: Container `farmmate-postgres` should be running

### Step 4: Start Backend API Server

```bash
# Navigate to backend directory
cd backend

# Install dependencies (if not already installed)
npm install

# Start the simplified backend server
node simple-server.js
```

**Expected Output:**
```
FarmMate backend server running on port 3001
Health check: http://localhost:3001/health
Running in simplified mode with mock data
```

**Keep this terminal open** - the backend server needs to stay running.

### Step 5: Start Frontend Application

**Open a new terminal window/tab:**

```bash
# Navigate to project root
cd /path/to/farmmate-prototype

# Navigate to frontend directory
cd frontend

# Install dependencies (if not already installed)
npm install

# Start the React development server
npm start
```

**Expected Output:**
```
Compiled successfully!

You can now view farmmate-frontend in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000

Note that the development build is not optimized.
To create a production build, use npm run build.
```

**Keep this terminal open** - the frontend server needs to stay running.

### Step 6: Verify System is Running

**Open a new terminal window/tab and run these verification commands:**

```bash
# Check backend health
curl -s http://localhost:3001/health | jq .

# Check frontend is accessible
curl -s http://localhost:3000 | grep -o "FarmMate"

# Check marketplace API
curl -s http://localhost:3001/api/marketplace/batches | jq '.data | length'
```

**Expected Results:**
- Backend health: `{"status":"healthy","timestamp":"...","services":{"database":"simulated",...}}`
- Frontend: Should return `FarmMate`
- Marketplace API: Should return `2` (number of sample batches)

### Step 7: Access the Application

**Open your web browser and navigate to:**
- **Main Application**: http://localhost:3000
- **Backend API Health**: http://localhost:3001/health

### Step 8: Test Core Functionality

**1. Connect Wallet (Simulated):**
- Click the wallet button in the top-right corner
- The system will simulate a wallet connection

**2. Browse Marketplace:**
- Navigate to the Marketplace section
- You should see 2 sample produce batches (Tomatoes and Lettuce)

**3. Create a New Batch (Farmer Feature):**
- Click the "Create Batch" button
- Fill out the form with sample data:
  - Crop Type: Select "Carrots"
  - Variety: Enter "Nantes"
  - Quantity: Enter "30"
  - Price: Enter "0.5"
  - Harvest Date: Select today's date
  - Quality Score: Enter "88"
  - Farm Name: Enter "Test Farm"
  - Farmer Name: Enter "Test Farmer"
- Click "Create Batch"
- The new batch should appear in the marketplace

**4. View Batch Details:**
- Click "View" on any batch card
- This will navigate to the Provenance page

### Step 9: Troubleshooting

**If Backend Won't Start:**
```bash
# Check if port 3001 is already in use
lsof -i :3001

# Kill any process using port 3001
sudo kill -9 $(lsof -t -i:3001)

# Restart backend
cd backend && node simple-server.js
```

**If Frontend Won't Start:**
```bash
# Check if port 3000 is already in use
lsof -i :3000

# Kill any process using port 3000
sudo kill -9 $(lsof -t -i:3000)

# Restart frontend
cd frontend && npm start
```

**If PostgreSQL Won't Start:**
```bash
# Check if port 5432 is already in use
lsof -i :5432

# Remove existing container and restart
docker rm -f farmmate-postgres
docker run -d --name farmmate-postgres \
  -e POSTGRES_DB=farmmate \
  -e POSTGRES_USER=farmmate \
  -e POSTGRES_PASSWORD=farmmate123 \
  -p 5432:5432 \
  postgres:15-alpine
```

### Step 10: Stop the System

**To stop all services:**

```bash
# Stop frontend (Ctrl+C in frontend terminal)
# Stop backend (Ctrl+C in backend terminal)

# Stop PostgreSQL
docker stop farmmate-postgres
docker rm farmmate-postgres
```

### 🎯 Quick Verification Checklist

- [ ] Docker is installed and running
- [ ] Node.js 18+ is installed
- [ ] PostgreSQL container is running
- [ ] Backend server is running on port 3001
- [ ] Frontend server is running on port 3000
- [ ] Application loads at http://localhost:3000
- [ ] Marketplace shows sample batches
- [ ] "Create Batch" button is visible
- [ ] New batches can be created successfully

### 📞 Support

**If you encounter any issues:**
1. Check that all prerequisites are installed correctly
2. Verify all services are running on the correct ports
3. Check the terminal output for error messages
4. Ensure no firewall is blocking the ports (3000, 3001, 5432)
5. Try restarting the services in the correct order

**Service URLs:**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **PostgreSQL**: localhost:5432

## ⚠️ Current System Status

### ✅ **Working Features:**
- **Frontend Application**: Complete React UI with modern design
- **Backend API**: RESTful API with mock data storage
- **Marketplace**: Browse and filter produce batches
- **Batch Creation**: Farmers can create and list new produce batches
- **Wallet Integration**: Simulated wallet connection for testing
- **Provenance Tracking**: View batch details and supply chain information
- **Real-time Updates**: New batches appear immediately in marketplace
- **Form Validation**: Comprehensive validation for batch creation
- **Responsive Design**: Works on desktop and mobile devices

### ⚠️ **Limited/Simulated Features:**
- **Blockchain Integration**: Currently simulated (no real smart contracts)
- **AI Analysis**: Mock AI responses (no real ML models running)
- **IPFS Storage**: Simulated file storage
- **Database**: In-memory storage (data resets on restart)
- **Wallet Transactions**: Simulated (no real cryptocurrency transactions)

### 🚧 **Not Yet Implemented:**
- **Real Blockchain**: Hardhat integration has dependency issues
- **AI Models**: TensorFlow Lite models not integrated
- **File Upload**: Image upload functionality not fully implemented
- **User Authentication**: No real user management system
- **Payment Processing**: No real escrow or payment system

### 📊 **Demo Data:**
The system comes with sample data:
- **2 Sample Batches**: Tomatoes (Cherry) and Lettuce (Romaine)
- **Mock Farmer Info**: Green Valley Farm and Sunny Acres
- **Sample Prices**: 1 ETH and 0.5 ETH respectively
- **Quality Scores**: 85 and 92 respectively

## 📱 Usage Guide

### For Farmers
1. **Connect Wallet**: Use MetaMask to connect your wallet
2. **Create Farm**: Register your farm with location and details
3. **Add Produce**: Create batches with AI-powered quality analysis
4. **List for Sale**: Set prices and list batches on marketplace
5. **Track Provenance**: Add notes throughout the supply chain

### For Buyers
1. **Browse Marketplace**: Search and filter available produce
2. **View Details**: Check quality scores, provenance, and farmer info
3. **Purchase**: Fund escrow for secure transactions
4. **Verify Delivery**: Confirm receipt and release payments

### For Auditors
1. **Verify Data**: Check AI analysis and quality scores
2. **Add Certifications**: Validate organic/sustainable practices
3. **Monitor Compliance**: Track adherence to standards

## 🤖 AI Features

### Disease Detection
- On-device image analysis using MobileNet
- Real-time crop health assessment
- Treatment recommendations

### Quality Scoring
- Multi-factor quality analysis (color, size, defects, freshness)
- Letter grade system (A+ to F)
- Market suitability recommendations

### Yield Forecasting
- Weather and soil condition analysis
- Historical data integration
- Production optimization suggestions

### Price Forecasting
- Market trend analysis
- Seasonal price predictions
- Demand-supply dynamics

### Federated Learning
- Privacy-preserving model training
- Cross-farm knowledge sharing
- Continuous model improvement

## 🔗 Smart Contract Features

### FarmMateLedger Contract
- **Batch Management**: Create, list, and track produce batches
- **Escrow System**: Secure buyer-farmer transactions
- **Quality Updates**: Record AI analysis results
- **Provenance**: Append-only supply chain notes
- **Incentives**: Token rewards for verified data

### Key Functions
```solidity
// Create a new produce batch
function createBatch(string metadataCID, uint256 priceWei)

// Fund escrow for purchase
function fundEscrow(uint256 batchId)

// Mark as delivered
function markDelivered(uint256 batchId)

// Release funds to farmer
function releaseToFarmer(uint256 batchId)

// Add provenance note
function addProvenance(uint256 batchId, string noteCID)
```

## 🗄️ Database Schema

### Users Table
- Wallet address, role, verification status
- Incentive points and profile information

### Farms Table
- Farm details, location, certifications
- Soil type and size information

### Produce Batches Table
- Crop details, quality scores, AI analysis
- Blockchain state and provenance tracking

## 🔧 Development

### Local Development
```bash
# Start individual services
docker-compose up postgres ipfs hardhat
docker-compose up backend
docker-compose up frontend
docker-compose up ai-service
```

### Contract Development
```bash
cd contract
npm install
npx hardhat compile
npx hardhat test
npx hardhat run scripts/deploy.js --network localhost
```

### Backend Development
```bash
cd backend
npm install
npm run dev
```

### Frontend Development
```bash
cd frontend
npm install
npm start
```

### AI Service Development
```bash
cd ai
pip install -r requirements.txt
python app.py
```

## 🧪 Testing

### API Testing
```bash
./scripts/test-api.sh
```

### Contract Testing
```bash
cd contract
npx hardhat test
```

### Frontend Testing
```bash
cd frontend
npm test
```

## 📊 Sample Data

The system includes comprehensive sample data:
- 4 sample users (farmers, buyers, auditors)
- 3 sample farms with different characteristics
- 4 sample produce batches in various states
- Complete provenance tracking examples
- AI model performance data
- Market trend information

## 🔒 Security Features

- **Wallet Integration**: MetaMask for secure transactions
- **Escrow System**: Funds held in smart contract until delivery
- **Data Integrity**: IPFS for immutable file storage
- **Privacy**: Federated learning preserves data privacy
- **Verification**: Multi-layer data validation

## 🌱 Sustainability Features

- **Carbon Footprint Tracking**: Monitor environmental impact
- **Sustainable Practices**: Reward eco-friendly farming
- **Local Sourcing**: Reduce transportation emissions
- **Waste Reduction**: AI-optimized harvest timing

## 🚀 Deployment

### Production Deployment
1. Deploy contracts to Polygon mainnet
2. Set up production IPFS cluster
3. Configure production database
4. Deploy services to cloud infrastructure
5. Set up monitoring and logging

### Environment Variables
```bash
# Backend
DB_HOST=localhost
DB_PORT=5432
DB_NAME=farmmate
RPC_URL=http://localhost:8545
IPFS_URL=http://localhost:5001

# Frontend
REACT_APP_API_URL=http://localhost:3001
REACT_APP_CONTRACT_ADDRESS=0x...
REACT_APP_RPC_URL=http://localhost:8545
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the sample data and test scripts

## 🔮 Future Enhancements

- Mobile app (React Native)
- Advanced ML models
- Carbon credit trading
- Insurance integration
- Multi-language support

---

**FarmMate** - Empowering farmers with technology, ensuring food security through transparency. 🌾✨
