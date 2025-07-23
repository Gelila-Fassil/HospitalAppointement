const express = require("express");
const cors = require("cors");
const { join } = require("path");
const { nanoid } = require("nanoid");
const { Low } = require("lowdb");
const { JSONFile } = require("lowdb/node");

const app = express();
const port = 3000;

const file = join(__dirname, "db.json");
const adapter = new JSONFile(file);
// Provide initial data directly to the Low constructor
const defaultData = { patients: [], doctors: [], appointments: [], users: [] }; // ADDED 'users' here
const db = new Low(adapter, defaultData);

async function readAndSyncDB() {
  await db.read();
  db.data = db.data || defaultData;
  // Ensure the users array exists in db.data
  db.data.users = db.data.users || []; // THIS LINE IS CRUCIAL FOR INITIALIZATION
  await db.write();
}
readAndSyncDB();

app.use(cors());
app.use(express.json());

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

//---------------- User Routes (NEW) --------------------
// Get all users
app.get("/users", async (req, res) => {
  await db.read();
  res.json(db.data.users);
});

// Add a new user
app.post("/users", async (req, res) => {
  const { username, email, password, role } = req.body;

  if (!username || !email || !password || !role) {
    return res
      .status(400)
      .json({ error: "Username, email, password, and role are required." });
  }
  if (!validateEmail(email)) {
    return res.status(400).json({ error: "Invalid email format." });
  }

  await db.read();
  // Check for duplicate username or email
  const userExists = db.data.users.find(
    (u) => u.username === username || u.email === email
  );
  if (userExists) {
    return res
      .status(400)
      .json({ error: "User with this username or email already exists." });
  }

  const newUser = { id: nanoid(), username, email, role }; // Store role; DO NOT store raw password in db.json for production!
  // In a real app, you'd hash the password here before saving
  db.data.users.push(newUser);
  await db.write();
  res.status(201).json(newUser);
});

// Delete user by id
app.delete("/users/:id", async (req, res) => {
  const { id } = req.params;
  await db.read();
  const index = db.data.users.findIndex((u) => u.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "User not found." });
  }
  db.data.users.splice(index, 1);
  await db.write();
  res.status(204).send();
});

//---------------- Patient Routes --------------------

// Get all patients
app.get("/patients", async (req, res) => {
  await db.read();
  res.json(db.data.patients);
});

// Add a new patient
app.post("/patients", async (req, res) => {
  const { name, email, dob } = req.body;

  if (!name || !email || !dob) {
    return res
      .status(400)
      .json({ error: "Name, email, and date of birth are required." });
  }
  if (!validateEmail(email)) {
    return res.status(400).json({ error: "Invalid email format." });
  }

  await db.read();
  // Optional: check for duplicate email
  const exists = db.data.patients.find((p) => p.email === email);
  if (exists) {
    return res
      .status(400)
      .json({ error: "Patient with this email already exists." });
  }

  const newPatient = { id: nanoid(), name, email, dob };
  db.data.patients.push(newPatient);
  await db.write();
  res.status(201).json(newPatient);
});

// Update patient by id
app.put("/patients/:id", async (req, res) => {
  const { id } = req.params;
  const { name, email, dob } = req.body;

  if (!name || !email || !dob) {
    return res
      .status(400)
      .json({ error: "Name, email, and date of birth are required." });
  }
  if (!validateEmail(email)) {
    return res.status(400).json({ error: "Invalid email format." });
  }

  await db.read();
  const index = db.data.patients.findIndex((p) => p.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Patient not found." });
  }

  // Check for duplicate email if it's changing and belongs to another patient
  const exists = db.data.patients.find((p) => p.email === email && p.id !== id);
  if (exists) {
    return res
      .status(400)
      .json({ error: "Another patient with this email already exists." });
  }

  db.data.patients[index] = { id, name, email, dob }; // Fully replace patient data
  await db.write();
  res.json(db.data.patients[index]);
});

// Delete patient by id
app.delete("/patients/:id", async (req, res) => {
  const { id } = req.params;
  await db.read();
  const index = db.data.patients.findIndex((p) => p.id === id);
  if (index === -1)
    return res.status(404).json({ error: "Patient not found." });
  db.data.patients.splice(index, 1);

  // Also remove any appointments associated with this patient
  db.data.appointments = db.data.appointments.filter((a) => a.patientId !== id);

  await db.write();
  res.status(204).send();
});

//---------------- Doctor Routes --------------------

// Get all doctors
app.get("/doctors", async (req, res) => {
  await db.read();
  res.json(db.data.doctors);
});

// Add a new doctor
app.post("/doctors", async (req, res) => {
  const { name, specialty } = req.body;

  if (!name || !specialty) {
    return res.status(400).json({ error: "Name and specialty are required." });
  }

  await db.read();
  // Optional: check for duplicate name+specialty
  const exists = db.data.doctors.find(
    (d) => d.name === name && d.specialty === specialty
  );
  if (exists) {
    return res
      .status(400)
      .json({ error: "Doctor with this name and specialty already exists." });
  }

  const newDoctor = { id: nanoid(), name, specialty };
  db.data.doctors.push(newDoctor);
  await db.write();
  res.status(201).json(newDoctor);
});

