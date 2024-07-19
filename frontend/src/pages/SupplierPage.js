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

    //Component router
    const navigate = useNavigate();

    //Component functions and variables
    const handleAddClick = () => {
        dispatch(clearSupplierState());
        navigate('/EmpirePMS/supplier/create');
    }
    const handleTableClick = (id) => navigate(`/EmpirePMS/supplier/${id}`, { state: id });
    const supplierTable = Array.isArray(supplierState) && supplierState.length > 0 ? (
        <div className="container">
            <table className="table table-bordered table-hover">
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
                    {supplierState.map((supplier, index) => (
                        <tr key={supplier._id} onClick={() => handleTableClick(supplier._id)}>
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

    //Render component
    useEffect(() => {
        const abortController = new AbortController();
        const signal = abortController.signal;

        const fetchAllSuppliers = async () => {
            setIsLoadingState(true);
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

        fetchAllSuppliers();

        return () => {
            abortController.abort(); // Cleanup
        };
    }, [dispatch]);
    
    //Display DOM
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
                    <h1>SUPPLIERS</h1>
                </div>
                <div className="card-body">
                    <div className="row mb-3">
                        <div className="col-md-6">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search..."
                            />
                        </div>
                        <div className="col-md-6 d-flex justify-content-end">
                            <button className="btn btn-primary" onClick={handleAddClick}>
                                ADD SUPPLIER
                            </button>
                        </div>
                    </div>
                    <div className="row mb-3">
                        <div className="col-md-6">
                            <button className="btn btn-outline-dark me-2">Current</button>
                            <button className="btn btn-outline-dark">Archived</button>
                        </div>
                        {supplierTable}
                    </div>
                </div>
            </div>
        </div>
    );
};
 
export default Supplier;