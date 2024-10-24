// Import modules
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useAddProductPrice } from '../../hooks/useAddProductPrice'; 
import { useUpdateProduct } from '../../hooks/useUpdateProduct'; 
import { useFetchAliasesByProductType } from '../../hooks/useFetchAliasesByProductType'
import { setProjectState } from '../../redux/projectSlice';
import { setProductState } from '../../redux/productSlice';
import { setProductPrice } from '../../redux/productPriceSlice';
import EmployeePageSkeleton from "../../pages/loaders/EmployeePageSkeleton"
import EmployeeDetailsSkeleton from "../loaders/EmployeeDetailsSkeleton";
import SessionExpired from '../../components/SessionExpired';

const UpdateProductForm = () => {
    // Component router
    const navigate = useNavigate();
    const location = useLocation();
    const productId = location.state;

    // Component hook
    const dispatch = useDispatch();
    const { fetchAliasesByProductType, productTypeIsLoadingState, productTypeErrorState } = useFetchAliasesByProductType();
    const { updateProduct, productUpdateIsLoadingState, productUpdateErrorState } = useUpdateProduct();
    const { addPrice, isAddPriceLoadingState, addPriceErrorState } = useAddProductPrice();

    // Component state
    const aliasState = useSelector((state) => state.aliasReducer.aliasState)
    const projectState = useSelector((state) => state.projectReducer.projectState)
    const productState = useSelector((state) => state.productReducer.productState)
    const productPriceState = useSelector((state) => state.productPriceReducer.productPriceState)
    const [isLoadingState, setIsLoadingState] = useState(true);
    const [errorState, setErrorState] = useState(null);
    const [isDisabled, setIsDisabled] = useState(true);
    const [isProductPriceDisabled, setIsProductPriceDisabled] = useState(true);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isDropdownOpenNewPrice, setIsDropdownOpenNewPrice] = useState(false);
    const [isEditAlias, setIsEditAlias] = useState(false);
    const [isChangeAlias, setIsChangeAlias] = useState(false);
    const [isShowNewPriceForm, setIsShowNewPriceForm] = useState(false);
    const [defaultProductType, setDefaultProductType] = useState('');
    const [defaultAlias, setDefaultAlias] = useState('');
    const [defaultProductPrice, setDefaultProductPrice] = useState({})
    const [newProductPriceState, setNewProductPriceState] = useState({
        product_obj_ref: productId,
        product_unit_a: '',
        product_number_a: '',
        product_price_unit_a: '',
        product_unit_b: '',
        product_number_b: '',
        product_price_unit_b: '',
        price_fixed: false,
        product_effective_date: '',
        projects: []
    })
    // Component functions and variables
    const handleBackClick = () => navigate(-1);

    const handleAbortNewPrice = () => {
        setIsShowNewPriceForm(!isShowNewPriceForm)
        setNewProductPriceState({
            product_obj_ref: productId,
            product_unit_a: '',
            product_number_a: '',
            product_price_unit_a: '',
            product_unit_b: '',
            product_number_b: '',
            product_price_unit_b: '',
            price_fixed: false,
            product_effective_date: '',
            projects: []
        })
    }

    const handleCreateNewPrice = () => {
        setIsShowNewPriceForm(!isShowNewPriceForm)
        if (Object.values(defaultProductPrice).length === 0) {
            setDefaultProductPrice(productPriceState)
        }
    }

    const handleEditProductPrice = () => {
        setIsProductPriceDisabled(!isProductPriceDisabled)
        if (Object.values(defaultProductPrice).length === 0) {
            setDefaultProductPrice(productPriceState)
        }
    }

    const handleEditAlias = () => {
        if (defaultAlias === '') {
            setDefaultAlias(productState.alias_name)
        }
        if (!isEditAlias) {
            setIsEditAlias(true); 
        }
        else {
            setIsEditAlias(false); 
            dispatch(setProductState({...productState, alias_name: defaultAlias}));
        }
    }

    const changeAlias = () => {
        setIsChangeAlias(!isChangeAlias)
        if (defaultProductType === '') {
            setDefaultProductType(productState.product_types)
            setDefaultAlias(productState.alias_name)
            fetchAliasesByProductType(productState.product_types)
            setIsDisabled(false);
        }
        else {
            fetchAliasesByProductType(defaultProductType)
        }
        dispatch(setProductState({...productState, product_types: defaultProductType, alias_name: defaultAlias}))
        setIsDisabled(false);
    }

    const handleNewPriceInputChange = (event) => {
        const { name, value } = event.target;
        
        setNewProductPriceState((prevState) => ({
            ...prevState,
            [name]: value
        }))
    };

    const handleProductInputChange = (event) => {
        const { name, value } = event.target;
        if (name === 'product_types'){
            if (value !== ''){
                fetchAliasesByProductType(value)
            }
        }
        dispatch(setProductState({
            ...productState,
            [name]: value,
        }));
    };

    const handlePriceInputChange = (event) => {
        const { name, value } = event.target;
        
        dispatch(setProductPrice({
            ...productPriceState,
            [name]: value,
        }));
    };

    const handleCheckboxChange = (event) => {
        const { value, checked } = event.target;
        let updatedProjects;
        if (checked) {
            updatedProjects = [...productPriceState.projects, value];
        } else {
            updatedProjects = productPriceState.projects.filter(projectId => projectId !== value);
        }
        dispatch(setProductPrice({...productPriceState, projects: updatedProjects}));
    };

    const handleCheckboxChangeNewPrice = (event) => {
        const { value, checked } = event.target;
        setNewProductPriceState((prevState) => {
            const updatedProjects = checked
                ? [...prevState.projects, value]
                : prevState.projects.filter(projectId => projectId !== value);
            return { ...prevState, projects: updatedProjects };
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!productPriceState.projects.length > 0){
            // push toast to notify successful creation
            toast.error(`You must select one or more projects that this new product applies to`, {
                position: "bottom-right"
            });
            return;
        }
        if (!newProductPriceState.projects.length > 0 && isShowNewPriceForm === true){
            // push toast to notify successful creation
            toast.error(`You must select one or more projects that this new product applies to`, {
                position: "bottom-right"
            });
            return;
        }

        if (newProductPriceState.product_number_a !== '' && isShowNewPriceForm === true) {
            addPrice(newProductPriceState);
        }

        updateProduct(productState, productPriceState, productId, productPriceState._id);
    };
    

    //Render component
    useEffect(() => {
        const abortController = new AbortController();
        const signal = abortController.signal;

        const fetchProjects = async () => {
            setIsLoadingState(true); // Set loading state to true at the beginning
            try {
                const res = await fetch('https://empire-pms.onrender.com/api/project', { signal });
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

    // Display DOM
    if (productTypeIsLoadingState || productUpdateIsLoadingState || isAddPriceLoadingState) {
        return <EmployeeDetailsSkeleton />;
    }

    if (productTypeErrorState || productUpdateErrorState || addPriceErrorState) {
        if (productUpdateErrorState.includes("Session expired") || productUpdateErrorState.includes("jwt expired")) {
            return <div><SessionExpired /></div>;
        }
        return <div>Error: {productUpdateErrorState}</div>;
    }

    if (isLoadingState) { return (<EmployeePageSkeleton />); }

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
                    <h1 className='mx-auto uppercase font-bold text-base'>EDIT PRODUCT</h1>
                </div>
                <form className="card-body" onSubmit={handleSubmit}>
                    <div className="row">
                        {/* PRODUCT TABLE */}
                        <div className="col-md-6 mb-3">
                            <label className="form-label font-bold">*Product SKU:</label>
                            <input 
                                type='text'
                                className="form-control" 
                                name="product_sku" 
                                value={productState.product_sku} 
                                onChange={handleProductInputChange}
                                required
                                onInvalid={(e) => e.target.setCustomValidity('Enter SKU')}
                                onInput={(e) => e.target.setCustomValidity('')}
                            />
                            <label className='text-xs italic text-gray-400'>Ex: 13RE1236</label>
                        </div>
                        <div className="col-md-6 mb-3">
                            <label className="form-label font-bold">*Name:</label>
                            <input 
                                type='text'
                                className="form-control" 
                                name="product_name" 
                                value={productState.product_name} 
                                onChange={handleProductInputChange}
                                required
                                onInvalid={(e) => e.target.setCustomValidity('Enter product name')}
                                onInput={(e) => e.target.setCustomValidity('')}
                            />
                            <label className='text-xs italic text-gray-400'>Ex: 16mm SHEETROCK 1200mm x 3600mm</label>
                        </div>
                        <div className="col-md-6 mb-3">
                            <label className="form-label font-bold">*Type:</label>
                            <select 
                                className="form-control shadow-sm cursor-pointer"
                                name="product_types" 
                                value={productState.product_types} 
                                onChange={handleProductInputChange}
                                required
                                disabled={!isChangeAlias}
                            >                                
                                <option value="" disabled>Select Product Type</option>
                                <option value="Compound">Compound</option>
                                <option value="Access Panel">Access Panel</option>
                                <option value="Framing Ceiling">Framing Ceiling</option>
                                <option value="Framing Wall">Framing Wall</option>
                                <option value="Batt Insulation">Batt Insulation</option>
                                <option value="Rigid Insulation">Rigid Insulation</option>
                                <option value="Plasterboard">Plasterboard</option>
                                <option value="External Cladding">External Cladding</option>
                                <option value="SpeedPanel">SpeedPanel</option>
                                <option value="Timber">Timber</option>
                                <option value="Acoustic Ceiling Panels">Acoustic Ceiling Panels</option>
                                <option value="Ceiling Tiles">Ceiling Tiles</option>
                                <option value="Others">Others</option>
                                <option value="Tools">Tools</option>
                                <option value="Plastering(Fixings/Screws)">Plastering(Fixings/Screws)</option>
                                <option value="Framing Ceiling(Accessories)">Framing Ceiling(Accessories)</option>
                                <option value="Framing Wall(Accessories)">Framing Wall(Accessories)</option>
                                <option value="Rigid Insulation(Accessories)">Rigid Insulation(Accessories)</option>
                                <option value="Plasterboard(Accessories)">Plasterboard(Accessories)</option>
                                <option value="External Cladding(Accessories)">External Cladding(Accessories)</option>
                                <option value="SpeedPanel(Accessories)">SpeedPanel(Accessories)</option>
                            </select>
                            <label className='text-xs italic text-gray-400'>Alias is based on the product type you select</label>
                        </div>
                        {/***************************** ALIAS TABLE *************************/}
                        <div className="col-md-6 mb-3">
                            <label className="form-label font-bold">*Alias:</label>
                            { !isEditAlias && !isChangeAlias && <div>
                                <input 
                                    type='text'
                                    className="form-control" 
                                    name="alias_name" 
                                    value={productState.alias_name} 
                                    disabled
                                />
                                <label className='text-xs italic text-gray-400'><span className="text-blue-600 size-5 cursor-pointer underline" onClick={handleEditAlias}>Edit</span> current alias or <span className="text-blue-600 size-5 cursor-pointer underline" onClick={changeAlias}>Change</span> alias</label>
                            </div>}
                            { isEditAlias && !isChangeAlias && <div>
                                <input 
                                    type='text'
                                    className="form-control" 
                                    name="alias_name" 
                                    value={productState.alias_name}
                                    required
                                    onChange={handleProductInputChange}
                                    onInvalid={(e) => e.target.setCustomValidity('Enter alias name')}
                                    onInput={(e) => e.target.setCustomValidity('')}
                                />
                                <label className='text-xs italic text-gray-400'>Don't want to edit alias? <span className="text-blue-600 size-5 cursor-pointer underline" onClick={handleEditAlias}>Cancel</span></label>
                            </div>}
                            { isChangeAlias && !isEditAlias && <div>
                                <select 
                                    className="form-control shadow-sm cursor-pointer"
                                    name="alias"
                                    onChange={handleProductInputChange}
                                    disabled={isDisabled}
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
                                <label className='text-xs italic text-gray-400'>Don't want to change alias? <span className="text-blue-600 size-5 cursor-pointer underline" onClick={changeAlias}>Cancel</span></label>
                            </div>}
                        </div>
                        {/***************************** ALIAS TABLE END *************************/}

                        {/***************************** PRODUCT PRICE TABLE *************************/}
                                    {/* Editing Price */}
                        <div className={`grid grid-cols-3 gap-x-10 gap-y-4 border-4 rounded p-3 mb-1 ${isProductPriceDisabled ? 'opacity-40 cursor-not-allowed' : ''}`}>
                            <div className='border-2 rounded p-2'>
                                <div className="mb-3">
                                    <label className="form-label font-bold">*Number-A:</label>
                                    <input 
                                        type='number'
                                        className="form-control" 
                                        name="product_number_a" 
                                        value={productPriceState.product_number_a} 
                                        onChange={handlePriceInputChange}
                                        min={1}
                                        step="0.001"  // Allows input with up to three decimal places
                                        pattern="^\d+(\.\d{1,3})?$"  // Allows up to two decimal places
                                        required
                                        onInvalid={(e) => e.target.setCustomValidity('Enter number-A')}
                                        onInput={(e) => e.target.setCustomValidity('')}
                                        disabled={isProductPriceDisabled}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label font-bold">*Unit-A:</label>
                                    <input 
                                        type='text'
                                        className="form-control" 
                                        name="product_unit_a" 
                                        value={productPriceState.product_unit_a} 
                                        onChange={handlePriceInputChange}
                                        required
                                        onInvalid={(e) => e.target.setCustomValidity('Enter unit-A')}
                                        onInput={(e) => e.target.setCustomValidity('')}
                                        disabled={isProductPriceDisabled}
                                    />
                                    <label className='text-xs italic text-gray-400'>Ex: Box, Pack, Carton</label>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label font-bold">*Unit-A Price:</label>
                                    <div className='flex items-center border rounded'>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 ml-2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                        </svg>
                                        <input 
                                            type='number'
                                            className="form-control flex-1 pl-2 border-0" 
                                            name="product_price_unit_a" 
                                            value={productPriceState.product_price_unit_a} 
                                            onChange={handlePriceInputChange}
                                            step="0.001"  // Allows input with up to three decimal places
                                            min={1}
                                            required
                                            onInvalid={(e) => e.target.setCustomValidity('Enter unit-A price')}
                                            onInput={(e) => e.target.setCustomValidity('')}
                                            disabled={isProductPriceDisabled}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className='border-2 rounded p-2'>
                                <div className="mb-3">
                                    <label className="form-label font-bold">*Number-B:</label>
                                    <input 
                                        type='number'
                                        className="form-control" 
                                        name="product_number_b" 
                                        value={productPriceState.product_number_b} 
                                        onChange={handlePriceInputChange}
                                        step="0.001"  // Allows input with up to three decimal places
                                        pattern="^\d+(\.\d{1,3})?$"  // Allows up to two decimal places
                                        min={1}
                                        required
                                        onInvalid={(e) => e.target.setCustomValidity('Enter number-B')}
                                        onInput={(e) => e.target.setCustomValidity('')}
                                        disabled={isProductPriceDisabled}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label font-bold">*Unit-B:</label>
                                    <input 
                                        type='text'
                                        className="form-control" 
                                        name="product_unit_b" 
                                        value={productPriceState.product_unit_b} 
                                        onChange={handlePriceInputChange}
                                        required
                                        onInvalid={(e) => e.target.setCustomValidity('Enter unit-B')}
                                        onInput={(e) => e.target.setCustomValidity('')}
                                        disabled={isProductPriceDisabled}
                                    />
                                    <label className='text-xs italic text-gray-400'>Ex: units, length, each, sheet</label>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label font-bold">*Unit-B Price:</label>
                                    <div className='flex items-center border rounded'>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 ml-2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                        </svg>
                                        <input 
                                            type='number'
                                            className="form-control flex-1 pl-2 border-0" 
                                            name="product_price_unit_b" 
                                            value={productPriceState.product_price_unit_b} 
                                            onChange={handlePriceInputChange}
                                            step="0.001"  // Allows input with up to three decimal places
                                            min={1}
                                            required
                                            onInvalid={(e) => e.target.setCustomValidity('Enter unit-B price')}
                                            onInput={(e) => e.target.setCustomValidity('')}
                                            disabled={isProductPriceDisabled}
                                        />
                                    </div>
                                </div>
                            </div>
                            {/* **** PROJECT DROPDOWN START **** */}
                            <div>
                                <label className="block font-bold mb-2">*Project:</label>
                                <div>
                                    <button
                                        type="button"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-left focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        disabled={isProductPriceDisabled}
                                    >
                                        {productPriceState.projects.length > 0 ? `x${productPriceState.projects.length} Projects Selected` : `Select Projects`}
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
                                                            checked={productPriceState.projects.includes(project._id)}
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
                                <p className='text-xs italic text-gray-400 mt-2'>Select one or more projects that this new product applies to</p>
                            </div>
                            {/* **** PROJECT DROPDOWN END **** */}

                            {/* **** PRICE FIXED? ************ */}
                            <div>
                                <label className="form-label font-bold">Price effective date:</label>
                                <input 
                                    type='date'
                                    className="form-control" 
                                    name="product_effective_date" 
                                    value={productPriceState.product_effective_date}
                                    onChange={handlePriceInputChange}
                                    required
                                    disabled={isProductPriceDisabled}
                                />
                            </div>
                            <div>
                                <label className="form-label font-bold">Price fixed(?):</label>
                                <input 
                                        type="checkbox"
                                        className="form-check-input m-1" 
                                        name="price_fixed" 
                                        checked={productPriceState.price_fixed} 
                                        onChange={(e) => handlePriceInputChange({ target: { name: 'price_fixed', value: e.target.checked }})}
                                        disabled={isProductPriceDisabled}
                                    />
                            </div>
                        </div>
                                    {/* Creating New Price */}
                        {isShowNewPriceForm && 
                        <div className='grid grid-cols-3 gap-x-10 gap-y-4 border-4 rounded p-3 mb-1'>
                            <div className='border-2 rounded p-2'>
                                <div className="mb-3">
                                    <label className="form-label font-bold">*Number-A:</label>
                                    <input 
                                        type='number'
                                        className="form-control" 
                                        name="product_number_a" 
                                        value={newProductPriceState.product_number_a} 
                                        onChange={handleNewPriceInputChange}
                                        min={1}
                                        step="0.001"  // Allows input with up to three decimal places
                                        pattern="^\d+(\.\d{1,3})?$"  // Allows up to two decimal places
                                        required
                                        onInvalid={(e) => e.target.setCustomValidity('Enter number-A')}
                                        onInput={(e) => e.target.setCustomValidity('')}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label font-bold">*Unit-A:</label>
                                    <input 
                                        type='text'
                                        className="form-control" 
                                        name="product_unit_a" 
                                        value={newProductPriceState.product_unit_a} 
                                        onChange={handleNewPriceInputChange}
                                        required
                                        onInvalid={(e) => e.target.setCustomValidity('Enter unit-A')}
                                        onInput={(e) => e.target.setCustomValidity('')}
                                    />
                                    <label className='text-xs italic text-gray-400'>Ex: Box, Pack, Carton</label>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label font-bold">*Unit-A Price:</label>
                                    <div className='flex items-center border rounded'>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 ml-2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                        </svg>
                                        <input 
                                            type='number'
                                            className="form-control flex-1 pl-2 border-0" 
                                            name="product_price_unit_a" 
                                            value={newProductPriceState.product_price_unit_a} 
                                            onChange={handleNewPriceInputChange}
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
                                <div className="mb-3">
                                    <label className="form-label font-bold">*Number-B:</label>
                                    <input 
                                        type='number'
                                        className="form-control" 
                                        name="product_number_b" 
                                        value={newProductPriceState.product_number_b} 
                                        onChange={handleNewPriceInputChange}
                                        step="0.001"  // Allows input with up to three decimal places
                                        pattern="^\d+(\.\d{1,3})?$"  // Allows up to two decimal places
                                        min={1}
                                        required
                                        onInvalid={(e) => e.target.setCustomValidity('Enter number-B')}
                                        onInput={(e) => e.target.setCustomValidity('')}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label font-bold">*Unit-B:</label>
                                    <input 
                                        type='text'
                                        className="form-control" 
                                        name="product_unit_b" 
                                        value={newProductPriceState.product_unit_b} 
                                        onChange={handleNewPriceInputChange}
                                        required
                                        onInvalid={(e) => e.target.setCustomValidity('Enter unit-B')}
                                        onInput={(e) => e.target.setCustomValidity('')}
                                    />
                                    <label className='text-xs italic text-gray-400'>Ex: units, length, each, sheet</label>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label font-bold">*Unit-B Price:</label>
                                    <div className='flex items-center border rounded'>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 ml-2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                        </svg>
                                        <input 
                                            type='number'
                                            className="form-control flex-1 pl-2 border-0" 
                                            name="product_price_unit_b" 
                                            value={newProductPriceState.product_price_unit_b} 
                                            onChange={handleNewPriceInputChange}
                                            step="0.001"  // Allows input with up to three decimal places
                                            min={1}
                                            required
                                            onInvalid={(e) => e.target.setCustomValidity('Enter unit-B price')}
                                            onInput={(e) => e.target.setCustomValidity('')}
                                        />
                                    </div>
                                </div>
                            </div>
                            {/* **** PROJECT DROPDOWN START **** */}
                            <div>
                                <label className="block font-bold mb-2">*Project:</label>
                                <div>
                                    <button
                                        type="button"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-left focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        onClick={() => setIsDropdownOpenNewPrice(!isDropdownOpenNewPrice)}
                                    >
                                        {newProductPriceState.projects.length > 0 ? `x${newProductPriceState.projects.length} Projects Selected` : `Select Projects`}
                                    </button>
                                    {isDropdownOpenNewPrice && (
                                        <div className="relative z-10 mt-2 w-full bg-white border border-gray-300 rounded-md shadow-md max-h-60 overflow-auto" onMouseLeave={() => setIsDropdownOpenNewPrice(false)}>
                                            <ul className="py-1">
                                                {projectState && projectState.length > 0 && projectState.map((project, index) => (
                                                    <li key={index} className="flex items-center px-4 py-2 hover:bg-gray-100">
                                                        <input
                                                            type="checkbox"
                                                            id={`project-${project._id}`}
                                                            value={project._id}
                                                            checked={newProductPriceState.projects.includes(project._id)}
                                                            onChange={handleCheckboxChangeNewPrice}
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
                                <p className='text-xs italic text-gray-400 mt-2'>Select one or more projects that this new product applies to</p>
                            </div>
                            {/* **** PRICE EFFECTIVE DATE **** */}
                            <div>
                                <label className="form-label font-bold">Price effective date:</label>
                                <input 
                                    type='date'
                                    className="form-control" 
                                    name="product_effective_date" 
                                    value={newProductPriceState.product_effective_date}
                                    onChange={handleNewPriceInputChange}
                                    required
                                />
                            </div>
                            {/* **** PRICE FIXED (?) **** */}
                            <div>
                                <label className="form-label font-bold">Price fixed(?):</label>
                                <input 
                                    type="checkbox"
                                    className="form-check-input m-1" 
                                    name="price_fixed" 
                                    checked={newProductPriceState.price_fixed} 
                                    onChange={(e) => handleNewPriceInputChange({ target: { name: 'price_fixed', value: e.target.checked }})}
                                />
                            </div>
                        </div>
                        }
                        {isProductPriceDisabled && !isShowNewPriceForm &&
                            <div className='grid grid-cols-3'>
                                <label className='col-start-2 text-center text-xs italic text-gray-400 mb-2'>
                                    <span className="text-blue-600 size-5 cursor-pointer underline" onClick={handleEditProductPrice}>Edit</span> existing version of price or <span className="text-blue-600 size-5 cursor-pointer underline" onClick={handleCreateNewPrice}>Create</span> a new version of price for this product?
                                </label>
                            </div>
                        }
                        {!isProductPriceDisabled &&
                            <div className='grid grid-cols-3'>
                                <label className='col-start-2 text-center text-xs italic text-gray-400 mb-2'>
                                    <span className="text-blue-600 size-5 cursor-pointer underline" onClick={() => {setIsProductPriceDisabled(!isProductPriceDisabled); dispatch(setProductPrice(defaultProductPrice));}}>Reset</span> to original
                                </label>
                            </div>
                        }
                        {isShowNewPriceForm &&
                            <div className='grid grid-cols-3'>
                                <label className='col-start-2 text-center text-xs italic text-gray-400 mb-2'>
                                    <span className="text-blue-600 size-5 cursor-pointer underline" onClick={handleAbortNewPrice} >Abort</span> creating new price and reset to original
                                </label>
                            </div>
                        }
                        {/* ********************************************* PRODUCT PRICE TABLE END *********************************************** */}
                        <div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label font-bold">*Actual M<span className='text-xs align-top'>2</span>/M:</label>
                                <input 
                                    type='number'
                                    className="form-control" 
                                    name="product_actual_size" 
                                    value={productState.product_actual_size} 
                                    onChange={handleProductInputChange}
                                    step="0.001"  // Allows input with up to three decimal places
                                    pattern="^\d+(\.\d{1,3})?$"  // Allows up to two decimal places
                                    min={1}
                                    required
                                />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label font-bold">Next available stock date:</label>
                                <input 
                                    type='date'
                                    className="form-control" 
                                    name="product_next_available_stock_date" 
                                    defaultValue={productState.product_next_available_stock_date}
                                    onChange={handleProductInputChange}
                                />
                            </div>
                        </div>

                        {/* ******************************************* END OF FORM ********************************************************** */}
                        <div className="d-flex justify-content-between mb-3">
                            <button type="button" onClick={handleBackClick} className="btn btn-secondary">CANCEL</button>
                            <button className="btn btn-primary" type="submit">CONFIRM UPDATE</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UpdateProductForm;