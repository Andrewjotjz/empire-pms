"use client"

import { useNavigate, useLocation, useParams } from "react-router-dom"
import { useEffect, useState, useCallback } from "react"
import { useSelector, useDispatch } from "react-redux"
import { setSupplierState } from "../../redux/supplierSlice"
import { useUpdateSupplier } from "../../hooks/useUpdateSupplier"
import SessionExpired from "../../components/SessionExpired"
import EmployeeDetailsSkeleton from "../loaders/EmployeeDetailsSkeleton"
import UnauthenticatedSkeleton from "../loaders/UnauthenticateSkeleton"
import {
  ChevronLeft,
  Plus,
  Trash2,
  Building,
  MapPin,
  CreditCard,
  FileText,
  Wallet,
  Package,
  Archive,
  User,
  Phone,
  Mail,
  Star,
} from "lucide-react"

const UpdateSupplierForm = () => {
  // Component router
  const location = useLocation()
  const retrieved_id = location.state
  const navigate = useNavigate()
  const { id } = useParams()

  // Component state declaration
  const supplierState = useSelector((state) => state.supplierReducer.supplierState)

  const dispatch = useDispatch()
  const { update, isLoadingState, errorState } = useUpdateSupplier()
  const [fetchSupplierLoading, setFetchSupplierLoading] = useState(true)
  const [fetchSupplierError, setFetchSupplierError] = useState(null)

  // Component functions and variables
  const localUser = JSON.parse(localStorage.getItem("localUser"))

  const handleBackClick = () => navigate(`/EmpirePMS/supplier/${retrieved_id}`)

  const handleInputChange = (event) => {
    const { name, value } = event.target
    dispatch(
      setSupplierState({
        ...supplierState,
        [name]: value,
      }),
    )
  }

  const handleContactChange = (index, event) => {
    const { name, value } = event.target
    const updatedContacts = supplierState.supplier_contacts.map((contact, idx) =>
      idx === index ? { ...contact, [name]: value } : contact,
    )
    dispatch(
      setSupplierState({
        ...supplierState,
        supplier_contacts: updatedContacts,
      }),
    )
  }

  const handleAddContact = () => {
    if (supplierState.supplier_contacts.length < 5) {
      dispatch(
        setSupplierState({
          ...supplierState,
          supplier_contacts: [
            ...supplierState.supplier_contacts,
            { name: "", phone: "", email: "", is_primary: false },
          ],
        }),
      )
    } else {
      alert("You can add up to 5 contacts only.")
    }
  }

  const handleRemoveContact = (index) => {
    const updatedContacts = supplierState.supplier_contacts.filter((_, idx) => idx !== index)
    dispatch(
      setSupplierState({
        ...supplierState,
        supplier_contacts: updatedContacts,
      }),
    )
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    update(supplierState)
  }

  const fetchSupplierDetails = useCallback(async () => {
    setFetchSupplierLoading(true)
    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/supplier/${id}`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("jwt")}`, // Include token in Authorization header
        },
      })
      if (!res.ok) {
        throw new Error("Failed to fetch supplier details")
      }
      const data = await res.json()

      if (data.tokenError) {
        throw new Error(data.tokenError)
      }

      dispatch(setSupplierState(data))

      setFetchSupplierLoading(false)
    } catch (err) {
      setFetchSupplierError(err.message)
      setFetchSupplierLoading(false)
    }
  }, [id, dispatch])

  useEffect(() => {
    fetchSupplierDetails()
  }, [fetchSupplierDetails])

  // Display DOM
  if (isLoadingState || fetchSupplierLoading) {
    return <EmployeeDetailsSkeleton />
  }

  if (errorState || fetchSupplierError) {
    if (
      (errorState &&
        (errorState.includes("Session expired") ||
          errorState.includes("jwt expired") ||
          errorState.includes("jwt malformed"))) ||
      (fetchSupplierError &&
        (fetchSupplierError.includes("Session expired") ||
          fetchSupplierError.includes("jwt expired") ||
          fetchSupplierError.includes("jwt malformed")))
    ) {
      return (
        <div>
          <SessionExpired />
        </div>
      )
    }
    return <div>Error: {errorState || fetchSupplierError}</div>
  }

  return localUser && Object.keys(localUser).length > 0 ? (
    supplierState && Object.keys(supplierState).length > 0 ? (
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gray-800 text-white p-4 flex items-center">
            <button onClick={handleBackClick} className="mr-4 p-1 rounded hover:bg-gray-700 transition-colors">
              <ChevronLeft className="h-6 w-6" />
            </button>
            <h1 className="text-lg md:text-xl font-bold uppercase tracking-wide text-center flex-1">
              EDITING SUPPLIER: {supplierState.supplier_name}
            </h1>
          </div>

          {/* Form */}
          <form
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
              }
            }}
            className="p-4 md:p-6 space-y-6"
            onSubmit={handleSubmit}
          >
            {/* Basic Supplier Info Section */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center">
                <span>Supplier Information</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block font-semibold text-gray-700 text-sm">Supplier name:</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      className="w-full pl-10 px-6 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      name="supplier_name"
                      value={supplierState.supplier_name}
                      onChange={handleInputChange}
                      placeholder="Ex: MelbSupplier"
                      required
                      onInvalid={(e) => e.target.setCustomValidity("Enter supplier name")}
                      onInput={(e) => e.target.setCustomValidity("")}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block font-semibold text-gray-700 text-sm">Supplier address:</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      className="w-full pl-10 px-6 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      name="supplier_address"
                      value={supplierState.supplier_address}
                      onChange={handleInputChange}
                      placeholder="Address"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block font-semibold text-gray-700 text-sm">Payment term:</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CreditCard className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      className="w-full pl-10 px-6 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      name="supplier_payment_term"
                      value={supplierState.supplier_payment_term}
                      onChange={handleInputChange}
                      placeholder="Ex: Net 30"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block font-semibold text-gray-700 text-sm">Payment term description:</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FileText className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      className="w-full pl-10 px-6 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      name="supplier_payment_term_description"
                      value={supplierState.supplier_payment_term_description}
                      onChange={handleInputChange}
                      placeholder="Ex: 30 days validity"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block font-semibold text-gray-700 text-sm">Payment method details:</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Wallet className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      className="w-full pl-10 px-6 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      name="supplier_payment_method_details"
                      value={supplierState.supplier_payment_method_details}
                      onChange={handleInputChange}
                      placeholder="Ex: Bank Transfer"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block font-semibold text-gray-700 text-sm">Supplier type:</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Package className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      className="w-full pl-10 px-6 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm appearance-none bg-white hover:cursor-pointer"
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
                </div>

                <div className="space-y-2">
                  <label className="block font-semibold text-gray-700 text-sm">Material types:</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Package className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      className="w-full pl-10 px-6 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      name="supplier_material_types"
                      value={supplierState.supplier_material_types}
                      onChange={handleInputChange}
                      placeholder="Ex: plasterboard / compound / speedpanel"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="h-4 w-4 border-gray-300 rounded focus:ring-blue-500 text-blue-600"
                      name="supplier_isarchived"
                      checked={supplierState.supplier_isarchived}
                      onChange={(e) =>
                        handleInputChange({ target: { name: "supplier_isarchived", value: e.target.checked } })
                      }
                    />
                    <span className="text-sm font-medium text-gray-700 flex items-center">
                      <Archive className="h-4 w-4 mr-1 text-gray-500" />
                      Archived
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Contacts Section */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-700 flex items-center">
                  <span>Contact Information</span>
                </h2>
                <button
                  type="button"
                  onClick={handleAddContact}
                  className="px-3 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors flex items-center"
                  disabled={supplierState.supplier_contacts.length >= 5}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  <span>Add Contact</span>
                </button>
              </div>

              <div className="space-y-6">
                {supplierState.supplier_contacts &&
                  supplierState.supplier_contacts.map((contact, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-semibold text-gray-700 flex items-center">
                          <User className="h-4 w-4 mr-1 text-gray-500" />
                          Contact #{index + 1}
                        </h3>
                        <button
                          type="button"
                          onClick={() => handleRemoveContact(index)}
                          className="p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <label className="block font-medium text-gray-700 text-sm">Name:</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <User className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                              className="w-full pl-9 px-5 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              name="name"
                              value={contact.name}
                              onChange={(e) => handleContactChange(index, e)}
                              placeholder="John Doe"
                              required
                              onInvalid={(e) => e.target.setCustomValidity("Enter contact name")}
                              onInput={(e) => e.target.setCustomValidity("")}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="block font-medium text-gray-700 text-sm">Phone:</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Phone className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                              className="w-full pl-9 px-5 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              name="phone"
                              value={contact.phone}
                              onChange={(e) => handleContactChange(index, e)}
                              placeholder="Ex: 04... or 03..."
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="block font-medium text-gray-700 text-sm">Email:</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Mail className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                              className="w-full pl-9 px-5 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              name="email"
                              value={contact.email}
                              onChange={(e) => handleContactChange(index, e)}
                              placeholder="Ex: yourname@yourcompany.com"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="mt-3">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            className="h-4 w-4 border-gray-300 rounded focus:ring-blue-500 text-blue-600"
                            name="is_primary"
                            checked={contact.is_primary}
                            onChange={(e) =>
                              handleContactChange(index, { target: { name: "is_primary", value: e.target.checked } })
                            }
                          />
                          <span className="text-sm font-medium text-gray-700 flex items-center">
                            <Star className="h-4 w-4 mr-1 text-yellow-500" />
                            Primary Contact
                          </span>
                        </label>
                      </div>
                    </div>
                  ))}

                {supplierState.supplier_contacts.length === 0 && (
                  <div className="text-center py-6 bg-gray-100 rounded-lg border border-dashed border-gray-300">
                    <User className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500">No contacts added yet</p>
                    <button
                      type="button"
                      onClick={handleAddContact}
                      className="mt-2 px-4 py-2 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors inline-flex items-center"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      <span>Add First Contact</span>
                    </button>
                  </div>
                )}

                {supplierState.supplier_contacts.length >= 5 && (
                  <p className="text-amber-600 text-sm flex items-center justify-center mt-2">
                    <span>Maximum of 5 contacts reached</span>
                  </p>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="pt-4 border-t border-gray-200 flex justify-between">
              <button
                type="button"
                onClick={handleBackClick}
                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-800 font-medium transition-colors"
              >
                CANCEL
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-medium transition-colors"
              >
                SUBMIT
              </button>
            </div>
          </form>
        </div>
      </div>
    ) : (
      <div>
        <SessionExpired />
      </div>
    )
  ) : (
    <UnauthenticatedSkeleton />
  )
}

