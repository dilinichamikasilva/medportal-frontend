import React, { useState, useEffect } from 'react';
import API from '../api/axios';

export default function LabReports() {
  const [reports, setReports] = useState([]);
  const [testName, setTestName] = useState('');
  const [file, setFile] = useState(null);

  const fetchReports = async () => {
    try {
      const res = await API.get('/lab-reports');
      setReports(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching reports', err);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('testName', testName);
    if (file) formData.append('file', file);

    try {
      await API.post('/lab-reports', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setTestName('');
      setFile(null);
      fetchReports();
    } catch (err) {
      alert('Failed to upload report');
    }
  };

  return (
    <div className="tab-content">
      <h2>Lab Report Service (GCP Storage)</h2>
      <form onSubmit={handleSubmit} className="form-group">
        <input 
          type="text" 
          placeholder="Test Name" 
          value={testName} 
          onChange={(e) => setTestName(e.target.value)} 
          required 
        />
        <input 
          type="file" 
          onChange={(e) => setFile(e.target.files[0])} 
          required 
        />
        <button type="submit">Upload Report</button>
      </form>

      <h3>Lab Reports List</h3>
      <ul>
        {reports.map((item, idx) => (
          <li key={idx}>
            {item.testName} - <a href={item.fileUrl} target="_blank" rel="noreferrer">View File</a>
          </li>
        ))}
      </ul>
    </div>
  );
}