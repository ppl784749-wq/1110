import { useApp } from '@/store/appContext';
import { Shield, Copy, Check, AlertTriangle, ArrowRight } from 'lucide-react';
import { useState } from 'react';

export function BackupMnemonicPage() {
  const { state, actions } = useApp();
  const { mnemonic } = state;
  const [confirmed, setConfirmed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showMnemonic, setShowMnemonic] = useState(false);

  const words = mnemonic ? mnemonic.split(' ') : [];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(mnemonic);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API might not be available
    }
  };

  const handleContinue = () => {
    actions.setStep('dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6"
      style={{ background: 'radial-gradient(ellipse at center, #111827 0%, #0a0e1a 70%)' }}>
      <div className="max-w-md w-full fade-up">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--accent-yellow), var(--accent-red))' }}>
            <Shield size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold">备份助记词</h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>这是恢复钱包的唯一方式</p>
          </div>
        </div>

        {/* Warning */}
        <div className="card mb-4" style={{ borderColor: 'rgba(245,158,11,0.3)' }}>
          <div className="flex items-start gap-2">
            <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--accent-yellow)' }} />
            <div>
              <p className="text-xs font-semibold" style={{ color: 'var(--accent-yellow)' }}>重要安全提醒</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                助记词是恢复钱包的唯一凭证。丢失助记词意味着永久丢失资产访问权限。
                请将助记词抄写在纸上并妥善保管，切勿截图或存储在联网设备上。
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                参考：Security Handbook §3 - 密钥数据留存本地
              </p>
            </div>
          </div>
        </div>

        {/* Mnemonic Display */}
        <div className="card mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>助记词</span>
            <div className="flex items-center gap-2">
              <button className="text-xs px-2 py-1 rounded cursor-pointer"
                style={{ background: 'var(--bg-input)', color: 'var(--text-muted)' }}
                onClick={() => setShowMnemonic(!showMnemonic)}>
                {showMnemonic ? '隐藏' : '显示'}
              </button>
              <button className="text-xs px-2 py-1 rounded cursor-pointer flex items-center gap-1"
                style={{ background: 'var(--bg-input)', color: 'var(--text-muted)' }}
                onClick={handleCopy}>
                {copied ? <><Check size={12} /> 已复制</> : <><Copy size={12} /> 复制</>}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {words.map((word, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg"
                style={{ background: 'var(--bg-input)', border: '1px solid var(--border-primary)' }}>
                <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                  {i + 1}.
                </span>
                <span className="text-sm font-medium">
                  {showMnemonic ? word : '••••'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Confirm */}
        <div className="card mb-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={e => setConfirmed(e.target.checked)}
              className="mt-1 accent-blue-500"
            />
            <span className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              我已将助记词安全备份。我理解丢失助记词将导致无法恢复钱包，且助记词不会存储在任何服务器上。
              <br />
              <span style={{ color: 'var(--text-muted)' }}>
                参考：Security Handbook §3 - 密钥数据留存本地
              </span>
            </span>
          </label>
        </div>

        <button className="btn-primary w-full py-3" onClick={handleContinue} disabled={!confirmed}>
          进入控制台 <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
