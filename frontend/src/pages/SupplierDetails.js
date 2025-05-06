//import modules
import { useParams, useNavigate} from 'react-router-dom';
import { useEffect, useState, useCallback} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setSupplierState } from '../redux/supplierSlice';
import { setProjectState } from '../redux/projectSlice';
import { setProductState, clearProductState } from '../redux/productSlice';
import { setPurchaseOrderState, clearPurchaseOrderState } from '../redux/purchaseOrderSlice';
import SessionExpired from "../components/SessionExpired";
import EmployeeDetailsSkeleton from "./loaders/EmployeeDetailsSkeleton";
import UnauthenticatedSkeleton from './loaders/UnauthenticateSkeleton';
import Dropdown from "react-bootstrap/Dropdown";
import { Modal, Button } from "react-bootstrap";
import { useUpdateSupplier } from '../hooks/useUpdateSupplier';

const SupplierDetails = () => {
    //Component router
    const { id } = useParams();
    const navigate = useNavigate();

    //Component state declaration
    const supplierState = useSelector((state) => state.supplierReducer.supplierState);
    const productState = useSelector((state) => state.productReducer.productState);
    const projectState = useSelector((state) => state.projectReducer.projectState);
    const purchaseOrderState = useSelector((state) => state.purchaseOrderReducer.purchaseOrderState);
    // const numberOfProjectColumns  = Math.ceil(projectState?.length / 5);

    const [isLoadingState, setIsLoadingState] = useState(true);
    const [errorState, setErrorState] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [currentTab, setCurrentTab] = useState('supplierDetails');
    const [searchTerm, setSearchTerm] = useState('');  
    const [productTypeState, setProductTypeState] = useState([]);  

    const [selectedProjects, setSelectedProjects] = useState(new Set());  // set select projects to add
    const [projectsToRemove, setProjectsToRemove] = useState(new Set());  // set select projects to remove
    const [isAddProjectListVisible, setAddProjectListVisible] = useState(false);
    const [isRemoveProjectListVisible, setRemoveProjectListVisible] = useState(false);

    //Component hooks
    const { update } = useUpdateSupplier();
    const dispatch = useDispatch()

    //Component functions and variables
    const localUser = JSON.parse(localStorage.getItem('localUser'))

    const formatDate = (dateString) => {
        if (dateString === null) {
            return ''
        }  else {
            const date = new Date(dateString);
            const options = { day: '2-digit', month: 'short', year: 'numeric' };
            return date.toLocaleDateString('en-AU', options).toUpperCase().replace(' ', '-').replace(' ', '-');
        }
    };

    const formatDateTime = (dateString) => {
        if (dateString === null) {
            return ''
        }  else {
            const date = new Date(dateString);
            const options = { day: '2-digit', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true };
            return date.toLocaleDateString('en-AU', options).toUpperCase().replace(' ', '-').replace(' ', '-');
        }
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const filterProducts = () => {
        return productState.filter(product => {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
    
            return (
                product.product.product_sku.toLowerCase().includes(lowerCaseSearchTerm) ||
                product.product.product_name.toLowerCase().includes(lowerCaseSearchTerm) ||
                product.productPrice.product_number_a?.toString().includes(lowerCaseSearchTerm) ||
                product.productPrice.product_unit_a.toLowerCase().includes(lowerCaseSearchTerm) ||
                product.productPrice.product_price_unit_a?.toString().toLowerCase().includes(lowerCaseSearchTerm) ||
                product.product.product_actual_size?.toString().includes(lowerCaseSearchTerm) ||
                productTypeState.find(type => type._id === product.product.product_type)?.type_name.toLowerCase().includes(lowerCaseSearchTerm) ||
                product.product.alias_name?.toString().includes(lowerCaseSearchTerm) ||
                product.productPrice.project_names.some(projectName => 
                    projectName.toLowerCase().includes(lowerCaseSearchTerm)
                )
            );
        });
    };

    const filterOrders = () => {
        return purchaseOrderState.filter(order => {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
    
            // Check each field for the search term
            return (
                order.order_ref.toLowerCase().includes(lowerCaseSearchTerm) ||
                order.project.project_name.toLowerCase().includes(lowerCaseSearchTerm) ||
                order.supplier.supplier_name.toLowerCase().includes(lowerCaseSearchTerm) ||
                order.order_total_amount.toString().includes(lowerCaseSearchTerm) ||
                order.order_status.toLowerCase().includes(lowerCaseSearchTerm)
            );
        });
    };

    const handleAddProductClick = () => navigate(`/EmpirePMS/supplier/${id}/products/create`, { state: {supplierId: id, supplierName: supplierState.supplier_name} });

    const handleCreateOrder = () => navigate(`/EmpirePMS/order/create`);

    const handleTableClick = (page,varID) => {
        navigate(`/EmpirePMS/${page}/${varID}`, { state: varID });
    }

    const handleOrderTableClick = (id) => {

        dispatch(clearPurchaseOrderState())
        navigate(`/EmpirePMS/order/${id}`);
    }

    const handleProductTableClick = (productId) => { 
        dispatch(clearProductState());
        navigate(`/EmpirePMS/supplier/${id}/products/${productId}`, { state: id })
    }

    const handleRelatedProjects = () => {
        if (supplierState && supplierState.projects) {
            const relatedProjectIds = new Set(supplierState.projects.map(project => project._id));
            setSelectedProjects(relatedProjectIds);
        }
    };

    const handleAddProjectClick = () => {
        handleRelatedProjects();
        setAddProjectListVisible(true);
    };

    const handleRemoveProjectClick = () => {
        setRemoveProjectListVisible(true);
    };

    const handleProjectCheckbox = (projectId, isAdding) => {

        if (isAdding) {
            const updatedSelecteProjects = new Set(selectedProjects);
            if (updatedSelecteProjects.has(projectId)) {
                updatedSelecteProjects.delete(projectId);
            } else {
                updatedSelecteProjects.add(projectId);
            }
            setSelectedProjects(updatedSelecteProjects);

        } else {
            const updatedProjectsToRemove = new Set(projectsToRemove);
            if (updatedProjectsToRemove.has(projectId)) {
                updatedProjectsToRemove.delete(projectId);
            } else {
                updatedProjectsToRemove.add(projectId);
            }
            setProjectsToRemove(updatedProjectsToRemove);
        }
    };


    const handleAddProjectConfirm = async () => {
        const selectedProjectArray = Array.from(selectedProjects);
    
        // Get the current project IDs from supplier details
        const currentProjectIds = new Set(supplierState.projects.map(project => project._id));
    
        // Filter the selected projects to only include new ones
        const newProjects = selectedProjectArray.filter(projectId => !currentProjectIds.has(projectId));
    
        if (newProjects.length > 0) {
            try {
                // Update each new project to add the current supplier to its suppliers array
                await Promise.all(newProjects.map(async projectId => {
                    // Fetch the current project data to get its suppliers array
                    const projectRes = await fetch(`${process.env.REACT_APP_API_BASE_URL}/project/${projectId}`, { credentials: 'include',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${sessionStorage.getItem('jwt')}` // Include token in Authorization header
                        }});
                    if (!projectRes.ok) {
                        throw new Error(`Failed to fetch project ${projectId}`);
                    }
                    const projectData = await projectRes.json();
    
                    // Add the current supplier ID to the project's suppliers array if it's not already present
                    const updatedSuppliers = new Set(projectData[0].suppliers);
                    updatedSuppliers.add(id);
    
                    // Update the project's suppliers array
                    const updateRes = await fetch(`${process.env.REACT_APP_API_BASE_URL}/project/${projectId}`, {
                        credentials: 'include', method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${sessionStorage.getItem('jwt')}` // Include token in Authorization header
                        },
                        // body: JSON.stringify({ suppliers: Array.from(updatedSuppliers) })
                        body: JSON.stringify({
                            project_name: projectData[0].project_name,
                            project_address: projectData[0].project_address,
                            project_isarchived: projectData[0].project_isarchived,
                            area_obj_ref: projectData[0].area_obj_ref,
                            suppliers: Array.from(updatedSuppliers)
                        })
                        
                    });
    
                    if (!updateRes.ok) {
                        throw new Error(`Failed to update project ${projectId}`);
                    }
                }));
        
                // Close the addProjects Popup
                setAddProjectListVisible(false);
                
                // Fetch the updated supplier details to refresh the UI
                await fetchSupplierDetails();
    
            } catch (error) {
                console.error('Error updating projects:', error);
            }
        }
    };

    const handleRemoveEmployeesConfirm = async () => {
        

        const projectsToRemoveArray = Array.from(projectsToRemove);

        
        try {

            if (projectsToRemoveArray.length > 0) {

                await Promise.all(projectsToRemoveArray.map(async projectID =>{

                    const projectRes = await fetch(`${process.env.REACT_APP_API_BASE_URL}/project/${projectID}`, { credentials: 'include',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${sessionStorage.getItem('jwt')}` // Include token in Authorization header
                        }});

                    if(!projectRes.ok){
                        throw new Error(`Failed to fetch project ${projectID}`); 
                    }

                    const projectData = await projectRes.json();

                    // Filter out the current supplier ID from project's suppliers array 
                    const updatedSuppliers = projectData[0].suppliers.filter(supplier => supplier._id !== id);

                    const updateRes = await fetch(`${process.env.REACT_APP_API_BASE_URL}/project/${projectID}`, {
                        credentials: 'include', method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${sessionStorage.getItem('jwt')}` // Include token in Authorization header
                        },
                        // body: JSON.stringify({ suppliers: updatedSuppliers })
                        body: JSON.stringify({
                            project_name: projectData[0].project_name,
                            project_address: projectData[0].project_address,
                            project_isarchived: projectData[0].project_isarchived,
                            area_obj_ref: projectData[0].area_obj_ref,
                            suppliers: Array.from(updatedSuppliers)
                        })
                        

                    })
                    if (!updateRes.ok) {
                        throw new Error(`Failed to update project ${projectID}`);
                    }
                }));
            }
                // Close the addEmployees Propup
                setRemoveProjectListVisible(false);

                // Fetch the updated project details to refresh the UI
                await fetchSupplierDetails();

                // Reset employeesToRemove array to empty
                setProjectsToRemove([]); 

            }catch(error){
                console.error('Error removing projects:', error);
            }

    };

    const handleArchive = () => {    
        let updatedState;
        if (supplierState.supplier_isarchived === true) {
            updatedState = {
                ...supplierState,
                supplier_isarchived: false,
            };
        } else {
            updatedState = {
                ...supplierState,
                supplier_isarchived: true,
            };
        }
    
        dispatch(setSupplierState(updatedState));

        update(updatedState, `Supplier has been ${supplierState.supplier_isarchived ? `unarchived` : `archived`}`);

        setShowModal(false);
    };

    const handleEditSupplierClick = () => navigate(`/EmpirePMS/supplier/${id}/edit`, { state: id });
    

    //Render component
    const fetchSupplierDetails = useCallback(async () => {
        try {
            const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/supplier/${id}`, { credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('jwt')}` // Include token in Authorization header
                } });
            if (!res.ok) {
                throw new Error('Failed to fetch supplier details');
            }
            const data = await res.json();

            if (data.tokenError) {
                throw new Error(data.tokenError);
            }

            dispatch(setSupplierState(data));

            setIsLoadingState(false);
        } catch (err) {
            setErrorState(err.message);
            setIsLoadingState(false);
        }
    }, [id, dispatch]);

    
    const fetchOrdersBySupplier = async () => {
        try{
            const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/order`, { credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('jwt')}` // Include token in Authorization header
                } });
            if (!res.ok) {
                throw new Error('Failed to fetch orders');
            }
            const data = await res.json();

            if (data.tokenError) {
                throw new Error(data.tokenError)
            }

            const filteredOrders = data.filter(order => order.supplier._id === supplierState._id)

            dispatch(setPurchaseOrderState(filteredOrders))
            setIsLoadingState(false)
        } catch (err) {
            setErrorState(err.message);
            setIsLoadingState(false);
        }
    };

    useEffect(() => {
        fetchSupplierDetails();
    }, [fetchSupplierDetails]);

    useEffect(() => {
        const fetchSupplierProducts = async () => {
            try{
                const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/supplier/${id}/products`, { credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${sessionStorage.getItem('jwt')}` // Include token in Authorization header
                    }});
                if (!res.ok) {
                    throw new Error('Failed to fetch supplier products');
                }
                const data = await res.json();
                if (data.tokenError) {
                    throw new Error(data.tokenError)
                }

                dispatch(setProductState(data.filter(prod => prod.product.product_isarchived === false)))
                setIsLoadingState(false)
            } catch (err) {
                setErrorState(err.message);
                setIsLoadingState(false);
            }
        };

        fetchSupplierProducts();
    }, [id, dispatch]);

    // Fetch all projects when the component mounts
    useEffect(() => {
        const fetchAllProjects = async () => {
            try {
                const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/project`, { credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${sessionStorage.getItem('jwt')}` // Include token in Authorization header
                    }});
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
    }, [id, dispatch]);

    useEffect(() => {
        const abortController = new AbortController();
        const signal = abortController.signal;

        const fetchProductTypes = async () => {
            setIsLoadingState(true); // Set loading state to true at the beginning
            try {
                const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/product-type`, { signal , credentials: 'include',
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
                setProductTypeState(data);
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

        fetchProductTypes();

        return () => {
            abortController.abort(); // Cleanup
        };
    }, []);
    
    const selectProjectsBtn = (
        <div className='d-flex m-1 justify-content-end'>
            <Dropdown>
                    {localUser.employee_roles === "Admin" && 
                    <Dropdown.Toggle variant="success" id="dropdown-basic">
                        ACTIONS
                    </Dropdown.Toggle>}
                    <Dropdown.Menu>
                        <Dropdown.Item onClick={handleAddProjectClick}>
                            <div className='flex items-center'>
                                <svg  className="size-6 mr-1" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg" aria-labelledby="checkboxIconTitle" stroke="#000000" 
                                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" color="#000000">
                                     <rect x="21" y="3" width="18" height="18" rx="1" transform="rotate(90 21 3)"/> 
                                     <path d="M6.66666 12.6667L9.99999 16L17.3333 8.66669"/> 
                                     </svg>
                                <label>Add Projects</label>
                            </div>
                        </Dropdown.Item>
                        <Dropdown.Item onClick={handleRemoveProjectClick}>
                            <div className='flex items-center'>
                                <svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 28 28" className="size-6 mr-1"
                                    strokeWidth={1.5} stroke="#000000" strokeLinecap="round" strokeLinejoin="round" fill="none" color="#000000">
                                    <rect x="21" y="3" width="18" height="18" rx="1" transform="rotate(90 21 3)"/> 
                                    <path d="M16 12H8"/> 
                                </svg>
                                <label>Remove Projects</label>
                            </div>
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
        </div>
    );

    const supplierProjectsTable = (
        <div className="card-body border-1 relative text-xs sm:text-base">
            {selectProjectsBtn}
        
            {supplierState && supplierState.projects && supplierState.projects.length > 0 ? (
            <div className='overflow-x-auto'>
                <table className="table table-bordered table-hover">
                    <thead className="thead-dark">
                        <tr className="table-primary">
                            <th scope="col" className="hidden sm:table-cell">Id</th>
                            <th scope="col">Project Name</th>
                            <th scope="col">Project Address</th>
                            <th scope="col" className="hidden sm:table-cell">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {supplierState.projects.map((project, index) => (
                                <tr className="cursor-pointer" key={`projectEmployeesTab-${project._id}`} onClick={() => handleTableClick('project', project._id)}>
                                    <th className="hidden sm:table-cell">{index + 1}</th>
                                    <td>{project.project_name} </td>
                                    <td>{project.project_address}</td>
                                    <td className="hidden sm:table-cell">{project.project_isarchived ? `Archived` : `Active`}</td>
                                </tr>
                                ))}
                    </tbody>
                </table>
            </div>
    ) : (
        <div className='border'>No related Project</div>
    )}
    </div>
    );

    const addProjectsPopUp = (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 sm:p-6 md:p-8 text-xs sm:text-base">
            <div className="bg-white p-2 sm:p-5 rounded-lg shadow-lg w-full max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-3xl">
                <h4 className="font-bold mb-1 sm:mb-4 text-center sm:text-left text-sm sm:text-lg md:text-xl sm:border-b-2">
                    SELECT PROJECTS FOR THE {supplierState?.supplier_name?.toUpperCase()} SUPPLIER
                </h4>
                
                <div 
                    className="grid gap-0 sm:gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
                    {
                        Array.isArray(projectState) && projectState.map(project => (
                            <div key={`addProjectsPopUp-${project._id}`}
                                className="flex items-center space-x-0 sm:space-x-4 p-2 border-b border-gray-200">
                                <input className="form-checkbox h-3 w-3 sm:h-5 sm:w-5 text-blue-600"
                                    type="checkbox" 
                                    checked={selectedProjects.has(project._id)}
                                    onChange={() => handleProjectCheckbox(project._id, true)}
                                    disabled={supplierState.projects?.some(p => p._id === project._id)}
                                />
                                <label className="flex-1 text-gray-800">
                                    <span className="ml-2 font-semibold">{project.project_name}</span>
                                    <span className="ml-2 text-xs sm:text-sm">
                                        {project.project_isarchived ? 
                                            (<label className="text-red-500">Archived</label>) : 
                                            (<label className="text-green-600">Active</label>)
                                        }
                                    </span>
                                    <span className="hidden sm:block text-sm text-gray-600">{project.project_address}</span>
                                </label>
                            </div>
                        ))
                    }
                </div>
                
                <div className="flex flex-col sm:flex-row justify-end mt-0 sm:mt-5 space-y-2 sm:space-y-0 sm:space-x-2 text-xs sm:text-base">
                    <button className=" bg-gray-300 text-gray-800 hover:bg-gray-400 px-4 py-2 rounded-md font-medium disabled:opacity-50 w-full sm:w-auto"
                            onClick={() => setAddProjectListVisible(false)}>
                        Cancel
                    </button>
                    <button className=" bg-blue-500 text-white hover:bg-blue-600 px-4 py-2 rounded-md font-medium disabled:opacity-50 w-full sm:w-auto"
                            onClick={handleAddProjectConfirm}>
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );

    const removeProjectPopUp = (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 sm:p-6 md:p-8 text-xs sm:text-base">
            <div className="bg-white p-2 sm:p-5 rounded-lg shadow-lg w-full max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-3xl">
                <h4 className="font-bold mb-1 sm:mb-4 text-center sm:text-left text-sm sm:text-lg md:text-xl sm:border-b-2">SELECT PROJECT TO <span className="text-red-500">REMOVE</span> FROM THE {supplierState?.supplier_name?.toUpperCase() } SUPPLIER</h4>

                {
                    supplierState?.projects && supplierState.projects.length > 0 ? (
                        <div className="grid gap-0 sm:gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
                        {   
                            supplierState.projects.map((project) => (
                            <div key={`removeProjectPopUp-${project._id}`} className="flex items-center space-x-0 sm:space-x-4 p-2 border-b border-gray-200">
                                <input
                                    className="form-checkbox h-3 w-3 sm:h-5 sm:w-5 text-blue-600"
                                    type="checkbox"
                                    onChange={() => handleProjectCheckbox(project._id, false)}
                                />
                                <label className="flex-1 text-gray-800">
                                    <span className="ml-2 font-semibold">{project.project_name}</span>
                                    <span className="ml-2 text-xs sm:text-sm">
                                    {   project.project_isarchived ? (
                                        <label className="text-red-500">Archived</label>
                                    ) : (
                                        <label className="text-green-600">Active</label>
                                    )}
                                    </span>
                                    <span className="hidden sm:block text-sm text-gray-600">{project.project_address}</span>
                                </label>
                            </div>
                            ))}
                        </div>
                    ) : (
                        <div className="border">No related Project to Remove</div>
                    )
                    }
                
                <div className="flex flex-col sm:flex-row justify-end mt-0 sm:mt-5 space-y-2 sm:space-y-0 sm:space-x-2 text-xs sm:text-base">
                    <button className="bg-gray-300 text-gray-800 hover:bg-gray-400 px-4 py-2 rounded-md font-medium disabled:opacity-50 w-full sm:w-auto"
                        onClick={() => setRemoveProjectListVisible(false)}>
                        Cancel
                    </button>
                    <button className="bg-blue-500 text-white hover:bg-blue-600 px-4 py-2 rounded-md font-medium disabled:opacity-50 w-full sm:w-auto"
                        onClick={handleRemoveEmployeesConfirm }>
                            Confirm
                    </button>
                </div>
            </div>
        </div>
    );

    const supplierProductsTable = Array.isArray(productState) && productState.length > 0 ? (
        <div className='text-xs sm:text-base'>
            <div className="flex justify-between">
                <input
                    type="text"
                    className="form-control mb-1 w-10/12"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
                <button className="btn btn-primary mb-1" onClick={handleAddProductClick}>
                    <div className='flex items-center'>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 mr-1">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                        <label className='text-xs sm:text-base'>ADD PRODUCT</label>
                    </div>
                </button>
            </div>
            <table className="table table-bordered table-hover text-xs">
                <thead className="thead-dark">
                    <tr className="table-primary">
                        <th scope="col">SKU</th>
                        <th scope="col">Name</th>
                        <th scope="col" className="hidden sm:table-cell">Number A</th>
                        <th scope="col" className="hidden sm:table-cell">Unit A</th>
                        <th scope="col" className="hidden sm:table-cell">Price A</th>
                        <th scope="col" className="hidden sm:table-cell">Actual M<span className='text-xs align-top'>2</span>/M</th>
                        <th scope="col" className="hidden sm:table-cell">Type</th>
                        <th scope="col" className="hidden sm:table-cell">Alias</th>
                        <th scope="col" className="hidden sm:table-cell">Project Name</th>
                    </tr>
                </thead>
                <tbody>
                    {productState && filterProducts().filter((product, index, self) => index === self.findIndex((p) => p.product._id === product.product._id)).map((product, index) => (
                        <tr key={index} onClick={() => handleProductTableClick(product.product._id)} className='cursor-pointer'>
                            <th scope="row">{product.product.product_sku}</th>
                            <td>{product.product.product_name}</td>
                            <td className="hidden sm:table-cell">{product.productPrice.product_number_a}</td>
                            <td className="hidden sm:table-cell">{product.productPrice.product_unit_a}</td>
                            <td className="hidden sm:table-cell">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Math.floor(product.productPrice.product_price_unit_a * 100) / 100)}</td>
                            <td className="hidden sm:table-cell">{product.product.product_actual_size}</td>
                            <td className="hidden sm:table-cell">{productTypeState.find(type => type._id === product.product.product_type)?.type_name || "Unknown"}</td>
                            <td className="hidden sm:table-cell">{product.product.alias_name}</td>
                            <td className="hidden sm:table-cell">
                                {product.productPrice.project_names.map((project, index) => (
                                    <div key={index}>
                                        {project}
                                    </div>
                                ))}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    ) : (
        <div className='border'>
            <div className='m-1'>
                <label className='text-xl'>No products found in this supplier.</label>
            </div>
            <button className="btn btn-primary m-1" onClick={handleAddProductClick}>
                <div className='flex items-center'>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 mr-1">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                    <label>ADD PRODUCT</label>
                </div>
            </button>
        </div>
    );
    const supplierPurchaseOrdersTable = Array.isArray(purchaseOrderState) && purchaseOrderState.length > 0 ? (
        <div className='text-xs'>
            <div className="flex justify-between">
                <input
                    type="text"
                    className="form-control mb-1 w-10/12"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
                <button className="btn btn-primary mb-1" onClick={handleCreateOrder}>
                    <div className='flex items-center'>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 mr-1">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                        <label className='text-xs sm:text-base'>CREATE NEW ORDER</label>
                    </div>
                </button>
            </div>
            <div className='overflow-x-auto'>
                <table className="table table-bordered table-hover shadow-md">
                    <thead className="thead-dark text-center">
                        <tr className="table-primary">
                            <th scope="col">PO</th>
                            <th scope="col" className="hidden sm:table-cell">Order Date</th>
                            <th scope="col" className="hidden sm:table-cell">EST Date</th>
                            <th scope="col">Project</th>
                            <th scope="col" className="hidden sm:table-cell">Supplier</th>
                            <th scope="col" className="hidden sm:table-cell">Products</th>
                            <th scope="col" className="hidden sm:table-cell">Gross Amount</th>
                            <th scope="col">Status</th>
                            {/* <th scope="col">Ordered By</th> */}
                        </tr>
                    </thead>
                    <tbody>
                        {filterOrders().filter(order => order.order_isarchived === false).map((order, index) => (
                            <tr key={order._id} onClick={() => handleOrderTableClick(order._id)} className="cursor-pointer text-center">
                                <th scope="row">{order.order_ref}</th>
                                <td className="hidden sm:table-cell">{formatDate(order.order_date)}</td>
                                <td className="hidden sm:table-cell">{formatDateTime(order.order_est_datetime)}</td>
                                <td>{order.project.project_name}</td>
                                <td className="hidden sm:table-cell">{order.supplier.supplier_name}</td>
                                <td className="hidden sm:table-cell">{order.products.length + order.custom_products.length} products</td>
                                <td className="hidden sm:table-cell">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Math.floor(order.order_total_amount * 100) / 100 )}</td>
                                <td>
                                    {order.order_status && (
                                    <label
                                        className={`text-xs sm:text-sm font-bold m-1 py-0.5 px-1 rounded-xl ${
                                            order.order_status === "Cancelled"
                                                ? "border-2 bg-transparent border-gray-500 text-gray-500"
                                                : order.order_status === "Pending"
                                                ? "border-2 bg-transparent border-yellow-300 text-yellow-600"
                                                : order.order_status === "Approved"
                                                ? "border-2 bg-transparent border-green-600 text-green-600"
                                                : order.order_status === "Rejected"
                                                ? "border-2 bg-transparent border-red-600 text-red-600"
                                                : order.order_status === "Draft"
                                                ? "border-2 bg-transparent border-gray-600 text-gray-600"
                                                : ""
                                        }`}
                                    >
                                        {order.order_status}
                                    </label>
                                    )}
                                </td>
                                {/* <td>To be developed using HISTORY table......</td> */}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    ) : (
        <div className='border p-2'>
            <div className='m-1'>
                <label className='text-xl'>No purchase orders corresponding to this supplier.</label>
            </div>
            <button className="btn btn-primary m-1" onClick={() => navigate(`/EmpirePMS/order/create`)}>
                <div className='flex items-center'>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 mr-1">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                    <label>NEW PURCHASE ORDER</label>
                </div>
            </button>
        </div>
    );
    
    const archiveModal = (
        <Modal show={showModal} onHide={() => setShowModal(false)}>
            <Modal.Header closeButton>
                <Modal.Title>
                    { supplierState && supplierState.supplier_isarchived ? `Confirm Unarchive` : `Confirm Archive`}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                { supplierState && supplierState.supplier_isarchived ? `Are you sure you want to unarchive this supplier?` : `Are you sure you want to archive this supplier?`}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowModal(false)}>
                    Cancel
                </Button>
                <Button className="bg-red-600 hover:bg-red-600" variant="primary" onClick={handleArchive}>
                    { supplierState && supplierState.supplier_isarchived ? `Unarchive` : `Archive`}
                </Button>
            </Modal.Footer>
        </Modal>
    )

    const supplierDetails = supplierState ? (
        <div className="card-body border-1 relative text-xs sm:text-base">
            <div className="absolute right-3">
                <Dropdown>
                    {localUser.employee_roles === "Admin" && 
                    <Dropdown.Toggle variant="success" id="dropdown-basic">
                        ACTIONS
                    </Dropdown.Toggle>}
                    <Dropdown.Menu>
                        <Dropdown.Item onClick={handleEditSupplierClick}>
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
                                <label>{ supplierState.supplier_isarchived ? `UNARCHIVE` : `ARCHIVE`}</label>
                            </div>
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </div>
            <div className="row">
                <div className="col-md-6 mb-0 sm:mb-3">
                    <label className="form-label fw-bold">Name:</label>
                    <p className="form-label">{supplierState.supplier_name}</p>
                </div>
                <div className="col-md-6 mb-0 sm:mb-3">
                    <label className="form-label fw-bold">Address:</label>
                    <p className="form-label">{supplierState.supplier_address}</p>
                </div>
                <div className="col-md-6 mb-0 sm:mb-3">
                    <label className="form-label fw-bold">Payment Term:</label>
                    <p className="form-label">{supplierState.supplier_payment_term}</p>
                </div>
                <div className="col-md-6 mb-0 sm:mb-3">
                    <label className="form-label fw-bold">Payment Term Description:</label>
                    <p className="form-label">{supplierState?.supplier_term_description || 'None'}</p>
                </div>
                <div className="col-md-6 mb-0 sm:mb-3">
                    <label className="form-label fw-bold">Payment Method:</label>
                    <p className="form-label">{supplierState.supplier_payment_method_details}</p>
                </div>
                <div className="col-md-6 mb-0 sm:mb-3">
                    <label className="form-label fw-bold">Supplier Type:</label>
                    <p className="form-label">{supplierState.supplier_type}</p>
                </div>
                <div className="col-md-6 mb-0 sm:mb-3">
                    <label className="form-label fw-bold">Supplier Material Type:</label>
                    <p className="form-label">{supplierState.supplier_material_types}</p>
                </div>
                <div className="col-md-6 mb-0 sm:mb-3">
                    <label className="form-label fw-bold">Status:</label>
                    {supplierState.supplier_isarchived ? 
                        (<label className="text-base sm:text-lg font-bold m-1 p-2 rounded-xl text-red-500">Archived</label>) : 
                        (<label className="text-base sm:text-lg font-bold m-1 p-2 rounded-xl text-green-600">Active</label>)
                    }
                </div>
                
                <div>
                    <h2 className='font-bold text-sm sm:text-xl m-1'>Supplier Contacts</h2>
                    <div className='overflow-x-auto'>
                        <table className="table table-bordered">
                            <thead className="thead-dark">
                                <tr className="table-primary">
                                    <th scope="col" className="hidden sm:table-cell">ID</th>
                                    <th scope="col">Name</th>
                                    <th scope="col">Phone</th>
                                    <th scope="col">Email</th>
                                </tr>
                            </thead>
                            <tbody>
                                {supplierState.supplier_contacts && supplierState.supplier_contacts.map((supplier,index) => (
                                    <tr key={index}>
                                        <th scope="row" className="hidden sm:table-cell">{index + 1}</th>
                                        <td>{`${supplier.is_primary ? `*` : ``} ${supplier.name}`}</td>
                                        <td>{supplier.phone}</td>
                                        <td>{supplier.email}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    ): (
        <div className='border'>Supplier API fetched successfully, but it might be empty...</div>
    );

    // Display DOM
    if (isLoadingState) { return (<EmployeeDetailsSkeleton />); }

    if (errorState) {
        if(errorState.includes("Session expired") || errorState.includes("jwt expired") || errorState.includes("jwt malformed")){
            return(<div><SessionExpired /></div>)
        }
        return (<div>Error: {errorState}</div>);
    }

    return (
        localUser && Object.keys(localUser).length > 0 ? (
        <div className="container mt-5">
            <div className="card">
                <div className="card-header bg-dark text-white flex justify-between items-center">
                    <h1 className='mx-auto uppercase font-bold text-base sm:text-xl'>Supplier: {supplierState?.supplier_name}</h1>
                </div>
                <div className="card-body">
                    <div>
                        <button className={`${currentTab === 'supplierDetails' ? 'border-x-2 border-t-2 p-1 sm:p-2 rounded bg-gray-700 text-white text-xs sm:text-base' : 'border-x-2 border-t-2 p-1 sm:p-2 rounded bg-transparent text-black hover:scale-90 transition ease-out duration-50 text-xs sm:text-base'}`}  onClick={() => setCurrentTab('supplierDetails')}>Details</button>
                        <button className={`${currentTab === 'supplierProductsTable' ? 'border-x-2 border-t-2 p-1 sm:p-2 rounded bg-gray-700 text-white text-xs sm:text-base' : 'border-x-2 border-t-2 p-1 sm:p-2 rounded bg-transparent text-black hover:scale-90 transition ease-out duration-50 text-xs sm:text-base'}`}  onClick={() => setCurrentTab('supplierProductsTable')}>Products</button>
                        <button className={`${currentTab === 'supplierPurchaseOrdersTable' ? 'border-x-2 border-t-2 p-1 sm:p-2 rounded bg-gray-700 text-white text-xs sm:text-base' : 'border-x-2 border-t-2 p-1 sm:p-2 rounded bg-transparent text-black hover:scale-90 transition ease-out duration-50 text-xs sm:text-base'}`}  onClick={() => {setCurrentTab('supplierPurchaseOrdersTable'); fetchOrdersBySupplier();}}>Purchase Orders</button>
                        <button className={`${currentTab === 'supplierProjectsTable' ? 'border-x-2 border-t-2 p-1 sm:p-2 rounded bg-gray-700 text-white text-xs sm:text-base' : 'border-x-2 border-t-2 p-1 sm:p-2 rounded bg-transparent text-black hover:scale-90 transition ease-out duration-50 text-xs sm:text-base'}`}  onClick={() => setCurrentTab('supplierProjectsTable')}>Projects</button>
                    </div>
                    {/* SWITCH BETWEEN COMPONENTS HERE */}
                    {currentTab === 'supplierDetails' && supplierDetails}
                    {currentTab === 'supplierProductsTable' && supplierProductsTable}
                    {currentTab === 'supplierPurchaseOrdersTable' && supplierPurchaseOrdersTable}
                    {currentTab === 'supplierProjectsTable' && supplierProjectsTable}

                    
                    {isAddProjectListVisible && addProjectsPopUp}
                    {isRemoveProjectListVisible && removeProjectPopUp}

                </div>
            </div>
            { archiveModal }
        </div> ) : ( <UnauthenticatedSkeleton /> )
    );
}

export default SupplierDetails;