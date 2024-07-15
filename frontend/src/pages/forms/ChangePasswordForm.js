// Import modules
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setEmployeeDetails } from '../../redux/employeeSlice';
import { useUpdateEmployee } from '../../hooks/useUpdateEmployee'; 
import SessionExpired from '../../components/SessionExpired';
import EmployeeDetailsSkeleton from "../loaders/EmployeeDetailsSkeleton"

const ChangePasswordForm = () => {
    // Component router
    const location = useLocation();
    const retrieved_id = location.state;
    const navigate = useNavigate();

    // Component state declaration
    const employeeState = useSelector((state) => state.employeeReducer.employeeState);
    const dispatch = useDispatch();
    const { update, isLoadingState, errorState } = useUpdateEmployee();
    const [ confirmPassword, setConfirmPassword ] = useState('');
    const [ isPasswordValid, setIsPasswordValid ] = useState('true')

    // Component functions and variables
    const handleBackClick = (employee_id) => navigate(`/EmpirePMS/employee/${employee_id}`);
    
    const handleInputChange = (event) => {
        const { name, value } = event.target;
        dispatch(setEmployeeDetails({
            ...employeeState,
            [name]: value,
        }));
    };

    const checkPassword = () => {
        if (confirmPassword !== employeeState.employee_password) {
            setIsPasswordValid(false)
        }
    }
    const handleSubmit = (event) => {
        event.preventDefault();
        update(employeeState);
    };

    //Display DOM
    if (isLoadingState) { return (<EmployeeDetailsSkeleton />); }

    if (errorState) {
        if (errorState.includes("Session expired") || errorState.includes("jwt expired")) {
            return (<div><SessionExpired /></div>);
        }
        return (<div>Error: {errorState}</div>);
    }

    return (
        employeeState && Object.keys(employeeState).length > 0 ? (
            <div className="container mt-5"> 
                <div className="card">
                    <div className="card-header bg-dark text-white">
                        <h1>CHANGE PASSWORD</h1>
                    </div>
                    <form className="card-body" onSubmit={handleSubmit}>
                        <div className="d-flex justify-content-between mb-3">
                            <button type="button" onClick={() => handleBackClick(retrieved_id)} className="btn btn-secondary">BACK</button>
                        </div>
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Email:</label>
                                <p className="form-label">{employeeState.employee_email}</p>
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label">New Password:</label>
                                <input 
                                    className="form-control" 
                                    name="employee_password" 
                                    value={employeeState.employee_password} 
                                    onChange={handleInputChange} 
                                    placeholder='password'
                                    required
                                    onInvalid={(e) => e.target.setCustomValidity('Enter password')}
                                    onInput={(e) => e.target.setCustomValidity('')}
                                />
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Confirm Password:</label>
                                <input 
                                    className="form-control" 
                                    name="confirm_password" 
                                    value={confirmPassword} 
                                    onChange={(e) => {setConfirmPassword(e.target.value)}} 
                                    placeholder='password'
                                    required
                                    onInvalid={(e) => e.target.setCustomValidity('Please re-enter your new passowrd')}
                                    onInput={(e) => e.target.setCustomValidity('')}
                                />
                            </div>
                            { }
                            <div className="col-md-6 mb-3">
                                <p className="form-label">Password does not match. Please re-enter your password.</p>
                            </div>
                            <div className="d-flex justify-content-between mb-3">
                                <button className="btn btn-primary" type="submit">SUBMIT</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        ) : (
            <div><SessionExpired /></div>
        )
    );
};

export default ChangePasswordForm;
