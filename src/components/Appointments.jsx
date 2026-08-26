import React, { useState, useEffect } from 'react';
import API from '../api/axios';

function initials(name = '') {
  return name
    .replace(/^Dr\.?\s*/i, '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('') || '?';
}

function statusClass(status) {
  const s = (status || 'pending').toLowerCase();
  if (['confirmed', 'accepted'].includes(s)) return 'badge badge-confirmed';
  if (['completed', 'done'].includes(s)) return 'badge badge-completed';
  if (['cancelled', 'canceled', 'rejected'].includes(s)) return 'badge badge-cancelled';
  return 'badge badge-pending';
}

const EmptyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="5" width="18" height="16" rx="2.5" />
    <path d="M3 10h18M8 3v4M16 3v4" />
  </svg>
);

export default function Appointments() {
  const [subTab, setSubTab] = useState('appointments'); // 'appointments' | 'patients' | 'doctors'

  // Data states
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states - Appointments
  const [patientId, setPatientId] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');

  // Form states - Patients
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientContact, setPatientContact] = useState('');
  const [searchContact, setSearchContact] = useState('');

  // Form states - Doctors
  const [docName, setDocName] = useState('');
  const [docSpecialization, setDocSpecialization] = useState('');
  const [docContact, setDocContact] = useState('');

  // Fetch functions
  const fetchAppointments = async () => {
    try {
      const res = await API.get('/appointments');
      setAppointments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching appointments', err);
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await API.get('/patients');
      setPatients(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching patients', err);
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await API.get('/doctors');
      setDoctors(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching doctors', err);
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([fetchAppointments(), fetchPatients(), fetchDoctors()]);
      setLoading(false);
    })();
  }, []);

  const patientName_ = (id) => patients.find((p) => String(p.id) === String(id))?.name;
  const doctorName_ = (id) => doctors.find((d) => String(d.id) === String(id))?.name;

  // Handlers
  const handleAppointmentSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/appointments', {
        patientId: Number(patientId),
        doctorId: Number(doctorId),
        appointmentTime
      });
      setPatientId('');
      setDoctorId('');
      setAppointmentTime('');
      fetchAppointments();
    } catch (err) {
      alert('Failed to add appointment');
    }
  };

  const handlePatientSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/patients', {
        name: patientName,
        age: Number(patientAge),
        contactNumber: patientContact
      });
      setPatientName('');
      setPatientAge('');
      setPatientContact('');
      fetchPatients();
    } catch (err) {
      alert('Failed to register patient');
    }
  };

  const handleDoctorSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/doctors', {
        name: docName,
        specialization: docSpecialization,
        contactNumber: docContact
      });
      setDocName('');
      setDocSpecialization('');
      setDocContact('');
      fetchDoctors();
    } catch (err) {
      alert('Failed to register doctor');
    }
  };

  const handlePatientSearch = async (e) => {
    e.preventDefault();
    if (!searchContact) return fetchPatients();
    try {
      const res = await API.get(`/patients/search?contactNumber=${searchContact}`);
      setPatients(res.data ? [res.data] : []);
    } catch (err) {
      alert('Patient not found with this contact number');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await API.patch(`/appointments/${id}/status`, null, { params: { status } });
      fetchAppointments();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  return (
    <>
      <div className="sub-tabs">
        <button
          className={subTab === 'appointments' ? 'sub-tab sub-active' : 'sub-tab'}
          onClick={() => setSubTab('appointments')}
        >
          Appointments
        </button>
        <button
          className={subTab === 'patients' ? 'sub-tab sub-active' : 'sub-tab'}
          onClick={() => setSubTab('patients')}
        >
          Patients
        </button>
        <button
          className={subTab === 'doctors' ? 'sub-tab sub-active' : 'sub-tab'}
          onClick={() => setSubTab('doctors')}
        >
          Doctors
        </button>
      </div>

      {/* TAB 1: APPOINTMENTS */}
      {subTab === 'appointments' && (
        <>
          <div className="panel-head">
            <div className="panel-kicker">Appointments</div>
            <div className="panel-title">Book an appointment</div>
            <div className="panel-desc">Pick a registered patient and doctor, and a time that works.</div>
          </div>

          <form onSubmit={handleAppointmentSubmit} className="intake">
            <div className="field">
              <label htmlFor="apt-patient">Patient</label>
              <select
                id="apt-patient"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                required
              >
                <option value="" disabled>
                  {patients.length ? 'Select a patient' : 'No patients registered yet'}
                </option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} — ID {p.id}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="apt-doctor">Doctor</label>
              <select
                id="apt-doctor"
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
                required
              >
                <option value="" disabled>
                  {doctors.length ? 'Select a doctor' : 'No doctors registered yet'}
                </option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>{d.name} — {d.specialization}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="apt-time">Date &amp; time</label>
              <input
                id="apt-time"
                type="datetime-local"
                value={appointmentTime}
                onChange={(e) => setAppointmentTime(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-primary">Book appointment</button>
          </form>

          <div className="section-label">
            <span>Upcoming &amp; recent</span>
            <span className="count">{appointments.length}</span>
          </div>

          {loading ? (
            <div className="loading-row">Loading appointments…</div>
          ) : appointments.length === 0 ? (
            <div className="empty-state">
              <EmptyIcon />
              <div className="empty-state-title">No appointments yet</div>
              <div className="empty-state-sub">Book the first one using the form above.</div>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Appointment</th>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((item) => (
                    <tr key={item.id}>
                      <td data-label="Appointment"><span className="id-chip">#{item.id}</span></td>
                      <td data-label="Patient">
                        <span className="id-chip">P-{item.patientId}</span>
                        {patientName_(item.patientId) && <span className="who-sub"> {patientName_(item.patientId)}</span>}
                      </td>
                      <td data-label="Doctor">
                        <span className="id-chip">D-{item.doctorId}</span>
                        {doctorName_(item.doctorId) && <span className="who-sub"> {doctorName_(item.doctorId)}</span>}
                      </td>
                      <td data-label="Status">
                        <select
                          className={`status-select ${statusClass(item.status)}`}
                          value={(item.status || 'PENDING').toUpperCase()}
                          onChange={(e) => handleStatusChange(item.id, e.target.value)}
                        >
                          <option value="PENDING">Pending</option>
                          <option value="CONFIRMED">Confirmed</option>
                          <option value="COMPLETED">Completed</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* TAB 2: PATIENTS */}
      {subTab === 'patients' && (
        <>
          <div className="panel-head">
            <div className="panel-kicker">MySQL · patients</div>
            <div className="panel-title">Register a patient</div>
            <div className="panel-desc">Add a new patient to the directory.</div>
          </div>

          <form onSubmit={handlePatientSubmit} className="intake">
            <div className="field">
              <label htmlFor="pat-name">Full name</label>
              <input
                id="pat-name"
                type="text"
                placeholder="e.g. Nimal Perera"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="pat-age">Age</label>
              <input
                id="pat-age"
                type="number"
                placeholder="e.g. 34"
                value={patientAge}
                onChange={(e) => setPatientAge(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="pat-contact">Contact number</label>
              <input
                id="pat-contact"
                type="text"
                placeholder="e.g. 0771234567"
                value={patientContact}
                onChange={(e) => setPatientContact(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-primary">Register patient</button>
          </form>

          <div className="section-label">
            <span>Directory</span>
            <span className="count">{patients.length}</span>
          </div>

          <div className="search-row" style={{ marginBottom: 16 }}>
            <form onSubmit={handlePatientSearch}>
              <div className="field">
                <label htmlFor="pat-search">Search by contact number</label>
                <input
                  id="pat-search"
                  type="text"
                  placeholder="0771234567"
                  value={searchContact}
                  onChange={(e) => setSearchContact(e.target.value)}
                />
              </div>
              <button type="submit" className="btn-secondary">Search</button>
              <button type="button" className="btn-secondary" onClick={() => { setSearchContact(''); fetchPatients(); }}>Reset</button>
            </form>
          </div>

          {loading ? (
            <div className="loading-row">Loading patients…</div>
          ) : patients.length === 0 ? (
            <div className="empty-state">
              <EmptyIcon />
              <div className="empty-state-title">No patients found</div>
              <div className="empty-state-sub">Try a different contact number, or register a new patient above.</div>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Age</th>
                    <th>Contact</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((p) => (
                    <tr key={p.id}>
                      <td data-label="Patient">
                        <div className="who">
                          <span className="avatar">{initials(p.name)}</span>
                          <div>
                            <div className="who-name">{p.name}</div>
                            <div className="who-sub">ID {p.id}</div>
                          </div>
                        </div>
                      </td>
                      <td data-label="Age">{p.age} yrs</td>
                      <td data-label="Contact">{p.contactNumber}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* TAB 3: DOCTORS */}
      {subTab === 'doctors' && (
        <>
          <div className="panel-head">
            <div className="panel-kicker">MySQL · doctors</div>
            <div className="panel-title">Register a doctor</div>
            <div className="panel-desc">Add a new doctor to the roster.</div>
          </div>

          <form onSubmit={handleDoctorSubmit} className="intake">
            <div className="field">
              <label htmlFor="doc-name">Doctor name</label>
              <input
                id="doc-name"
                type="text"
                placeholder="e.g. Dr. Kasun"
                value={docName}
                onChange={(e) => setDocName(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="doc-spec">Specialization</label>
              <input
                id="doc-spec"
                type="text"
                placeholder="e.g. Cardiology"
                value={docSpecialization}
                onChange={(e) => setDocSpecialization(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="doc-contact">Contact number</label>
              <input
                id="doc-contact"
                type="text"
                placeholder="e.g. 0771234567"
                value={docContact}
                onChange={(e) => setDocContact(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-primary">Register doctor</button>
          </form>

          <div className="section-label">
            <span>Roster</span>
            <span className="count">{doctors.length}</span>
          </div>

          {loading ? (
            <div className="loading-row">Loading doctors…</div>
          ) : doctors.length === 0 ? (
            <div className="empty-state">
              <EmptyIcon />
              <div className="empty-state-title">No doctors yet</div>
              <div className="empty-state-sub">Register the first one using the form above.</div>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Doctor</th>
                    <th>Specialization</th>
                    <th>Contact</th>
                  </tr>
                </thead>
                <tbody>
                  {doctors.map((d) => (
                    <tr key={d.id}>
                      <td data-label="Doctor">
                        <div className="who">
                          <span className="avatar">{initials(d.name)}</span>
                          <div>
                            <div className="who-name">{d.name}</div>
                            <div className="who-sub">ID {d.id}</div>
                          </div>
                        </div>
                      </td>
                      <td data-label="Specialization">{d.specialization}</td>
                      <td data-label="Contact">{d.contactNumber}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </>
  );
}
