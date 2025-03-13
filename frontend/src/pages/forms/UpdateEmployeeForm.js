// Import modules
import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setEmployeeDetails } from '../../redux/employeeSlice';
import { useUpdateEmployee } from '../../hooks/useUpdateEmployee'; 
import SessionExpired from '../../components/SessionExpired';
import EmployeeDetailsSkeleton from "../loaders/EmployeeDetailsSkeleton"
import UnauthenticatedSkeleton from "../loaders/UnauthenticateSkeleton";

const UpdateEmployeeForm = () => {
    // Component router
    const location = useLocation();
    const retrieved_id = location.state;
    const navigate = useNavigate();
    const {id} = useParams();

    // Component state declaration
    const employeeState = useSelector((state) => state.employeeReducer.employeeState);
    const dispatch = useDispatch();
    const { update, isLoadingState, errorState } = useUpdateEmployee();
    const [isFetchEmployeeLoading, setFetchEmployeeLoading] = useState(true);
    const [fetchEmployeeError, setFetchEmployeeError] = useState(null);

    // Component functions and variables
    const localUser = JSON.parse(localStorage.getItem('localUser'))

    const handleChangePasswordClick = () => navigate(`/EmpirePMS/employee/${retrieved_id}/change-password`, {state: retrieved_id});

    const handleBackClick = () => navigate(`/EmpirePMS/employee/${retrieved_id}`);
    
    const handleInputChange = (event) => {
        const { name, value } = event.target;
        dispatch(setEmployeeDetails({
            ...employeeState,
            [name]: value,
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        update(employeeState);
    };

    const fetchEmployee = useCallback(async () => {
        setFetchEmployeeLoading(true);
            try {
                const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/employee/${id}`, { credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${sessionStorage.getItem('jwt')}` // Include token in Authorization header
                    } });
                if (!res.ok) {
                    throw new Error('Failed to fetch employee details');
                }
                const data = await res.json();
    
                if (data.tokenError) {
                    throw new Error(data.tokenError);
                }
    
                dispatch(setEmployeeDetails(data));
                setFetchEmployeeLoading(false);
            } catch (err) {
                setFetchEmployeeError(err.message);
                setFetchEmployeeLoading(false);
            }
        }, [id, dispatch]);
    
        useEffect(() => {
            fetchEmployee();
        }, [fetchEmployee]);

    //Display DOM
    if (isLoadingState || isFetchEmployeeLoading) { return (<EmployeeDetailsSkeleton />); }

    if (errorState) {
        if (errorState.includes("Session expired") || errorState.includes("jwt expired") || errorState.includes("jwt malformed")) {
            return (<div><SessionExpired /></div>);
        }
        return (<div>Error: {errorState || fetchEmployeeError}</div>);
    }

    return (
        localUser && Object.keys(localUser).length > 0 ? (
        employeeState && Object.keys(employeeState).length > 0 ? (
            <div className="container mt-5"> 
                <div className="card">
                    <div className="card-header bg-dark text-white">
                        <h1>EDIT ACCOUNT DETAILS</h1>
                    </div>
                    <form  onKeyDown={(e) => { if (e.key === 'Enter') {e.preventDefault();} }} className="card-body" onSubmit={handleSubmit}>
                        <div className="d-flex justify-content-end mb-3 hover:cursor-not-allowed">
                            <button type="button" className="btn btn-secondary bg" onClick={handleChangePasswordClick} disabled>CHANGE PASSWORD</button>
                        </div>
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label fw-bold">First name:</label>
                                <input 
                                    className="form-control placeholder-gray-400 placeholder-opacity-50" 
                                    name="employee_first_name" 
                                    value={employeeState.employee_first_name} 
                                    onChange={handleInputChange}
                                    placeholder='First name'
                                    required
                                    onInvalid={(e) => e.target.setCustomValidity('Enter first name')}
                                    onInput={(e) => e.target.setCustomValidity('')}
                                />
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label fw-bold">Last name:</label>
                                <input 
                                    className="form-control placeholder-gray-400 placeholder-opacity-50" 
                                    name="employee_last_name" 
                                    value={employeeState.employee_last_name} 
                                    onChange={handleInputChange} 
                                    placeholder='Last name'
                                    required
                                    onInvalid={(e) => e.target.setCustomValidity('Enter last name')}
                                    onInput={(e) => e.target.setCustomValidity('')}
                                />
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label fw-bold">Role:</label>
                                <select 
                                    className="form-control"
                                    name="employee_roles" 
                                    value={employeeState.employee_roles} 
                                    onChange={handleInputChange}
                                >
                                    <option value="Admin">Admin</option>
                                    <option value="Manager">Manager</option>
                                    <option value="Foreman">Foreman</option>
                                    <option value="Employee">Employee</option>
                                </select>
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label fw-bold">Contact:</label>
                                <input 
                                    className="form-control placeholder-gray-400 placeholder-opacity-50" 
                                    name="employee_mobile_phone" 
                                    value={employeeState.employee_mobile_phone} 
                                    onChange={handleInputChange} 
                                    placeholder='04... or 03...'
                                />
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label fw-bold">Email:</label>
                                <input 
                                    className="form-control" 
                                    name="employee_email" 
                                    value={employeeState.employee_email}
                                    disabled
                                />
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label fw-bold">Company:</label>
                                <input 
                                    className="form-control" 
                                    name="companies" 
                                    value={employeeState.companies} 
                                    disabled
                                />
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label fw-bold">Archived:</label>
                                <input 
                                    type="checkbox"
                                    className="form-check-input m-1" 
                                    name="employee_isarchived" 
                                    checked={employeeState.employee_isarchived} 
                                    onChange={(e) => handleInputChange({ target: { name: 'employee_isarchived', value: e.target.checked }})}
                                />
                            </div>
                            <div className="d-flex justify-content-between mb-3">
                                <button type="button" onClick={() => handleBackClick(retrieved_id)} className="btn btn-secondary">CANCEL</button>
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

export default UpdateEmployeeForm;
