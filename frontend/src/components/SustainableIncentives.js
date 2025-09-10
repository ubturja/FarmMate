import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  Leaf, 
  Trophy, 
  Award, 
  TrendingUp, 
  Users, 
  Zap, 
  Droplets, 
  TreePine, 
  Database,
  CheckCircle,
  Clock,
  Star,
  Target,
  BarChart3,
  Coins
} from 'lucide-react';
import { toast } from 'react-toastify';

const IncentivesContainer = styled.div`
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
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  }
`;

const StatHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const StatIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
  background: ${props => {
    switch (props.category) {
      case 'sustainability': return 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
      case 'tokens': return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
      case 'carbon': return 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)';
      case 'achievements': return 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)';
      default: return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
  }};
`;

const StatTitle = styled.h3`
  color: #1f2937;
  font-size: 0.875rem;
  font-weight: 600;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const StatValue = styled.div`
  color: #1f2937;
  font-size: 2rem;
  font-weight: 700;
  margin: 0.5rem 0;
`;

const StatSubtext = styled.div`
  color: #6b7280;
  font-size: 0.875rem;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Section = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const SectionTitle = styled.h2`
  color: #1f2937;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 1.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const IncentiveCard = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.25rem;
  margin-bottom: 1rem;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    border-color: #10b981;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.1);
  }

  ${props => props.claimed && `
    background: #f0fdf4;
    border-color: #10b981;
  `}
`;

const IncentiveHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
`;

const IncentiveTitle = styled.h3`
  color: #1f2937;
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const TokenReward = styled.div`
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const IncentiveDescription = styled.p`
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0 0 0.75rem 0;
  line-height: 1.5;
`;

const RequirementsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 1rem 0;
`;

const RequirementItem = styled.li`
  color: #4b5563;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &::before {
    content: '•';
    color: #10b981;
    font-weight: bold;
  }
`;

const ClaimButton = styled.button`
  width: 100%;
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  ${props => props.claimed && `
    background: #6b7280;
    cursor: not-allowed;
  `}
`;

const LeaderboardTable = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.th`
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 600;
  text-align: left;
  padding: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
`;

const TableRow = styled.tr`
  &:hover {
    background: #f9fafb;
  }
`;

const TableCell = styled.td`
  padding: 0.75rem;
  border-bottom: 1px solid #f3f4f6;
  color: #1f2937;
  font-size: 0.875rem;
`;

const RankCell = styled(TableCell)`
  font-weight: 600;
  color: ${props => {
    if (props.rank === 1) return '#f59e0b';
    if (props.rank === 2) return '#6b7280';
    if (props.rank === 3) return '#d97706';
    return '#1f2937';
  }};
`;

const ScoreCell = styled(TableCell)`
  font-weight: 600;
  color: ${props => {
    if (props.score >= 90) return '#10b981';
    if (props.score >= 80) return '#f59e0b';
    return '#ef4444';
  }};
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
  color: #6b7280;

  h3 {
    font-size: 1.25rem;
    margin-bottom: 0.5rem;
    color: #1f2937;
  }

  p {
    margin: 0;
  }
`;

const CategoryFilter = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
`;

const FilterButton = styled.button`
  padding: 0.5rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  background: ${props => props.active ? '#10b981' : 'white'};
  color: ${props => props.active ? 'white' : '#6b7280'};
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #10b981;
    color: #10b981;
  }

  ${props => props.active && `
    &:hover {
      background: #059669;
      color: white;
    }
  `}
`;

