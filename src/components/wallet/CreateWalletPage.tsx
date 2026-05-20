import { useApp } from '@/store/appContext';
import { ArrowLeft, Shield, AlertTriangle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { createWallet, deriveEthAccount } from '@/lib/tokenCore';
import { auditWalletCreation } from '@/lib/securityAudit';
import { getBalance } from '@/lib/sepolia';

export function CreateWalletPage() {
  const { actions } = useApp();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const securityChecks = auditWalletCreation();

  const handleCreate = async () => {
    if (password.length < 8) {
      setError('密码至少需要 8 个字符');
      return;
    }
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await createWallet(password, 'TESTNET');
      const account = await deriveEthAccount(result.keystoreJson, password, '11155111', 'TESTNET');

      let balance = '0.0000';
      try {
        const bal = await getBalance(account.address);
        balance = (Number(bal) / 1e18).toFixed(4);
      } catch {
        // Balance fetch might fail, that's ok for testnet
      }

      actions.setWallet({
        keystoreJson: result.keystoreJson,
        password,
        address: account.address,
        derivationPath: account.derivationPath,
        balance,
        network: 'TESTNET',
      });
      actions.setMnemonic(result.mnemonic);
      actions.addHistory({
        type: 'create_wallet',
        status: 'success',
        details: `钱包创建成功: ${account.address.slice(0, 10)}...${account.address.slice(-6)}`,
      });
      actions.setStep('backup-mnemonic');
    } catch (err: any) {
      setError(err?.message || '钱包创建失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6"
      style={{ background: 'radial-gradient(ellipse at center, #111827 0%, #0a0e1a 70%)' }}>
      <div className="max-w-md w-full fade-up">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button className="p-2 rounded-lg cursor-pointer" style={{ background: 'var(--bg-card)' }}
            onClick={() => actions.setStep('welcome')}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-xl font-bold">创建新钱包</h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Token Core 本地生成 · Sepolia 测试网</p>
          </div>
        </div>

        {/* Security Info */}
        <div className="card mb-4">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Shield size={14} style={{ color: 'var(--accent-cyan)' }} />
            安全保障
          </h3>
          <div className="space-y-2">
            {securityChecks.map(check => (
              <div key={check.id} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                  style={{ background: check.riskLevel === 'safe' ? 'var(--accent-green)' : 'var(--accent-blue)' }} />
                <div>
                  <p className="text-xs font-medium">{check.title}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{check.description.slice(0, 60)}...</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="card">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                设置密码
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input-field pr-10"
                  placeholder="至少 8 个字符"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                  style={{ color: 'var(--text-muted)' }}
                  onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                确认密码
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                className="input-field"
                placeholder="再次输入密码"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--accent-red)' }}>
                <AlertTriangle size={14} /> {error}
              </div>
            )}

            <button className="btn-primary w-full py-3" onClick={handleCreate} disabled={loading || !password || !confirmPassword}>
              {loading ? <><Loader2 size={16} className="animate-spin" /> 生成中...</> : '生成钱包'}
            </button>
          </div>

          <div className="testnet-banner mt-4">
            ⚠️ 助记词将仅在浏览器本地生成，不会上传至任何服务器
          </div>
        </div>
      </div>
    </div>
  );
}
