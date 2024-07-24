//import modules
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setSupplierState } from '../redux/supplierSlice';
import { setProductState, clearProductState } from '../redux/productSlice';
import SessionExpired from "../components/SessionExpired";
import EmployeeDetailsSkeleton from "./loaders/EmployeeDetailsSkeleton";
import Dropdown from "react-bootstrap/Dropdown";
import { Modal, Button } from "react-bootstrap";
import { useUpdateSupplier } from '../hooks/useUpdateSupplier';

const SupplierDetails = () => {
    //Component state declaration
    const supplierState = useSelector((state) => state.supplierReducer.supplierState)
    const productState = useSelector((state) => state.productReducer.productState)
    const [isLoadingState, setIsLoadingState] = useState(true);
    const [errorState, setErrorState] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [currentTab, setCurrentTab] = useState('supplierDetails');

    //Component hooks
    const { update } = useUpdateSupplier();
    const dispatch = useDispatch()

    //Component router
    const { id } = useParams();
    const navigate = useNavigate();

    //Component functions and variables
    const handleBackClick = () => navigate(`/EmpirePMS/supplier/`);

    const handleProductTableClick = (productId) => { 
        dispatch(clearProductState());
        navigate(`/EmpirePMS/supplier/${id}/products/${productId}`, { state: id })
    }

    const handleArchive = () => {    
        let updatedState;
        if (supplierState.supplier_isarchived === true) {
            updatedState = {
                ...supplierState,
                supplier_isarchived: false,
            };
        } else {
            updatedState = {
                ...supplierState,
                supplier_isarchived: true,
            };
        }
    
        dispatch(setSupplierState(updatedState));

        update(updatedState, `Supplier has been ${supplierState.supplier_isarchived ? `unarchived` : `archived`}`);

        setShowModal(false);
    };

    const handleEditSupplierClick = () => navigate(`/EmpirePMS/supplier/${id}/edit`, { state: id });
    
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

    useEffect(() => {
        const fetchSupplierProducts = async () => {
            try{
                const res = await fetch(`/api/supplier/${id}/products`);
                if (!res.ok) {
                    throw new Error('Failed to fetch supplier products');
                }
                const data = await res.json();

                if (data.tokenError) {
                    throw new Error(data.tokenError)
                }

                dispatch(setProductState(data))
                setIsLoadingState(false)
            } catch (err) {
                setErrorState(err.message);
                setIsLoadingState(false);
            }
        };

        fetchSupplierProducts();
    }, [id, dispatch]);

    //Display DOM
    const archiveModal = (
        <Modal show={showModal} onHide={() => setShowModal(false)}>
            <Modal.Header closeButton>
                <Modal.Title>{ supplierState.supplier_isarchived ? `Confirm Unarchive` : `Confirm Archive`}</Modal.Title>
            </Modal.Header>
            <Modal.Body>{ supplierState.supplier_isarchived ? `Are you sure you want to unarchive this supplier?` : `Are you sure you want to archive this supplier?`}</Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowModal(false)}>
                    Cancel
                </Button>
                <Button className="bg-red-600 hover:bg-red-600" variant="primary" onClick={handleArchive}>
                { supplierState.supplier_isarchived ? `Unarchive` : `Archive`}
                </Button>
            </Modal.Footer>
        </Modal>
    )
    const supplierProjectsTable = ( <>some projects data...</> )

    const supplierPurchaseOrdersTable = ( <>some purchase orders data...</> )

    const supplierProductsTable = Array.isArray(productState) && productState.length > 0 ? (
        <div>
            <input
                type="text"
                className="form-control mb-1"
                placeholder="Search..."
            />
            <table className="table table-bordered table-hover">
                <thead className="thead-dark">
                    <tr className="table-primary">
                        <th scope="col">SKU</th>
                        <th scope="col">Name</th>
                        <th scope="col">Unit A</th>
                        <th scope="col">Number A</th>
                        <th scope="col">Price A</th>
                        <th scope="col">Size</th>
                        <th scope="col">Type</th>
                        <th scope="col">Alias</th>
                        <th scope="col">Project Name</th>
                    </tr>
                </thead>
                <tbody>
                    {productState.map((product, index) => (
                        <tr key={index} onClick={() => handleProductTableClick(product.product._id)} className='cursor-pointer'>
                            <th scope="row">{product.product.product_sku}</th>
                            <td>{product.product.product_name}</td>
                            <td>{product.productPrice.product_unit_a}</td>
                            <td>{product.productPrice.product_number_a}</td>
                            <td>{product.productPrice.product_price_unit_a}</td>
                            <td>{product.product.product_actual_size}</td>
                            <td>{product.product.product_types}</td>
                            <td>{product.product.alias_name}</td>
                            <td>
                                {product.productPrice.project_names.map((project, index) => (
                                    <div key={index}>
                                        {project}
                                    </div>
                                ))}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    ) : (
        <div className='border'>Product API fetched successfully, but it might be empty...</div>
    );

    const supplierDetails = supplierState ? (
        <div className="card-body border-1">
            <div className="d-flex justify-content-end mb-3">
                <Dropdown>
                    <Dropdown.Toggle variant="success" id="dropdown-basic">
                        ACTIONS
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        <Dropdown.Item onClick={handleEditSupplierClick}>EDIT DETAILS</Dropdown.Item>
                        <Dropdown.Item onClick={() => setShowModal(true)}>{ supplierState.supplier_isarchived ? `UNARCHIVE` : `ARCHIVE`}</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </div>
            <div className="row">
                <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Name:</label>
                    <p className="form-label">{supplierState.supplier_name}</p>
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
                <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Status:</label>
                    {supplierState.supplier_isarchived ? 
                        (<label className="text-lg font-bold m-1 p-2 rounded-xl text-red-500">Archived</label>) : 
                        (<label className="text-lg font-bold m-1 p-2 rounded-xl text-green-600">Active</label>)
                    }
                </div>
                
                <div>
                    <h2 className='font-bold text-xl m-1'>Supplier Contacts</h2>
                    <table className="table table-bordered">
                        <thead className="thead-dark">
                            
                            <tr className="table-primary">
                                <th scope="col">ID</th>
                                <th scope="col">Name</th>
                                <th scope="col">Phone</th>
                                <th scope="col">Email</th>
                            </tr>
                        </thead>
                        <tbody>
                            {supplierState.supplier_contacts && supplierState.supplier_contacts.map((supplier,index) => (
                                <tr key={index}>
                                    <th scope="row">{index + 1}</th>
                                    <td>{`${supplier.is_primary ? `*` : ``} ${supplier.name}`}</td>
                                    <td>{supplier.phone}</td>
                                    <td>{supplier.email}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    ): (
        <div className='border'>Supplier API fetched successfully, but it might be empty...</div>
    );

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
                <div className="card-header bg-dark text-white flex justify-between items-center">
                    <button onClick={handleBackClick}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-7 w-12 border-transparent bg-gray-700 rounded-md p-1 hover:bg-gray-500 hover:scale-95 ease-out duration-300">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m18.75 4.5-7.5 7.5 7.5 7.5m-6-15L5.25 12l7.5 7.5"/>
                        </svg>
                    </button>
                    <h1 className='mx-auto uppercase font-bold text-xl'>{supplierState.supplier_name}</h1>
                </div>
                <div className="card-body">
                    <div>
                        <button className={`${currentTab === 'supplierDetails' ? 'border-x-2 border-t-2 p-2 rounded bg-gray-700 text-white' : 'border-x-2 border-t-2 p-2 rounded bg-transparent text-black hover:scale-90 transition ease-out duration-50 '}`}  onClick={() => setCurrentTab('supplierDetails')}>Details</button>
                        <button className={`${currentTab === 'supplierProductsTable' ? 'border-x-2 border-t-2 p-2 rounded bg-gray-700 text-white' : 'border-x-2 border-t-2 p-2 rounded bg-transparent text-black hover:scale-90 transition ease-out duration-50 '}`}  onClick={() => setCurrentTab('supplierProductsTable')}>Products</button>
                        <button className={`${currentTab === 'supplierPurchaseOrdersTable' ? 'border-x-2 border-t-2 p-2 rounded bg-gray-700 text-white' : 'border-x-2 border-t-2 p-2 rounded bg-transparent text-black hover:scale-90 transition ease-out duration-50 '}`}  onClick={() => setCurrentTab('supplierPurchaseOrdersTable')}>Purchase Orders</button>
                        <button className={`${currentTab === 'supplierProjectsTable' ? 'border-x-2 border-t-2 p-2 rounded bg-gray-700 text-white' : 'border-x-2 border-t-2 p-2 rounded bg-transparent text-black hover:scale-90 transition ease-out duration-50 '}`}  onClick={() => setCurrentTab('supplierProjectsTable')}>Projects</button>
                    </div>
                    {/* SWITCH BETWEEN COMPONENTS HERE */}
                    {currentTab === 'supplierDetails' && supplierDetails}
                    {currentTab === 'supplierProductsTable' && supplierProductsTable}
                    {currentTab === 'supplierPurchaseOrdersTable' && supplierPurchaseOrdersTable}
                    {currentTab === 'supplierProjectsTable' && supplierProjectsTable}
                </div>
            </div>
            { archiveModal }
        </div>
    );
}

export default SupplierDetails;