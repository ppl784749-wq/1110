import { useApp } from '@/store/appContext';
import { Key, Shield, ArrowRight, ArrowLeft, Loader2, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { signEthTransaction } from '@/lib/tokenCore';

export function SignTxPage() {
  const { state, actions } = useApp();
  const { wallet, transaction } = state;
  const [loading, setLoading] = useState(false);
  const [signedTx, setSignedTx] = useState('');
  const [txHash, setTxHash] = useState('');
  const [error, setError] = useState('');

  const handleSign = async () => {
    if (!wallet) return;
    setLoading(true);
    setError('');

    try {
      const result = await signEthTransaction(
        wallet.keystoreJson,
        wallet.password,
        {
          nonce: transaction.nonce,
          gasLimit: transaction.gasLimit,
          to: transaction.to,
          value: transaction.value,
          data: transaction.data || '0x',
          chainId: transaction.chainId,
          txType: transaction.txType,
          maxFeePerGas: transaction.maxFeePerGas,
          maxPriorityFeePerGas: transaction.maxPriorityFeePerGas,
        },
        wallet.derivationPath,
        'TESTNET'
      );

      setSignedTx(result.signature || result.signedTx || JSON.stringify(result));
      setTxHash(result.txHash || '');

      actions.addHistory({
        type: 'sign_tx',
        status: 'success',
        details: `交易签名完成，Hash: ${result.txHash?.slice(0, 16) || 'N/A'}...`,
      });
    } catch (err: any) {
      setError(err?.message || '签名失败，请检查交易参数');
      actions.addHistory({
        type: 'sign_tx',
        status: 'failed',
        details: `签名失败: ${err?.message || '未知错误'}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProceed = () => {
    actions.setStep('broadcast-tx');
  };

  return (
    <div className="max-w-2xl mx-auto fade-up">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))' }}>
          <Key size={20} className="text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold">自托管签名</h2>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Token Core 本地签名 · 密钥不离开浏览器</p>
        </div>
      </div>

      {/* Transaction Summary */}
      <div className="card mb-4">
        <h3 className="text-sm font-semibold mb-3">交易摘要</h3>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span style={{ color: 'var(--text-muted)' }}>目标</span>
            <span className="font-mono">{transaction.to?.slice(0, 10)}...{transaction.to?.slice(-6)}</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: 'var(--text-muted)' }}>金额</span>
            <span className="font-medium">{transaction.value} ETH</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: 'var(--text-muted)' }}>Gas Limit</span>
            <span>{transaction.gasLimit}</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: 'var(--text-muted)' }}>Nonce</span>
            <span>{transaction.nonce}</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: 'var(--text-muted)' }}>Chain</span>
            <span>Sepolia (11155111)</span>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="card mb-4" style={{ borderColor: 'rgba(6,182,212,0.3)' }}>
        <div className="flex items-center gap-2 mb-2">
          <Shield size={14} style={{ color: 'var(--accent-cyan)' }} />
          <span className="text-xs font-semibold" style={{ color: 'var(--accent-cyan)' }}>自托管签名保障</span>
        </div>
        <ul className="text-xs space-y-1" style={{ color: 'var(--text-secondary)' }}>
          <li>• 签名在浏览器端通过 Token Core WASM 完成</li>
          <li>• 私钥始终存储在本地 Keystore 中，不会传输到任何服务器</li>
          <li>• 签名过程遵循 EIP-155 标准，防止重放攻击</li>
          <li>• 参考：Security Handbook §5 - 密钥数据留存本地</li>
        </ul>
      </div>

      {/* Sign Button */}
      {!signedTx && (
        <button className="btn-primary w-full py-3" onClick={handleSign} disabled={loading}>
          {loading ? <><Loader2 size={16} className="animate-spin" /> 签名中...</> : <><Key size={16} /> 使用 Token Core 签名</>}
        </button>
      )}

      {/* Signed Result */}
      {signedTx && (
        <div className="space-y-4">
          <div className="card" style={{ borderColor: 'rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.05)' }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full" style={{ background: 'var(--accent-green)' }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--accent-green)' }}>签名完成</span>
            </div>
            {txHash && (
              <div className="text-xs mb-2">
                <span style={{ color: 'var(--text-muted)' }}>Tx Hash: </span>
                <span className="font-mono">{txHash}</span>
              </div>
            )}
            <div className="text-xs font-mono break-all p-2 rounded" style={{ background: 'var(--bg-input)', color: 'var(--text-muted)' }}>
              {signedTx.slice(0, 200)}...
            </div>
          </div>

          <button className="btn-primary w-full py-3" onClick={handleProceed}>
            广播到 Sepolia 测试网 <ArrowRight size={14} />
          </button>
        </div>
      )}

      {error && (
        <div className="mt-4 flex items-center gap-2 text-xs p-3 rounded-lg" style={{ background: 'var(--glow-red)', color: 'var(--accent-red)' }}>
          <AlertTriangle size={14} /> {error}
        </div>
      )}

      <button className="btn-secondary w-full mt-3" onClick={() => actions.setStep('security-audit')}>
        <ArrowLeft size={14} /> 返回安全审查
      </button>
    </div>
  );
}
