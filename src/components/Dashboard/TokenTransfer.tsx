// src/components/Dashboard/TokenTransfer.tsx

import React, { useState, useEffect } from 'react';
import oktoApi from '../../services/oktoApi';
import type { Chain, TokenTransferData, Portfolio } from '../../types/okto';

interface TransferFormData {
  caip2Id: string;
  token: string;
  amount: string;
  recipient: string;
}

const TokenTransfer: React.FC = () => {
  const [chains, setChains] = useState<Chain[]>([]);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [wallets, setWallets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [transferStatus, setTransferStatus] = useState<{
    jobId?: string;
    status?: string;
    message?: string;
    type: 'success' | 'error' | 'info' | null;
  }>({ type: null });

  const [formData, setFormData] = useState<TransferFormData>({
    caip2Id: '',
    token: '',
    amount: '',
    recipient: '',
  });

  const [formErrors, setFormErrors] = useState<Partial<TransferFormData>>({});

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      
      // Use mock data for demo purposes
      const [chainsData, portfolioData, walletsData] = await Promise.all([
        oktoApi.getMockChains(),
        oktoApi.getMockPortfolio(),
        oktoApi.getMockWallets(),
      ]);

      setChains(chainsData);
      setPortfolio(portfolioData);
      setWallets(walletsData);

      // Set default chain if available
      if (chainsData.length > 0) {
        setFormData(prev => ({
          ...prev,
          caip2Id: chainsData[0].caip_id,
        }));
      }
    } catch (error) {
      console.error('Failed to load initial data:', error);
      setTransferStatus({
        type: 'error',
        message: 'Failed to load wallet data. Please refresh the page.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<TransferFormData> = {};

    if (!formData.caip2Id) {
      errors.caip2Id = 'Please select a network';
    }

    if (!formData.recipient) {
      errors.recipient = 'Recipient address is required';
    } else if (formData.recipient.length < 10) {
      errors.recipient = 'Invalid address format';
    }

    if (!formData.amount) {
      errors.amount = 'Amount is required';
    } else if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      errors.amount = 'Amount must be a positive number';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      setTransferStatus({ type: null });

      const transferData: TokenTransferData = {
        caip2Id: formData.caip2Id,
        token: formData.token,
        amount: Number(formData.amount),
        recipient: formData.recipient,
      };

      console.log('Initiating transfer with data:', transferData);

      // For demo purposes, simulate the transfer process
      const response = await oktoApi.transferTokens(transferData);
      
      setTransferStatus({
        type: 'success',
        jobId: response.jobId,
        status: 'PENDING',
        message: `Transfer initiated successfully! Job ID: ${response.jobId}`,
      });

      // Reset form on success
      setFormData({
        caip2Id: formData.caip2Id, // Keep network selected
        token: '',
        amount: '',
        recipient: '',
      });

      // Poll for status updates (demo simulation)
      pollTransferStatus(response.jobId);

    } catch (error: any) {
      console.error('Transfer failed:', error);
      setTransferStatus({
        type: 'error',
        message: error.message || 'Transfer failed. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const pollTransferStatus = async (jobId: string) => {
    let attempts = 0;
    const maxAttempts = 5;
    const pollInterval = 3000; // 3 seconds

    const poll = async () => {
      try {
        const shouldSucceed = Math.random() > 0.3; // 70% success rate
        
        if (attempts >= 2 && shouldSucceed) {
          setTransferStatus({
            type: 'success',
            jobId,
            status: 'SUCCESS',
            message: `Transfer completed successfully! Transaction hash: 0x${Math.random().toString(16).substr(2, 64)}`,
          });
          return;
        } else if (attempts >= maxAttempts) {
          setTransferStatus({
            type: 'error',
            jobId,
            status: 'FAILED',
            message: 'Transfer failed: Network congestion. Please try again.',
          });
          return;
        }

        attempts++;
        setTransferStatus(prev => ({
          ...prev,
          message: `Transfer processing... (${attempts}/${maxAttempts})`,
        }));
        
        setTimeout(poll, pollInterval);
      } catch (error) {
        console.error('Failed to poll transfer status:', error);
      }
    };

    setTimeout(poll, pollInterval);
  };

  const getSelectedChain = () => {
    return chains.find(chain => chain.caip_id === formData.caip2Id);
  };

  const getSelectedWallet = () => {
    const selectedChain = getSelectedChain();
    if (!selectedChain) return null;
    
    return wallets.find(wallet => 
      wallet.network_name === selectedChain.network_name
    );
  };

  const getTokenBalance = () => {
    if (!portfolio || !formData.token) return '0';
    
    const token = portfolio.tokens.find(t => 
      t.token_address === formData.token && 
      t.network_name === getSelectedChain()?.network_name
    );
    
    return token ? token.quantity : '0';
  };

  if (isLoading && chains.length === 0) {
    return (
      <div className="card">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <span>Loading transfer interface...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="transfer-header">
        <h2 className="card-title">Token Transfer</h2>
        <p className="transfer-subtitle">
          Send tokens instantly using Okto's intent-based transfer system with automatic gas optimization
        </p>
      </div>

      {transferStatus.type && (
        <div className={`status-message status-${transferStatus.type}`}>
          <div className="status-content">
            <div className="status-icon">
              {transferStatus.type === 'success' ? (
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : transferStatus.type === 'error' ? (
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              ) : (
                <div className="loading-spinner-small"></div>
              )}
            </div>
            <div>
              <p className="status-message-text">{transferStatus.message}</p>
              {transferStatus.jobId && (
                <p className="status-job-id">Job ID: {transferStatus.jobId}</p>
              )}
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleTransfer} className="transfer-form">
        {/* Network Selection */}
        <div className="form-group">
          <label className="form-label">Network</label>
          <select
            value={formData.caip2Id}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              caip2Id: e.target.value,
              token: '' // Reset token when network changes
            }))}
            className="form-select"
            required
          >
            <option value="">Select Network</option>
            {chains.map((chain) => (
              <option key={chain.caip_id} value={chain.caip_id}>
                {chain.network_name} ({chain.type})
              </option>
            ))}
          </select>
          {formErrors.caip2Id && (
            <p className="form-error">{formErrors.caip2Id}</p>
          )}
          
          {getSelectedWallet() && (
            <div className="wallet-info">
              <p className="wallet-label">Your wallet address:</p>
              <p className="wallet-address">{getSelectedWallet()?.address}</p>
            </div>
          )}
        </div>

        {/* Token Selection */}
        <div className="form-group">
          <label className="form-label">Token</label>
          <select
            value={formData.token}
            onChange={(e) => setFormData(prev => ({ ...prev, token: e.target.value }))}
            className="form-select"
            disabled={!formData.caip2Id}
          >
            <option value="">Native Token</option>
            {portfolio?.tokens
              .filter(token => token.network_name === getSelectedChain()?.network_name)
              .map((token) => (
                <option key={token.token_address} value={token.token_address}>
                  {token.token_name} ({Number(token.quantity).toFixed(4)} available)
                </option>
              ))}
          </select>
          
          {formData.caip2Id && (
            <div className="token-balance-info">
              <span>Available: {getTokenBalance()}</span>
              {formData.token && (
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, amount: getTokenBalance() }))}
                  className="btn-link"
                >
                  Use Max
                </button>
              )}
            </div>
          )}
        </div>

        {/* Amount */}
        <div className="form-group">
          <label className="form-label">Amount</label>
          <input
            type="number"
            step="any"
            value={formData.amount}
            onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
            className="form-input"
            placeholder="0.0"
            required
          />
          {formErrors.amount && (
            <p className="form-error">{formErrors.amount}</p>
          )}
        </div>

        {/* Recipient Address */}
        <div className="form-group">
          <label className="form-label">Recipient Address</label>
          <input
            type="text"
            value={formData.recipient}
            onChange={(e) => setFormData(prev => ({ ...prev, recipient: e.target.value }))}
            className="form-input address-input"
            placeholder="0x... or wallet address"
            required
          />
          {formErrors.recipient && (
            <p className="form-error">{formErrors.recipient}</p>
          )}
        </div>

        {/* Transfer Summary */}
        {formData.caip2Id && formData.amount && formData.recipient && (
          <div className="transfer-summary">
            <h4 className="summary-title">Transfer Summary</h4>
            <div className="summary-details">
              <div className="summary-row">
                <span>Network:</span>
                <span className="summary-value">{getSelectedChain()?.network_name}</span>
              </div>
              <div className="summary-row">
                <span>Amount:</span>
                <span className="summary-value">{formData.amount} {formData.token ? 'tokens' : 'native'}</span>
              </div>
              <div className="summary-row">
                <span>Gas Fee:</span>
                <span className="summary-value sponsored">Sponsored by Okto</span>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className={`btn btn-large ${isLoading ? 'btn-disabled' : 'btn-primary'}`}
        >
          {isLoading ? (
            <div className="btn-loading">
              <div className="loading-spinner-small"></div>
              Processing Transfer...
            </div>
          ) : (
            'Send Transfer'
          )}
        </button>
      </form>
    </div>
  );
};

export default TokenTransfer;