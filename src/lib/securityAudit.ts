// Security audit engine - deeply integrated with Token UI Security materials
// References: token-ui/security/wallet-security-handbook.md & SKILL.md

export type RiskLevel = 'safe' | 'info' | 'warning' | 'danger' | 'blocked';

export interface SecurityCheck {
  id: string;
  category: string;
  title: string;
  description: string;
  riskLevel: RiskLevel;
  reference: string;
  suggestion: string;
}

export interface SecurityAuditResult {
  checks: SecurityCheck[];
  overallRisk: RiskLevel;
  securityScore: number;
  summary: string;
}

const RISK_PRIORITY: Record<RiskLevel, number> = {
  safe: 0,
  info: 1,
  warning: 2,
  danger: 3,
  blocked: 4,
};

function highestRisk(a: RiskLevel, b: RiskLevel): RiskLevel {
  return RISK_PRIORITY[a] >= RISK_PRIORITY[b] ? a : b;
}

export function auditTransaction(tx: {
  to: string;
  value: string;
  data: string;
  isContractInteraction: boolean;
  isTokenApproval: boolean;
  approvalAmount: string;
  isKnownContract: boolean;
  isVerified: boolean;
  functionSelector: string;
  fromAddress: string;
}): SecurityAuditResult {
  const checks: SecurityCheck[] = [];

  // Check 1: Contract verification status
  // Ref: wallet-security-handbook.md §2.1 - Malicious Contract Interaction
  if (tx.isContractInteraction) {
    if (!tx.isVerified) {
      checks.push({
        id: 'contract-unverified',
        category: 'contract-safety',
        title: '合约未经验证',
        description: '目标合约的源代码未在区块浏览器上验证。未验证合约可能包含恶意逻辑，如后门函数、隐藏转账或无限授权。这是加密货币领域最常见的攻击向量之一，攻击者经常部署未验证合约来欺骗用户执行恶意操作。',
        riskLevel: 'danger',
        reference: 'wallet-security-handbook.md §2.1 - 恶意合约交互：未验证合约可能包含后门逻辑',
        suggestion: '请勿与未验证合约交互。如确需操作，请在 Etherscan 上验证合约源代码后再执行。',
      });
    } else {
      checks.push({
        id: 'contract-verified',
        category: 'contract-safety',
        title: '合约已验证',
        description: '目标合约源代码已在区块浏览器上公开验证，可以审查其逻辑。虽然验证不代表绝对安全，但至少可以确认合约行为与声明一致。',
        riskLevel: 'info',
        reference: 'wallet-security-handbook.md §2.1 - 合约验证是安全交互的基本前提',
        suggestion: '建议在执行前阅读合约源代码，确认关键函数逻辑。',
      });
    }
  }

  // Check 2: Token approval risk
  // Ref: wallet-security-handbook.md §2.2 - Unlimited Token Approval
  if (tx.isTokenApproval) {
    if (tx.approvalAmount === 'unlimited' || tx.approvalAmount === '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff') {
      checks.push({
        id: 'unlimited-approval',
        category: 'approval-risk',
        title: '无限授权风险',
        description: '此交易将授予目标合约无限额度的 Token 授权。一旦授权，合约可以在任何时候转走您所有的该类 Token，无需再次确认。这是钓鱼攻击和资金盗窃的主要手段之一。攻击者通过诱导用户签署无限授权交易，随后在适当时机转走全部资产。',
        riskLevel: 'danger',
        reference: 'wallet-security-handbook.md §2.2 - 无限授权：授权额度应仅限于本次交易所需数量',
        suggestion: '建议仅授权本次交易所需的精确数量，而非无限额度。可使用 Revoke.cash 等工具管理现有授权。',
      });
    }
  }

  // Check 3: Large value transfer
  // Ref: wallet-security-handbook.md §2.3 - Abnormal Transaction Amount
  const valueNum = parseFloat(tx.value || '0');
  if (valueNum > 0.1) {
    checks.push({
      id: 'large-value',
      category: 'value-check',
      title: '大额转账提醒',
      description: `当前转账金额为 ${tx.value} ETH，属于较大金额。请仔细核实接收方地址是否正确，避免因地址错误导致资产永久丢失。大额转账建议先发送小额测试交易确认地址正确性。`,
      riskLevel: 'warning',
      reference: 'wallet-security-handbook.md §2.3 - 异常交易金额：大额转账需二次确认',
      suggestion: '建议先发送 0.001 ETH 测试交易，确认接收方地址正确后再发送大额资金。',
    });
  }

  // Check 4: Zero address check
  // Ref: wallet-security-handbook.md §2.4 - Address Verification
  if (tx.to === '0x0000000000000000000000000000000000000000') {
    checks.push({
      id: 'zero-address',
      category: 'address-check',
      title: '零地址检测',
      description: '目标地址为零地址（0x000...000），向此地址发送资产将导致资金永久丢失且无法恢复。这通常是合约创建交易或输入错误导致的。',
      riskLevel: 'danger',
      reference: 'wallet-security-handbook.md §2.4 - 地址验证：零地址转账意味着资金永久丢失',
      suggestion: '请确认目标地址是否正确。如果是合约创建，data 字段应包含合约字节码。',
    });
  }

  // Check 5: Self-transfer detection
  if (tx.to.toLowerCase() === tx.fromAddress.toLowerCase()) {
    checks.push({
      id: 'self-transfer',
      category: 'address-check',
      title: '自转账检测',
      description: '您正在向自己的地址转账。虽然这不会导致资产丢失，但仍需支付 Gas 费用。请确认这是否是您的真实意图。',
      riskLevel: 'info',
      reference: 'wallet-security-handbook.md §2.4 - 地址验证：确认交易意图',
      suggestion: '如非必要，建议避免自转账以节省 Gas 费用。',
    });
  }

  // Check 6: Data field analysis
  // Ref: wallet-security-handbook.md §2.5 - Malicious Data Injection
  if (tx.data && tx.data !== '0x' && tx.data.length > 10) {
    const selector = tx.data.slice(0, 10);
    const knownDangerousSelectors: Record<string, string> = {
      '0x095ea7b3': 'approve() - Token 授权',
      '0x2e1a7d4d': 'withdraw() - 提取资金',
      '0xa9059cbb': 'transfer() - Token 转账',
      '0x23b872dd': 'transferFrom() - 代为转账',
    };

    const funcName = knownDangerousSelectors[selector];
    if (funcName) {
      checks.push({
        id: 'data-analysis',
        category: 'data-check',
        title: `函数调用检测: ${funcName}`,
        description: `检测到合约函数调用 ${funcName}。此函数可能涉及资产转移或授权操作。请确认您了解此操作的具体影响，特别是授权类操作可能允许第三方访问您的资产。`,
        riskLevel: 'warning',
        reference: 'wallet-security-handbook.md §2.5 - 恶意数据注入：审查交易 data 字段中的函数选择器',
        suggestion: '请确认您主动发起了此操作，而非被钓鱼网站诱导签署。',
      });
    }
  }

  // Check 7: Testnet safety confirmation
  checks.push({
    id: 'testnet-confirm',
    category: 'network-check',
    title: '测试网安全确认',
    description: '当前交易将在 Sepolia 测试网执行。测试网资产无真实价值，但操作流程与主网完全一致。此审查流程同样适用于主网交易，确保您在真实环境中具备完整的安全意识。',
    riskLevel: 'safe',
    reference: 'wallet-security-handbook.md §1 - 安全模型：测试网是学习和验证安全流程的最佳环境',
    suggestion: '在测试网充分验证后，主网操作请保持同等的安全审查标准。',
  });

  // Check 8: Self-custodial signing confirmation
  checks.push({
    id: 'self-custody',
    category: 'signing-check',
    title: '自托管签名保障',
    description: '此交易将通过 Token Core 在浏览器本地完成签名。私钥不会离开您的设备，不会经过任何中间服务器。这是非托管钱包的核心安全原则：Your keys, your assets。只有持有私钥的人才能签署交易，这确保了资产的完全自主控制。',
    riskLevel: 'safe',
    reference: 'wallet-security-handbook.md §1 - 非托管钱包安全模型：Your keys, your assets',
    suggestion: '请确保在安全的设备上操作，避免在公共电脑或受恶意软件感染的设备上签署交易。',
  });

  // Calculate overall risk and score
  let overallRisk: RiskLevel = 'safe';
  let score = 100;

  for (const check of checks) {
    overallRisk = highestRisk(overallRisk, check.riskLevel);
    if (check.riskLevel === 'danger') score -= 25;
    else if (check.riskLevel === 'warning') score -= 10;
    else if (check.riskLevel === 'info') score -= 2;
    else if (check.riskLevel === 'blocked') score = 0;
  }

  score = Math.max(0, Math.min(100, score));

  const summary = overallRisk === 'safe'
    ? '交易安全审查通过，所有检查项均为安全级别。'
    : overallRisk === 'info'
    ? '交易存在提示信息，建议关注后继续操作。'
    : overallRisk === 'warning'
    ? '交易存在风险警告，请仔细审查后再决定是否继续。'
    : overallRisk === 'danger'
    ? '交易存在高风险项，强烈建议取消或修改交易参数。'
    : '交易已被安全系统拦截，请修改交易参数后重试。';

  return { checks, overallRisk, securityScore: score, summary };
}

