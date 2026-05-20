// Sepolia testnet broadcast via ethers.js
// All transactions are broadcast to Sepolia testnet only

import { ethers, JsonRpcProvider } from 'ethers';

const SEPOLIA_RPC = 'https://rpc.sepolia.org';
const SEPOLIA_CHAIN_ID = 11155111;
const SEPOLIA_EXPLORER = 'https://sepolia.etherscan.io';

let provider: JsonRpcProvider | null = null;

export function getSepoliaProvider(): JsonRpcProvider {
  if (!provider) {
    provider = new JsonRpcProvider(SEPOLIA_RPC, SEPOLIA_CHAIN_ID, {
      staticNetwork: true,
    });
  }
  return provider;
}

export async function getNonce(address: string): Promise<number> {
  const p = getSepoliaProvider();
  return await p.getTransactionCount(address);
}

export async function getGasPrice(): Promise<bigint> {
  const p = getSepoliaProvider();
  const feeData = await p.getFeeData();
  return feeData.gasPrice ?? 0n;
}

export async function getBalance(address: string): Promise<bigint> {
  const p = getSepoliaProvider();
  return await p.getBalance(address);
}

export async function estimateGas(to: string, value: string, data: string = '0x'): Promise<bigint> {
  const p = getSepoliaProvider();
  return await p.estimateGas({
    to,
    value: ethers.parseEther(value),
    data,
  });
}

export async function broadcastRawTransaction(signedTx: string): Promise<string> {
  const p = getSepoliaProvider();
  const txResponse = await p.broadcastTransaction(signedTx);
  return txResponse.hash;
}

export function getExplorerTxUrl(txHash: string): string {
  return `${SEPOLIA_EXPLORER}/tx/${txHash}`;
}

export function getExplorerAddressUrl(address: string): string {
  return `${SEPOLIA_EXPLORER}/address/${address}`;
}

export { SEPOLIA_CHAIN_ID, SEPOLIA_EXPLORER };
