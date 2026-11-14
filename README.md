# Online Attendance System
University of the East (Caloocan) 

A web-based attendance system. Teachers import class lists and show a QR code;
students log in to be marked Present/Late; a student "secretary" can correct
records; teachers export summaries to Excel.

## Tech stack
- Frontend: HTML5, CSS3, vanilla JavaScript (ES modules)
- UI: Bootstrap 4.5.2 + Bootswatch "Simplex", Boxicons, Font Awesome 5, Google Font Poppins
- Libraries (CDN): Firebase JS SDK 11.x (Realtime Database), flatpickr, qrcodejs, SheetJS (xlsx), jQuery 3 slim, Popper
- Backend/DB: Firebase Realtime Database (asia-southeast1), project `attendify12-ai`
- Optional local API: Node/Express-style server expected at `http://localhost:5000` (not included)
- Hosting: static (QR points to a GitHub Pages URL)
- Browser storage: localStorage / sessionStorage for session state
