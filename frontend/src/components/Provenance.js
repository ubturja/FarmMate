import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { QrCode, Search, CheckCircle, XCircle, Clock, MapPin, User, Calendar, Plus } from 'lucide-react';
import { provenanceAPI } from '../services/api';
import { toast } from 'react-toastify';
import { useLocation } from 'react-router-dom';

const ProvenanceContainer = styled.div`
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

const SearchButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
  }
`;

const QRScannerButton = styled.button`
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

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
  }
`;

const BatchDetails = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const BatchHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const BatchTitle = styled.h2`
  color: #1f2937;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
`;

const VerificationStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  background: ${props => props.verified ? '#10b981' : '#ef4444'};
  color: white;
`;

const BatchInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const InfoCard = styled.div`
  padding: 1rem;
  background: rgba(107, 114, 128, 0.05);
  border-radius: 8px;
  border-left: 4px solid #667eea;
`;

const InfoLabel = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
  margin-bottom: 0.25rem;
`;

const InfoValue = styled.div`
  font-size: 1rem;
  color: #1f2937;
  font-weight: 600;
`;

const ProvenanceTimeline = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const TimelineTitle = styled.h3`
  color: #1f2937;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 1.5rem 0;
`;

const TimelineItem = styled.div`
  display: flex;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid rgba(107, 114, 128, 0.1);

  &:last-child {
    border-bottom: none;
  }
`;

const TimelineIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => {
    switch (props.type) {
      case 'harvest': return '#10b981';
      case 'transport': return '#3b82f6';
      case 'storage': return '#f59e0b';
      case 'processing': return '#8b5cf6';
      default: return '#6b7280';
    }
  }};
  color: white;
  font-weight: 600;
  flex-shrink: 0;
`;

const TimelineContent = styled.div`
  flex: 1;
`;

const TimelineHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const TimelineItemTitle = styled.h4`
  color: #1f2937;
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
`;

const TimelineTime = styled.div`
  color: #6b7280;
  font-size: 0.875rem;
`;

const TimelineDescription = styled.p`
  color: #6b7280;
  font-size: 0.9rem;
  margin: 0 0 0.5rem 0;
`;

const TimelineLocation = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #6b7280;
  font-size: 0.875rem;
`;

const AddNoteButton = styled.button`
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
  margin-top: 1rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4rem;
  color: white;
  font-size: 1.2rem;
`;

const ErrorMessage = styled.div`
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #dc2626;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 2rem;
`;

const Provenance = () => {
  const location = useLocation();
  const [batchId, setBatchId] = useState('');
  const [batchData, setBatchData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check for batchId in URL query parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const queryBatchId = urlParams.get('batchId');
    if (queryBatchId) {
      setBatchId(queryBatchId);
      // Automatically search for the batch
      handleSearchWithId(queryBatchId);
    }
  }, [location.search]);

  const handleSearchWithId = async (id) => {
    try {
      setLoading(true);
      setError('');
      const response = await provenanceAPI.getBatch(id);
      setBatchData(response.data.data);
    } catch (error) {
      console.error('Search failed:', error);
      setError('Batch not found or failed to load data');
      setBatchData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!batchId.trim()) {
      toast.error('Please enter a batch ID');
      return;
    }
    await handleSearchWithId(batchId);
  };

  const handleQRScan = () => {
    // In a real implementation, this would open a QR scanner
    toast.info('QR scanner would open here');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'harvest': return '🌾';
      case 'transport': return '🚚';
      case 'storage': return '🏪';
      case 'processing': return '⚙️';
      default: return '📝';
    }
  };

  return (
    <ProvenanceContainer>
      <Header>
        <Title>Provenance Tracker</Title>
        <SearchContainer>
          <SearchInput
            type="text"
            placeholder="Enter batch ID or scan QR code"
            value={batchId}
            onChange={(e) => setBatchId(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <SearchButton onClick={handleSearch}>
            <Search size={20} />
            Search
          </SearchButton>
          <QRScannerButton onClick={handleQRScan}>
            <QrCode size={20} />
            Scan QR
          </QRScannerButton>
        </SearchContainer>
      </Header>

      {loading && (
        <LoadingSpinner>Loading batch data...</LoadingSpinner>
      )}

      {error && (
        <ErrorMessage>{error}</ErrorMessage>
      )}

      {batchData && (
        <>
          <BatchDetails>
            <BatchHeader>
              <BatchTitle>
                {batchData.batchInfo.cropType} - Batch #{batchData.batchId}
              </BatchTitle>
              <VerificationStatus verified={batchData.batchInfo.dataVerified}>
                {batchData.batchInfo.dataVerified ? (
                  <>
                    <CheckCircle size={16} />
                    Verified
                  </>
                ) : (
                  <>
                    <XCircle size={16} />
                    Unverified
                  </>
                )}
              </VerificationStatus>
            </BatchHeader>

            <BatchInfo>
              <InfoCard>
                <InfoLabel>Crop Type</InfoLabel>
                <InfoValue>{batchData.batchInfo.cropType}</InfoValue>
              </InfoCard>
              <InfoCard>
                <InfoLabel>Variety</InfoLabel>
                <InfoValue>{batchData.batchInfo.variety || 'N/A'}</InfoValue>
              </InfoCard>
              <InfoCard>
                <InfoLabel>Harvest Date</InfoLabel>
                <InfoValue>{formatDate(batchData.batchInfo.harvestDate)}</InfoValue>
              </InfoCard>
              <InfoCard>
                <InfoLabel>Quality Score</InfoLabel>
                <InfoValue>{batchData.batchInfo.qualityScore}/100</InfoValue>
              </InfoCard>
            </BatchInfo>
          </BatchDetails>

          <ProvenanceTimeline>
            <TimelineTitle>Provenance Timeline</TimelineTitle>
            
            {batchData.provenanceNotes.map((note, index) => (
              <TimelineItem key={index}>
                <TimelineIcon type={note.type}>
                  {getTypeIcon(note.type)}
                </TimelineIcon>
                <TimelineContent>
                  <TimelineHeader>
                    <TimelineItemTitle>{note.type.charAt(0).toUpperCase() + note.type.slice(1)}</TimelineItemTitle>
                    <TimelineTime>{formatDate(note.timestamp)}</TimelineTime>
                  </TimelineHeader>
                  <TimelineDescription>{note.description}</TimelineDescription>
                  {note.location && (
                    <TimelineLocation>
                      <MapPin size={14} />
                      {note.location}
                    </TimelineLocation>
                  )}
                </TimelineContent>
              </TimelineItem>
            ))}

            {batchData.blockchainEvents.map((event, index) => (
              <TimelineItem key={`event-${index}`}>
                <TimelineIcon type="blockchain">
                  ⛓️
                </TimelineIcon>
                <TimelineContent>
                  <TimelineHeader>
                    <TimelineItemTitle>Blockchain Event: {event.event}</TimelineItemTitle>
                    <TimelineTime>Block #{event.blockNumber}</TimelineTime>
                  </TimelineHeader>
                  <TimelineDescription>
                    Transaction: {event.transactionHash}
                  </TimelineDescription>
                </TimelineContent>
              </TimelineItem>
            ))}

            <AddNoteButton>
              <Plus size={16} />
              Add Provenance Note
            </AddNoteButton>
          </ProvenanceTimeline>
        </>
      )}
    </ProvenanceContainer>
  );
};

export default Provenance;
