// Import modules
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import { useUpdatePurchaseOrder } from '../../hooks/useUpdatePurchaseOrder';
import { useFetchSupplierByProject } from '../../hooks/useFetchSupplierByProject';
import { useFetchProductsBySupplier } from '../../hooks/useFetchProductsBySupplier';

import { setPurchaseOrderState } from '../../redux/purchaseOrderSlice'
import { setProjectState } from '../../redux/projectSlice'
import { clearSupplierState } from '../../redux/supplierSlice'
import { clearProductState } from '../../redux/productSlice'

import { Modal, Button } from "react-bootstrap";
import SessionExpired from '../../components/SessionExpired';
import NewPurchaseOrderSkeleton from '../loaders/NewPurchaseOrderSkeleton';

const UpdatePurchaseOrderForm = () => {
    // Component router
    const navigate = useNavigate();

    // Component hook
    const dispatch = useDispatch();
    const { fetchProductsBySupplier, isFetchProductsLoadingState, fetchProductsErrorState } = useFetchProductsBySupplier();
    const { fetchSupplierByProject, isFetchSupplierLoading, fetchSupplierError } = useFetchSupplierByProject();
    const { updatePurchaseOrder, isUpdateLoadingState, updateErrorState } = useUpdatePurchaseOrder();

    // Component state
    const supplierState = useSelector((state) => state.supplierReducer.supplierState)
    const productState = useSelector((state) => state.productReducer.productState)
    const projectState = useSelector((state) => state.projectReducer.projectState)
    const purchaseOrderState = useSelector((state) => state.purchaseOrderReducer.purchaseOrderState)
    const [selectedSupplier, setSelectedSupplier] = useState(purchaseOrderState.supplier._id);
    const [selectedProject, setSelectedProject] = useState(purchaseOrderState.project._id);
    const [selectedProductType, setSelectedProductType] = useState('')
    const [isFetchProjectLoadingState, setIsFetchProjectLoadingState] = useState(true);
    const [fetchProjectErrorState, setFetchProjectErrorState] = useState(null);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [newSupplier, setNewSupplier] = useState('');
    const [newProject, setNewProject] = useState('');
    const [pendingAction, setPendingAction] = useState(null);
    const [searchProductTerm, setSearchProductTerm] = useState('');    
    // const [addedProductState, setAddedProductState] = useState( productState ? 
    //     productState
    //         .filter(product => purchaseOrderState.products.some(prod => prod.product_obj_ref._id === product.product._id))
    //         .filter(product => product.productPrice.projects.includes(selectedProject))
    //         .filter(product => purchaseOrderState.order_date >= product.productPrice.product_effective_date)
    //         .filter((product, index, self) => index === self.findIndex((p) => p.product._id === product.product._id))
    //     :
    //     null
    //     );
    
    // Component functions and variables
    const handleBackClick = () => navigate(`/EmpirePMS/order/`);

    const handleProjectChange = (event) => {        
        const targetProject = event.target.value
        if (targetProject !== '') {
            //this is first render's changes
            if (selectedProject === '') {
                setSelectedProject(targetProject);
                dispatch(clearProductState());
                dispatch(setPurchaseOrderState({
                    ...purchaseOrderState,
                    products: [],
                    custom_products: [],
                    order_total_amount: 0,
                    project: targetProject,
                }))
                
                fetchSupplierByProject(targetProject);
                return;
            }

            // Set newProject and show the confirmation modal
            setNewProject(targetProject);
            setPendingAction('changeProject');
            setShowConfirmationModal(true);
        } else if (targetProject === '' && selectedProject !== '') {
            setSelectedProject(targetProject)
            dispatch(clearSupplierState())
            setSelectedSupplier('')
        }
    };
    
    const handleSupplierChange = (event) => {
        const targetSupplier = event.target.value;
    
        if (targetSupplier !== '') {
            if (selectedSupplier === '') {
                dispatch(clearProductState());
                dispatch(setPurchaseOrderState({
                    ...purchaseOrderState,
                    supplier: targetSupplier,
                    products: [],
                    custom_products: [],
                    order_total_amount: 0,
                    project: selectedProject,
                }))
                
                fetchProductsBySupplier(targetSupplier);
                setSelectedSupplier(targetSupplier);
                return;
            }
    
            // Set newSupplier and show the confirmation modal
            setNewSupplier(targetSupplier);
            setPendingAction('changeSupplier');
            setShowConfirmationModal(true);
        } else if (targetSupplier === '' && selectedSupplier !== '') {
            setSelectedSupplier(targetSupplier);
        }
    };

    const handleConfirmAction = () => {
        if (pendingAction === 'changeSupplier') {
            dispatch(clearProductState());
            dispatch(setPurchaseOrderState({
                    ...purchaseOrderState,
                    products: [],
                    custom_products: [],
                    order_total_amount: 0,
                    supplier: newSupplier,
                }))
            
            fetchProductsBySupplier(newSupplier);
            setSelectedSupplier(newSupplier);
        }
        if (pendingAction === 'changeProject') {
            dispatch(clearProductState());
            dispatch(setPurchaseOrderState({
                ...purchaseOrderState,
                products: [],
                custom_products: [],
                order_total_amount: 0,
                project: newProject,
            }))
            
            setSelectedSupplier('')
            fetchSupplierByProject(newProject);
            setSelectedProject(newProject);
        }
        setShowConfirmationModal(false);
        setPendingAction(null);
    };

    const handleAddItem = (product) => {
        // Create the updated products array
        const updatedProducts = [...purchaseOrderState.products, {
            product_obj_ref: {
                _id: product.product._id,
                product_name: product.product.product_name,
                product_sku: product.product.product_sku
            },
            productprice_obj_ref: product.productPrice,
            order_product_location: '',
            order_product_qty_a: 0, // Ensure all fields are initialized properly
            order_product_qty_b: 0,
            order_product_price_unit_a: product.productPrice.product_price_unit_a,
            order_product_gross_amount: 0
        }];
        
        // Dispatch the action with a plain object payload
        dispatch(setPurchaseOrderState({
            ...purchaseOrderState,
            products: updatedProducts
        }));
    };

    const handleAddCustomItem = () => {
        if (purchaseOrderState.custom_products.length < 15) {
            dispatch(setPurchaseOrderState({
                ...purchaseOrderState,
                custom_products: [...purchaseOrderState.custom_products, {
                    custom_product_name:'', 
                    custom_product_location: '',
                    custom_order_qty: 0
                }]
            }))
        } else {
            alert("You can add up to 15 custom items only.")
        }
    }

    const handleRemoveItem = (index) => {
        const updatedItems = purchaseOrderState.products.filter((_, idx) => idx !== index);

        if (updatedItems.length === 0) {
            dispatch(setPurchaseOrderState({
                ...purchaseOrderState,
                order_total_amount: 0,
                products: updatedItems
            }))
        } else {
            dispatch(setPurchaseOrderState({
                ...purchaseOrderState,
                products: updatedItems
            }))
        }        
    }

    const handleRemoveCustomItem = (index) => {
        const updatedCustomItems = purchaseOrderState.custom_products.filter((_, idx) => idx !== index);
        dispatch(setPurchaseOrderState({
            ...purchaseOrderState,
            custom_products: updatedCustomItems,
        }))
    }

    const handleInputChange = (event, index = null, isProduct = false, isCustomProduct = false) => {
        const { name, value } = event.target;
    
        // Get the current state
        const currentState = purchaseOrderState; // assuming purchaseOrderState is the correct slice
    
        let updatedState = { ...currentState };
    
        // Handle product array updates
        if (isProduct && index !== null) {
            let updatedProducts = [...currentState.products];
            
            updatedProducts[index] = {
                ...updatedProducts[index],
                [name]: value,
            };
            
            updatedState = {
                ...currentState,
                products: updatedProducts,
            };
        }
        // Handle custom products array updates
        else if (isCustomProduct && index !== null) {
            const updatedCustomProducts = currentState.custom_products.map((product, i) => 
                i === index ? { ...product, [name]: name === "custom_order_qty" ? Number(value) : value } : product
            );
    
            updatedState = {
                ...currentState,
                custom_products: updatedCustomProducts,
            };
        }
        // Handle other updates
        else {
            updatedState = {
                ...currentState,
                [name]: value,
            };
        }
    
        // Dispatch the action with the updated state
        dispatch(setPurchaseOrderState(updatedState));
    };
    
    //! FIX THIS
    const handleQtyChange = (event, index) => {
        const { name, value } = event.target;
    
        // Create a copy of the current state outside of the dispatch
        let updatedProducts = [...purchaseOrderState.products];
    
        updatedProducts[index] = {
            ...updatedProducts[index],
            [name]: Number(value),
        };
    
        // Handle `order_product_qty_a` changes
        if (name === 'order_product_qty_a') {
            if (purchaseOrderState.products[index].productprice_obj_ref.product_number_a === 1) {
                updatedProducts[index].order_product_qty_b = Number.isInteger(value * purchaseOrderState.products[index].productprice_obj_ref.product_number_b)
                    ? value * purchaseOrderState.products[index].productprice_obj_ref.product_number_b
                    : parseFloat(value * purchaseOrderState.products[index].productprice_obj_ref.product_number_b).toFixed(4);
            } else {
                updatedProducts[index].order_product_qty_b = Number.isInteger(value / purchaseOrderState.products[index].productprice_obj_ref.product_number_a)
                    ? value / purchaseOrderState.products[index].productprice_obj_ref.product_number_a
                    : parseFloat(value / purchaseOrderState.products[index].productprice_obj_ref.product_number_a).toFixed(4);
            }
            updatedProducts[index].order_product_gross_amount = (purchaseOrderState.products[index].productprice_obj_ref.product_price_unit_a === 1
            ? (value * purchaseOrderState.products[index].productprice_obj_ref.product_price_unit_a * purchaseOrderState.products[index].productprice_obj_ref.product_number_a) : value * purchaseOrderState.products[index].productprice_obj_ref.product_price_unit_a
            ).toFixed(2);
        }
    
        // Handle `order_product_qty_b` changes
        if (name === 'order_product_qty_b') {
            if (purchaseOrderState.products[index].productprice_obj_ref.product_number_b === 1) {
                updatedProducts[index].order_product_qty_a = Number.isInteger(value * purchaseOrderState.products[index].productprice_obj_ref.product_number_a)
                    ? value * purchaseOrderState.products[index].productprice_obj_ref.product_number_a
                    : parseFloat(value * purchaseOrderState.products[index].productprice_obj_ref.product_number_a).toFixed(4);
            } else {
                updatedProducts[index].order_product_qty_a = Number.isInteger(value / purchaseOrderState.products[index].productprice_obj_ref.product_number_b)
                    ? value / purchaseOrderState.products[index].productprice_obj_ref.product_number_b
                    : parseFloat(value / purchaseOrderState.products[index].productprice_obj_ref.product_number_b).toFixed(4);
            }
            updatedProducts[index].order_product_gross_amount = (value * purchaseOrderState.products[index].productprice_obj_ref.product_price_unit_b).toFixed(2);
        }
    
        // Calculate updatedTotalAmount using updatedProducts
        let updatedTotalAmount = (updatedProducts.reduce((total, prod) => (
            total + (Number(prod.order_product_gross_amount) || 0)
        ), 0) * 1.1).toFixed(2);
    
        // Dispatch the updated state with a plain object
        dispatch(setPurchaseOrderState({
            ...purchaseOrderState,
            order_total_amount: Number(updatedTotalAmount),
            products: updatedProducts,
        }));
    };
    

    let distinctProductTypes = [];
    if (Array.isArray(productState) && selectedProject) {
        distinctProductTypes = [
            ...new Set(productState.map((prod) => prod.product.product_types))
        ];
    }
    

    const filterProductsBySearchTerm = () => {
        const lowerCaseSearchTerm = searchProductTerm.toLowerCase().trim();
        
        return productState.filter(product => {
            const matchesSearchTerm = (
                product.product.product_sku.toLowerCase().includes(lowerCaseSearchTerm) ||
                product.product.product_name.toLowerCase().includes(lowerCaseSearchTerm) ||
                product.productPrice.product_number_a.toString().includes(lowerCaseSearchTerm) ||
                product.productPrice.product_unit_a.toLowerCase().includes(lowerCaseSearchTerm) ||
                product.productPrice.product_price_unit_a.toString().toLowerCase().includes(lowerCaseSearchTerm) ||
                product.product.product_actual_size.toString().includes(lowerCaseSearchTerm) ||
                product.product.product_types.toLowerCase().includes(lowerCaseSearchTerm) ||
                product.product.alias_name.toString().includes(lowerCaseSearchTerm)
            );
    
            const matchesProductType = selectedProductType 
                ? product.product.product_types === selectedProductType 
                : true; // If no product type is selected, don't filter by type

            const matchesProjectId = product.productPrice.projects.some(projectId => 
                projectId.includes(selectedProject)
            );
    
            return matchesSearchTerm && matchesProductType && matchesProjectId;
        });
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        if (purchaseOrderState.products.length === 0 && purchaseOrderState.custom_products.length === 0) {
            alert("You must have at least one product to submit a new order.")
            return
        }
    
        if (event.nativeEvent.submitter.name === 'draft') {
            const updatedState = {
                ...purchaseOrderState,
                order_status: "Draft"
            };
            updatePurchaseOrder(updatedState);
            navigate(`/EmpirePMS/order/${purchaseOrderState._id}`);
        } else if (event.nativeEvent.submitter.name === 'approve') {
            const updatedState = {
                ...purchaseOrderState,
                order_status: "Approved"
            };
            updatePurchaseOrder(updatedState);
            navigate(`/EmpirePMS/order/${purchaseOrderState._id}`);
        } else {
            updatePurchaseOrder(purchaseOrderState); 
            navigate(`/EmpirePMS/order/${purchaseOrderState._id}`);
        }
    };
    
    //Render component
    useEffect(() => {
        const abortController = new AbortController();
        const signal = abortController.signal;

        const fetchProjects = async () => {
            setIsFetchProjectLoadingState(true);
            try {
                const res = await fetch('/api/project', { signal });
                if (!res.ok) {
                    throw new Error('Failed to fetch projects');
                }
                const data = await res.json();

                if (data.tokenError) {
                    throw new Error(data.tokenError);
                }
                
                setIsFetchProjectLoadingState(false);
                dispatch(setProjectState(data))
                setFetchProjectErrorState(null);
            } catch (error) {
                if (error.name === 'AbortError') {
                    // do nothing
                } else {
                    setIsFetchProjectLoadingState(false);
                    setFetchProjectErrorState(error.message);
                }
            }
        };

        fetchProjects();

        return () => {
            abortController.abort(); // Cleanup
        };
    }, [dispatch]);

    // Display DOM
    if (isFetchProjectLoadingState || isFetchProductsLoadingState || isUpdateLoadingState || isFetchSupplierLoading) {
        return <NewPurchaseOrderSkeleton />;
    }

    if (fetchProjectErrorState || fetchProductsErrorState || updateErrorState || fetchSupplierError) {
        if (fetchProjectErrorState && fetchProjectErrorState.includes("Session expired") ) {
            return <div><SessionExpired /></div>;
        }
        return (
        <div>
            <p>Error: {fetchProjectErrorState || fetchProductsErrorState || updateErrorState || fetchSupplierError}</p>
        </div>
        );
    }

    const confirmationModal = (
        <Modal show={showConfirmationModal} onHide={() => setShowConfirmationModal(false)}>
            <Modal.Header closeButton>
                <Modal.Title>
                    { pendingAction === 'changeSupplier' ? `Change Supplier` : 'Change Project' }
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                { `Are you sure you want to change to another ${pendingAction === 'changeSupplier' ? 'supplier' : 'project'}? Any changes you made to current order details will be discarded.` }
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowConfirmationModal(false)}>
                    Cancel
                </Button>
                <Button className="bg-red-600 hover:bg-red-600" variant="primary" onClick={handleConfirmAction}>
                    { `Change` }
                </Button>
            </Modal.Footer>
        </Modal>
    );

    return (
        <>
        {/* PAGE HEADER */}
        <div className='mx-4 mt-4 p-2 text-center font-bold text-xl bg-slate-800 text-white rounded-t-lg'>
            EDIT PURCHASE ORDER
        </div>
        <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 mx-4 mb-4">
                <div className="border rounded-b-lg p-4"> 
                    
                        {/* SELECT SUPPLIER */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4">
                            <div className="mb-1">
                                <label className="form-label font-bold">*Purchase Order No:</label>
                                <input
                                type="text"
                                className="form-control"
                                name="order_ref"
                                value={purchaseOrderState.order_ref}
                                disabled
                                />
                            </div>

                            <div className="mb-1">
                                <label className="form-label font-bold">*Project:</label>
                                <select
                                className="form-control shadow-sm cursor-pointer"
                                name="project"
                                value={selectedProject}
                                onChange={handleProjectChange}
                                required
                                >
                                <option value="">Select Project</option>
                                {projectState &&
                                    projectState.length > 0 &&
                                    projectState
                                    .filter((project) => project.project_isarchived === false)
                                    .map((project, index) => (
                                        <option key={index} value={project._id}>
                                        {project.project_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="mb-1">
                                <label className="form-label font-bold">*Supplier:</label>
                                <select
                                className="form-control shadow-sm cursor-pointer"
                                name="supplier_name"
                                value={selectedSupplier}
                                onChange={handleSupplierChange}
                                required
                                >
                                <option value="">Select Supplier</option>
                                {supplierState &&
                                    supplierState.length > 0 &&
                                    supplierState
                                    .filter((supplier) => supplier.supplier_isarchived === false)
                                    .map((supplier, index) => (
                                        <option key={index} value={supplier._id}>
                                        {supplier.supplier_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* ***** SEARCH ITEM TABLE ****** */}
                        <div className="container p-0 border-2 shadow-md bg-slate-50">
                            <div className="grid grid-cols-3 m-2 gap-x-1">
                                <input
                                    type="text"
                                    className="form-control mb-1 col-span-2"
                                    placeholder="Search products..."
                                    value={searchProductTerm}
                                    onChange={(e) => setSearchProductTerm(e.target.value)}
                                />
                                <div>
                                    <select
                                    className="form-control shadow-sm cursor-pointer opacity-95"
                                    name="product_types"
                                    value={selectedProductType}
                                    onChange={(e) => setSelectedProductType(e.target.value)}
                                    >
                                    <option value="">Filter by Product Type...</option>
                                    {distinctProductTypes.map((productType, index) => (
                                    <option key={index} value={productType}>
                                        {productType}
                                    </option>
                                    ))}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-5 gap-1 p-1 font-bold bg-gray-200 text-center text-sm">
                                <div className='p-1'><label>SKU</label></div>
                                <div className='p-1'><label>Name</label></div>
                                <div className='p-1'><label>Unit A</label></div>
                                <div className='p-1'><label>Unit B</label></div>
                                <div className='grid grid-cols-3 gap-2 p-1'><label className='col-span-2'>Type</label></div>
                            </div>
                            { productState ? filterProductsBySearchTerm().filter((product, index, self) => index === self.findIndex((p) => p.product._id === product.product._id)).slice(0,15).map((product, index) => (
                                <div key={index} className="grid grid-cols-5 gap-1 p-1 border-b text-sm text-center hover:bg-slate-100" title='Add to order'>
                                    <div>{product.product.product_sku}</div>
                                    <div>{product.product.product_name}</div>
                                    <div>{product.productPrice.product_number_a}<span className='ml-2 opacity-50'>{product.productPrice.product_unit_a}</span></div>
                                    <div>{product.productPrice.product_number_b}<span className='ml-2 opacity-50'>{product.productPrice.product_unit_b}</span></div>
                                    <div className='grid grid-cols-3 gap-2 p-1'>
                                        <label className="col-span-2">{product.product.product_types}</label>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 cursor-pointer text-green-600 justify-self-end hover:scale-110" onClick={() => handleAddItem(product)}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                                        </svg>
                                    </div>
                                </div>
                            )) : (
                                <div className='border shadow-sm text-center'>
                                    <p className='p-1'>Select a supplier...</p>
                                </div>
                            )}
                        </div>
                    
                </div>
                <div className="border rounded-b-lg p-4">
                    {/* ***** ADDED ITEM TABLE ****** */}
                    <label className="font-bold">Order Items:</label>
                    <div className='bg-gray-100 border rounded-lg shadow-sm'>
                        <div className="border-0 rounded-lg">
                            <table className="table m-0 text-xs">
                                <thead className="thead-dark text-center">
                                <tr className="table-primary">
                                    <th scope="col">SKU</th>
                                    <th scope="col">Name</th>
                                    <th scope="col">Location</th>
                                    <th scope="col">Qty A</th>
                                    <th scope="col">Qty B</th>
                                    <th scope="col">Price A</th>
                                    <th scope="col">Net Amount</th>
                                    <th scope="col"></th>
                                </tr>
                                </thead>
                                <tbody className="text-center">
                                    {purchaseOrderState.products && purchaseOrderState.products.map((prod, index) => (
                                    <tr key={index}>
                                        <td>{prod.product_obj_ref.product_sku}</td>
                                        <td>{prod.product_obj_ref.product_name}</td>
                                        {/* <td>
                                            {addedProductState && addedProductState[index] && addedProductState[index].product && (
                                                <label>{addedProductState[index].product.product_sku}</label>
                                            )}
                                        </td>
                                        <td>
                                            {addedProductState && addedProductState[index] && addedProductState[index].product && (
                                                <label>{addedProductState[index].product.product_name}</label>
                                            )}
                                        </td> */}
                                        <td>
                                            <input
                                            type="text"
                                            className="form-control px-1 py-0.5 text-xs" 
                                            name="order_product_location" 
                                            value={prod.order_product_location} 
                                            onChange={(e) => handleInputChange(e, index, true)}
                                            placeholder="Ex: Level 2"
                                            required
                                            onInvalid={(e) => e.target.setCustomValidity('Enter item location')}
                                            onInput={(e) => e.target.setCustomValidity('')}
                                            />
                                        </td>
                                        <td>
                                            <div className="grid grid-cols-3 items-center border rounded w-28">
                                            <input
                                                type="number"
                                                name="order_product_qty_a" 
                                                value={prod.order_product_qty_a} 
                                                onChange={(e) => handleQtyChange(e, index)}
                                                min={0}
                                                step={0.0001}
                                                required
                                                onInvalid={(e) => e.target.setCustomValidity('Please check the value in qty-A')}
                                                onInput={(e) => e.target.setCustomValidity('')}
                                                className="px-1 py-0.5 ml-1 col-span-2 text-xs"
                                            />
                                            <label className="text-xs opacity-50 col-span-1 text-nowrap">
                                                {prod.productprice_obj_ref.product_unit_a}
                                            </label>
                                            {/* <label className="text-xs opacity-50 col-span-1 text-nowrap">
                                                {addedProductState && 
                                                addedProductState[index] && 
                                                addedProductState[index].productPrice && 
                                                addedProductState[index].productPrice.product_unit_a}
                                            </label> */}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="grid grid-cols-3 items-center border rounded w-28">
                                            <input
                                                type="number"
                                                name="order_product_qty_b" 
                                                value={prod.order_product_qty_b} 
                                                onChange={(e) => handleQtyChange(e, index)}
                                                min={0}
                                                step={0.0001}
                                                required
                                                onInvalid={(e) => e.target.setCustomValidity('Please check the value in qty-B')}
                                                onInput={(e) => e.target.setCustomValidity('')}
                                                className="px-1 py-0.5 ml-1 col-span-2 text-xs"
                                            />
                                            <label className="text-xs opacity-50 col-span-1 text-nowrap">
                                                {prod.productprice_obj_ref.product_unit_b}
                                            </label>
                                            {/* <label className="text-xs opacity-50 col-span-1 text-nowrap">
                                                {addedProductState && 
                                                addedProductState[index] && 
                                                addedProductState[index].productPrice && 
                                                addedProductState[index].productPrice.product_unit_b}
                                            </label> */}
                                            </div>
                                        </td>
                                        <td>
                                            <label>${prod.order_product_price_unit_a}</label>
                                        </td>
                                        <td>
                                            <label>
                                            ${(
                                                prod.productprice_obj_ref.product_number_a === 1 
                                                ? (prod.order_product_qty_a * (prod.order_product_price_unit_a || 0) * prod.productprice_obj_ref.product_number_a) 
                                                : (prod.order_product_qty_a * (prod.order_product_price_unit_a || 0))
                                            ).toFixed(2)}
                                            </label>
                                        </td>
                                        <td>
                                            <button type="button" onClick={() => handleRemoveItem(index)} className="btn btn-danger p-1">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                            </svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {/* ***** CUSTOM ITEMS ***** */}
                                {purchaseOrderState.custom_products.map((cproduct, index) => (
                                <tr key={index}>
                                    <td>Custom {index + 1}</td>
                                    <td>
                                        <input
                                            type="text"
                                            className="form-control px-1 py-0.5 text-xs" 
                                            name="custom_product_name" 
                                            value={cproduct.custom_product_name} 
                                            onChange={(e) => handleInputChange(e, index, false, true)}
                                            placeholder="Custom name"
                                            onInvalid={(e) => e.target.setCustomValidity('Enter custom item name')}
                                            onInput={(e) => e.target.setCustomValidity('')}
                                            required
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            className="form-control px-1 py-0.5 text-xs"  
                                            name="custom_product_location" 
                                            value={cproduct.custom_product_location} 
                                            onChange={(e) => handleInputChange(e, index, false, true)}
                                            placeholder="Ex: Level 2"
                                            onInvalid={(e) => e.target.setCustomValidity('Enter custom item location')}
                                            onInput={(e) => e.target.setCustomValidity('')}
                                        />
                                    </td>
                                    <td>
                                        <div className="grid grid-cols-3 items-center border rounded w-28">
                                            <input
                                                type='number'
                                                name="custom_order_qty" 
                                                value={cproduct.custom_order_qty} 
                                                onChange={(e) => handleInputChange(e, index, false, true)}
                                                min={0}
                                                step={1}
                                                onInvalid={(e) => e.target.setCustomValidity('Enter custom-qty-A')}
                                                onInput={(e) => e.target.setCustomValidity('')}
                                                className="px-1 py-0.5 ml-1 col-span-2 text-xs"
                                            />
                                            <label className="text-xs opacity-50 col-span-1 text-nowrap">UNIT</label>
                                        </div>
                                    </td>
                                    <td>-</td>
                                    <td>-</td>
                                    <td>-</td>
                                    <td>
                                        <button type="button" onClick={() => handleRemoveCustomItem(index)} className="btn btn-danger p-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                        </svg>
                                        </button>
                                    </td>
                                </tr>
                                ))}
                                </tbody>
                            </table>
                            
                            {/* ADD CUSTOM BUTTON */}
                            <div className='bg-white border-b-2'>
                                <div className="flex justify-center p-2">
                                    <div className='flex items-center border bg-gray-200 rounded-xl p-2 text-xs cursor-pointer hover:bg-blue-400 hover:text-white hover:shadow-lg ' onClick={() => handleAddCustomItem()}>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 mr-1">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                                        </svg>
                                        <label className='cursor-pointer'>ADD CUSTOM ITEMS</label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ********************* ITEM CALCULATION ******************** */}
                        <div className="flex justify-end">
                            <div>
                                <table className="table text-end font-bold mb-0 text-xs">
                                    <tbody>
                                        <tr>
                                            <td className='pt-1'>Total Items:</td>
                                            <td className='pt-1'>{purchaseOrderState.products.length + purchaseOrderState.custom_products.length} </td>
                                        </tr>
                                        <tr>
                                            <td className='pt-1'>Total Net Amount:</td>
                                            <td className='pt-1'>
                                                ${purchaseOrderState.products && purchaseOrderState.products.length > 0 ? (
                                                    purchaseOrderState.products.reduce((total, prod) => (
                                                        total + (Number(prod.order_product_gross_amount) || 0)
                                                    ), 0).toFixed(2) // Use toFixed(2) for two decimal places
                                                ) : (
                                                    ' 0.00'
                                                )}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className='pt-1'>Total Net Amount (incl. GST):</td>
                                            <td className='pt-1'>
                                                ${purchaseOrderState.products && purchaseOrderState.products.length > 0 ? (
                                                    (purchaseOrderState.products.reduce((total, prod) => (
                                                        total + (Number(prod.order_product_gross_amount) || 0)
                                                    ), 0) * 1.1).toFixed(2) // Use toFixed(2) for two decimal places
                                                ) : (
                                                    ' 0.00'
                                                )}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* ***** ORDER DATE ****** */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 my-2">
                        <div>
                            <label className="form-label font-bold">*Order Date:</label>
                            <input
                            type="date"
                            className="form-control"
                            name="order_date"
                            value={purchaseOrderState.order_date.split('T')[0]}
                            onChange={handleInputChange}
                            required
                            onInvalid={(e) => e.target.setCustomValidity('Enter Order Date')}
                            onInput={(e) => e.target.setCustomValidity('')}
                            />
                        </div>

                        <div>
                            <label className="form-label font-bold">*EST Date and Time:</label>
                            <input
                            type="datetime-local"
                            className="form-control"
                            name="order_est_datetime"
                            value={purchaseOrderState.order_est_datetime.slice(0,16)}
                            onChange={handleInputChange}
                            required
                            onInvalid={(e) => e.target.setCustomValidity('Enter EST Date and Time')}
                            onInput={(e) => e.target.setCustomValidity('')}
                            />
                            <label className="text-xs italic text-gray-400">(EST) - Delivery estimate time of arrival</label>
                        </div>
                    </div>

                    {/* ***** INTERNAL COMMENTS ***** */}
                    <div className="my-2">
                        <label className="form-label font-bold">Internal comments:</label>
                        <textarea 
                            className="form-control" 
                            name="order_internal_comments" 
                            value={purchaseOrderState.order_internal_comments} 
                            onChange={handleInputChange}
                            placeholder='Enter order related internal comments...'
                            rows={2}
                        />
                    </div>
                    {/* ***** NOTES TO SUPPLIER ***** */}
                    <div className="my-2">
                        <label className="form-label font-bold">Notes to supplier:</label>
                        <textarea
                            className="form-control bg-yellow-200" 
                            name="order_notes_to_supplier" 
                            value={purchaseOrderState.order_notes_to_supplier} 
                            onChange={handleInputChange}
                            placeholder='Enter some notes to supplier...'
                            rows={4}
                        />
                    </div>
                        
                    {/* ***** BUTTONS ***** */}
                    <div className="flex justify-between mb-3">
                        <button type="button" onClick={handleBackClick} className="btn btn-secondary">CANCEL</button>
                        <button className="btn border rounded bg-gray-700 text-white hover:bg-gray-800" type="submit" name="draft">SAVE AS DRAFT</button>
                        <button className="btn border rounded bg-green-700 text-white hover:bg-green-800" type="submit" name="approve">APPROVE</button>
                        <button className="btn btn-primary" type='submit' name='submit'>UPDATE</button>
                    </div>
                </div>
                { confirmationModal }
            </div>
        </form>
        </>
    );
};

export default UpdatePurchaseOrderForm;
