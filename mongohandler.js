import { MongoClient } from "mongodb";
import { getDatabase } from "firebase-admin/database";
import admin from "firebase-admin";
import dotenv from "dotenv";
import fs from "fs";
import moment from "moment";

dotenv.config();
console.log("Loaded MONGO_URI:", process.env.MONGO_URI);

let mongoClient;

async function connectToMongo() {
    if (!mongoClient) {
        if (!process.env.MONGO_URI) {
            console.error("MONGO_URI is undefined! Check your .env file.");
            return;
        }

        mongoClient = new MongoClient(process.env.MONGO_URI);
        try {
            await mongoClient.connect();
            console.log("Connected to MongoDB");
        } catch (error) {
            console.error("MongoDB Connection Error:", error);
        }
    }
}

try {
    const serviceAccountPath = "./firebase-service-account.json";
    if (!fs.existsSync(serviceAccountPath)) {
        console.error("Firebase service account file missing!");
        process.exit(1);
    }

    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: process.env.FIREBASE_DATABASE_URL,
        });
    }

    console.log("Firebase initialized successfully");

} catch (error) {
    console.error("Firebase Initialization Error:", error);
}

const db = getDatabase();

export async function saveAttendanceToMongo(classId) {
    console.log(Running saveAttendanceToMongo for classId: ${ classId });

    await connectToMongo();

    const database = mongoClient.db("attendanceDB");
    const collection = database.collection("attendanceRecords");

    try {
        const attendanceRef = db.ref(attendance / ${ classId });
        const snapshot = await attendanceRef.get();

        if (!snapshot.exists() || !snapshot.val()) {
            console.log(No attendance data found for classId: ${ classId });
            return;
        }

        console.log("Attendance Data:", JSON.stringify(snapshot.val(), null, 2));

        let studentsArray = [];

        // Fetch class data
        const classesRef = db.ref("classes");
        const classesSnapshot = await classesRef.get();
        const classesData = classesSnapshot.exists() ? classesSnapshot.val() : {};

        console.log("Classes Data:", JSON.stringify(classesData, null, 2));

        for (const teacherId in classesData) {
            for (const classKey in classesData[teacherId]) {
                if (classKey === classId) {
                    studentsArray = classesData[teacherId][classKey].students || [];
                    console.log("Found Students:", studentsArray);
                    break;
                }
            }
        }

        if (studentsArray.length === 0) {
            console.warn(No students found for classId: ${ classId });
        }

        const studentMap = {};
        studentsArray.forEach(student => {
            studentMap[student.id] = student.name;
        });

        console.log("📌 Student Mapping:", studentMap);

        const attendanceData = Object.entries(snapshot.val()).map(([studentId, studentAttendance]) => ({
            studentId,
            studentName: studentMap[studentId] || "Unknown",
            status: studentAttendance.status,
            timestamp: studentAttendance.timestamp || moment().toISOString(),
        }));

        const result = await collection.updateOne(
            { classId, date: moment().format("YYYY-MM-DD") },
            {
                $set: {
                    attendance: attendanceData,
                    savedAt: new Date().toISOString(),
                },
            },
            { upsert: true }
        );

        console.log(
            result.modifiedCount > 0
                ? Updated attendance for classId: ${ classId } `
                : Inserted new attendance record for classId: ${classId}`
        );

    } catch (error) {
        console.error(" MongoDB Save Error:", error);
    }
}
