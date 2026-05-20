// Application state types

export interface WalletState {
  keystoreJson: string;
  password: string;
  address: string;
  derivationPath: string;
  balance: string;
  network: string;
}

export interface TransactionState {
  to: string;
  value: string;
  data: string;
  gasLimit: string;
  gasPrice: string;
  maxFeePerGas: string;
  maxPriorityFeePerGas: string;
  nonce: string;
  chainId: string;
  txType: string;
}

export interface HistoryEntry {
  id: string;
  timestamp: number;
  type: 'create_wallet' | 'import_wallet' | 'sign_tx' | 'broadcast_tx' | 'security_audit';
  status: 'success' | 'failed' | 'pending';
  details: string;
  txHash?: string;
  riskLevel?: string;
  securityScore?: number;
}

export type AppStep = 
  | 'welcome'
  | 'create-wallet'
  | 'import-wallet'
  | 'backup-mnemonic'
  | 'dashboard'
  | 'intent-input'
  | 'build-tx'
  | 'security-audit'
  | 'sign-tx'
  | 'broadcast-tx'
  | 'history';

export interface AppState {
  currentStep: AppStep;
  wallet: WalletState | null;
  mnemonic: string;
  transaction: TransactionState;
  history: HistoryEntry[];
  securityScore: number;
  isWasmReady: boolean;
}
