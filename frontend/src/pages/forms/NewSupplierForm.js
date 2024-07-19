// Import modules
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAddSupplier } from '../../hooks/useAddSupplier';
import SessionExpired from '../../components/SessionExpired';
import EmployeeDetailsSkeleton from '../loaders/EmployeeDetailsSkeleton';

const NewSupplierForm = () => {
    // Component router
    const navigate = useNavigate();

    // Component hook
    const { addSupplier, isLoadingState, errorState } = useAddSupplier();

    // Component state
    const [supplierState, setSupplierState] = useState({
        supplier_name: '',
        supplier_contacts: [{ name: '', phone: '', email: '', is_primary: false }],
        supplier_address: '',
        supplier_payment_term: '',
        supplier_payment_term_description: '',
        supplier_payment_method_details: '',
        supplier_type: 'Others',
        supplier_isarchived: false,
        supplier_material_types: '',
    });

    // Component functions and variables
    const handleBackClick = () => navigate(`/EmpirePMS/supplier/`);

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setSupplierState((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleContactChange = (index, event) => {
        const { name, value } = event.target;
        const updatedContacts = supplierState.supplier_contacts.map((contact, idx) => 
            idx === index ? { ...contact, [name]: value } : contact
        );
        setSupplierState((prevState) => ({
            ...prevState,
            supplier_contacts: updatedContacts,
        }));
    };

    const handleAddContact = () => {
        if (supplierState.supplier_contacts.length < 5) {
            setSupplierState({
                ...supplierState,
                supplier_contacts: [...supplierState.supplier_contacts, { name: '', phone: '', email: '', is_primary: false }],
            });
        } else {
            alert("You can add up to 5 contacts only.");
        }
    };

    const handleRemoveContact = (index) => {
        const updatedContacts = supplierState.supplier_contacts.filter((_, idx) => idx !== index);
        setSupplierState({
            ...supplierState,
            supplier_contacts: updatedContacts,
        });
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        addSupplier(supplierState);
    };

    // Display DOM
    if (isLoadingState) {
        return <EmployeeDetailsSkeleton />;
    }

    if (errorState) {
        if (errorState.includes("Session expired") || errorState.includes("jwt expired")) {
            return <div><SessionExpired /></div>;
        }
        return <div>Error: {errorState}</div>;
    }

    return (
        <div className="container mt-5"> 
            <div className="card">
                <div className="card-header bg-dark text-white">
                    <h1>NEW SUPPLIER</h1>
                </div>
                <form className="card-body" onSubmit={handleSubmit}>
                    <div className="d-flex justify-content-between mb-3">
                        <button type="button" onClick={handleBackClick} className="btn btn-secondary">BACK</button>
                    </div>
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label className="form-label fw-bold">Supplier name:</label>
                            <input 
                                type="text"
                                className="form-control" 
                                name="supplier_name" 
                                value={supplierState.supplier_name} 
                                onChange={handleInputChange}
                                placeholder="Name"
                                required
                                onInvalid={(e) => e.target.setCustomValidity('Enter supplier name')}
                                onInput={(e) => e.target.setCustomValidity('')}
                            />
                        </div>
                        <div className="col-md-6 mb-3">
                            <label className="form-label fw-bold">Supplier address:</label>
                            <input 
                                type="text"
                                className="form-control" 
                                name="supplier_address" 
                                value={supplierState.supplier_address} 
                                onChange={handleInputChange}
                                placeholder="Address"
                            />
                        </div>
                        <div className="col-md-6 mb-3">
                            <label className="form-label fw-bold">Payment term:</label>
                            <input 
                                type="text"
                                className="form-control" 
                                name="supplier_payment_term" 
                                value={supplierState.supplier_payment_term} 
                                onChange={handleInputChange}
                                placeholder="Ex: Net 30"
                            />
                        </div>
                        <div className="col-md-6 mb-3">
                            <label className="form-label fw-bold">Payment term description:</label>
                            <input 
                                type="text"
                                className="form-control" 
                                name="supplier_payment_term_description" 
                                value={supplierState.supplier_payment_term_description} 
                                onChange={handleInputChange}
                                placeholder="Ex: 30 days validity"
                            />
                        </div>
                        <div className="col-md-6 mb-3">
                            <label className="form-label fw-bold">Payment method details:</label>
                            <input 
                                type="text"
                                className="form-control" 
                                name="supplier_payment_method_details" 
                                value={supplierState.supplier_payment_method_details} 
                                onChange={handleInputChange}
                                placeholder="Ex: Bank transfer"
                            />
                        </div>
                        <div className="col-md-6 mb-3">
                            <label className="form-label fw-bold">Supplier type:</label>
                            <select 
                                className="form-control" 
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
                        <div className="col-md-6 mb-3">
                            <label className="form-label fw-bold">Material types:</label>
                            <input 
                                type="text"
                                className="form-control" 
                                name="supplier_material_types" 
                                value={supplierState.supplier_material_types} 
                                onChange={handleInputChange}
                                placeholder="Ex: plasterboard / metal / kingspan (rigid insu) / access panel"
                            />
                        </div>
                        <div className="col-md-6 mb-3">
                            <label className="form-label fw-bold">Archived:</label>
                            <input 
                                type="checkbox"
                                className="form-check-input" 
                                name="supplier_isarchived" 
                                checked={supplierState.supplier_isarchived} 
                                onChange={(e) => handleInputChange({ target: { name: 'supplier_isarchived', value: e.target.checked } })}
                            />
                        </div>
                        {supplierState.supplier_contacts.map((contact, index) => (
                            <div key={index} className="col-md-12 mb-3">
                                <h5>Contact {index + 1}</h5>
                                <label className="form-label fw-bold">Primary Contact:</label>
                                <input 
                                    type="checkbox"
                                    className="form-check-input" 
                                    name="is_primary" 
                                    checked={contact.is_primary} 
                                    onChange={(e) => handleContactChange(index, { target: { name: 'is_primary', value: e.target.checked } })}
                                />
                                <div className="row">
                                    <div className="col-md-4 mb-3">
                                        <label className="form-label fw-bold">Name:</label>
                                        <input 
                                            type="text"
                                            className="form-control" 
                                            name="name" 
                                            value={contact.name} 
                                            onChange={(e) => handleContactChange(index, e)}
                                            placeholder="Contact Name"
                                            required
                                            onInvalid={(e) => e.target.setCustomValidity('Enter contact name')}
                                            onInput={(e) => e.target.setCustomValidity('')}
                                        />
                                    </div>
                                    <div className="col-md-4 mb-3">
                                        <label className="form-label fw-bold">Phone:</label>
                                        <input 
                                            type="text"
                                            className="form-control" 
                                            name="03 0000 0000" 
                                            value={contact.phone} 
                                            onChange={(e) => handleContactChange(index, e)}
                                            placeholder="Phone"
                                        />
                                    </div>
                                    <div className="col-md-4 mb-3">
                                        <label className="form-label fw-bold">Email:</label>
                                        <input 
                                            type="email"
                                            className="form-control" 
                                            name="example@mycompany.com" 
                                            value={contact.email} 
                                            onChange={(e) => handleContactChange(index, e)}
                                            placeholder="Email"
                                        />
                                    </div>
                                    <div className="col-md-4 mb-3">
                                        <button type="button" onClick={() => handleRemoveContact(index)} className="btn btn-danger">REMOVE</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <button type="button" onClick={handleAddContact} className="btn btn-secondary mb-3">ADD MORE CONTACTS</button>
                        <div className="d-flex justify-content-between mb-3">
                            <button className="btn btn-primary" type="submit">ADD TO COMPANY</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewSupplierForm;
