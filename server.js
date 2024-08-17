const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const nodemailer = require('nodemailer');
const cron = require('node-cron');

// Initialize Express
const app = express();
app.use(express.json());
app.use(cors()); // Enable CORS

// Set up PostgreSQL client
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'da_name',
    password: 'db_password',
    port: 5432,
});

// Create a transporter object using SMTP transport
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'user mail',
        pass: 'app password' // Consider using environment variables for security
    }
});

// Function to send email
const sendEmail = ({ to, subject, text }) => {
    const mailOptions = {
        from: 'user mail',
        to,
        subject,
        text
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error occurred:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
};

// API Endpoint to schedule email
app.post('/api/form', async (req, res) => {
    const { job, recipient, subject, body, scheduledtime } = req.body;

    try {
        // Save email details to the database
        const result = await pool.query(
            'INSERT INTO emails (job, recipient, subject, body, scheduledtime, sent_at) VALUES ($1, $2, $3, $4, $5, NULL) RETURNING *',
            [job, recipient, subject, body, scheduledtime]
        );

        res.status(200).json({ message: 'Email scheduled successfully!', data: result.rows[0] });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send('Failed to schedule email');
    }
});

// Schedule a task to run every minute
cron.schedule('* * * * *', async () => {
    console.log('Running scheduled task');

    try {
        // Fetch email details from the database
        const result = await pool.query('SELECT * FROM emails WHERE scheduledtime <= NOW() AND sent_at IS NULL');

        await Promise.all(result.rows.map(async row => {
            await sendEmail({
                to: row.recipient,
                subject: row.subject,
                text: row.body
            });

            // Update sent_at timestamp
            await pool.query('UPDATE emails SET sent_at = $1 WHERE id = $2', [new Date(), row.id]);
        }));
    } catch (err) {
        console.error('Error during scheduled task:', err);
    }
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
