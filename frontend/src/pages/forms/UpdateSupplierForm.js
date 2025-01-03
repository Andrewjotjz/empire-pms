// Import modules
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useEffect, useState, useCallback} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setSupplierState } from '../../redux/supplierSlice';
import { useUpdateSupplier } from '../../hooks/useUpdateSupplier';
import SessionExpired from '../../components/SessionExpired';
import EmployeeDetailsSkeleton from '../loaders/EmployeeDetailsSkeleton';
import UnauthenticatedSkeleton from "../loaders/UnauthenticateSkeleton";

const UpdateSupplierForm = () => {
    // Component router
    const location = useLocation();
    const retrieved_id = location.state;
    const navigate = useNavigate();
    const {id} = useParams();

    // Component state declaration
    const supplierState = useSelector((state) => state.supplierReducer.supplierState);
    
    const dispatch = useDispatch();
    const { update, isLoadingState, errorState } = useUpdateSupplier();
    const [fetchSupplierLoading, setFetchSupplierLoading] = useState(true);
    const [fetchSupplierError, setFetchSupplierError] = useState(null);

    // Component functions and variables
    const localUser = JSON.parse(localStorage.getItem('localUser'))

    const handleBackClick = () => navigate(`/EmpirePMS/supplier/${retrieved_id}`);
    
    const handleInputChange = (event) => {
        const { name, value } = event.target;
        dispatch(setSupplierState({
            ...supplierState,
            [name]: value,
        }));
    };

    const handleContactChange = (index, event) => {
        const { name, value } = event.target;
        const updatedContacts = supplierState.supplier_contacts.map((contact, idx) => 
            idx === index ? { ...contact, [name]: value } : contact
        );
        dispatch(setSupplierState({
            ...supplierState,
            supplier_contacts: updatedContacts,
        }));
    };

    const handleAddContact = () => {
        if (supplierState.supplier_contacts.length < 5) {
            dispatch(setSupplierState({
                ...supplierState,
                supplier_contacts: [...supplierState.supplier_contacts, { name: '', phone: '', email: '', is_primary: false }],
            }));
        } else {
            alert("You can add up to 5 contacts only.");
        }
    };

    const handleRemoveContact = (index) => {
        const updatedContacts = supplierState.supplier_contacts.filter((_, idx) => idx !== index);
        dispatch(setSupplierState({
            ...supplierState,
            supplier_contacts: updatedContacts,
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        update(supplierState);
    };

    const fetchSupplierDetails = useCallback(async () => {
            setFetchSupplierLoading(true);
            try {
                const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/supplier/${id}`, { credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${sessionStorage.getItem('jwt')}` // Include token in Authorization header
                    } });
                if (!res.ok) {
                    throw new Error('Failed to fetch supplier details');
                }
                const data = await res.json();
    
                if (data.tokenError) {
                    throw new Error(data.tokenError);
                }
    
                dispatch(setSupplierState(data));
    
                setFetchSupplierLoading(false);
            } catch (err) {
                setFetchSupplierError(err.message);
                setFetchSupplierLoading(false);
            }
        }, [id, dispatch]);
    useEffect(() => {
        fetchSupplierDetails();
    }, [fetchSupplierDetails]);

    // Display DOM
    if (isLoadingState || fetchSupplierLoading) { return (<EmployeeDetailsSkeleton />); }

    if (errorState) {
        if (errorState.includes("Session expired") || errorState.includes("jwt expired") || errorState.includes("jwt malformed")) {
            return (<div><SessionExpired /></div>);
        }
        return (<div>Error: {errorState || fetchSupplierError}</div>);
    }

    return (
        localUser && Object.keys(localUser).length > 0 ? (
        supplierState && Object.keys(supplierState).length > 0 ? (
            <div className="container mt-5">
                <div className="card">
                    <div className="card-header bg-dark text-white">
                        <h1>EDITING SUPPLIER: {supplierState.supplier_name}</h1>
                    </div>
                    <form className="card-body" onSubmit={handleSubmit}>
                        <div className="row">
                            <div className="col-md-6 mb-1 sm:mb-3">
                                <label className="form-label fw-bold  text-sm sm:text-base">Supplier name:</label>
                                <input 
                                    className="form-control text-xs sm::text-base placeholder-gray-400 placeholder-opacity-50" 
                                    name="supplier_name" 
                                    value={supplierState.supplier_name} 
                                    onChange={handleInputChange}
                                    placeholder="Ex: MelbSupplier"
                                    required
                                    onInvalid={(e) => e.target.setCustomValidity('Enter supplier name')}
                                    onInput={(e) => e.target.setCustomValidity('')}
                                />
                            </div>
                            <div className="col-md-6 mb-1 sm:mb-3">
                                <label className="form-label fw-bold  text-sm sm:text-base">Supplier address:</label>
                                <input 
                                    className="form-control text-xs sm::text-base placeholder-gray-400 placeholder-opacity-50" 
                                    name="supplier_address" 
                                    value={supplierState.supplier_address} 
                                    onChange={handleInputChange}
                                    placeholder="Address"
                                />
                            </div>
                            <div className="col-md-6 mb-1 sm:mb-3">
                                <label className="form-label fw-bold  text-sm sm:text-base">Payment term:</label>
                                <input 
                                    className="form-control text-xs sm::text-base placeholder-gray-400 placeholder-opacity-50" 
                                    name="supplier_payment_term" 
                                    value={supplierState.supplier_payment_term} 
                                    onChange={handleInputChange}
                                    placeholder="Ex: Net 30"
                                />
                            </div>
                            <div className="col-md-6 mb-1 sm:mb-3">
                                <label className="form-label fw-bold  text-sm sm:text-base">Payment term description:</label>
                                <input 
                                    className="form-control text-xs sm::text-base placeholder-gray-400 placeholder-opacity-50" 
                                    name="supplier_payment_term_description" 
                                    value={supplierState.supplier_payment_term_description} 
                                    onChange={handleInputChange}
                                    placeholder="Ex: 30 days validity"
                                />
                            </div>
                            <div className="col-md-6 mb-1 sm:mb-3">
                                <label className="form-label fw-bold  text-sm sm:text-base">Payment method details:</label>
                                <input 
                                    className="form-control text-xs sm::text-base placeholder-gray-400 placeholder-opacity-50" 
                                    name="supplier_payment_method_details" 
                                    value={supplierState.supplier_payment_method_details} 
                                    onChange={handleInputChange}
                                    placeholder="Ex: Bank Transfer"
                                />
                            </div>
                            <div className="col-md-6 mb-1 sm:mb-3">
                                <label className="form-label fw-bold  text-sm sm:text-base">Supplier type:</label>
                                <select 
                                    className="form-control text-xs sm::text-base" 
                                    name="supplier_type" 
                                    value={supplierState.supplier_type} 
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="Main">Main</option>
                                    <option value="Special">Special</option>
                                    <option value="Others">Others</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>
                            <div className="col-md-6 mb-1 sm:mb-3">
                                <label className="form-label fw-bold  text-sm sm:text-base">Material types:</label>
                                <input 
                                    className="form-control text-xs sm::text-base placeholder-gray-400 placeholder-opacity-50" 
                                    name="supplier_material_types" 
                                    value={supplierState.supplier_material_types} 
                                    onChange={handleInputChange}
                                    placeholder="Ex: plasterboard / compound / speedpanel"
                                />
                            </div>
                            <div className="col-md-6 mb-1 sm:mb-3 border-b-2 sm:border-b-0">
                                <label className="form-label fw-bold  text-sm sm:text-base">Archived:</label>
                                <input 
                                    type="checkbox"
                                    className="form-check-input m-1" 
                                    name="supplier_isarchived" 
                                    checked={supplierState.supplier_isarchived} 
                                    onChange={(e) => handleInputChange({ target: { name: 'supplier_isarchived', value: e.target.checked }})}
                                />
                            </div>
                            <div className='p-2'>
                                {supplierState.supplier_contacts && supplierState.supplier_contacts.map((contact, index) => (
                                    <div key={index} className="col-md-12 mb-0 sm:mb-1 border-b-2">
                                        <h5 className='font-semibold text-sm sm:text-lg border my-1 px-1 inline-block rounded-md bg-gray-300'>Contact #{index + 1}</h5>
                                        <div className="row">
                                            <div className="col-md-3 mb-1 sm:mb-3">
                                                <label className="form-label fw-bold  text-sm sm:text-base">Name:</label>
                                                <input 
                                                    className="form-control text-xs sm::text-base placeholder-gray-400 placeholder-opacity-50" 
                                                    name="name" 
                                                    value={contact.name} 
                                                    onChange={(e) => handleContactChange(index, e)}
                                                    placeholder="John Doe"
                                                    required
                                                    onInvalid={(e) => e.target.setCustomValidity('Enter contact name')}
                                                    onInput={(e) => e.target.setCustomValidity('')}
                                                />
                                            </div>
                                            <div className="col-md-3 mb-1 sm:mb-3">
                                                <label className="form-label fw-bold  text-sm sm:text-base">Phone:</label>
                                                <input 
                                                    className="form-control text-xs sm::text-base placeholder-gray-400 placeholder-opacity-50" 
                                                    name="phone" 
                                                    value={contact.phone} 
                                                    onChange={(e) => handleContactChange(index, e)}
                                                    placeholder="Ex: 04... or 03..."
                                                />
                                            </div>
                                            <div className="col-md-3 mb-1 sm:mb-3">
                                                <label className="form-label fw-bold  text-sm sm:text-base">Email:</label>
                                                <input 
                                                    className="form-control text-xs sm::text-base placeholder-gray-400 placeholder-opacity-50" 
                                                    name="email" 
                                                    value={contact.email} 
                                                    onChange={(e) => handleContactChange(index, e)}
                                                    placeholder="Ex: yourname@yourcompany.com"
                                                />
                                            </div>
                                            <div className="col-md-3 mb-1 sm:mb-3 align-items-end">
                                                <div>
                                                    <label className="form-label fw-bold  text-sm sm:text-base">Primary Contact:</label>
                                                    <input 
                                                        type="checkbox"
                                                        className="form-check-input m-1" 
                                                        name="is_primary" 
                                                        checked={contact.is_primary} 
                                                        onChange={(e) => handleContactChange(index, { target: { name: 'is_primary', value: e.target.checked } })}
                                                    />
                                                </div>
                                                <button type="button" onClick={() => handleRemoveContact(index)} className="btn btn-danger">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 sm:size-6">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-center mb-2">
                                <button type="button" onClick={handleAddContact}><label className='border bg-gray-200 rounded-xl p-2 text-xs sm:text-sm hover:bg-blue-400 hover:text-white hover:shadow-lg'>+ ADD MORE CONTACTS</label></button>
                            </div>
                        </div>
                        <div className="d-flex justify-content-between mb-3">
                            <button type="button" onClick={handleBackClick} className="btn btn-secondary">CANCEL</button>
                            <button className="btn btn-primary text-lg" type="submit">SUBMIT</button>
                        </div>
                    </form>
                </div>
            </div>
        ) : (
            <div><SessionExpired /></div>
        ) ) : ( <UnauthenticatedSkeleton /> )
    );
};

export default UpdateSupplierForm;
