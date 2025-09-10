# FarmMate Supervisor Guide

## 🎯 Quick Demo Instructions

**To demonstrate FarmMate to stakeholders in under 5 minutes:**

### Option 1: Automated Setup (Recommended)
```bash
./quick-start.sh
```
Then open http://localhost:3000 in your browser.

### Option 2: Manual Setup
1. Start database: `docker run -d --name farmmate-postgres -e POSTGRES_DB=farmmate -e POSTGRES_USER=farmmate -e POSTGRES_PASSWORD=farmmate123 -p 5432:5432 postgres:15-alpine`
2. Start backend: `cd backend && node simple-server.js`
3. Start frontend: `cd frontend && npm start`
4. Open http://localhost:3000

## 🎬 Demo Script (5-10 minutes)

### 1. Show the Marketplace (2 minutes)
- Navigate to http://localhost:3000
- Click on "Marketplace" in the navigation
- Show the 2 sample batches (Tomatoes and Lettuce)
- Demonstrate filtering by crop type and quality
- Explain the quality scoring system (85 and 92 scores)

### 2. Demonstrate Batch Creation (3 minutes)
- Click the "Create Batch" button
- Fill out the form with sample data:
  - Crop Type: "Carrots"
  - Variety: "Nantes"
  - Quantity: "30"
  - Price: "0.5"
  - Harvest Date: Today's date
  - Quality Score: "88"
  - Farm Name: "Demo Farm"
  - Farmer Name: "Demo Farmer"
- Click "Create Batch"
- Show how the new batch appears immediately in the marketplace

### 3. Show Provenance Tracking (2 minutes)
- Click "View" on any batch card
- Navigate to the Provenance page
- Show the batch details, farm information, and provenance notes
- Explain the supply chain transparency features

### 4. Highlight Key Features (1-2 minutes)
- **Real-time Updates**: New batches appear immediately
- **Form Validation**: Comprehensive validation and error handling
- **Responsive Design**: Works on desktop and mobile
- **Modern UI**: Clean, professional interface
- **Wallet Integration**: Simulated blockchain connectivity

## 📊 What's Working vs What's Not

### ✅ **Fully Functional:**
- Complete React frontend with modern UI
- RESTful API with mock data storage
- Marketplace browsing and filtering
- Batch creation and listing
- Real-time updates
- Form validation
- Responsive design
- Provenance tracking interface

### ⚠️ **Simulated/Mock:**
- Blockchain transactions (no real smart contracts)
- AI analysis (mock responses)
- File storage (simulated IPFS)
- Database (in-memory, resets on restart)
- Wallet transactions (simulated)

### 🚧 **Not Implemented:**
- Real blockchain integration
- Actual AI/ML models
- File upload functionality
- User authentication system
- Payment processing

## 🎯 Key Talking Points

### For Technical Stakeholders:
- "This is a working prototype demonstrating the core marketplace functionality"
- "The architecture supports blockchain, AI, and database integration"
- "The frontend is production-ready with modern React patterns"
- "The API follows RESTful conventions and includes proper validation"

### For Business Stakeholders:
- "Farmers can easily list their produce with detailed information"
- "Buyers can browse and filter products by quality and type"
- "The system provides full supply chain transparency"
- "The interface is intuitive and works on all devices"

### For Investors:
- "This demonstrates the core value proposition of the platform"
- "The technical foundation is solid and scalable"
- "The user experience is polished and professional"
- "The system is ready for real blockchain and AI integration"

## 🛠️ Troubleshooting

### If Services Won't Start:
1. Check if ports 3000, 3001, or 5432 are already in use
2. Kill existing processes: `sudo kill -9 $(lsof -t -i:3000)` (repeat for other ports)
3. Restart services in order: Database → Backend → Frontend

### If Frontend Shows Errors:
1. Check browser console for errors
2. Verify backend is running: `curl http://localhost:3001/health`
3. Restart frontend: `cd frontend && npm start`

### If Database Issues:
1. Check PostgreSQL container: `docker ps | grep postgres`
2. Restart container: `docker restart farmmate-postgres`
3. If still issues, recreate: `docker rm -f farmmate-postgres` then run the docker command again

## 📞 Support Contacts

- **Technical Issues**: Check the main README.md for detailed setup instructions
- **Demo Questions**: Refer to this guide and the main README
- **System Status**: All services should be running on localhost ports 3000, 3001, and 5432

## 🎉 Success Metrics

**A successful demo should show:**
- [ ] Application loads without errors
- [ ] Marketplace displays sample batches
- [ ] New batch can be created successfully
- [ ] Batch appears immediately in marketplace
- [ ] Provenance page shows batch details
- [ ] Interface is responsive and professional
- [ ] No console errors in browser

**Total demo time: 5-10 minutes**
**Setup time: 2-5 minutes**
**Total time investment: 10-15 minutes**
