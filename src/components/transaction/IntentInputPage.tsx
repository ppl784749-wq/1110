import { useApp } from '@/store/appContext';
import { ArrowRightLeft, Sparkles, ArrowRight, Lightbulb } from 'lucide-react';
import { useState } from 'react';
import { parseIntentLocally, getIntentSuggestions } from '@/lib/intentParser';
import type { ParsedIntent } from '@/lib/intentParser';

export function IntentInputPage() {
  const { state, actions } = useApp();
  const [input, setInput] = useState('');
  const [parsedIntent, setParsedIntent] = useState<ParsedIntent | null>(null);
  const [mode, setMode] = useState<'intent' | 'manual'>('intent');

  const suggestions = getIntentSuggestions();

  const handleParse = () => {
    if (!input.trim()) return;
    const result = parseIntentLocally(input);
    setParsedIntent(result);

    if (result.confidence > 0) {
      actions.setTransaction({
        to: result.to,
        value: result.value,
        data: result.data,
      });
    }
  };

  const handleManualBuild = () => {
    actions.setStep('build-tx');
  };

  const handleProceed = () => {
    actions.setStep('build-tx');
  };

  return (
    <div className="max-w-2xl mx-auto fade-up">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))' }}>
          <ArrowRightLeft size={20} className="text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold">发起交易</h2>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>自然语言输入或手动构建</p>
        </div>
      </div>

      {/* Mode Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          className="flex-1 py-2 text-xs font-medium rounded-lg cursor-pointer"
          style={{
            background: mode === 'intent' ? 'var(--glow-blue)' : 'var(--bg-card)',
            border: mode === 'intent' ? '1px solid rgba(59,130,246,0.3)' : '1px solid var(--border-primary)',
            color: mode === 'intent' ? 'var(--accent-blue)' : 'var(--text-secondary)',
          }}
          onClick={() => setMode('intent')}>
          <Sparkles size={12} className="inline mr-1" /> 意图输入
        </button>
        <button
          className="flex-1 py-2 text-xs font-medium rounded-lg cursor-pointer"
          style={{
            background: mode === 'manual' ? 'var(--glow-blue)' : 'var(--bg-card)',
            border: mode === 'manual' ? '1px solid rgba(59,130,246,0.3)' : '1px solid var(--border-primary)',
            color: mode === 'manual' ? 'var(--accent-blue)' : 'var(--text-secondary)',
          }}
          onClick={() => setMode('manual')}>
          手动构建
        </button>
      </div>

      {mode === 'intent' ? (
        <>
          <div className="card mb-4">
            <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              描述你的交易意图
            </label>
            <textarea
              className="input-field min-h-[80px] resize-none"
              placeholder="例如：Send 0.01 ETH to 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleParse(); } }}
            />
            <button className="btn-primary w-full mt-3" onClick={handleParse} disabled={!input.trim()}>
              <Sparkles size={14} /> 解析意图
            </button>
          </div>

          {/* Suggestions */}
          <div className="card mb-4">
            <h4 className="text-xs font-medium mb-2 flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
              <Lightbulb size={12} /> 示例意图
            </h4>
            <div className="space-y-2">
              {suggestions.map((s, i) => (
                <button key={i} className="w-full text-left text-xs px-3 py-2 rounded-lg cursor-pointer"
                  style={{ background: 'var(--bg-input)', color: 'var(--text-secondary)', border: '1px solid var(--border-primary)' }}
                  onClick={() => { setInput(s); }}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Parsed Result */}
          {parsedIntent && (
            <div className="card" style={{ borderColor: parsedIntent.confidence > 0 ? 'rgba(59,130,246,0.3)' : 'rgba(239,68,68,0.3)' }}>
              <h4 className="text-sm font-semibold mb-3">解析结果</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span style={{ color: 'var(--text-muted)' }}>操作</span>
                  <span className="font-medium">{parsedIntent.action}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span style={{ color: 'var(--text-muted)' }}>目标地址</span>
                  <span className="font-mono">{parsedIntent.to.slice(0, 10)}...{parsedIntent.to.slice(-6)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span style={{ color: 'var(--text-muted)' }}>金额</span>
                  <span className="font-medium">{parsedIntent.value} ETH</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span style={{ color: 'var(--text-muted)' }}>描述</span>
                  <span>{parsedIntent.description}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span style={{ color: 'var(--text-muted)' }}>置信度</span>
                  <span className={`badge badge-${parsedIntent.confidence >= 0.8 ? 'safe' : parsedIntent.confidence >= 0.5 ? 'warning' : 'danger'}`}>
                    {Math.round(parsedIntent.confidence * 100)}%
                  </span>
                </div>
              </div>
              <button className="btn-primary w-full mt-4" onClick={handleProceed}>
                继续构建交易 <ArrowRight size={14} />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="card">
          <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
            手动输入交易参数，所有字段均可编辑。
          </p>
          <button className="btn-primary w-full" onClick={handleManualBuild}>
            进入交易构建器 <ArrowRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
