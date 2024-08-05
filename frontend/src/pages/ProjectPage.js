// Import modules
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux'
import { setProjects, clearProjects } from '../redux/projectSlice'
import SessionExpired from "../components/SessionExpired";
import EmployeePageSkeleton from "./loaders/EmployeePageSkeleton";

const Project = () => {
    //Component state declaration
    const projectState = useSelector((state) => state.projectReducer.projectState)
    const dispatch = useDispatch()
    const [isLoadingState, setIsLoadingState] = useState(true);
    const [errorState, setErrorState] = useState(null);
    const [isArchive, setIsArchive] = useState(false);
    

    //Component router
    const navigate = useNavigate();

    //Component functions and variables
    // !
    const handleAddClick = () => {
        dispatch(clearProjects());
        navigate('/EmpirePMS/project/create');
    }
    // !
    const handleTableClick = (id) => navigate(`/EmpirePMS/project/${id}`, { state: id });

    //Render component
    useEffect(() => {
        const abortController = new AbortController();
        const signal = abortController.signal;

        const fetchProjectDetails = async () => {
            setIsLoadingState(true); // Set loading state to true at the beginning
            try {
                const res = await fetch('/api/project', { signal });
                if (!res.ok) {
                    throw new Error('Failed to fetch');
                }
                const data = await res.json();

                if (data.tokenError) {
                    throw new Error(data.tokenError);
                }
                
                setIsLoadingState(false);
                dispatch(setProjects(data));
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

        fetchProjectDetails();

        return () => {
            abortController.abort(); // Cleanup
        };
    }, [dispatch]);

    //Display DOM
    const projectTable = Array.isArray(projectState) && projectState.length > 0 ? (
        <div className="border rounded-sm">
            <table className="table table-bordered table-hover">
                <thead className="thead-dark">
                    <tr className="table-primary">
                        <th scope="col">ID</th>
                        <th scope="col">Name</th>
                        <th scope="col">Address</th>
                        <th scope="col">Suppliers</th>
                        <th scope="col">Contacts</th>
                    </tr>
                </thead>
                <tbody>
                    {projectState.filter(project => project.project_isarchived === isArchive).map((project, index) => (
                        <tr key={project._id} onClick={() => handleTableClick(project._id)} className="cursor-pointer">
                            <th scope="row">{index + 1}</th>
                            <td>{`${project.project_name}`}</td>
                            <td>{project.project_address}</td>
                            <td>
                                {project.suppliers.map((supplier,index) => (
                                    <div key={index}>
                                        {supplier.supplier_name}
                                    </div>
                                ))}
                            </td>
                            <td>Click to see more...</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    ) : (
        <div>Project data fetched successfully, but it might be empty...</div>
    );
    
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
                    <h1 className='mx-auto uppercase font-bold text-xl'>PROJECTS</h1>
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
                        {projectTable}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Project;







// //import modules
// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";

// import { useSelector, useDispatch } from 'react-redux'


// const Project = () => {

//     const [projects, setProjects] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);

//     //Component router
//     const navigate = useNavigate();

//     const handleTableClick = (id) => navigate(`/EmpirePMS/project/${id}`, { state: id });


//     useEffect(() => {
//         const fetchProjects = async () => {
//           try {
//             const res = await fetch('/api/project');
//             if (!res.ok) {
//               throw new Error('Network response was not ok');
//             }
//             const projectData = await res.json();

//             setProjects(projectData);
//           } catch (error) {
//             setError(error);
//           } finally {
//             setLoading(false);
//           }
//         };
    
//         fetchProjects();
//       }, []);

//     if (loading) return <p>Loading...</p>;
//     if (error) return <p>Error: {error.message}</p>;

    // const projectState = useSelector((state) => state.projectReducer.projectState)
    // const dispatch = useDispatch()
    // const [isLoadingState, setIsLoadingState] = useState(true);
    // const [errorState, setErrorState] = useState(null);
    // const [isArchive, setIsArchive] = useState(false);

    // //Render component
    // useEffect(() => {
    //     const abortController = new AbortController();
    //     const signal = abortController.signal;

    //     const fetchProjectDetails = async () => {
    //         setIsLoadingState(true); // Set loading state to true at the beginning
    //         try {
    //             const res = await fetch('/api/project', { signal });
    //             if (!res.ok) {
    //                 throw new Error('Failed to fetch');
    //             }
    //             const data = await res.json();

    //             if (data.tokenError) {
    //                 throw new Error(data.tokenError);
    //             }
                
    //             setIsLoadingState(false);
    //             // dispatch(setEmployeeDetails(data));
    //             setErrorState(null);
    //         } catch (error) {
    //             if (error.name === 'AbortError') {
    //                 // do nothing
    //             } else {
    //                 setIsLoaadingState(false);
    //                 setErrorState(error.message);
    //             }
    //         }
    //     };

    //     fetchProjectDetails();

    //     return () => {
    //         abortController.abort(); // Cleanup
    //     };
    // }, [dispatch]);


//     return ( 
//         <div className="container mt-5">
//             <div className="card">
//                 <div className="card-header bg-dark text-white">
//                     <h1 className='mx-auto uppercase font-bold text-xl'>PROJECT</h1>
//                 </div>
//                 <table className="table table-bordered table-hover">
//                     <thead className="thead-dark">
//                         <tr className="table-primary">
//                             <th scope="col">Id</th>
//                             <th scope="col">Name</th>
//                             <th scope="col">Address</th>
//                             <th scope="col">Contact</th>
//                             <th scope="col">Supplier</th>
//                             <th scope="col">Project Status</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {projects.map((project) => (
//                             <tr key={project._id} onClick={() => handleTableClick(project._id)} >
//                                 <td>{project._id}</td>
//                                 <td>{project.project_name}</td>
//                                 <td>{project.project_address}</td>
//                                 <td>
//                                     {project.employees
//                                         .filter(employee => employee.employee_roles === 'Foreman')
//                                         .map((employee, index) => (
//                                         <div key={index}> <b>Foreman: </b>{employee.employee_first_name} {employee.employee_last_name}, <b>Mobile: </b>{employee.employee_mobile_phone}</div>
//                                         ))}
//                                 </td>
//                                 <td>
//                                     {project.suppliers.map((supplier, index) => (
//                                     <div key={index}>{supplier.supplier_name}</div>
//                                     ))}
//                                 </td>
//                                 <td>{project.project_isarchived ? 'Archived' : 'Active'}</td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             </div>
//         </div>
//     );
// };
 
// export default Project;