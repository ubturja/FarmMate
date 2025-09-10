// Mock IPFS service for now
// const { create } = require('ipfs-http-client');
const fs = require('fs');
const path = require('path');

class IPFSService {
  constructor() {
    // Mock IPFS client for now
    this.client = {
      add: async (data) => ({ cid: { toString: () => 'mock-cid-' + Date.now() } }),
      cat: async function* (cid) { yield Buffer.from('mock data'); },
      pin: {
        add: async (cid) => true,
        rm: async (cid) => true
      }
    };
  }

  async addFile(filePath) {
    try {
      const file = fs.readFileSync(filePath);
      const result = await this.client.add(file);
      return result.cid.toString();
    } catch (error) {
      console.error('IPFS add file error:', error);
      throw new Error('Failed to add file to IPFS');
    }
  }

  async addBuffer(buffer) {
    try {
      const result = await this.client.add(buffer);
      return result.cid.toString();
    } catch (error) {
      console.error('IPFS add buffer error:', error);
      throw new Error('Failed to add buffer to IPFS');
    }
  }

  async addJSON(data) {
    try {
      const jsonString = JSON.stringify(data);
      const result = await this.client.add(jsonString);
      return result.cid.toString();
    } catch (error) {
      console.error('IPFS add JSON error:', error);
      throw new Error('Failed to add JSON to IPFS');
    }
  }

  async getFile(cid) {
    try {
      const chunks = [];
      for await (const chunk of this.client.cat(cid)) {
        chunks.push(chunk);
      }
      return Buffer.concat(chunks);
    } catch (error) {
      console.error('IPFS get file error:', error);
      throw new Error('Failed to get file from IPFS');
    }
  }

  async getJSON(cid) {
    try {
      const data = await this.getFile(cid);
      return JSON.parse(data.toString());
    } catch (error) {
      console.error('IPFS get JSON error:', error);
      throw new Error('Failed to get JSON from IPFS');
    }
  }

  async pin(cid) {
    try {
      await this.client.pin.add(cid);
      return true;
    } catch (error) {
      console.error('IPFS pin error:', error);
      return false;
    }
  }

  async unpin(cid) {
    try {
      await this.client.pin.rm(cid);
      return true;
    } catch (error) {
      console.error('IPFS unpin error:', error);
      return false;
    }
  }

  // Helper to create metadata object for batch
  createBatchMetadata(batchData) {
    return {
      cropType: batchData.cropType,
      variety: batchData.variety,
      quantity: batchData.quantity,
      unit: batchData.unit,
      harvestDate: batchData.harvestDate,
      qualityScore: batchData.qualityScore,
      dataVerified: batchData.dataVerified,
      aiAnalysis: batchData.aiAnalysis,
      images: batchData.images,
      farmInfo: batchData.farmInfo,
      createdAt: new Date().toISOString()
    };
  }

  // Helper to create provenance note
  createProvenanceNote(noteData) {
    return {
      type: noteData.type, // 'harvest', 'transport', 'storage', 'processing'
      description: noteData.description,
      location: noteData.location,
      timestamp: new Date().toISOString(),
      actor: noteData.actor, // wallet address
      metadata: noteData.metadata || {}
    };
  }
}

module.exports = new IPFSService();
