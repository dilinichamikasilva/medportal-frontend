import React, { useState, useEffect } from 'react';
import API from '../api/axios';

export default function ClinicalRecords() {
  const [records, setRecords] = useState([]);
  const [patientId, setPatientId] = useState('');
  const [diagnosis, setDiagnosis] = useState('');

  const fetchRecords = async () => {
    try {
      const res = await API.get('/records');
      setRecords(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching records', err);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/records', { patientId, diagnosis });
      setPatientId('');
      setDiagnosis('');
      fetchRecords();
    } catch (err) {
      alert('Failed to add record');
    }
  };

  return (
    <div className="tab-content">
      <h2>Clinical Records Service (MongoDB)</h2>
      <form onSubmit={handleSubmit} className="form-group">
        <input 
          type="text" 
          placeholder="Patient ID" 
          value={patientId} 
          onChange={(e) => setPatientId(e.target.value)} 
          required 
        />
        <input 
          type="text" 
          placeholder="Diagnosis Details" 
          value={diagnosis} 
          onChange={(e) => setDiagnosis(e.target.value)} 
          required 
        />
        <button type="submit">Save Record</button>
      </form>

      <h3>Clinical Records List</h3>
      <ul>
        {records.map((item, idx) => (
          <li key={idx}>Patient #{item.patientId} - {item.diagnosis}</li>
        ))}
      </ul>
    </div>
  );
}