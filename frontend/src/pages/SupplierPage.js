//import modules
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux'
import { setSupplierState, clearSupplierState } from '../redux/supplierSlice'
import SessionExpired from "../components/SessionExpired";
import EmployeePageSkeleton from "./loaders/EmployeePageSkeleton";

const Supplier = () => {
    //Component state declaration
    const supplierState = useSelector((state) => state.supplierReducer.supplierState)
    const dispatch = useDispatch()
    const [isLoadingState, setIsLoadingState] = useState(true);
    const [errorState, setErrorState] = useState(null);
    const [isArchive, setIsArchive] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    //Component router
    const navigate = useNavigate();

    //Component functions and variables
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const filterSuppliers = () => {
        return supplierState.filter(supplier => {
            // Convert the search term and supplier fields to lowercase for case-insensitive search
            const lowerCaseSearchTerm = searchTerm.toLowerCase();

            // Check each field for the search term
            return (
                supplier.supplier_name.toLowerCase().includes(lowerCaseSearchTerm) ||
                supplier.supplier_contacts.some(contact => (
                    contact.name.toLowerCase().includes(lowerCaseSearchTerm) ||
                    contact.email.toLowerCase().includes(lowerCaseSearchTerm) ||
                    contact.phone.toLowerCase().includes(lowerCaseSearchTerm)
                )) ||
                supplier.supplier_address.toLowerCase().includes(lowerCaseSearchTerm) ||
                supplier.supplier_payment_term.toLowerCase().includes(lowerCaseSearchTerm) ||
                supplier.supplier_type.toLowerCase().includes(lowerCaseSearchTerm) ||
                supplier.supplier_material_types.toLowerCase().includes(lowerCaseSearchTerm)
            );
        });
    };

    const handleAddClick = () => {
        dispatch(clearSupplierState());
        navigate('/EmpirePMS/supplier/create');
    }

    const handleTableClick = (id) => navigate(`/EmpirePMS/supplier/${id}`, { state: id });
    

    //Render component
    useEffect(() => {
        const abortController = new AbortController();
        const signal = abortController.signal;

        const fetchAllSuppliers = async () => {
            setIsLoadingState(true);
            try {
                const res = await fetch('https://empire-pms.onrender.com/api/supplier', { signal, credentials: 'include' });
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

        fetchAllSuppliers();

        return () => {
            abortController.abort(); // Cleanup
        };
    }, [dispatch]);
    
    //Display DOM
    const supplierTable = Array.isArray(supplierState) && supplierState.length > 0 ? (
        <div className="container">
            <table className="table table-bordered table-hover shadow-md">
                <thead className="thead-dark">
                    <tr className="table-primary">
                        <th scope="col">ID</th>
                        <th scope="col">Name</th>
                        <th scope="col">Contacts</th>
                        <th scope="col">Email</th>
                        <th scope="col">Phone</th>
                        <th scope="col">Address</th>
                        <th scope="col">Payment Term</th>
                        <th scope="col">Type</th>
                        <th scope="col">Material Type</th>
                    </tr>
                </thead>
                <tbody>
                    {filterSuppliers().filter(supplier => supplier.supplier_isarchived === isArchive).map((supplier, index) => (
                        <tr key={supplier._id} onClick={() => handleTableClick(supplier._id)} className="cursor-pointer">
                            <th scope="row">{index + 1}</th>
                            <td>{supplier.supplier_name}</td>
                            <td>
                                {supplier.supplier_contacts.map(contact => (
                                    <div key={contact._id}>
                                        {contact.name}
                                    </div>
                                ))}
                            </td>
                            <td>
                                {supplier.supplier_contacts.map(contact => (
                                    <div key={contact._id}>
                                        {contact.email}
                                    </div>
                                ))}
                            </td>
                            <td>
                                {supplier.supplier_contacts.map(contact => (
                                    <div key={contact._id}>
                                        {contact.phone}
                                    </div>
                                ))}
                            </td>
                            <td>{supplier.supplier_address}</td>
                            <td>{supplier.supplier_payment_term}</td>
                            <td>{supplier.supplier_type}</td>
                            <td>{supplier.supplier_material_types}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    ) : (
        <div>Supplier API fetched successfully, but it might be empty...</div>
    );
    
    if (isLoadingState) { return (<EmployeePageSkeleton />); }

    if (errorState) {
        if(errorState.includes("Session expired") || errorState.includes("jwt expired")){
            return(<div><SessionExpired /></div>)
        }
        return (<div>Error: {errorState}</div>);
    }

    return (
        <div className="container my-5"><div className="card">
                <div className="card-header bg-dark text-white">
                    <h1 className='mx-auto uppercase font-bold text-xl'>SUPPLIERS</h1>
                </div>
                <div className="card-body">
                    <div className="row mb-1">
                        <div className="col-md-6">
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
                                    <label>ADD SUPPLIER</label>
                                </div>
                            </button>
                        </div>
                    </div>
                    <div className="row mb-3">
                    <div className="col-md-6 mt-2">
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
                        {supplierTable}
                    </div>
                </div>
            </div>
        </div>
    );
};
 
export default Supplier;