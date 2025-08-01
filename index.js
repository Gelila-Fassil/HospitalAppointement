



async function loadCounts() {
    try {
        const [appointmentsRes, patientsRes, doctorsRes] = await Promise.all([
            fetch('http://localhost:3000/appointments'),
            fetch('http://localhost:3000/patients'),
            fetch('http://localhost:3000/doctors')
        ]);

        const appointments = await appointmentsRes.json();
        const patients = await patientsRes.json();
        const doctors = await doctorsRes.json();

        document.getElementById('appointmentsCount').textContent = appointments.length;
        document.getElementById('patientsCount').textContent = patients.length;
        document.getElementById('doctorsCount').textContent = doctors.length;
    } catch (error) {
        console.error('Error loading counts:', error);
        document.getElementById('appointmentsCount').textContent = 'Error';
        document.getElementById('patientsCount').textContent = 'Error';
        document.getElementById('doctorsCount').textContent = 'Error';
    }
}

window.addEventListener('DOMContentLoaded', loadCounts);
// Add a mechanism to refresh counts if data changes on other pages (e.g., polling or a more advanced event system)
// For now, a simple page refresh will update the counts.