// Update doctor by id
app.put("/doctors/:id", async (req, res) => {
  const { id } = req.params;
  const { name, specialty } = req.body;

  if (!name || !specialty) {
    return res.status(400).json({ error: "Name and specialty are required." });
  }

  await db.read();
  const index = db.data.doctors.findIndex((d) => d.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Doctor not found." });
  }

  // Optional: check for duplicate name+specialty if changing and belongs to another doctor
  const exists = db.data.doctors.find(
    (d) => d.name === name && d.specialty === specialty && d.id !== id
  );
  if (exists) {
    return res.status(400).json({
      error: "Another doctor with this name and specialty already exists.",
    });
  }

  db.data.doctors[index] = { id, name, specialty }; // Fully replace doctor data
  await db.write();
  res.json(db.data.doctors[index]);
});

// Delete doctor by id
app.delete("/doctors/:id", async (req, res) => {
  const { id } = req.params;
  await db.read();
  const index = db.data.doctors.findIndex((d) => d.id === id);
  if (index === -1) return res.status(404).json({ error: "Doctor not found." });
  db.data.doctors.splice(index, 1);

  // Also remove any appointments associated with this doctor
  db.data.appointments = db.data.appointments.filter((a) => a.doctorId !== id);

  await db.write();
  res.status(204).send();
});

//---------------- Appointment Routes --------------------

// Helper validation for appointment
function isValidAppointment(appt) {
  const { patientId, doctorId, date, time } = appt;
  if (!patientId || !doctorId || !date || !time) {
    return "All fields (patientId, doctorId, date, time) are required.";
  }
  // TODO: further validation can be added for date/time format
  // For brevity, just require non-empty values here
  return null;
}

// Get all appointments
app.get("/appointments", async (req, res) => {
  await db.read();
  res.json(db.data.appointments);
});

// Add a new appointment
app.post("/appointments", async (req, res) => {
  const { patientId, doctorId, date, time } = req.body;

  const validationError = isValidAppointment({
    patientId,
    doctorId,
    date,
    time,
  });
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  await db.read();

  // Check patient exists
  const patientExists = db.data.patients.find((p) => p.id === patientId);
  if (!patientExists) {
    return res.status(400).json({ error: "Patient does not exist." });
  }

  // Check doctor exists
  const doctorExists = db.data.doctors.find((d) => d.id === doctorId);
  if (!doctorExists) {
    return res.status(400).json({ error: "Doctor does not exist." });
  }

  // Check for conflicting appointment (same doctor, date, time)
  const conflict = db.data.appointments.find(
    (a) => a.doctorId === doctorId && a.date === date && a.time === time
  );
  if (conflict) {
    return res
      .status(400)
      .json({ error: "Doctor has another appointment at this date and time." });
  }

  // Save appointment
  const newAppointment = { id: nanoid(), patientId, doctorId, date, time };
  db.data.appointments.push(newAppointment);
  await db.write();

  res.status(201).json(newAppointment);
});

// Update appointment by id
app.put("/appointments/:id", async (req, res) => {
  const { id } = req.params;
  const { patientId, doctorId, date, time } = req.body;

  const validationError = isValidAppointment({
    patientId,
    doctorId,
    date,
    time,
  });
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  await db.read();
  const index = db.data.appointments.findIndex((a) => a.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Appointment not found." });
  }

  // Check patient exists
  const patientExists = db.data.patients.find((p) => p.id === patientId);
  if (!patientExists) {
    return res.status(400).json({ error: "Patient does not exist." });
  }

  // Check doctor exists
  const doctorExists = db.data.doctors.find((d) => d.id === doctorId);
  if (!doctorExists) {
    return res.status(400).json({ error: "Doctor does not exist." });
  }

  // Check for conflicting appointment (same doctor, date, time) excluding the current appointment being updated
  const conflict = db.data.appointments.find(
    (a) =>
      a.doctorId === doctorId &&
      a.date === date &&
      a.time === time &&
      a.id !== id
  );
  if (conflict) {
    return res
      .status(400)
      .json({ error: "Doctor has another appointment at this date and time." });
  }

  db.data.appointments[index] = { id, patientId, doctorId, date, time }; // Fully replace appointment data
  await db.write();
  res.json(db.data.appointments[index]);
});

// Delete appointment by id
app.delete("/appointments/:id", async (req, res) => {
  const { id } = req.params;
  await db.read();
  const index = db.data.appointments.findIndex((a) => a.id === id);
  if (index === -1)
    return res.status(404).json({ error: "Appointment not found." });
  db.data.appointments.splice(index, 1);
  await db.write();
  res.status(204).send();
});

app.listen(port, () => {
  console.log(
    `Hospital Management Backend running at http://localhost:${port}`
  );
});
