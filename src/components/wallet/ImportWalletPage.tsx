import { useApp } from '@/store/appContext';
import { ArrowLeft, Key, Eye, EyeOff, AlertTriangle, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { importWalletFromMnemonic, deriveEthAccount } from '@/lib/tokenCore';
import { auditWalletImport } from '@/lib/securityAudit';
import { getBalance } from '@/lib/sepolia';

export function ImportWalletPage() {
  const { actions } = useApp();
  const [mode, setMode] = useState<'mnemonic' | 'keystore'>('mnemonic');
  const [mnemonic, setMnemonic] = useState('');
  const [keystoreJson, setKeystoreJson] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const securityChecks = auditWalletImport();

  const handleImport = async () => {
    if (mode === 'mnemonic' && !mnemonic.trim()) {
      setError('请输入助记词');
      return;
    }
    if (!password) {
      setError('请输入密码');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let result;
      if (mode === 'mnemonic') {
        result = await importWalletFromMnemonic(mnemonic.trim(), password, 'TESTNET');
      } else {
        if (!keystoreJson.trim()) {
          setError('请输入 Keystore JSON');
          return;
        }
        result = { keystoreJson: keystoreJson.trim(), mnemonic: '' };
      }

      const account = await deriveEthAccount(result.keystoreJson, password, '11155111', 'TESTNET');

      let balance = '0.0000';
      try {
        const bal = await getBalance(account.address);
        balance = (Number(bal) / 1e18).toFixed(4);
      } catch {
        // ok
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
        type: 'import_wallet',
        status: 'success',
        details: `钱包导入成功: ${account.address.slice(0, 10)}...${account.address.slice(-6)}`,
      });
      actions.setStep('dashboard');
    } catch (err: any) {
      setError(err?.message || '导入失败，请检查输入');
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
            <h2 className="text-xl font-bold">导入钱包</h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>本地处理 · 不会上传密钥</p>
          </div>
        </div>

        {/* Security Warning */}
        <div className="card mb-4" style={{ borderColor: 'rgba(245,158,11,0.3)' }}>
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-2" style={{ color: 'var(--accent-yellow)' }}>
            <AlertTriangle size={14} /> 安全提醒
          </h3>
          {securityChecks.map(check => (
            <div key={check.id} className="flex items-start gap-2 mb-2">
              <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                style={{ background: check.riskLevel === 'safe' ? 'var(--accent-green)' : 'var(--accent-yellow)' }} />
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{check.description.slice(0, 80)}...</p>
            </div>
          ))}
        </div>

        {/* Mode Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            className={`flex-1 py-2 text-xs font-medium rounded-lg cursor-pointer ${mode === 'mnemonic' ? 'active-tab' : ''}`}
            style={{
              background: mode === 'mnemonic' ? 'var(--glow-blue)' : 'var(--bg-card)',
              border: mode === 'mnemonic' ? '1px solid rgba(59,130,246,0.3)' : '1px solid var(--border-primary)',
              color: mode === 'mnemonic' ? 'var(--accent-blue)' : 'var(--text-secondary)',
            }}
            onClick={() => setMode('mnemonic')}>
            助记词导入
          </button>
          <button
            className={`flex-1 py-2 text-xs font-medium rounded-lg cursor-pointer ${mode === 'keystore' ? 'active-tab' : ''}`}
            style={{
              background: mode === 'keystore' ? 'var(--glow-blue)' : 'var(--bg-card)',
              border: mode === 'keystore' ? '1px solid rgba(59,130,246,0.3)' : '1px solid var(--border-primary)',
              color: mode === 'keystore' ? 'var(--accent-blue)' : 'var(--text-secondary)',
            }}
            onClick={() => setMode('keystore')}>
            Keystore 导入
          </button>
        </div>

        {/* Form */}
        <div className="card">
          <div className="space-y-4">
            {mode === 'mnemonic' ? (
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  助记词
                </label>
                <textarea
                  className="input-field min-h-[80px] resize-none"
                  placeholder="请输入 12 或 24 个英文单词，用空格分隔"
                  value={mnemonic}
                  onChange={e => setMnemonic(e.target.value)}
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Keystore JSON
                </label>
                <textarea
                  className="input-field min-h-[80px] resize-none font-mono text-xs"
                  placeholder="粘贴 Keystore JSON 内容"
                  value={keystoreJson}
                  onChange={e => setKeystoreJson(e.target.value)}
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                密码
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input-field pr-10"
                  placeholder="输入密码以解密 Keystore"
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

            {error && (
              <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--accent-red)' }}>
                <AlertTriangle size={14} /> {error}
              </div>
            )}

            <button className="btn-primary w-full py-3" onClick={handleImport}
              disabled={loading || (mode === 'mnemonic' ? !mnemonic.trim() : !keystoreJson.trim()) || !password}>
              {loading ? <><Loader2 size={16} className="animate-spin" /> 导入中...</> : '导入钱包'}
            </button>
          </div>

          <div className="testnet-banner mt-4">
            ⚠️ 请勿输入真实助记词！本工具仅供 Sepolia 测试网演示
          </div>
        </div>
      </div>
    </div>
  );
}
