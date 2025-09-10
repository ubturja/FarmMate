import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Search, Filter, Plus, Eye, ShoppingCart, Package, Star, MapPin, Calendar } from 'lucide-react';
import { marketplaceAPI } from '../services/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import CreateBatch from './CreateBatch';

const MarketplaceContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const Title = styled.h1`
  color: white;
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`;

const SearchContainer = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const SearchInput = styled.input`
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
  min-width: 300px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.3);
  }
`;

const FilterSelect = styled.select`
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.3);
  }
`;

const CreateButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
  }
`;

const BatchesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`;

const BatchCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  }
`;

const BatchHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const BatchTitle = styled.h3`
  color: #1f2937;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
`;

const QualityBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.75rem;
  background: ${props => {
    if (props.score >= 80) return '#10b981';
    if (props.score >= 60) return '#f59e0b';
    return '#ef4444';
  }};
  color: white;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
`;

const BatchInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  font-size: 0.9rem;
`;

const Price = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1rem;
`;

const Actions = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const ActionButton = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  ${props => {
    if (props.primary) {
      return `
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
        }
      `;
    }
    return `
      background: rgba(107, 114, 128, 0.1);
      color: #6b7280;
      &:hover {
        background: rgba(107, 114, 128, 0.2);
      }
    `;
  }}
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4rem;
  color: white;
  font-size: 1.2rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: white;

  h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }

  p {
    opacity: 0.8;
    margin-bottom: 2rem;
  }
`;

const Marketplace = () => {
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [cropFilter, setCropFilter] = useState('');
  const [qualityFilter, setQualityFilter] = useState('');
  const [showCreateBatch, setShowCreateBatch] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');

  useEffect(() => {
    loadBatches();
    // Check for wallet connection
    const storedAddress = localStorage.getItem('walletAddress');
    if (storedAddress) {
      setWalletAddress(storedAddress);
    }
  }, [cropFilter, qualityFilter]);

  const loadBatches = async () => {
    try {
      setLoading(true);
      const params = {};
      if (cropFilter) params.cropType = cropFilter;
      if (qualityFilter) params.minQuality = qualityFilter;
      
      const response = await marketplaceAPI.getBatches(params);
      setBatches(response.data.data || []);
    } catch (error) {
      console.error('Failed to load batches:', error);
      toast.error('Failed to load batches');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (batchId, priceWei) => {
    try {
      const walletAddress = localStorage.getItem('walletAddress');
      if (!walletAddress) {
        toast.error('Please connect your wallet first');
        return;
      }

      await marketplaceAPI.fundEscrow(batchId, priceWei);
      toast.success('Escrow funded successfully!');
      loadBatches();
    } catch (error) {
      console.error('Purchase failed:', error);
      toast.error('Failed to fund escrow');
    }
  };

  const handleViewDetails = (batchId) => {
    // Navigate to provenance page with batch ID
    navigate(`/provenance?batchId=${batchId}`);
  };

  const handleCreateBatch = () => {
    if (!walletAddress) {
      toast.error('Please connect your wallet to create a batch');
      return;
    }
    setShowCreateBatch(true);
  };

  const handleBatchCreated = (newBatch) => {
    // Add the new batch to the current list
    setBatches(prev => [newBatch, ...prev]);
    toast.success('Batch created and listed successfully!');
  };

  const filteredBatches = (batches || []).filter(batch => {
    const matchesSearch = !searchTerm || 
      batch.cropType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batch.variety?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const formatPrice = (priceWei) => {
    const price = parseFloat(priceWei) / 1e18;
    return price.toFixed(4);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <MarketplaceContainer>
        <LoadingSpinner>Loading batches...</LoadingSpinner>
      </MarketplaceContainer>
    );
  }

  return (
    <MarketplaceContainer>
      <Header>
        <Title>Marketplace</Title>
        <SearchContainer>
          <SearchInput
            type="text"
            placeholder="Search crops, varieties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FilterSelect
            value={cropFilter}
            onChange={(e) => setCropFilter(e.target.value)}
          >
            <option value="">All Crops</option>
            <option value="tomato">Tomato</option>
            <option value="potato">Potato</option>
            <option value="wheat">Wheat</option>
            <option value="corn">Corn</option>
            <option value="rice">Rice</option>
          </FilterSelect>
          <FilterSelect
            value={qualityFilter}
            onChange={(e) => setQualityFilter(e.target.value)}
          >
            <option value="">All Quality</option>
            <option value="80">High (80+)</option>
            <option value="60">Medium (60+)</option>
            <option value="40">Low (40+)</option>
          </FilterSelect>
          <CreateButton onClick={handleCreateBatch}>
            <Plus size={20} />
            Create Batch
          </CreateButton>
        </SearchContainer>
      </Header>

      {filteredBatches.length === 0 ? (
        <EmptyState>
          <h3>No batches found</h3>
          <p>Try adjusting your search criteria or create a new batch.</p>
        </EmptyState>
      ) : (
        <BatchesGrid>
          {filteredBatches.map((batch) => (
            <BatchCard key={batch.id}>
              <BatchHeader>
                <BatchTitle>{batch.cropType}</BatchTitle>
                <QualityBadge score={batch.qualityScore}>
                  <Star size={14} />
                  {batch.qualityScore}
                </QualityBadge>
              </BatchHeader>

              <BatchInfo>
                <InfoRow>
                  <Package size={16} />
                  {batch.quantity} {batch.unit}
                </InfoRow>
                <InfoRow>
                  <Calendar size={16} />
                  Harvested: {formatDate(batch.harvestDate)}
                </InfoRow>
                <InfoRow>
                  <MapPin size={16} />
                  {batch.Farm?.User?.location || 'Unknown location'}
                </InfoRow>
                {batch.variety && (
                  <InfoRow>
                    Variety: {batch.variety}
                  </InfoRow>
                )}
              </BatchInfo>

              <Price>{formatPrice(batch.priceWei)} ETH</Price>

              <Actions>
                <ActionButton onClick={() => handleViewDetails(batch.batchId)}>
                  <Eye size={16} />
                  View
                </ActionButton>
                <ActionButton 
                  primary 
                  onClick={() => handlePurchase(batch.batchId, batch.priceWei)}
                >
                  <ShoppingCart size={16} />
                  Buy
                </ActionButton>
              </Actions>
            </BatchCard>
          ))}
        </BatchesGrid>
      )}

      <CreateBatch
        isOpen={showCreateBatch}
        onClose={() => setShowCreateBatch(false)}
        onBatchCreated={handleBatchCreated}
      />
    </MarketplaceContainer>
  );
};

export default Marketplace;
