import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import TokenTransfer from './TokenTransfer';
import oktoApi from '../../services/oktoApi';
import type { Portfolio } from '../../types/okto';

type ActiveTab = 'portfolio' | 'transfer' | 'wallets';

const Dashboard: React.FC = () => {
  const { user, logout, isDemoMode, setDemoMode } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('portfolio');
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [wallets, setWallets] = useState<any[]>([]);
  const [chains, setChains] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError('');

      console.log('Loading dashboard data...');
      
      // Use the API service which will automatically use demo or real mode
      const [portfolioData, walletsData, chainsData] = await Promise.all([
        oktoApi.getMockPortfolio(), // Always use mock for demo
        oktoApi.getMockWallets(),
        oktoApi.getMockChains(),
      ]);

      setPortfolio(portfolioData);
      setWallets(walletsData);
      setChains(chainsData);
      
      console.log('Dashboard data loaded successfully');
    } catch (error: any) {
      console.error('Failed to load dashboard data:', error);
      setError('Failed to load dashboard data. Please try refreshing the page.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleDemoMode = () => {
    setDemoMode(!isDemoMode);
  };

  const tabConfig = [
    { id: 'portfolio', label: 'Portfolio', icon: '📊' },
    { id: 'transfer', label: 'Transfer', icon: '💸' },
    { id: 'wallets', label: 'Wallets', icon: '👛' },
  ] as const;

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-content">
          <div className="loading-spinner-large"></div>
          <p>Loading your Okto dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-container">
          <div className="header-left">
            <div className="header-logo">
              <div className="logo-icon">
                <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                  <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
              </div>
              <div className="logo-text">
                <span className="logo-title">Okto</span>
                <span className="logo-badge">Demo</span>
              </div>
            </div>
          </div>

          <div className="header-right">
            {/* Demo Mode Indicator */}
            {isDemoMode && (
              <div className="demo-indicator">
                <div className="demo-status">
                  <div className="demo-dot"></div>
                  <span>Demo Mode</span>
                </div>
                <button onClick={toggleDemoMode} className="demo-toggle" title="Click to toggle demo mode">
                  <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            )}

            {/* Portfolio Balance */}
            {portfolio && (
              <div className="portfolio-balance">
                <p className="balance-label">Total Portfolio</p>
                <p className="balance-value">
                  ₹{portfolio.total.toLocaleString('en-IN', { 
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2 
                  })}
                </p>
              </div>
            )}

            {/* User Menu */}
            <div className="user-menu">
              <div className="user-info">
                <div className="user-avatar">
                  <span>{user?.user_swa?.slice(2, 4).toUpperCase() || 'OK'}</span>
                </div>
                <div className="user-details">
                  <p className="user-address">
                    {user?.user_swa ? `${user.user_swa.slice(0, 6)}...${user.user_swa.slice(-4)}` : 'Connected'}
                  </p>
                  <p className="user-label">Okto Wallet</p>
                </div>
              </div>
              
              <button onClick={handleLogout} className="logout-btn">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Demo Mode Notice */}
        {isDemoMode && (
          <div className="demo-notice">
            <div className="demo-notice-content">
              <svg className="demo-notice-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="demo-notice-title">Demo Mode Active</p>
                <p className="demo-notice-text">
                  You're using simulated data. All transactions and API calls are mocked for demonstration purposes.
                  <button onClick={toggleDemoMode} className="demo-notice-link">Switch to API mode</button>
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="error-banner">
            <div className="error-content">
              <svg className="error-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <p>{error}</p>
                <button onClick={loadDashboardData} className="retry-btn">
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="tab-navigation">
          <nav className="tab-nav">
            {tabConfig.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ActiveTab)}
                className={`tab-btn ${activeTab === tab.id ? 'tab-btn-active' : ''}`}
              >
                <span className="tab-icon">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'portfolio' && (
            <div className="portfolio-content">
              {/* Portfolio Overview */}
              <div className="card">
                <h2 className="card-title">Portfolio Overview</h2>
                
                {portfolio && (
                  <div className="portfolio-stats">
                    <div className="stat-card stat-primary">
                      <div className="stat-value">
                        ₹{portfolio.total.toLocaleString('en-IN', { 
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2 
                        })}
                      </div>
                      <p className="stat-label">Total Portfolio Value</p>
                    </div>
                    
                    <div className="stat-card stat-success">
                      <div className="stat-value">{portfolio.tokens.length}</div>
                      <p className="stat-label">Token Holdings</p>
                    </div>
                    
                    <div className="stat-card stat-purple">
                      <div className="stat-value">{chains.length}</div>
                      <p className="stat-label">Networks Supported</p>
                    </div>
                  </div>
                )}

                {/* Token Holdings */}
                {portfolio && portfolio.tokens.length > 0 && (
                  <div className="token-holdings">
                    <h3 className="section-title">Token Holdings</h3>
                    <div className="token-grid">
                      {portfolio.tokens.map((token, index) => (
                        <div key={index} className="token-card">
                          <div className="token-header">
                            {token.token_image && (
                              <img 
                                className="token-image" 
                                src={token.token_image} 
                                alt={token.token_name}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            )}
                            <div className="token-info">
                              <div className="token-name">{token.token_name}</div>
                              <div className="token-network">{token.network_name}</div>
                            </div>
                          </div>
                          <div className="token-balance">
                            <div className="balance-amount">
                              {Number(token.quantity).toLocaleString()}
                            </div>
                            <div className="balance-value">
                              {token.amount_in_inr}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {portfolio && portfolio.tokens.length === 0 && (
                  <div className="empty-state">
                    <svg className="empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <h3 className="empty-title">No tokens found</h3>
                    <p className="empty-text">
                      Your portfolio is empty. Start by receiving some tokens or making your first transfer.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'transfer' && <TokenTransfer />}

          {activeTab === 'wallets' && (
            <div className="wallets-content">
              <div className="card">
                <h2 className="card-title">Your Wallets</h2>
                
                <div className="wallet-grid">
                  {wallets.map((wallet) => (
                    <div key={wallet.account_id} className="wallet-card">
                      <div className="wallet-header">
                        <h3 className="wallet-name">{wallet.network_name}</h3>
                        <div className={`wallet-status ${wallet.success ? 'status-success' : 'status-error'}`}></div>
                      </div>
                      
                      <div className="wallet-details">
                        <div className="wallet-field">
                          <p className="field-label">Address</p>
                          <p className="field-value wallet-address">{wallet.address}</p>
                        </div>
                        
                        <div className="wallet-field">
                          <p className="field-label">Network ID</p>
                          <p className="field-value">{wallet.network_id}</p>
                        </div>
                      </div>
                      
                      <div className="wallet-actions">
                        <button className="btn-small btn-primary">Copy Address</button>
                        <button className="btn-small btn-secondary">View Explorer</button>
                      </div>
                    </div>
                  ))}
                </div>

                {wallets.length === 0 && (
                  <div className="empty-state">
                    <svg className="empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    <h3 className="empty-title">No wallets found</h3>
                    <p className="empty-text">
                      Create your first wallet to start using Okto.
                    </p>
                    <button className="btn btn-primary">Create Wallet</button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;