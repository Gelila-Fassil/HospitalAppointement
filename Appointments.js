
    // ... (keep existing CSS and HTML structure)

// In appointments.html
const appointmentForm = document.getElementById('appointmentForm');
const appointmentsTableBody = document.getElementById('appointmentsTableBody');
const patientSelect = document.getElementById('patientSelect');
const doctorSelect = document.getElementById('doctorSelect');
const appointmentDate = document.getElementById('appointmentDate');

appointmentDate.min = new Date().toISOString().split('T')[0];

let allPatients = []; // Store patients globally for easier lookup
let allDoctors = [];  // Store doctors globally for easier lookup

async function loadPatients() {
    try {
        const response = await fetch('http://localhost:3000/patients');
        allPatients = await response.json(); // Store fetched patients

        patientSelect.innerHTML = '<option value="" disabled selected>Select Patient</option>';
        allPatients.forEach(p => {
            const option = document.createElement('option');
            option.value = p.id; // Use patient ID from backend
            option.textContent = p.name;
            patientSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading patients for dropdown:', error);
        alert('Failed to load patients for appointment booking.');
    }
}

async function loadDoctors() {
    try {
        const response = await fetch('http://localhost:3000/doctors');
        allDoctors = await response.json(); // Store fetched doctors

        doctorSelect.innerHTML = '<option value="" disabled selected>Select Doctor</option>';
        allDoctors.forEach(d => {
            const option = document.createElement('option');
            option.value = d.id; // Use doctor ID from backend
            option.textContent = d.name + ' (' + d.specialty + ')';
            doctorSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading doctors for dropdown:', error);
        alert('Failed to load doctors for appointment booking.');
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
            // Find patient and doctor by ID from the globally loaded lists
            const patient = allPatients.find(p => p.id === appt.patientId);
            const doctor = allDoctors.find(d => d.id === appt.doctorId);

            const patientName = patient ? patient.name : 'N/A';
            const doctorName = doctor ? `${doctor.name} (${doctor.specialty})` : 'N/A';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${patientName}</td>
                <td>${doctorName}</td>
                <td>${appt.date}</td>
                <td>${appt.time}</td>
                <td><button class="delete-btn" data-id="${appt.id}" aria-label="Delete appointment">Delete</button></td>
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
    const patientId = patientSelect.value; // Get the ID
    const doctorId = doctorSelect.value;   // Get the ID
    const date = appointmentDate.value;
    const time = document.getElementById('appointmentTime').value;

    if (!patientId) {
        alert('Please select a patient.');
        return;
    }
    if (!doctorId) {
        alert('Please select a doctor.');
        return;
    }
    if (!date) {
        alert('Please select an appointment date.');
        return;
    }
    if (!time) {
        alert('Please select an appointment time between 08:00 and 18:00.');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/appointments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ patientId, doctorId, date, time })
        });

        if (response.ok) {
            const newAppointment = await response.json();
            appointmentForm.reset();
            appointmentDate.min = new Date().toISOString().split('T')[0];
            loadAppointments();
            alert('Appointment booked successfully!');
        } else {
            const errorData = await response.json();
            alert('Failed to book appointment: ' + (errorData.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error booking appointment:', error);
        alert('An error occurred while booking the appointment.');
    }
});

appointmentsTableBody.addEventListener('click', async e => {
    if (e.target.classList.contains('delete-btn')) {
        const appointmentId = e.target.dataset.id;
        if (confirm('Are you sure you want to delete this appointment?')) {
            try {
                const response = await fetch(`http://localhost:3000/appointments/${appointmentId}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    loadAppointments();
                } else {
                    const errorData = await response.json();
                    alert('Failed to delete appointment: ' + (errorData.error || 'Unknown error'));
                }
            } catch (error) {
                console.error('Error deleting appointment:', error);
                alert('An error occurred while deleting the appointment.');
            }
        }
    }
});

window.addEventListener('DOMContentLoaded', async () => {
    await loadPatients(); // Ensure patients are loaded before appointments
    await loadDoctors();  // Ensure doctors are loaded before appointments
    loadAppointments();
});
 