const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;
const DATA = path.join(__dirname, "students.json");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

function readStudents() {
    if (!fs.existsSync(DATA)) {
        fs.writeFileSync(DATA, "[]");
    }
    return JSON.parse(fs.readFileSync(DATA, "utf8"));
}

function saveStudents(students) {
    fs.writeFileSync(DATA, JSON.stringify(students, null, 2));
}

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// LIST ALL STUDENTS
app.get("/api/students", (req, res) => {
    res.json(readStudents());
});

// FIND ONE STUDENT
app.get("/api/students/:id", (req, res) => {
    const student = readStudents().find(
        s => s.id === String(req.params.id)
    );

    if (!student) {
        return res.status(404).json({ message: "Student not found" });
    }
    res.json(student);
});

// INSERT STUDENT
app.post("/api/students", (req, res) => {
    const { id, name, total } = req.body;

    if (
        !String(id || "").trim() ||
        !String(name || "").trim() ||
        total === "" ||
        total === undefined ||
        !Number.isFinite(Number(total)) ||
        Number(total) < 0
    ) {
        return res.status(400).json({
            message: "Enter a valid ID, name and total marks."
        });
    }

    const students = readStudents();
    const studentId = String(id).trim();

    if (students.some(s => s.id === studentId)) {
        return res.status(409).json({
            message: "This student ID already exists."
        });
    }

    students.push({
        id: studentId,
        name: String(name).trim(),
        total: Number(total)
    });

    saveStudents(students);
    res.status(201).json({ message: "Student inserted successfully." });
});

// UPDATE STUDENT
app.put("/api/students/:id", (req, res) => {
    const students = readStudents();
    const student = students.find(
        s => s.id === String(req.params.id)
    );

    if (!student) {
        return res.status(404).json({ message: "Student not found." });
    }

    const { name, total } = req.body;

    if (!String(name || "").trim() ||
        total === "" ||
        total === undefined ||
        !Number.isFinite(Number(total)) ||
        Number(total) < 0) {
        return res.status(400).json({
            message: "Enter a valid name and total marks."
        });
    }

    student.name = String(name).trim();
    student.total = Number(total);

    saveStudents(students);
    res.json({ message: "Student updated successfully." });
});

// DELETE STUDENT
app.delete("/api/students/:id", (req, res) => {
    const students = readStudents();
    const id = String(req.params.id);
    const remaining = students.filter(s => s.id !== id);

    if (remaining.length === students.length) {
        return res.status(404).json({ message: "Student not found." });
    }

    saveStudents(remaining);
    res.json({ message: "Student deleted successfully." });
});

app.listen(PORT, () => {
    console.log(`School Management System running at http://localhost:${PORT}`);
});