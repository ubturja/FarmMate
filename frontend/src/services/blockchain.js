import { ethers } from 'ethers';
import contractABI from '../contract-abi.json';

const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS || '0x2c7d77410317c1b342d8aa07Ea28e81b0e3779cD';
const RPC_URL = process.env.REACT_APP_RPC_URL || 'http://localhost:8545';

class BlockchainService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      if (typeof window.ethereum !== 'undefined') {
        // Request account access
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        this.provider = new ethers.BrowserProvider(window.ethereum);
        this.signer = await this.provider.getSigner();
        this.contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, this.signer);
        this.isConnected = true;

        // Store wallet address
        const address = await this.signer.getAddress();
        localStorage.setItem('walletAddress', address);

        return { success: true, address };
      } else {
        throw new Error('MetaMask not detected');
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
      return { success: false, error: error.message };
    }
  }

  async getAccount() {
    if (!this.signer) {
      throw new Error('Wallet not connected');
    }
    return await this.signer.getAddress();
  }

  async getBalance() {
    if (!this.signer) {
      throw new Error('Wallet not connected');
    }
    const address = await this.signer.getAddress();
    const balance = await this.provider.getBalance(address);
    return ethers.formatEther(balance);
  }

  async getNetwork() {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }
    return await this.provider.getNetwork();
  }

  // Contract interaction methods
  async createBatch(metadataCID, priceWei) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }
    const tx = await this.contract.createBatch(metadataCID, priceWei);
    await tx.wait();
    return tx.hash;
  }

  async listBatch(batchId, priceWei) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }
    const tx = await this.contract.listBatch(batchId, priceWei);
    await tx.wait();
    return tx.hash;
  }

  async updateQuality(batchId, qualityScore, dataVerified) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }
    const tx = await this.contract.updateQuality(batchId, qualityScore, dataVerified);
    await tx.wait();
    return tx.hash;
  }

  async updateMetadata(batchId, metadataCID) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }
    const tx = await this.contract.updateMetadata(batchId, metadataCID);
    await tx.wait();
    return tx.hash;
  }

  async addProvenance(batchId, noteCID) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }
    const tx = await this.contract.addProvenance(batchId, noteCID);
    await tx.wait();
    return tx.hash;
  }

  async fundEscrow(batchId, value) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }
    const tx = await this.contract.fundEscrow(batchId, { value });
    await tx.wait();
    return tx.hash;
  }

  async markDelivered(batchId) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }
    const tx = await this.contract.markDelivered(batchId);
    await tx.wait();
    return tx.hash;
  }

  async releaseToFarmer(batchId) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }
    const tx = await this.contract.releaseToFarmer(batchId);
    await tx.wait();
    return tx.hash;
  }

  async refundBuyer(batchId) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }
    const tx = await this.contract.refundBuyer(batchId);
    await tx.wait();
    return tx.hash;
  }

  // View methods
  async getBatch(batchId) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }
    return await this.contract.getBatch(batchId);
  }

  async getProvenanceCIDs(batchId) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }
    return await this.contract.getProvenanceCIDs(batchId);
  }

  async getIncentivePoints(address) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }
    return await this.contract.incentivePoints(address);
  }

  // Event listeners
  async getBatchEvents(batchId, fromBlock = 0) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }
    const filter = this.contract.filters.BatchCreated(batchId);
    return await this.contract.queryFilter(filter, fromBlock);
  }

  async getAllBatchEvents(fromBlock = 0) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }
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

  // Utility methods
  formatEther(wei) {
    return ethers.formatEther(wei);
  }

  parseEther(ether) {
    return ethers.parseEther(ether);
  }

  formatUnits(value, unit) {
    return ethers.formatUnits(value, unit);
  }

  parseUnits(value, unit) {
    return ethers.parseUnits(value, unit);
  }

  // Disconnect wallet
  disconnect() {
    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.isConnected = false;
    localStorage.removeItem('walletAddress');
  }
}

export default new BlockchainService();
