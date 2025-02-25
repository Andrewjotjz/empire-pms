//import modules
import { useParams, useNavigate, Link} from 'react-router-dom';
import React, { useEffect, useRef, useState } from 'react';
import { useSelector,useDispatch } from 'react-redux';

import { setPurchaseOrderState } from '../redux/purchaseOrderSlice';
import { clearProductState } from '../redux/productSlice';

import { useUpdatePurchaseOrder } from '../hooks/useUpdatePurchaseOrder';
import { useFetchSupplierByProject } from '../hooks/useFetchSupplierByProject';
import { useFetchProductsBySupplier } from '../hooks/useFetchProductsBySupplier';

import SessionExpired from "../components/SessionExpired";
import EmployeeDetailsSkeleton from "./loaders/EmployeeDetailsSkeleton";
import UnauthenticatedSkeleton from './loaders/UnauthenticateSkeleton';
import { Modal, Button } from "react-bootstrap";
import Dropdown from "react-bootstrap/Dropdown";

const PurchaseOrderDetails = () => {
    //Component router
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    //Component state declaration
    const { fetchSupplierByProject, isFetchSupplierLoading, fetchSupplierError } = useFetchSupplierByProject();
    const { fetchProductsBySupplier, isFetchProductsLoadingState, fetchProductsErrorState } = useFetchProductsBySupplier();
    const [isLoadingState, setIsLoadingState] = useState(true);
    const [errorState, setErrorState] = useState(null);
    const [isAddDeliveryLoading, setIsAddDeliveryLoading] = useState(true);
    const [addDeliveryError, setAddDeliveryError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
    const [currentLeftTab, setCurrentLeftTab] = useState('invoicesTable');
    const [currentRightTab, setCurrentRightTab] = useState('internalComments');
    const [showLastDiv, setShowLastDiv] = useState(false);
    const [targetRef, setTargetRef] = useState(null);
    const [deliveryState, setDeliveryState] = useState({
        delivery_evidence_type: '',
        delivery_evidence_reference: '',
        products: [],
        delivery_receiving_date: new Date().toISOString().split('T')[0],
        delivery_status: '',
        order: '',
        supplier: '',
        delivery_notes: ''
      });
    const [deliveries, setDeliveries] = useState([]);
    const deliveryType = ['Delivery Docket', 'Invoice'];
    const deliveryStatus = ['Partially delivered', 'Delivered'];
    const [expandedRow, setExpandedRow] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
    const [purchaseOrderState, setPurchaseOrderState] = useState(null);

    //Component hooks
    const { updatePurchaseOrder, isUpdateLoadingState, updateErrorState } = useUpdatePurchaseOrder();
    const notesToSupplierRef = useRef(null);
    const internalCommentsRef = useRef(null);
    const supplierDetailsRef = useRef(null);
    const deliveriesTableRef = useRef(null);
    const invoicesTableRef = useRef(null);

    //Component functions and variables
    const localUser = JSON.parse(localStorage.getItem('localUser'))

    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setDeliveryState(prevState => ({
        ...prevState,
        [name]: value
        }));
    };

    const handleProductChange = (index, field, value) => {
        const updatedProducts = [...deliveryState.products];
        updatedProducts[index][field] = value;
        setDeliveryState(prevState => ({
        ...prevState,
        products: updatedProducts
        }));
    };

    const handleProductTableClick = (productId) => { 
        dispatch(clearProductState());
        navigate(`/EmpirePMS/supplier/${purchaseOrderState.supplier._id}/products/${productId}`, {state: purchaseOrderState.supplier._id})
    }

    const handleEditPurchaseOrder = () => {
        navigate(`/EmpirePMS/order/${id}/edit`)
    }

    // const handleNewDelivery = () => {

    //     //logic when user clicks 'Receiving Items', it will auto calculate the initial value for receiving qty. (registered products)
    //     const currentProducts = purchaseOrderState.products.map((product,index) => ({
    //         ...product,
    //         delivered_qty_a: purchaseOrderState.deliveries.some(delivery => delivery.products.some(product => product.product_obj_ref === product.product_obj_ref._id)) ? (product.order_product_qty_a - purchaseOrderState.deliveries
    //         .map(delivery => delivery.products[index]?.delivered_qty_a || 0)
    //         .reduce((totalSum, product) => totalSum + (product || 0), 0))
    //         : (0)
    //     }));

    //     //logic when user clicks 'Receiving Items', it will auto calculate the initial value for receiving qty. (custom products)
    //     const updatedProducts = purchaseOrderState.custom_products.map((cproduct,index) => ({
    //         product_obj_ref: cproduct._id,
    //         custom_order_qty: cproduct.custom_order_qty,
    //         custom_product_location: cproduct.custom_product_location,
    //         custom_product_name: cproduct.custom_product_name,
    //         delivered_qty_a: purchaseOrderState.deliveries.some(delivery => delivery.products.some(product => product._id === cproduct._id)) ? (cproduct.custom_order_qty - purchaseOrderState.deliveries
    //         .map(delivery => delivery.products[index+purchaseOrderState.products.length]?.delivered_qty_a || 0)
    //         .reduce((totalSum, product) => totalSum + (product || 0), 0))
    //         : (0)
    //     }))
    
    //     setDeliveryState((prevDelivery) => ({
    //         ...prevDelivery, // Spread the previous state
    //         products: [...currentProducts, ...updatedProducts], // Updated products with delivered_qty_a
    //         order: purchaseOrderState._id,
    //         supplier: purchaseOrderState.supplier._id
    //     }));

    //     setIsDeliveryModalOpen(true);
    // };
    const handleNewDelivery = () => {
        // Logic to calculate delivered_qty_a for registered products
        const currentProducts = purchaseOrderState.products.map((product) => {
            // Check if product exists in deliveries
            const productExists = purchaseOrderState.deliveries.some(delivery =>
                delivery.products.some(p => p.product_obj_ref === product.product_obj_ref._id)
            );
    
            // Calculate total delivered quantity
            const deliveredQty = purchaseOrderState.deliveries.reduce((total, delivery) => {
                const deliveredProduct = delivery.products.find(p => p.product_obj_ref === product.product_obj_ref._id);
                return total + (deliveredProduct?.delivered_qty_a || 0);
            }, 0);
    
            return {
                ...product,
                delivered_qty_a: productExists ? 
                // (product.order_product_qty_a - deliveredQty)
                (product.order_product_qty_a - deliveredQty)
                 : product.order_product_qty_a
            };
        });
    
        // Logic to calculate delivered_qty_a for custom products
        const updatedProducts = purchaseOrderState.custom_products.map((cproduct) => {
            // Check if custom product exists in deliveries
            const productExists = purchaseOrderState.deliveries.some(delivery =>
                delivery.products.some(p => p.product_obj_ref === cproduct._id)
            );
    
            // Calculate total delivered quantity
            const deliveredQty = purchaseOrderState.deliveries.reduce((total, delivery) => {
                const deliveredProduct = delivery.products.find(p => p.product_obj_ref === cproduct._id);
                return total + (deliveredProduct?.delivered_qty_a || 0);
            }, 0);
    
            return {
                product_obj_ref: cproduct._id,
                custom_order_qty: cproduct.custom_order_qty,
                custom_product_location: cproduct.custom_product_location,
                custom_product_name: cproduct.custom_product_name,
                delivered_qty_a: productExists ? 
                // (cproduct.custom_order_qty - deliveredQty)
                (cproduct.custom_order_qty - deliveredQty)
                 : cproduct.custom_order_qty
            };
        });
    
        // Update delivery state
        setDeliveryState((prevDelivery) => ({
            ...prevDelivery,
            products: [...currentProducts, ...updatedProducts],
            order: purchaseOrderState._id,
            supplier: purchaseOrderState.supplier._id
        }));
    
        setIsDeliveryModalOpen(true);
    };
    

    const handleArchive = () => {    
        let updatedState;
        if (purchaseOrderState.order_isarchived === true) {
            updatedState = {
                ...purchaseOrderState,
                order_isarchived: false,
            };
        } else {
            updatedState = {
                ...purchaseOrderState,
                order_isarchived: true,
            };
        }
    
        setPurchaseOrderState(updatedState);

        updatePurchaseOrder(updatedState, `Purchase Order has been ${purchaseOrderState.order_isarchived ? `unarchived` : `archived`}`);

        setShowModal(false);
    };

    const formatDate = (dateString) => {
        if (dateString === null) {
            return ''
        }  else {
            const date = new Date(dateString);
            const options = { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' };
            return date.toLocaleDateString('en-AU', options).toUpperCase()
        }
    };

    const formatDateTime = (dateString) => {
        if (dateString === null) {
            return ''
        }  else {
            const date = new Date(dateString);
            const options = { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true };
            return date.toLocaleDateString('en-AU', options).toUpperCase()
        }
    };

    const totalGrossAmount = purchaseOrderState && purchaseOrderState.products
    ? parseFloat(purchaseOrderState.products.reduce(
          (total, product) => total + (product.order_product_gross_amount || 0),
          0
      )).toFixed(4) //change number to two decimal points
    : 0;

    const scrollToDiv = (ref) => {
        if (ref.current) {
          ref.current.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'center' });
        } else {
          // Store the target ref if it is not rendered yet
          setTargetRef(ref);
          // Trigger rendering of the last div if needed
          setShowLastDiv(true);
        }
      };

    
    const createDelivery = async (deliveryState) => {
        setIsAddDeliveryLoading(true)
        setAddDeliveryError(null)
    
        const postDelivery = async () => {
            try {
                const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/delivery/create`, {
                    credentials: 'include', method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${sessionStorage.getItem('jwt')}` // Include token in Authorization header
                    },
                    body: JSON.stringify(deliveryState)
                })
    
                const data = await res.json();
    
                if (data.tokenError) {
                    throw new Error(data.tokenError)
                }
    
                if (!res.ok) {
                    throw new Error('Failed to POST new delivery')
                }
                if (res.ok) {
    
                    alert(`Delivery created successfully!`);
                
                    // update loading state
                    setIsAddDeliveryLoading(false)
    
                }
            } catch (error) {
                setAddDeliveryError(error.message);
                setIsAddDeliveryLoading(false);
            }
        }
        postDelivery();
    }

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
          direction = 'descending';
        }
        setSortConfig({ key, direction });
      };

    const handleSubmit = (e) => {
        e.preventDefault();
      
        // Check for duplicate evidence reference
        if (
          deliveries.some(
            (delivery) =>
              delivery.delivery_evidence_reference ===
              deliveryState.delivery_evidence_reference
          )
        ) {
          alert("The evidence reference already exists. Please provide a unique reference.");
          return; // Prevent submission
        }
      
        // Check other fields if necessary (optional)
        if (!deliveryState.delivery_evidence_reference) {
          alert("Evidence Reference is required.");
          return;
        }
        if (!deliveryState.delivery_receiving_date) {
          alert("Receiving Date is required.");
          return;
        }
        if (!deliveryState.delivery_evidence_type) {
          alert("Evidence Type is required.");
          return;
        }
        if (!deliveryState.delivery_status) {
          alert("Delivery Status is required.");
          return;
        }
      
        // Perform submission logic
        createDelivery(deliveryState);
        setIsDeliveryModalOpen(false);
        window.location.reload();
      };
      
    
    // Fetch Order details
    useEffect(() => {
        setIsLoadingState(true);
        const fetchPurchaseOrderDetails = async () => {
            try {
                const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/order/${id}`, { credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${sessionStorage.getItem('jwt')}` // Include token in Authorization header
                    }});
                if (!res.ok) {
                    throw new Error('Failed to fetch purchase order details');
                }
                const data = await res.json();

                if (data.tokenError) {
                    throw new Error(data.tokenError);
                }

                fetchSupplierByProject(data.project._id)
                fetchProductsBySupplier(data.supplier._id)
                setPurchaseOrderState(data);

                setIsLoadingState(false);
            } catch (err) {
                setErrorState(err.message);
                setIsLoadingState(false);
            }
        };

        fetchPurchaseOrderDetails();
    }, [id]);

    // Fetch deliveries
    useEffect(() => {
        const fetchDeliveries = async () => {
            try {
                const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/delivery`, { credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${sessionStorage.getItem('jwt')}` // Include token in Authorization header
                    }});
                if (!res.ok) {
                    throw new Error('Failed to fetch deliveries');
                }
                const data = await res.json();

                if (data.tokenError) {
                    throw new Error(data.tokenError);
                }

                setDeliveries(data);
                setIsLoadingState(false);
            } catch (err) {
                setErrorState(err.message);
                setIsLoadingState(false);
            }
        };

        fetchDeliveries();
    }, []);

    // automatically scroll to target div
    useEffect(() => {
        // If a targetRef is stored and it is now rendered, scroll to it
        if (targetRef && targetRef.current) {
          targetRef.current.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'center' });
          setTargetRef(null); // Clear the targetRef once scrolled
        }
      }, [showLastDiv, targetRef]);

    // Display DOM
    if (isLoadingState || isUpdateLoadingState || isFetchSupplierLoading || isFetchProductsLoadingState) { return (<EmployeeDetailsSkeleton />); }

    if (errorState || updateErrorState || addDeliveryError) {
        return (
            <div>
                Error: {errorState || updateErrorState || addDeliveryError}
            </div>
        );
    }
    
    if (fetchSupplierError || fetchProductsErrorState) {
        if(errorState.includes("Session expired") || errorState.includes("jwt expired") || errorState.includes("jwt malformed")){
            return(<div><SessionExpired /></div>)
        }
        return (
            <div>
                Error: {fetchSupplierError || fetchProductsErrorState}
            </div>
        );
    }

    const purchaseOrderDetails = purchaseOrderState ? (
        <div className="row text-xs md:text-sm">
            <div className="col-md-6 md:mb-3">
                <label className="form-label fw-bold">Supplier:</label>
                <p className="form-label">{purchaseOrderState?.supplier?.supplier_name}</p>
            </div>
            <div className="col-md-6 md:mb-3">
                <label className="form-label fw-bold">Archived (?):</label>
                {purchaseOrderState.order_isarchived ? 
                    (<label className="text-sm md:text-lg font-bold m-1 p-2 rounded-xl text-red-500">Archived</label>) : 
                    (<label className="text-sm md:text-lg font-bold m-1 p-2 rounded-xl text-green-600">Available</label>)
                }
            </div>
            <div className="col-md-6 md:mb-3">
                <label className="form-label fw-bold">Order Date:</label>
                <p className="form-label">{formatDate(purchaseOrderState.order_date)}</p>
            </div>
            <div className="col-md-6 md:mb-3">
                <label className="form-label fw-bold">EST Date/Time:</label>
                <p className="form-label">{formatDateTime(purchaseOrderState.order_est_datetime)}</p>
            </div>
            <div className="col-md-6 md:mb-3 text-sm opacity-50">
                <label className="form-label fw-bold">Created on:</label>
                <p className="form-label">{formatDateTime(purchaseOrderState.createdAt)}</p>
            </div>
            <div className="col-md-6 md:mb-3 text-sm opacity-50">
                <label className="form-label fw-bold">Last Updated on:</label>
                <p className="form-label">{formatDateTime(purchaseOrderState.updatedAt)}</p>
            </div>
            <div className="col-md-6 md:mb-3">
                <label className="form-label fw-bold mr-1">Order Status:</label>
                {purchaseOrderState.order_status && (
                <label
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                        purchaseOrderState.order_status === "Cancelled"
                            ? "bg-gray-100 text-gray-800"
                            : purchaseOrderState.order_status === "Pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : purchaseOrderState.order_status === "Approved"
                            ? "bg-green-100 text-green-800"
                            : purchaseOrderState.order_status === "Rejected"
                            ? "bg-red-100 text-red-800"
                            : purchaseOrderState.order_status === "Draft"
                            ? "bg-gray-100 text-gray-800"
                            : ""
                    }`}
                >
                    {purchaseOrderState.order_status}
                </label>
                )}
            </div>
            <div className="col-md-6 md:mb-3">
                <label className="form-label fw-bold mr-1">Delivery:</label>

                {(() => {
                    // Ensure deliveries and products exist before accessing them
                    const totalDelivered = purchaseOrderState.deliveries?.flatMap((delivery) => 
                        delivery.products?.map((product) => product.delivered_qty_a || 0) || []
                    )?.reduce((totalSum, qty) => totalSum + qty, 0) || 0;

                    const totalOrderQuantity = purchaseOrderState.products?.reduce(
                        (totalSum, product) => totalSum + (product.order_product_qty_a || 0),
                        0
                    ) || 0;

                    // Render appropriate label based on delivery status
                    if (totalDelivered >= totalOrderQuantity && totalOrderQuantity > 0) {
                        return <label className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Fully delivered</label>;
                    } else if (totalDelivered === 0) {
                        return <label className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Nothing delivered</label>;
                    } else if (totalDelivered < totalOrderQuantity) {
                        return <label className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Partially delivered</label>;
                    } else {
                        return null; // In case no condition matches
                    }
                })()}

            </div>
        </div>
    ) : (
        <div className='border'>Purchase Order API fetched successfully, but it might be empty...</div>
    );

    const productsTable = purchaseOrderState && (purchaseOrderState?.products.length > 0 || purchaseOrderState?.custom_products.length > 0) ? (
        <div className="container p-0 bg-slate-50 mb-4 shadow-md text-xs md:text-sm">
            <div className="table-responsive">
                <table className="table table-bordered table-hover m-0">
                    <thead className="thead-dark text-center">
                        <tr className="table-primary">
                            <th scope="col">SKU</th>
                            <th scope="col">Name</th>
                            <th scope="col">Location</th>
                            <th scope="col">Qty A</th>
                            <th scope="col">Qty B</th>
                            <th scope="col">Price A</th>
                            <th scope="col">Net Amount</th>
                        </tr>
                    </thead>
                    <tbody className="text-center">
                        {purchaseOrderState.products &&
                            purchaseOrderState.products.map((product, index) => {
                                // Calculate total delivered quantity
                                const deliveredQty = purchaseOrderState.deliveries.reduce((total, delivery) => {
                                    const deliveredProduct = delivery.products.find(p => p.product_obj_ref === product.product_obj_ref._id);
                                    return total + (deliveredProduct?.delivered_qty_a || 0);
                                }, 0);

                                return (
                                    <tr
                                        key={`${product.product_obj_ref._id}-${index}`}
                                        className="cursor-pointer"
                                        onClick={() => handleProductTableClick(product.product_obj_ref._id)}
                                    >
                                        <td>{product.product_obj_ref.product_sku}</td>
                                        <td>{product.product_obj_ref.product_name}</td>
                                        <td>{product.order_product_location}</td>
                                        <td>
                                            {Number.isInteger(product.order_product_qty_a)
                                                ? product.order_product_qty_a
                                                : parseFloat(product.order_product_qty_a).toFixed(4)}
                                            <label className="text-xs text-gray-400 block">
                                                Delivered: {deliveredQty}
                                            </label>
                                        </td>
                                        <td>
                                            {Number.isInteger(product.order_product_qty_b)
                                                ? product.order_product_qty_b
                                                : parseFloat(product.order_product_qty_b).toFixed(4)}
                                        </td>
                                        <td>
                                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
                                                Math.floor(product.order_product_price_unit_a * 100) / 100
                                            )}
                                        </td>
                                        <td className="text-end">
                                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
                                                Math.floor(product.order_product_gross_amount * 100) / 100
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}

                        {purchaseOrderState.custom_products &&
                            purchaseOrderState.custom_products.map((cusProduct, index) => {
                                // Calculate total delivered quantity
                                const deliveredQty2 = purchaseOrderState.deliveries.reduce((total, delivery) => {
                                    const deliveredProduct = delivery.products.find(p => p.product_obj_ref === cusProduct._id);
                                    return total + (deliveredProduct?.delivered_qty_a || 0);
                                }, 0);

                                return (
                                <tr key={cusProduct._id || `custom-${index}`} className="cursor-default">
                                    <td>CUSTOM {index + 1}</td>
                                    <td>{cusProduct.custom_product_name}</td>
                                    <td>{cusProduct.custom_product_location}</td>
                                    <td>{cusProduct.custom_order_qty}
                                        <label className="text-xs text-gray-400 block">
                                            Delivered: {deliveredQty2}
                                        </label>
                                    </td>
                                    <td>-</td>
                                    <td>-</td>
                                    <td>-</td>
                                </tr>)
                            })}
                    </tbody>
                </table>
            </div>

            <div className="d-flex justify-content-end">
                <div className="table-responsive w-auto">
                    <table className="table text-end font-bold border-x-2 mb-0">
                        <tbody>
                            <tr>
                                <td className="pt-1">Subtotal:</td>
                                <td className="pt-1">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Math.floor(totalGrossAmount * 100) / 100)}</td>
                            </tr>
                            <tr>
                                <td>Delivery & Other fees:</td>
                                <td>
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Math.floor(purchaseOrderState.invoices.reduce(
                                        (totalSum, invoice) =>
                                            totalSum + invoice.invoiced_other_fee + invoice.invoiced_delivery_fee,
                                        0
                                    ) * 100) / 100)}
                                </td>
                            </tr>
                            <tr>
                                <td><span className='text-red-600'>Total Due:</span></td>
                                <td><span className='text-red-600'>
                                    {
                                    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Math.floor(purchaseOrderState.products.reduce(
                                            (totalSum, product) => totalSum + product.order_product_gross_amount,
                                            0
                                        ) * 100 +
                                            purchaseOrderState.invoices.reduce(
                                                (totalSum, invoice) =>
                                                    totalSum + invoice.invoiced_other_fee + invoice.invoiced_delivery_fee,
                                                0
                                            ) * 100) / 100
                                    )}
                                </span></td>
                            </tr>
                            <tr>
                                <td><span className='text-red-600'>Total Due (incl GST):</span></td>
                                <td><span className='text-red-600'>
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Math.floor((
                                        (purchaseOrderState.products.reduce(
                                            (totalSum, product) => totalSum + product.order_product_gross_amount,
                                            0
                                        ) +
                                            purchaseOrderState.invoices.reduce(
                                                (totalSum, invoice) =>
                                                    totalSum + invoice.invoiced_other_fee + invoice.invoiced_delivery_fee,
                                                0
                                            )) *
                                        1.1
                                    ) * 100) / 100)}
                                </span></td>
                            </tr>
                            <tr>
                                <td><span className='text-green-700'>Amount Paid:</span></td>
                                <td><span className='text-green-700'>
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Math.floor(purchaseOrderState.invoices.filter(invoice => !invoice.invoice_isarchived).reduce((totalSum, invoice) => {
                                            if (invoice.invoice_status === "Settled") {
                                                return totalSum + invoice.invoiced_raw_total_amount_incl_gst;
                                            }
                                            return totalSum;
                                        }, 0) * 100) / 100)}
                                </span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

    ): (
        <div className='border'>Purchase Order's products fetched successfully, but it might be empty...</div>
    );

    const internalComments = purchaseOrderState && purchaseOrderState.order_internal_comments !== '' ? (
        <div className="card-body border-1 relative shadow-md p-2 text-xs md:text-sm" ref={internalCommentsRef}>
            <div className='border rounded-md bg-blue-100 p-2 h-auto'>
                <p>{purchaseOrderState.order_internal_comments}</p>
            </div>
        </div>
    ) : (
        <div className='border shadow-sm'><p className='m-2 p-1 text-xs sm:text-base'>There are no internal comments...</p></div>
    )

    const invoicesTable = purchaseOrderState && purchaseOrderState.invoices.length > 0 ? (
        <>
        <div ref={invoicesTableRef} className='overflow-x-auto text-xs md:text-sm'>
            <table className="table table-bordered table-hover text-xs shadow-sm">
                <thead className="thead-dark">
                    <tr className="table-primary">
                        <th scope="col">Ref #</th>
                        <th scope="col">Issued on</th>
                        <th scope="col">Received on</th>
                        <th scope="col">Due on</th>
                        <th scope="col">Status</th>
                        <th scope="col">Delivery & Other Fees</th>
                        <th scope="col">Calculated Gross Amount</th>
                        <th scope="col">Raw Gross Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {purchaseOrderState.invoices && purchaseOrderState.invoices.filter(invoice => !invoice.invoice_isarchived).map(invoice => (
                        <tr key={invoice._id} className="cursor-pointer" onClick={() => navigate(`/EmpirePMS/invoice/${invoice._id}`)}>
                            <th scope="row">{invoice.invoice_ref}</th>
                            <td>{formatDate(invoice.invoice_issue_date)}</td>
                            <td>{formatDate(invoice.invoice_received_date)}</td>
                            <td>{formatDate(invoice.invoice_due_date)}</td>
                            <td>
                                {invoice.invoice_status && (
                                <label
                                    className={`text-xs font-bold m-1 py-0.5 px-1 rounded-xl text-nowrap ${
                                        invoice.invoice_status === "Cancelled"
                                            ? "border-2 bg-transparent border-gray-500 text-gray-500"
                                            : invoice.invoice_status === "To review"
                                            ? "border-2 bg-transparent border-yellow-300 text-yellow-600"
                                            : invoice.invoice_status === "Settled"
                                            ? "border-2 bg-transparent border-green-600 text-green-600"
                                            : invoice.invoice_status === "To reconcile"
                                            ? "border-2 bg-transparent border-red-600 text-red-600"
                                            : invoice.invoice_status === "Reviewed"
                                            ? "border-2 bg-transparent border-blue-400 text-blue-400"
                                            : ""
                                    }`}
                                >
                                    {invoice.invoice_status}
                                </label>
                                )}
                            </td>
                            <td>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Math.floor((invoice.invoiced_delivery_fee + invoice.invoiced_other_fee) * 100) / 100)}</td>
                            <td className='text-end'>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Math.floor((invoice.invoiced_calculated_total_amount_incl_gst / 1.1) * 100) / 100)}</td>
                            <td className='text-end'>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Math.floor((invoice.invoiced_raw_total_amount_incl_gst / 1.1) * 100) / 100)}</td>
                        </tr>
                    ))}
                    {/* TEMPORARILY DEACTIVATED */}
                    {/* <tr>
                        <td colSpan={4}></td>
                        <td colSpan={2} className='text-end font-bold'>Subtotal (excl fees):</td>
                        <td className='text-end font-bold'>
                            $ {(purchaseOrderState.invoices.reduce((totalSum, invoice) => {
                                return totalSum + invoice.invoiced_calculated_total_amount_incl_gst;
                            }, 0) / 1.1 - purchaseOrderState.invoices.reduce((totalSum, invoice) => {
                                return totalSum + invoice.invoiced_other_fee + invoice.invoiced_delivery_fee;
                            }, 0)).toFixed(4)}
                        </td>
                        <td className='text-end font-bold'>
                            $ {(purchaseOrderState.invoices.reduce((totalSum, invoice) => {
                                return totalSum + invoice.invoiced_raw_total_amount_incl_gst;
                            }, 0) / 1.1 - purchaseOrderState.invoices.reduce((totalSum, invoice) => {
                                return totalSum + invoice.invoiced_other_fee + invoice.invoiced_delivery_fee;
                            }, 0)).toFixed(4)}
                        </td>
                    </tr> */}
                    <tr>
                        <td colSpan={4}></td>
                        <td colSpan={2} className='text-end font-bold'>Subtotal (incl fees):</td>
                        <td className='text-end font-bold'>
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Math.floor((purchaseOrderState.invoices.filter(invoice => !invoice.invoice_isarchived).reduce((totalSum, invoice) => {
                                return totalSum + invoice.invoiced_calculated_total_amount_incl_gst;
                            }, 0) / 1.1) * 100) / 100)}
                        </td>
                        <td className='text-end font-bold'>
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Math.floor((purchaseOrderState.invoices.filter(invoice => !invoice.invoice_isarchived).reduce((totalSum, invoice) => {
                                return totalSum + invoice.invoiced_raw_total_amount_incl_gst;
                            }, 0) / 1.1) * 100) / 100)}
                        </td>
                    </tr>
                    <tr>
                        <td colSpan={4}></td>
                        <td colSpan={2} className='text-end font-bold'>GST (10%):</td>
                        <td className='text-end font-bold'>
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Math.floor((purchaseOrderState.invoices.filter(invoice => !invoice.invoice_isarchived).reduce((totalSum, invoice) => {
                                return totalSum + invoice.invoiced_calculated_total_amount_incl_gst;
                            }, 0) / 1.1 * 0.1) * 100) / 100)}
                        </td>
                        <td className='text-end font-bold'>
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Math.floor((purchaseOrderState.invoices.filter(invoice => !invoice.invoice_isarchived).reduce((totalSum, invoice) => {
                                return totalSum + invoice.invoiced_raw_total_amount_incl_gst;
                            }, 0) / 1.1 * 0.1) * 100) / 100)}
                        </td>
                    </tr>
                    <tr>
                        <td colSpan={4}></td>
                        <td colSpan={2} className='text-end font-bold'>Total (incl GST):</td>
                        <td className='text-end font-bold'>
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Math.floor((purchaseOrderState.invoices.filter(invoice => !invoice.invoice_isarchived).reduce((totalSum, invoice) => {
                                return totalSum + invoice.invoiced_calculated_total_amount_incl_gst;
                            }, 0)) * 100) / 100)}
                        </td>
                        <td className='text-end font-bold'>
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Math.floor((purchaseOrderState.invoices.filter(invoice => !invoice.invoice_isarchived).reduce((totalSum, invoice) => {
                                return totalSum + invoice.invoiced_raw_total_amount_incl_gst;
                            }, 0)) * 100) / 100)}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        </>
    ) : (
        <div className='border shadow-sm'><p className='m-2 p-1 text-xs sm:text-base'>Purchase Order's invoices fetched successfully, but it might be empty...</p></div>
    );

    const deliveriesTable = deliveries.length > 0 ? (
        <>
        <div ref={deliveriesTableRef} className="overflow-x-auto card-body border-1 shadow-md text-xs md:text-sm">
            <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
                <thead>
                <tr className="bg-gray-100 text-left text-gray-600 text-sm uppercase">
                    <th className="p-3 cursor-pointer" onClick={() => requestSort('delivery_evidence_reference')}>
                    Reference
                    {sortConfig.key === 'delivery_evidence_reference' && (
                        sortConfig.direction === 'ascending' ? 
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="inline ml-1 size-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                        </svg> : 
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="inline ml-1 size-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                        </svg>
                    )}
                    </th>
                    <th className="p-3 cursor-pointer" onClick={() => requestSort('delivery_receiving_date')}>
                    Date
                    {sortConfig.key === 'delivery_receiving_date' && (
                        sortConfig.direction === 'ascending' ? 
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="inline ml-1 size-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                        </svg> : 
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="inline ml-1 size-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                        </svg>
                    )}
                    </th>
                    <th className="p-3 cursor-pointer" onClick={() => requestSort('order_ref')}>
                    Order No.
                    {sortConfig.key === 'order_ref' && (
                        sortConfig.direction === 'ascending' ? 
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="inline ml-1 size-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                        </svg> : 
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="inline ml-1 size-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                        </svg>
                    )}
                    </th>
                    <th className="p-3 cursor-pointer" onClick={() => requestSort('supplier_name')}>
                    Supplier
                    {sortConfig.key === 'supplier_name' && (
                        sortConfig.direction === 'ascending' ? 
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="inline ml-1 size-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                        </svg> : 
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="inline ml-1 size-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                        </svg>
                    )}
                    </th>
                    <th className="p-3 cursor-pointer" onClick={() => requestSort('delivery_status')}>
                    Receiving
                    {sortConfig.key === 'delivery_status' && (
                        sortConfig.direction === 'ascending' ? 
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="inline ml-1 size-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                        </svg> : 
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="inline ml-1 size-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                        </svg>
                    )}
                    </th>
                    <th className="p-3">Products</th>
                </tr>
                </thead>
                <tbody>
                {deliveries.filter(delivery => delivery.order._id === id).map((item) => (
                    <React.Fragment key={item._id}>
                    <tr className="border-t border-gray-200 hover:bg-gray-50 transition-colors duration-150">
                        <td className="p-3 text-blue-600 font-medium hover:cursor-pointer hover:underline" onClick={() => navigate(`/EmpirePMS/delivery/${item._id}`)}>{item.delivery_evidence_reference}</td>
                        <td className="p-3 text-gray-600">{item.delivery_receiving_date}</td>
                        <td className="p-3 text-gray-600">{item.order.order_ref}</td>
                        <td className="p-3 text-gray-600">{item.supplier.supplier_name}</td>
                        <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.delivery_status === 'Delivered' ? 'bg-green-100 text-green-800' :
                            item.delivery_status === 'Partially delivered' ? 'bg-lime-100 text-lime-800' :
                            'bg-red-100 text-red-800'
                        }`}>
                            {item.delivery_status === 'Delivered' ? 'Full' : 'Partial'}
                        </span>
                        </td>
                        <td className="p-3">
                        <button
                            onClick={() => setExpandedRow(expandedRow === item._id ? null : item._id)}
                            className="text-blue-600 hover:text-blue-800 transition-colors duration-150"
                        >
                            {item.products.filter(p => p.delivered_qty_a > 0).length} products
                            {expandedRow === item._id ? 
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="inline ml-1 size-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                            </svg> : 
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="inline ml-1 size-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                            </svg>}
                        </button>
                        </td>
                    </tr>
                    {expandedRow === item._id && (
                        <tr>
                        <td colSpan="6" className="p-3 bg-gray-50">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {item.products.filter(p => p.delivered_qty_a > 0).map((product, index) => (
                                <div key={index} className="bg-white p-3 rounded shadow-sm">
                                <p className="text-indigo-600 text-xs border rounded-lg p-1 w-fit bg-indigo-50">{purchaseOrderState.products.find(prod => prod.product_obj_ref._id === product.product_obj_ref)?.product_obj_ref.product_sku || purchaseOrderState.custom_products.find(cprod => cprod._id === product.product_obj_ref)?.custom_product_name || 'Not found...'}</p>
                                <p className="font-medium text-gray-700 text-sm">
                                    {purchaseOrderState.products.find(prod => prod.product_obj_ref._id === product.product_obj_ref)?.product_obj_ref.product_name || 
                                    purchaseOrderState.custom_products.find(cprod => cprod._id === product.product_obj_ref)?.custom_product_name || 'Not found...'}
                                </p>
                                <p className="text-gray-600 text-xs">Quantity: {product.delivered_qty_a}</p>
                                </div>
                            ))}
                            </div>
                        </td>
                        </tr>
                    )}
                    </React.Fragment>
                ))}
                </tbody>
            </table>
            </div>
        </div>
        </>
    ) : (
        <div className='border shadow-sm'><p className='m-2 p-1 text-xs sm:text-base'>Deliveries fetched successfully, but it might be empty...</p></div>
    );

    const supplierDetails = purchaseOrderState && purchaseOrderState.supplier ? (
        <div className="card-body border-1 relative shadow-md text-xs md:text-sm" ref={supplierDetailsRef}>
            <div className="row">
                <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Supplier Name:</label>
                    <div>
                        <Link className="form-label text-blue-500 underline" to={`/EmpirePMS/supplier/${purchaseOrderState.supplier._id}`}>
                            {purchaseOrderState.supplier.supplier_name}
                        </Link>
                    </div>
                </div>
                <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Address:</label>
                    <p className="form-label">{purchaseOrderState.supplier.supplier_address}</p>
                </div>
                <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Payment Term:</label>
                    <p className="form-label">{purchaseOrderState.supplier.supplier_payment_term}</p>
                </div>
                <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Payment Term Description:</label>
                    <p className="form-label">{purchaseOrderState.supplier.supplier_term_description}</p>
                </div>
                <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Payment Method:</label>
                    <p className="form-label">{purchaseOrderState.supplier.supplier_payment_method_details}</p>
                </div>
                <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Supplier Type:</label>
                    <p className="form-label">{purchaseOrderState.supplier.supplier_type}</p>
                </div>
                <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Supplier Material Type:</label>
                    <p className="form-label">{purchaseOrderState.supplier.supplier_material_types}</p>
                </div>
                <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Supplier Status:</label>
                    {purchaseOrderState.supplier.supplier_isarchived ? 
                        (<label className="text-sm md:text-lg font-bold m-1 p-2 rounded-xl text-red-500">Archived</label>) : 
                        (<label className="text-sm md:text-lg font-bold m-1 p-2 rounded-xl text-green-600">Active</label>)
                    }
                </div>
                
                <div className='overflow-x-auto'>
                    <h2 className='font-bold text-xs md:text-xl m-1'>Supplier Contacts</h2>
                    <table className="table table-bordered shadow-sm">
                        <thead className="thead-dark">
                            
                            <tr className="table-primary">
                                <th scope="col" className='text-center'>ID</th>
                                <th scope="col" className='text-center'>Name</th>
                                <th scope="col">Phone</th>
                                <th scope="col">Email</th>
                            </tr>
                        </thead>
                        <tbody>
                            {purchaseOrderState.supplier.supplier_contacts && purchaseOrderState.supplier.supplier_contacts.map((supplier,index) => (
                                <tr key={index}>
                                    <th scope="row" className='text-center'>{index + 1}</th>
                                    <td className='text-center'>{`${supplier.is_primary ? `*` : ``} ${supplier.name}`}</td>
                                    <td>{supplier.phone}</td>
                                    <td>{supplier.email}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    ) : (
        <div className='border'>Purchase Order's supplier fetched successfully, but it might be empty...</div>
    );

    const notesToSupplier = purchaseOrderState && purchaseOrderState.order_notes_to_supplier !== '' ? (
        <div className="card-body border-1 relative shadow-md p-2 text-xs md:text-sm" ref={notesToSupplierRef}>
            <div className='border rounded-md bg-yellow-200 p-2 h-auto'>
                <p>{purchaseOrderState.order_notes_to_supplier}</p>
            </div>
        </div>
    ) : (
        <div className='border shadow-sm'><p className='m-2 p-1'>There are no notes to supplier...</p></div>
    )
    
    const archiveModal = (
        <Modal show={showModal} onHide={() => setShowModal(false)}>
            <Modal.Header closeButton>
                <Modal.Title>
                    { purchaseOrderState && purchaseOrderState.order_isarchived ? `Confirm Unarchive` : `Confirm Archive`}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                { purchaseOrderState && purchaseOrderState.order_isarchived ? `Are you sure you want to unarchive this purchase order?` : `Are you sure you want to archive this purchase order?`}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowModal(false)}>
                    Cancel
                </Button>
                <Button className="bg-red-600 hover:bg-red-600" variant="primary" onClick={handleArchive}>
                    { purchaseOrderState && purchaseOrderState.order_isarchived ? `Unarchive` : `Archive`}
                </Button>
            </Modal.Footer>
        </Modal>
    )
    
    const deliveryModal = (
        <div>    
          {isDeliveryModalOpen && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl m-4 text-xs">
                <div className="flex justify-between items-center px-4 py-3 border-b">
                  <h2 className="text-lg font-bold text-gray-800">Receiving Items</h2>
                  <button
                    onClick={() => setIsDeliveryModalOpen(false)}
                    className="text-gray-500 hover:text-gray-700 transition duration-300 ease-in-out"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
    
                <div className="p-4 max-h-[60vh] overflow-y-auto">
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div className='grid grid-cols-2 gap-x-4 gap-y-2'>
                        <div>
                            <label className="block mb-1 font-medium text-gray-700">* Evidence Reference:</label>
                            <input
                                type="text"
                                required
                                name="delivery_evidence_reference"
                                value={deliveryState.delivery_evidence_reference}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                            {deliveries.some((delivery) =>delivery.delivery_evidence_reference === deliveryState.delivery_evidence_reference) && (<label className="text-red-500 ml-1">Reference already exists</label>)}
                        </div>
        
                        <div>
                            <label className="block mb-1 font-medium text-gray-700">* Receiving Date:</label>
                            <input
                                type="date"
                                required
                                name="delivery_receiving_date"
                                value={deliveryState.delivery_receiving_date}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block mb-1 font-medium text-gray-700">* Evidence Type:</label>
                            <select
                                required
                                name="delivery_evidence_type"
                                value={deliveryState.delivery_evidence_type}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">Select Type</option>
                                {deliveryType.map(type => (
                                <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>                            
            
                        <div>
                            <label className="block mb-1 font-medium text-gray-700">* Receiving Status:</label>
                            <select
                                required
                                name="delivery_status"
                                value={deliveryState.delivery_status}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="" disabled>Select Status</option>
                                {deliveryStatus.map(status => (
                                <option key={status} value={status}>{status === 'Partially delivered' ? 'Partial' : 'Full'}</option>
                                ))}
                            </select>
                        </div>
                    </div>                   
    
                    <div>
                      <h3 className="font-semibold mb-2 text-gray-800">Products</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="border-b p-1.5 text-left font-semibold text-gray-600">Product SKU</th>
                              <th className="border-b p-1.5 text-left font-semibold text-gray-600">Product Name</th>
                              <th className="border-b p-1.5 text-left font-semibold text-gray-600">Quantity</th>
                              <th className="border-b p-1.5 text-left font-semibold text-gray-600">Receiving</th>
                              <th className="border-b p-1.5 text-left font-semibold text-gray-600">Delivered</th>
                            </tr>
                          </thead>
                          <tbody>
                            {purchaseOrderState.products.map((prod, index) => {
                                // Check if the product exists in deliveries
                                const productExists = purchaseOrderState.deliveries.some(delivery =>
                                delivery.products.some(p => p.product_obj_ref === prod.product_obj_ref._id)
                                );

                                // Calculate total delivered quantity
                                const deliveredQty = purchaseOrderState.deliveries.reduce((total, delivery) => {
                                const deliveredProduct = delivery.products.find(p => p.product_obj_ref === prod.product_obj_ref._id);
                                return total + (deliveredProduct?.delivered_qty_a || 0);
                                }, 0);

                                return (
                                <tr key={prod.product_obj_ref._id} className="hover:bg-gray-50">
                                    <td className="border-b p-1.5 text-gray-800">{prod.product_obj_ref.product_sku}</td>
                                    <td className="border-b p-1.5 text-gray-800">{prod.product_obj_ref.product_name}</td>
                                    <td className="border-b p-1.5 text-gray-800">{prod.order_product_qty_a}</td>
                                    <td className="border-b p-1.5">
                                    <input
                                        required
                                        min="0"
                                        type="number"
                                        value={deliveryState.products?.[index]?.delivered_qty_a ?? ''}
                                        onChange={(e) => handleProductChange(index, 'delivered_qty_a', parseFloat(e.target.value))}
                                        className="w-full p-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    </td>
                                    <td className="border-b p-1.5 text-gray-800">
                                    {deliveredQty} / {prod.order_product_qty_a}
                                    </td>
                                </tr>
                                );
                            })}

                            {purchaseOrderState.custom_products.length > 0 &&
                                purchaseOrderState.custom_products.map((cprod, index) => {
                                const customIndex = purchaseOrderState.products.length + index;

                                // Calculate total delivered quantity for custom products
                                const deliveredQty = purchaseOrderState.deliveries.reduce((total, delivery) => {
                                    const deliveredProduct = delivery.products.find(p => p.product_obj_ref === cprod._id);
                                    return total + (deliveredProduct?.delivered_qty_a || 0);
                                }, 0);

                                return (
                                    <tr key={cprod._id} className="hover:bg-gray-50">
                                    <td className="border-b p-1.5 text-gray-800">CUSTOM {index + 1}</td>
                                    <td className="border-b p-1.5 text-gray-800">{cprod.custom_product_name}</td>
                                    <td className="border-b p-1.5 text-gray-800">{cprod.custom_order_qty}</td>
                                    <td className="border-b p-1.5">
                                        <input
                                        required
                                        min="0"
                                        type="number"
                                        value={deliveryState.products[customIndex]?.delivered_qty_a ?? ''}
                                        onChange={(e) => handleProductChange(customIndex, 'delivered_qty_a', parseFloat(e.target.value))}
                                        className="w-full p-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </td>
                                    <td className="border-b p-1.5 text-gray-800">
                                        {deliveredQty} / {cprod.custom_order_qty}
                                    </td>
                                    </tr>
                                );
                                })}
                            </tbody>

                        </table>
                      </div>
                    </div>
                    <div>
                        <textarea
                            name='delivery_notes'
                            value={deliveryState.delivery_notes}
                            onChange={handleInputChange}
                            placeholder='Delivery notes...'
                            className='border rounded-md w-full p-2'
                        />
                    </div>
                  </form>
                </div>
    
                <div className="flex justify-end space-x-2 p-4 border-t">
                  <button
                    type="button"
                    onClick={() => setIsDeliveryModalOpen(false)}
                    className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition duration-300 ease-in-out"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 transition duration-300 ease-in-out"
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      );

    return (
        purchaseOrderState && localUser && Object.keys(localUser).length > 0 ? (
        <div className="container mt-5">
            <div className="card">
                {/* CARD HEADER */}
                <div className="card-header bg-dark text-white flex justify-between items-center">
                    <h1 className='mx-auto uppercase font-bold text-sm md:text-xl'>PURCHASE ORDER: {purchaseOrderState.order_ref}</h1>
                </div>
                <div className="card-body">
                    {/* DROPDOWN ACTION */}
                    { new Date(purchaseOrderState.createdAt) > new Date("2024-07-20T00:00:00.000Z") &&
                    <div className="absolute right-3">
                        <Dropdown>
                            <Dropdown.Toggle variant="success" id="dropdown-basic">
                                ACTIONS
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item onClick={handleEditPurchaseOrder}>
                                    <div className='flex items-center'>
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="size-4 mr-2">
                                            <path d="M13.488 2.513a1.75 1.75 0 0 0-2.475 0L6.75 6.774a2.75 2.75 0 0 0-.596.892l-.848 2.047a.75.75 0 0 0 .98.98l2.047-.848a2.75 2.75 0 0 0 .892-.596l4.261-4.262a1.75 1.75 0 0 0 0-2.474Z" />
                                            <path d="M4.75 3.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h6.5c.69 0 1.25-.56 1.25-1.25V9A.75.75 0 0 1 14 9v2.25A2.75 2.75 0 0 1 11.25 14h-6.5A2.75 2.75 0 0 1 2 11.25v-6.5A2.75 2.75 0 0 1 4.75 2H7a.75.75 0 0 1 0 1.5H4.75Z" />
                                        </svg>
                                        <label>EDIT ORDER</label>
                                    </div>
                                </Dropdown.Item>
                                <Dropdown.Item onClick={handleNewDelivery}>
                                    <div className='flex items-center'>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4 mr-2">
                                        <path d="M3.375 4.5C2.339 4.5 1.5 5.34 1.5 6.375V13.5h12V6.375c0-1.036-.84-1.875-1.875-1.875h-8.25ZM13.5 15h-12v2.625c0 1.035.84 1.875 1.875 1.875h.375a3 3 0 1 1 6 0h3a.75.75 0 0 0 .75-.75V15Z" />
                                        <path d="M8.25 19.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0ZM15.75 6.75a.75.75 0 0 0-.75.75v11.25c0 .087.015.17.042.248a3 3 0 0 1 5.958.464c.853-.175 1.522-.935 1.464-1.883a18.659 18.659 0 0 0-3.732-10.104 1.837 1.837 0 0 0-1.47-.725H15.75Z" />
                                        <path d="M19.5 19.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0Z" />
                                    </svg>
                                        <label>RECEIVING ITEMS</label>
                                    </div>
                                </Dropdown.Item>
                                <Dropdown.Item onClick={() => navigate(`/EmpirePMS/invoice/create`, {state: {suppId: purchaseOrderState.supplier._id, orderId: purchaseOrderState._id}})}>
                                    <div className='flex items-center'>
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4 mr-2">
                                            <path fillRule="evenodd" d="M3.75 3.375c0-1.036.84-1.875 1.875-1.875H9a3.75 3.75 0 0 1 3.75 3.75v1.875c0 1.036.84 1.875 1.875 1.875H16.5a3.75 3.75 0 0 1 3.75 3.75v7.875c0 1.035-.84 1.875-1.875 1.875H5.625a1.875 1.875 0 0 1-1.875-1.875V3.375Zm10.5 1.875a5.23 5.23 0 0 0-1.279-3.434 9.768 9.768 0 0 1 6.963 6.963A5.23 5.23 0 0 0 16.5 7.5h-1.875a.375.375 0 0 1-.375-.375V5.25ZM12 10.5a.75.75 0 0 1 .75.75v.028a9.727 9.727 0 0 1 1.687.28.75.75 0 1 1-.374 1.452 8.207 8.207 0 0 0-1.313-.226v1.68l.969.332c.67.23 1.281.85 1.281 1.704 0 .158-.007.314-.02.468-.083.931-.83 1.582-1.669 1.695a9.776 9.776 0 0 1-.561.059v.028a.75.75 0 0 1-1.5 0v-.029a9.724 9.724 0 0 1-1.687-.278.75.75 0 0 1 .374-1.453c.425.11.864.186 1.313.226v-1.68l-.968-.332C9.612 14.974 9 14.354 9 13.5c0-.158.007-.314.02-.468.083-.931.831-1.582 1.67-1.694.185-.025.372-.045.56-.06v-.028a.75.75 0 0 1 .75-.75Zm-1.11 2.324c.119-.016.239-.03.36-.04v1.166l-.482-.165c-.208-.072-.268-.211-.268-.285 0-.113.005-.225.015-.336.013-.146.14-.309.374-.34Zm1.86 4.392V16.05l.482.165c.208.072.268.211.268.285 0 .113-.005.225-.015.336-.012.146-.14.309-.374.34-.12.016-.24.03-.361.04Z" clipRule="evenodd" />
                                        </svg>
                                        <label>RECEIVING INVOICE</label>
                                    </div>
                                </Dropdown.Item>
                                <Dropdown.Item onClick={() => setShowModal(true)}>
                                    <div className='flex items-center'>
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="size-4 mr-2">
                                            <path d="M2 3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3Z" />
                                            <path fillRule="evenodd" d="M13 6H3v6a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V6ZM8.75 7.75a.75.75 0 0 0-1.5 0v2.69L6.03 9.22a.75.75 0 0 0-1.06 1.06l2.5 2.5a.75.75 0 0 0 1.06 0l2.5-2.5a.75.75 0 1 0-1.06-1.06l-1.22 1.22V7.75Z" clipRule="evenodd" />
                                        </svg>
                                        <label>{ purchaseOrderState.order_isarchived ? `UNARCHIVE` : `ARCHIVE`}</label>
                                    </div>
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>}
                    {/* PURCHASE ORDER DETAILS */}
                    <div>
                        { purchaseOrderDetails }
                    </div>
                    {/* PRODUCTS TABLE and CALCULATION */}
                    <div>
                        { productsTable }
                    </div>
                    {/* TABS */}
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'>
                        {/* Left Section with Tabs for Invoices and Supplier Details */}
                        <div className='col-span-1 md:col-span-2'>
                            <div className='flex text-xs md:text-sm'>
                                <button 
                                    className={`${currentLeftTab === 'invoicesTable' ? 'border-2 p-2 rounded bg-gray-700 text-white' : 'border-2 p-2 rounded bg-transparent text-black hover:scale-90 transition-transform duration-150'}`}
                                    onClick={() => { setCurrentLeftTab('invoicesTable'); scrollToDiv(invoicesTableRef); }}>
                                    Invoices
                                </button>
                                <button 
                                    className={`${currentLeftTab === 'deliveriesTable' ? 'border-2 p-2 rounded bg-gray-700 text-white' : 'border-2 p-2 rounded bg-transparent text-black hover:scale-90 transition-transform duration-150'}`}
                                    onClick={() => { setCurrentLeftTab('deliveriesTable'); scrollToDiv(deliveriesTableRef); }}>
                                    Deliveries
                                </button>
                                <button 
                                    className={`${currentLeftTab === 'supplierDetails' ? 'border-2 p-2 rounded bg-gray-700 text-white' : 'border-2 p-2 rounded bg-transparent text-black hover:scale-90 transition-transform duration-150'}`}
                                    onClick={() => { setCurrentLeftTab('supplierDetails'); scrollToDiv(supplierDetailsRef); }}>
                                    Supplier Details
                                </button>
                            </div>
                            {/* Conditional Rendering for Left Tab Content */}
                            <div>
                                {currentLeftTab === 'invoicesTable' && invoicesTable}
                                {currentLeftTab === 'deliveriesTable' && deliveriesTable}
                                {currentLeftTab === 'supplierDetails' && supplierDetails}
                            </div>
                        </div>

                        {/* Right Section with Tabs for Internal Comments and Notes to Supplier */}
                        <div className='col-span-1'>
                            <div className='flex text-xs md:text-sm'>
                                <button 
                                    className={`${currentRightTab === 'internalComments' ? 'border-2 p-2 rounded bg-gray-700 text-white' : 'border-2 p-2 rounded bg-transparent text-black hover:scale-90 transition-transform duration-150'}`}
                                    onClick={() => { setCurrentRightTab('internalComments'); scrollToDiv(internalCommentsRef); }}>
                                    Internal Comments
                                </button>
                                <button 
                                    className={`${currentRightTab === 'notesToSupplier' ? 'border-2 p-2 rounded bg-gray-700 text-white' : 'border-2 p-2 rounded bg-transparent text-black hover:scale-90 transition-transform duration-150'}`}
                                    onClick={() => { setCurrentRightTab('notesToSupplier'); scrollToDiv(notesToSupplierRef); }}>
                                    Notes to Supplier
                                </button>
                            </div>
                            {/* Conditional Rendering for Right Tab Content */}
                            <div>
                                {currentRightTab === 'internalComments' && internalComments}
                                {currentRightTab === 'notesToSupplier' && notesToSupplier}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            { archiveModal }
            { deliveryModal }
        </div> ) : ( <UnauthenticatedSkeleton /> )
    );

}

export default PurchaseOrderDetails;