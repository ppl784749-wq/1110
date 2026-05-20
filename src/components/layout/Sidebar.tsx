import { useApp } from '@/store/appContext';
import {
  Shield, Wallet, ArrowRightLeft, History, Settings,
  ChevronRight, AlertTriangle
} from 'lucide-react';
import type { AppStep } from '@/types';

interface NavItem {
  id: AppStep;
  label: string;
  icon: React.ReactNode;
  requiresWallet: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: '控制台', icon: <Wallet size={18} />, requiresWallet: true },
  { id: 'intent-input', label: '意图输入', icon: <ArrowRightLeft size={18} />, requiresWallet: true },
  { id: 'history', label: '操作历史', icon: <History size={18} />, requiresWallet: true },
];

export function Sidebar() {
  const { state, actions } = useApp();
  const { currentStep, wallet, securityScore } = state;

  const handleNav = (step: AppStep) => {
    if (step === 'welcome' || wallet) {
      actions.setStep(step);
    }
  };

  return (
    <aside className="w-64 h-screen flex flex-col border-r"
      style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
      {/* Logo */}
      <div className="p-5 border-b" style={{ borderColor: 'var(--border-primary)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))' }}>
            <Shield size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold identity-gradient">控签台</h1>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Control Sign Desk</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = currentStep === item.id;
          const isDisabled = item.requiresWallet && !wallet;

          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              disabled={isDisabled}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
              style={{
                background: isActive ? 'var(--glow-blue)' : 'transparent',
                color: isActive ? 'var(--accent-blue)' : 'var(--text-secondary)',
                border: isActive ? '1px solid rgba(59,130,246,0.3)' : '1px solid transparent',
              }}
            >
              {item.icon}
              <span className="flex-1 text-left">{item.label}</span>
              {isActive && <ChevronRight size={14} />}
            </button>
          );
        })}
      </nav>

      {/* Wallet Info */}
      {wallet && (
        <div className="p-4 border-t" style={{ borderColor: 'var(--border-primary)' }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full pulse-dot" style={{ background: 'var(--accent-green)' }} />
            <span className="text-xs" style={{ color: 'var(--accent-green)' }}>已连接</span>
          </div>
          <p className="text-xs font-mono truncate" style={{ color: 'var(--text-secondary)' }}>
            {wallet.address}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            余额: {wallet.balance} ETH
          </p>
        </div>
      )}

      {/* Testnet Warning */}
      <div className="p-3">
        <div className="testnet-banner flex items-center gap-2">
          <AlertTriangle size={14} />
          <span>Sepolia 测试网 · 仅供演示</span>
        </div>
      </div>
    </aside>
  );
}
