//import modules
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setEmployeeDetails } from '../redux/employeeSlice';
import { toast } from 'react-toastify';
import SessionExpired from "../components/SessionExpired";
import EmployeeDetailsSkeleton from "./loaders/EmployeeDetailsSkeleton";
import Dropdown from "react-bootstrap/Dropdown"

const EmployeeDetails = () => {
    //Component state declaration
    const employeeState = useSelector((state) => state.employeeReducer.employeeState)
    const localUserState = useSelector((state) => state.localUserReducer.localUserState)
    const dispatch = useDispatch()
    const [isLoadingState, setIsLoadingState] = useState(true);
    const [errorState, setErrorState] = useState(null);
    const [currentTab, setCurrentTab] = useState('employeeDetails');

    //Component router
    const { id } = useParams();
    const navigate = useNavigate();

    //Component functions and variables
    const handleEditClick = () => navigate(`/EmpirePMS/employee/${id}/edit`, { state: id });

    const handleChangePassword = () => navigate(`/EmpirePMS/employee/${id}/change-password`, { state: id });

    const handleSendResetPassword = async () => {
        setIsLoadingState(true);
        
        try {
            const response = await fetch(`/api/employee/${id}/send-reset-password-email`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json',},
            });
    
            if (!response.ok) {
                throw new Error('Failed to send password reset email');
            }
    
            // Navigate only if successful
            navigate(`/EmpirePMS/employee/${id}`);
    
            // Display success message
            toast.success(`Password reset email sent successfully!`, {
                position: "bottom-right"
            });
    
            // Update loading state
            setIsLoadingState(false);
        } catch (error) {
            setErrorState(error.message);
            setIsLoadingState(false);
        }
    };
    
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
    const employeeDetails = (
        <div className="row border mx-1 rounded-sm">
            <div className="d-flex justify-content-end mt-2 mr-3">
                    <Dropdown>
                        <Dropdown.Toggle variant="success" id="dropdown-basic">
                            ACTIONS
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <Dropdown.Item onClick={handleEditClick}>Edit Account</Dropdown.Item>
                            <Dropdown.Item onClick={handleSendResetPassword}>Email Password Reset</Dropdown.Item>
                            <Dropdown.Item onClick={handleChangePassword}>Change Password</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
            <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">Name:</label>
                <p className="form-label">{employeeState.employee_first_name} {employeeState.employee_last_name}</p>
            </div>
            <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">Email:</label>
                <p className="form-label">{employeeState.employee_email}</p>
            </div>
            <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">Contact:</label>
                <p className="form-label">{employeeState.employee_mobile_phone}</p>
            </div>
            <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">Role:</label>
                <p className="form-label">{employeeState.employee_roles}</p>
            </div>
            <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">Company:</label>
                <p className="form-label">{employeeState.companies}</p>
            </div>
            <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">Projects:</label>
                <p className="form-label">Some project data...</p>
            </div>
            <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">Status:</label>
                {employeeState.employee_isarchived ? 
                    (<label className="text-lg font-bold m-1 p-2 rounded-xl text-red-500">Archived</label>) : 
                    (<label className="text-lg font-bold m-1 p-2 rounded-xl text-green-600">Active</label>)
                }
            </div>
        </div>
    )

    const employeeProjectsTable = ( <div className="border rounded-sm">some projects data...</div> )
    
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
            <div className="card-header bg-dark text-white flex justify-between items-center">
                    <button onClick={() => {navigate("/EmpirePMS/employee")}}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-7 w-12 border-transparent bg-gray-700 rounded-md p-1 hover:bg-gray-500 hover:scale-95 ease-out duration-300">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m18.75 4.5-7.5 7.5 7.5 7.5m-6-15L5.25 12l7.5 7.5"/>
                        </svg>
                    </button>
                    <h1 className='mx-auto uppercase font-bold text-xl'>{localUserState.employee_email === employeeState.employee_email ? 'YOUR ACCOUNT' : 'EMPLOYEE ACCOUNT'}</h1>
                </div>
            <div className="card-body">
                <div>
                    <button className={`${currentTab === 'employeeDetails' ? 'border-x-2 border-t-2 p-2 rounded bg-gray-700 text-white' : 'border-x-2 border-t-2 p-2 rounded bg-transparent text-black hover:scale-90 transition ease-out duration-50 '}`}  onClick={() => setCurrentTab('employeeDetails')}>Details</button>
                    <button className={`${currentTab === 'employeeProjectsTable' ? 'border-x-2 border-t-2 p-2 rounded bg-gray-700 text-white' : 'border-x-2 border-t-2 p-2 rounded bg-transparent text-black hover:scale-90 transition ease-out duration-50 '}`}  onClick={() => setCurrentTab('employeeProjectsTable')}>Projects</button>
                </div>
                    {/* SWITCH BETWEEN COMPONENTS HERE */}
                    {currentTab === 'employeeDetails' && employeeDetails}
                    {currentTab === 'employeeProjectsTable' && employeeProjectsTable}
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
