import { AppProvider } from '@/store/appProvider';
import { AppLayout } from '@/components/layout/AppLayout';

function App() {
  return (
    <AppProvider>
      <AppLayout />
    </AppProvider>
  );
}

export default App;
