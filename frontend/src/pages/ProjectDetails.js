//import modules
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
//! import { setEmployeeDetails } from '../redux/employeeSlice';
//! import { toast } from 'react-toastify';
import SessionExpired from "../components/SessionExpired";
import EmployeeDetailsSkeleton from "./loaders/EmployeeDetailsSkeleton";
import Dropdown from "react-bootstrap/Dropdown"
import { setProjects } from '../redux/projectSlice';

const ProjectDetails = () => {
    //Component state declaration
    //! const employeeState = useSelector((state) => state.employeeReducer.employeeState)
    // !
    const projectState = useSelector((state) => state.projectReducer.projectState)
    const dispatch = useDispatch()
    const [isLoadingState, setIsLoadingState] = useState(true);
    const [errorState, setErrorState] = useState(null);
    const [currentTab, setCurrentTab] = useState('projectDetailsTab');

    //Component router
    const { id } = useParams();
    const navigate = useNavigate();

    //Component functions and variables
    const handleSupplierTableClick = (supplierID) => {
        navigate(`/EmpirePMS/supplier/${supplierID}`)
    }

    const handleAddSupplierClick = () => {
        return
    }

    const handleEmployeeTableClick = (employeeID) => {
        navigate(`/EmpirePMS/employee/${employeeID}`)
    }

    const handleAddEmployeeClick = () => {
        return
    }

    const handleEditClick = () => navigate(`/EmpirePMS/project/${id}/edit`, { state: id });
    
    //Render component
    useEffect(() => {
        const fetchProjectDetails = async () => {
            try {
                const res = await fetch(`/api/project/${id}`);
                if (!res.ok) {
                    throw new Error('Failed to fetch project details');
                }
                const data = await res.json();

                if (data.tokenError) {
                    throw new Error(data.tokenError);
                }

                dispatch(setProjects(data));
                setIsLoadingState(false);
            } catch (err) {
                setErrorState(err.message);
                setIsLoadingState(false);
            }
        };

        fetchProjectDetails();
    }, [id, dispatch]);

    //Display DOM  
    if (isLoadingState) { return (<EmployeeDetailsSkeleton />); }

    if (errorState) {
        if(errorState.includes("Session expired") || errorState.includes("jwt expired")){
            return(<div><SessionExpired /></div>)
        }
        return (<div>Error: {errorState}</div>);
    }

    const projectDetailsTab = (
        <div className="card-body border-1 mx-1 rounded-sm relative">
            <div className="absolute right-4">
                <Dropdown>
                    <Dropdown.Toggle variant="success" id="dropdown-basic">
                        ACTIONS
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        <Dropdown.Item onClick={handleEditClick}>
                            <div className='flex items-center'>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="size-4 mr-2">
                                    <path d="M13.488 2.513a1.75 1.75 0 0 0-2.475 0L6.75 6.774a2.75 2.75 0 0 0-.596.892l-.848 2.047a.75.75 0 0 0 .98.98l2.047-.848a2.75 2.75 0 0 0 .892-.596l4.261-4.262a1.75 1.75 0 0 0 0-2.474Z" />
                                    <path d="M4.75 3.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h6.5c.69 0 1.25-.56 1.25-1.25V9A.75.75 0 0 1 14 9v2.25A2.75 2.75 0 0 1 11.25 14h-6.5A2.75 2.75 0 0 1 2 11.25v-6.5A2.75 2.75 0 0 1 4.75 2H7a.75.75 0 0 1 0 1.5H4.75Z" />
                                </svg>
                                <label>EDIT PROJECT</label>
                            </div>
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => {}}>
                            <div className='flex items-center'>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4 mr-2">
                                    <path d="M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a3 3 0 0 1-3.144 0L1.5 8.67Z" />
                                    <path d="M22.5 6.908V6.75a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3v.158l9.714 5.978a1.5 1.5 0 0 0 1.572 0L22.5 6.908Z" />
                                </svg>
                                <label>PLACEHOLDER</label>
                            </div>
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => {}}>
                            <div className='flex items-center'>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4 mr-2">
                                    <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z" clipRule="evenodd" />
                                </svg>
                                <label>PLACEHOLDER</label>
                            </div>
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </div>
            <div className="row">
                <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Name:</label>
                    <p className="form-label">{projectState.project_name}</p>
                </div>
                <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Address:</label>
                    <p className="form-label">{projectState.project_address}</p>
                </div>
                <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Status:</label>
                    {projectState.project_isarchived ? 
                        (<label className="text-lg font-bold m-1 p-2 rounded-xl text-red-500">Archived</label>) : 
                        (<label className="text-lg font-bold m-1 p-2 rounded-xl text-green-600">Active</label>)
                    }
                </div>
            </div>
        </div>
    )

    const employeesTab = Array.isArray(projectState.employees) && projectState.employees.length > 0 ? (
        <div className="border rounded-sm">
            <table className="table table-bordered table-hover">
                <thead className="thead-dark">
                    <tr className="table-primary">
                        <th scope="col">ID</th>
                        <th scope="col">Name</th>
                        <th scope="col">Email</th>
                        <th scope="col">Contact</th>
                        <th scope="col">Role</th>
                    </tr>
                </thead>
                <tbody>
                    {projectState.employees.filter(employee => employee.employee_isarchived === false).map((employee, index) => (
                        <tr key={employee._id} onClick={() => handleEmployeeTableClick(employee._id)} className="cursor-pointer">
                            <th scope="row">{index + 1}</th>
                            <td>{`${employee.employee_first_name} ${employee.employee_last_name}`}</td>
                            <td>{employee.employee_email}</td>
                            <td>{employee.employee_mobile_phone}</td>
                            <td>{employee.employee_roles}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <button className="btn btn-primary m-1" onClick={handleAddEmployeeClick}>
                <div className='flex items-center'>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 mr-1">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                    <label>ASSIGN EMPLOYEES</label>
                </div>
            </button>
        </div>
    ) : (
        <div className='border'>
            <div className='m-1'>
                <label className='text-xl'>No employees found in this project.</label>
            </div>
            <button className="btn btn-primary m-1" onClick={handleAddEmployeeClick}>
                <div className='flex items-center'>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 mr-1">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                    <label>ASSIGN EMPLOYEES</label>
                </div>
            </button>
        </div>
    );

    const suppliersTab = Array.isArray(projectState.suppliers) && projectState.suppliers.length > 0 ? (
        <div className="container">
            <table className="table table-bordered table-hover">
                <thead className="thead-dark">
                    <tr className="table-primary">
                        <th scope="col">ID</th>
                        <th scope="col">Name</th>
                        <th scope="col">Contacts</th>
                        <th scope="col">Email</th>
                        <th scope="col">Phone</th>
                        <th scope="col">Address</th>
                        <th scope="col">Payment Term</th>
                        <th scope="col">Type</th>
                        <th scope="col">Material Type</th>
                    </tr>
                </thead>
                <tbody>
                    {projectState.suppliers.filter(supplier => supplier.supplier_isarchived === false).map((supplier, index) => (
                        <tr key={supplier._id} onClick={() => handleSupplierTableClick(supplier._id)} className="cursor-pointer">
                            <th scope="row">{index + 1}</th>
                            <td>{supplier.supplier_name}</td>
                            <td>
                                {supplier.supplier_contacts.map(contact => (
                                    <div key={contact._id}>
                                        {contact.name}
                                    </div>
                                ))}
                            </td>
                            <td>
                                {supplier.supplier_contacts.map(contact => (
                                    <div key={contact._id}>
                                        {contact.email}
                                    </div>
                                ))}
                            </td>
                            <td>
                                {supplier.supplier_contacts.map(contact => (
                                    <div key={contact._id}>
                                        {contact.phone}
                                    </div>
                                ))}
                            </td>
                            <td>{supplier.supplier_address}</td>
                            <td>{supplier.supplier_payment_term}</td>
                            <td>{supplier.supplier_type}</td>
                            <td>{supplier.supplier_material_types}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    ) : (
        <div className='border'>
            <div className='m-1'>
                <label className='text-xl'>No suppliers found in this project.</label>
            </div>
            <button className="btn btn-primary m-1" onClick={handleAddSupplierClick}>
                <div className='flex items-center'>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 mr-1">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                    <label>ASSIGN SUPPLIERS</label>
                </div>
            </button>
        </div>
    );

    console.log("inside Project State now: ", projectState)

    return (
        <div className="container mt-5">
        <div className="card">
            <div className="card-header bg-dark text-white flex justify-between items-center">
                    <button onClick={() => {navigate("/EmpirePMS/project")}}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-7 w-12 border-transparent bg-gray-700 rounded-md p-1 hover:bg-gray-500 hover:scale-95 ease-out duration-300">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m18.75 4.5-7.5 7.5 7.5 7.5m-6-15L5.25 12l7.5 7.5"/>
                        </svg>
                    </button>
                    <h1 className='mx-auto uppercase font-bold text-xl'>PROJECT: {projectState.project_name}</h1>
                </div>
            <div className="card-body">
                <div>
                    <button className={`${currentTab === 'projectDetailsTab' ? 'border-x-2 border-t-2 p-2 rounded bg-gray-700 text-white' : 'border-x-2 border-t-2 p-2 rounded bg-transparent text-black hover:scale-90 transition ease-out duration-50 '}`}  onClick={() => setCurrentTab('projectDetailsTab')}>Details</button>
                    <button className={`${currentTab === 'employeesTab' ? 'border-x-2 border-t-2 p-2 rounded bg-gray-700 text-white' : 'border-x-2 border-t-2 p-2 rounded bg-transparent text-black hover:scale-90 transition ease-out duration-50 '}`}  onClick={() => setCurrentTab('employeesTab')}>Employees</button>
                    <button className={`${currentTab === 'suppliersTab' ? 'border-x-2 border-t-2 p-2 rounded bg-gray-700 text-white' : 'border-x-2 border-t-2 p-2 rounded bg-transparent text-black hover:scale-90 transition ease-out duration-50 '}`}  onClick={() => setCurrentTab('suppliersTab')}>Suppliers</button>
                </div>
                    {/* SWITCH BETWEEN COMPONENTS HERE */}
                    {currentTab === 'projectDetailsTab' && projectDetailsTab}
                    {currentTab === 'employeesTab' && employeesTab}
                    {currentTab === 'suppliersTab' && suppliersTab}
            </div>
        </div>
    </div>
    );
};

export default ProjectDetails;





// import { useParams, useNavigate } from 'react-router-dom';
// import { useEffect, useState } from 'react';

// const ProjectDetails = () => {
//     const [projectDetails, setProjectDetails] = useState(null); // Initialize as null
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [isArchive, setIsArchive] = useState(false);

//     const { id } = useParams(); // Extract projectId from URL
//     const navigate = useNavigate(); // Component router

//     const handleTableEmployeeClick = (varID) => {
//         navigate(`/EmpirePMS/employee/${varID}`, { state: varID });
//     }

//     const handleTableClick2 = (varID) => {
//         navigate(`/EmpirePMS/supplier/${varID}`, { state: varID });
//     }

//     useEffect(() => {
//         const fetchProjectDetails = async () => {
//             try {
//                 const res = await fetch(`/api/project/${id}`);
//                 if (!res.ok) {
//                     throw new Error('Network response was not ok');
//                 }
//                 const projectData = await res.json();
//                 setProjectDetails(projectData[0]);
//             } catch (error) {
//                 setError(error);
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchProjectDetails();
//     }, [id]);  // Add id as dependency

//     if (loading) return <p>Loading...</p>;
//     if (error) return <p>Error: {error.message}</p>;
//     if (!projectDetails) return <p>No project details available</p>;

//     return (
//         <div className="">
//             <div>
//                 <label><b>Project Id: </b></label>
//                 <div>{id}</div>
//             </div>
//             <div>
//                 <label><b>Project Name:</b></label>
//                 <div>{projectDetails.project_name}</div>
//             </div>
//             <div>
//                 <label><b>Project Address: </b></label>
//                 <div>{projectDetails.project_address}</div>
//             </div>
//             <div>
//                 <label><b>Project Status: </b></label>
//                 <div>{projectDetails.project_isarchived ? 'Archived' : 'Active'}</div>
//             </div>
//             <div>
//                 <label><b>Project Contact Person: </b></label>
//                 <div>
//                     <ul>
//                         {projectDetails.employees && projectDetails.employees.length > 0 ? (
//                             projectDetails.employees
//                                 .filter(employee => employee.employee_roles === 'Foreman')
//                                 .map((employee) => (
//                                     <li key={employee._id}>{employee.employee_first_name} {employee.employee_last_name}: {employee.employee_mobile_phone}</li>
//                                 ))
//                         ) : (
//                             <li>No related Contact Person</li>
//                         )}
//                     </ul>
//                 </div>
//             </div>
//             <div>
//                 <label><b>Project Related Employees: </b></label>
//                 <div>
//                     <ul>
//                         {projectDetails.employees && projectDetails.employees.length > 0 ? (
//                             projectDetails.employees
//                                 .filter(employee => employee.employee_roles !== 'Foreman')
//                                 .map((employee) => (
//                                     <li key={employee._id} onClick={() => handleTableEmployeeClick( employee._id)}>
//                                         {employee.employee_first_name} {employee.employee_last_name}: {employee.employee_mobile_phone}
//                                     </li>
//                                 ))
//                         ) : (
//                             <li>No related Contact Person</li>
//                         )}
//                     </ul>
//                 </div>
//             </div>
//             <div>
//                 <label><b>Project Related Suppliers: </b></label>
//                 <ul>
//                     {projectDetails.suppliers && projectDetails.suppliers.length > 0 ? (
//                         projectDetails.suppliers
//                             .filter(supplier => supplier.supplier_isarchived === isArchive)
//                             .map((supplier) => (
//                                 <li key={supplier._id} onClick={() => handleTableClick2(supplier._id)}>
//                                     {supplier.supplier_name} Status: {supplier.supplier_isarchived ? 'Archived' : 'Active'}
//                                 </li>
//                             ))
//                     ) : (
//                         <li>No related suppliers</li>
//                     )}
//                 </ul>
//             </div>
//         </div>
//     );
// };

// export default ProjectDetails;
