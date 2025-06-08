export interface GoogleAuthRequest {
    idToken: string;
    provider: 'google';
  }
  
  export interface SessionData {
    nonce: string;
    clientSWA: string;
    sessionPk: string;
    maxPriorityFeePerGas: string;
    maxFeePerGas: string;
    paymaster: string;
    paymasterData: string;
  }
  
  export interface AuthResponse {
    authData: {
      idToken: string;
      provider: string;
    };
    sessionData: SessionData;
    sessionPkClientSignature: string;
    sessionDataUserSignature: string;
  }
  
  export interface SessionConfig {
    sessionPrivKey: string;
    sessionPubkey: string;
    userSWA: string;
  }
  
  export interface OktoAuthToken {
    type: string;
    data: {
      expire_at: number;
      session_pub_key: string;
    };
    data_signature: string;
  }
  
  export interface SessionVerificationResponse {
    status: 'success' | 'failed';
    data: {
      user_id: string;
      vendor_id: string;
      user_swa: string;
      vendor_swa: string;
      is_session_added: boolean;
      sign_auth_relayer_user_ops: string;
    };
  }
  
  export interface Chain {
    caip_id: string;
    network_name: string;
    chain_id: string;
    logo: string;
    sponsorship_enabled: boolean;
    gsn_enabled: boolean;
    type: 'EVM' | 'SVM';
    network_id: string;
    onramp_enabled: boolean;
    whitelisted: boolean;
  }
  
  export interface TokenTransferData {
    caip2Id: string;
    recipient: string;
    token: string;
    amount: number;
  }
  
  export interface UserOperation {
    sender: string;
    nonce: string;
    paymaster: string;
    callGasLimit: string;
    verificationGasLimit: string;
    preVerificationGas: string;
    maxFeePerGas: string;
    maxPriorityFeePerGas: string;
    paymasterPostOpGasLimit: string;
    paymasterVerificationGasLimit: string;
    callData: string;
    paymasterData: string;
    signature?: string;
  }
  
  export interface GasPriceResponse {
    maxFeePerGas: string;
    maxPriorityFeePerGas: string;
  }
  
  export interface OrderHistoryResponse {
    status: string;
    data: {
      order_id: string;
      network_name: string;
      order_type: string;
      status: string;
      transaction_hash?: string;
      failure_reason?: string;
    };
  }
  
  export interface Portfolio {
    total: number;
    tokens: PortfolioToken[];
  }
  
  export interface PortfolioToken {
    token_name: string;
    token_image: string;
    token_address: string;
    network_name: string;
    quantity: string;
    amount_in_inr: string;
  }
  
  export interface ApiResponse<T> {
    status: 'success' | 'error';
    data: T;
    message?: string;
  }
  
  export interface EmailOTPRequest {
    email: string;
    country_code?: string;
  }
  
  export interface EmailOTPResponse {
    token: string;
    email: string;
  }
  
  export interface VerifyEmailOTPRequest {
    email: string;
    otp: string;
    token: string;
  }