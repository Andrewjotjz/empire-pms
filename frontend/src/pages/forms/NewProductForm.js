// Import modules
import { useEffect, useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
 
import { useAddProduct } from '../../hooks/useAddProduct'; 
import { useFetchAliasesByProductType } from '../../hooks/useFetchAliasesByProductType'
import { clearAliases } from '../../redux/aliasSlice';
import { setProjectState } from '../../redux/projectSlice';
import EmployeePageSkeleton from "../../pages/loaders/EmployeePageSkeleton"
import EmployeeDetailsSkeleton from "../loaders/EmployeeDetailsSkeleton";
import SessionExpired from '../../components/SessionExpired';
import UnauthenticatedSkeleton from "../loaders/UnauthenticateSkeleton";

const NewProductForm = () => {
    // Component router
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams();
    const { supplierId = null, supplierName = '' } = location.state || {};


    // Component hook
    const dispatch = useDispatch();
    const { fetchAliasesByProductType, productTypeIsLoadingState, productTypeErrorState } = useFetchAliasesByProductType();
    const { addProduct, productIsLoadingState, productErrorState } = useAddProduct();

    // Component state
    const aliasState = useSelector((state) => state.aliasReducer.aliasState)
    const projectState = useSelector((state) => state.projectReducer.projectState)
    const [isLoadingState, setIsLoadingState] = useState(true);
    const [errorState, setErrorState] = useState(null);
    const [aliasFieldToggle, setAliasFieldToggle] = useState(true);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isInputCustomOpen, setIsInputCustomOpen] = useState(false);
    const [productDetailsState, setProductDetailsState] = useState({
        product_sku: '',
        product_name: '',
        product_type: '',
        product_actual_size: 0,
        product_actual_rate: 0,
        product_next_available_stock_date: '',
        product_isarchived: false,
        supplier: supplierId || id,
        alias: '',
        product_unit_a: '',
        product_number_a: 1,
        product_price_unit_a: '',
        product_unit_b: '',
        product_number_b: '',
        product_price_unit_b: '',
        price_fixed: false,
        product_effective_date: '',
        projects: []

    });
    const [productTypeState, setProductTypeState] = useState([]);

    // Component functions and variables
    const localUser = JSON.parse(localStorage.getItem('localUser'))

    const handleBackClick = () => {
        const idToUse = supplierId || id; // Use `id` if `supplierId` is null or undefined
        navigate(`/EmpirePMS/supplier/${idToUse}`, { state: idToUse });
      };      

    const handleInputCustomToggle = () => {
        setIsInputCustomOpen(!isInputCustomOpen)
        setProductDetailsState((prevState) => ({
            ...prevState,
            alias: ''
        }))
    }

    const handleProductInputChange = (event) => {
        const { name, value } = event.target;
        if (name === 'product_type'){
            if (value !== ''){
                fetchAliasesByProductType(value)
                setAliasFieldToggle(false);
            }
            else {
                dispatch(clearAliases());
                setAliasFieldToggle(true);
            }
        }
        setProductDetailsState((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleCheckboxChange = (event) => {
        const { value, checked } = event.target;
        setProductDetailsState((prevState) => {
            const updatedProjects = checked
                ? [...prevState.projects, value]
                : prevState.projects.filter(projectId => projectId !== value);
            return { ...prevState, projects: updatedProjects };
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!productDetailsState.projects.length > 0){
            alert(`You must select one or more projects that this new product applies to`)
            return;
        }
        const idToUse = supplierId || id; // Use `id` if `supplierId` is null or undefined

        addProduct(productDetailsState, idToUse);
        navigate(`/EmpirePMS/supplier/${idToUse}`);
    };
    
    //Render component
    useEffect(() => {
        const abortController = new AbortController();
        const signal = abortController.signal;

        const fetchProjects = async () => {
            setIsLoadingState(true); // Set loading state to true at the beginning
            try {
                const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/project`, { signal , credentials: 'include',
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
                dispatch(setProjectState(data));
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

        fetchProjects();

        return () => {
            abortController.abort(); // Cleanup
        };
    }, [dispatch]);

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


    // Display DOM
    if (productTypeIsLoadingState || productIsLoadingState) {
        return <EmployeeDetailsSkeleton />;
    }

    if (productTypeErrorState || productErrorState ) {
        if (productErrorState.includes("Session expired") || productErrorState.includes("jwt expired") || errorState.includes("jwt malformed")) {
            return <div><SessionExpired /></div>;
        }
        return <div>Error: {productErrorState || productTypeErrorState}</div>;
    }

    if (isLoadingState) { return (<EmployeePageSkeleton />); }

    if (errorState) {
        if(errorState.includes("Session expired") || errorState.includes("jwt expired") || errorState.includes("jwt malformed")){
            return(<div><SessionExpired /></div>)
        }
        return (<div>Error: {errorState}</div>);
    }

    return (
        localUser && Object.keys(localUser).length > 0 ? (
        <div className="container mt-2 sm:mt-5"> 
            <div className="card">
                <div className="card-header bg-dark text-white flex justify-between items-center">
                    <button onClick={handleBackClick}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-7 w-12 border-transparent bg-gray-700 rounded-md p-1 hover:bg-gray-500 hover:scale-95 ease-out duration-300">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m18.75 4.5-7.5 7.5 7.5 7.5m-6-15L5.25 12l7.5 7.5"/>
                        </svg>
                    </button>
                    <h1 className='mx-auto uppercase font-bold text-base'>{supplierName}: NEW PRODUCT</h1>
                </div>
                <form className="card-body text-xs sm:text-base" onSubmit={handleSubmit}>
                    <div className="row">
                        {/* PRODUCT TABLE */}
                        <div className="col-md-6 mb-0 sm:mb-3">
                            <label className="form-label font-bold text-xs sm:text-base mb-1 sm:mb-2">*Product SKU:</label>
                            <input 
                                type='text'
                                className="form-control text-xs sm:text-base" 
                                name="product_sku" 
                                value={productDetailsState.product_sku} 
                                onChange={handleProductInputChange}
                                required
                                onInvalid={(e) => e.target.setCustomValidity('Enter SKU')}
                                onInput={(e) => e.target.setCustomValidity('')}
                            />
                            <label className='hidden sm:inline-block text-xs italic text-gray-400'>Ex: 13RE1236</label>
                        </div>
                        <div className="col-md-6 mb-0 sm:mb-3">
                            <label className="form-label font-bold text-xs sm:text-base mb-1 sm:mb-2">*Name:</label>
                            <input 
                                type='text'
                                className="form-control text-xs sm:text-base" 
                                name="product_name" 
                                value={productDetailsState.product_name} 
                                onChange={handleProductInputChange}
                                required
                                onInvalid={(e) => e.target.setCustomValidity('Enter product name')}
                                onInput={(e) => e.target.setCustomValidity('')}
                            />
                            <label className='hidden sm:inline-block text-xs italic text-gray-400'>Ex: 16mm SHEETROCK 1200mm x 3600mm</label>
                        </div>
                        <div className="col-md-6 mb-0 sm:mb-3">
                            <label className="form-label font-bold text-xs sm:text-base mb-1 sm:mb-2">*Type:</label>
                            <select 
                                className="form-control text-xs sm:text-base shadow-sm cursor-pointer"
                                name="product_type" 
                                value={productDetailsState.product_type} 
                                onChange={handleProductInputChange}
                                required
                            >
                                <option value="">Select Product Type</option>
                                {productTypeState.filter(type => !type.type_isarchived).map(type => (
                                    <>
                                    <option value={type._id}>{type.type_name}</option>
                                    </>
                                ))}
                            </select>
                            <label className='hidden sm:inline-block text-xs italic text-gray-400'>Alias is based on the product type you select</label>
                        </div>
                        

                        {/***************************** ALIAS TABLE *************************/}
                        <div className="col-md-6 mb-0 sm:mb-3">
                            <label className="form-label font-bold text-xs sm:text-base mb-1 sm:mb-2">*Alias:</label>
                            { !isInputCustomOpen && <div>
                                <select 
                                    className="form-control text-xs sm:text-base shadow-sm cursor-pointer"
                                    name="alias"
                                    onChange={handleProductInputChange}
                                    disabled={aliasFieldToggle}
                                    required
                                >
                                    <option value="">Select Alias</option>
                                    {aliasState && aliasState.length > 0 && 
                                        Array.from(new Set(aliasState.map(product => product.alias ? product.alias._id : null)))
                                            .filter(aliasId => aliasId !== null)
                                            .map((aliasId, index) => {
                                                const alias = aliasState.find(product => product.alias && product.alias._id === aliasId).alias;
                                                return <option key={index} value={aliasId}>{alias.alias_name}</option>;
                                            })
                                    }
                                </select>
                                <label className='text-xs italic text-gray-400'>Set alias to ('na') if not available or create custom alias <span className="text-blue-600 size-5 cursor-pointer underline" onClick={handleInputCustomToggle}>here</span></label>
                            </div>}
                            { isInputCustomOpen && <div>
                                <input 
                                    type='text'
                                    className="form-control text-xs sm:text-base placeholder-gray-400 placeholder-opacity-50" 
                                    name="alias" 
                                    value={productDetailsState.alias} 
                                    placeholder='custom alias...'
                                    onChange={handleProductInputChange}
                                    onInvalid={(e) => e.target.setCustomValidity('Enter a new custom alias')}
                                    onInput={(e) => e.target.setCustomValidity('')}
                                />
                                <label className='text-xs italic text-gray-400'>Don't want to create custom alias? <span className="text-blue-600 size-5 cursor-pointer underline" onClick={handleInputCustomToggle}>Cancel</span></label>
                            </div>}
                        </div>
                        {/***************************** ALIAS TABLE END *************************/}

                        {/* ********************************************* PRODUCT PRICE TABLE *********************************************** */}
                        <div className='grid grid-cols-1 sm:grid-cols-3 gap-x-1 sm:gap-x-10 gap-y-1 sm:gap-y-4 border-4 rounded p-1 sm:p-3 mb-0 sm:mb-1'>
                            <div className='border-2 rounded p-2'>
                                <div className="mb-0 sm:mb-3">
                                    <label className="form-label font-bold text-xs sm:text-base mb-1 sm:mb-2">*Number-A:</label>
                                    <input 
                                        type='number'
                                        className="form-control text-xs sm:text-base" 
                                        name="product_number_a" 
                                        value={productDetailsState.product_number_a} 
                                        onChange={handleProductInputChange}
                                        min={1}
                                        step="0.001"  // Allows input with up to three decimal places
                                        pattern="^\d+(\.\d{1,3})?$"  // Allows up to two decimal places
                                        required
                                        onInvalid={(e) => e.target.setCustomValidity('Enter number-A')}
                                        onInput={(e) => e.target.setCustomValidity('')}
                                    />
                                </div>
                                <div className="mb-0 sm:mb-3">
                                    <label className="form-label font-bold text-xs sm:text-base mb-1 sm:mb-2">*Unit-A:</label>
                                    <input 
                                        type='text'
                                        className="form-control text-xs sm:text-base" 
                                        name="product_unit_a" 
                                        value={productDetailsState.product_unit_a} 
                                        onChange={handleProductInputChange}
                                        required
                                        onInvalid={(e) => e.target.setCustomValidity('Enter unit-A')}
                                        onInput={(e) => e.target.setCustomValidity('')}
                                    />
                                    <label className='hidden sm:inline-block text-xs italic text-gray-400'>Ex: Box, Pack, Carton</label>
                                </div>
                                <div className="mb-0 sm:mb-3">
                                    <label className="form-label font-bold text-xs sm:text-base mb-1 sm:mb-2">*Unit-A Price:</label>
                                    <div className='flex items-center border rounded'>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 ml-2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                        </svg>
                                        <input 
                                            type='number'
                                            className="form-control text-xs sm:text-base flex-1 pl-2 border-0" 
                                            name="product_price_unit_a" 
                                            value={productDetailsState.product_price_unit_a} 
                                            onChange={handleProductInputChange}
                                            step="0.001"  // Allows input with up to three decimal places
                                            min={1}
                                            required
                                            onInvalid={(e) => e.target.setCustomValidity('Enter unit-A price')}
                                            onInput={(e) => e.target.setCustomValidity('')}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className='border-2 rounded p-2'>
                                <div className="mb-0 sm:mb-3">
                                    <label className="form-label font-bold text-xs sm:text-base mb-1 sm:mb-2">*Number-B:</label>
                                    <input 
                                        type='number'
                                        className="form-control text-xs sm:text-base" 
                                        name="product_number_b" 
                                        value={productDetailsState.product_number_b} 
                                        onChange={handleProductInputChange}
                                        step="0.001"  // Allows input with up to three decimal places
                                        pattern="^\d+(\.\d{1,3})?$"  // Allows up to two decimal places
                                        min={1}
                                        required
                                        onInvalid={(e) => e.target.setCustomValidity('Enter number-B')}
                                        onInput={(e) => e.target.setCustomValidity('')}
                                    />
                                </div>
                                <div className="mb-0 sm:mb-3">
                                    <label className="form-label font-bold text-xs sm:text-base mb-1 sm:mb-2">*Unit-B:</label>
                                    <input 
                                        type='text'
                                        className="form-control text-xs sm:text-base" 
                                        name="product_unit_b" 
                                        value={productDetailsState.product_unit_b} 
                                        onChange={handleProductInputChange}
                                        required
                                        onInvalid={(e) => e.target.setCustomValidity('Enter unit-B')}
                                        onInput={(e) => e.target.setCustomValidity('')}
                                    />
                                    <label className='hidden sm:inline-block text-xs italic text-gray-400'>Ex: units, length, each, sheet</label>
                                </div>
                                <div className="mb-0 sm:mb-3">
                                    <label className="form-label font-bold text-xs sm:text-base mb-1 sm:mb-2">*Unit-B Price:</label>
                                    <div className='flex items-center border rounded'>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 ml-2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                        </svg>
                                        <input 
                                            type='number'
                                            className="form-control text-xs sm:text-base flex-1 pl-2 border-0" 
                                            name="product_price_unit_b" 
                                            value={productDetailsState.product_price_unit_b} 
                                            onChange={handleProductInputChange}
                                            step="0.001"  // Allows input with up to three decimal places
                                            min={1}
                                            required
                                            onInvalid={(e) => e.target.setCustomValidity('Enter unit-B price')}
                                            onInput={(e) => e.target.setCustomValidity('')}
                                        />
                                    </div>
                                </div>
                            </div>
                            {/* ***** PROJECT DROPDOWN START ****** */}
                            <div className="mb-0 sm:mb-3">
                                <label className="block font-bold mb-2">*Project:</label>
                                <div>
                                    <button
                                        type="button"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-left focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    >
                                        {productDetailsState.projects.length > 0 ? `x${productDetailsState.projects.length} Projects Selected` : `Select Projects`}
                                    </button>
                                    {isDropdownOpen && (
                                        <div className="relative z-10 mt-2 w-full bg-white border border-gray-300 rounded-md shadow-md max-h-60 overflow-auto" onMouseLeave={() => setIsDropdownOpen(false)}>
                                            <ul className="py-1">
                                                {projectState && projectState.length > 0 && projectState.map((project, index) => (
                                                    <li key={index} className="flex items-center px-4 py-2 hover:bg-gray-100">
                                                        <input
                                                            type="checkbox"
                                                            id={`project-${project._id}`}
                                                            value={project._id}
                                                            checked={productDetailsState.projects.includes(project._id)}
                                                            onChange={handleCheckboxChange}
                                                            className="mr-2"
                                                            required
                                                            onInvalid={(e) => e.target.setCustomValidity('You must select one or more project applied to this product')}
                                                            onInput={(e) => e.target.setCustomValidity('')}
                                                        />
                                                        <label htmlFor={`project-${project._id}`} className="text-gray-900">{project.project_name}</label>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                                <p className='hidden sm:inline-block text-xs italic text-gray-400 mt-2'>Select one or more projects that this new product price applies to</p>
                            </div>
                            {/* ***** PRICE FIXED? START ****** */}
                            <div>
                                <label className="form-label font-bold text-xs sm:text-base mb-1 sm:mb-2">*Price effective date:</label>
                                <input 
                                    type='date'
                                    className="form-control text-xs sm:text-base" 
                                    name="product_effective_date" 
                                    value={productDetailsState.product_effective_date}
                                    onChange={handleProductInputChange}
                                    required
                                />
                            </div>
                            <div>
                                <label className="form-label font-bold text-xs sm:text-base mb-1 sm:mb-2">Price fixed(?):</label>
                                <input 
                                        type="checkbox"
                                        className="form-check-input m-1" 
                                        name="price_fixed" 
                                        checked={productDetailsState.price_fixed} 
                                        onChange={(e) => handleProductInputChange({ target: { name: 'price_fixed', value: e.target.checked }})}
                                    />
                            </div>
                        </div>
                        {/* ********************************************* PRODUCT PRICE END *********************************************** */}
                        <div>
                            <div className="col-md-6 mb-0 sm:mb-3">
                                <label className="form-label font-bold text-xs sm:text-base mb-1 sm:mb-2">*Actual M<span className='text-xs align-top'>2</span>/M:</label>
                                <input 
                                    type='number'
                                    className="form-control text-xs sm:text-base" 
                                    name="product_actual_size" 
                                    value={productDetailsState.product_actual_size} 
                                    onChange={handleProductInputChange}
                                    step="0.001"  // Allows input with up to three decimal places
                                    pattern="^\d+(\.\d{1,3})?$"  // Allows up to two decimal places
                                    min={1}
                                    required
                                />
                            </div>
                            <div className="col-md-6 mb-0 sm:mb-3">
                                <label className="form-label font-bold text-xs sm:text-base mb-1 sm:mb-2">*Actual Rate:</label>
                                <input 
                                    type='number'
                                    className="form-control text-xs sm:text-base" 
                                    name="product_actual_rate" 
                                    value={productDetailsState.product_actual_rate} 
                                    onChange={handleProductInputChange}
                                    step="0.001"  // Allows input with up to three decimal places
                                    pattern="^\d+(\.\d{1,3})?$"  // Allows up to two decimal places
                                    min={1}
                                    required
                                />
                            </div>

                            <div className="col-md-6 mb-0 sm:mb-3">
                                <label className="form-label font-bold text-xs sm:text-base mb-1 sm:mb-2">Next available stock date:</label>
                                <input 
                                    type='date'
                                    className="form-control text-xs sm:text-base" 
                                    name="product_next_available_stock_date" 
                                    value={productDetailsState.product_next_available_stock_date}
                                    onChange={handleProductInputChange}
                                />
                            </div>
                        </div>

                        {/* ******************************************* END OF FORM ********************************************************** */}
                        <div className="d-flex justify-content-between mb-0 sm:mb-3 mt-2 sm:mt-0">
                            <button type="button" onClick={handleBackClick} className="btn btn-secondary text-xs sm:text-base">CANCEL</button>
                            <button className="btn btn-primary text-xs sm:text-base" type="submit">ADD TO SUPPLIER</button>
                        </div>
                    </div>
                </form>
            </div>
        </div> ) : ( <UnauthenticatedSkeleton /> )
    );
};

export default NewProductForm;