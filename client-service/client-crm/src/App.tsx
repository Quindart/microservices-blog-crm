import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from './components/atoms/Button';
import { LoginScreen } from './components/organisms/LoginScreen';
import { Sidebar } from './components/organisms/Sidebar';
import { AppHeader } from './components/organisms/AppHeader';
import { DashboardOverview } from './components/organisms/DashboardOverview';
import { RecordsTable } from './components/organisms/RecordsTable';
import type { Module } from './types';
import './App.css';

function App({ initialModule = 'Overview' }: { initialModule?: Module }) {
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => localStorage.getItem('northstar-auth') === 'true'
  );
  const [active] = useState<Module>(initialModule);
  const [query, setQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  if (!isLoggedIn)
    return (
      <LoginScreen
        onLogin={() => {
          localStorage.setItem('northstar-auth', 'true');
          setIsLoggedIn(true);
        }}
      />
    );
  return (
    <div className="app-shell">
      <Sidebar
        active={active}
        onLogout={() => {
          localStorage.removeItem('northstar-auth');
          setIsLoggedIn(false);
        }}
        open={sidebarOpen}
      />
      <section className="main">
        <AppHeader
          active={active}
          open={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        <div className="content">
          <div className="page-heading">
            <div>
              <span className="eyebrow">TUESDAY, SEPTEMBER 01, 2026</span>
              <h1>{active === 'Overview' ? 'Good morning, Alex.' : active}</h1>
              <p>
                {active === 'Overview'
                  ? 'Here is what is happening across your workspace.'
                  : `Keep your ${active.toLowerCase()} operations moving.`}
              </p>
            </div>
            <Button variant="primary">
              <Plus size={17} /> Add new
            </Button>
          </div>
          {active === 'Overview' ? (
            <DashboardOverview />
          ) : (
            <RecordsTable
              active={active}
              query={query}
              onQueryChange={setQuery}
            />
          )}
        </div>
      </section>
    </div>
  );
}
export default App;
