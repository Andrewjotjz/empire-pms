//import modules
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setEmployeeDetails } from '../redux/employeeSlice';
import { setProjectState } from '../redux/projectSlice';
import { toast } from 'react-toastify';
import { Modal, Button } from "react-bootstrap";
import { useUpdateEmployee } from '../hooks/useUpdateEmployee';
import SessionExpired from "../components/SessionExpired";
import EmployeeDetailsSkeleton from "./loaders/EmployeeDetailsSkeleton";
import Dropdown from "react-bootstrap/Dropdown"


const EmployeeDetails = () => {

    //Component state declaration
    const employeeState = useSelector((state) => state.employeeReducer.employeeState);
    const localUserState = useSelector((state) => state.localUserReducer.localUserState);
    const projectState = useSelector((state) => state.projectReducer.projectState);
    const { update } = useUpdateEmployee();
    const dispatch = useDispatch()

    const numberOfProjectColumns  = Math.ceil(projectState?.length / 5);
    const [selectedProjects, setSelectedProjects] = useState(new Set());  // set all select suppliers to add or remove
    const [isSelectProjectListVisible, setSelectProjectListVisible] = useState(false);


    const [isLoadingState, setIsLoadingState] = useState(true);
    const [errorState, setErrorState] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [currentTab, setCurrentTab] = useState('employeeDetails');

    //Component router
    const { id } = useParams();
    const navigate = useNavigate();

    //Component functions and variables
    const handleBackClick = () => navigate(-1)
    
    const handleEditClick = () => navigate(`/EmpirePMS/employee/${id}/edit`, { state: id });

    const handleChangePassword = () => navigate(`/EmpirePMS/employee/${id}/change-password`, { state: id });

    const handleTableClick = (page,varID) => {
        navigate(`/EmpirePMS/${page}/${varID}`, { state: varID });
    };

    //Render component
    const fetchEmployee = useCallback(async () => {
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
    }, [id, dispatch]);

    useEffect(() => {
        fetchEmployee();
    }, [fetchEmployee]);

    // Fetch all projects when the component mounts
    useEffect(() => {
        const fetchAllProjects = async () => {
            try {
                const res = await fetch(`/api/project`);
                if (!res.ok) {
                    throw new Error('Network response was not ok employees data');
                }
                let projectsData = await res.json();

                // Sort projects by project_isarchived
                projectsData.sort((a, b) => a.project_isarchived - b.project_isarchived);

                // projectsData = projectsData.filter(project => !project.project_isarchived);

                dispatch(setProjectState(projectsData));
                setIsLoadingState(false);

            } catch (error) {
                setErrorState(error.message);

            } finally {
                setIsLoadingState(false);
            }
        };
        fetchAllProjects();
    }, [dispatch]);

    
    const handleRelatedProjects = () => {
        if (employeeState && employeeState.projects) {
            const relatedProjectIds = new Set(employeeState.projects.map(project => project._id));
            setSelectedProjects(relatedProjectIds);
        }
    };

    const handleSelectProjectsClick = () => {
        handleRelatedProjects();
        setSelectProjectListVisible(true);
    };

    const handleProjectCheckbox = (projectId) => {
        const updatedSelectedProjects = new Set(selectedProjects);
        if (updatedSelectedProjects.has(projectId)) {
            updatedSelectedProjects.delete(projectId);
        } else {
            updatedSelectedProjects.add(projectId);
        }
        setSelectedProjects(updatedSelectedProjects);
    };

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

    const handleArchive = () => {    
        let updatedState;
        if (employeeState.employee_isarchived === true) {
            updatedState = {
                ...employeeState,
                employee_isarchived: false,
            };
        } else {
            updatedState = {
                ...employeeState,
                employee_isarchived: true,
            };
        }
    
        dispatch(setEmployeeDetails(updatedState));

        update(updatedState, `Employee has been ${employeeState.employee_isarchived ? `unarchived` : `archived`}`);

        setShowModal(false);
    };


    const handleSelectProjectsConfirm = async () => {

        const selectedProjectsArray = Array.from(selectedProjects);

        const updateRes = await fetch(`/api/employee/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ projects: Array.from(selectedProjectsArray) })
        });

        if (!updateRes.ok) {
            throw new Error(`Failed to update employee ${id}`);
        }

         // Close the selectSuppliers Propup
         setSelectProjectListVisible(false);
    
         // Fetch the updated project details to refresh the UI
         await fetchEmployee();

    };

    const selectProjectsBtn = (
        <div className='d-flex m-1 justify-content-end'>
            <button className="btn btn-primary" onClick={handleSelectProjectsClick}>
                <div className='flex items-center'>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 mr-1">
                        <path id="Vector" 
                        d="M8 12L11 15L16 9M4 16.8002V7.2002C4 6.08009 4 5.51962 4.21799 5.0918C4.40973 4.71547 4.71547 4.40973 5.0918 4.21799C5.51962 4 6.08009 4 7.2002 4H16.8002C17.9203 4 18.4796 4 18.9074 4.21799C19.2837 4.40973 19.5905 4.71547 19.7822 5.0918C20 5.5192 20 6.07899 20 7.19691V16.8036C20 17.9215 20 18.4805 19.7822 18.9079C19.5905 19.2842 19.2837 19.5905 18.9074 19.7822C18.48 20 17.921 20 16.8031 20H7.19691C6.07899 20 5.5192 20 5.0918 19.7822C4.71547 19.5905 4.40973 19.2842 4.21799 18.9079C4 18.4801 4 17.9203 4 16.8002Z"
                         stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <label>SELECT PROJECTS</label>
                </div>
            </button>
        </div>
    );

    const selectProjectPopUp = (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-5 rounded-lg shadow-lg">
                <h4 className="font-bold mb-4">SELECT PROJECTS : </h4>
                <div style={{ gridTemplateColumns: `repeat(${numberOfProjectColumns}, minmax(0, 1fr))` }} className="grid gap-4">
                    {
                        Array.isArray(projectState) && projectState.map(project => (
                        <div key={`selectProjectPopUp-${project._id}`} className="flex items-center space-x-4 p-2 border-b border-gray-200">
                            <input 
                                className="form-checkbox h-5 w-5 text-blue-600"
                                type="checkbox"
                                checked={selectedProjects.has(project._id)}
                                onChange={() => handleProjectCheckbox(project._id)}
                            />
                            <label className="flex-1 text-gray-800">
                                <span className="font-semibold">{project.project_name}</span>
                                <span className="ml-2 text-sm">
                                 {project.project_isarchived ? 
                                    (<label className="text-red-500">Archived</label>) : 
                                    (<label className="text-green-600">Active</label>)
                                    }
                                </span>
                                <span className="block text-sm text-gray-600">{project.project_address}</span>
                            </label>
                        </div>
                    ))}
                </div>
                <div className="flex justify-end mt-5">
                    <button className="ml-2 btn btn-secondary bg-gray-300 text-gray-800 hover:bg-gray-400 px-4 py-2 rounded-md font-medium disabled:opacity-50"
                        onClick={() => setSelectProjectListVisible(false)}>
                        Cancel
                    </button>
                    <button className="ml-2 btn btn-secondary bg-blue-500 text-white hover:bg-blue-600 px-4 py-2 rounded-md font-medium disabled:opacity-50"
                        onClick={handleSelectProjectsConfirm}>
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );

    const employeeDetails = (
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
                                <label>EDIT ACCOUNT</label>
                            </div>
                        </Dropdown.Item>
                        <Dropdown.Item onClick={handleSendResetPassword}>
                            <div className='flex items-center'>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4 mr-2">
                                    <path d="M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a3 3 0 0 1-3.144 0L1.5 8.67Z" />
                                    <path d="M22.5 6.908V6.75a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3v.158l9.714 5.978a1.5 1.5 0 0 0 1.572 0L22.5 6.908Z" />
                                </svg>
                                <label>EMAIL PASSWORD RESET</label>
                            </div>
                        </Dropdown.Item>
                        <Dropdown.Item onClick={handleChangePassword}>
                            <div className='flex items-center'>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4 mr-2">
                                    <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z" clipRule="evenodd" />
                                </svg>
                                <label>CHANGE PASSWORD</label>
                            </div>
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => setShowModal(true)}>
                            <div className='flex items-center'>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="size-4 mr-2">
                                    <path d="M2 3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3Z" />
                                    <path fillRule="evenodd" d="M13 6H3v6a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V6ZM8.75 7.75a.75.75 0 0 0-1.5 0v2.69L6.03 9.22a.75.75 0 0 0-1.06 1.06l2.5 2.5a.75.75 0 0 0 1.06 0l2.5-2.5a.75.75 0 1 0-1.06-1.06l-1.22 1.22V7.75Z" clipRule="evenodd" />
                                </svg>
                                <label>{ employeeState.employee_isarchived ? `UNARCHIVE` : `ARCHIVE`}</label>
                            </div>
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </div>
            <div className="row">
                <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Name:</label>
                    <p className="form-label">{employeeState?.employee_first_name} {employeeState?.employee_last_name}</p>
                </div>
                <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Email:</label>
                    <p className="form-label">{employeeState?.employee_email}</p>
                </div>
                <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Contact:</label>
                    <p className="form-label">{employeeState?.employee_mobile_phone}</p>
                </div>
                <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Role:</label>
                    <p className="form-label">{employeeState?.employee_roles}</p>
                </div>
                <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Company:</label>
                    <p className="form-label">  {employeeState?.companies ? employeeState.companies?.company_name : 'No company name available'}</p>
                </div>
                <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Status:</label>
                    {employeeState?.employee_isarchived ? 
                        (<label className="text-lg font-bold m-1 p-2 rounded-xl text-red-500">Archived</label>) : 
                        (<label className="text-lg font-bold m-1 p-2 rounded-xl text-green-600">Active</label>)
                    }
                </div>
            </div>
        </div>
    );

    const employeeProjectsTable = (
        <div className="card-body border-1 relative">
            {selectProjectsBtn}

            {employeeState && employeeState.projects && employeeState.projects.length > 0 ? (
            <table className="table table-bordered table-hover">
                <thead className="thead-dark">
                    <tr className="table-primary">
                        <th scope="col">Id</th>
                        <th scope="col">Project Name</th>
                        <th scope="col">Project Address</th>
                        <th scope="col">Project Status</th>
                    </tr>
                </thead>
                <tbody>
                    {employeeState.projects.map((project, index) => (
                            <tr className="cursor-pointer" key={`employeeProjectsTable-${project._id}`} onClick={() => handleTableClick('project', project._id)}>
                                <th>{index + 1}</th>
                                <td>{project.project_name}</td>
                                <td>{project.project_address}</td>
                                <td>{project.project_isarchived ? `Archived` : `Active`}</td>
                            </tr>
                            ))}
                </tbody>
            </table>
    ) : (
        <div className='border'>No related Employee</div>
    )}
    </div>
    );

    const archiveModal = (
        <Modal show={showModal} onHide={() => setShowModal(false)}>
            <Modal.Header closeButton>
                <Modal.Title>
                    { employeeState && employeeState.employee_isarchived ? `Confirm Unarchive` : `Confirm Archive`}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                { employeeState && employeeState.employee_isarchived ? `Are you sure you want to unarchive this employee?` : `Are you sure you want to archive this employee?`}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowModal(false)}>
                    Cancel
                </Button>
                <Button className="bg-red-600 hover:bg-red-600" variant="primary" onClick={handleArchive}>
                    { employeeState && employeeState.employee_isarchived ? `Unarchive` : `Archive`}
                </Button>
            </Modal.Footer>
        </Modal>
    )
    
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
                    <button onClick={handleBackClick}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-7 w-12 border-transparent bg-gray-700 rounded-md p-1 hover:bg-gray-500 hover:scale-95 ease-out duration-300">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m18.75 4.5-7.5 7.5 7.5 7.5m-6-15L5.25 12l7.5 7.5"/>
                        </svg>
                    </button>
                    <h1 className='mx-auto uppercase font-bold text-xl'>{localUserState.employee_email === employeeState.employee_email ? 'YOUR ACCOUNT' : `EMPLOYEE : ${employeeState.employee_first_name} ${employeeState.employee_last_name}`}</h1>
                </div>
            <div className="card-body">
                <div>
                    <button className={`${currentTab === 'employeeDetails' ? 'border-x-2 border-t-2 p-2 rounded bg-gray-700 text-white' : 'border-x-2 border-t-2 p-2 rounded bg-transparent text-black hover:scale-90 transition ease-out duration-50 '}`}  onClick={() => setCurrentTab('employeeDetails')}>Details</button>
                    <button className={`${currentTab === 'employeeProjectsTable' ? 'border-x-2 border-t-2 p-2 rounded bg-gray-700 text-white' : 'border-x-2 border-t-2 p-2 rounded bg-transparent text-black hover:scale-90 transition ease-out duration-50 '}`}  onClick={() => setCurrentTab('employeeProjectsTable')}>Projects</button>
                </div>
                    {/* SWITCH BETWEEN COMPONENTS HERE */}
                    {currentTab === 'employeeDetails' && employeeDetails}
                    {currentTab === 'employeeProjectsTable' && employeeProjectsTable}


                    {isSelectProjectListVisible && selectProjectPopUp}

            </div>
        </div>
        { archiveModal }
    </div>
    );
};

export default EmployeeDetails;
