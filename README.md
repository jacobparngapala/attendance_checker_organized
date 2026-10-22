# EAST-Y CHECK — Online Attendance System
University of the East (Caloocan) · ICT3 12-1 class project

A web-based attendance system. Teachers import class lists and show a QR code;
students log in to be marked Present/Late; a student "secretary" can correct
records; teachers export summaries to Excel.

## Folder structure
```
east-y-check/
├── index.html                      Login (students + teachers)  ← entry point
├── pages/
│   ├── teacher/
│   │   ├── homepage.html           Teacher dashboard shell
│   │   ├── classes-selection.html  List classes + import class (CSV)
│   │   ├── attendance-section.html Live attendance, QR, time, grant secretary
│   │   └── summary.html            Date-range summary + Excel export
│   ├── student/
│   │   ├── homepage-student.html   Student landing page
│   │   └── classes-student.html    Student's classes + own attendance status
│   └── secretary/
│       └── secretary-attendance.html  Secretary edits class attendance
├── assets/
│   ├── css/   dashboard, navbar, styles, drrr (login), basta, buttonsxs, classes-selection
│   ├── img/   ue-logo.png, uesocialogp.png (login bg), qr.png
│   └── js/    (empty — classes.js is referenced but was missing from upload)
└── archive/unused-css/             CSS files no page references
```

## Tech stack
- Frontend: HTML5, CSS3, vanilla JavaScript (ES modules)
- UI: Bootstrap 4.5.2 + Bootswatch "Simplex", Boxicons, Font Awesome 5, Google Font Poppins
- Libraries (CDN): Firebase JS SDK 11.x (Realtime Database), flatpickr, qrcodejs, SheetJS (xlsx), jQuery 3 slim, Popper
- Backend/DB: Firebase Realtime Database (asia-southeast1), project `attendify12-ai`
- Optional local API: Node/Express-style server expected at `http://localhost:5000` (not included)
- Hosting: static (QR points to a GitHub Pages URL)
- Browser storage: localStorage / sessionStorage for session state

## Database layout (Realtime Database)
```
Students/{id}   { studentId, name, password }
Teachers/{id}   { teacherId, name, password }          (IDs start with "T")
classes/{teacherId}/{classId}  { course, section, room, startTime, endTime,
                                 students:[{id,name,course,canAccessAttendance?}] }
attendance/{classId}/{studentId} { id, status, timestamp }
logins/{pushId}  { id, name, role, timestamp }
```
Status values: `-` (not yet), Present, Late, Absent, Cutting.

## Known issues
See the chat summary; main items: missing `classes.js` and `localhost:5000` backend,
plaintext passwords + public Firebase config, `login.html` redirect doesn't exist.
