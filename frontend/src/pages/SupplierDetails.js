//import modules
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setSupplierState } from '../redux/supplierSlice';
import SessionExpired from "../components/SessionExpired";
import EmployeeDetailsSkeleton from "./loaders/EmployeeDetailsSkeleton";
import Dropdown from "react-bootstrap/Dropdown"

const SupplierDetails = () => {
    //Component state declaration
    const supplierState = useSelector((state) => state.supplierReducer.supplierState)
    const dispatch = useDispatch()
    const [isLoadingState, setIsLoadingState] = useState(true);
    const [errorState, setErrorState] = useState(null);

    //Component router
    const { id } = useParams();
    const navigate = useNavigate();

    //Component functions and variables
    const handleEditClick = () => navigate(`/EmpirePMS/supplier/${id}/edit`, { state: id });
    
    //Render component
    useEffect(() => {
        const fetchSupplierDetails = async () => {
            try {
                const res = await fetch(`/api/supplier/${id}`);
                if (!res.ok) {
                    throw new Error('Failed to fetch supplier details');
                }
                const data = await res.json();

                if (data.tokenError) {
                    throw new Error(data.tokenError);
                }

                dispatch(setSupplierState(data));
                setIsLoadingState(false);
            } catch (err) {
                setErrorState(err.message);
                setIsLoadingState(false);
            }
        };

        fetchSupplierDetails();
    }, [id, dispatch]);

    //Display DOM
    if (isLoadingState) { return (<EmployeeDetailsSkeleton />); }

    if (errorState) {
        if(errorState.includes("Session expired") || errorState.includes("jwt expired")){
            return(<div><SessionExpired /></div>)
        }
        return (<div>Error: {errorState}</div>);
    }

    return (
        <div className="container mt-5">
        <div className="card">
            <div className="card-header bg-dark text-white">
                <h1>{supplierState.supplier_name}</h1>
            </div>
            <div className="card-body">
                <div className="d-flex justify-content-between mb-3">
                    <Link to="/EmpirePMS/supplier" className="btn btn-secondary">Back</Link>
                    <button className="btn btn-primary" onClick={handleEditClick}>EDIT DETAILS</button>
                    <Dropdown>
                        <Dropdown.Toggle variant="success" id="dropdown-basic">
                            ACTIONS
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <Dropdown.Item onClick={() => {}}>PLACEHOLDER</Dropdown.Item>
                            <Dropdown.Item onClick={() => {}}>PLACEHOLDER</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
                <div className="d-flex mb-3">
                    <button className="btn btn-outline-dark">Details</button>
                    <button className="btn btn-outline-dark">Products</button>
                    <button className="btn btn-outline-dark">Purchase Orders</button>
                    <button className="btn btn-outline-dark">Projects</button>
                </div>
                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold">Name:</label>
                        <p className="form-label">{supplierState.supplier_name}</p>
                    </div>
                    <div className="col-md-6 mb-3">
                        { supplierState.supplier_contacts.map(supplier => (
                            <div key={supplier._id}>
                            <label className="form-label fw-bold">{ supplier.is_primary ? `Primary` : `Other`} Contact:</label>
                            <p className="form-label">{supplier.name}</p>
                            <label className="form-label fw-bold">Phone:</label>
                            <p className="form-label">{supplier.phone}</p>
                            <label className="form-label fw-bold">Email:</label>
                            <p className="form-label">{supplier.email}</p>
                            </div>
                        ))}
                    </div>
                    <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold">Address:</label>
                        <p className="form-label">{supplierState.supplier_address}</p>
                    </div>
                    <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold">Payment Term:</label>
                        <p className="form-label">{supplierState.supplier_payment_term}</p>
                    </div>
                    <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold">Payment Term Description:</label>
                        <p className="form-label">{supplierState.supplier_term_description}</p>
                    </div>
                    <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold">Payment Method:</label>
                        <p className="form-label">{supplierState.supplier_payment_method_details}</p>
                    </div>
                    <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold">Supplier Type:</label>
                        <p className="form-label">{supplierState.supplier_type}</p>
                    </div>
                    <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold">Supplier Material Type:</label>
                        <p className="form-label">{supplierState.supplier_material_types}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    );
};

export default SupplierDetails;