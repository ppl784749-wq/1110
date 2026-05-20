import { useApp } from '@/store/appContext';
import { Sidebar } from './Sidebar';
import { WelcomePage } from '@/components/wallet/WelcomePage';
import { CreateWalletPage } from '@/components/wallet/CreateWalletPage';
import { ImportWalletPage } from '@/components/wallet/ImportWalletPage';
import { BackupMnemonicPage } from '@/components/wallet/BackupMnemonicPage';
import { DashboardPage } from '@/components/wallet/DashboardPage';
import { IntentInputPage } from '@/components/transaction/IntentInputPage';
import { BuildTxPage } from '@/components/transaction/BuildTxPage';
import { SecurityAuditPage } from '@/components/security/SecurityAuditPage';
import { SignTxPage } from '@/components/transaction/SignTxPage';
import { BroadcastTxPage } from '@/components/transaction/BroadcastTxPage';
import { HistoryPage } from '@/components/history/HistoryPage';

export function AppLayout() {
  const { state } = useApp();
  const { currentStep, wallet } = state;

  const renderPage = () => {
    switch (currentStep) {
      case 'welcome':
        return <WelcomePage />;
      case 'create-wallet':
        return <CreateWalletPage />;
      case 'import-wallet':
        return <ImportWalletPage />;
      case 'backup-mnemonic':
        return <BackupMnemonicPage />;
      case 'dashboard':
        return <DashboardPage />;
      case 'intent-input':
        return <IntentInputPage />;
      case 'build-tx':
        return <BuildTxPage />;
      case 'security-audit':
        return <SecurityAuditPage />;
      case 'sign-tx':
        return <SignTxPage />;
      case 'broadcast-tx':
        return <BroadcastTxPage />;
      case 'history':
        return <HistoryPage />;
      default:
        return <WelcomePage />;
    }
  };

  // Full-screen pages without sidebar
  const fullScreenSteps = ['welcome', 'create-wallet', 'import-wallet', 'backup-mnemonic'];
  if (fullScreenSteps.includes(currentStep) || !wallet) {
    return <div className="h-screen overflow-auto" style={{ background: 'var(--bg-primary)' }}>{renderPage()}</div>;
  }

  return (
    <div className="flex h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Sidebar />
      <main className="flex-1 overflow-auto p-6">
        {renderPage()}
      </main>
    </div>
  );
}
