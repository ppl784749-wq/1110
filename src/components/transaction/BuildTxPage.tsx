import { useApp } from '@/store/appContext';
import { ArrowRight, ArrowLeft, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getNonce, getGasPrice } from '@/lib/sepolia';

export function BuildTxPage() {
  const { state, actions } = useApp();
  const { transaction, wallet } = state;
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTxParams();
  }, []);

  const loadTxParams = async () => {
    if (!wallet) return;
    setLoading(true);
    try {
      const [nonce, gasPrice] = await Promise.all([
        getNonce(wallet.address),
        getGasPrice(),
      ]);
      actions.setTransaction({
        nonce: nonce.toString(),
        gasPrice: gasPrice.toString(),
        maxFeePerGas: (gasPrice * 3n / 2n).toString(),
        maxPriorityFeePerGas: (gasPrice / 2n).toString(),
      });
    } catch {
      // Use defaults
    } finally {
      setLoading(false);
    }
  };

  const handleProceed = () => {
    actions.setStep('security-audit');
  };

  const formatGwei = (wei: string) => {
    try {
      return (BigInt(wei) / 1000000000n).toString();
    } catch {
      return '0';
    }
  };

  return (
    <div className="max-w-2xl mx-auto fade-up">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold">构建交易</h2>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>编辑交易参数 · Sepolia 测试网</p>
        </div>
        <button className="btn-secondary text-xs" onClick={loadTxParams} disabled={loading}>
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> 刷新参数
        </button>
      </div>

      <div className="card space-y-4">
        {/* To Address */}
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
            目标地址 (To)
          </label>
          <input
            className="input-field text-sm font-mono"
            placeholder="0x..."
            value={transaction.to}
            onChange={e => actions.setTransaction({ to: e.target.value })}
          />
        </div>

        {/* Value */}
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
            金额 (ETH)
          </label>
          <input
            className="input-field text-sm"
            type="number"
            step="0.0001"
            min="0"
            placeholder="0.001"
            value={transaction.value}
            onChange={e => actions.setTransaction({ value: e.target.value })}
          />
        </div>

        {/* Data */}
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
            数据 (Data)
          </label>
          <input
            className="input-field text-xs font-mono"
            placeholder="0x"
            value={transaction.data}
            onChange={e => actions.setTransaction({ data: e.target.value })}
          />
        </div>

        {/* Gas & Nonce */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
              Gas Limit
            </label>
            <input
              className="input-field text-xs"
              value={transaction.gasLimit}
              onChange={e => actions.setTransaction({ gasLimit: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
              Nonce
            </label>
            <input
              className="input-field text-xs"
              value={transaction.nonce}
              onChange={e => actions.setTransaction({ nonce: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
              Max Fee (Gwei)
            </label>
            <input
              className="input-field text-xs"
              value={formatGwei(transaction.maxFeePerGas)}
              onChange={e => {
                const gwei = BigInt(e.target.value || '0') * 1000000000n;
                actions.setTransaction({ maxFeePerGas: gwei.toString() });
              }}
            />
          </div>
          <div>
            <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
              Priority Fee (Gwei)
            </label>
            <input
              className="input-field text-xs"
              value={formatGwei(transaction.maxPriorityFeePerGas)}
              onChange={e => {
                const gwei = BigInt(e.target.value || '0') * 1000000000n;
                actions.setTransaction({ maxPriorityFeePerGas: gwei.toString() });
              }}
            />
          </div>
        </div>

        {/* Chain Info */}
        <div className="flex items-center justify-between text-xs px-3 py-2 rounded-lg"
          style={{ background: 'var(--bg-input)', border: '1px solid var(--border-primary)' }}>
          <span style={{ color: 'var(--text-muted)' }}>Chain ID</span>
          <span className="font-mono">11155111 (Sepolia)</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-6">
        <button className="btn-secondary flex-1" onClick={() => actions.setStep('intent-input')}>
          <ArrowLeft size={14} /> 返回
        </button>
        <button className="btn-primary flex-1" onClick={handleProceed}>
          安全审查 <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
