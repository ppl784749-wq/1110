// AI Intent Parser - Parses natural language into transaction parameters

export interface ParsedIntent {
  action: 'send' | 'approve' | 'interact';
  to: string;
  value: string;
  data: string;
  tokenSymbol?: string;
  tokenAmount?: string;
  description: string;
  confidence: number;
}

const DEMO_ADDRESSES: Record<string, string> = {
  'vitalik': '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
  'sepolia_faucet': '0x00000000219ab540356cBB839Cbe05303d7705Fa',
  'zero': '0x0000000000000000000000000000000000000000',
};

export function parseIntentLocally(input: string): ParsedIntent {
  const lower = input.toLowerCase().trim();

  // Pattern: send X ETH to [address/name]
  const sendEthMatch = lower.match(/(?:send|发送|转账|转)\s*([\d.]+)\s*eth\s*(?:to|到|给)\s*(0x[a-f0-9]{40}|[\w]+)/i);
  if (sendEthMatch) {
    const value = sendEthMatch[1];
    let to = sendEthMatch[2];
    if (!to.startsWith('0x')) {
      to = DEMO_ADDRESSES[to.toLowerCase()] || to;
    }
    return {
      action: 'send',
      to,
      value,
      data: '0x',
      description: `发送 ${value} ETH 到 ${to.slice(0, 8)}...${to.slice(-6)}`,
      confidence: 0.9,
    };
  }

  // Pattern: transfer X ETH to [address/name]
  const transferMatch = lower.match(/(?:transfer|转帐)\s*([\d.]+)\s*eth\s*(?:to|到|给)\s*(0x[a-f0-9]{40}|[\w]+)/i);
  if (transferMatch) {
    const value = transferMatch[1];
    let to = transferMatch[2];
    if (!to.startsWith('0x')) {
      to = DEMO_ADDRESSES[to.toLowerCase()] || to;
    }
    return {
      action: 'send',
      to,
      value,
      data: '0x',
      description: `转账 ${value} ETH 到 ${to.slice(0, 8)}...${to.slice(-6)}`,
      confidence: 0.9,
    };
  }

  // Pattern: approve TOKEN for address
  const approveMatch = lower.match(/(?:approve|授权)\s*(\w+)\s*(?:for|给)\s*(0x[a-f0-9]{40})/i);
  if (approveMatch) {
    const tokenSymbol = approveMatch[1];
    const to = approveMatch[2];
    const spenderParam = to.padStart(64, '0').slice(-64);
    const amountParam = 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
    const data = `0x095ea7b3${spenderParam}${amountParam}`;
    return {
      action: 'approve',
      to: '0x0000000000000000000000000000000000000000',
      value: '0',
      data,
      tokenSymbol,
      tokenAmount: 'unlimited',
      description: `授权 ${tokenSymbol} 给 ${to.slice(0, 8)}...${to.slice(-6)}（无限额度）`,
      confidence: 0.7,
    };
  }

  // Default: treat as raw address interaction
  const addressMatch = lower.match(/(0x[a-f0-9]{40})/i);
  if (addressMatch) {
    return {
      action: 'interact',
      to: addressMatch[1],
      value: '0',
      data: '0x',
      description: `与合约 ${addressMatch[1].slice(0, 8)}...${addressMatch[1].slice(-6)} 交互`,
      confidence: 0.5,
    };
  }

  return {
    action: 'send',
    to: '0x0000000000000000000000000000000000000000',
    value: '0',
    data: '0x',
    description: '无法解析意图，请手动构建交易',
    confidence: 0,
  };
}

export function getIntentSuggestions(): string[] {
  return [
    'Send 0.01 ETH to 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
    '发送 0.005 ETH 到 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
    'Transfer 0.001 ETH to vitalik',
    'Approve USDT for 0x0000000000000000000000000000000000000001',
  ];
}
