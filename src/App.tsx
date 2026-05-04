import { MatchDataProvider, MatchFilterProvider, AppProvider } from './contexts';
import AppLayout from './components/AppLayout';

export default function App() {
  return (
    <MatchDataProvider>
      <MatchFilterProvider>
        <AppProvider>
          <AppLayout />
        </AppProvider>
      </MatchFilterProvider>
    </MatchDataProvider>
  );
}
