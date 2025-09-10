const { ethers } = require('ethers');
const contractAddress = require('../contract-address.json');
const contractABI = require('../contract-abi.json');

class BlockchainService {
  constructor() {
    this.provider = new ethers.JsonRpcProvider(process.env.RPC_URL || 'http://localhost:8545');
    this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80', this.provider);
    this.contract = new ethers.Contract(contractAddress.FarmMateLedger, contractABI, this.wallet);
  }

  // Batch operations
  async createBatch(metadataCID, priceWei) {
    const tx = await this.contract.createBatch(metadataCID, priceWei);
    await tx.wait();
    return tx.hash;
  }

  async listBatch(batchId, priceWei) {
    const tx = await this.contract.listBatch(batchId, priceWei);
    await tx.wait();
    return tx.hash;
  }

  async updateQuality(batchId, qualityScore, dataVerified) {
    const tx = await this.contract.updateQuality(batchId, qualityScore, dataVerified);
    await tx.wait();
    return tx.hash;
  }

  async updateMetadata(batchId, metadataCID) {
    const tx = await this.contract.updateMetadata(batchId, metadataCID);
    await tx.wait();
    return tx.hash;
  }

  async addProvenance(batchId, noteCID) {
    const tx = await this.contract.addProvenance(batchId, noteCID);
    await tx.wait();
    return tx.hash;
  }

  async fundEscrow(batchId, value) {
    const tx = await this.contract.fundEscrow(batchId, { value });
    await tx.wait();
    return tx.hash;
  }

  async markDelivered(batchId) {
    const tx = await this.contract.markDelivered(batchId);
    await tx.wait();
    return tx.hash;
  }

  async releaseToFarmer(batchId) {
    const tx = await this.contract.releaseToFarmer(batchId);
    await tx.wait();
    return tx.hash;
  }

  async refundBuyer(batchId) {
    const tx = await this.contract.refundBuyer(batchId);
    await tx.wait();
    return tx.hash;
  }

  // View operations
  async getBatch(batchId) {
    return await this.contract.getBatch(batchId);
  }

  async getProvenanceCIDs(batchId) {
    return await this.contract.getProvenanceCIDs(batchId);
  }

  async getIncentivePoints(address) {
    return await this.contract.incentivePoints(address);
  }

  // Event listeners
  async getBatchEvents(batchId, fromBlock = 0) {
    const filter = this.contract.filters.BatchCreated(batchId);
    return await this.contract.queryFilter(filter, fromBlock);
  }

  async getAllBatchEvents(fromBlock = 0) {
    const events = [];
    const eventTypes = [
      'BatchCreated',
      'BatchListed', 
      'QualityUpdated',
      'MetadataUpdated',
      'ProvenanceAdded',
      'EscrowFunded',
      'Delivered',
      'Released',
      'Refunded'
    ];

    for (const eventType of eventTypes) {
      const filter = this.contract.filters[eventType]();
      const eventList = await this.contract.queryFilter(filter, fromBlock);
      events.push(...eventList);
    }

    return events.sort((a, b) => a.blockNumber - b.blockNumber);
  }
}

module.exports = new BlockchainService();
