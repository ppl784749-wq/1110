import { useApp } from '@/store/appContext';
import { Radio, CheckCircle, ExternalLink, ArrowRight, Loader2, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { broadcastRawTransaction, getExplorerTxUrl } from '@/lib/sepolia';
import { ethers } from 'ethers';

export function BroadcastTxPage() {
  const { state, actions } = useApp();
  const { wallet, transaction } = state;
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [error, setError] = useState('');
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  const handleBroadcast = async () => {
    setLoading(true);
    setError('');

    try {
      // Build and sign the transaction using ethers.js for reliable Sepolia broadcast
      const provider = new ethers.JsonRpcProvider('https://rpc.sepolia.org', 11155111, { staticNetwork: true });

      const tx = {
        to: transaction.to as `0x${string}`,
        value: ethers.parseEther(transaction.value || '0'),
        gasLimit: BigInt(transaction.gasLimit || '21000'),
        nonce: parseInt(transaction.nonce || '0'),
        chainId: 11155111,
        maxFeePerGas: BigInt(transaction.maxFeePerGas || '3000000000'),
        maxPriorityFeePerGas: BigInt(transaction.maxPriorityFeePerGas || '1000000000'),
        type: 2,
      };

      // For demo: use a Wallet from the keystore's private key
      // In production, the signed raw tx from Token Core would be broadcast directly
      if (wallet) {
        const ethWallet = new ethers.Wallet(wallet.password, provider); // Demo only

        // Actually, for a proper demo, let's construct and broadcast
        // We'll use the provider to estimate and send
        const signedTx = await ethWallet.signTransaction(tx);
        const response = await provider.broadcastTransaction(signedTx);

        setTxHash(response.hash);
        setBroadcastSuccess(true);

        actions.addHistory({
          type: 'broadcast_tx',
          status: 'success',
          details: `交易已广播到 Sepolia 测试网，Hash: ${response.hash}`,
          txHash: response.hash,
        });
      }
    } catch (err: any) {
      setError(err?.message || '广播失败，请检查网络连接和交易参数');
      actions.addHistory({
        type: 'broadcast_tx',
        status: 'failed',
        details: `广播失败: ${err?.message || '未知错误'}`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto fade-up">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, var(--accent-green), var(--accent-cyan))' }}>
          <Radio size={20} className="text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold">广播交易</h2>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Sepolia 测试网 · 真实上链</p>
        </div>
      </div>

      {/* Transaction Summary */}
      <div className="card mb-4">
        <h3 className="text-sm font-semibold mb-3">交易详情</h3>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span style={{ color: 'var(--text-muted)' }}>目标地址</span>
            <span className="font-mono">{transaction.to?.slice(0, 10)}...{transaction.to?.slice(-6)}</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: 'var(--text-muted)' }}>金额</span>
            <span className="font-medium">{transaction.value} ETH</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: 'var(--text-muted)' }}>网络</span>
            <span>Sepolia 测试网</span>
          </div>
        </div>
      </div>

      {!broadcastSuccess ? (
        <>
          <button className="btn-primary w-full py-3" onClick={handleBroadcast} disabled={loading}>
            {loading ? <><Loader2 size={16} className="animate-spin" /> 广播中...</> : <><Radio size={16} /> 广播到 Sepolia 测试网</>}
          </button>

          {error && (
            <div className="mt-4 flex items-center gap-2 text-xs p-3 rounded-lg" style={{ background: 'var(--glow-red)', color: 'var(--accent-red)' }}>
              <AlertTriangle size={14} /> {error}
            </div>
          )}
        </>
      ) : (
        <>
          {/* Success */}
          <div className="card text-center py-8" style={{ borderColor: 'rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.05)' }}>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(16,185,129,0.15)' }}>
              <CheckCircle size={32} style={{ color: 'var(--accent-green)' }} />
            </div>
            <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--accent-green)' }}>
              交易已广播成功！
            </h3>
            <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
              交易已提交到 Sepolia 测试网，等待矿工确认
            </p>

            {/* Tx Hash */}
            <div className="p-3 rounded-lg text-left" style={{ background: 'var(--bg-input)' }}>
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>交易哈希</p>
              <p className="text-sm font-mono break-all">{txHash}</p>
            </div>

            {/* Explorer Link */}
            <a
              href={getExplorerTxUrl(txHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-flex mt-4"
            >
              在 Etherscan 查看 <ExternalLink size={14} />
            </a>
          </div>

          {/* Next Actions */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <button className="btn-secondary" onClick={() => actions.setStep('intent-input')}>
              发起新交易
            </button>
            <button className="btn-secondary" onClick={() => actions.setStep('history')}>
              查看历史
            </button>
          </div>
        </>
      )}
    </div>
  );
}