export default UpdateSupplierForm

// // Import modules
// import { useNavigate, useLocation, useParams } from 'react-router-dom';
// import { useEffect, useState, useCallback} from 'react';
// import { useSelector, useDispatch } from 'react-redux';
// import { setSupplierState } from '../../redux/supplierSlice';
// import { useUpdateSupplier } from '../../hooks/useUpdateSupplier';
// import SessionExpired from '../../components/SessionExpired';
// import EmployeeDetailsSkeleton from '../loaders/EmployeeDetailsSkeleton';
// import UnauthenticatedSkeleton from "../loaders/UnauthenticateSkeleton";

// const UpdateSupplierForm = () => {
//     // Component router
//     const location = useLocation();
//     const retrieved_id = location.state;
//     const navigate = useNavigate();
//     const {id} = useParams();

//     // Component state declaration
//     const supplierState = useSelector((state) => state.supplierReducer.supplierState);
    
//     const dispatch = useDispatch();
//     const { update, isLoadingState, errorState } = useUpdateSupplier();
//     const [fetchSupplierLoading, setFetchSupplierLoading] = useState(true);
//     const [fetchSupplierError, setFetchSupplierError] = useState(null);

//     // Component functions and variables
//     const localUser = JSON.parse(localStorage.getItem('localUser'))

