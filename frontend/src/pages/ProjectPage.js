import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import { setProjectState, clearProjectState } from '../redux/projectSlice';
import SessionExpired from "../components/SessionExpired";
import ProjectPageSkeleton from "./loaders/ProjectPageSkeleton";

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
    const handleAddClick = () => {
        dispatch(clearProjectState());
        navigate('/EmpirePMS/project/create');
    }

    const handleTableClick = (id) => navigate(`/EmpirePMS/project/${id}`, { state: id });

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await fetch('https://empire-pms.onrender.com/api/project');
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
        if (errorState.includes("Session expired") || errorState.includes("jwt expired")) {
            return (<div><SessionExpired /></div>);
        }
        return (<div>Error: {errorState}</div>);
    }

    // Display DOM
    const projectTable = filteredProjects.length > 0 ? (
        <table className="table table-bordered table-hover">
            <thead className="thead-dark">
                <tr className="table-primary">
                    <th scope="col">Id</th>
                    <th scope="col">Name</th>
                    <th scope="col">Address</th>
                    <th scope="col" colSpan="2">Contact Person</th>
                </tr>
            </thead>
            <tbody>
                {filteredProjects.map((project, index) => (
                    <tr className="cursor-pointer" key={project._id} onClick={() => handleTableClick(project._id)} >
                        <th scope="row">{index + 1}</th>
                        <td>{project.project_name}</td>
                        <td>{project.project_address}</td>
                        <td>
                            {project.employees
                                .filter(employee => employee.employee_roles === 'Foreman')
                                .map((employee, index) => (
                                    <div key={index}> {employee.employee_first_name} {employee.employee_last_name}</div>
                                ))}
                        </td>
                        <td>
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
        <div className="container mt-5">
            <div className="card">
                <div className="card-header bg-dark text-white">
                    <h1 className='mx-auto uppercase font-bold text-xl'>PROJECTS</h1>
                </div>
                <div className="card-body">
                    <div className="row mb-3">
                        <div className="col-md-6">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search by project name, or address ..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                            />
                        </div>
                        <div className="col-md-6 d-flex justify-content-end">
                            <button className="btn btn-primary" onClick={handleAddClick}>
                                <div className='flex items-center'>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 mr-1">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                    </svg>
                                    <label>ADD PROJECT</label>
                                </div>
                            </button>
                        </div>
                    </div>
                    <div className="col mb-6">
                        <button 
                            className={`${!isArchive ? 'border-x-2 border-t-2 p-2 rounded bg-gray-700 text-white' : 'border-x-2 border-t-2 p-2 rounded bg-transparent text-black hover:scale-90 transition ease-out duration-50 '}`} 
                            onClick={() => setIsArchive(false)}>Current</button>
                        <button 
                            className={`${isArchive ? 'border-x-2 border-t-2 p-2 rounded bg-gray-700 text-white' : 'border-x-2 border-t-2 p-2 rounded bg-transparent text-black hover:scale-90 transition ease-out duration-50'}`} 
                            onClick={() => setIsArchive(true)}>Archived</button>
                        <div className="border rounded-sm">{projectTable}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Project;
