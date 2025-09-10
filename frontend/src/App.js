import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Wallet from './components/Wallet';
import Marketplace from './components/Marketplace';
import Provenance from './components/Provenance';
import AIAnalysis from './components/AIAnalysis';
import SustainableIncentives from './components/SustainableIncentives';
import blockchainService from './services/blockchain';

const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow-x: hidden;
`;

const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1rem 2rem;
`;

const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`;

const LogoIcon = styled.div`
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
`;

const NavLinks = styled.div`
  display: flex;
  gap: 2rem;
  align-items: center;

  @media (max-width: 768px) {
    display: none;
  }
`;

const NavLink = styled.a`
  color: white;
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  opacity: ${props => props.active ? 1 : 0.8};

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    opacity: 1;
  }
`;

const Main = styled.main`
  min-height: calc(100vh - 80px);
`;

const WelcomeSection = styled.section`
  padding: 4rem 2rem;
  text-align: center;
  color: white;
  max-width: 800px;
  margin: 0 auto;
`;

const WelcomeTitle = styled.h1`
  font-size: 3.5rem;
  font-weight: 700;
  margin: 0 0 1.5rem 0;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  background: linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const WelcomeSubtitle = styled.p`
  font-size: 1.25rem;
  margin: 0 0 2rem 0;
  opacity: 0.9;
  line-height: 1.6;
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
`;

const FeatureCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    background: rgba(255, 255, 255, 0.15);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  }
`;

const FeatureIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const FeatureTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
`;

const FeatureDescription = styled.p`
  opacity: 0.8;
  line-height: 1.5;
  margin: 0;
`;

const MobileMenu = styled.div`
  display: none;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.2);

  @media (max-width: 768px) {
    display: flex;
  }
`;

const MobileNavLink = styled.a`
  color: white;
  text-decoration: none;
  font-weight: 500;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  opacity: ${props => props.active ? 1 : 0.8};

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    opacity: 1;
  }
`;

// Main App Content Component
function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [walletAddress, setWalletAddress] = useState('');

  useEffect(() => {
    // Check if wallet is already connected
    const storedAddress = localStorage.getItem('walletAddress');
    if (storedAddress && blockchainService.isConnected) {
      setWalletAddress(storedAddress);
    }
  }, []);

  const handleWalletConnect = (address) => {
    setWalletAddress(address);
  };

  const handleWalletDisconnect = () => {
    setWalletAddress('');
  };

  const isActivePath = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const handleFeatureClick = (feature) => {
    switch (feature) {
      case 'ai':
        navigate('/ai-analysis');
        break;
      case 'provenance':
        navigate('/provenance');
        break;
      case 'marketplace':
        navigate('/marketplace');
        break;
      case 'incentives':
        navigate('/incentives');
        break;
      default:
        break;
    }
  };

  return (
    <AppContainer>
      <Header>
        <Nav>
          <Logo onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <LogoIcon>🌾</LogoIcon>
            FarmMate
          </Logo>
          
          <NavLinks>
            <NavLink 
              href="#" 
              active={isActivePath('/')} 
              onClick={(e) => { e.preventDefault(); navigate('/'); }}
            >
              Home
            </NavLink>
            <NavLink 
              href="#" 
              active={isActivePath('/marketplace')} 
              onClick={(e) => { e.preventDefault(); navigate('/marketplace'); }}
            >
              Marketplace
            </NavLink>
            <NavLink 
              href="#" 
              active={isActivePath('/provenance')} 
              onClick={(e) => { e.preventDefault(); navigate('/provenance'); }}
            >
              Provenance
            </NavLink>
            <NavLink 
              href="#" 
              active={isActivePath('/ai-analysis')} 
              onClick={(e) => { e.preventDefault(); navigate('/ai-analysis'); }}
            >
              AI Analysis
            </NavLink>
            <NavLink 
              href="#" 
              active={isActivePath('/incentives')} 
              onClick={(e) => { e.preventDefault(); navigate('/incentives'); }}
            >
              Incentives
            </NavLink>
          </NavLinks>

          <Wallet 
            onConnect={handleWalletConnect}
            onDisconnect={handleWalletDisconnect}
          />
        </Nav>

        <MobileMenu>
          <MobileNavLink 
            href="#" 
            active={isActivePath('/')} 
            onClick={(e) => { e.preventDefault(); navigate('/'); }}
          >
            Home
          </MobileNavLink>
          <MobileNavLink 
            href="#" 
            active={isActivePath('/marketplace')} 
            onClick={(e) => { e.preventDefault(); navigate('/marketplace'); }}
          >
            Marketplace
          </MobileNavLink>
          <MobileNavLink 
            href="#" 
            active={isActivePath('/provenance')} 
            onClick={(e) => { e.preventDefault(); navigate('/provenance'); }}
          >
            Provenance
          </MobileNavLink>
          <MobileNavLink 
            href="#" 
            active={isActivePath('/ai-analysis')} 
            onClick={(e) => { e.preventDefault(); navigate('/ai-analysis'); }}
          >
            AI Analysis
          </MobileNavLink>
          <MobileNavLink 
            href="#" 
            active={isActivePath('/incentives')} 
            onClick={(e) => { e.preventDefault(); navigate('/incentives'); }}
          >
            Incentives
          </MobileNavLink>
        </MobileMenu>
      </Header>

      <Main>
        <Routes>
          <Route path="/" element={
            <WelcomeSection>
              <WelcomeTitle>Welcome to FarmMate</WelcomeTitle>
              <WelcomeSubtitle>
                The decentralized precision agriculture marketplace connecting farmers, 
                buyers, and AI-powered insights for sustainable farming.
              </WelcomeSubtitle>
              
              <FeatureGrid>
                <FeatureCard onClick={() => handleFeatureClick('ai')}>
                  <FeatureIcon>🤖</FeatureIcon>
                  <FeatureTitle>AI-Powered Analysis</FeatureTitle>
                  <FeatureDescription>
                    On-device disease detection and quality scoring using advanced machine learning models.
                  </FeatureDescription>
                </FeatureCard>
                
                <FeatureCard onClick={() => handleFeatureClick('provenance')}>
                  <FeatureIcon>⛓️</FeatureIcon>
                  <FeatureTitle>Blockchain Provenance</FeatureTitle>
                  <FeatureDescription>
                    Immutable supply chain tracking from farm to table with full transparency.
                  </FeatureDescription>
                </FeatureCard>
                
                <FeatureCard onClick={() => handleFeatureClick('marketplace')}>
                  <FeatureIcon>💰</FeatureIcon>
                  <FeatureTitle>Fair Trade Marketplace</FeatureTitle>
                  <FeatureDescription>
                    Direct farmer-to-buyer transactions with escrow protection and fair pricing.
                  </FeatureDescription>
                </FeatureCard>
                
                <FeatureCard onClick={() => handleFeatureClick('incentives')}>
                  <FeatureIcon>🌱</FeatureIcon>
                  <FeatureTitle>Sustainable Incentives</FeatureTitle>
                  <FeatureDescription>
                    Token rewards for verified data and sustainable farming practices.
                  </FeatureDescription>
                </FeatureCard>
              </FeatureGrid>
            </WelcomeSection>
          } />
          
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/provenance" element={<Provenance />} />
          <Route path="/ai-analysis" element={<AIAnalysis />} />
          <Route path="/incentives" element={<SustainableIncentives />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Main>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </AppContainer>
  );
}

// Main App Component with Router
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
