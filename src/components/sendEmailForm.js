import React, { useState } from 'react';
import axios from 'axios';
import '../styles/sendEmailForm.css';

const SendEmailForm = () => {
    const [recipient, setRecipient] = useState('');
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [job, setJob] = useState(''); // New state for job description
    const [scheduledDate, setScheduledDate] = useState(''); // New state for scheduled date
    const [scheduledTime, setScheduledTime] = useState(''); // New state for scheduled time
    const [responseMessage, setResponseMessage] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        const scheduledDateTime = `${scheduledDate}T${scheduledTime}`;

        try {
            const response = await axios.post('http://localhost:5000/api/form', {
                job,
                recipient,
                subject,
                body,
                scheduledtime: scheduledDateTime
            });
            setResponseMessage(response.data.message);
        } catch (error) {
            setResponseMessage('Failed to schedule email');
            console.error('Error scheduling email:', error);
        }
    };

    return (
        <div>
            <h1>Send Email</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="job">Job Description:</label>
                    <input
                        type="text"
                        id="job"
                        value={job}
                        onChange={(e) => setJob(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="recipient">Recipient:</label>
                    <input
                        type="email"
                        id="recipient"
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="subject">Subject:</label>
                    <input
                        type="text"
                        id="subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="body">Body:</label>
                    <textarea
                        id="body"
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        required
                    ></textarea>
                </div>
                <div>
                    <label htmlFor="scheduledDate">Scheduled Date:</label>
                    <input
                        type="date"
                        id="scheduledDate"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="scheduledTime">Scheduled Time:</label>
                    <input
                        type="time"
                        id="scheduledTime"
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Send Email</button>
            </form>
            {responseMessage && <p>{responseMessage}</p>}
        </div>
    );
};

export default SendEmailForm;
