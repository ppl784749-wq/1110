import { useApp } from '@/store/appContext';
import { Shield, ArrowRight, Zap, Lock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { initTokenCore } from '@/lib/tokenCore';

export function WelcomePage() {
  const { actions } = useApp();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initTokenCore()
      .then(() => actions.setWasmReady(true))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-6"
      style={{ background: 'radial-gradient(ellipse at center, #111827 0%, #0a0e1a 70%)' }}>
      <div className="max-w-lg w-full fade-up">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))' }}>
            <Shield size={40} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-2 identity-gradient">控签台</h1>
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>Control Sign Desk</p>
          <p className="mt-4 text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            极简自托管交易控制台 · 完整掌控从钱包创建到交易上链的每一步
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="card text-center py-4">
            <Zap size={20} className="mx-auto mb-2" style={{ color: 'var(--accent-blue)' }} />
            <p className="text-xs font-medium">Token Core</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>本地签名引擎</p>
          </div>
          <div className="card text-center py-4">
            <Shield size={20} className="mx-auto mb-2" style={{ color: 'var(--accent-green)' }} />
            <p className="text-xs font-medium">安全审查</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>多维度风控</p>
          </div>
          <div className="card text-center py-4">
            <Lock size={20} className="mx-auto mb-2" style={{ color: 'var(--accent-purple)' }} />
            <p className="text-xs font-medium">自托管</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>你的密钥你掌控</p>
          </div>
        </div>

        {/* Loading / Actions */}
        {loading ? (
          <div className="text-center py-6">
            <div className="w-8 h-8 mx-auto border-2 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: 'var(--accent-blue)', borderTopColor: 'transparent' }} />
            <p className="mt-3 text-sm" style={{ color: 'var(--text-muted)' }}>正在加载 Token Core WASM...</p>
          </div>
        ) : (
          <div className="space-y-3">
            <button className="btn-primary w-full py-3 text-base" onClick={() => actions.setStep('create-wallet')}>
              创建新钱包 <ArrowRight size={18} />
            </button>
            <button className="btn-secondary w-full py-3 text-base" onClick={() => actions.setStep('import-wallet')}>
              导入已有钱包
            </button>
          </div>
        )}

        {/* Security Notice */}
        <div className="testnet-banner mt-6">
          ⚠️ 此为演示项目，仅供 Sepolia 测试网使用，请勿用于真实资产
        </div>

        {/* Powered by */}
        <div className="mt-6 text-center">
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Powered by Token Core · Token UI · Security Handbook
          </p>
        </div>
      </div>
    </div>
  );
}
