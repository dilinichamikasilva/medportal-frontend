import React, { useState, useEffect } from 'react';
import API from '../api/axios';

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [patientName, setPatientName] = useState('');
  const [doctorName, setDoctorName] = useState('');

  const fetchAppointments = async () => {
    try {
      const res = await API.get('/appointments');
      setAppointments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching appointments', err);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/appointments', { patientName, doctorName });
      setPatientName('');
      setDoctorName('');
      fetchAppointments();
    } catch (err) {
      alert('Failed to add appointment');
    }
  };

  return (
    <div className="tab-content">
      <h2>Appointment Service (MySQL)</h2>
      <form onSubmit={handleSubmit} className="form-group">
        <input 
          type="text" 
          placeholder="Patient Name" 
          value={patientName} 
          onChange={(e) => setPatientName(e.target.value)} 
          required 
        />
        <input 
          type="text" 
          placeholder="Doctor Name" 
          value={doctorName} 
          onChange={(e) => setDoctorName(e.target.value)} 
          required 
        />
        <button type="submit">Book Appointment</button>
      </form>

      <h3>Appointments List</h3>
      <ul>
        {appointments.map((item, idx) => (
          <li key={idx}>{item.patientName} - Doctor: {item.doctorName}</li>
        ))}
      </ul>
    </div>
  );
}