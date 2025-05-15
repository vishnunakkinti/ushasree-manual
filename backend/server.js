const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');  // For password hashing
require('dotenv').config();

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Connect **without** specifying a database initially
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'ushasreedb.c588mswco6jw.ap-south-1.rds.amazonaws.com',
    user: process.env.DB_USER || 'admin',
    password: process.env.DB_PASSWORD || 'admin123',
    // database not specified here
});

db.connect((err) => {
    if (err) {
        console.error('❌ Database Connection Failed:', err.message);
        process.exit(1);
    }
    console.log('✅ Connected to MySQL server!');

    // Step 1: Create database if it doesn't exist
    db.query('CREATE DATABASE IF NOT EXISTS ushasree', (err) => {
        if (err) {
            console.error('❌ Error creating database:', err.message);
            return;
        }
        console.log('✅ Database "ushasree" created or already exists');

        // Step 2: Switch to the database
        db.query('USE ushasree', (err) => {
            if (err) {
                console.error('❌ Error switching to database:', err.message);
                return;
            }
            console.log('✅ Using database "ushasree"');

            // Step 3: Create users table
            const createUsersTableQuery = `
                CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    username VARCHAR(255) NOT NULL,
                    email VARCHAR(255) NOT NULL,
                    password VARCHAR(255) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `;
            db.query(createUsersTableQuery, (err) => {
                if (err) {
                    console.error('❌ Error creating users table:', err.message);
                    return;
                }
                console.log('✅ Users table created or already exists');

                // Step 4: Create enrollments table
                const createEnrollmentsTableQuery = `
                    CREATE TABLE IF NOT EXISTS enrollments (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        course_name VARCHAR(255) NOT NULL,
                        email VARCHAR(255) NOT NULL,
                        password VARCHAR(255) NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                `;
                db.query(createEnrollmentsTableQuery, (err) => {
                    if (err) {
                        console.error('❌ Error creating enrollments table:', err.message);
                        return;
                    }
                    console.log('✅ Enrollments table created or already exists');
                });
            });
        });
    });
});

// Default route
app.get('/', (req, res) => {
    res.send('✅ UshaSree Backend is Running');
});

// Signup and login routes as you wrote them, unchanged

// API: Signup
app.post('/signup', (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).send('All fields are required');
    }

    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            console.error('❌ Error hashing password:', err.message);
            return res.status(500).send('Error hashing password');
        }

        const sql = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
        db.query(sql, [username, email, hashedPassword], (err) => {
            if (err) {
                console.error('❌ Signup DB Error:', err.message);
                return res.status(500).send('Signup failed: ' + err.message);
            }
            res.send('🎉 User Registered Successfully');
        });
    });
});

// API: Login
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).send('Both username and password are required');
    }

    const sql = "SELECT * FROM users WHERE username = ?";
    db.query(sql, [username], (err, results) => {
        if (err) {
            console.error('❌ Login DB Error:', err.message);
            return res.status(500).send('Login failed: ' + err.message);
        }
        if (results.length > 0) {
            bcrypt.compare(password, results[0].password, (err, isMatch) => {
                if (err) {
                    console.error('❌ Error comparing passwords:', err.message);
                    return res.status(500).send('Error comparing passwords');
                }

                if (isMatch) {
                    res.send('✅ Login Successful');
                } else {
                    res.status(401).send('❌ Invalid Credentials');
                }
            });
        } else {
            res.status(401).send('❌ Invalid Credentials');
        }
    });
});

// API: Enroll in a course
app.post('/enroll', (req, res) => {
    const { course, email, password } = req.body;
    if (!course || !email || !password) {
        return res.status(400).send("All fields are required.");
    }

    const sql = "INSERT INTO enrollments (course_name, email, password) VALUES (?, ?, ?)";
    db.query(sql, [course, email, password], (err) => {
        if (err) {
            console.error("❌ Enrollment DB Error:", err.message);
            return res.status(500).send("Enrollment failed.");
        }
        res.send("✅ Enrollment successful!");
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Backend running on port ${PORT}`);
});