//     const handleBackClick = () => navigate(`/EmpirePMS/supplier/${retrieved_id}`);
    
//     const handleInputChange = (event) => {
//         const { name, value } = event.target;
//         dispatch(setSupplierState({
//             ...supplierState,
//             [name]: value,
//         }));
//     };

//     const handleContactChange = (index, event) => {
//         const { name, value } = event.target;
//         const updatedContacts = supplierState.supplier_contacts.map((contact, idx) => 
//             idx === index ? { ...contact, [name]: value } : contact
//         );
//         dispatch(setSupplierState({
//             ...supplierState,
//             supplier_contacts: updatedContacts,
//         }));
//     };

//     const handleAddContact = () => {
//         if (supplierState.supplier_contacts.length < 5) {
//             dispatch(setSupplierState({
//                 ...supplierState,
//                 supplier_contacts: [...supplierState.supplier_contacts, { name: '', phone: '', email: '', is_primary: false }],
//             }));
//         } else {
//             alert("You can add up to 5 contacts only.");
//         }
//     };

//     const handleRemoveContact = (index) => {
//         const updatedContacts = supplierState.supplier_contacts.filter((_, idx) => idx !== index);
//         dispatch(setSupplierState({
//             ...supplierState,
//             supplier_contacts: updatedContacts,
//         }));
//     };

