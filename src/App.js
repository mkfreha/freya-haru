import { useState } from 'react'
import Tracker from './components/Tracker'
import Calendar from './components/Calendar'
import Scratch from './components/Scratch'
import './App.css'

export default function App() {
  const [page, setPage] = useState('tracker')

  return (
    <div className="app">
      <header className="app-header">
        <div className="paw-deco">🐾 🐾 🐾</div>
        <h1>Freya <em>&</em> Haru</h1>
        <div className="subtitle">ежедневный уход</div>
      </header>

      <nav className="nav-tabs">
        {[
          { id: 'tracker',  label: '📋 Уход' },
          { id: 'calendar', label: '📅 Календарь' },
          { id: 'scratch',  label: '💡 Идеи' },
        ].map(tab => (
          <button
            key={tab.id}
            className={`nav-tab ${page === tab.id ? 'active' : ''}`}
            onClick={() => setPage(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="page-content">
        {page === 'tracker'  && <Tracker />}
        {page === 'calendar' && <Calendar />}
        {page === 'scratch'  && <Scratch />}
      </main>
    </div>
  )
}
