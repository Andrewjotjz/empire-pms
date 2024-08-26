// Import modules
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFetchProductsBySupplier } from '../../hooks/useFetchProductsBySupplier';
import { useFetchSupplierByProject } from '../../hooks/useFetchSupplierByProject';
import { clearSupplierState } from '../../redux/supplierSlice'
import { setProjectState } from '../../redux/projectSlice'
import { clearProductState } from '../../redux/productSlice'
import SessionExpired from '../../components/SessionExpired';
import EmployeeDetailsSkeleton from '../loaders/EmployeeDetailsSkeleton';
import { useSelector, useDispatch } from 'react-redux';
import { Modal, Button } from "react-bootstrap";

const NewPurchaseOrderForm = () => {
    // Component router
    const navigate = useNavigate();

    // Component hook
    const dispatch = useDispatch();
    const { fetchProductsBySupplier, isFetchProductsLoadingState, fetchProductsErrorState } = useFetchProductsBySupplier();
    const { fetchSupplierByProject } = useFetchSupplierByProject();

    // Component state
    const supplierState = useSelector((state) => state.supplierReducer.supplierState)
    const productState = useSelector((state) => state.productReducer.productState)
    const projectState = useSelector((state) => state.projectReducer.projectState)
    const purchaseOrderState = useSelector((state) => state.purchaseOrderReducer.purchaseOrderState)
    const [selectedSupplier, setSelectedSupplier] = useState('');
    const [selectedProject, setSelectedProject] = useState('');
    const [isFetchProjectLoadingState, setIsFetchProjectLoadingState] = useState(true);
    const [fetchProjectErrorState, setFetchProjectErrorState] = useState(null);
    const [ itemSize, setItemSize ] = useState([{
        min_qty_a: '',
        min_qty_b: '',
        last_qty_a: '',
        last_qty_b: ''
    }])
    const [ itemUOM, setItemUOM ] = useState([{
        order_product_unit_a: '',
        order_product_unit_b: ''
    }])
    const [orderState, setOrderState] = useState({
        supplier: '',
        order_ref: '',
        order_date: '',
        order_est_datetime: '',
        products: [{
            product_id: '',
            order_product_location: '',
            order_product_qty_a: '',
            order_product_qty_b: '',
            order_product_price_unit_a: '',
            order_product_gross_amount: ''
        }],
        custom_products: [],
        order_total_amount: '',
        order_internal_comments: '',
        order_notes_to_supplier: '',
        project: '',
        order_status: 'Draft'
    })
    const alphabets = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p']
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [newSupplier, setNewSupplier] = useState('');
    const [newProject, setNewProject] = useState('');
    const [selectedProductType, setSelectedProductType] = useState('')
    const [pendingAction, setPendingAction] = useState(null);


    // Component functions and variables
    const handleBackClick = () => navigate(`/EmpirePMS/order/`);

    const handleProjectChange = (event) => {        
        const targetProject = event.target.value
        if (targetProject !== '') {
            //this is first render's changes
            if (selectedProject === '') {
                setSelectedProject(targetProject);
                dispatch(clearProductState());
                setItemSize([{
                    min_qty_a: '',
                    min_qty_b: '',
                    last_qty_a: '',
                    last_qty_b: ''
                }]);
                setOrderState({
                    supplier: '',
                    order_ref: '',
                    order_date: '',
                    order_est_datetime: '',
                    products: [{
                        product_id: '',
                        order_product_location: '',
                        order_product_qty_a: '',
                        order_product_qty_b: '',
                        order_product_price_unit_a: '',
                        order_product_gross_amount: ''
                    }],
                    custom_products: [],
                    order_total_amount: '',
                    order_internal_comments: '',
                    order_notes_to_supplier: '',
                    project: '',
                    order_status: 'Draft'
                });
                setItemUOM([{
                    order_product_unit_a: '',
                    order_product_unit_b: ''
                }])
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
                setItemSize([{
                    min_qty_a: '',
                    min_qty_b: '',
                    last_qty_a: '',
                    last_qty_b: ''
                }]);
                setOrderState({
                    supplier: '',
                    order_ref: '',
                    order_date: '',
                    order_est_datetime: '',
                    products: [{
                        product_id: '',
                        order_product_location: '',
                        order_product_qty_a: '',
                        order_product_qty_b: '',
                        order_product_price_unit_a: '',
                        order_product_gross_amount: ''
                    }],
                    custom_products: [],
                    order_total_amount: '',
                    order_internal_comments: '',
                    order_notes_to_supplier: '',
                    project: '',
                    order_status: 'Draft'
                });
                setItemUOM([{
                    order_product_unit_a: '',
                    order_product_unit_b: ''
                }])
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
            setItemSize([{
                min_qty_a: '',
                min_qty_b: '',
                last_qty_a: '',
                last_qty_b: ''
            }]);
            setOrderState({
                supplier: '',
                order_ref: '',
                order_date: '',
                order_est_datetime: '',
                products: [{
                    product_id: '',
                    order_product_location: '',
                    order_product_qty_a: '',
                    order_product_qty_b: '',
                    order_product_price_unit_a: '',
                    order_product_gross_amount: ''
                }],
                custom_products: [],
                order_total_amount: '',
                order_internal_comments: '',
                order_notes_to_supplier: '',
                project: '',
                order_status: 'Draft'
            });
            setItemUOM([{
                order_product_unit_a: '',
                order_product_unit_b: ''
            }])
            fetchProductsBySupplier(newSupplier);
            setSelectedSupplier(newSupplier);
        }
        if (pendingAction === 'changeProject') {
            dispatch(clearProductState());
            setItemSize([{
                min_qty_a: '',
                min_qty_b: '',
                last_qty_a: '',
                last_qty_b: ''
            }]);
            setOrderState({
                supplier: '',
                order_ref: '',
                order_date: '',
                order_est_datetime: '',
                products: [{
                    product_id: '',
                    order_product_location: '',
                    order_product_qty_a: '',
                    order_product_qty_b: '',
                    order_product_price_unit_a: '',
                    order_product_gross_amount: ''
                }],
                custom_products: [],
                order_total_amount: '',
                order_internal_comments: '',
                order_notes_to_supplier: '',
                project: '',
                order_status: 'Draft'
            });
            setItemUOM([{
                order_product_unit_a: '',
                order_product_unit_b: ''
            }])
            setSelectedSupplier('')
            fetchSupplierByProject(newProject);
            setSelectedProject(newProject);
        }
        setShowConfirmationModal(false);
        setPendingAction(null);
    };    

    const handleAddItem = () => {
        if ( orderState.products.length < 30) {
            setOrderState({
                ...orderState,
                products: [...orderState.products, {
                    product_id: '',
                    order_product_location: '',
                    order_product_qty_a: '',
                    order_product_qty_b: '',
                    order_product_price_unit_a: '',
                    order_product_gross_amount: ''
                }]
            });
            setItemSize([
                ...itemSize,{
                min_qty_a: '',
                min_qty_b: '',
                last_qty_a: '',
                last_qty_b: ''
            }])
            setItemUOM([
                ...itemUOM,{
                order_product_unit_a: '',
                order_product_unit_b: ''
            }])
        } else {
            alert("You can add up to 30 items only.")
        }
    }

    const handleAddCustomItem = (index) => {
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
        const updatedItemsSize = itemSize.filter((_, idx) => idx !== index)
        const updatedItemsUOM = itemUOM.filter((_, idx) => idx !== index)
        setOrderState({
            ...orderState,
            products: updatedItems
        })
        setItemSize(updatedItemsSize)
        setItemUOM(updatedItemsUOM)
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
    
                // If the 'product_sku' is being changed, update the corresponding 'product_name'
                if (name === "product_sku") {
                    const selectedProduct = productState.find(prod => prod.product.product_sku === value);
                    if (selectedProduct) {
                        updatedProducts[index].product_name = selectedProduct.product.product_name;
                        updatedProducts[index].product_id = selectedProduct.product._id;
                        updatedProducts[index].order_product_price_unit_a = selectedProduct.productPrice.product_price_unit_a;
                        setItemSize((prevItemState) => {
                            const updatedItemSize = [...prevItemState];
                            updatedItemSize[index] = {
                                min_qty_a: selectedProduct.productPrice.product_number_a,
                                min_qty_b: selectedProduct.productPrice.product_number_b,
                            };
                            return updatedItemSize;
                        });
                        setItemUOM((prevItemState) => {
                            const updatedItemSize = [...prevItemState];
                            updatedItemSize[index] = {
                                order_product_unit_a: selectedProduct.productPrice.product_unit_a,
                                order_product_unit_b: selectedProduct.productPrice.product_unit_b,
                            };
                            return updatedItemSize;
                        });
                        updatedProducts[index].order_product_qty_a = selectedProduct.productPrice.product_number_a;
                        updatedProducts[index].order_product_qty_b = selectedProduct.productPrice.product_number_b;
                    }
                }
    
                // If the 'product_name' is being changed, update the corresponding 'product_sku'
                if (name === "product_name") {
                    const selectedProduct = productState.find(prod => prod.product.product_name === value);
                    if (selectedProduct) {
                        updatedProducts[index].product_sku = selectedProduct.product.product_sku;
                        updatedProducts[index].product_id = selectedProduct.product._id;
                        updatedProducts[index].order_product_price_unit_a = selectedProduct.productPrice.product_price_unit_a;
                        setItemSize((prevItemState) => {
                            const updatedItemSize = [...prevItemState];
                            updatedItemSize[index] = {
                                min_qty_a: selectedProduct.productPrice.product_number_a,
                                min_qty_b: selectedProduct.productPrice.product_number_b,
                            };
                            return updatedItemSize;
                        });
                        setItemUOM((prevItemState) => {
                            const updatedItemSize = [...prevItemState];
                            updatedItemSize[index] = {
                                order_product_unit_a: selectedProduct.productPrice.product_unit_a,
                                order_product_unit_b: selectedProduct.productPrice.product_unit_b,
                            };
                            return updatedItemSize;
                        });
                        updatedProducts[index].order_product_qty_a = selectedProduct.productPrice.product_number_a;
                        updatedProducts[index].order_product_qty_b = selectedProduct.productPrice.product_number_b;
                    }
                }

                if (name === 'order_product_qty_a') {
                    updatedProducts[index].order_product_qty_b = Number(updatedProducts[index].order_product_qty_b) + itemSize[index].min_qty_b
                    setItemSize((prevItemState) => {
                        const updatedItemSize = [...prevItemState];
                        updatedItemSize[index] = {
                            ...updatedItemSize[index],
                            last_qty_a: Number(value),
                            last_qty_b: updatedProducts[index].order_product_qty_b
                        };
                        return updatedItemSize;
                    });
                    if (Number(value) < itemSize[index].last_qty_a && itemSize[index].last_qty_a !== ''){
                        updatedProducts[index].order_product_qty_b = itemSize[index].last_qty_b - itemSize[index].min_qty_b
                        setItemSize((prevItemState) => {
                            const updatedItemSize = [...prevItemState];
                            updatedItemSize[index] = {
                                ...updatedItemSize[index],
                                last_qty_a: Number(value),
                                last_qty_b: updatedProducts[index].order_product_qty_b
                            };
                            return updatedItemSize;
                        });
                    }
                }
                if (name === 'order_product_qty_b') {
                    updatedProducts[index].order_product_qty_a = Number(updatedProducts[index].order_product_qty_a) + itemSize[index].min_qty_a
                    setItemSize((prevItemState) => {
                        const updatedItemSize = [...prevItemState];
                        updatedItemSize[index] = {
                            ...updatedItemSize[index],
                            last_qty_a: updatedProducts[index].order_product_qty_a,
                            last_qty_b: Number(value)
                        };
                        return updatedItemSize;
                    });
                    if (Number(value) < itemSize[index].last_qty_b && itemSize[index].last_qty_b !== ''){
                        updatedProducts[index].order_product_qty_a = itemSize[index].last_qty_a - itemSize[index].min_qty_a
                        setItemSize((prevItemState) => {
                            const updatedItemSize = [...prevItemState];
                            updatedItemSize[index] = {
                                ...updatedItemSize[index],
                                last_qty_a: updatedProducts[index].order_product_qty_a,
                                last_qty_b: Number(value)
                            };
                            return updatedItemSize;
                        });
                    }
                }

                if (value === '') {
                    updatedProducts[index].product_sku = ''
                    updatedProducts[index].product_name = ''
                    updatedProducts[index].order_product_price_unit_a = ''
                }
    
                return {
                    ...prevState,
                    products: updatedProducts,
                };
            }
    
            // Handle custom products array updates
            if (isCustomProduct && index !== null) {
                const updatedCustomProducts = prevState.custom_products.map((product, i) => 
                    i === index ? { ...product, [name]: value } : product
                );
                return {
                    ...prevState,
                    custom_products: updatedCustomProducts,
                };
            }
    
            // Handle other updates
            return {
                ...prevState,
                [name]: value,
            };
        });
    };

    const handleSearchChange = (e) => {
        setOrderState({...orderState, order_ref: e.target.value});
    };

    const filterOrders = () => {
        return purchaseOrderState.filter(order => {
            const lowerCaseSearchTerm = orderState.order_ref.toLowerCase();
    
            // Check each field for the search term
            return (
                order.order_ref.toLowerCase().includes(lowerCaseSearchTerm)
            );
        });
    };

    const filterProductsByProject = () => {
        if (!Array.isArray(productState) || !selectedProject) {
            return []; // Return an empty array if productState is not an array or selectedProject is not defined
        }

        return productState.filter(prod => prod.productPrice.projects.includes(selectedProject))

        // .filter(item => item.product.product_types.includes(selectedProductType))
    } 

    const distinctProductTypes = [
        // new Set(...): Converts the array into a Set which automatically removes duplicates.
        // [...new Set(...)]: Converts the Set back into an array with only distinct values.
        ...new Set(filterProductsByProject().map((prod) => prod.product.product_types))
    ];

    // const getLatestProductsByProject = () => {
    //     if (!Array.isArray(productState) || !selectedProject) {
    //         return []; // Return an empty array if productState is not an array or selectedProject is not defined
    //     }

    //     // Filter products by the specified project ID
    //     const filteredProducts = productState.filter(prod =>
    //         prod.productPrice.projects.includes(selectedProject)
    //     );
    
    //     // Find the latest product effective date
    //     const latestDate = Math.max(
    //         ...filteredProducts.map(prod => new Date(prod.productPrice.product_effective_date))
    //     );
    
    //     // Convert the latest date back to ISO string format
    //     const latestDateISO = new Date(latestDate).toISOString();
    
    //     // Filter the products by the latest effective date
    //     const latestProducts = filteredProducts.filter(
    //         prod => new Date(prod.productPrice.product_effective_date).toISOString() === latestDateISO
    //     );
    
    //     return latestProducts;
    // }

    const getLatestProductsByProject = () => {
        if (!Array.isArray(productState) || !selectedProject) {
                    return []; // Return an empty array if productState is not an array or selectedProject is not defined
                }

        // Filter products by the specified project ID
        const filteredProducts = productState.filter(prod =>
            prod.productPrice.projects.includes(selectedProject)
        );
    
        // Create a map to store the latest productPrice for each product by product ID
        const latestProductMap = new Map();
    
        filteredProducts.forEach(prod => {
            const productId = prod.product._id;
            const productEffectiveDate = new Date(prod.productPrice.product_effective_date);
    
            // If the product is not in the map, or the current productPrice is more recent, update the map
            if (!latestProductMap.has(productId) || productEffectiveDate > new Date(latestProductMap.get(productId).productPrice.product_effective_date)) {
                latestProductMap.set(productId, prod);
            }
        });
    
        // Convert the map values back to an array
        return Array.from(latestProductMap.values());
    }

    const handleSubmit = (event) => {
        event.preventDefault();
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
    if (isFetchProjectLoadingState || isFetchProductsLoadingState) {
        return <EmployeeDetailsSkeleton />;
    }

    if (fetchProjectErrorState) {
        if (fetchProjectErrorState.includes("Session expired") ) {
            return <div><SessionExpired /></div>;
        }
        return <div><p>Error: {fetchProjectErrorState}</p><p>Error: {fetchProductsErrorState}</p></div>;
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
        <div className="container mt-3 mb-4 pb-3"> 
            <div className="card">
                <div className="card-header bg-dark text-white">
                    <h1>NEW PURCHASE ORDER</h1>
                </div>
                <form className="card-body" onSubmit={handleSubmit}>
                    {/* SELECT SUPPLIER */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4">
                        <div className="mb-3">
                            <label className="form-label font-bold">*Purchase Order No:</label>
                            <input
                            type="text"
                            className="form-control"
                            name="order_ref"
                            value={orderState.order_ref}
                            onChange={handleSearchChange}
                            required
                            onInvalid={(e) => e.target.setCustomValidity('Please enter purchase order number')}
                            onInput={(e) => e.target.setCustomValidity('')}
                            />
                            <label className="text-xs italic text-gray-400">
                            Previous 3 order reference numbers:
                            {purchaseOrderState.slice(0, 3).map((order, index) => (
                                <div key={index} className="inline-block ml-1 border rounded-lg px-1">
                                {order.order_ref}
                                </div>
                            ))}
                            </label>
                            <div className="text-xs italic text-gray-400">
                            Based on your search:
                            {filterOrders()
                                .filter((order) => order.order_isarchived === false)
                                .slice(0, 3)
                                .map((order, index) => (
                                <div key={index} className="inline-block ml-1 border rounded-lg px-1">
                                    {order.order_ref}
                                </div>
                                ))}
                            </div>
                        </div>

                        <div className="mb-3">
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

                        <div className="mb-3">
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

                        <div className="mb-3">
                            <label className="form-label font-bold">*Order Date:</label>
                            <input
                            type="date"
                            className="form-control"
                            name="order_date"
                            value={orderState.order_date}
                            onChange={handleInputChange}
                            required
                            onInvalid={(e) => e.target.setCustomValidity('Enter Order Date')}
                            onInput={(e) => e.target.setCustomValidity('')}
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label font-bold">*EST Date and Time:</label>
                            <input
                            type="datetime-local"
                            className="form-control"
                            name="order_est_datetime"
                            value={orderState.order_est_datetime}
                            onChange={handleInputChange}
                            required
                            onInvalid={(e) => e.target.setCustomValidity('Enter EST Date and Time')}
                            onInput={(e) => e.target.setCustomValidity('')}
                            />
                            <label className="text-xs italic text-gray-400">(EST) - Delivery estimate time of arrival</label>
                        </div>
                    </div>

                    {/* ***** ITEM TABLE ****** */}
                    <div className="container p-0 border-2 mb-2 shadow-md bg-slate-50">
                        <div className="m-2 justify-center">
                            <label className="form-label font-bold">Product Type:</label>
                            <select 
                                className="ml-2 shadow-sm cursor-pointer rounded-md"
                                name="product_types" 
                                value={selectedProductType} 
                                onChange={(e) => setSelectedProductType(e.target.value)}
                            >
                                <option value="">Select type</option>
                                {distinctProductTypes.map((productType, index) => (
                                <option key={index} value={productType}>
                                    {productType}
                                </option>
                                ))}
                            </select>
                        </div>
                        <table className="table table-bordered m-0 mb-2">
                            <thead className="thead-dark text-center">
                                <tr className="table-primary">
                                    <th scope="col" className='text-nowrap'>Item #</th>
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
                            <tbody className='text-center'>
                                {/* ***** PRE-MADE ITEMS ***** */}
                                {orderState.products.map((product, index) => (
                                <tr key={index}>
                                    <th scope="row">{index + 1}</th>
                                    <td>
                                        <select 
                                            className="form-control shadow-sm cursor-pointer"
                                            name="product_sku"
                                            value={product.product_sku} // Bind the value to state
                                            title={product.product_sku}
                                            onChange={(e) => handleInputChange(e, index, true)}
                                            required
                                        >
                                            <option value="">Select Product SKU</option>
                                            {productState && productState.length > 0 && 
                                                getLatestProductsByProject().map((prod, i) => {
                                                    return <option key={i} value={prod.product.product_sku}>{prod.product.product_sku}</option>;
                                                })
                                            }
                                        </select>
                                    </td>
                                    <td>
                                        <select 
                                            className="form-control shadow-sm cursor-pointer"
                                            name="product_name"
                                            value={product.product_name} // Bind the value to state
                                            title={product.product_name}
                                            onChange={(e) => handleInputChange(e, index, true)}
                                            required
                                        >
                                            <option value="">Select Product Name</option>
                                            {productState && productState.length > 0 && 
                                                getLatestProductsByProject().map((prod, i) => {
                                                    return <option key={i} value={prod.product.product_name}>{prod.product.product_name}</option>;
                                                })
                                            }
                                        </select>
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            className="form-control" 
                                            name="order_product_location" 
                                            value={product.order_product_location} 
                                            onChange={(e) => handleInputChange(e, index, true)}
                                            placeholder="Ex: Level 2"
                                            required
                                            onInvalid={(e) => e.target.setCustomValidity('Enter item location')}
                                            onInput={(e) => e.target.setCustomValidity('')}
                                        />
                                    </td>
                                    <td>
                                        <div className='grid grid-cols-3 items-center border rounded w-32'>
                                            <input
                                                type='number'
                                                name="order_product_qty_a" 
                                                value={product.order_product_qty_a} 
                                                onChange={(e) => handleInputChange(e, index, true)}
                                                min={Number(itemSize[index]?.min_qty_a) || 0}
                                                step={Number(itemSize[index]?.min_qty_a) || 1}
                                                required
                                                onInvalid={(e) => e.target.setCustomValidity('Enter qty-A')}
                                                onInput={(e) => e.target.setCustomValidity('')}
                                                className='px-1 py-1 ml-1 col-span-2'
                                            />
                                            <label className='text-sm opacity-50 col-span-1 text-nowrap'>{itemUOM[index].order_product_unit_a ? itemUOM[index].order_product_unit_a : "UNIT"}</label>
                                        </div>
                                    </td>
                                    <td>
                                        <div className='grid grid-cols-3 items-center border rounded w-32'>
                                            <input
                                                type='number'
                                                name="order_product_qty_b" 
                                                value={product.order_product_qty_b} 
                                                onChange={(e) => handleInputChange(e, index, true)}
                                                min={Number(itemSize[index]?.min_qty_b) || 0}
                                                step={Number(itemSize[index]?.min_qty_b) || 1}
                                                required
                                                onInvalid={(e) => e.target.setCustomValidity('Enter qty-B')}
                                                onInput={(e) => e.target.setCustomValidity('')}
                                                 className='px-1 py-1 ml-1 col-span-2'
                                            />
                                            <label className='text-sm opacity-50 col-span-1 text-nowrap'>{itemUOM[index].order_product_unit_b ? itemUOM[index].order_product_unit_b : "UNIT"}</label>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="form-control bg-gray-200">
                                            ${product.order_product_price_unit_a ? product.order_product_price_unit_a.toFixed(2) : "0.00"}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="form-control bg-gray-200">
                                            ${(product.order_product_qty_a * (product.order_product_price_unit_a || 0)).toFixed(2)}
                                        </div>
                                    </td>
                                    <td>
                                        <button type="button" onClick={() => handleRemoveItem(index)} className="btn btn-danger">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                        </svg>
                                        </button>
                                    </td>
                                </tr>
                                ))}
                                {/* ***** CUSTOM ITEMS ***** */}
                                {orderState.custom_products.map((cproduct, index) => (
                                <tr key={index}>
                                    <th scope="row">{alphabets[index]}</th>
                                    <td></td>
                                    <td>
                                        <input
                                            type="text"
                                            className="form-control" 
                                            name="custom_product_name" 
                                            value={cproduct.custom_product_name} 
                                            onChange={(e) => handleInputChange(e, index, false, true)}
                                            placeholder="Custom name"
                                            onInvalid={(e) => e.target.setCustomValidity('Enter custom item name')}
                                            onInput={(e) => e.target.setCustomValidity('')}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            className="form-control" 
                                            name="custom_product_location" 
                                            value={cproduct.custom_product_location} 
                                            onChange={(e) => handleInputChange(e, index, false, true)}
                                            placeholder="Ex: Level 2"
                                            onInvalid={(e) => e.target.setCustomValidity('Enter custom item location')}
                                            onInput={(e) => e.target.setCustomValidity('')}
                                        />
                                    </td>
                                    <td>
                                        <div className='grid grid-cols-3 items-center border rounded w-32'>
                                            <input
                                                type='number'
                                                name="custom_order_qty" 
                                                value={cproduct.custom_order_qty} 
                                                onChange={(e) => handleInputChange(e, index, false, true)}
                                                min={0}
                                                step={1}
                                                onInvalid={(e) => e.target.setCustomValidity('Enter custom-qty-A')}
                                                onInput={(e) => e.target.setCustomValidity('')}
                                                className='px-1 py-1 ml-1 col-span-2'
                                            />
                                            <label className='text-sm opacity-50 col-span-1 text-nowrap'>{"UNIT"}</label>
                                        </div>
                                    </td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td>
                                        <button type="button" onClick={() => handleRemoveCustomItem(index)} className="btn btn-danger">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                        </svg>
                                        </button>
                                    </td>
                                </tr>
                                ))}
                            </tbody>
                        </table>
                        {/* ADD MORE ITEM BUTTON */}
                        <div className="flex justify-center mb-0 border-b-2 pb-2">
                            <div className='flex items-center border bg-gray-200 rounded-xl p-2 text-sm cursor-pointer hover:bg-blue-400 hover:text-white hover:shadow-lg mr-4' onClick={handleAddItem}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 mr-1">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                </svg>
                                <label className='cursor-pointer'>ADD MORE ITEMS</label>
                            </div>
                            <div className='flex items-center border bg-gray-200 rounded-xl p-2 text-sm cursor-pointer hover:bg-blue-400 hover:text-white hover:shadow-lg ' onClick={handleAddCustomItem}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 mr-1">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                                </svg>
                                <label className='cursor-pointer'>ADD CUSTOM ITEMS</label>
                            </div>
                        </div>
                        {/* ********************* ITEM CALCULATION ******************** */}
                        <div className="flex justify-end">
                            <div>
                                <table className="table text-end font-bold border-l-2 mb-0">
                                    <tbody>
                                        <tr>
                                            <td className='pt-1'>Total Net Amount:</td>
                                            <td className='pt-1'>$ ??.??</td>
                                        </tr>
                                        <tr>
                                            <td>Amount Paid:</td>
                                            <td>$ ??.??</td>
                                        </tr>
                                        <tr className='border-b-0'>
                                            <td>Outstanding Amount:</td>
                                            <td>$ ??.??</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    {/* ***** INTERNAL COMMENTS ***** */}
                    <div className="my-3">
                        <label className="form-label font-bold">Internal comments:</label>
                        <textarea 
                            className="form-control" 
                            name="order_internal_comments" 
                            value={orderState.order_internal_comments} 
                            onChange={handleInputChange}
                            placeholder='Enter order related internal comments...'
                            rows={2}
                        />
                    </div>
                    {/* ***** NOTES TO SUPPLIER ***** */}
                    <div className="mb-1">
                        <label className="form-label font-bold">Notes to supplier:</label>
                        <textarea
                            className="form-control bg-yellow-200" 
                            name="order_notes_to_supplier" 
                            value={orderState.order_notes_to_supplier} 
                            onChange={handleInputChange}
                            placeholder='Enter some notes to supplier...'
                            rows={4}
                        />
                    </div>
                </form>
                {/* ***** BUTTONS ***** */}
                <div className="flex justify-between mb-3 px-3">
                    <button type="button" onClick={handleBackClick} className="btn btn-secondary">CANCEL</button>
                    <button className="btn border rounded bg-gray-700 text-white hover:bg-gray-800">SAVE AS DRAFT</button>
                    <button className="btn btn-primary" type="submit">SUBMIT</button>
                </div>
            </div>
            { confirmationModal }
        </div>
    );
};

export default NewPurchaseOrderForm;
