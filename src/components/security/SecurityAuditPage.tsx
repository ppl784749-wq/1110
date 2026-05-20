import { useApp } from '@/store/appContext';
import { Shield, AlertTriangle, CheckCircle, Info, XCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { auditTransaction, type SecurityAuditResult, type RiskLevel } from '@/lib/securityAudit';

const RISK_ICONS: Record<RiskLevel, React.ReactNode> = {
  safe: <CheckCircle size={16} style={{ color: 'var(--accent-green)' }} />,
  info: <Info size={16} style={{ color: 'var(--accent-blue)' }} />,
  warning: <AlertTriangle size={16} style={{ color: 'var(--accent-yellow)' }} />,
  danger: <AlertTriangle size={16} style={{ color: 'var(--accent-red)' }} />,
  blocked: <XCircle size={16} style={{ color: '#fca5a5' }} />,
};

export function SecurityAuditPage() {
  const { state, actions } = useApp();
  const { transaction } = state;

  const isContractInteraction = transaction.data !== '0x' && transaction.data !== '';
  const isTokenApproval = transaction.data?.startsWith('0x095ea7b3') || false;

  const auditResult: SecurityAuditResult = auditTransaction({
    to: transaction.to,
    value: transaction.value,
    data: transaction.data || '0x',
    isContractInteraction,
    isTokenApproval,
    approvalAmount: isTokenApproval ? 'unlimited' : '',
    isKnownContract: false,
    isVerified: false,
    functionSelector: transaction.data?.slice(0, 10) || '',
    fromAddress: state.wallet?.address || '',
  });

  const handleProceed = () => {
    actions.setSecurityScore(auditResult.securityScore);
    actions.addHistory({
      type: 'security_audit',
      status: 'success',
      details: `安全审查完成，评分 ${auditResult.securityScore}/100，风险等级：${auditResult.overallRisk}`,
      riskLevel: auditResult.overallRisk,
      securityScore: auditResult.securityScore,
    });
    actions.setStep('sign-tx');
  };

  return (
    <div className="max-w-2xl mx-auto fade-up">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-green))' }}>
          <Shield size={20} className="text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold">安全审查</h2>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>基于 Security Handbook 多维度审查</p>
        </div>
      </div>

      {/* Overall Score */}
      <div className="card mb-4" style={{
        borderColor: auditResult.overallRisk === 'safe' ? 'rgba(16,185,129,0.3)' :
          auditResult.overallRisk === 'warning' ? 'rgba(245,158,11,0.3)' :
          auditResult.overallRisk === 'danger' || auditResult.overallRisk === 'blocked' ? 'rgba(239,68,68,0.3)' :
          'rgba(59,130,246,0.3)'
      }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>安全评分</p>
            <p className="text-3xl font-bold">{auditResult.securityScore}<span className="text-base" style={{ color: 'var(--text-muted)' }}>/100</span></p>
          </div>
          <span className={`badge badge-${auditResult.overallRisk}`}>
            {auditResult.overallRisk === 'safe' ? '安全' :
              auditResult.overallRisk === 'info' ? '提示' :
              auditResult.overallRisk === 'warning' ? '警告' :
              auditResult.overallRisk === 'danger' ? '危险' : '已拦截'}
          </span>
        </div>
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{auditResult.summary}</p>
      </div>

      {/* Check Items */}
      <div className="space-y-3 mb-6">
        {auditResult.checks.map((check) => (
          <div key={check.id} className="card">
            <div className="flex gap-3">
              <div className="mt-0.5">{RISK_ICONS[check.riskLevel]}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium">{check.title}</p>
                  <span className={`badge badge-${check.riskLevel}`}>{check.riskLevel}</span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {check.description}
                </p>
                <p className="text-xs mt-2 px-2 py-1 rounded" style={{ background: 'var(--bg-input)', color: 'var(--text-muted)' }}>
                  📖 {check.reference}
                </p>
                {check.suggestion && (
                  <p className="text-xs mt-1" style={{ color: 'var(--accent-cyan)' }}>
                    💡 {check.suggestion}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button className="btn-secondary flex-1" onClick={() => actions.setStep('build-tx')}>
          <ArrowLeft size={14} /> 返回修改
        </button>
        <button className="btn-primary flex-1" onClick={handleProceed}
          disabled={auditResult.overallRisk === 'blocked'}
          style={auditResult.overallRisk === 'blocked' ? { opacity: 0.5, cursor: 'not-allowed' } : {}}>
          {auditResult.overallRisk === 'blocked' ? '交易已被拦截' : '继续签名'} <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
