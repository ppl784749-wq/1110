import { useApp } from '@/store/appContext';
import { Wallet, ArrowRightLeft, Shield, History, ExternalLink, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getBalance, getExplorerAddressUrl } from '@/lib/sepolia';

export function DashboardPage() {
  const { state, actions } = useApp();
  const { wallet, securityScore } = state;
  const [refreshing, setRefreshing] = useState(false);

  const refreshBalance = async () => {
    if (!wallet) return;
    setRefreshing(true);
    try {
      const bal = await getBalance(wallet.address);
      const balance = (Number(bal) / 1e18).toFixed(4);
      actions.setWallet({ ...wallet, balance });
    } catch {
      // ok
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    refreshBalance();
  }, []);

  if (!wallet) return null;

  return (
    <div className="max-w-4xl mx-auto fade-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">控制台</h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Sepolia 测试网 · 自托管模式</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full pulse-dot" style={{ background: 'var(--accent-green)' }} />
          <span className="text-xs" style={{ color: 'var(--accent-green)' }}>Token Core 已就绪</span>
        </div>
      </div>

      {/* Wallet Card */}
      <div className="card mb-6" style={{ background: 'linear-gradient(135deg, #1a1f35, #1e2540)' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))' }}>
              <Wallet size={20} className="text-white" />
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>钱包地址</p>
              <p className="text-sm font-mono">{wallet.address.slice(0, 10)}...{wallet.address.slice(-8)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg cursor-pointer" style={{ background: 'var(--bg-input)' }}
              onClick={refreshBalance} disabled={refreshing}>
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            </button>
            <a href={getExplorerAddressUrl(wallet.address)} target="_blank" rel="noopener noreferrer"
              className="p-2 rounded-lg" style={{ background: 'var(--bg-input)' }}>
              <ExternalLink size={14} />
            </a>
          </div>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>余额</p>
            <p className="text-3xl font-bold">{wallet.balance} <span className="text-base" style={{ color: 'var(--text-muted)' }}>ETH</span></p>
          </div>
          <div className="text-right">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>网络</p>
            <span className="badge badge-info">Sepolia 测试网</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <button className="card cursor-pointer hover:border-blue-500/30 transition-all"
          onClick={() => actions.setStep('intent-input')}
          style={{ background: 'var(--bg-card)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))' }}>
              <ArrowRightLeft size={18} className="text-white" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold">发起交易</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>意图输入或手动构建</p>
            </div>
          </div>
        </button>

        <button className="card cursor-pointer hover:border-blue-500/30 transition-all"
          onClick={() => actions.setStep('history')}
          style={{ background: 'var(--bg-card)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))' }}>
              <History size={18} className="text-white" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold">操作历史</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>查看所有操作记录</p>
            </div>
          </div>
        </button>
      </div>

      {/* Security Status */}
      <div className="card">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Shield size={14} style={{ color: 'var(--accent-cyan)' }} />
          安全状态
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: 'var(--accent-green)' }} />
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>密钥本地存储</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: 'var(--accent-green)' }} />
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Token Core 签名</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: 'var(--accent-green)' }} />
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Sepolia 测试网</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: 'var(--accent-green)' }} />
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>零服务端传输</span>
          </div>
        </div>
        <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
          参考：Security Handbook §1 - 非托管钱包安全模型：Your keys, your assets.
        </p>
      </div>
    </div>
  );
}
