import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Wallet as WalletIcon, LogOut, Copy, Check } from 'lucide-react';
import blockchainService from '../services/blockchain';

const WalletContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const ConnectButton = styled.button`
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

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const WalletInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  color: white;
`;

const Address = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
`;

const CopyButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background-color 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const DisconnectButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const Balance = styled.div`
  font-size: 0.9rem;
  opacity: 0.8;
`;

const Status = styled.div`
  font-size: 0.8rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  background: ${props => props.connected ? '#10b981' : '#ef4444'};
  color: white;
`;

const Wallet = ({ onConnect, onDisconnect }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState('0');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    const walletAddress = localStorage.getItem('walletAddress');
    if (walletAddress && blockchainService.isConnected) {
      setAddress(walletAddress);
      setIsConnected(true);
      await updateBalance();
      if (onConnect) onConnect(walletAddress);
    }
  };

  const updateBalance = async () => {
    try {
      const balance = await blockchainService.getBalance();
      setBalance(parseFloat(balance).toFixed(4));
    } catch (error) {
      console.error('Failed to get balance:', error);
    }
  };

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      const result = await blockchainService.connect();
      if (result.success) {
        setAddress(result.address);
        setIsConnected(true);
        await updateBalance();
        if (onConnect) onConnect(result.address);
      } else {
        alert(`Failed to connect wallet: ${result.error}`);
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
      alert(`Failed to connect wallet: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    blockchainService.disconnect();
    setAddress('');
    setIsConnected(false);
    setBalance('0');
    if (onDisconnect) onDisconnect();
  };

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy address:', error);
    }
  };

  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (!isConnected) {
    return (
      <WalletContainer>
        <ConnectButton onClick={handleConnect} disabled={isLoading}>
          <WalletIcon size={20} />
          {isLoading ? 'Connecting...' : 'Connect Wallet'}
        </ConnectButton>
        <Status connected={false}>Disconnected</Status>
      </WalletContainer>
    );
  }

  return (
    <WalletContainer>
      <WalletInfo>
        <Status connected={true}>Connected</Status>
        <Address>
          {formatAddress(address)}
          <CopyButton onClick={copyAddress}>
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </CopyButton>
        </Address>
        <Balance>{balance} ETH</Balance>
      </WalletInfo>
      <DisconnectButton onClick={handleDisconnect}>
        <LogOut size={16} />
        Disconnect
      </DisconnectButton>
    </WalletContainer>
  );
};

export default Wallet;