// Wallet creation security checks
export function auditWalletCreation(): SecurityCheck[] {
  return [
    {
      id: 'local-generation',
      category: 'key-security',
      title: '本地密钥生成',
      description: '助记词和密钥对由 Token Core WASM 在浏览器本地生成，使用加密安全的随机数生成器。整个生成过程不涉及任何网络请求，确保密钥从创建之初就完全由您掌控。',
      riskLevel: 'safe',
      reference: 'wallet-security-handbook.md §1 - 核心原则：Your keys, your assets',
      suggestion: '请妥善备份助记词，切勿截图或存储在联网设备上。',
    },
    {
      id: 'mnemonic-backup',
      category: 'key-security',
      title: '助记词备份提醒',
      description: '助记词是恢复钱包的唯一方式。丢失助记词意味着永久丢失资产访问权限，没有任何第三方可以帮您恢复。这是非托管钱包的基本特性——去中心化意味着您自己负责安全。',
      riskLevel: 'info',
      reference: 'wallet-security-handbook.md §3 - 开发者安全设计清单：助记词备份是用户最重要的安全责任',
      suggestion: '建议将助记词抄写在纸上，存放在安全的物理位置，避免数字化存储。',
    },
    {
      id: 'no-server-upload',
      category: 'key-security',
      title: '零服务端传输',
      description: '控签台严格遵守密钥数据留存本地原则。助记词和私钥不会上传至任何服务器，所有签名操作均在浏览器端完成。这符合 Security Handbook 中关于密钥数据留存本地的核心要求。',
      riskLevel: 'safe',
      reference: 'wallet-security-handbook.md §5 - 密钥数据留存本地：助记词/私钥存储方式仅限浏览器端',
      suggestion: '请在安全的网络环境下使用本工具，避免在公共 Wi-Fi 环境下操作。',
    },
  ];
}

// Import wallet security checks
export function auditWalletImport(): SecurityCheck[] {
  return [
    {
      id: 'import-local',
      category: 'key-security',
      title: '本地导入处理',
      description: '助记词导入全程在浏览器本地通过 Token Core WASM 处理，不会发送到任何远程服务器。导入过程使用与创建钱包相同的加密标准，确保密钥在整个生命周期中都受到保护。',
      riskLevel: 'safe',
      reference: 'wallet-security-handbook.md §5 - 助记词/私钥存储方式：仅浏览器端处理',
      suggestion: '请确保在可信设备上操作，避免在公共电脑上导入助记词。',
    },
    {
      id: 'import-real-key-warning',
      category: 'key-security',
      title: '真实助记词警告',
      description: '请勿将个人真实助记词输入任何演示环境。本工具仅供 Sepolia 测试网使用，请使用专用测试助记词。即使是测试环境，也应养成不在非正式场合输入真实密钥的安全习惯。',
      riskLevel: 'warning',
      reference: 'wallet-security-handbook.md §5 - 不输入真实助记词到演示环境',
      suggestion: '使用本工具创建的测试钱包进行所有操作，切勿输入主网助记词。',
    },
  ];
}
