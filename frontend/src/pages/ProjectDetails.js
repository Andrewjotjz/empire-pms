//import modules
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setProjectState} from '../redux/projectSlice';
import { useUpdateProject } from '../hooks/useUpdateProject';
import { Modal, Button } from "react-bootstrap";
import Dropdown from "react-bootstrap/Dropdown";
import SessionExpired from "../components/SessionExpired";
import ProjectDetailsSkeleton from './loaders/ProjectDetailsSkeleton';


const Project_Details = () => {

    const moment = require('moment-timezone'); //Use 'Moment-timezone' to Convert UTC to Melbourne time

    // Component router
    const { id } = useParams(); // Extract projectId from URL
    const navigate = useNavigate(); 
    const dispatch = useDispatch();

    //Component state declaration
    const projectState = useSelector((state) => state.projectReducer.projectState);

    const [allEmployees, setAllEmployees] = useState([]);
    const [allSuppliers, setAllSuppliers] = useState([]);
    const numberOfSupplierColumns = Math.ceil(allSuppliers.length / 10)

    const [selectedEmployees, setSelectedEmployees] = useState(new Set());  // set select employees to add
    const [employeesToRemove, setEmployeesToRemove] = useState(new Set());  // set select employees to remove
    const [selectedSuppliers, setSelectedSuppliers] = useState(new Set());  // set all select suppliers to add or remove

    const [isSelectSupplierListVisible, setSelectSupplierListVisible] = useState(false);
    const [isAddEmployeeListVisible, setAddEmployeeListVisible] = useState(false);
    const [isRemoveEmployeeListVisible, setRemoveEmployeeListVisible] = useState(false);

    const [isLoadingState, setIsLoadingState] = useState(true);
    const [errorState, setErrorState] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [currentTab, setCurrentTab] = useState('projectDetails');

    //Component hooks
    const { update } = useUpdateProject();


    const handleTableClick = (page,varID) => {
        navigate(`/EmpirePMS/${page}/${varID}`, { state: varID });
    }

    //Component functions and variables
    const handleEditClick = () => navigate(`/EmpirePMS/project/${id}/edit`, { state: id });

    // fetch project details by projectID
    const fetchProjectDetails = useCallback(async () => {
        try {
            const res = await fetch(`/api/project/${id}`);

            if (!res.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await res.json();

            dispatch(setProjectState(data[0]));
            setIsLoadingState(false);

        } catch (error) {
            setErrorState(error.message);
        } finally {
            setIsLoadingState(false);
        }
    }, [id, dispatch]);

    useEffect(() => {
        fetchProjectDetails();
    }, [id, dispatch]);  // Add id as dependency

    // Fetch all employees when the component mounts
    useEffect(() => {
        const fetchAllEmployees = async () => {
            try {
                const res = await fetch(`/api/employee`);
                if (!res.ok) {
                    throw new Error('Network response was not ok employees data');
                }
                const employeesData = await res.json();
                setAllEmployees(employeesData);
                setIsLoadingState(false);

            } catch (error) {
                setErrorState(error.message);

            } finally {
                setIsLoadingState(false);
            }
        };
        fetchAllEmployees();
    }, [id, dispatch]);

    // Fetch all Actived Suppliers when the component mounts
    useEffect(() => {
        const fetchAllSuppliers = async () => {
            try {
                const res = await fetch(`/api/supplier`);
                if (!res.ok) {
                    throw new Error('Network response was not ok employees data');
                }
                let suppliersData = await res.json();

                // Filter out archived suppliers
                suppliersData = suppliersData.filter(supplier => !supplier.supplier_isarchived);

                setAllSuppliers(suppliersData);
                setIsLoadingState(false);

            } catch (error) {
                setErrorState(error.message);

            } finally {
                setIsLoadingState(false);
            }
        };
        fetchAllSuppliers();
    }, [id, dispatch]);

    const handleArchive = async () => {

        let updatedState;

        if (projectState.project_isarchived === true) {
            updatedState = {
                ...projectState,
                project_isarchived: false,
            };
        } else {
            updatedState = {
                ...projectState,
                project_isarchived: true,
            };
        }
        dispatch(setProjectState(updatedState));
    
        update(updatedState, `Project has been ${updatedState.project_isarchived ? `archived` : `unarchived`}`);
    
        setShowModal(false);
        // Fetch the updated project details to refresh the UI
        await fetchProjectDetails();
    };

    // Display DOM
    const archiveModal = (
        <Modal show={showModal} onHide={() => setShowModal(false)}>
            <Modal.Header closeButton>
                <Modal.Title>{ projectState && projectState.project_isarchived ?  `Confirm Unarchive` : `Confirm Archive`}</Modal.Title>
            </Modal.Header>
            <Modal.Body>{ projectState && projectState.project_isarchived ? `Are you sure you want to unarchive this project?` : `Are you sure you want to archive this project?`}</Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowModal(false)}>
                    Cancel
                </Button>
                <Button className="bg-red-600 hover:bg-red-600" variant="primary" onClick={handleArchive}>
                    { projectState && projectState.project_isarchived ? `Unarchive` : `Archive`}
                </Button>
            </Modal.Footer>
        </Modal>
    );

    const handleRelatedEmployees = () => {
        if (projectState && projectState.employees) {
            const relatedEmployeeIds = new Set(projectState.employees.map(emp => emp._id));
            setSelectedEmployees(relatedEmployeeIds);
        }
    };

    const handleRelatedSuppliers = () => {
        if (projectState && projectState.suppliers) {
            const relatedSuppliersIds = new Set(projectState.suppliers.map(emp => emp._id));
            setSelectedSuppliers(relatedSuppliersIds);
        }
    };

    const handleAddEmployeeClick = () => {
        handleRelatedEmployees();
        setAddEmployeeListVisible(true);
    };

    const handleRemoveEmployeeClick = () => {
        setRemoveEmployeeListVisible(true);
    };

    const handleSelectSupplierClick = () => {
        handleRelatedSuppliers();
        setSelectSupplierListVisible(true);
    };


    const handleSupplierCheckbox = (supplierId) => {

        const updatedSelectedSuppliers = new Set(selectedSuppliers);
            if (updatedSelectedSuppliers.has(supplierId)) {
                updatedSelectedSuppliers.delete(supplierId);
            } else {
                updatedSelectedSuppliers.add(supplierId);
            }
            setSelectedSuppliers(updatedSelectedSuppliers);

    };

    const handleEmployeeCheckbox = (employeeId, isAdding) => {

        if (isAdding) {
            const updatedSelectedEmployees = new Set(selectedEmployees);
            if (updatedSelectedEmployees.has(employeeId)) {
                updatedSelectedEmployees.delete(employeeId);
            } else {
                updatedSelectedEmployees.add(employeeId);
            }
            setSelectedEmployees(updatedSelectedEmployees);

        } else {
            const updatedEmployeesToRemove = new Set(employeesToRemove);
            if (updatedEmployeesToRemove.has(employeeId)) {
                updatedEmployeesToRemove.delete(employeeId);
            } else {
                updatedEmployeesToRemove.add(employeeId);
            }
            setEmployeesToRemove(updatedEmployeesToRemove);
        }
    };

    const handleAddEmployeesConfirm = async () => {

        const selectedEmployeeArray = Array.from(selectedEmployees);

        // Get the current employees' IDs from project details
        const currentEmployeeIds = new Set(projectState.employees.map(emp => emp._id));

        // Filter the selected employees to only include new ones
        const newEmployees = selectedEmployeeArray.filter(empId => !currentEmployeeIds.has(empId));

        if (newEmployees.length > 0) {
            try {
                    // Update each new employee to add the current project to their projects array
                    await Promise.all(newEmployees.map(async empId => {
                        // Fetch the current employee data to get their projects array
                        const employeeRes = await fetch(`/api/employee/${empId}`);
                        if (!employeeRes.ok) {
                            throw new Error(`Failed to fetch employee ${empId}`);
                        }
                        const employeeData = await employeeRes.json();

                        // Add the current project ID to the employee's projects array if it's not already present
                        const updatedProjects = new Set(employeeData.projects);
                        updatedProjects.add(id);

                        // Update the employee's projects array
                        const updateRes = await fetch(`/api/employee/${empId}`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ projects: Array.from(updatedProjects) })
                        });

                        if (!updateRes.ok) {
                            throw new Error(`Failed to update employee ${empId}`);
                        }
                }));
        
                // Close the addEmployees Propup
                setAddEmployeeListVisible(false);
                
                // Fetch the updated project details to refresh the UI
                await fetchProjectDetails();
    
            } catch (error) {
                console.error('Error updating employees:', error);
            }
        }

    };

    const handleRemoveEmployeesConfirm = async () => {

        const employeesToRemoveArray = Array.from(employeesToRemove);
        
        try {
            // Update each employee to remove the current project from their projects array
            await Promise.all(employeesToRemoveArray.map(async empId => {
                // Fetch the current employee data to get their projects array
                const employeeRes = await fetch(`/api/employee/${empId}`);
                
                if (!employeeRes.ok) {
                    throw new Error(`Failed to fetch employee ${empId}`);
                }
                const employeeData = await employeeRes.json();
    
                // Filter out the current project ID from the employee's projects array
                const updatedProjects = employeeData.projects.filter(projectId => projectId !== id);
    
                // Update the employee's projects array
                const updateRes = await fetch(`/api/employee/${empId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ projects: updatedProjects })
                });
    
                if (!updateRes.ok) {
                    throw new Error(`Failed to update employee ${empId}`);
                }
            }));

            // Close the addEmployees Propup
            setRemoveEmployeeListVisible(false);
    
           // Fetch the updated project details to refresh the UI
           await fetchProjectDetails();

            // Reset employeesToRemove array to empty
            setEmployeesToRemove(); 
            
    
            // Display success message or handle UI updates here
        } catch (error) {
            console.error('Error removing employees:', error);
        }
    
    };
    
    const handleSelectSuppliersConfirm = async () => {

        const selectedSuppliersArray = Array.from(selectedSuppliers);

        const updateRes = await fetch(`/api/project/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ suppliers: Array.from(selectedSuppliersArray) })
        });

        if (!updateRes.ok) {
            throw new Error(`Failed to update project ${id}`);
        }

         // Close the selectSuppliers Propup
         setSelectSupplierListVisible(false);
    
         // Fetch the updated project details to refresh the UI
         await fetchProjectDetails();

    };

    const selectEmployeesBtn = (
        <div className='d-flex m-1 justify-content-end'>
            <Dropdown>
                    <Dropdown.Toggle variant="success" id="dropdown-basic">
                        ACTIONS
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        <Dropdown.Item onClick={() => handleAddEmployeeClick()}>
                            <div className='flex items-center'>
                                <svg  className="size-6 mr-1" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg" aria-labelledby="checkboxIconTitle" stroke="#000000" 
                                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" color="#000000">
                                     <rect x="21" y="3" width="18" height="18" rx="1" transform="rotate(90 21 3)"/> 
                                     <path d="M6.66666 12.6667L9.99999 16L17.3333 8.66669"/> 
                                     </svg>
                                <label>Add Employees</label>
                            </div>
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => handleRemoveEmployeeClick()}>
                            <div className='flex items-center'>
                                <svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 28 28" className="size-6 mr-1"
                                    strokeWidth={1.5} stroke="#000000" strokeLinecap="round" strokeLinejoin="round" fill="none" color="#000000">
                                    <rect x="21" y="3" width="18" height="18" rx="1" transform="rotate(90 21 3)"/> 
                                    <path d="M16 12H8"/> 
                                </svg>
                                <label>Remove Employees</label>
                            </div>
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
        </div>
    );

    const selectSuppliersBtn = (
        <div className='d-flex m-1 justify-content-end'>
            <button className="btn btn-primary" onClick={handleSelectSupplierClick}>
                <div className='flex items-center'>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 mr-1">
                        <path id="Vector" 
                        d="M8 12L11 15L16 9M4 16.8002V7.2002C4 6.08009 4 5.51962 4.21799 5.0918C4.40973 4.71547 4.71547 4.40973 5.0918 4.21799C5.51962 4 6.08009 4 7.2002 4H16.8002C17.9203 4 18.4796 4 18.9074 4.21799C19.2837 4.40973 19.5905 4.71547 19.7822 5.0918C20 5.5192 20 6.07899 20 7.19691V16.8036C20 17.9215 20 18.4805 19.7822 18.9079C19.5905 19.2842 19.2837 19.5905 18.9074 19.7822C18.48 20 17.921 20 16.8031 20H7.19691C6.07899 20 5.5192 20 5.0918 19.7822C4.71547 19.5905 4.40973 19.2842 4.21799 18.9079C4 18.4801 4 17.9203 4 16.8002Z"
                         stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <label>SELECT SUPPLIERS</label>
                </div>
            </button>
        </div>
    );

    const projectDetailsTab = projectState ? (
        <div className="card-body border-1 relative">
            <div className='d-flex m-1 justify-content-end'>
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
                                <label>EDIT DETAILS</label>
                            </div>
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => setShowModal(true)}>
                            <div className='flex items-center'>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="size-4 mr-2">
                                    <path d="M2 3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3Z" />
                                    <path fillRule="evenodd" d="M13 6H3v6a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V6ZM8.75 7.75a.75.75 0 0 0-1.5 0v2.69L6.03 9.22a.75.75 0 0 0-1.06 1.06l2.5 2.5a.75.75 0 0 0 1.06 0l2.5-2.5a.75.75 0 1 0-1.06-1.06l-1.22 1.22V7.75Z" clipRule="evenodd" />
                                </svg>
                                <label>{ projectState.project_isarchived ? `UNARCHIVE` : `ARCHIVE`}</label>
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
                    <label className="form-label fw-bold">Created At:</label>
                    ;
                    <p className="form-label">{moment.tz(projectState.createdAt, 'Australia/Melbourne').format('YYYY-MM-DD HH:mm:ss')}</p>
                </div>
                <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Updated at:</label>
                    <p className="form-label">{moment.tz(projectState.updatedAt, 'Australia/Melbourne').format('YYYY-MM-DD HH:mm:ss')}</p>
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
    ) : (
        <div className='border'>Project Detail API fetched successfully, but it might be empty...</div>
    );

    const projectEmployeesTab = (
        <div className="card-body border-1 relative">
            {selectEmployeesBtn}
        
            {projectState && projectState.employees && projectState.employees.length > 0 ? (
            <table className="table table-bordered">
                <thead className="thead-dark">
                    <tr className="table-primary">
                        <th scope="col">Id</th>
                        <th scope="col">Name</th>
                        <th scope="col">Phone</th>
                        <th scope="col">Email</th>
                        <th scope="col">Role</th>
                    </tr>
                </thead>
                <tbody>
                    {projectState.employees.map((employee, index) => (
                            <tr key={`projectEmployeesTab-${employee._id}`} onClick={() => handleTableClick('employee', employee._id)}>
                                <th>{index + 1}</th>
                                <td>{employee.employee_first_name} {employee.employee_last_name}</td>
                                <td>{employee.employee_mobile_phone}</td>
                                <td>{employee.employee_email}</td>
                                <td>{employee.employee_roles}</td>
                            </tr>
                            ))}
                </tbody>
            </table>
    ) : (
        <div className='border'>No related Employee</div>
    )}
    </div>
    );

    const projectSuppliersTab = (
        <div className="card-body border-1 relative">
            {selectSuppliersBtn}

            {projectState && projectState.suppliers && projectState.suppliers.length > 0 ? (
                <table className="table table-bordered">
                    <thead className="thead-dark">
                        <tr className="table-primary">
                            <th scope="col">Id</th>
                            <th scope="col">Name</th>
                            <th scope="col">Address</th>
                            <th scope="col">Material Type</th>
                            <th scope="col">Type</th>
                            <th scope="col">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                    {projectState.suppliers.map((supplier, index) => (
                        <tr key={`projectSuppliersTabKey-${supplier._id}`} onClick={() => handleTableClick('supplier', supplier._id)}>
                                <th scope="row">{index + 1}</th>
                                <td>{supplier.supplier_name}</td>
                                <td>{supplier.supplier_address}</td>
                                <td>{supplier.supplier_material_types}</td>
                                <td>{supplier.supplier_type}</td>
                                <td>{supplier.supplier_isarchived ? ("Archived") : ("Active")}</td>
                            </tr>
                    ))}
                    </tbody>
                </table>
        ) : (
            <div className='border'>No related Supplier</div>
        )}
        </div>
    );

    const addEmployeesPopUp = (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-5 rounded-lg shadow-lg w-[600px]">
                <h4 className="font-bold mb-4">SELECT EMPLOYEES FOR THE {projectState.project_name} PROJECT</h4>
                <div>
                    {allEmployees.filter(employee => employee.employee_isarchived === false).map(employee => (
                            <div key={`addEmployeesPopUp-${employee._id}`} className="flex items-center space-x-4 p-2 border-b border-gray-200">
                                <input className="form-checkbox h-5 w-5 text-blue-600"
                                    type="checkbox" checked={selectedEmployees.has(employee._id)}
                                    onChange={() => handleEmployeeCheckbox(employee._id, true)}
                                    disabled={employee.projects.includes(projectState._id)}/>
                                <label className="flex-1 text-gray-800">
                                    <span className="font-semibold">{employee.employee_first_name} {employee.employee_last_name}</span>
                                    <span className="ml-2 text-sm text-gray-600">{employee.employee_roles}</span>
                                </label>
                            </div>
                        ))}
                </div>
                <div className="flex justify-end mt-5">
                    <button className="ml-2 btn btn-secondary bg-gray-300 text-gray-800 hover:bg-gray-400 px-4 py-2 rounded-md font-medium disabled:opacity-50"
                        onClick={() => setAddEmployeeListVisible(false)}>
                        Cancel
                    </button>
                    <button className="ml-2 btn btn-secondary bg-blue-500 text-white hover:bg-blue-600 px-4 py-2 rounded-md font-medium disabled:opacity-50"
                        onClick={handleAddEmployeesConfirm}>
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );

    const removeEmployeesPopUp = (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-5 rounded-lg shadow-lg w-[600px]">
                <h4 className="font-bold mb-4">SELECT EMPLOYEES TO <span className="text-red-500">REMOVE</span> FROM THE {projectState.project_name} PROJECT</h4>
                <div>
                    {   
                        projectState.employees && projectState.employees.length > 0 ? (
                            projectState.employees.map(employee => (
                                <div key={`removeEmployeesPopUp-${employee._id}`} className="flex items-center space-x-4 p-2 border-b border-gray-200">
                                    <input className="form-checkbox h-5 w-5 text-blue-600"
                                        type="checkbox" onChange={() => handleEmployeeCheckbox(employee._id, false)}/>
                                    <label className="flex-1 text-gray-800">
                                        <span className="font-semibold">{employee.employee_first_name} {employee.employee_last_name}</span>
                                        <span className="ml-2 text-sm text-gray-600">{employee.employee_roles}</span>
                                    </label>
                                </div>
                        ))
                    ) : (
                        <div className='border'>No related Employee to Remove</div>
                    )}
                </div>
                <div id = "removeEmployeesConfirmMessage"></div>
                <div className="flex justify-end mt-5">
                    <button className="ml-2 btn btn-secondary bg-gray-300 text-gray-800 hover:bg-gray-400 px-4 py-2 rounded-md font-medium disabled:opacity-50"
                        onClick={() => setRemoveEmployeeListVisible(false)}>
                        Cancel
                    </button>
                    <button className="ml-2 btn btn-secondary bg-blue-500 text-white hover:bg-blue-600 px-4 py-2 rounded-md font-medium disabled:opacity-50"
                        onClick={handleRemoveEmployeesConfirm }>
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );

    const selectSuppliersPopUp = (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-5 rounded-lg shadow-lg w-[1500px]">
                <h4 className="font-bold mb-4">SELECT SUPPLIERS : </h4>
                <div style={{ gridTemplateColumns: `repeat(${numberOfSupplierColumns}, minmax(0, 1fr))` }} className="grid gap-4">
                {
                        allSuppliers
                        .sort((a, b) => a.supplier_type.localeCompare(b.supplier_type) || a.supplier_name.localeCompare(b.supplier_name)  )
                        .map(supplier => (
                        <div key={`selectSuppliersPopUp-${supplier._id}`} className="flex items-center space-x-4 p-2 border-b border-gray-200">
                            <input 
                                className="form-checkbox h-5 w-5 text-blue-600"
                                type="checkbox"
                                checked={selectedSuppliers.has(supplier._id)}
                                onChange={() => handleSupplierCheckbox(supplier._id)}
                            />
                            <label className="flex-1 text-gray-800">
                                <span className="font-semibold">{supplier.supplier_name}</span>
                                <span className="ml-2 text-sm text-gray-600">{supplier.supplier_type}</span>
                            </label>
                        </div>
                    ))}
                </div>
                <div className="flex justify-end mt-5">
                    <button className="ml-2 btn btn-secondary bg-gray-300 text-gray-800 hover:bg-gray-400 px-4 py-2 rounded-md font-medium disabled:opacity-50"
                        onClick={() => setSelectSupplierListVisible(false)}>
                        Cancel
                    </button>
                    <button className="ml-2 btn btn-secondary bg-blue-500 text-white hover:bg-blue-600 px-4 py-2 rounded-md font-medium disabled:opacity-50"
                        onClick={handleSelectSuppliersConfirm}>
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );

    if (isLoadingState) { return (<ProjectDetailsSkeleton />); }   

    if (errorState) {
        if(errorState.includes("Session expired") || errorState.includes("jwt expired")){
            return(<div><SessionExpired /></div>)
        }
        return (<div>Error: {errorState}</div>);
    }
    if (!projectState) return <p>No project details available</p>;
    
    return (
        <div className="container mt-5">
            <div className="card">
                <div className="card-header bg-dark text-white flex justify-between items-center">
                    <button onClick={() => {navigate("/EmpirePMS/project")}}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-7 w-12 border-transparent bg-gray-700 rounded-md p-1 hover:bg-gray-500 hover:scale-95 ease-out duration-300">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m18.75 4.5-7.5 7.5 7.5 7.5m-6-15L5.25 12l7.5 7.5"/>
                        </svg>
                    </button>
                    <h1 className='mx-auto uppercase font-bold text-xl'>Project： {projectState.project_name}</h1>
                </div>
                <div className="card-body">
                    <div>
                        <button className={`${currentTab === 'projectDetails' ? 'border-x-2 border-t-2 p-2 rounded bg-gray-700 text-white' : 'border-x-2 border-t-2 p-2 rounded bg-transparent text-black hover:scale-90 transition ease-out duration-50 '}`}  onClick={() => setCurrentTab('projectDetails')}>Details</button>
                        <button className={`${currentTab === 'projectEmployeesTable' ? 'border-x-2 border-t-2 p-2 rounded bg-gray-700 text-white' : 'border-x-2 border-t-2 p-2 rounded bg-transparent text-black hover:scale-90 transition ease-out duration-50 '}`}  onClick={() => setCurrentTab('projectEmployeesTable')}>Employees</button>
                        <button className={`${currentTab === 'projectSuppliersTable' ? 'border-x-2 border-t-2 p-2 rounded bg-gray-700 text-white' : 'border-x-2 border-t-2 p-2 rounded bg-transparent text-black hover:scale-90 transition ease-out duration-50 '}`}  onClick={() => setCurrentTab('projectSuppliersTable')}>Suppliers</button>
                    </div>
                    
                     {/* SWITCH BETWEEN COMPONENTS HERE*/}
                    {currentTab === 'projectDetails' && projectDetailsTab}
                    {currentTab === 'projectEmployeesTable' && projectEmployeesTab }
                    {currentTab === 'projectSuppliersTable' && projectSuppliersTab} 


                    {isAddEmployeeListVisible && addEmployeesPopUp}
                    {isRemoveEmployeeListVisible && removeEmployeesPopUp}
                    {isSelectSupplierListVisible && selectSuppliersPopUp}


                </div>
            </div>
            { archiveModal }
        </div>
    );
};

export default Project_Details;
