//import modules
import { useParams, useNavigate} from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { setInvoiceState } from '../redux/invoiceSlice';
import { clearProductState } from '../redux/productSlice';

import { useUpdateInvoice } from '../hooks/useUpdateInvoice';

import SessionExpired from "../components/SessionExpired";
import EmployeeDetailsSkeleton from "./loaders/EmployeeDetailsSkeleton";
import { Modal, Button } from "react-bootstrap";
import Dropdown from "react-bootstrap/Dropdown";

const InvoiceDetails = () => {
    //Component router
    const { id } = useParams();
    const navigate = useNavigate();

    //Component state declaration
    const invoiceState = useSelector((state) => state.invoiceReducer.invoiceState)
    const [isLoadingState, setIsLoadingState] = useState(true);
    const [errorState, setErrorState] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [currentLeftTab, setCurrentLeftTab] = useState('supplierDetails');
    const [currentRightTab, setCurrentRightTab] = useState('internalComments');
    const [showLastDiv, setShowLastDiv] = useState(false);
    const [targetRef, setTargetRef] = useState(null);

    //Component hooks
    const { updateInvoice, isUpdateLoadingState, updateErrorState } = useUpdateInvoice();
    const dispatch = useDispatch();
    const internalCommentsRef = useRef(null);
    const supplierDetailsRef = useRef(null);
    const purchaseOrderTableRef = useRef(null);

    //Component functions and variables    
    const handleBackClick = () => navigate(-1);

    const handleProductTableClick = (productId) => { 
        dispatch(clearProductState());
        navigate(`/EmpirePMS/supplier/${invoiceState.supplier._id}/products/${productId}`, {state: invoiceState.supplier._id})
    }

    const handleEditInvoice = () => {
        navigate(`/EmpirePMS/invoice/${id}/edit`)
    }

    const handleArchive = () => {    
        let updatedState;
        if (invoiceState.invoice_isarchived === true) {
            updatedState = {
                ...invoiceState,
                invoice_isarchived: false,
            };
        } else {
            updatedState = {
                ...invoiceState,
                invoice_isarchived: true,
            };
        }
    
        dispatch(setInvoiceState(updatedState));

        updateInvoice(updatedState, `Invoice has been ${invoiceState.invoice_isarchived ? `unarchived` : `archived`}`);

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

    // const totalGrossAmount = purchaseOrderState && purchaseOrderState.products
    // ? parseFloat(purchaseOrderState.products.reduce(
    //       (total, product) => total + (product.order_product_gross_amount || 0),
    //       0
    //   )).toFixed(2) //change number to two decimal points
    // : 0;

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
    
    //Render component
    useEffect(() => {
        const fetchInvoiceDetails = async () => {
            try {
                const res = await fetch(`/api/invoice/${id}`);
                if (!res.ok) {
                    throw new Error('Failed to fetch invoice details');
                }
                const data = await res.json();

                if (data.tokenError) {
                    throw new Error(data.tokenError);
                }

                dispatch(setInvoiceState(data));

                setIsLoadingState(false);
            } catch (err) {
                setErrorState(err.message);
                setIsLoadingState(false);
            }
        };

        fetchInvoiceDetails();
    }, [id, dispatch]);

    useEffect(() => {
        // If a targetRef is stored and it is now rendered, scroll to it
        if (targetRef && targetRef.current) {
          targetRef.current.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'center' });
          setTargetRef(null); // Clear the targetRef once scrolled
        }
      }, [showLastDiv, targetRef]);

    // Display DOM
    if (isLoadingState || isUpdateLoadingState) { return (<EmployeeDetailsSkeleton />); }

    if (errorState || updateErrorState) {
        if(errorState.includes("Session expired") || errorState.includes("jwt expired")){
            return(<div><SessionExpired /></div>)
        }
        return (
            <div>
                Error: {errorState || updateErrorState}
            </div>
        );
    }

    const invoiceDetails = invoiceState ? (
        <div className="row">
            <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">Supplier:</label>
                <p className="form-label">{invoiceState.supplier.supplier_name}</p>
            </div>
            <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">Archived (?):</label>
                {invoiceState.invoice_isarchived ? 
                    (<label className="text-lg font-bold m-1 p-2 rounded-xl text-red-500">Archived</label>) : 
                    (<label className="text-lg font-bold m-1 p-2 rounded-xl text-green-600">Available</label>)
                }
            </div>
            <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">Invoice Issue Date:</label>
                <p className="form-label">{formatDate(invoiceState.invoice_issue_date)}</p>
            </div>
            <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">Invoice Received Date:</label>
                <p className="form-label">{formatDateTime(invoiceState.invoice_received_date)}</p>
            </div>
            <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">Invoice Due Date:</label>
                <p className="form-label">{formatDateTime(invoiceState.invoice_due_date)}</p>
            </div>
            <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">Invoice Status:</label>
                {invoiceState.invoice_status && (
                <label
                    className={`text-lg font-bold m-1 py-0.5 px-1 rounded-xl ${
                        invoiceState.invoice_status === "Cancelled"
                        ? "border-2 bg-transparent border-gray-500 text-gray-500"
                        : invoiceState.invoice_status === "To review"
                        ? "border-2 bg-transparent border-yellow-300 text-yellow-600"
                        : invoiceState.invoice_status === "Settled"
                        ? "border-2 bg-transparent border-green-600 text-green-600"
                        : invoiceState.invoice_status === "To reconcile"
                        ? "border-2 bg-transparent border-red-600 text-red-600"
                        : invoiceState.invoice_status === "Reviewed"
                        ? "border-2 bg-transparent border-blue-400 text-blue-400"
                        : ""
                    }`}
                >
                    {invoiceState.invoice_status}
                </label>
                )}
            </div>
            <div className="col-md-6 mb-3 text-sm opacity-50">
                <label className="form-label fw-bold">Standalone:</label>
                <p className="form-label">{invoiceState.invoice_is_stand_alone ? `Yes` : `No`}</p>
            </div>
            <div className="col-md-6 mb-3 text-sm opacity-50">
                <label className="form-label fw-bold">Archived:</label>
                <p className="form-label">{invoiceState.invoice_isarchived ? `Yes` : `No`}</p>
            </div>
        </div>
    ) : (
        <div className='border'>Invoice API fetched successfully, but it might be empty...</div>
    );

    const productsTable = invoiceState.products.length > 0 || invoiceState.custom_products.length > 0 ? (
        <div className="container p-0 bg-slate-50 mb-4 shadow-md text-sm">
            <h2 className='font-bold text-lg m-1'>Invoiced products:</h2>
            <table className="table table-hover m-0">
                <thead className="text-center">
                    <tr className="table-primary">
                        <th scope="col">SKU</th>
                        <th scope="col">Name</th>
                        <th scope="col">Location</th>
                        <th scope="col">Invoice Qty</th>
                        <th scope="col">Invoice Price</th>
                        <th scope="col">Invoice Gross Amount</th>
                    </tr>
                </thead>
                <tbody className='text-center'>
                    {/* registered products */}
                    {invoiceState.products && invoiceState.products.map((product, index) => (
                    <tr key={`${product.product_obj_ref._id}-${index}`} className='cursor-pointer' onClick={() => handleProductTableClick(product.product_obj_ref._id)}>
                        <td>{product.product_obj_ref.product_sku}</td>
                        <td>{product.product_obj_ref.product_name}</td>
                        <td>{product.invoice_product_location}</td>
                        <td>
                            {Number.isInteger(product.invoice_product_qty_a)
                                ? product.invoice_product_qty_a
                                : parseFloat(product.invoice_product_qty_a).toFixed(4)}
                        </td>
                        <td className='border-r-2'>
                            $ {Number.isInteger(product.invoice_product_price_unit)
                                ? product.invoice_product_price_unit
                                : parseFloat(product.invoice_product_price_unit).toFixed(4)}
                        </td>
                        <td className='text-end'>$ {product.invoice_product_gross_amount_a.toFixed(2)}</td>
                    </tr>
                    ))}
                    {/* custom products */}
                    {invoiceState.custom_products && invoiceState.custom_products.map((cusProduct, index) => (
                    <tr key={index} className='cursor-default'>
                        <td>-</td>
                        <td>{cusProduct.custom_product_name}</td>
                        <td>{cusProduct.custom_product_location}</td>
                        <td>{cusProduct.custom_order_qty}</td>
                        <td className='border-r-2'>$ {(cusProduct.custom_order_price).toFixed(4)}</td>
                        <td className='text-end'>$ {(cusProduct.custom_order_gross_amount).toFixed(2)}</td>
                    </tr>
                    ))}
                    <tr>
                        <td colSpan={3}></td>
                        <td className='pt-1 font-bold text-end border-r-2' colSpan={2}>Delivery Fee:</td>
                        <td className='pt-1 text-end'>$ {(invoiceState.invoiced_delivery_fee).toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td colSpan={3}></td>
                        <td className='pt-1 font-bold text-end border-r-2' colSpan={2}>Other Fee(strap/pallet/cut):</td>
                        <td className='pt-1 text-end'>$ {(invoiceState.invoiced_other_fee).toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td colSpan={3}></td>
                        <td className='pt-1 font-bold text-end border-r-2' colSpan={2}>Credit:</td>
                        <td className='pt-1 text-end'>$ {(invoiceState.invoiced_credit).toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td colSpan={3}></td>
                        <td className='pt-1 font-bold text-end border-r-2' colSpan={2}>Computed Total Amount:</td>
                        <td className='pt-1 font-bold text-end'>$ {(invoiceState.invoiced_calculated_total_amount_incl_gst / 1.1).toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td colSpan={3}></td>
                        <td className='pt-1 font-bold text-end border-r-2' colSpan={2}>Computed Total Amount (incl. GST):</td>
                        <td className='pt-1 font-bold'>$ {(invoiceState.invoiced_calculated_total_amount_incl_gst).toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td colSpan={3}></td>
                        <td className='pt-1 font-bold text-end border-r-2' colSpan={2}>Raw Total Amount (incl. GST):</td>
                        <td className='pt-1 font-bold'>$ {(invoiceState.invoiced_raw_total_amount_incl_gst).toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    ): (
        <div className='border'>Purchase Order's products fetched successfully, but it might be empty...</div>
    );

    const internalComments = invoiceState.invoice_internal_comments !== '' ? (
        <div className="card-body border-1 relative shadow-md p-2" ref={internalCommentsRef}>
            <div className='border rounded-md bg-blue-100 p-2 h-20 md:h-32 lg:h-48'>
                <p>{invoiceState.invoice_internal_comments}</p>
            </div>
        </div>
    ) : (
        <div className='border shadow-sm'><p className='m-2 p-1'>There are no internal comments...</p></div>
    )

    const purchaseOrderTable = invoiceState.order ? (
        <div className="card-body border-1 relative shadow-md" ref={purchaseOrderTableRef}>
            <div className="row">
                <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Order Ref:</label>
                    <p className="form-label">{invoiceState.order.order_ref}</p>
                </div>
                <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Order Date:</label>
                    <p className="form-label">{formatDate(invoiceState.order.order_date)}</p>
                </div>
                <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Order EST Datetime:</label>
                    <p className="form-label">{formatDateTime(invoiceState.order.order_est_datetime)}</p>
                </div>
                <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Order Status:</label>
                    <label>
                        {invoiceState.order.order_status && (
                        <label
                            className={`text-sm font-bold m-1 py-0.5 px-1 rounded-xl ${
                                invoiceState.order.order_status === "Cancelled"
                                    ? "border-2 bg-transparent border-gray-500 text-gray-500"
                                    : invoiceState.order.order_status === "Pending"
                                    ? "border-2 bg-transparent border-yellow-300 text-yellow-600"
                                    : invoiceState.order.order_status === "Approved"
                                    ? "border-2 bg-transparent border-green-600 text-green-600"
                                    : invoiceState.order.order_status === "Rejected"
                                    ? "border-2 bg-transparent border-red-600 text-red-600"
                                    : invoiceState.order.order_status === "Draft"
                                    ? "border-2 bg-transparent border-gray-600 text-gray-600"
                                    : ""
                            }`}
                        >
                            {invoiceState.order.order_status}
                        </label>
                        )}
                    </label>
                </div>
                <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">isArchived:</label>
                    {invoiceState.order.order_isarchived ? 
                        (<label className="text-lg font-bold m-1 p-2 rounded-xl text-red-500">Archived</label>) : 
                        (<label className="text-lg font-bold m-1 p-2 rounded-xl text-green-600">Active</label>)
                    }
                </div>
                
                <div>
                    <h2 className='font-bold text-lg m-1'>Products Ordered:</h2>
                    <table className="table table-bordered shadow-sm text-xs">
                        <thead className="thead-dark">
                            <tr className="table-primary">
                                <th scope="col" className='text-center'>SKU</th>
                                <th scope="col" className='text-center'>Product Name</th>
                                <th scope="col" className='text-center'>Location</th>
                                <th scope="col" className='text-center'>Ordered Qty</th>
                                <th scope="col" className='text-center'>Ordered Price</th>
                                <th scope="col" className='text-center'>Ordered Gross Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoiceState.order.products && invoiceState.order.products.map((prod, index) => (
                                <tr key={index}>
                                    <td className='text-center'>{prod.product_obj_ref.product_sku}</td>
                                    <td className='text-center'>{prod.product_obj_ref.product_name}</td>
                                    <td className='text-center'>{prod.order_product_location}</td>
                                    <td className='text-center'>{prod.order_product_qty_a}</td>
                                    <td className='text-center'>$ {prod.order_product_price_unit_a}</td>
                                    <td className='text-end'>$ {prod.order_product_gross_amount}</td>
                                </tr>
                            ))}
                            {invoiceState.order.custom_products && invoiceState.order.custom_products.map((cusprod, index) => (
                                <tr key={index}>
                                    <td className='text-center'>-</td>
                                    <td className='text-center'>{cusprod.custom_product_name}</td>
                                    <td className='text-center'>{cusprod.custom_product_location}</td>
                                    <td className='text-center'>{cusprod.custom_order_qty}</td>
                                    <td className='text-center'>-</td>
                                    <td className='text-end'>-</td>
                                </tr>
                            ))}
                            <tr>
                                <td colSpan={3}></td>
                                <td colSpan={2} className='text-end font-bold'>No. of Item:</td>
                                <td className='text-end font-bold'>{invoiceState.order.products.length + invoiceState.order.custom_products.length}</td>
                            </tr>
                            <tr>
                                <td colSpan={3}></td>
                                <td colSpan={2} className='text-end font-bold'>Computed Total Amount:</td>
                                <td className='text-end font-bold'>$ {(invoiceState.order.order_total_amount / 1.1).toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td colSpan={3}></td>
                                <td colSpan={2} className='text-end font-bold'>Computed Total Amount (incl. GST):</td>
                                <td className='text-end font-bold'>$ {invoiceState.order.order_total_amount}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    ) : (
        <div className='border'>Fetched successfully, but this invoice is a standalone with no Purchase Order.</div>
    );

    const supplierDetails = invoiceState.supplier ? (
        <div className="card-body border-1 relative shadow-md" ref={supplierDetailsRef}>
            <div className="row">
                <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Supplier Name:</label>
                    <p className="form-label">{invoiceState.supplier.supplier_name}</p>
                </div>
                <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Address:</label>
                    <p className="form-label">{invoiceState.supplier.supplier_address}</p>
                </div>
                <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Payment Term:</label>
                    <p className="form-label">{invoiceState.supplier.supplier_payment_term}</p>
                </div>
                <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Payment Term Description:</label>
                    <p className="form-label">{invoiceState.supplier.supplier_term_description}</p>
                </div>
                <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Payment Method:</label>
                    <p className="form-label">{invoiceState.supplier.supplier_payment_method_details}</p>
                </div>
                <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Supplier Type:</label>
                    <p className="form-label">{invoiceState.supplier.supplier_type}</p>
                </div>
                <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Supplier Material Type:</label>
                    <p className="form-label">{invoiceState.supplier.supplier_material_types}</p>
                </div>
                <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Supplier Status:</label>
                    {invoiceState.supplier.supplier_isarchived ? 
                        (<label className="text-lg font-bold m-1 p-2 rounded-xl text-red-500">Archived</label>) : 
                        (<label className="text-lg font-bold m-1 p-2 rounded-xl text-green-600">Active</label>)
                    }
                </div>
                
                <div>
                    <h2 className='font-bold text-xl m-1'>Supplier Contacts</h2>
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
                            {invoiceState.supplier.supplier_contacts && invoiceState.supplier.supplier_contacts.map((supplier,index) => (
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
        <div className='border'>Invoice's supplier fetched successfully, but it might be empty...</div>
    );
    
    const archiveModal = (
        <Modal show={showModal} onHide={() => setShowModal(false)}>
            <Modal.Header closeButton>
                <Modal.Title>
                    { invoiceState && invoiceState.invoice_isarchived ? `Confirm Unarchive` : `Confirm Archive`}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                { invoiceState && invoiceState.invoice_isarchived ? `Are you sure you want to unarchive this purchase order?` : `Are you sure you want to archive this purchase order?`}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowModal(false)}>
                    Cancel
                </Button>
                <Button className="bg-red-600 hover:bg-red-600" variant="primary" onClick={handleArchive}>
                    { invoiceState && invoiceState.invoice_isarchived ? `Unarchive` : `Archive`}
                </Button>
            </Modal.Footer>
        </Modal>
    )
    
    return (
        <div className="container mt-5">
            <div className="card">
                {/* CARD HEADER */}
                <div className="card-header bg-dark text-white flex justify-between items-center">
                    <button onClick={handleBackClick}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-7 w-12 border-transparent bg-gray-700 rounded-md p-1 hover:bg-gray-500 hover:scale-95 ease-out duration-300">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m18.75 4.5-7.5 7.5 7.5 7.5m-6-15L5.25 12l7.5 7.5"/>
                        </svg>
                    </button>
                    <h1 className='mx-auto uppercase font-bold text-xl'>INVOICE REF: {invoiceState.invoice_ref}</h1>
                </div>
                <div className="card-body">
                    {/* DROPDOWN ACTION */}
                    { new Date(invoiceState.createdAt) > new Date("2024-07-20T00:00:00.000Z") &&
                    <div className="absolute right-3">
                        <Dropdown>
                            <Dropdown.Toggle variant="success" id="dropdown-basic">
                                ACTIONS
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item onClick={handleEditInvoice}>
                                    <div className='flex items-center'>
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="size-4 mr-2">
                                            <path d="M13.488 2.513a1.75 1.75 0 0 0-2.475 0L6.75 6.774a2.75 2.75 0 0 0-.596.892l-.848 2.047a.75.75 0 0 0 .98.98l2.047-.848a2.75 2.75 0 0 0 .892-.596l4.261-4.262a1.75 1.75 0 0 0 0-2.474Z" />
                                            <path d="M4.75 3.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h6.5c.69 0 1.25-.56 1.25-1.25V9A.75.75 0 0 1 14 9v2.25A2.75 2.75 0 0 1 11.25 14h-6.5A2.75 2.75 0 0 1 2 11.25v-6.5A2.75 2.75 0 0 1 4.75 2H7a.75.75 0 0 1 0 1.5H4.75Z" />
                                        </svg>
                                        <label>EDIT INVOICE</label>
                                    </div>
                                </Dropdown.Item>
                                <Dropdown.Item onClick={() => setShowModal(true)}>
                                    <div className='flex items-center'>
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="size-4 mr-2">
                                            <path d="M2 3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3Z" />
                                            <path fillRule="evenodd" d="M13 6H3v6a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V6ZM8.75 7.75a.75.75 0 0 0-1.5 0v2.69L6.03 9.22a.75.75 0 0 0-1.06 1.06l2.5 2.5a.75.75 0 0 0 1.06 0l2.5-2.5a.75.75 0 1 0-1.06-1.06l-1.22 1.22V7.75Z" clipRule="evenodd" />
                                        </svg>
                                        <label>{ invoiceState.invoice_isarchived ? `UNARCHIVE` : `ARCHIVE`}</label>
                                    </div>
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>}
                    {/* PURCHASE ORDER DETAILS */}
                    <div>
                        { invoiceDetails }
                    </div>
                    {/* PRODUCTS TABLE and CALCULATION */}
                    <div>
                        { productsTable }
                    </div>
                    {/* TABS */}
                    <div className='grid grid-cols-3 gap-x-3'>
                        <div className='col-span-2'>
                            <div>
                                <button className={`${currentLeftTab === 'purchaseOrderTable' ? 'border-x-2 border-t-2 p-2 rounded bg-gray-700 text-white' : 'border-x-2 border-t-2 p-2 rounded bg-transparent text-black hover:scale-90 transition ease-out duration-50 '}`}  onClick={() => {setCurrentLeftTab('purchaseOrderTable'); scrollToDiv(purchaseOrderTableRef);}}>Purchase Order</button>
                                <button className={`${currentLeftTab === 'supplierDetails' ? 'border-x-2 border-t-2 p-2 rounded bg-gray-700 text-white' : 'border-x-2 border-t-2 p-2 rounded bg-transparent text-black hover:scale-90 transition ease-out duration-50 '}`}  onClick={() => {setCurrentLeftTab('supplierDetails'); scrollToDiv(supplierDetailsRef);}}>Supplier Details</button>
                            </div>
                            {/* SWITCH BETWEEN COMPONENTS HERE */}
                            {currentLeftTab === 'purchaseOrderTable' && purchaseOrderTable}
                            {currentLeftTab === 'supplierDetails' && supplierDetails}
                        </div>
                        <div className='col-span-1'>
                            <div>
                                <button className={`${currentRightTab === 'internalComments' ? 'border-x-2 border-t-2 p-2 rounded bg-gray-700 text-white' : 'border-x-2 border-t-2 p-2 rounded bg-transparent text-black hover:scale-90 transition ease-out duration-50 '}`}  onClick={() => {setCurrentRightTab('internalComments'); scrollToDiv(internalCommentsRef);}}>Internal Comments</button>
                            </div>
                            {/* NOTES TO SUPPLIER */}
                            {currentRightTab === 'internalComments' && internalComments}
                        </div>
                    </div>
                </div>
            </div>
            { archiveModal }
        </div>
    );

}

export default InvoiceDetails;