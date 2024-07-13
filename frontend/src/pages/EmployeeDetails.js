//import modules
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setEmployeeDetails } from '../redux/employeeSlice';
import SessionExpired from "../components/SessionExpired";
import EmployeeDetailsSkeleton from "./loaders/EmployeeDetailsSkeleton";

const EmployeeDetails = () => {
    //Component state declaration
    const employeeState = useSelector((state) => state.employeeReducer.employeeState)
    const localUserState = useSelector((state) => state.localUserReducer.localUserState)
    const dispatch = useDispatch()
    const [isLoadingState, setIsLoadingState] = useState(true);
    const [errorState, setErrorState] = useState(null);

    //Component router
    const { id } = useParams();
    const navigate = useNavigate();

    //Component functions and variables
    const handleEditClick = () => {
        navigate(`/EmpirePMS/employee/${id}/edit`, { state: id })
    }

    //Render component
    useEffect(() => {
        const fetchEmployee = async () => {
            try {
                const res = await fetch(`/api/employee/${id}`);
                if (!res.ok) {
                    throw new Error('Failed to fetch employee details');
                }
                const data = await res.json();

                if (data.tokenError) {
                    throw new Error(data.tokenError);
                }

                dispatch(setEmployeeDetails(data));
                setIsLoadingState(false);
            } catch (err) {
                setErrorState(err.message);
                setIsLoadingState(false);
            }
        };

        fetchEmployee();
    }, [id, dispatch]);

    //Display DOM
    if (isLoadingState) { return (<EmployeeDetailsSkeleton />); }

    if (errorState) {
        if(errorState.includes("Session expired") || errorState.includes("jwt expired")){
            return(<div><SessionExpired /></div>)
        }
        return (<div>Error: {errorState}</div>);
    }

    return (
        <div className="container mt-5">
        <div className="card">
            <div className="card-header bg-dark text-white">
                <h1>{localUserState.employee_email === employeeState.employee_email ? 'YOUR ACCOUNT' : 'EMPLOYEE ACCOUNT'}</h1>
            </div>
            <div className="card-body">
                <div className="d-flex justify-content-between mb-3">
                    <Link to="/EmpirePMS/employee" className="btn btn-secondary">Back</Link>
                    <button className="btn btn-primary" onClick={handleEditClick}>Edit Account</button>
                    <select className="form-select w-auto">
                        <option>ACTIONS</option>
                        <option>Email Password Reset</option>
                        <option>Change Password</option>
                    </select>
                </div>
                <div className="d-flex mb-3">
                    <button className="btn btn-outline-dark">Details</button>
                    <button className="btn btn-outline-dark">Projects</button>
                </div>
                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Name:</label>
                        <p className="form-label">{employeeState.employee_first_name} {employeeState.employee_last_name}</p>
                    </div>
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Email:</label>
                        <p className="form-label">{employeeState.employee_email}</p>
                    </div>
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Contact:</label>
                        <p className="form-label">{employeeState.employee_mobile_phone}</p>
                    </div>
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Role:</label>
                        <p className="form-label">{employeeState.employee_roles}</p>
                    </div>
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Company:</label>
                        <p className="form-label">{employeeState.companies}</p>
                    </div>
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Projects:</label>
                        <p className="form-label">Some project data...</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    );
};

export default EmployeeDetails;


//! DO NOT DELETE
// <div className='employeeDetails'>
//     <div>
//         <h1>EMPLOYEE ACCOUNT</h1>
//     </div>
//     <div>
//         <button>Back</button>
//         <button>EDIT ACCOUNT</button>
//         <select>
//             <option>EMAIL PASSWORD RESET</option>
//             <option>CHANGE PASSWORD</option>
//         </select>
//     </div>
//     <div>
//         <button>Details</button>
//         <button>Projects</button>
//     </div>
//     <div>
//         <label>Name:</label>
//         <span>{employeeState.employee_first_name} {employeeState.employee_last_name}</span>
//         <label>Email:</label>
//         <span>{employeeState.employee_email}</span>
//         <label>Contact:</label>
//         <span>{employeeState.employee_mobile_phone}</span>
//         <label>Role:</label>
//         <span>{employeeState.employee_roles}</span>
//     </div>
// </div>
