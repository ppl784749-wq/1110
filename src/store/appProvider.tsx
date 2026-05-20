// App state provider with useReducer

import { useReducer, useCallback, type ReactNode } from 'react';
import { AppContext, initialAppState } from './appContext';
import type { AppState, AppStep, WalletState, TransactionState, HistoryEntry } from '@/types';

type Action =
  | { type: 'SET_STEP'; step: AppStep }
  | { type: 'SET_WALLET'; wallet: WalletState }
  | { type: 'SET_MNEMONIC'; mnemonic: string }
  | { type: 'SET_TRANSACTION'; tx: Partial<TransactionState> }
  | { type: 'ADD_HISTORY'; entry: Omit<HistoryEntry, 'id' | 'timestamp'> }
  | { type: 'SET_SECURITY_SCORE'; score: number }
  | { type: 'SET_WASM_READY'; ready: boolean }
  | { type: 'RESET' };

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.step };
    case 'SET_WALLET':
      return { ...state, wallet: action.wallet };
    case 'SET_MNEMONIC':
      return { ...state, mnemonic: action.mnemonic };
    case 'SET_TRANSACTION':
      return { ...state, transaction: { ...state.transaction, ...action.tx } };
    case 'ADD_HISTORY':
      return {
        ...state,
        history: [
          {
            ...action.entry,
            id: `h_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            timestamp: Date.now(),
          },
          ...state.history,
        ],
      };
    case 'SET_SECURITY_SCORE':
      return { ...state, securityScore: action.score };
    case 'SET_WASM_READY':
      return { ...state, isWasmReady: action.ready };
    case 'RESET':
      return initialAppState;
    default:
      return state;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialAppState);

  const setStep = useCallback((step: AppStep) => dispatch({ type: 'SET_STEP', step }), []);
  const setWallet = useCallback((wallet: WalletState) => dispatch({ type: 'SET_WALLET', wallet }), []);
  const setMnemonic = useCallback((mnemonic: string) => dispatch({ type: 'SET_MNEMONIC', mnemonic }), []);
  const setTransaction = useCallback((tx: Partial<TransactionState>) => dispatch({ type: 'SET_TRANSACTION', tx }), []);
  const addHistory = useCallback((entry: Omit<HistoryEntry, 'id' | 'timestamp'>) => dispatch({ type: 'ADD_HISTORY', entry }), []);
  const setSecurityScore = useCallback((score: number) => dispatch({ type: 'SET_SECURITY_SCORE', score }), []);
  const setWasmReady = useCallback((ready: boolean) => dispatch({ type: 'SET_WASM_READY', ready }), []);
  const resetApp = useCallback(() => dispatch({ type: 'RESET' }), []);

  return (
    <AppContext.Provider value={{ state, actions: { setStep, setWallet, setMnemonic, setTransaction, addHistory, setSecurityScore, setWasmReady, resetApp } }}>
      {children}
    </AppContext.Provider>
  );
}
