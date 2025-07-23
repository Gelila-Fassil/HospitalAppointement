
      

      // In patients.html
      const patientForm = document.getElementById("patientForm");
      const patientsTableBody = document.getElementById("patientsTableBody");

      async function loadPatients() {
        try {
          const response = await fetch("http://localhost:3000/patients");
          const patients = await response.json();

          patientsTableBody.innerHTML = "";
          if (patients.length === 0) {
            const tr = document.createElement("tr");
            tr.innerHTML = `<td colspan="4" style="text-align:center; color:#888;">No patients found.</td>`;
            patientsTableBody.appendChild(tr);
            return;
          }
          patients.forEach((patient) => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${patient.name}</td>
                <td>${patient.email}</td>
                <td>${patient.dob}</td>
                <td><button class="delete-btn" data-id="${patient.id}" aria-label="Delete patient">Delete</button></td>
            `;
            patientsTableBody.appendChild(tr);
          });
        } catch (error) {
          console.error("Error loading patients:", error);
          alert("Failed to load patients.");
        }
      }

      patientForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const name = document.getElementById("patientName").value.trim();
        const email = document.getElementById("patientEmail").value.trim();
        const dob = document.getElementById("patientDOB").value;

        if (!name) {
          alert("Please enter the patient's name.");
          return;
        }
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          // Basic email validation
          alert("Please enter a valid email address.");
          return;
        }
        if (!dob) {
          alert("Please enter the date of birth.");
          return;
        }

        try {
          const response = await fetch("http://localhost:3000/patients", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ name, email, dob }),
          });

          if (response.ok) {
            const newPatient = await response.json();
            patientForm.reset();
            loadPatients();
            alert("Patient added successfully!");
          } else {
            const errorData = await response.json();
            alert(
              "Failed to add patient: " + (errorData.error || "Unknown error")
            );
          }
        } catch (error) {
          console.error("Error adding patient:", error);
          alert("An error occurred while adding the patient.");
        }
      });

      patientsTableBody.addEventListener("click", async (e) => {
        if (e.target.classList.contains("delete-btn")) {
          const patientId = e.target.dataset.id;
          if (confirm("Are you sure you want to delete this patient?")) {
            try {
              const response = await fetch(
                `http://localhost:3000/patients/${patientId}`,
                {
                  method: "DELETE",
                }
              );

              if (response.ok) {
                loadPatients();
              } else {
                const errorData = await response.json();
                alert(
                  "Failed to delete patient: " +
                    (errorData.error || "Unknown error")
                );
              }
            } catch (error) {
              console.error("Error deleting patient:", error);
              alert("An error occurred while deleting the patient.");
            }
          }
        }
      });

      window.addEventListener("DOMContentLoaded", loadPatients);