const appointmentForm = document.getElementById('appointmentForm');
const appointmentsTableBody = document.getElementById('appointmentsTableBody');
const patientSelect = document.getElementById('patientSelect');
const doctorSelect = document.getElementById('doctorSelect');
const appointmentDate = document.getElementById('appointmentDate');

appointmentDate.min = new Date().toISOString().split('T')[0];

let allPatients = [];
let allDoctors = [];

async function loadPatients() {
  try {
    const response = await fetch('http://localhost:3000/patients');
    allPatients = await response.json();
    patientSelect.innerHTML = '<option value="" disabled selected>Select Patient</option>';
    allPatients.forEach(p => {
      const option = document.createElement('option');
      option.value = p.id;
      option.textContent = p.name;
      patientSelect.appendChild(option);
    });
  } catch (error) {
    console.error('Error loading patients:', error);
    alert('Failed to load patients.');
  }
}

async function loadDoctors() {
  try {
    const response = await fetch('http://localhost:3000/doctors');
    allDoctors = await response.json();
    doctorSelect.innerHTML = '<option value="" disabled selected>Select Doctor</option>';
    allDoctors.forEach(d => {
      const option = document.createElement('option');
      option.value = d.id;
      option.textContent = `${d.name} (${d.specialty})`;
      doctorSelect.appendChild(option);
    });
  } catch (error) {
    console.error('Error loading doctors:', error);
    alert('Failed to load doctors.');
  }
}

async function loadAppointments() {
  try {
    const response = await fetch('http://localhost:3000/appointments');
    const appointments = await response.json();
    appointmentsTableBody.innerHTML = '';

    if (appointments.length === 0) {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td colspan="5" style="text-align:center; color:#888;">No appointments found.</td>`;
      appointmentsTableBody.appendChild(tr);
      return;
    }

    appointments.forEach(appt => {
      const patient = allPatients.find(p => p.id === appt.patientId);
      const doctor = allDoctors.find(d => d.id === appt.doctorId);
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${patient?.name || 'N/A'}</td>
        <td>${doctor ? `${doctor.name} (${doctor.specialty})` : 'N/A'}</td>
        <td>${appt.date}</td>
        <td>${appt.time}</td>
        <td><button class="delete-btn" data-id="${appt.id}">Delete</button></td>
      `;
      appointmentsTableBody.appendChild(tr);
    });
  } catch (error) {
    console.error('Error loading appointments:', error);
    alert('Failed to load appointments.');
  }
}

appointmentForm.addEventListener('submit', async e => {
  e.preventDefault();
  const patientId = patientSelect.value;
  const doctorId = doctorSelect.value;
  const date = appointmentDate.value;
  const time = document.getElementById('appointmentTime').value;

  if (!patientId || !doctorId || !date || !time) {
    alert('All fields are required.');
    return;
  }

  try {
    const response = await fetch('http://localhost:3000/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientId, doctorId, date, time })
    });

    if (response.ok) {
      appointmentForm.reset();
      appointmentDate.min = new Date().toISOString().split('T')[0];
      loadAppointments();
      alert('Appointment booked successfully!');
    } else {
      const err = await response.json();
      alert('Error: ' + (err.error || 'Failed to book.'));
    }
  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred.');
  }
});

appointmentsTableBody.addEventListener('click', async e => {
  if (e.target.classList.contains('delete-btn')) {
    const id = e.target.dataset.id;
    if (confirm('Delete this appointment?')) {
      try {
        const response = await fetch(`http://localhost:3000/appointments/${id}`, { method: 'DELETE' });
        if (response.ok) {
          loadAppointments();
        } else {
          alert('Failed to delete appointment.');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Delete failed.');
      }
    }
  }
});

window.addEventListener('DOMContentLoaded', async () => {
  await loadPatients();
  await loadDoctors();
  loadAppointments();
});
