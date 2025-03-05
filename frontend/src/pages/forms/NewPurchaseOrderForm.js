// Import modules
import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { useFetchProductsBySupplier } from '../../hooks/useFetchProductsBySupplier';
import { useFetchSupplierByProject } from '../../hooks/useFetchSupplierByProject';
import { useAddPurchaseOrder } from '../../hooks/useAddPurchaseOrder';

import { setProjectState } from '../../redux/projectSlice'
import { clearSupplierState } from '../../redux/supplierSlice'
import { clearProductState } from '../../redux/productSlice'

import { Modal, Button } from "react-bootstrap";
import SessionExpired from '../../components/SessionExpired';
import NewPurchaseOrderSkeleton from '../loaders/NewPurchaseOrderSkeleton';
import UnauthenticatedSkeleton from "../loaders/UnauthenticateSkeleton";

const NewPurchaseOrderForm = () => {
    // Hooks
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation();
    const searchInputRef = useRef(null);


    // Component hook
    const { fetchProductsBySupplier, isFetchProductsLoadingState, fetchProductsErrorState } = useFetchProductsBySupplier();
    const { fetchSupplierByProject, isFetchSupplierLoading, fetchSupplierError } = useFetchSupplierByProject();
    const { addPurchaseOrder, isAddOrderLoadingState, addOrderErrorState } = useAddPurchaseOrder();

    // Component state
    const supplierState = useSelector((state) => state.supplierReducer.supplierState)
    const productState = useSelector((state) => state.productReducer.productState)
    // const projectState = useSelector((state) => state.projectReducer.projectState)
    const [projectState, setProjectState] = useState([])
    const [purchaseOrderState, setPurchaseOrderState] = useState(null);
    const copiedState = location.state;

    const [isFetchProjectLoadingState, setIsFetchProjectLoadingState] = useState(true);
    const [fetchProjectErrorState, setFetchProjectErrorState] = useState(null);
    const [isFetchOrderLoadingState, setIsFetchOrderLoadingState] = useState(true);
    const [fetchOrderErrorState, setFetchOrderErrorState] = useState(null);
    const [isFetchTypeLoading, setIsFetchTypeLoading] = useState(false);
    const [fetchTypeError, setFetchTypeError] = useState(null);

    const [selectedSupplier, setSelectedSupplier] = useState(copiedState !== null ? copiedState.supplier._id : '');
    const [selectedProject, setSelectedProject] = useState(copiedState !== null ? copiedState.project._id : '');
    const [selectedProductType, setSelectedProductType] = useState('')
    const [addedProductState, setAddedProductState] = useState([]);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [newSupplier, setNewSupplier] = useState('');
    const [newProject, setNewProject] = useState('');
    const [pendingAction, setPendingAction] = useState(null);
    const [searchProductTerm, setSearchProductTerm] = useState('');
    const [productTypeState, setProductTypeState] = useState([]);
    const [copiedProducts, setCopiedProducts] = useState([]);
    const getCurrentDate = () => {
        const today = new Date();
        // Format the date as YYYY-MM-DD
        return today.toLocaleDateString("en-AU", {
            timeZone: "Australia/Melbourne",
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
          }).split("/").reverse().join("-");
    };
    const getTomorrowDateTime = () => {
        const today = new Date();
    
        // Add one day to get tomorrow
        today.setDate(today.getDate() + 1);
    
        // Convert to Melbourne timezone
        const options = {
            timeZone: "Australia/Melbourne",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false
        };
    
        // Format the date to match the required format YYYY-MM-DDTHH:MM
        const formatter = new Intl.DateTimeFormat("en-CA", options); // "en-CA" gives YYYY-MM-DD format
        const parts = formatter.formatToParts(today);
    
        const year = parts.find(p => p.type === "year").value;
        const month = parts.find(p => p.type === "month").value;
        const day = parts.find(p => p.type === "day").value;
        const hour = parts.find(p => p.type === "hour").value.padStart(2, '0');
        const minute = parts.find(p => p.type === "minute").value.padStart(2, '0');
    
        return `${year}-${month}-${day}T${hour}:${minute}`;
    };
    const [orderState, setOrderState] = useState({
        supplier: copiedState !== null ? copiedState.supplier._id : '',
        order_ref: '',
        order_date:  getCurrentDate(),
        order_est_datetime: getTomorrowDateTime(),
        products: copiedState !== null ? copiedState.products : [],
        custom_products: copiedState !== null ? copiedState.custom_products : [],
        order_total_amount: copiedState !== null ? copiedState.order_total_amount : 0,
        order_internal_comments: '',
        order_notes_to_supplier: copiedState !== null ? copiedState.order_notes_to_supplier : '',
        order_isarchived: false,
        deliveries: [],
        invoices: [],
        project: copiedState !== null ? copiedState.project._id : '',
        order_status: 'Pending'
    })
    
    // Component functions and variables
    const localUser = JSON.parse(localStorage.getItem('localUser'))
    
    const handleBackClick = () => navigate(`/EmpirePMS/order`);

    const handleProjectChange = (event) => {        
        const targetProject = event.target.value
        if (targetProject !== '') {
            //this is first render's changes
            if (selectedProject === '') {
                setSelectedProject(targetProject);
                dispatch(clearProductState());
                setOrderState({
                    supplier: '',
                    order_ref: orderState.order_ref,
                    order_date:  getCurrentDate(),
                    order_est_datetime: getTomorrowDateTime(),
                    products: [],
                    custom_products: [],
                    order_total_amount: 0,
                    order_internal_comments: '',
                    order_notes_to_supplier: '',
                    order_isarchived: false,
                    deliveries: [],
                    invoices: [],
                    project: targetProject,
                    order_status: 'Pending'
                });
                setAddedProductState([]);
                fetchSupplierByProject(targetProject);
                return;
            }

            // Set newProject and show the confirmation modal
            setNewProject(targetProject);
            setPendingAction('changeProject');
            setShowConfirmationModal(true);
        } else if (targetProject === '' && selectedProject !== '') {
            setSelectedProject(targetProject)
            dispatch(clearSupplierState());
            setSelectedSupplier('')
        }
    };
    
    const handleSupplierChange = (event) => {
        const targetSupplier = event.target.value;
    
        if (targetSupplier !== '') {
            if (selectedSupplier === '') {
                dispatch(clearProductState());
                setOrderState({
                    supplier: targetSupplier,
                    order_ref: orderState.order_ref,
                    order_date:  getCurrentDate(),
                    order_est_datetime: getTomorrowDateTime(),
                    products: [],
                    custom_products: [],
                    order_total_amount: 0,
                    order_internal_comments: '',
                    order_notes_to_supplier: '',
                    order_isarchived: false,
                    deliveries: [],
                    invoices: [],
                    project: selectedProject,
                    order_status: 'Pending'
                });
                setAddedProductState([]);
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
            setOrderState({
                supplier: newSupplier,
                order_ref: orderState.order_ref,
                order_date:  getCurrentDate(),
                order_est_datetime: getTomorrowDateTime(),
                products: [],
                custom_products: [],
                order_total_amount: 0,
                order_internal_comments: '',
                order_notes_to_supplier: '',
                order_isarchived: false,
                deliveries: [],
                invoices: [],
                project: selectedProject,
                order_status: 'Pending'
            });
            setAddedProductState([]);
            fetchProductsBySupplier(newSupplier);
            setSelectedSupplier(newSupplier);
        }
        if (pendingAction === 'changeProject') {
            dispatch(clearProductState());
            setOrderState({
                supplier: '',
                order_ref: orderState.order_ref,
                order_date:  getCurrentDate(),
                order_est_datetime: getTomorrowDateTime(),
                products: [],
                custom_products: [],
                order_total_amount: 0,
                order_internal_comments: '',
                order_notes_to_supplier: '',
                order_isarchived: false,
                deliveries: [],
                invoices: [],
                project: newProject,
                order_status: 'Pending'
            });
            setAddedProductState([]);
            setSelectedSupplier('')
            fetchSupplierByProject(newProject);
            setSelectedProject(newProject);
        }
        setShowConfirmationModal(false);
        setPendingAction(null);
    };

    const handleAddItem = (product) => {
        setOrderState((prevState) => ({
            ...prevState,
            products: [...prevState.products, {
                product_obj_ref: product.product._id,
                productprice_obj_ref: product.productPrice._id,
                order_product_location: '',
                order_product_qty_a: 0, // Ensure all fields are initialized properly
                order_product_qty_b: 0,
                order_product_price_unit_a: product.productPrice.product_price_unit_a,
                order_product_gross_amount: 0
            }]
        }));

        setAddedProductState((prevProducts) => [...prevProducts, product])

        // clear search after adding
        setSearchProductTerm('');

        // Refocus the input field
        if (searchInputRef.current) {
            searchInputRef.current.focus();
        }
    };

    const handleAddCustomItem = () => {
        if (orderState.custom_products.length < 15) {
            setOrderState({
                ...orderState,
                custom_products: [...orderState.custom_products, {
                    custom_product_name:'', 
                    custom_product_location: '',
                    custom_order_qty: ''
                }]
            })
        } else {
            alert("You can add up to 15 custom items only.")
        }
    }

    const handleRemoveItem = (index) => {
        const updatedItems = orderState.products.filter((_, idx) => idx !== index);
        const updatedAddedProducts = addedProductState.filter((_, idx) => idx !== index);

        if (updatedItems.length === 0) {
            setOrderState({
                ...orderState,
                order_total_amount: 0,
                products: updatedItems
            })
        } else {
            setOrderState({
                ...orderState,
                products: updatedItems
            })
        }

        setAddedProductState(updatedAddedProducts)

    }

    const handleRemoveCustomItem = (index) => {
        const updatedCustomItems = orderState.custom_products.filter((_, idx) => idx !== index);
        setOrderState({
            ...orderState,
            custom_products: updatedCustomItems
        })
    }

    const handleInputChange = (event, index = null, isProduct = false, isCustomProduct = false) => {
        const { name, value } = event.target;
    
        setOrderState((prevState) => {
            // Handle product array updates
            if (isProduct && index !== null) {
                let updatedProducts = [...prevState.products];
                
                updatedProducts[index] = {
                    ...updatedProducts[index],
                    [name]: value,
                };
                
                return {
                    ...prevState,
                    products: updatedProducts,
                };
            }
    
            // Handle custom products array updates
            if (isCustomProduct && index !== null) {
                const updatedCustomProducts = prevState.custom_products.map((product, i) => 
                    i === index ? { ...product, [name]: name === "custom_order_qty" ? Number(value) : value} : product
                );
                return {
                    ...prevState,
                    custom_products: updatedCustomProducts,
                };
            }
            
            // Handle order_date changes
            if (name === 'order_date') {
                // Parse the order_date value as a Date and add 3 days
                const orderDate = new Date(value);
                const orderEstDate = new Date(orderDate);
                orderEstDate.setDate(orderDate.getDate() + 2); // Add 3 days

                // Format as 'YYYY-MM-DDTHH:mm' for datetime-local input
                const formattedOrderEstDate = orderEstDate.toISOString().slice(0, 16);

                return {
                    ...prevState,
                    order_date: value,
                    order_est_datetime: formattedOrderEstDate,
                };
            }

            // Handle other updates
            return {
                ...prevState,
                [name]: value,
            };
        });
    };
    
    const handleQtyChange = (event, index) => {
        const { name, value } = event.target;
    
        // Convert value to a number or set to 0 if invalid
        const numericValue = isNaN(Number(value)) ? 0 : Number(value);
    
        setOrderState((prevState) => {
            let updatedProducts = [...prevState.products];
    
            updatedProducts[index] = {
                ...updatedProducts[index],
                [name]: numericValue,
            };
    
            if (name === 'order_product_qty_a') {
                // Determine order_product_qty_b
                if (addedProductState[index].productPrice.product_number_a === 1) {
                    updatedProducts[index].order_product_qty_b = Number.isInteger(
                        numericValue * addedProductState[index].productPrice.product_number_b
                    )
                        ? numericValue * addedProductState[index].productPrice.product_number_b
                        : Number(
                              (numericValue * addedProductState[index].productPrice.product_number_b).toFixed(4)
                          );
                } else {
                    updatedProducts[index].order_product_qty_b = Number.isInteger(
                        numericValue / addedProductState[index].productPrice.product_number_a
                    )
                        ? numericValue / addedProductState[index].productPrice.product_number_a
                        : Number(
                              (numericValue / addedProductState[index].productPrice.product_number_a).toFixed(4)
                          );
                }
    
                // Calculate order_product_gross_amount
                updatedProducts[index].order_product_gross_amount = Number(
                    (
                        addedProductState[index].productPrice.product_number_a === 1
                            ? numericValue *
                              addedProductState[index].productPrice.product_price_unit_a *
                              addedProductState[index].productPrice.product_number_a
                            : numericValue * addedProductState[index].productPrice.product_price_unit_a
                    ).toFixed(4)
                );
            }
    
            if (name === 'order_product_qty_b') {
                // Determine order_product_qty_a
                if (addedProductState[index].productPrice.product_number_b === 1) {
                    updatedProducts[index].order_product_qty_a = Number.isInteger(
                        numericValue * addedProductState[index].productPrice.product_number_a
                    )
                        ? numericValue * addedProductState[index].productPrice.product_number_a
                        : Number(
                              (numericValue * addedProductState[index].productPrice.product_number_a).toFixed(4)
                          );
                } else {
                    updatedProducts[index].order_product_qty_a = Number.isInteger(
                        numericValue / addedProductState[index].productPrice.product_number_b
                    )
                        ? numericValue / addedProductState[index].productPrice.product_number_b
                        : Number(
                              (numericValue / addedProductState[index].productPrice.product_number_b).toFixed(4)
                          );
                }
    
                // Calculate order_product_gross_amount
                updatedProducts[index].order_product_gross_amount = Number(
                    (numericValue * addedProductState[index].productPrice.product_price_unit_b).toFixed(4)
                );
            }
    
            // Calculate updatedTotalAmount using updatedProducts
            let updatedTotalAmount = Number(
                (
                    updatedProducts.reduce(
                        (total, prod) => total + (Number(prod.order_product_gross_amount) || 0),
                        0
                    ) * 1.1
                ).toFixed(4)
            );
    
            return {
                ...prevState,
                order_total_amount: updatedTotalAmount,
                products: updatedProducts,
            };
        });
    };
    
    const handleSearchChange = (e) => {
        setOrderState({...orderState, order_ref: e.target.value});
    };

    const handleApplyLocationToAll = (index, isCustom = false) => {
        let copyText = '';

        // Determine the source of copyText based on isCustom
        if (isCustom) {
            copyText = orderState.custom_products[index]?.custom_product_location || '';
        } else {
            copyText = orderState.products[index]?.order_product_location || '';
        }

        const updatedProducts = orderState.products.map(product => ({
            ...product,
            order_product_location: copyText, // Set all product locations to the copied location
        }));

        const updatedCustomProducts = orderState.custom_products.map(cproduct => ({
            ...cproduct,
            custom_product_location: copyText
        }))
        
        setOrderState((prevState) => ({
            ...prevState,
            products: updatedProducts, // Update the products in state
            custom_products: updatedCustomProducts
        }));
    }; 

    
    const filterPurchaseOrderNumber = () => {
        return purchaseOrderState.filter(order => {
            const lowerCaseSearchTerm = orderState.order_ref.toLowerCase();
    
            // Check each field for the search term
            return (
                order.order_ref.toLowerCase().includes(lowerCaseSearchTerm)
            );
        });
    };

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
                productTypeState.find(type => type._id === product.product.product_type)?.type_name.toLowerCase().includes(lowerCaseSearchTerm) ||
                product.product.alias_name.toString().includes(lowerCaseSearchTerm) 
                // || product.productPrice.project_names.some(projectName => 
                //     projectName.toLowerCase().includes(lowerCaseSearchTerm)
                // )
            );
    
            const matchesProductType = selectedProductType 
                ? product.product.product_type === selectedProductType 
                : true; // If no product type is selected, don't filter by type
    
            return matchesSearchTerm && matchesProductType;
        });
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        
        if (orderState.products.length === 0 && orderState.custom_products.length === 0) {
            alert("You must have at least one product to submit a new order.")
            return
        }

        if (purchaseOrderState.some(order => order.order_ref.toLowerCase().includes(orderState.order_ref.toLowerCase()))) {
            alert("Purchase Order Number already exists. Please try another.")
            return
        }
    
        if (event.nativeEvent.submitter.name === 'draft') {
            const updatedState = {
                ...orderState,
                order_status: "Draft"
            };
            addPurchaseOrder(updatedState);
        } else {
            addPurchaseOrder(orderState); 
        }
    };
    
    // Fetch project
    useEffect(() => {
        const abortController = new AbortController();
        const signal = abortController.signal;

        const fetchProjects = async () => {
            setIsFetchProjectLoadingState(true);
            try {
                const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/project`, { signal , credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${sessionStorage.getItem('jwt')}` // Include token in Authorization header
                    }});
                if (!res.ok) {
                    throw new Error('Failed to fetch projects');
                }
                const data = await res.json();

                if (data.tokenError) {
                    throw new Error(data.tokenError);
                }
                
                setIsFetchProjectLoadingState(false);
                setProjectState(data);
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
    // Fetch Purchase Order
    useEffect(() => {
        const abortController = new AbortController();
        const signal = abortController.signal;

        const fetchOrders = async () => {
            setIsFetchOrderLoadingState(true);
            try {
                const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/order`, { signal , credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${sessionStorage.getItem('jwt')}` // Include token in Authorization header
                    }});
                if (!res.ok) {
                    throw new Error('Failed to fetch orders');
                }
                const data = await res.json();

                if (data.tokenError) {
                    throw new Error(data.tokenError);
                }
                
                setIsFetchOrderLoadingState(false);
                setPurchaseOrderState(data)
                setFetchOrderErrorState(null);
            } catch (error) {
                if (error.name === 'AbortError') {
                    // do nothing
                } else {
                    setIsFetchOrderLoadingState(false);
                    setFetchOrderErrorState(error.message);
                }
            }
        };

        fetchOrders();

        return () => {
            abortController.abort(); // Cleanup
        };
    }, []);
    // Fetch Product Types
    useEffect(() => {
        const abortController = new AbortController();
        const signal = abortController.signal;
    
        const fetchProductTypes = async () => {
            setIsFetchTypeLoading(true); // Set loading state to true at the beginning
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
                
                setIsFetchTypeLoading(false);
                setProductTypeState(data);
                setFetchTypeError(null);
            } catch (error) {
                if (error.name === 'AbortError') {
                    // do nothing
                } else {
                    setIsFetchTypeLoading(false);
                    setFetchTypeError(error.message);
                }
            }
        };
    
        fetchProductTypes();
    
        return () => {
            abortController.abort(); // Cleanup
        };
    }, []);   

    useEffect(() => {
        setAddedProductState(
            copiedState?.products.map(product => ({
                ...productState.find(p => p.product._id === product.product_obj_ref)
            }))
        );
    }, [copiedState]);

    // Display Loading
    if (isFetchProjectLoadingState || isFetchProductsLoadingState || isAddOrderLoadingState || isFetchSupplierLoading || isFetchOrderLoadingState || isFetchTypeLoading) {
        return <NewPurchaseOrderSkeleton/>;
    }

    // Display Error
    const renderErrorState = (errorState) => {
        if (!errorState) return null;
        if (errorState.includes("jwt expired")) {
            return <div><SessionExpired /></div>;
        }
        return (
            <div>
                <p>Error: {errorState}</p>
            </div>
        );
    };
    const errorComponent = renderErrorState(fetchProductsErrorState) || renderErrorState(fetchSupplierError) || renderErrorState(addOrderErrorState) || renderErrorState(fetchOrderErrorState) || renderErrorState(fetchProjectErrorState) || renderErrorState(fetchTypeError);
    if (errorComponent) return errorComponent;

    // Confirmation Modal
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
        localUser && Object.keys(localUser).length > 0 ? (
        <>
        {/* PAGE HEADER */}
        <div className='mx-4 mt-2 sm:mt-4 p-1 sm:p-2 text-center font-bold text-sm sm:text-base md:text-lg lg:text-xl bg-slate-800 text-white rounded-t-lg'>
            NEW PURCHASE ORDER
        </div>
        <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-2 mx-4 mb-1 sm:mb-4">
                <div className="border rounded-b-lg p-2 sm:p-4 text-xs lg:text-base"> 
                    
                        {/* PURCHASE ORDER MAIN DETAILS */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-1 lg:gap-x-4">
                            <div className="hidden mb-1 lg:grid">
                                <label className="form-label font-bold">*Purchase Order No:</label>
                                <input
                                type="text"
                                className="form-control text-xs lg:text-base"
                                name="order_ref"
                                value={orderState.order_ref}
                                onChange={handleSearchChange}
                                required
                                onInvalid={(e) => {
                                    e.target.setCustomValidity('Please enter purchase order number');
                                    e.target.closest('div').classList.remove('hidden'); // Make it visible
                                  }}
                                onInput={(e) => e.target.setCustomValidity('')}
                                />
                            </div>

                            <div className="mb-1">
                                <label className="form-label font-bold">*Project:</label>
                                <select
                                className="form-control shadow-sm cursor-pointer text-xs lg:text-base"
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
                                className="form-control shadow-sm cursor-pointer text-xs lg:text-base"
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

                            <div className="mb-1 lg:hidden">
                                <label className="form-label font-bold">*Purchase Order No:</label>
                                <input
                                type="text"
                                className="form-control text-xs lg:text-base"
                                name="order_ref"
                                value={orderState.order_ref}
                                onChange={handleSearchChange}
                                required
                                onInvalid={(e) => e.target.setCustomValidity('Please enter purchase order number')}
                                onInput={(e) => e.target.setCustomValidity('')}
                                />
                            </div>

                            <div className='lg:mb-3 p-1'>
                                <label className="text-xs italic text-gray-400 mb-2">
                                    Previous PO:
                                    {purchaseOrderState?.slice(0, 3).map((order, index) => (
                                        <div key={index} className="inline-block ml-1 border rounded-lg px-1">
                                        {order.order_ref}
                                        </div>
                                    ))}
                                </label>
                                <div className="text-xs italic text-gray-400">
                                Based on search:
                                {purchaseOrderState && filterPurchaseOrderNumber()
                                    .filter((order) => order.order_isarchived === false)
                                    .slice(0, 3)
                                    .map((order, index) => (
                                    <div key={index} className="inline-block ml-1 border rounded-lg px-1">
                                        {order.order_ref}
                                    </div>
                                    ))}
                                </div>
                            </div>
                            
                            {/* ***** ORDER DATE ****** */}
                            <div>
                                <label className="form-label font-bold">*Order Date:</label>
                                <input
                                type="date"
                                className="form-control text-xs lg:text-base"
                                name="order_date"
                                value={orderState.order_date}
                                onChange={handleInputChange}
                                required
                                onInvalid={(e) => e.target.setCustomValidity('Enter Order Date')}
                                onInput={(e) => e.target.setCustomValidity('')}
                                />
                            </div>

                            <div>
                                <label className="form-label font-bold">EST Date and Time:</label>
                                <input
                                type="datetime-local"
                                className="form-control text-xs lg:text-base"
                                name="order_est_datetime"
                                value={orderState.order_est_datetime}
                                onChange={handleInputChange}
                                onInvalid={(e) => e.target.setCustomValidity('Enter EST Date and Time')}
                                onInput={(e) => e.target.setCustomValidity('')}
                                />
                                <label className="hidden lg:inline-block text-xs italic text-gray-400">(EST) - Delivery estimate time of arrival</label>
                            </div>
                            
                        </div>

                        {/* ***** SEARCH ITEM TABLE ****** */}
                        <div className="container p-0 border-2 shadow-md bg-slate-50 text-xs lg:text-base mt-1 lg:mt-0">
                            <div className="grid grid-cols-1 lg:grid-cols-3 m-1 lg:m-2 gap-x-1">
                                <input
                                    type="text"
                                    ref={searchInputRef} // Attach the ref here to retain focus
                                    className="form-control mb-1 col-span-2 placeholder-gray-400 placeholder-opacity-50 text-xs lg:text-base"
                                    placeholder="Search products..."
                                    value={searchProductTerm}
                                    onChange={(e) => setSearchProductTerm(e.target.value)}
                                />
                                <div>
                                    <select
                                    className="form-control shadow-sm cursor-pointer opacity-95 text-xs lg:text-base"
                                    name="product_type"
                                    value={selectedProductType}
                                    onChange={(e) => setSelectedProductType(e.target.value)}
                                    >
                                    <option value="">Filter by Product Type...</option>
                                    {productTypeState.filter(type => productState?.some(object => object.product.product_type === type._id)).map((productType, index) => (
                                        <option key={index} value={productType._id}>
                                            {productType.type_name}
                                        </option>
                                    ))}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 lg:grid-cols-5 gap-1 p-1 font-bold bg-gray-200 text-center text-xs lg:text-sm">
                                <div className='p-1'><label>SKU</label></div>
                                <div className='p-1'><label>Name</label></div>
                                <div className='p-1 hidden lg:grid'><label>Unit A</label></div>
                                <div className='p-1 hidden lg:grid'><label>Unit B</label></div>
                                <div className='lg:grid lg:grid-cols-3 gap-2 p-1 hidden'><label className='col-span-2'>Type</label></div>
                            </div>
                            { productState ? filterProductsBySearchTerm().filter(product => product.productPrice.projects.includes(selectedProject)).filter(product => orderState.order_date >= product.productPrice.product_effective_date).filter((product, index, self) => index === self.findIndex((p) => p.product._id === product.product._id)).slice(0,15).map((product, index) => (
                                <div key={index} className="grid grid-cols-2 lg:grid-cols-5 gap-1 p-1 border-b text-xs lg:text-sm text-center hover:bg-slate-100" title='Add to order'>
                                    <div className='flex lg:inline-block justify-center gap-2'>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="lg:hidden size-5 cursor-pointer text-green-600 justify-self-end hover:scale-110" onClick={() => handleAddItem(product)}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                                        </svg>
                                        <label>{product.product.product_sku}</label>
                                    </div>
                                    <div>{product.product.product_name}</div>
                                    <div className='hidden lg:grid'>{product.productPrice.product_number_a}<span className='ml-2 opacity-50'>{product.productPrice.product_unit_a}</span></div>
                                    <div className='hidden lg:grid'>{product.productPrice.product_number_b}<span className='ml-2 opacity-50'>{product.productPrice.product_unit_b}</span></div>
                                    <div className='hidden lg:grid grid-cols-3 gap-2 p-1'>
                                        <label className="col-span-2">{productTypeState.find(type => type._id === product.product.product_type)?.type_name || 'Unknown'}</label>
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
                <div className="border rounded-b-lg p-2 sm:p-4 text-xs lg:text-base">
                    {/* ***** ADDED ITEM TABLE ****** */}
                    <label className="font-bold">Order Items:</label>
                    <div className='bg-gray-100 border rounded-lg shadow-sm'>
                        <div className="border-0 rounded-lg overflow-x-auto">
                            <table className="table m-0 text-xs">
                                <thead className="thead-dark text-center">
                                <tr className="table-primary">
                                    <th scope="col" className='hidden lg:table-cell'>SKU</th>
                                    <th scope="col">Name</th>
                                    <th scope="col">Location</th>
                                    <th scope="col">Qty A</th>
                                    <th scope="col">Qty B</th>
                                    <th scope="col" className='hidden lg:table-cell'>Price A</th>
                                    <th scope="col" className='hidden lg:table-cell'>Net Amount</th>
                                    <th scope="col"></th>
                                </tr>
                                </thead>
                                <tbody className="text-center">
                                {orderState.products && orderState.products.map((prod, index) => (
                                    <tr key={index}>
                                        <td className='hidden lg:table-cell'>
                                            <label>{addedProductState[index].product.product_sku}</label>
                                        </td>
                                        <td>
                                            <label>{addedProductState[index].product.product_name}</label>
                                        </td>
                                        <td className="whitespace-nowrap">
                                            <div className="inline-block align-middle">
                                                <input
                                                    type="text"
                                                    className="form-control px-1 py-0.5 text-xs placeholder-gray-400 placeholder-opacity-50 border border-gray-300 rounded w-36"
                                                    name="order_product_location"
                                                    value={prod.order_product_location}
                                                    onChange={(e) => handleInputChange(e, index, true)}
                                                    placeholder="Ex: Level 2"
                                                    required
                                                    onInvalid={(e) => e.target.setCustomValidity('Enter item location')}
                                                    onInput={(e) => e.target.setCustomValidity('')}
                                                />
                                            </div>
                                            <div
                                                className="inline-block align-middle ml-1 text-xs text-gray-600 hover:underline hover:text-blue-600 cursor-pointer"
                                                title='Paste location to all'
                                                onClick={() => handleApplyLocationToAll(index)}
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    strokeWidth="1.5"
                                                    stroke="currentColor"
                                                    className="w-4 h-4 inline-block"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75"
                                                    />
                                                </svg>
                                            </div>
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
                                            <label className="text-xs opacity-50 col-span-1 text-nowrap">{addedProductState[index].productPrice.product_unit_a}</label>
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
                                            <label className="text-xs opacity-50 col-span-1 text-nowrap">{addedProductState[index].productPrice.product_unit_b}</label>
                                            </div>
                                        </td>
                                        <td className='hidden lg:table-cell'>
                                            <label>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Math.floor(prod.order_product_price_unit_a * 100) / 100)}</label>
                                        </td>
                                        <td className='hidden lg:table-cell'>
                                            <label>
                                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Math.floor((
                                                addedProductState[index].productPrice.product_number_a === 1 
                                                ? (prod.order_product_qty_a * (prod.order_product_price_unit_a || 0) * addedProductState[index].productPrice.product_number_a) 
                                                : (prod.order_product_qty_a * (prod.order_product_price_unit_a || 0))
                                            ) * 100) / 100)}
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
                                {orderState.custom_products.map((cproduct, index) => (
                                <tr key={index}>
                                    <td>Custom {index + 1}</td>
                                    <td>
                                        <input
                                            type="text"
                                            className="form-control px-1 py-0.5 text-xs placeholder-gray-400 placeholder-opacity-50" 
                                            name="custom_product_name" 
                                            value={cproduct.custom_product_name} 
                                            onChange={(e) => handleInputChange(e, index, false, true)}
                                            placeholder="Custom name"
                                            onInvalid={(e) => e.target.setCustomValidity('Enter custom item name')}
                                            onInput={(e) => e.target.setCustomValidity('')}
                                            required
                                        />
                                    </td>
                                    <td className="whitespace-nowrap">
                                        <div className="inline-block align-middle">
                                            <input
                                                type="text"
                                                className="form-control px-1 py-0.5 text-xs placeholder-gray-400 placeholder-opacity-50 w-36"  
                                                name="custom_product_location" 
                                                value={cproduct.custom_product_location} 
                                                onChange={(e) => handleInputChange(e, index, false, true)}
                                                placeholder="Ex: Level 2"
                                                onInvalid={(e) => e.target.setCustomValidity('Enter custom item location')}
                                                onInput={(e) => e.target.setCustomValidity('')}
                                            />
                                        </div>
                                        <div
                                            className="inline-block align-middle ml-1 text-xs text-gray-600 hover:underline hover:text-blue-600 cursor-pointer"
                                            title='Paste location to all'
                                            onClick={() => handleApplyLocationToAll(index, true)}
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth="1.5"
                                                stroke="currentColor"
                                                className="w-4 h-4 inline-block"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75"
                                                />
                                            </svg>
                                        </div>
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
                                    <td className='hidden lg:table-cell'>-</td>
                                    <td className='hidden lg:table-cell'>-</td>
                                    <td className='hidden lg:table-cell'>-</td>
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
                                            <td className='pt-1'>{orderState.products.length + orderState.custom_products.length} </td>
                                        </tr>
                                        <tr>
                                            <td className="pt-1">Total Net Amount:</td>
                                            <td className="pt-1">
                                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
                                                Math.floor(
                                                    (orderState.products?.reduce((total, prod) => total + (Number(prod.order_product_gross_amount) || 0), 0) || 0) * 100
                                                ) / 100
                                                )}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className='pt-1'>Total Net Amount (incl. GST):</td>
                                            <td className="pt-1">
                                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
                                                    Math.floor(
                                                    ((orderState.products?.reduce((total, prod) => 
                                                        total + (Number(prod.order_product_gross_amount) || 0), 0) * 1.1) || 0) * 100
                                                    ) / 100
                                                )}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* ***** INTERNAL COMMENTS ***** */}
                    <div className="my-2">
                        <label className="form-label font-bold">Internal comments:</label>
                        <textarea 
                            className="form-control placeholder-gray-400 placeholder-opacity-50 text-xs lg:text-base" 
                            name="order_internal_comments" 
                            value={orderState.order_internal_comments} 
                            onChange={handleInputChange}
                            placeholder='Enter order related internal comments...'
                            rows={2}
                        />
                    </div>
                    {/* ***** NOTES TO SUPPLIER ***** */}
                    <div className="my-2">
                        <label className="form-label font-bold">Notes to supplier:</label>
                        <textarea
                            className="form-control bg-yellow-200 placeholder-gray-500 placeholder-opacity-50 text-xs lg:text-base" 
                            name="order_notes_to_supplier" 
                            value={orderState.order_notes_to_supplier} 
                            onChange={handleInputChange}
                            placeholder='Enter some notes to supplier...'
                            rows={4}
                        />
                    </div>

                    {/* ***** BUTTONS ***** */}
                    <div className="flex flex-col lg:flex-row justify-between space-y-4 lg:space-y-0 lg:space-x-4">
                        <button type="button" onClick={handleBackClick} 
                                className="btn btn-secondary w-full lg:w-auto">
                            CANCEL
                        </button>
                        
                        <button className="btn border rounded bg-gray-700 text-white hover:bg-gray-800 w-full lg:w-auto" 
                                type="submit" name="draft">
                            SAVE AS DRAFT
                        </button>
                        
                        <div className="text-sm w-full lg:w-auto">
                            <label className="font-bold">Order status:</label>
                            <select
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm cursor-pointer text-xs lg:text-base"
                                name="order_status"
                                value={orderState.order_status}
                                onChange={(e) => handleInputChange(e)}
                                required
                            >
                                <option value="Pending">Pending</option>
                                <option value="Approved">Approved</option>
                                <option value="Rejected">Rejected</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                        </div>
                        
                        <button className="btn btn-primary w-full lg:w-auto" 
                                type="submit" name="submit">
                            SUBMIT
                        </button>
                    </div>

                    
                </div>
                { confirmationModal }
            </div>
        </form>
        </> ) : ( <UnauthenticatedSkeleton /> )
    );
};

export default NewPurchaseOrderForm;
