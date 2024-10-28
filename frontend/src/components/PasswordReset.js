import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const PasswordReset = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const query = new URLSearchParams(useLocation().search);
    const token = query.get('token');
    const id = query.get('id');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setMessage('Password does not match. Please re-enter your password.');
            return
        }

        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/employee/reset-password`, {
                credentials: 'include', method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token, id, newPassword }),
            });

            const data = await response.json();

            if (response.ok) {
                // navigate user to login page
                navigate(`/EmpirePMS/login`)

                // push toast to notify successful login
                toast.success(`Password reset successful!`, {
                    position: "top-center"
                });
            } else {
                setMessage(data.error);
            }
        } catch (error) {
            setMessage('An error occurred. Please try again.');
        }
    };

    return (
        <div className="container mt-5"> 
            <div className="card">
                <div className="card-header bg-dark text-white">
                    <h1>RESET YOUR PASSWORD</h1>
                </div>
                <form className="card-body" onSubmit={handleSubmit}>
                    <div className="col-md-6 mb-3">
                        <p className="form-text">To reset your password, kindly enter your new password below.</p>
                        <label className="form-label">New Password:</label>
                        <input 
                            type='password'
                            className="form-control" 
                            name="newPassword" 
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder='Minimum 6 characters'
                            required
                            onInvalid={(e) => e.target.setCustomValidity('Enter new password')}
                            onInput={(e) => e.target.setCustomValidity('')}
                        />
                    </div>
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Confirm Password:</label>
                        <input 
                            type='password'
                            className="form-control" 
                            name="confirmPassword" 
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder='Minimum 6 characters'
                            required
                            onInvalid={(e) => e.target.setCustomValidity('Enter to confirm new password')}
                            onInput={(e) => e.target.setCustomValidity('')}
                        />
                    </div>
                    { message && 
                    <div className="col-md-6 mb-3">
                        <p className="form-label text-danger">{ message }</p>
                    </div> }
                    <div className="d-flex justify-content-between mb-3">
                        <button type="submit" className="btn btn-primary">RESET PASSWORD</button>
                    </div>
                </form>
            </div>
        </div>
    )
};

export default PasswordReset;
