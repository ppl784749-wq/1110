import { useApp } from '@/store/appContext';
import { History, CheckCircle, XCircle, Clock, ExternalLink, Shield, ArrowRightLeft, Key, Radio } from 'lucide-react';
import { getExplorerTxUrl } from '@/lib/sepolia';

const TYPE_ICONS: Record<string, React.ReactNode> = {
  create_wallet: <Key size={14} />,
  import_wallet: <Key size={14} />,
  sign_tx: <ArrowRightLeft size={14} />,
  broadcast_tx: <Radio size={14} />,
  security_audit: <Shield size={14} />,
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  success: <CheckCircle size={12} style={{ color: 'var(--accent-green)' }} />,
  failed: <XCircle size={12} style={{ color: 'var(--accent-red)' }} />,
  pending: <Clock size={12} style={{ color: 'var(--accent-yellow)' }} />,
};

export function HistoryPage() {
  const { state } = useApp();
  const { history, securityScore } = state;

  return (
    <div className="max-w-2xl mx-auto fade-up">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))' }}>
            <History size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold">操作历史</h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>所有操作记录与安全评分</p>
          </div>
        </div>

        {/* Security Score */}
        <div className="text-center">
          <div className="text-2xl font-bold" style={{ color: securityScore >= 80 ? 'var(--accent-green)' : securityScore >= 50 ? 'var(--accent-yellow)' : 'var(--accent-red)' }}>
            {securityScore}
          </div>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>安全评分</p>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="card text-center py-12">
          <History size={40} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>暂无操作记录</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>开始创建钱包或发起交易后，记录将出现在这里</p>
        </div>
      ) : (
        <div className="space-y-2">
          {history.map((entry) => (
            <div key={entry.id} className="card">
              <div className="flex gap-3">
                <div className="mt-0.5" style={{ color: 'var(--accent-blue)' }}>
                  {TYPE_ICONS[entry.type] || <History size={14} />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium">
                      {entry.type === 'create_wallet' ? '创建钱包' :
                        entry.type === 'import_wallet' ? '导入钱包' :
                        entry.type === 'sign_tx' ? '交易签名' :
                        entry.type === 'broadcast_tx' ? '广播交易' :
                        entry.type === 'security_audit' ? '安全审查' : entry.type}
                    </span>
                    <div className="flex items-center gap-2">
                      {STATUS_ICONS[entry.status]}
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {new Date(entry.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {entry.details}
                  </p>
                  {entry.txHash && (
                    <a
                      href={getExplorerTxUrl(entry.txHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs mt-1"
                      style={{ color: 'var(--accent-blue)' }}
                    >
                      查看交易 <ExternalLink size={10} />
                    </a>
                  )}
                  {entry.securityScore !== undefined && (
                    <div className="mt-1">
                      <span className={`badge badge-${entry.securityScore >= 80 ? 'safe' : entry.securityScore >= 50 ? 'warning' : 'danger'}`}>
                        评分 {entry.securityScore}/100
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
