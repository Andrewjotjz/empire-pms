// Import modules
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux'
import { setEmployeeDetails, clearEmployeeDetails } from '../redux/employeeSlice'
import SessionExpired from "../components/SessionExpired";
import EmployeePageSkeleton from "./loaders/EmployeePageSkeleton";
import UnauthenticatedSkeleton from '../pages/loaders/UnauthenticateSkeleton'

const Employee = () => {
    //Component state declaration
    const localUser = JSON.parse(localStorage.getItem('localUser'))
    const employeeState = useSelector((state) => state.employeeReducer.employeeState)
    const dispatch = useDispatch()
    const [isLoadingState, setIsLoadingState] = useState(true);
    const [errorState, setErrorState] = useState(null);
    const [isArchive, setIsArchive] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');    
    

    //Component router
    const navigate = useNavigate();

    //Component functions and variables
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const filterEmployees = () => {
        return employeeState.filter(employee => {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
    
            return (
                employee.employee_last_name.toLowerCase().includes(lowerCaseSearchTerm) ||
                employee.employee_first_name.toLowerCase().includes(lowerCaseSearchTerm) ||
                employee.employee_email.toLowerCase().includes(lowerCaseSearchTerm) ||
                employee.employee_mobile_phone.toString().includes(lowerCaseSearchTerm) ||
                employee.employee_roles.toLowerCase().toLowerCase().includes(lowerCaseSearchTerm)
            );
        });
    };

    const handleAddClick = () => {
        dispatch(clearEmployeeDetails());
        navigate('/EmpirePMS/employee/create');
    }

    const handleTableClick = (id) => navigate(`/EmpirePMS/employee/${id}`, { state: id });

    //Render component
    useEffect(() => {
        const abortController = new AbortController();
        const signal = abortController.signal;

        const fetchEmployeeDetails = async () => {
            setIsLoadingState(true); // Set loading state to true at the beginning
            try {
                const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/employee`, { signal , credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${sessionStorage.getItem('jwt')}` // Include token in Authorization header
                    }});
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
    const employeeTable = Array.isArray(employeeState) && employeeState.length > 0 ? (
        <div>
            <table className="table table-bordered table-hover shadow-md">
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
                    {filterEmployees().filter(employee => employee.employee_isarchived === isArchive).map((employee, index) => (
                        <tr key={employee._id} onClick={() => handleTableClick(employee._id)} className="cursor-pointer">
                            <th scope="row">{index + 1}</th>
                            <td>{`${employee.employee_first_name} ${employee.employee_last_name}`}</td>
                            <td>{employee.employee_email}</td>
                            <td>{employee.employee_mobile_phone}</td>
                            <td>{employee.employee_roles}</td>
                            <td>{employee.projects
                                .map((project, index) => (
                                    <div key={index}> {project.project_name}</div>
                                ))}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    ) : (
        <div>Employee data fetched successfully, but it might be empty...</div>
    );
    
    if (isLoadingState) { return (<EmployeePageSkeleton />); }

    if (errorState) {
        if(errorState.includes("Session expired") || errorState.includes("jwt expired")){
            return(<div><SessionExpired /></div>)
        }
        return (<div>Error: {errorState}</div>);
    }

    return (
        localUser && Object.keys(localUser).length > 0 ? (
        <div className="container mt-5">
            <div className="card">
                <div className="card-header bg-dark text-white">
                    <h1 className='mx-auto uppercase font-bold text-xl'>EMPLOYEES</h1>
                </div>
                <div className="card-body">
                    <div className="row mb-3">
                        <div className="col-md-6">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
                        </div>
                        <div className="col-md-6 d-flex justify-content-end">
                            <button className="btn btn-primary" onClick={handleAddClick}>
                                <div className='flex items-center'>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 mr-1">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                    </svg>
                                    <label>ADD EMPLOYEE</label>
                                </div>
                            </button>
                        </div>
                    </div>
                    <div className="col mb-6">
                        <button 
                            className={`${!isArchive ? 'border-x-2 border-t-2 p-2 rounded bg-gray-700 text-white' : 'border-x-2 border-t-2 p-2 rounded bg-transparent text-black hover:scale-90 transition ease-out duration-50 '}`} 
                            onClick={() => setIsArchive(false)}
                        >
                            Current
                        </button>
                        <button 
                            className={`${isArchive ? 'border-x-2 border-t-2 p-2 rounded bg-gray-700 text-white' : 'border-x-2 border-t-2 p-2 rounded bg-transparent text-black hover:scale-90 transition ease-out duration-50'}`} 
                            onClick={() => setIsArchive(true)}
                        >
                            Archived
                        </button>
                        {employeeTable}
                    </div>
                </div>
            </div>
        </div> ) : ( <UnauthenticatedSkeleton /> )
    );
};

export default Employee;