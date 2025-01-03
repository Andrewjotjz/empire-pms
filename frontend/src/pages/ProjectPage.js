import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import { setProjectState, clearProjectState } from '../redux/projectSlice';
import SessionExpired from "../components/SessionExpired";
import ProjectPageSkeleton from "./loaders/ProjectPageSkeleton";
import UnauthenticatedSkeleton from './loaders/UnauthenticateSkeleton';

const Project = () => {
    // Component state declaration
    const projectState = useSelector((state) => state.projectReducer.projectState) || []; // Default to empty array if null
    const dispatch = useDispatch();
    const [isLoadingState, setIsLoadingState] = useState(true);
    const [errorState, setErrorState] = useState(null);
    const [isArchive, setIsArchive] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Component router
    const navigate = useNavigate();

    // Component functions and variables
    const localUser = JSON.parse(localStorage.getItem('localUser'))

    const handleAddClick = () => {
        dispatch(clearProjectState());
        navigate('/EmpirePMS/project/create');
    }

    const handleTableClick = (id) => navigate(`/EmpirePMS/project/${id}`, { state: id });

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/project`, { credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${sessionStorage.getItem('jwt')}` // Include token in Authorization header
                    }});
                if (!res.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await res.json();

                if (data.tokenError) {
                    throw new Error(data.tokenError);
                }

                setIsLoadingState(false);
                dispatch(setProjectState(data));
                setErrorState(null);

            } catch (error) {
                setErrorState(error.message);
            } finally {
                setIsLoadingState(false);
            }
        };
        
        fetchProjects();
    }, [dispatch]);

    // Filter function
    const filteredProjects = (Array.isArray(projectState) ? projectState : [])
        .filter(project => project.project_isarchived === isArchive)
        .filter(project => {
            const query = searchQuery.toLowerCase();
            return (
                project.project_name.toLowerCase().includes(query) ||
                project.project_address.toLowerCase().includes(query) ||
                project.employees.some(employee => 
                    employee.employee_first_name.toLowerCase().includes(query) ||
                    employee.employee_last_name.toLowerCase().includes(query) 
                )
            );
        });

    // Handle input change
    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };

    if (isLoadingState) {
        return (<ProjectPageSkeleton />);
    }

    if (errorState) {
        if (errorState.includes("Session expired") || errorState.includes("jwt expired") || errorState.includes("jwt malformed")) {
            return (<div><SessionExpired /></div>);
        }
        return (<div>Error: {errorState}</div>);
    }

    // Display DOM
    const projectTable = filteredProjects.length > 0 ? (
        <table className="table table-bordered table-hover">
            <thead className="thead-dark">
                <tr className="table-primary">
                    <th scope="col" className="hidden sm:table-cell">Id</th>
                    <th scope="col">Name</th>
                    <th scope="col" className="hidden sm:table-cell">Address</th>
                    <th scope="col" colSpan="2" className="hidden sm:table-cell">Contact Person</th>
                </tr>
            </thead>
            <tbody>
                {filteredProjects.map((project, index) => (
                    <tr className="cursor-pointer" key={project._id} onClick={() => handleTableClick(project._id)} >
                        <th scope="row" className="hidden sm:table-cell">{index + 1}</th>
                        <td>{project.project_name}</td>
                        <td className="hidden sm:table-cell">{project.project_address}</td>
                        <td className="hidden sm:table-cell">
                            {project.employees
                                .filter(employee => employee.employee_roles === 'Foreman')
                                .map((employee, index) => (
                                    <div key={index}> {employee.employee_first_name} {employee.employee_last_name}</div>
                                ))}
                        </td>
                        <td className="hidden sm:table-cell">
                            {project.employees
                                .filter(employee => employee.employee_roles === 'Foreman')
                                .map((employee, index) => (
                                    <div key={index}>{employee.employee_mobile_phone}</div>
                                ))}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    ) : (
        <div>No projects found matching the criteria.</div>
    );

    return (
        localUser && Object.keys(localUser).length > 0 ? (
        <div className="container mt-5">
            <div className="card">
                <div className="card-header bg-dark text-white">
                    <h1 className='mx-auto uppercase font-bold text-sm md:text-xl'>PROJECTS</h1>
                </div>
                <div className="card-body">
                    {/* Search Input and Add Project Button Row */}
                    <div className="flex flex-col md:flex-row mb-3 gap-2">
                        {/* Search Input */}
                        <div className="flex-1">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search by project name or address..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                            />
                        </div>
                        {/* Add Project Button */}
                        <div className="flex justify-end">
                            <button className="btn btn-primary flex items-center" onClick={handleAddClick}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6 mr-1">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                </svg>
                                <span>ADD PROJECT</span>
                            </button>
                        </div>
                    </div>

                    {/* Toggle Tabs for Current and Archived Projects */}
                    <div>
                        <button
                            className={`${!isArchive ? 'border-2 p-2 rounded bg-gray-700 text-white' : 'border-2 p-2 rounded bg-transparent text-black hover:scale-90 transition-transform duration-150'}`}
                            onClick={() => setIsArchive(false)}>
                            Current
                        </button>
                        <button
                            className={`${isArchive ? 'border-2 p-2 rounded bg-gray-700 text-white' : 'border-2 p-2 rounded bg-transparent text-black hover:scale-90 transition-transform duration-150'}`}
                            onClick={() => setIsArchive(true)}>
                            Archived
                        </button>
                    </div>

                    {/* Project Table */}
                    <div className="border rounded-md overflow-auto">
                        {projectTable}
                    </div>
                </div>
            </div>
        </div> ) : ( <UnauthenticatedSkeleton /> )
    );
};

export default Project;
