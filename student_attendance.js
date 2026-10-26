// Firebase imports and configuration (same as your original code)
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyA0hTRuEgjrP9YQ4LwkHcSUf7xkdl9lBgI",
    authDomain: "attendify12-ai.firebaseapp.com",
    databaseURL: "https://attendify12-ai-default-rtdb.asia-southeast1.firebasedatabase.app/",
    projectId: "attendify12-ai",
    storageBucket: "attendify12-ai.firebasestorage.app",
    messagingSenderId: "374044642888",
    appId: "1:374044642888:web:44706986d500af43a0927d"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Get student ID from local storage
const studentId = localStorage.getItem("userID");

// Function to fetch and display the student's classes
async function fetchStudentClasses() {
    if (!studentId) {
        alert("Please log in to view your attendance.");
        return;
    }

    const classesRef = ref(db, 'classes');
    const snapshot = await get(classesRef);

    if (snapshot.exists()) {
        const classes = snapshot.val();
        const classButtonsContainer = document.getElementById('classButtons');
        classButtonsContainer.innerHTML = ''; // Clear previous buttons

        for (const teacherId in classes) {
            for (const classId in classes[teacherId]) {
                const classData = classes[teacherId][classId];
                if (classData && classData.students) {
                    for (const studentKey in classData.students) {
                        if (classData.students[studentKey].id === studentId) {
                            const button = document.createElement('button');
                            button.textContent = classData.section; // Or classData.course, etc.
                            button.classList.add('btn', 'btn-primary', 'm-2');
                            button.onclick = () => displayAttendance(teacherId, classId);
                            classButtonsContainer.appendChild(button);
                        }
                    }
                }
            }
        }
    }
}

// Function to display the student's attendance for a selected class
async function displayAttendance(teacherId, classId) {
    const attendanceRef = ref(db, attendance / ${ classId } / ${ studentId });
    const snapshot = await get(attendanceRef);

    const attendanceDisplay = document.getElementById('attendanceDisplay');
    attendanceDisplay.innerHTML = ''; // Clear previous display

    if (snapshot.exists()) {
        const attendanceData = snapshot.val();
        attendanceDisplay.innerHTML = `
            <p><strong>Status:</strong> ${attendanceData.status}</p>
            <p><strong>Timestamp:</strong> ${new Date(attendanceData.timestamp).toLocaleString()}</p>
        `;
        // Apply color based on status
        switch (attendanceData.status) {
            case "Absent":
                attendanceDisplay.style.color = "red";
                break;
            case "Present":
                attendanceDisplay.style.color = "green";
                break;
            case "Late":
                attendanceDisplay.style.color = "orange";
                break;
            case "Cutting":
                attendanceDisplay.style.color = "purple";
                break;
            default:
                attendanceDisplay.style.color = "black";
        }
    } else {
        attendanceDisplay.innerHTML = '<p>Attendance not recorded yet.</p>';
    }
}

// Call fetchStudentClasses when the page loads
document.addEventListener('DOMContentLoaded', fetchStudentClasses);
