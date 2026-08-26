import React, { useState } from 'react';
import Appointments from './components/Appointments';
import ClinicalRecords from './components/ClinicalRecords';
import LabReports from './components/LabReports';
import './App.css';

const TABS = [
  {
    id: 'appointments',
    label: 'Appointments',
    color: '#1f6f5c',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="5" width="18" height="16" rx="2.5" />
        <path d="M3 10h18" />
        <path d="M8 3v4M16 3v4" />
        <path d="M8 14h2M14 14h2M8 17h2M14 17h2" />
      </svg>
    ),
  },
  {
    id: 'records',
    label: 'Clinical Records',
    color: '#3a4b8c',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
        <path d="M14 3v5h5" />
        <path d="M9 13h6M9 17h4" />
      </svg>
    ),
  },
  {
    id: 'reports',
    label: 'Lab Reports',
    color: '#a97323',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 18a4.5 4.5 0 0 1-1-8.9A5.5 5.5 0 0 1 16.8 8 4 4 0 0 1 17 16H16" />
        <path d="M12 12v7M9.5 16.5 12 19l2.5-2.5" />
      </svg>
    ),
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('appointments');
  const active = TABS.find((t) => t.id === activeTab);

  return (
    <div className="shell">
      <header className="masthead">
        <div className="masthead-eyebrow">Front desk</div>
        <h1 className="masthead-title">Healthcare &amp; Telemedicine Portal</h1>
        <p className="masthead-sub">
          Book appointments, keep clinical records, and manage lab reports from one place.
        </p>
        <svg className="pulse-rule" viewBox="0 0 920 22" preserveAspectRatio="none">
          <path
            d="M0 11 H360 L378 2 L396 20 L414 11 H560 L578 4 L596 18 L614 11 H920"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </header>

      <nav className="folder-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={activeTab === tab.id ? 'folder-tab active' : 'folder-tab'}
            style={{ '--tab-color': tab.color }}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      <div
        className="panel"
        style={{ '--panel-color': active.color, '--panel-color-soft': `${active.color}1f` }}
      >
        {activeTab === 'appointments' && <Appointments />}
        {activeTab === 'records' && <ClinicalRecords />}
        {activeTab === 'reports' && <LabReports />}
      </div>
    </div>
  );
}
