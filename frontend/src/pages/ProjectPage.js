//import modules
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useSelector, useDispatch } from 'react-redux'


const Project = () => {

    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    //Component router
    const navigate = useNavigate();

    const handleTableClick = (id) => navigate(`/EmpirePMS/project/${id}`, { state: id });


    useEffect(() => {
        const fetchProjects = async () => {
          try {
            const res = await fetch('/api/project');
            if (!res.ok) {
              throw new Error('Network response was not ok');
            }
            const projectData = await res.json();

            setProjects(projectData);
          } catch (error) {
            setError(error);
          } finally {
            setLoading(false);
          }
        };
    
        fetchProjects();
      }, []);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;

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
    //                 setIsLoadingState(false);
    //                 setErrorState(error.message);
    //             }
    //         }
    //     };

    //     fetchProjectDetails();

    //     return () => {
    //         abortController.abort(); // Cleanup
    //     };
    // }, [dispatch]);


    return ( 
        <div className="container mt-5">
            <div className="card">
                <div className="card-header bg-dark text-white">
                    <h1 className='mx-auto uppercase font-bold text-xl'>PROJECT</h1>
                </div>
                <table className="table table-bordered table-hover">
                    <thead className="thead-dark">
                        <tr className="table-primary">
                            <th scope="col">Id</th>
                            <th scope="col">Name</th>
                            <th scope="col">Address</th>
                            <th scope="col">Contact</th>
                            <th scope="col">Supplier</th>
                            <th scope="col">Project Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {projects.map((project) => (
                            <tr key={project._id} onClick={() => handleTableClick(project._id)} >
                                <td>{project._id}</td>
                                <td>{project.project_name}</td>
                                <td>{project.project_address}</td>
                                <td>
                                    {project.employees
                                        .filter(employee => employee.employee_roles === 'Foreman')
                                        .map((employee, index) => (
                                        <div key={index}> <b>Foreman: </b>{employee.employee_first_name} {employee.employee_last_name}, <b>Mobile: </b>{employee.employee_mobile_phone}</div>
                                        ))}
                                </td>
                                <td>
                                    {project.suppliers.map((supplier, index) => (
                                    <div key={index}>{supplier.supplier_name}</div>
                                    ))}
                                </td>
                                <td>{project.project_isarchived ? 'Archived' : 'Active'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
 
export default Project;