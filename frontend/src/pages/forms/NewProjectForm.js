// Import modules
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useAddProject } from '../../hooks/useAddProject'; 
import SessionExpired from '../../components/SessionExpired';
import EmployeeDetailsSkeleton from "../loaders/EmployeeDetailsSkeleton";
import { setSupplierState } from '../../redux/supplierSlice';

const NewProjectForm = () => {
    // Component router
    const navigate = useNavigate();

    // Component hook
    const { addProject, isAddProjectLoadingState, addProjectErrorState } = useAddProject();
    const dispatch = useDispatch();

    // Component state
    const supplierState = useSelector((state) => state.supplierReducer.supplierState)
    const [isLoadingState, setIsLoadingState] = useState(true);
    const [errorState, setErrorState] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [projectState, setProjectState] = useState({
        project_name: '',
        project_address: '',
        suppliers: []
    });

    // Component functions and variables
    const handleCheckboxChange = (event) => {
        const { value, checked } = event.target;
        setProjectState((prevState) => {
            const updatedSuppliers = checked
                ? [...prevState.suppliers, value]
                : prevState.suppliers.filter(supplierId => supplierId !== value);
            return { ...prevState, suppliers: updatedSuppliers };
        });
    };

    const handleBackClick = () => navigate(`/EmpirePMS/project/`);

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setProjectState((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        addProject(projectState);
    };

    useEffect(() => {
        const abortController = new AbortController();
        const signal = abortController.signal;

        const fetchSuppliers = async () => {
            setIsLoadingState(true); // Set loading state to true at the beginning
            try {
                const res = await fetch('/api/supplier', { signal });
                if (!res.ok) {
                    throw new Error('Failed to fetch');
                }
                const data = await res.json();

                if (data.tokenError) {
                    throw new Error(data.tokenError);
                }
                
                setIsLoadingState(false);
                dispatch(setSupplierState(data));
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

        fetchSuppliers();

        return () => {
            abortController.abort(); // Cleanup
        };
    }, [dispatch]);

    // Display DOM
    if (isLoadingState || isAddProjectLoadingState ) {
        return <EmployeeDetailsSkeleton />;
    }

    if (errorState || addProjectErrorState) {
        if (errorState.includes("Session expired") || errorState.includes("jwt expired")) {
            return <div><SessionExpired /></div>;
        }
        return <div>Error: {errorState} {addProjectErrorState}</div>;
    }

    return (
        <div className="container mt-5"> 
            <div className="card">
                <div className="card-header bg-dark text-white">
                    <h1>NEW PROJECT</h1>
                </div>
                <form className="card-body" onSubmit={handleSubmit}>
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label className="form-label font-bold">*Project name:</label>
                            <input 
                                type='text'
                                className="form-control" 
                                name="project_name" 
                                value={projectState.project_name} 
                                onChange={handleInputChange}
                                required
                                onInvalid={(e) => e.target.setCustomValidity('You must enter project name')}
                                onInput={(e) => e.target.setCustomValidity('')}
                            />
                        </div>
                        <div className="col-md-6 mb-3">
                            <label className="form-label font-bold">*Address:</label>
                            <input 
                                type='text'
                                className="form-control" 
                                name="project_address" 
                                value={projectState.project_address} 
                                onChange={handleInputChange} 
                                required
                                onInvalid={(e) => e.target.setCustomValidity('Enter project address')}
                                onInput={(e) => e.target.setCustomValidity('')}
                            />
                        </div>
                        {/* ****************************************************************************************************** */}
                        <div className="col-md-6 mb-3">
                            <label className="block font-bold mb-2">Supplier:</label>
                            <div>
                                <button
                                    type="button"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-left focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                >
                                    {projectState.suppliers.length > 0 ? `x${projectState.suppliers.length} Supplier(s) Selected` : `Select Supplier`}
                                </button>
                                {isDropdownOpen && (
                                    <div className="relative z-10 mt-2 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                                        <ul className="py-1">
                                            {supplierState && supplierState.length > 0 && supplierState.filter(supplier => supplier.supplier_isarchived === false).map((supplier, index) => (
                                                <li key={index} className="flex items-center px-4 py-2 hover:bg-gray-100">
                                                    <input
                                                        type="checkbox"
                                                        id={`supplier-${supplier._id}`}
                                                        value={supplier._id}
                                                        checked={projectState.suppliers.includes(supplier._id)}
                                                        onChange={handleCheckboxChange}
                                                        className="mr-2"
                                                    />
                                                    <label htmlFor={`supplier-${supplier._id}`} className="text-gray-900">{supplier.supplier_name}</label>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                            <p className='text-xs italic text-gray-400 mt-2'>Assign one or more suppliers to this new project</p>
                        </div>
                            {/* ****************************************************************************************************** */}
                        <div className="d-flex justify-content-between mb-3">
                            <button type="button" onClick={handleBackClick} className="btn btn-secondary">CANCEL</button>
                            <button className="btn btn-primary" type="submit">ADD TO COMPANY</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewProjectForm;
