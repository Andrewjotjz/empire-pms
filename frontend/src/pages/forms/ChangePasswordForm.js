// Import modules
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useChangePassword } from '../../hooks/useChangePassword'; 
import SessionExpired from '../../components/SessionExpired';
import EmployeeDetailsSkeleton from "../loaders/EmployeeDetailsSkeleton"
import UnauthenticatedSkeleton from "../loaders/UnauthenticateSkeleton";

const ChangePasswordForm = () => {
    // Component router
    const location = useLocation();
    const retrieved_id = location.state;

    // Component state declaration
    const employeeState = useSelector((state) => state.employeeReducer.employeeState);
    const { changePassword, isLoadingState, errorState } = useChangePassword();
    const [ newPassword, setNewPassword ] = useState('');
    const [ confirmPassword, setConfirmPassword ] = useState('');
    const [ isPasswordValid, setIsPasswordValid ] = useState(true);

    // Component functions and variables
    const localUser = JSON.parse(localStorage.getItem('localUser'))

    const handleBackClick = () => window.history.back();
        
    const checkPassword = () => {
        if (newPassword !== confirmPassword){
            setIsPasswordValid(false);
            return false;
        }
        setIsPasswordValid(true)
        return true;
    }
    
    const handleSubmit = (event) => {
        event.preventDefault();
        if (checkPassword()) {
            changePassword(newPassword);
        }
    };    
    
    //Display DOM
    if (isLoadingState) { return (<EmployeeDetailsSkeleton />); }

    if (errorState) {
        console.log(errorState)
        if (errorState.includes("Session expired") || errorState.includes("jwt expired") || errorState.includes("jwt malformed")) {
            return (<div><SessionExpired /></div>);
        }
        return (<div>Error: {errorState}</div>);
    }

    return (
        localUser && Object.keys(localUser).length > 0 ? (
        employeeState && Object.keys(employeeState).length > 0 ? (
            <div className="container mt-5"> 
                <div className="card">
                    <div className="card-header bg-dark text-white">
                        <h1>CHANGE PASSWORD</h1>
                    </div>
                    <form className="card-body" onSubmit={handleSubmit}>
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label font-bold">Email:</label>
                                <p className="form-label">{employeeState.employee_email}</p>
                            </div>
                        <div/>
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label font-bold">New Password:</label>
                                <input 
                                    className="form-control" 
                                    name="employee_password" 
                                    value={newPassword} 
                                    onChange={(e) => {setNewPassword(e.target.value)}} 
                                    placeholder='password'
                                    required
                                    onInvalid={(e) => e.target.setCustomValidity('Enter password')}
                                    onInput={(e) => e.target.setCustomValidity('')}
                                />
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label font-bold">Confirm Password:</label>
                                <input 
                                    className="form-control" 
                                    name="confirm_password" 
                                    value={confirmPassword} 
                                    onChange={(e) => {setConfirmPassword(e.target.value)}} 
                                    placeholder='password'
                                    required
                                    onInvalid={(e) => e.target.setCustomValidity('Please re-enter your new password')}
                                    onInput={(e) => e.target.setCustomValidity('')}
                                />
                            </div>
                        </div>
                            { !isPasswordValid && 
                            <div className="col-md-6 mb-3">
                                <p className="form-label text-danger">Password does not match. Please re-enter your password.</p>
                            </div> }
                            <div className="d-flex justify-content-between mb-3">
                                <button type="button" onClick={() => handleBackClick(retrieved_id)} className="btn btn-secondary">BACK</button>
                                <button className="btn btn-primary" type="submit">SUBMIT</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        ) : (
            <div><SessionExpired /></div>
        ) ) : ( <UnauthenticatedSkeleton /> )
    );
};

export default ChangePasswordForm;