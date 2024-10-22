//import modules
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux'

import { setInvoiceState, clearInvoiceState } from '../redux/invoiceSlice'
import { clearProductState } from '../redux/productSlice'
import { clearSupplierState } from '../redux/supplierSlice'
import { clearProjectState } from '../redux/projectSlice'

import SessionExpired from "../components/SessionExpired";
import EmployeePageSkeleton from "./loaders/EmployeePageSkeleton";

const InvoicePage = () => {
    //Component state declaration
    const invoiceState = useSelector((state) => state.invoiceReducer.invoiceState)
    const dispatch = useDispatch()
    const [isLoadingState, setIsLoadingState] = useState(true);
    const [errorState, setErrorState] = useState(null);
    const [isArchive, setIsArchive] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchDate, setSearchDate] = useState('');

    //Component router
    const navigate = useNavigate();

    //Component functions and variables
    const formatDateTime = (dateString) => {
        if (dateString === null) {
            return ''
        }  else {
            const date = new Date(dateString);
            const options = { day: '2-digit', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true };
            return date.toLocaleDateString('en-AU', options).toUpperCase().replace(' ', '-').replace(' ', '-');
        }
    };

    const handleSearchDateChange = (e) => {
        setSearchDate(e.target.value);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const filterInvoices = () => {
        return invoiceState.filter(invoice => {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
    
            // Check each field for the search term
            return (
                invoice.invoice_ref.toLowerCase().includes(lowerCaseSearchTerm) ||
                invoice.supplier.supplier_name.toLowerCase().includes(lowerCaseSearchTerm) ||
                invoice.invoiced_calculated_total_amount_incl_gst.toString().includes(lowerCaseSearchTerm) ||
                invoice.invoiced_raw_total_amount_incl_gst.toString().includes(lowerCaseSearchTerm) ||
                invoice.invoice_status.toLowerCase().includes(lowerCaseSearchTerm) ||
                (invoice.order && invoice.order.order_ref.toLowerCase().includes(lowerCaseSearchTerm))
            );
        });
    };

    const filterBySelectedDate = (invoices) => {
        if (!searchDate) return invoices;
    
        const selected = new Date(searchDate);
        return invoices.filter(invoice => {
            const invoiceDate = new Date(invoice.invoice_issue_date);
            return (
                invoiceDate.getFullYear() === selected.getFullYear() &&
                invoiceDate.getMonth() === selected.getMonth() &&
                invoiceDate.getDate() === selected.getDate()
            );
        });
    };
    
    const handleAddClick = () => {
        dispatch(clearProductState())
        dispatch(clearSupplierState())
        dispatch(clearProjectState())
        navigate('/EmpirePMS/invoice/create');
    }

    const handleTableClick = (id) => {

        dispatch(clearInvoiceState())
        navigate(`/EmpirePMS/invoice/${id}`);
    }
    
    //Render component
    useEffect(() => {
        const abortController = new AbortController();
        const signal = abortController.signal;

        const fetchInvoice = async () => {
            setIsLoadingState(true);
            try {
                const res = await fetch('https://empire-pms.vercel.app/api/invoice', { signal });
                if (!res.ok) {
                    throw new Error('Failed to fetch invoices');
                }
                const data = await res.json();

                if (data.tokenError) {
                    throw new Error(data.tokenError);
                }
                
                setIsLoadingState(false);
                dispatch(setInvoiceState(data));
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

        fetchInvoice();

        return () => {
            abortController.abort(); // Cleanup
        };
    }, [dispatch]);
    
    //Display DOM
    const invoiceTable = Array.isArray(invoiceState) && invoiceState.length > 0 ? (
        <div className="container text-sm">
            <table className="table table-bordered table-hover shadow-md">
                <thead className="thead-dark text-center">
                    <tr className="table-primary">
                        <th scope="col">Invoice Ref</th>
                        <th scope="col">Supplier</th>
                        <th scope="col">Order Ref</th>
                        <th scope="col">Issued on</th>
                        <th scope="col">Received on</th>
                        <th scope="col">Due on</th>
                        <th scope="col">Computed Gross Amount (+GST)</th>
                        <th scope="col">Raw Gross Amount (+GST)</th>
                        <th scope="col">Status</th>
                        <th scope="col">Payment</th>
                    </tr>
                </thead>
                <tbody>
                    {filterBySelectedDate(filterInvoices().filter(invoice => invoice.invoice_isarchived === isArchive)).map(invoice => (
                        <tr key={invoice._id} onClick={() => handleTableClick(invoice._id)} className="cursor-pointer text-center">
                            <th scope="row">{invoice.invoice_ref}</th>
                            <td>{invoice.supplier.supplier_name}</td>
                            <td>{invoice.order?.order_ref || '-'}</td>
                            <td>{formatDateTime(invoice.invoice_issue_date)}</td>
                            <td>{formatDateTime(invoice.invoice_received_date)}</td>
                            <td>{formatDateTime(invoice.invoice_due_date)}</td>
                            <td>${(invoice.invoiced_calculated_total_amount_incl_gst).toFixed(2)}</td>
                            <td>${(invoice.invoiced_raw_total_amount_incl_gst).toFixed(2)}</td>
                            <td>
                                {invoice.invoice_status && (
                                <label
                                    className={`text-sm font-bold m-1 py-0.5 px-1 rounded-xl ${
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
                            <td>
                                {invoice?.payment?.payment_status && (
                                    <label
                                        className={`text-sm font-bold m-1 py-0.5 px-1 rounded-xl ${
                                            invoice.payment.payment_status === "Draft"
                                                ? "border-2 bg-transparent border-gray-500 text-gray-500"
                                                : invoice.payment.payment_status === "Partially Settled"
                                                ? "border-2 bg-transparent border-yellow-300 text-yellow-600"
                                                : invoice.payment.payment_status === "Fully Settled"
                                                ? "border-2 bg-transparent border-green-600 text-green-600"
                                                : invoice.payment.payment_status === "Reviewed"
                                                ? "border-2 bg-transparent border-blue-400 text-blue-400"
                                                : ""
                                        }`}
                                    >
                                        {invoice.payment.payment_status}
                                    </label>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    ) : (
        <div>Invoice API fetched successfully, but it might be empty...</div>
    );
    
    if (isLoadingState) { return (<EmployeePageSkeleton />); }

    if (errorState) {
        if(errorState.includes("Session expired") || errorState.includes("jwt expired")){
            return(<div><SessionExpired /></div>)
        }
        return (<div>Error: {errorState}</div>);
    }


    return (
        <div className="container mt-5"><div className="card">
                <div className="card-header bg-dark text-white">
                    <h1 className='mx-auto uppercase font-bold text-xl'>INVOICES</h1>
                </div>
                <div className="card-body">
                    <div className="row mb-1">
                        <div className="col-md-6 mb-1">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
                        </div>
                        <div className="col-md-6 d-flex justify-content-end">
                            <button className="btn btn-primary" onClick={handleAddClick}>
                                <div className='flex items-center'>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 mr-1">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                    </svg>
                                    <label>NEW INVOICE</label>
                                </div>
                            </button>
                        </div>
                        <div className="col-md-6 d-flex justify-content-start">
                            <input
                                type="date"
                                className="form-control"
                                value={searchDate}
                                onChange={handleSearchDateChange}
                            />
                        </div>
                    </div>
                    <div className="row mb-3">
                    <div className="col-md-6">
                        <button 
                            className={`${!isArchive ? 'border-x-2 border-t-2 p-2 rounded bg-gray-700 text-white' : 'border-x-2 border-t-2 p-2 rounded bg-transparent text-black hover:scale-90 transition ease-out duration-50 '}`} 
                            onClick={() => setIsArchive(false)}
                        >
                            Current
                        </button>
                        <button 
                            className={`${isArchive ? 'border-x-2 border-t-2 p-2 rounded bg-gray-700 text-white' : 'border-x-2 border-t-2 p-2 rounded bg-transparent text-black hover:scale-90 transition ease-out duration-50'}`} 
                            onClick={() => setIsArchive(true)}
                        >
                            Archived
                        </button>
                    </div>
                        {invoiceTable}
                    </div>
                </div>
            </div>
        </div>
    );
};
 
export default InvoicePage;