//     const handleSubmit = (event) => {
//         event.preventDefault();
//         update(supplierState);
//     };

//     const fetchSupplierDetails = useCallback(async () => {
//             setFetchSupplierLoading(true);
//             try {
//                 const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/supplier/${id}`, { credentials: 'include',
//                     headers: {
//                         'Content-Type': 'application/json',
//                         'Authorization': `Bearer ${sessionStorage.getItem('jwt')}` // Include token in Authorization header
//                     } });
//                 if (!res.ok) {
//                     throw new Error('Failed to fetch supplier details');
//                 }
//                 const data = await res.json();
    
//                 if (data.tokenError) {
//                     throw new Error(data.tokenError);
//                 }
    
//                 dispatch(setSupplierState(data));
    
//                 setFetchSupplierLoading(false);
//             } catch (err) {
//                 setFetchSupplierError(err.message);
//                 setFetchSupplierLoading(false);
//             }
//         }, [id, dispatch]);
//     useEffect(() => {
//         fetchSupplierDetails();
//     }, [fetchSupplierDetails]);

//     // Display DOM
//     if (isLoadingState || fetchSupplierLoading) { return (<EmployeeDetailsSkeleton />); }

//     if (errorState) {
//         if (errorState.includes("Session expired") || errorState.includes("jwt expired") || errorState.includes("jwt malformed")) {
//             return (<div><SessionExpired /></div>);
//         }
//         return (<div>Error: {errorState || fetchSupplierError}</div>);
//     }

