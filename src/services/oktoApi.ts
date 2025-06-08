import axios, { type AxiosInstance } from 'axios';
import type {
    SessionVerificationResponse,
    Chain,
    TokenTransferData,
    GasPriceResponse,
    OrderHistoryResponse,
    Portfolio,
    EmailOTPRequest,
    EmailOTPResponse,
    VerifyEmailOTPRequest,
    SessionConfig
} from '../types/okto';

class OktoApiService {
  private api: AxiosInstance;
  private authToken: string | null = null;
  private sessionConfig: SessionConfig | null = null;
  private isDemoMode: boolean = true; // Enable demo mode for now

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_OKTO_API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.api.interceptors.request.use((config) => {
      if (this.authToken) {
        config.headers.Authorization = `Bearer ${this.authToken}`;
      }
      return config;
    });

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error.response?.data || error.message);
        throw error;
      }
    );
  }

  setAuthToken(token: string) {
    this.authToken = token;
  }

  clearAuthToken() {
    this.authToken = null;
    this.sessionConfig = null;
  }

  setSessionConfig(config: SessionConfig) {
    this.sessionConfig = config;
  }

  getSessionConfig(): SessionConfig | null {
    return this.sessionConfig;
  }

  // Demo mode simulation helpers
  private async simulateDelay(ms: number = 1000) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private generateMockAuthToken(): string {
    return `mock_auth_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateMockSessionConfig(): SessionConfig {
    return {
      sessionPrivKey: `0x${Math.random().toString(16).substr(2, 64)}`,
      sessionPubkey: `0x04${Math.random().toString(16).substr(2, 128)}`,
      userSWA: `0x${Math.random().toString(16).substr(2, 40)}`,
    };
  }

  // Authentication Methods
  async authenticateWithGoogle(_idToken: string): Promise<string> {
    if (this.isDemoMode) {
      await this.simulateDelay(1500);
      
      // Simulate Google OAuth success
      const authToken = this.generateMockAuthToken();
      const sessionConfig = this.generateMockSessionConfig();
      
      this.setAuthToken(authToken);
      this.setSessionConfig(sessionConfig);
      
      console.log('Demo: Google authentication successful', {
        authToken: authToken.substr(0, 20) + '...',
        sessionConfig
      });
      
      return authToken;
    }

    try {

      // Real API call (currently commented out due to 404)
      // const response = await this.api.post('/api/v1/authenticate/google', payload);
      // return response.data.authToken;
      
      throw new Error('Real API integration not available in demo mode');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Google authentication failed');
    }
  }

  async sendEmailOTP(email: string): Promise<EmailOTPResponse> {
    if (this.isDemoMode) {
      await this.simulateDelay(1000);
      
      const response: EmailOTPResponse = {
        token: `email_session_${Date.now()}`,
        email: email
      };
      
      console.log('Demo: Email OTP sent', response);
      return response;
    }

    try {
      const payload: EmailOTPRequest = { email };
      const response = await this.api.post('/api/v1/authenticate/email', payload);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to send OTP');
    }
  }

  async verifyEmailOTP(email: string, otp: string, token: string): Promise<string> {
    if (this.isDemoMode) {
      await this.simulateDelay(1500);
      
      // Simulate OTP verification
      if (otp.length !== 6) {
        throw new Error('Invalid OTP format');
      }
      
      // Accept any 6-digit OTP in demo mode
      const authToken = this.generateMockAuthToken();
      const sessionConfig = this.generateMockSessionConfig();
      
      this.setAuthToken(authToken);
      this.setSessionConfig(sessionConfig);
      
      console.log('Demo: Email OTP verified', {
        email,
        authToken: authToken.substr(0, 20) + '...',
        sessionConfig
      });
      
      return authToken;
    }

    try {
      const payload: VerifyEmailOTPRequest = { email, otp, token };
      const response = await this.api.post('/api/v1/authenticate/email/verify', payload);
      return response.data.authToken;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'OTP verification failed');
    }
  }

  // Session Management
  async verifySession(): Promise<SessionVerificationResponse> {
    if (this.isDemoMode) {
      await this.simulateDelay(500);
      
      if (!this.authToken) {
        throw new Error('No auth token available');
      }
      
      const response: SessionVerificationResponse = {
        status: 'success',
        data: {
          user_id: `user_${Math.random().toString(36).substr(2, 9)}`,
          vendor_id: `vendor_${Math.random().toString(36).substr(2, 9)}`,
          user_swa: this.sessionConfig?.userSWA || `0x${Math.random().toString(16).substr(2, 40)}`,
          vendor_swa: import.meta.env.VITE_OKTO_CLIENT_SWA || `0x${Math.random().toString(16).substr(2, 40)}`,
          is_session_added: true,
          sign_auth_relayer_user_ops: 'enabled'
        }
      };
      
      console.log('Demo: Session verified', response);
      return response;
    }

    const response = await this.api.get('/api/oc/v1/verify-session');
    return response.data;
  }

  async logout(): Promise<void> {
    if (this.isDemoMode) {
      await this.simulateDelay(300);
      this.clearAuthToken();
      console.log('Demo: Logged out successfully');
      return;
    }

    try {
      await this.api.post('/api/v1/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearAuthToken();
    }
  }

  // Chain and Network Information
  async getChains(): Promise<Chain[]> {
    if (this.isDemoMode) {
      await this.simulateDelay(800);
      return this.getMockChains();
    }

    const response = await this.api.get('/api/v1/supported/networks');
    return response.data.networks || [];
  }

  async getSupportedTokens(): Promise<any[]> {
    if (this.isDemoMode) {
      await this.simulateDelay(600);
      return [
        {
          token_name: 'USD Coin',
          token_symbol: 'USDC',
          token_address: '0xa0b86a33e6b95b37e3d8d8e5e8f8c8a8a8a8a8a8',
          network_name: 'BASE_TESTNET',
          decimals: 6
        },
        {
          token_name: 'Wrapped Ethereum',
          token_symbol: 'WETH',
          token_address: '0x4200000000000000000000000000000000000006',
          network_name: 'BASE_TESTNET',
          decimals: 18
        }
      ];
    }

    const response = await this.api.get('/api/v1/supported/tokens');
    return response.data.tokens || [];
  }

  // Portfolio Management
  async getPortfolio(): Promise<Portfolio> {
    if (this.isDemoMode) {
      await this.simulateDelay(1000);
      return this.getMockPortfolio();
    }

    const response = await this.api.get('/api/v1/portfolio');
    return response.data;
  }

  async getWallets(): Promise<any[]> {
    if (this.isDemoMode) {
      await this.simulateDelay(700);
      return this.getMockWallets();
    }

    const response = await this.api.get('/api/v1/wallet');
    return response.data.wallets || [];
  }

  async createWallet(): Promise<any[]> {
    if (this.isDemoMode) {
      await this.simulateDelay(2000);
      console.log('Demo: Creating new wallet...');
      return this.getMockWallets();
    }

    const response = await this.api.post('/api/v1/wallet');
    return response.data.wallets || [];
  }

  // Gas Price Information
  async getUserOperationGasPrice(): Promise<GasPriceResponse> {
    if (this.isDemoMode) {
      await this.simulateDelay(400);
      
      return {
        maxFeePerGas: '0x77359400', // 2000000000 wei
        maxPriorityFeePerGas: '0x77359400' // 2000000000 wei
      };
    }

    const response = await this.api.get('/api/v1/gas-price');
    return response.data;
  }

  // Token Transfer - Demo Implementation
  async transferTokens(data: TokenTransferData): Promise<{ jobId: string }> {
    if (this.isDemoMode) {
      await this.simulateDelay(2000);
      
      if (!this.sessionConfig) {
        throw new Error('Session not configured. Please authenticate first.');
      }

      // Simulate transfer validation
      if (!data.caip2Id || !data.recipient || data.amount <= 0) {
        throw new Error('Invalid transfer parameters');
      }

      const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      console.log('Demo: Token transfer initiated', {
        jobId,
        data,
        sessionConfig: this.sessionConfig
      });
      
      return { jobId };
    }

    try {
      // In real implementation, this would involve complex UserOp construction
      // as shown in the tokenTransfer.ts template
      const payload = {
        network_name: data.caip2Id,
        token_address: data.token,
        quantity: data.amount.toString(),
        recipient_address: data.recipient,
        session_config: this.sessionConfig
      };

      const response = await this.api.post('/api/v1/transfer/tokens/execute', payload);
      return { jobId: response.data.job_id };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Token transfer failed');
    }
  }

  // Order Status Tracking
  async getOrderStatus(jobId: string): Promise<OrderHistoryResponse> {
    if (this.isDemoMode) {
      await this.simulateDelay(1000);
      
      // Simulate different status responses
      const statuses = ['PENDING', 'PROCESSING', 'SUCCESS', 'FAILED'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      
      const response: OrderHistoryResponse = {
        status: 'success',
        data: {
          order_id: jobId,
          network_name: 'BASE_TESTNET',
          order_type: 'TOKEN_TRANSFER',
          status: randomStatus,
          transaction_hash: randomStatus === 'SUCCESS' ? `0x${Math.random().toString(16).substr(2, 64)}` : undefined,
          failure_reason: randomStatus === 'FAILED' ? 'Insufficient balance' : undefined
        }
      };
      
      console.log('Demo: Order status checked', response);
      return response;
    }

    const response = await this.api.get(`/api/v1/order/status?order_id=${jobId}`);
    return response.data;
  }

  async getOrderHistory(orderId: string, orderType: string = 'TOKEN_TRANSFER'): Promise<any> {
    if (this.isDemoMode) {
      await this.simulateDelay(800);
      
      return {
        status: 'success',
        data: {
          order_id: orderId,
          order_type: orderType,
          status: 'SUCCESS',
          created_at: new Date().toISOString(),
          transaction_hash: `0x${Math.random().toString(16).substr(2, 64)}`
        }
      };
    }

    const response = await this.api.get(`/api/v1/order/history?order_id=${orderId}&order_type=${orderType}`);
    return response.data;
  }

  // Mock data methods
  async getMockPortfolio(): Promise<Portfolio> {
    return {
      total: 1234.56,
      tokens: [
        {
          token_name: 'Ethereum',
          token_image: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
          token_address: '',
          network_name: 'BASE_TESTNET',
          quantity: '0.5',
          amount_in_inr: '₹89,234.50'
        },
        {
          token_name: 'USD Coin',
          token_image: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
          token_address: '0xa0b86a33e6b95b37e3d8d8e5e8f8c8a8a8a8a8a8',
          network_name: 'BASE_TESTNET',
          quantity: '1000',
          amount_in_inr: '₹83,450.00'
        },
        {
          token_name: 'Solana',
          token_image: 'https://cryptologos.cc/logos/solana-sol-logo.png',
          token_address: '',
          network_name: 'SOLANA_DEVNET',
          quantity: '2.5',
          amount_in_inr: '₹12,890.25'
        }
      ]
    };
  }

  async getMockWallets(): Promise<any[]> {
    return [
      {
        account_id: 'acc_base_testnet',
        address: '0x742d35Cc6639C0532fEb2C6F29C55E3d8E2b9f2A',
        network_name: 'BASE_TESTNET',
        network_id: '84532',
        success: true
      },
      {
        account_id: 'acc_solana_devnet',
        address: 'DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK',
        network_name: 'SOLANA_DEVNET',
        network_id: '103',
        success: true
      },
      {
        account_id: 'acc_base_mainnet',
        address: '0x742d35Cc6639C0532fEb2C6F29C55E3d8E2b9f2A',
        network_name: 'BASE',
        network_id: '8453',
        success: true
      }
    ];
  }

  async getMockChains(): Promise<Chain[]> {
    return [
      {
        caip_id: 'eip155:84532',
        network_name: 'BASE_TESTNET',
        chain_id: '84532',
        logo: 'BASE_TESTNET',
        sponsorship_enabled: true,
        gsn_enabled: false,
        type: 'EVM',
        network_id: '8970cafe-4fc2-3a71-a7d3-77a672b749e9',
        onramp_enabled: false,
        whitelisted: true
      },
      {
        caip_id: 'eip155:8453',
        network_name: 'BASE',
        chain_id: '8453',
        logo: 'BASE',
        sponsorship_enabled: false,
        gsn_enabled: false,
        type: 'EVM',
        network_id: '9400de12-efc6-3e69-ab02-0eaf5aaf21e5',
        onramp_enabled: false,
        whitelisted: true
      },
      {
        caip_id: 'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1',
        network_name: 'SOLANA_DEVNET',
        chain_id: '103',
        logo: 'SOL DEVNET',
        sponsorship_enabled: false,
        gsn_enabled: false,
        type: 'SVM',
        network_id: 'fb10a9ca-d197-378d-8fb3-fd95345571f3',
        onramp_enabled: false,
        whitelisted: true
      }
    ];
  }

  // Method to switch between demo and real API mode
  setDemoMode(enabled: boolean) {
    this.isDemoMode = enabled;
    console.log(`Demo mode ${enabled ? 'enabled' : 'disabled'}`);
  }

  isDemoModeEnabled(): boolean {
    return this.isDemoMode;
  }
}

export const oktoApi = new OktoApiService();
export default oktoApi;