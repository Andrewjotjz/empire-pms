import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';

const PasswordReset = () => {
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const query = new URLSearchParams(useLocation().search);
    const token = query.get('token');
    const id = query.get('id');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/employee/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token, id, newPassword }),
            });
            console.log("#1 check: API fetch successful");
            const data = await response.json();
            if (response.ok) {
                console.log("#2 check: response OK");
                setMessage(data.message);
            } else {
                console.log("#3 check: response NOT OK");
                setMessage(data.error);
            }
        } catch (error) {
            console.log("#4 check: ERROR");
            setMessage('An error occurred. Please try again.');
        }
    };

    return (
        <div>
            <h2>Reset Your Password</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                />
                <button type="submit">Reset Password</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default PasswordReset;
