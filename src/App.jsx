import React, { useState } from 'react';
import Appointments from './components/Appointments';
import ClinicalRecords from './components/ClinicalRecords';
import LabReports from './components/LabReports';
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('appointments');

  return (
    <div className="container">
      <h1>Healthcare & Telemedicine Portal</h1>
      <div className="tabs">
        <button 
          className={activeTab === 'appointments' ? 'active' : ''} 
          onClick={() => setActiveTab('appointments')}
        >
          Appointments
        </button>
        <button 
          className={activeTab === 'records' ? 'active' : ''} 
          onClick={() => setActiveTab('records')}
        >
          Clinical Records
        </button>
        <button 
          className={activeTab === 'reports' ? 'active' : ''} 
          onClick={() => setActiveTab('reports')}
        >
          Lab Reports
        </button>
      </div>

      {activeTab === 'appointments' && <Appointments />}
      {activeTab === 'records' && <ClinicalRecords />}
      {activeTab === 'reports' && <LabReports />}
    </div>
  );
}