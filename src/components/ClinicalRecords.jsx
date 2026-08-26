import React, { useState, useEffect } from 'react';
import API from '../api/axios';

const EmptyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
    <path d="M14 3v5h5" />
  </svg>
);

const SEVERITIES = ['Mild', 'Moderate', 'Severe', 'Critical'];

export default function ClinicalRecords() {
  const [records, setRecords] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Core fields
  const [patientId, setPatientId] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [appointmentId, setAppointmentId] = useState('');
  const [recordDate, setRecordDate] = useState('');

  // Diagnosis details
  const [primaryDiagnosis, setPrimaryDiagnosis] = useState('');
  const [icdCode, setIcdCode] = useState('');
  const [severity, setSeverity] = useState('');
  const [symptomsInput, setSymptomsInput] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');

  // Prescriptions — built up one at a time before submit
  const [prescriptions, setPrescriptions] = useState([]);
  const [rxMedicineName, setRxMedicineName] = useState('');
  const [rxDosage, setRxDosage] = useState('');
  const [rxFrequency, setRxFrequency] = useState('');
  const [rxDuration, setRxDuration] = useState('');
  const [rxInstructions, setRxInstructions] = useState('');

  const fetchAllRecords = async () => {
    try {
      const res = await API.get('/records');
      setRecords(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching records', err);
    }
  };

  // Read-only lookups to power the Patient/Doctor/Appointment dropdowns —
  // same endpoints the Appointments tab already calls.
  const fetchLookups = async () => {
    try {
      const [p, d, a] = await Promise.all([
        API.get('/patients'),
        API.get('/doctors'),
        API.get('/appointments')
      ]);
      setPatients(Array.isArray(p.data) ? p.data : []);
      setDoctors(Array.isArray(d.data) ? d.data : []);
      setAppointments(Array.isArray(a.data) ? a.data : []);
    } catch (err) {
      console.error('Error fetching lookups', err);
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([fetchAllRecords(), fetchLookups()]);
      setLoading(false);
    })();
  }, []);

  const patientName_ = (id) => patients.find((p) => String(p.id) === String(id))?.name;
  const doctorName_ = (id) => doctors.find((d) => String(d.id) === String(id))?.name;

  const resetForm = () => {
    setPatientId('');
    setDoctorId('');
    setAppointmentId('');
    setRecordDate('');
    setPrimaryDiagnosis('');
    setIcdCode('');
    setSeverity('');
    setSymptomsInput('');
    setClinicalNotes('');
    setPrescriptions([]);
    setRxMedicineName('');
    setRxDosage('');
    setRxFrequency('');
    setRxDuration('');
    setRxInstructions('');
  };

  const addPrescription = () => {
    if (!rxMedicineName.trim()) return;
    setPrescriptions([
      ...prescriptions,
      {
        medicineName: rxMedicineName.trim(),
        dosage: rxDosage.trim(),
        frequency: rxFrequency.trim(),
        duration: rxDuration.trim(),
        instructions: rxInstructions.trim()
      }
    ]);
    setRxMedicineName('');
    setRxDosage('');
    setRxFrequency('');
    setRxDuration('');
    setRxInstructions('');
  };

  const removePrescription = (index) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== index));
  };

  // Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const symptoms = symptomsInput.split(',').map((s) => s.trim()).filter(Boolean);

    try {
      await API.post('/records', {
        patientId: Number(patientId),
        doctorId: Number(doctorId),
        appointmentId: appointmentId ? Number(appointmentId) : null,
        recordDate: recordDate || null,
        diagnosisDetails: {
          primaryDiagnosis,
          icdCode,
          severity,
          symptoms,
          clinicalNotes
        },
        prescriptions
      });
      resetForm();
      fetchAllRecords();
    } catch (err) {
      alert('Failed to add record');
    }
  };

  return (
    <>
      <div className="panel-head">
        <div className="panel-kicker">Records</div>
        <div className="panel-title">Save a medical record</div>
        <div className="panel-desc">Log diagnosis details and prescriptions against a patient and doctor.</div>
      </div>

      {/* Create Form */}
      <form onSubmit={handleSubmit}>
        <div className="intake">
          <div className="field">
            <label htmlFor="rec-patient">Patient</label>
            <select
              id="rec-patient"
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
            <label htmlFor="rec-doctor">Doctor</label>
            <select
              id="rec-doctor"
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
            <label htmlFor="rec-appointment">Related appointment (optional)</label>
            <select
              id="rec-appointment"
              value={appointmentId}
              onChange={(e) => setAppointmentId(e.target.value)}
            >
              <option value="">No appointment linked</option>
              {appointments.map((a) => (
                <option key={a.id} value={a.id}>
                  #{a.id} — {patientName_(a.patientId) || `P-${a.patientId}`} with {doctorName_(a.doctorId) || `D-${a.doctorId}`}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="rec-date">Record date (optional)</label>
            <input
              id="rec-date"
              type="datetime-local"
              value={recordDate}
              onChange={(e) => setRecordDate(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="rec-diagnosis">Primary diagnosis</label>
            <input
              id="rec-diagnosis"
              type="text"
              placeholder="e.g. Seasonal influenza"
              value={primaryDiagnosis}
              onChange={(e) => setPrimaryDiagnosis(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="rec-icd">ICD code</label>
            <input
              id="rec-icd"
              type="text"
              placeholder="e.g. J11.1"
              value={icdCode}
              onChange={(e) => setIcdCode(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="rec-severity">Severity</label>
            <select
              id="rec-severity"
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
            >
              <option value="">Not specified</option>
              {SEVERITIES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="rec-symptoms">Symptoms (comma separated)</label>
            <input
              id="rec-symptoms"
              type="text"
              placeholder="e.g. Fever, cough, fatigue"
              value={symptomsInput}
              onChange={(e) => setSymptomsInput(e.target.value)}
            />
          </div>
          <div className="field field-full">
            <label htmlFor="rec-notes">Clinical notes</label>
            <textarea
              id="rec-notes"
              placeholder="Any additional observations…"
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
            />
          </div>
        </div>

        {/* Prescription builder */}
        <div className="section-label" style={{ marginTop: 22 }}>
          <span>Prescriptions</span>
          <span className="count">{prescriptions.length}</span>
        </div>
        <div className="rx-builder">
          <div className="rx-builder-grid">
            <div className="field">
              <label htmlFor="rx-medicine">Medicine</label>
              <input
                id="rx-medicine"
                type="text"
                placeholder="e.g. Paracetamol"
                value={rxMedicineName}
                onChange={(e) => setRxMedicineName(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="rx-dosage">Dosage</label>
              <input
                id="rx-dosage"
                type="text"
                placeholder="e.g. 500mg"
                value={rxDosage}
                onChange={(e) => setRxDosage(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="rx-frequency">Frequency</label>
              <input
                id="rx-frequency"
                type="text"
                placeholder="e.g. Twice daily"
                value={rxFrequency}
                onChange={(e) => setRxFrequency(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="rx-duration">Duration</label>
              <input
                id="rx-duration"
                type="text"
                placeholder="e.g. 5 days"
                value={rxDuration}
                onChange={(e) => setRxDuration(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="rx-instructions">Instructions</label>
              <input
                id="rx-instructions"
                type="text"
                placeholder="e.g. After meals"
                value={rxInstructions}
                onChange={(e) => setRxInstructions(e.target.value)}
              />
            </div>
            <button type="button" className="btn-secondary" onClick={addPrescription}>
              + Add prescription
            </button>
          </div>

          {prescriptions.length > 0 && (
            <div className="rx-added-list">
              {prescriptions.map((rx, i) => (
                <div className="rx-added-item" key={i}>
                  <div>
                    <strong>{rx.medicineName}</strong>
                    <small>
                      {[rx.dosage, rx.frequency, rx.duration, rx.instructions].filter(Boolean).join(' · ') || 'No further details'}
                    </small>
                  </div>
                  <button type="button" className="rx-remove" onClick={() => removePrescription(i)}>
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button type="submit" className="btn-primary" style={{ marginTop: 18 }}>
          Save medical record
        </button>
      </form>

      <div className="section-label" style={{ marginTop: 30 }}>
        <span>Records</span>
        <span className="count">{records.length}</span>
      </div>

      {loading ? (
        <div className="loading-row">Loading records…</div>
      ) : records.length === 0 ? (
        <div className="empty-state">
          <EmptyIcon />
          <div className="empty-state-title">No records yet</div>
          <div className="empty-state-sub">Save the first one using the form above.</div>
        </div>
      ) : (
        <div>
          {records.map((item) => (
            <div key={item.id} className="record-card">
              <div className="record-top">
                <span className="id-chip">
                  P-{item.patientId}{patientName_(item.patientId) ? ` · ${patientName_(item.patientId)}` : ''}
                </span>
                <span className="who-sub">
                  Dr. {doctorName_(item.doctorId) || `#${item.doctorId}`}
                  {item.appointmentId ? ` · Appt #${item.appointmentId}` : ''}
                </span>
              </div>

              <div className="record-diagnosis">
                <strong>{item.primaryDiagnosis || 'Diagnosis'}</strong>
                {item.icdCode && <span className="who-sub"> ({item.icdCode})</span>}
                {item.severity && (
                  <span className="rx-chip" style={{ marginLeft: 8 }}>{item.severity}</span>
                )}
              </div>

              {item.symptoms?.length > 0 && (
                <div className="rx-list">
                  {item.symptoms.map((s, i) => (
                    <span className="rx-chip" key={i}>{s}</span>
                  ))}
                </div>
              )}

              {item.clinicalNotes && (
                <div className="record-diagnosis" style={{ marginTop: 8 }}>
                  {item.clinicalNotes}
                </div>
              )}

              {item.prescriptions?.length > 0 && (
                <div className="rx-added-list" style={{ marginTop: 10 }}>
                  {item.prescriptions.map((rx, i) => (
                    <div className="rx-added-item" key={i}>
                      <div>
                        <strong>{rx.medicineName}</strong>
                        <small>
                          {[rx.dosage, rx.frequency, rx.duration, rx.instructions].filter(Boolean).join(' · ') || 'No further details'}
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="record-meta">
                RECORD {item.id} · {item.recordDate ? new Date(item.recordDate).toLocaleString() : 'N/A'}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
