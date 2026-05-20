// Token Core WASM integration layer
// All wallet operations are performed locally in the browser via tcx-wasm

import init, {
  create_keystore,
  derive_accounts,
  sign_tx,
  export_mnemonic,
  cache_keystore,
  clear_cached_keystore,
} from '@consenlabs/tcx-wasm';

let initialized = false;

export async function initTokenCore(): Promise<void> {
  if (initialized) return;
  await init();
  initialized = true;
}

export interface CreateWalletResult {
  keystoreJson: string;
  mnemonic: string;
}

export async function createWallet(password: string, network: string = 'TESTNET'): Promise<CreateWalletResult> {
  await initTokenCore();

  // Generate a random mnemonic via tcx-wasm
  const keystoreJson = create_keystore(JSON.stringify({
    password,
    network,
  }));

  // Export the mnemonic for backup display
  const mnemonicResult = JSON.parse(
    export_mnemonic(JSON.stringify({
      keystoreJson,
      key: password,
    }))
  );

  return {
    keystoreJson,
    mnemonic: mnemonicResult.mnemonic,
  };
}

export async function importWalletFromMnemonic(
  mnemonic: string,
  password: string,
  network: string = 'TESTNET'
): Promise<CreateWalletResult> {
  await initTokenCore();

  const keystoreJson = create_keystore(JSON.stringify({
    password,
    mnemonic,
    network,
  }));

  return {
    keystoreJson,
    mnemonic,
  };
}

export interface DerivedAccount {
  address: string;
  chain: string;
  derivationPath: string;
  extPubKey: string;
  publicKey: string;
}

export async function deriveEthAccount(
  keystoreJson: string,
  password: string,
  chainId: string = '11155111',
  network: string = 'TESTNET'
): Promise<DerivedAccount> {
  await initTokenCore();

  const accounts = JSON.parse(
    derive_accounts(JSON.stringify({
      keystoreJson,
      key: password,
      derivations: [{
        chain: 'ETHEREUM',
        derivationPath: "m/44'/60'/0'/0/0",
        chainId,
        network,
      }],
    }))
  );

  return accounts[0];
}

export interface EthTxSignResult {
  signature: string;
  txHash: string;
  signedTx?: string;
}

export async function signEthTransaction(
  keystoreJson: string,
  password: string,
  txInput: {
    nonce: string;
    gasPrice?: string;
    gasLimit: string;
    to: string;
    value: string;
    data?: string;
    chainId: string;
    txType?: string;
    maxFeePerGas?: string;
    maxPriorityFeePerGas?: string;
  },
  derivationPath: string = "m/44'/60'/0'/0/0",
  network: string = 'TESTNET'
): Promise<EthTxSignResult> {
  await initTokenCore();

  const result = JSON.parse(
    sign_tx(JSON.stringify({
      keystoreJson,
      key: password,
      chain: 'ETHEREUM',
      derivationPath,
      network,
      input: txInput,
    }))
  );

  return result;
}

export function cacheKeystore(keystoreJson: string): void {
  cache_keystore(keystoreJson);
}

export function clearKeystore(): void {
  clear_cached_keystore();
}
