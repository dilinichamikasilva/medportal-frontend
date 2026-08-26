import React, { useState, useEffect } from 'react';
import API from '../api/axios';

const UploadIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 18a4.5 4.5 0 0 1-1-8.9A5.5 5.5 0 0 1 16.8 8 4 4 0 0 1 17 16H16" />
    <path d="M12 12v7M9.5 16.5 12 19l2.5-2.5" />
  </svg>
);

export default function LabReports() {
  const [reports, setReports] = useState([]);
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    patientName: '',
    contactNumber: '',
    reportType: 'Full Blood Count',
    reportDate: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);

  // Upload කරපු වාර්තා Fetch කරගැනීම
  const fetchReports = async () => {
    try {
      const res = await API.get('/lab-reports');
      setReports(res.data);
    } catch (err) {
      console.error('Failed to fetch reports', err);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert('Please select a file to upload!');
      return;
    }

    const uploadData = new FormData();
    uploadData.append('file', file);
    uploadData.append('patientName', formData.patientName);
    uploadData.append('contactNumber', formData.contactNumber);
    uploadData.append('reportType', formData.reportType);
    uploadData.append('reportDate', formData.reportDate);

    setLoading(true);
    try {
      await API.post('/lab-reports/upload', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Lab report attached & saved successfully!');
      
      // Reset Form
      setFile(null);
      setFormData({
        patientName: '',
        contactNumber: '',
        reportType: 'Full Blood Count',
        reportDate: new Date().toISOString().split('T')[0]
      });
      fetchReports(); // Refresh table
    } catch (err) {
      alert('Failed to upload lab report.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="panel-head">
        <div className="panel-kicker">Lab Management</div>
        <div className="panel-title">Patient Lab Reports</div>
        <div className="panel-desc">Attach lab scans/PDFs directly to patient records and cloud storage.</div>
      </div>

      {/* Intake Form */}
      <form onSubmit={handleSubmit} className="intake" style={{ marginBottom: '32px' }}>
        <div className="field">
          <label>Patient Name</label>
          <input
            type="text"
            name="patientName"
            placeholder="e.g. John Doe"
            value={formData.patientName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="field">
          <label>Contact Number</label>
          <input
            type="text"
            name="contactNumber"
            placeholder="e.g. 0771234567"
            value={formData.contactNumber}
            onChange={handleChange}
            required
          />
        </div>

        <div className="field">
          <label>Report Type</label>
          <select name="reportType" value={formData.reportType} onChange={handleChange}>
            <option value="Full Blood Count">Full Blood Count (FBC)</option>
            <option value="Lipid Profile">Lipid Profile</option>
            <option value="Urinalysis">Urinalysis</option>
            <option value="X-Ray Scan">X-Ray / MRI Scan</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="field">
          <label>Report Date</label>
          <input
            type="date"
            name="reportDate"
            value={formData.reportDate}
            onChange={handleChange}
            required
          />
        </div>

        <div className="field field-full">
          <label>Attach File (PDF / Image)</label>
          <div className="upload-zone" style={{ padding: '20px' }}>
            <UploadIcon />
            <div className="upload-controls">
              <input
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                required
              />
            </div>
            {file && <div className="file-name">Selected: {file.name}</div>}
          </div>
        </div>

        <div className="field-full" style={{ textAlign: 'right', marginTop: '10px' }}>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Uploading & Saving…' : 'Save & Upload Report'}
          </button>
        </div>
      </form>

      {/* Data Table */}
      <div className="section-label">
        Uploaded Reports <span className="count">({reports.length})</span>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Patient Details</th>
              <th>Report Type</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {reports.length === 0 ? (
              <tr>
                <td colSpan="5" className="empty-state">
                  No lab reports uploaded yet.
                </td>
              </tr>
            ) : (
              reports.map((item) => (
                <tr key={item.id}>
                  <td data-label="ID">
                    <span className="id-chip">#LAB-{item.id}</span>
                  </td>
                  <td data-label="Patient Details">
                    <div className="who">
                      <div className="avatar">{item.patientName?.[0] || 'P'}</div>
                      <div>
                        <div className="who-name">{item.patientName}</div>
                        <div className="who-sub">{item.contactNumber}</div>
                      </div>
                    </div>
                  </td>
                  <td data-label="Report Type">
                    <span className="badge badge-confirmed">{item.reportType}</span>
                  </td>
                  <td data-label="Date">{item.reportDate}</td>
                  <td data-label="Action">
                    <a
                      href={item.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-secondary"
                      style={{ textDecoration: 'none', display: 'inline-block' }}
                    >
                      View Document ↗
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}