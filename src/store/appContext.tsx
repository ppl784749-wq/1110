// Simple reactive store using React context

import { createContext, useContext } from 'react';
import type { AppState, AppStep, WalletState, TransactionState, HistoryEntry } from '@/types';

export const initialAppState: AppState = {
  currentStep: 'welcome',
  wallet: null,
  mnemonic: '',
  transaction: {
    to: '',
    value: '0.001',
    data: '0x',
    gasLimit: '21000',
    gasPrice: '2000000000',
    maxFeePerGas: '3000000000',
    maxPriorityFeePerGas: '1000000000',
    nonce: '0',
    chainId: '11155111',
    txType: 'eip1559',
  },
  history: [],
  securityScore: 100,
  isWasmReady: false,
};

export interface AppActions {
  setStep: (step: AppStep) => void;
  setWallet: (wallet: WalletState) => void;
  setMnemonic: (mnemonic: string) => void;
  setTransaction: (tx: Partial<TransactionState>) => void;
  addHistory: (entry: Omit<HistoryEntry, 'id' | 'timestamp'>) => void;
  setSecurityScore: (score: number) => void;
  setWasmReady: (ready: boolean) => void;
  resetApp: () => void;
}

export interface AppContextType {
  state: AppState;
  actions: AppActions;
}

export const AppContext = createContext<AppContextType>({
  state: initialAppState,
  actions: {
    setStep: () => {},
    setWallet: () => {},
    setMnemonic: () => {},
    setTransaction: () => {},
    addHistory: () => {},
    setSecurityScore: () => {},
    setWasmReady: () => {},
    resetApp: () => {},
  },
});

export function useApp(): AppContextType {
  return useContext(AppContext);
}
