import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { saveAttendanceToMongo } from "./mongohandler.js"; // Ensure correct path
import { getDatabase } from "firebase-admin/database";
import { MongoClient } from "mongodb";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

//  Firebase & MongoDB Setup
const firebaseDB = getDatabase();
const mongoClient = new MongoClient(process.env.MONGO_URI);

async function connectToMongo() {
    try {
        if (!mongoClient.topology || !mongoClient.topology.isConnected()) {
            await mongoClient.connect();
        }
        return mongoClient.db("attendanceDB"); // 🔹 Ensure this is the correct database name
    } catch (error) {
        console.error("❌ MongoDB Connection Error:", error);
        throw error; // Throw error if connection fails
    }
}


// API: Save Attendance to MongoDB
app.post("/saveAttendance", async (req, res) => {
    try {
        const { classId } = req.body;
        console.log("Received /saveAttendance request for classId:", classId);

        if (!classId) {
            return res.status(400).json({ error: "Missing classId" });
        }

        await saveAttendanceToMongo(classId);
        res.json({ message: "Attendance saved successfully" });

    } catch (error) {
        console.error("❌ Error saving to MongoDB:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

//  API: Get Available Filters (Dates & Classes)
app.get("/getAvailableFilters", async (req, res) => {
    try {
        const classesSnapshot = await firebaseDB.ref("classes").get();
        const classesData = classesSnapshot.val() || {}; // Prevents undefined error

        const classList = [];
        for (const teacherId in classesData) {
            const teacherClasses = classesData[teacherId]; // Get classes under each teacher
            for (const classId in teacherClasses) {
                const classInfo = teacherClasses[classId]; // Class details
                classList.push({
                    id: classId,
                    name: classInfo.course + " - " + classInfo.section,
                });
            }
        }

        // Fetch attendance dates
        const attendanceSnapshot = await firebaseDB.ref("attendance").get();
        const dates = Object.keys(attendanceSnapshot.val() || {}); // Prevents undefined error
        const startDate = dates.length ? dates[0] : null;
        const endDate = dates.length ? dates[dates.length - 1] : null;

        res.json({ startDate, endDate, classList });

    } catch (error) {
        console.error("Error fetching filters:", error);
        res.status(500).json({ error: "Error fetching filters" });
    }
});


//  API: Get Attendance Summary
app.get("/getAttendanceSummary", async (req, res) => {
    const { classId, fromDate, toDate } = req.query;

    if (!classId || !fromDate || !toDate) {
        return res.status(400).json({ error: "Missing parameters" });
    }

    try {
        const db = await connectToMongo();
        const collection = db.collection("attendanceRecords");
        const records = await collection
            .find({
                classId,
                date: { $gte: fromDate, $lte: toDate },
            })
            .toArray();

        console.log("Raw Attendance Data:", records); // Debugging log

        // Processing attendance records
        let studentSummary = {};

        records.forEach(record => {
            record.attendance.forEach(student => {
                if (!student.studentId || !student.studentName) return; // Ensure valid data

                if (!studentSummary[student.studentId]) {
                    studentSummary[student.studentId] = {
                        studentName: student.studentName,
                        present: 0,
                        absent: 0,
                        late: 0
                    };
                }

                if (student.status === "Present") {
                    studentSummary[student.studentId].present++;
                } else if (student.status === "Absent") {
                    studentSummary[student.studentId].absent++;
                } else if (student.status === "Late") {
                    studentSummary[student.studentId].late++;
                }
            });
        });

        console.log("Processed Summary:", Object.values(studentSummary)); // Debugging log
        res.json(Object.values(studentSummary));

    } catch (error) {
        console.error("Error fetching attendance summary:", error);
        res.status(500).json({ error: "Error fetching attendance summary" });
    }
});




app.listen(5000, () => console.log("🚀 Server running on port 5000"));
