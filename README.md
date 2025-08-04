Hospital Management System (HMS)
This document provides an overview of the Hospital Management System, a web application designed to manage patient, doctor, and appointment data. The system is built with a simple front-end using HTML, CSS, and JavaScript, and a back-end powered by Node.js and Express.
Project Purpose
The primary goal of the HMS is to provide a user-friendly interface for hospital staff to manage daily operations, including:
Adding and deleting patient records.
Adding and deleting doctor records with their specializations.
Booking and canceling appointments between patients and doctors.
Viewing key statistics on a central dashboard.
Technology Stack
Frontend:
HTML5: For the structure and content of the web pages.
CSS3: For styling, layout, and a modern, responsive design.
JavaScript (ES6+): For client-side logic, interactivity, and communicating with the back-end API.
Backend:
Node.js: The JavaScript runtime environment.
Express.js: A popular Node.js framework for building the REST API.
Lowdb: A small, simple, JSON-based local database used to store application data.
Project Structure and File Descriptions
The project is structured with several HTML files for different pages and a single Node.js file for the back-end server.
Frontend Files
index.html (Home): This is the main entry point of the application. It serves as a public-facing landing page, likely featuring a welcoming message, a brief introduction to the hospital's services, and high-level information about the system's purpose. It acts as the initial hub from which users can navigate to other parts of the site.
aboutUs.html: This is an informational page that provides details about the hospital. It might include the hospital's mission statement, history, values, and an introduction to the team. It is designed to build trust and provide context for the organization.
features.html: This page is dedicated to highlighting the core functionalities and benefits of the Hospital Management System. It would detail the key features, such as patient and doctor management, appointment scheduling, and the central data dashboard, to showcase the system's capabilities.
dashboard.html: The central hub for hospital management. This page displays a summary of key data, such as the total number of appointments, patients, and doctors. It retrieves this data dynamically from the back-end API.
patients.html: The interface for managing patient records. Users can add new patients by entering their details and see a list of all existing patients. Each patient record has a button to delete it from the system.
doctors.html: The interface for managing doctor information. Similar to the patients page, it allows users to add new doctors with their specializations and view a list of all doctors. Each doctor record can also be deleted.
appointments.html: The page dedicated to managing appointments. It provides a form to book new appointments by selecting a patient and a doctor, and specifying the date and time. It also displays a table of all scheduled appointments.
Backend File
server.js: This file contains the complete back-end logic.
It uses express to create a web server and handle API routes.
It uses lowdb to read from and write to a local JSON file (db.json) which acts as the database.
It defines a REST API with endpoints for each resource (/patients, /doctors, /appointments).
The API supports HTTP methods like GET (for fetching data), POST (for creating new records), and DELETE (for removing records).
It includes basic data validation to ensure the integrity of the data being added or updated.
How the System Works
The front-end HTML pages are static files that run in the user's browser. When a user interacts with a page (e.g., by clicking "Add Doctor"), the JavaScript code in that page sends an asynchronous request (using fetch) to the server.js back-end.
The server.js file receives this request, processes the data, performs the requested action (e.g., adding a new doctor to db.json), and sends a response back to the front-end. The front-end then updates the UI to reflect the changes. This client-server architecture ensures that all data is centrally managed and persistent.