const SustainableIncentives = () => {
  const [farmerData, setFarmerData] = useState(null);
  const [incentives, setIncentives] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [claiming, setClaiming] = useState({});

  const categories = [
    { id: 'all', name: 'All', icon: BarChart3 },
    { id: 'certification', name: 'Certification', icon: Award },
    { id: 'environmental', name: 'Environmental', icon: Leaf },
    { id: 'climate', name: 'Climate', icon: TreePine },
    { id: 'data', name: 'Data', icon: Database },
    { id: 'biodiversity', name: 'Biodiversity', icon: Droplets }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Get wallet address from localStorage
      const walletAddress = localStorage.getItem('walletAddress') || '0x1234567890123456789012345678901234567890';
      
      // Load farmer data
      const farmerResponse = await fetch(`http://localhost:3001/api/incentives/farmer/${walletAddress}`);
      if (farmerResponse.ok) {
        const farmerData = await farmerResponse.json();
        setFarmerData(farmerData.data);
      }
      
      // Load incentives
      const incentivesResponse = await fetch('http://localhost:3001/api/incentives');
      if (incentivesResponse.ok) {
        const incentivesData = await incentivesResponse.json();
        setIncentives(incentivesData.data);
      }
      
      // Load leaderboard
      const leaderboardResponse = await fetch('http://localhost:3001/api/incentives/leaderboard');
      if (leaderboardResponse.ok) {
        const leaderboardData = await leaderboardResponse.json();
        setLeaderboard(leaderboardData.data);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load incentives data');
    } finally {
      setLoading(false);
    }
  };

  const handleClaimIncentive = async (incentiveId) => {
    try {
      setClaiming(prev => ({ ...prev, [incentiveId]: true }));
      
      const response = await fetch(`http://localhost:3001/api/incentives/${incentiveId}/claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-wallet-address': localStorage.getItem('walletAddress') || '0x1234567890123456789012345678901234567890'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        toast.success(`Successfully claimed ${result.data.achievement.tokensEarned} tokens!`);
        loadData(); // Reload data to update UI
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to claim incentive');
      }
    } catch (error) {
      console.error('Failed to claim incentive:', error);
      toast.error('Failed to claim incentive');
    } finally {
      setClaiming(prev => ({ ...prev, [incentiveId]: false }));
    }
  };

  const filteredIncentives = selectedCategory === 'all' 
    ? incentives 
    : incentives.filter(incentive => incentive.category === selectedCategory);

  const isIncentiveClaimed = (incentiveId) => {
    if (!farmerData) return false;
    return farmerData.sustainability.achievements.some(
      achievement => achievement.incentiveId === incentiveId
    );
  };

  if (loading) {
    return (
      <IncentivesContainer>
        <LoadingSpinner>Loading sustainable incentives...</LoadingSpinner>
      </IncentivesContainer>
    );
  }

  return (
    <IncentivesContainer>
      <Header>
        <Title>
          <Leaf size={32} />
          Sustainable Incentives
        </Title>
      </Header>

      {farmerData && (
        <StatsGrid>
          <StatCard>
            <StatHeader>
              <StatIcon category="sustainability">
                <Leaf size={20} />
              </StatIcon>
              <StatTitle>Sustainability Score</StatTitle>
            </StatHeader>
            <StatValue>{farmerData.sustainability.overallScore}</StatValue>
            <StatSubtext>Out of 100</StatSubtext>
          </StatCard>

          <StatCard>
            <StatHeader>
              <StatIcon category="tokens">
                <Coins size={20} />
              </StatIcon>
              <StatTitle>Total Tokens</StatTitle>
            </StatHeader>
            <StatValue>{farmerData.sustainability.totalTokens.toLocaleString()}</StatValue>
            <StatSubtext>Earned rewards</StatSubtext>
          </StatCard>

          <StatCard>
            <StatHeader>
              <StatIcon category="carbon">
                <TreePine size={20} />
              </StatIcon>
              <StatTitle>Carbon Footprint</StatTitle>
            </StatHeader>
            <StatValue>{farmerData.sustainability.carbonFootprint}</StatValue>
            <StatSubtext>tons CO2 per acre</StatSubtext>
          </StatCard>

          <StatCard>
            <StatHeader>
              <StatIcon category="achievements">
                <Trophy size={20} />
              </StatIcon>
              <StatTitle>Achievements</StatTitle>
            </StatHeader>
            <StatValue>{farmerData.sustainability.achievements.length}</StatValue>
            <StatSubtext>Completed incentives</StatSubtext>
          </StatCard>
        </StatsGrid>
      )}

      <ContentGrid>
        <Section>
          <SectionTitle>
            <Target size={20} />
            Available Incentives
          </SectionTitle>
          
          <CategoryFilter>
            {categories.map(category => (
              <FilterButton
                key={category.id}
                active={selectedCategory === category.id}
                onClick={() => setSelectedCategory(category.id)}
              >
                <category.icon size={16} style={{ marginRight: '0.25rem' }} />
                {category.name}
              </FilterButton>
            ))}
          </CategoryFilter>

          {filteredIncentives.length === 0 ? (
            <EmptyState>
              <h3>No incentives found</h3>
              <p>Try selecting a different category.</p>
            </EmptyState>
          ) : (
            filteredIncentives.map(incentive => {
              const isClaimed = isIncentiveClaimed(incentive.id);
              return (
                <IncentiveCard key={incentive.id} claimed={isClaimed}>
                  <IncentiveHeader>
                    <IncentiveTitle>
                      {isClaimed && <CheckCircle size={16} color="#10b981" />}
                      {incentive.name}
                    </IncentiveTitle>
                    <TokenReward>
                      <Coins size={14} />
                      {incentive.tokenReward}
                    </TokenReward>
                  </IncentiveHeader>
                  
                  <IncentiveDescription>{incentive.description}</IncentiveDescription>
                  
                  <RequirementsList>
                    {incentive.requirements.map((requirement, index) => (
                      <RequirementItem key={index}>{requirement}</RequirementItem>
                    ))}
                  </RequirementsList>
                  
                  <ClaimButton
                    claimed={isClaimed}
                    disabled={isClaimed || claiming[incentive.id]}
                    onClick={() => handleClaimIncentive(incentive.id)}
                  >
                    {isClaimed ? (
                      <>
                        <CheckCircle size={16} />
                        Claimed
                      </>
                    ) : claiming[incentive.id] ? (
                      <>
                        <Clock size={16} />
                        Claiming...
                      </>
                    ) : (
                      <>
                        <Zap size={16} />
                        Claim Reward
                      </>
                    )}
                  </ClaimButton>
                </IncentiveCard>
              );
            })
          )}
        </Section>

        <Section>
          <SectionTitle>
            <Trophy size={20} />
            Sustainability Leaderboard
          </SectionTitle>
          
          <LeaderboardTable>
            <Table>
              <thead>
                <tr>
                  <TableHeader>Rank</TableHeader>
                  <TableHeader>Farmer</TableHeader>
                  <TableHeader>Farm</TableHeader>
                  <TableHeader>Score</TableHeader>
                  <TableHeader>Tokens</TableHeader>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((farmer, index) => (
                  <TableRow key={farmer.id}>
                    <RankCell rank={index + 1}>
                      {index < 3 && <Trophy size={14} style={{ marginRight: '0.25rem' }} />}
                      #{index + 1}
                    </RankCell>
                    <TableCell>{farmer.name}</TableCell>
                    <TableCell>{farmer.farmName}</TableCell>
                    <ScoreCell score={farmer.sustainabilityScore}>
                      {farmer.sustainabilityScore}
                    </ScoreCell>
                    <TableCell>{farmer.totalTokens.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </tbody>
            </Table>
          </LeaderboardTable>
        </Section>
      </ContentGrid>
    </IncentivesContainer>
  );
};

export default SustainableIncentives;
