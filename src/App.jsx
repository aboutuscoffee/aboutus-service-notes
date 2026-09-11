import { useState } from 'react';
import RecordTab from './components/RecordTab.jsx';
import SummaryTab from './components/SummaryTab.jsx';

export default function App() {
  const [tab, setTab] = useState('record');
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>接客ノート</h1>
      </header>

      <nav className="tab-bar">
        <button
          type="button"
          className={`tab-btn ${tab === 'record' ? 'active' : ''}`}
          onClick={() => setTab('record')}
        >
          記録する
        </button>
        <button
          type="button"
          className={`tab-btn ${tab === 'summary' ? 'active' : ''}`}
          onClick={() => setTab('summary')}
        >
          集計・履歴
        </button>
      </nav>

      <main className="app-main">
        {tab === 'record' ? (
          <RecordTab onSaved={() => setRefreshKey((k) => k + 1)} />
        ) : (
          <SummaryTab refreshKey={refreshKey} />
        )}
      </main>
    </div>
  );
}
