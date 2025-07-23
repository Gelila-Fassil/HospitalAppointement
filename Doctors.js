


// In doctors.html
const doctorForm = document.getElementById('doctorForm');
const doctorsTableBody = document.getElementById('doctorsTableBody');

async function loadDoctors() {
try {
    const response = await fetch('http://localhost:3000/doctors');
    const doctors = await response.json();

    doctorsTableBody.innerHTML = '';
    if (doctors.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="3" style="text-align:center; color:#888;">No doctors found.</td>`;
        doctorsTableBody.appendChild(tr);
        return;
    }
    doctors.forEach(doctor => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${doctor.name}</td>
            <td>${doctor.specialty}</td>
            <td><button class="delete-btn" data-id="${doctor.id}" aria-label="Delete doctor">Delete</button></td>
        `;
        doctorsTableBody.appendChild(tr);
    });
} catch (error) {
    console.error('Error loading doctors:', error);
    alert('Failed to load doctors.');
}
}

doctorForm.addEventListener('submit', async e => {
e.preventDefault();
const name = document.getElementById('doctorName').value.trim();
const specialty = document.getElementById('doctorSpecialty').value;

if (!name) {
    alert('Please enter the doctor\'s name.');
    return;
}
if (!specialty) {
    alert('Please select a specialty.');
    return;
}

try {
    const response = await fetch('http://localhost:3000/doctors', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, specialty })
    });

    if (response.ok) {
        const newDoctor = await response.json();
        doctorForm.reset();
        loadDoctors();
        alert('Doctor added successfully!');
    } else {
        const errorData = await response.json();
        alert('Failed to add doctor: ' + (errorData.error || 'Unknown error'));
    }
} catch (error) {
    console.error('Error adding doctor:', error);
    alert('An error occurred while adding the doctor.');
}
});

doctorsTableBody.addEventListener('click', async e => {
if (e.target.classList.contains('delete-btn')) {
    const doctorId = e.target.dataset.id;
    if (confirm('Are you sure you want to delete this doctor?')) {
        try {
            const response = await fetch(`http://localhost:3000/doctors/${doctorId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                loadDoctors();
            } else {
                const errorData = await response.json();
                alert('Failed to delete doctor: ' + (errorData.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error deleting doctor:', error);
            alert('An error occurred while deleting the doctor.');
        }
    }
}
});

window.addEventListener('DOMContentLoaded', loadDoctors);