//     return (
//         localUser && Object.keys(localUser).length > 0 ? (
//         supplierState && Object.keys(supplierState).length > 0 ? (
//             <div className="container mt-5">
//                 <div className="card">
//                     <div className="card-header bg-dark text-white">
//                         <h1>EDITING SUPPLIER: {supplierState.supplier_name}</h1>
//                     </div>
//                     <form  onKeyDown={(e) => { if (e.key === 'Enter') {e.preventDefault();} }} className="card-body" onSubmit={handleSubmit}>
//                         <div className="row">
//                             <div className="col-md-6 mb-1 sm:mb-3">
//                                 <label className="form-label fw-bold  text-sm sm:text-base">Supplier name:</label>
//                                 <input 
//                                     className="form-control text-xs sm::text-base placeholder-gray-400 placeholder-opacity-50" 
//                                     name="supplier_name" 
//                                     value={supplierState.supplier_name} 
//                                     onChange={handleInputChange}
//                                     placeholder="Ex: MelbSupplier"
//                                     required
//                                     onInvalid={(e) => e.target.setCustomValidity('Enter supplier name')}
//                                     onInput={(e) => e.target.setCustomValidity('')}
//                                 />
//                             </div>
//                             <div className="col-md-6 mb-1 sm:mb-3">
//                                 <label className="form-label fw-bold  text-sm sm:text-base">Supplier address:</label>
//                                 <input 
//                                     className="form-control text-xs sm::text-base placeholder-gray-400 placeholder-opacity-50" 
//                                     name="supplier_address" 
//                                     value={supplierState.supplier_address} 
//                                     onChange={handleInputChange}
//                                     placeholder="Address"
//                                 />
//                             </div>
//                             <div className="col-md-6 mb-1 sm:mb-3">
//                                 <label className="form-label fw-bold  text-sm sm:text-base">Payment term:</label>
//                                 <input 
//                                     className="form-control text-xs sm::text-base placeholder-gray-400 placeholder-opacity-50" 
//                                     name="supplier_payment_term" 
//                                     value={supplierState.supplier_payment_term} 
//                                     onChange={handleInputChange}
//                                     placeholder="Ex: Net 30"
//                                 />
//                             </div>
//                             <div className="col-md-6 mb-1 sm:mb-3">
//                                 <label className="form-label fw-bold  text-sm sm:text-base">Payment term description:</label>
//                                 <input 
//                                     className="form-control text-xs sm::text-base placeholder-gray-400 placeholder-opacity-50" 
//                                     name="supplier_payment_term_description" 
//                                     value={supplierState.supplier_payment_term_description} 
//                                     onChange={handleInputChange}
//                                     placeholder="Ex: 30 days validity"
//                                 />
//                             </div>
//                             <div className="col-md-6 mb-1 sm:mb-3">
//                                 <label className="form-label fw-bold  text-sm sm:text-base">Payment method details:</label>
//                                 <input 
//                                     className="form-control text-xs sm::text-base placeholder-gray-400 placeholder-opacity-50" 
//                                     name="supplier_payment_method_details" 
//                                     value={supplierState.supplier_payment_method_details} 
//                                     onChange={handleInputChange}
//                                     placeholder="Ex: Bank Transfer"
//                                 />
//                             </div>
//                             <div className="col-md-6 mb-1 sm:mb-3">
//                                 <label className="form-label fw-bold  text-sm sm:text-base">Supplier type:</label>
//                                 <select 
//                                     className="form-control text-xs sm::text-base" 
//                                     name="supplier_type" 
//                                     value={supplierState.supplier_type} 
//                                     onChange={handleInputChange}
//                                     required
//                                 >
//                                     <option value="Main">Main</option>
//                                     <option value="Special">Special</option>
//                                     <option value="Others">Others</option>
//                                     <option value="Inactive">Inactive</option>
//                                 </select>
//                             </div>
//                             <div className="col-md-6 mb-1 sm:mb-3">
//                                 <label className="form-label fw-bold  text-sm sm:text-base">Material types:</label>
//                                 <input 
//                                     className="form-control text-xs sm::text-base placeholder-gray-400 placeholder-opacity-50" 
//                                     name="supplier_material_types" 
//                                     value={supplierState.supplier_material_types} 
//                                     onChange={handleInputChange}
//                                     placeholder="Ex: plasterboard / compound / speedpanel"
//                                 />
//                             </div>
//                             <div className="col-md-6 mb-1 sm:mb-3 border-b-2 sm:border-b-0">
//                                 <label className="form-label fw-bold  text-sm sm:text-base">Archived:</label>
//                                 <input 
//                                     type="checkbox"
//                                     className="form-check-input m-1" 
//                                     name="supplier_isarchived" 
//                                     checked={supplierState.supplier_isarchived} 
//                                     onChange={(e) => handleInputChange({ target: { name: 'supplier_isarchived', value: e.target.checked }})}
//                                 />
//                             </div>
//                             <div className='p-2'>
//                                 {supplierState.supplier_contacts && supplierState.supplier_contacts.map((contact, index) => (
//                                     <div key={index} className="col-md-12 mb-0 sm:mb-1 border-b-2">
//                                         <h5 className='font-semibold text-sm sm:text-lg border my-1 px-1 inline-block rounded-md bg-gray-300'>Contact #{index + 1}</h5>
//                                         <div className="row">
//                                             <div className="col-md-3 mb-1 sm:mb-3">
//                                                 <label className="form-label fw-bold  text-sm sm:text-base">Name:</label>
//                                                 <input 
//                                                     className="form-control text-xs sm::text-base placeholder-gray-400 placeholder-opacity-50" 
//                                                     name="name" 
//                                                     value={contact.name} 
//                                                     onChange={(e) => handleContactChange(index, e)}
//                                                     placeholder="John Doe"
//                                                     required
//                                                     onInvalid={(e) => e.target.setCustomValidity('Enter contact name')}
//                                                     onInput={(e) => e.target.setCustomValidity('')}
//                                                 />
//                                             </div>
//                                             <div className="col-md-3 mb-1 sm:mb-3">
//                                                 <label className="form-label fw-bold  text-sm sm:text-base">Phone:</label>
//                                                 <input 
//                                                     className="form-control text-xs sm::text-base placeholder-gray-400 placeholder-opacity-50" 
//                                                     name="phone" 
//                                                     value={contact.phone} 
//                                                     onChange={(e) => handleContactChange(index, e)}
//                                                     placeholder="Ex: 04... or 03..."
//                                                 />
//                                             </div>
//                                             <div className="col-md-3 mb-1 sm:mb-3">
//                                                 <label className="form-label fw-bold  text-sm sm:text-base">Email:</label>
//                                                 <input 
//                                                     className="form-control text-xs sm::text-base placeholder-gray-400 placeholder-opacity-50" 
//                                                     name="email" 
//                                                     value={contact.email} 
//                                                     onChange={(e) => handleContactChange(index, e)}
//                                                     placeholder="Ex: yourname@yourcompany.com"
//                                                 />
//                                             </div>
//                                             <div className="col-md-3 mb-1 sm:mb-3 align-items-end">
//                                                 <div>
//                                                     <label className="form-label fw-bold  text-sm sm:text-base">Primary Contact:</label>
//                                                     <input 
//                                                         type="checkbox"
//                                                         className="form-check-input m-1" 
//                                                         name="is_primary" 
//                                                         checked={contact.is_primary} 
//                                                         onChange={(e) => handleContactChange(index, { target: { name: 'is_primary', value: e.target.checked } })}
//                                                     />
//                                                 </div>
//                                                 <button type="button" onClick={() => handleRemoveContact(index)} className="btn btn-danger">
//                                                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 sm:size-6">
//                                                         <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
//                                                     </svg>
//                                                 </button>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 ))}
//                             </div>
//                             <div className="flex justify-center mb-2">
//                                 <button type="button" onClick={handleAddContact}><label className='border bg-gray-200 rounded-xl p-2 text-xs sm:text-sm hover:bg-blue-400 hover:text-white hover:shadow-lg'>+ ADD MORE CONTACTS</label></button>
//                             </div>
//                         </div>
//                         <div className="d-flex justify-content-between mb-3">
//                             <button type="button" onClick={handleBackClick} className="btn btn-secondary">CANCEL</button>
//                             <button className="btn btn-primary text-lg" type="submit">SUBMIT</button>
//                         </div>
//                     </form>
//                 </div>
//             </div>
//         ) : (
//             <div><SessionExpired /></div>
//         ) ) : ( <UnauthenticatedSkeleton /> )
//     );
// };

// export default UpdateSupplierForm;
