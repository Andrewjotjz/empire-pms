// Import modules
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux'
import { setEmployeeDetails, clearEmployeeDetails } from '../redux/employeeSlice'
import SessionExpired from "../components/SessionExpired";
import EmployeePageSkeleton from "./loaders/EmployeePageSkeleton";

const Employee = () => {
    //Component state declaration
    const employeeState = useSelector((state) => state.employeeReducer.employeeState)
    const dispatch = useDispatch()
    const [isLoadingState, setIsLoadingState] = useState(true);
    const [errorState, setErrorState] = useState(null);
    

    //Component router
    const navigate = useNavigate();

    //Component functions and variables
    const handleAddClick = () => {
        dispatch(clearEmployeeDetails());
        navigate('/EmpirePMS/employee/create');
    }
    const handleTableClick = (id) => navigate(`/EmpirePMS/employee/${id}`, { state: id });
    const employeeTable = Array.isArray(employeeState) && employeeState.length > 0 ? (
        <div className="container">
            <table className="table table-bordered table-hover">
                <thead className="thead-dark">
                    <tr className="table-primary">
                        <th scope="col">ID</th>
                        <th scope="col">Name</th>
                        <th scope="col">Email</th>
                        <th scope="col">Contact</th>
                        <th scope="col">Role</th>
                        <th scope="col">Project</th>
                    </tr>
                </thead>
                <tbody>
                    {employeeState.map((employee, index) => (
                        <tr key={employee._id} onClick={() => handleTableClick(employee._id)}>
                            <th scope="row">{index + 1}</th>
                            <td>{`${employee.employee_first_name} ${employee.employee_last_name}`}</td>
                            <td>{employee.employee_email}</td>
                            <td>{employee.employee_mobile_phone}</td>
                            <td>{employee.employee_roles}</td>
                            <td>project data...</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    ) : (
        <div>Employee data fetched successfully, but it might be empty...</div>
    );

    //Render component
    useEffect(() => {
        const abortController = new AbortController();
        const signal = abortController.signal;

        const fetchEmployeeDetails = async () => {
            setIsLoadingState(true); // Set loading state to true at the beginning
            try {
                const res = await fetch('/api/employee', { signal });
                if (!res.ok) {
                    throw new Error('Failed to fetch');
                }
                const data = await res.json();

                if (data.tokenError) {
                    throw new Error(data.tokenError);
                }
                
                setIsLoadingState(false);
                dispatch(setEmployeeDetails(data));
                setErrorState(null);
            } catch (error) {
                if (error.name === 'AbortError') {
                    // do nothing
                } else {
                    setIsLoadingState(false);
                    setErrorState(error.message);
                }
            }
        };

        fetchEmployeeDetails();

        return () => {
            abortController.abort(); // Cleanup
        };
    }, [dispatch]);

    //Display DOM
    if (isLoadingState) { return (<EmployeePageSkeleton />); }

    if (errorState) {
        if(errorState.includes("Session expired") || errorState.includes("jwt expired")){
            return(<div><SessionExpired /></div>)
        }
        return (<div>Error: {errorState}</div>);
    }

    return (
        <div className="container mt-5"><div className="card">
                <div className="card-header bg-dark text-white">
                    <h1>EMPLOYEES</h1>
                </div>
                <div className="card-body">
                    <div className="row mb-3">
                        <div className="col-md-6">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search..."
                            />
                        </div>
                        <div className="col-md-6 d-flex justify-content-end">
                            <button className="btn btn-primary" onClick={handleAddClick}>
                                Add Employee
                            </button>
                        </div>
                    </div>
                    <div className="row mb-3">
                        <div className="col-md-6">
                            <button className="btn btn-outline-dark me-2">Current</button>
                            <button className="btn btn-outline-dark">Archived</button>
                        </div>
                        {employeeTable}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Employee;


//! DO NOT DELETE
// <div className="employee">
//     <div>
//         <h1>EMPLOYEES</h1>
//     </div>
//     <div>
//         <input placeholder="Search..." />
//         <button>ADD EMPLOYEE</button>
//     </div>
//     <div>
//         <button>Current</button>
//         <button>Archived</button>
//         {employeeTable}
//     </div>
// </div>