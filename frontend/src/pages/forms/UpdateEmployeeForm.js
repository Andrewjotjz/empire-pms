"use client"

import { useEffect, useState, useCallback } from "react"
import { useNavigate, useLocation, useParams } from "react-router-dom"
import { useUpdateEmployee } from "../../hooks/useUpdateEmployee"
import SessionExpired from "../../components/SessionExpired"
import UnauthenticatedSkeleton from "../loaders/UnauthenticateSkeleton"
import LoadingSpinner from "../loaders/LoadingSpinner"
import FormField from "../../components/FormField"

const UpdateEmployeeForm = () => {
  const location = useLocation()
  const retrieved_id = location.state
  const navigate = useNavigate()
  const { id } = useParams()

  // Local state management (replacing Redux)
  const [employeeState, setEmployeeState] = useState({
    employee_first_name: "",
    employee_last_name: "",
    employee_roles: "",
    employee_mobile_phone: "",
    employee_email: "",
    employee_password: "",
    companies: "",
    employee_isarchived: false
  })

  const [companyState, setCompanyState] = useState([])
  const [formErrors, setFormErrors] = useState({})
  const [isFetchEmployeeLoading, setFetchEmployeeLoading] = useState(true)
  const [fetchEmployeeError, setFetchEmployeeError] = useState(null)
  const [fetchCompanyLoading, setFetchCompanyLoading] = useState(false)
  const [fetchCompanyError, setFetchCompanyError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { update, isLoadingState, errorState } = useUpdateEmployee()
  const localUser = JSON.parse(localStorage.getItem("localUser"))

  const isValidEmail = (email) => {
    const pattern = /[a-zA-Z0-9._%+-]+@empirecbs\.com/
    return pattern.test(email)
  }

  const isValidPhone = (phone) => {
    const pattern = /^[\d\s\-+()]+$/
    return pattern.test(phone) && phone.length >= 10
  }

  const validateForm = () => {
    const errors = {}

    if (!employeeState.employee_first_name.trim()) {
      errors.employee_first_name = "First name is required"
    }

    if (!employeeState.employee_last_name.trim()) {
      errors.employee_last_name = "Last name is required"
    }

    if (!employeeState.employee_email.trim()) {
      errors.employee_email = "Email is required"
    } else if (!isValidEmail(employeeState.employee_email)) {
      errors.employee_email = "Email must be in format: yourname@empirecbs.com"
    }

    if (employeeState.employee_mobile_phone && !isValidPhone(employeeState.employee_mobile_phone)) {
      errors.employee_mobile_phone = "Please enter a valid phone number"
    }

    if (employeeState.employee_emergency_phone && !isValidPhone(employeeState.employee_emergency_phone)) {
      errors.employee_emergency_phone = "Please enter a valid emergency phone number"
    }

    if (employeeState.employee_salary && isNaN(employeeState.employee_salary)) {
      errors.employee_salary = "Salary must be a valid number"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleChangePasswordClick = () =>
    navigate(`/EmpirePMS/employee/${retrieved_id}/change-password`, { state: retrieved_id })

  const handleBackClick = () => navigate(`/EmpirePMS/employee/${retrieved_id}`)

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target
    const newValue = type === "checkbox" ? checked : value

    setEmployeeState((prevState) => ({
      ...prevState,
      [name]: newValue,
    }))

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      await update(employeeState)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Fetch employee data
  const fetchEmployee = useCallback(async () => {
    setFetchEmployeeLoading(true)
    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/employee/${id}`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("jwt")}`,
        },
      })

      if (!res.ok) {
        throw new Error("Failed to fetch employee details")
      }

      const data = await res.json()

      if (data.tokenError) {
        throw new Error(data.tokenError)
      }

      setEmployeeState(data)
      setFetchEmployeeLoading(false)
    } catch (err) {
      setFetchEmployeeError(err.message)
      setFetchEmployeeLoading(false)
    }
  }, [id])

  // Fetch companies data
  const fetchCompanies = useCallback(async () => {
    setFetchCompanyLoading(true)
    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/company`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("jwt")}`,
        },
      })

      if (!res.ok) {
        throw new Error("Failed to fetch companies")
      }

      const data = await res.json()

      if (data.tokenError) {
        throw new Error(data.tokenError)
      }

      setCompanyState(data)
      setFetchCompanyError("")
    } catch (error) {
      setFetchCompanyError(error.message)
    } finally {
      setFetchCompanyLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEmployee()
    fetchCompanies()
  }, [fetchEmployee, fetchCompanies])

  // Loading states
  if (isLoadingState || isFetchEmployeeLoading || fetchCompanyLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <LoadingSpinner size="large" text="Loading employee data..." />
        </div>
      </div>
    )
  }

  // Error states
  if (errorState || fetchEmployeeError || fetchCompanyError) {
    const error = errorState || fetchEmployeeError || fetchCompanyError
    if (error.includes("Session expired") || error.includes("jwt expired") || error.includes("jwt malformed")) {
      return <SessionExpired />
    }
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Data</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return localUser && Object.keys(localUser).length > 0 ? (
    employeeState && Object.keys(employeeState).length > 0 ? (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-black-600 to-black-700 px-6 py-4 bg-dark text-white">
              <h1 className="text-2xl font-bold text-white">Edit Employee Details</h1>
            </div>

            {/* Change Password Button */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleChangePasswordClick}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium"
                >
                  Change Password
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6">
              {/* Personal Information Section */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <FormField
                    label="First Name"
                    name="employee_first_name"
                    value={employeeState.employee_first_name}
                    onChange={handleInputChange}
                    placeholder="Enter first name"
                    required
                    error={formErrors.employee_first_name}
                  />

                  <FormField
                    label="Last Name"
                    name="employee_last_name"
                    value={employeeState.employee_last_name}
                    onChange={handleInputChange}
                    placeholder="Enter last name"
                    required
                    error={formErrors.employee_last_name}
                  />

                  <FormField
                    label="Email Address"
                    name="employee_email"
                    type="email"
                    value={employeeState.employee_email}
                    onChange={handleInputChange}
                    placeholder="yourname@empirecbs.com"
                    required
                    error={formErrors.employee_email}
                  />

                  <FormField
                    label="Phone Number"
                    name="employee_mobile_phone"
                    type="tel"
                    value={employeeState.employee_mobile_phone}
                    onChange={handleInputChange}
                    placeholder="0435 303 047"
                    error={formErrors.employee_mobile_phone}
                  />
                </div>
              </div>

              {/* Work Information Section */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  Work Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <FormField label="Role" name="employee_roles" required>
                    <select
                      name="employee_roles"
                      value={employeeState.employee_roles}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    >
                      {localUser.employee_roles === "Admin" && <option value="Admin">Admin</option>}
                      <option value="Manager">Manager</option>
                      <option value="Foreman">Foreman</option>
                      <option value="Employee">Employee</option>
                    </select>
                  </FormField>

                  <FormField label="Company" name="companies" required>
                    <select
                      name="companies"
                      value={employeeState.companies}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="">Select a company</option>
                      {companyState.map((company) => (
                        <option key={company._id} value={company._id}>
                          {company.company_name}
                        </option>
                      ))}
                    </select>
                  </FormField>
                </div>
              </div>

              {/* Account Settings Section */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  Account Settings
                </h3>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="employee_isarchived"
                    name="employee_isarchived"
                    checked={employeeState.employee_isarchived}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                  />
                  <label htmlFor="employee_isarchived" className="ml-2 text-sm font-medium text-gray-700">
                    Archive this employee account
                  </label>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Archived employees will not be able to access the system but their data will be preserved.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-between pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleBackClick}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  disabled={isSubmitting || isLoadingState}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || isLoadingState}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center"
                >
                  {isSubmitting || isLoadingState ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Updating Employee...
                    </>
                  ) : (
                    "Update Employee"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    ) : (
      <SessionExpired />
    )
  ) : (
    <UnauthenticatedSkeleton />
  )
}

export default UpdateEmployeeForm

// // Import modules
// import { useEffect, useState, useCallback } from 'react';
// import { useNavigate, useLocation, useParams } from 'react-router-dom';
// import { useSelector, useDispatch } from 'react-redux';
// import { setEmployeeDetails } from '../../redux/employeeSlice';
// import { useUpdateEmployee } from '../../hooks/useUpdateEmployee'; 
// import SessionExpired from '../../components/SessionExpired';
// import EmployeeDetailsSkeleton from "../loaders/EmployeeDetailsSkeleton"
// import UnauthenticatedSkeleton from "../loaders/UnauthenticateSkeleton";

// const UpdateEmployeeForm = () => {
//     // Component router
//     const location = useLocation();
//     const retrieved_id = location.state;
//     const navigate = useNavigate();
//     const {id} = useParams();

//     // Component state declaration
//     const employeeState = useSelector((state) => state.employeeReducer.employeeState);
//     const dispatch = useDispatch();
//     const { update, isLoadingState, errorState } = useUpdateEmployee();
//     const [isFetchEmployeeLoading, setFetchEmployeeLoading] = useState(true);
//     const [fetchEmployeeError, setFetchEmployeeError] = useState(null);

//     // Component functions and variables
//     const localUser = JSON.parse(localStorage.getItem('localUser'))

//     const handleChangePasswordClick = () => navigate(`/EmpirePMS/employee/${retrieved_id}/change-password`, {state: retrieved_id});

//     const handleBackClick = () => navigate(`/EmpirePMS/employee/${retrieved_id}`);
    
//     const handleInputChange = (event) => {
//         const { name, value } = event.target;
//         dispatch(setEmployeeDetails({
//             ...employeeState,
//             [name]: value,
//         }));
//     };

//     const handleSubmit = (event) => {
//         event.preventDefault();
//         update(employeeState);
//     };

//     const fetchEmployee = useCallback(async () => {
//         setFetchEmployeeLoading(true);
//             try {
//                 const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/employee/${id}`, { credentials: 'include',
//                     headers: {
//                         'Content-Type': 'application/json',
//                         'Authorization': `Bearer ${sessionStorage.getItem('jwt')}` // Include token in Authorization header
//                     } });
//                 if (!res.ok) {
//                     throw new Error('Failed to fetch employee details');
//                 }
//                 const data = await res.json();
    
//                 if (data.tokenError) {
//                     throw new Error(data.tokenError);
//                 }
    
//                 dispatch(setEmployeeDetails(data));
//                 setFetchEmployeeLoading(false);
//             } catch (err) {
//                 setFetchEmployeeError(err.message);
//                 setFetchEmployeeLoading(false);
//             }
//         }, [id, dispatch]);
    
//         useEffect(() => {
//             fetchEmployee();
//         }, [fetchEmployee]);

//     //Display DOM
//     if (isLoadingState || isFetchEmployeeLoading) { return (<EmployeeDetailsSkeleton />); }

//     if (errorState) {
//         if (errorState.includes("Session expired") || errorState.includes("jwt expired") || errorState.includes("jwt malformed")) {
//             return (<div><SessionExpired /></div>);
//         }
//         return (<div>Error: {errorState || fetchEmployeeError}</div>);
//     }

//     return (
//         localUser && Object.keys(localUser).length > 0 ? (
//         employeeState && Object.keys(employeeState).length > 0 ? (
//             <div className="container mt-5"> 
//                 <div className="card">
//                     <div className="card-header bg-dark text-white">
//                         <h1>EDIT ACCOUNT DETAILS</h1>
//                     </div>
//                     <form  onKeyDown={(e) => { if (e.key === 'Enter') {e.preventDefault();} }} className="card-body" onSubmit={handleSubmit}>
//                         <div className="d-flex justify-content-end mb-3 hover:cursor-not-allowed">
//                             <button type="button" className="btn btn-secondary bg" onClick={handleChangePasswordClick} disabled>CHANGE PASSWORD</button>
//                         </div>
//                         <div className="row">
//                             <div className="col-md-6 mb-3">
//                                 <label className="form-label fw-bold">First name:</label>
//                                 <input 
//                                     className="form-control placeholder-gray-400 placeholder-opacity-50" 
//                                     name="employee_first_name" 
//                                     value={employeeState.employee_first_name} 
//                                     onChange={handleInputChange}
//                                     placeholder='First name'
//                                     required
//                                     onInvalid={(e) => e.target.setCustomValidity('Enter first name')}
//                                     onInput={(e) => e.target.setCustomValidity('')}
//                                 />
//                             </div>
//                             <div className="col-md-6 mb-3">
//                                 <label className="form-label fw-bold">Last name:</label>
//                                 <input 
//                                     className="form-control placeholder-gray-400 placeholder-opacity-50" 
//                                     name="employee_last_name" 
//                                     value={employeeState.employee_last_name} 
//                                     onChange={handleInputChange} 
//                                     placeholder='Last name'
//                                     required
//                                     onInvalid={(e) => e.target.setCustomValidity('Enter last name')}
//                                     onInput={(e) => e.target.setCustomValidity('')}
//                                 />
//                             </div>
//                             <div className="col-md-6 mb-3">
//                                 <label className="form-label fw-bold">Role:</label>
//                                 <select 
//                                     className="form-control"
//                                     name="employee_roles" 
//                                     value={employeeState.employee_roles} 
//                                     onChange={handleInputChange}
//                                 >
//                                     <option value="Admin">Admin</option>
//                                     <option value="Manager">Manager</option>
//                                     <option value="Foreman">Foreman</option>
//                                     <option value="Employee">Employee</option>
//                                 </select>
//                             </div>
//                             <div className="col-md-6 mb-3">
//                                 <label className="form-label fw-bold">Contact:</label>
//                                 <input 
//                                     className="form-control placeholder-gray-400 placeholder-opacity-50" 
//                                     name="employee_mobile_phone" 
//                                     value={employeeState.employee_mobile_phone} 
//                                     onChange={handleInputChange} 
//                                     placeholder='04... or 03...'
//                                 />
//                             </div>
//                             <div className="col-md-6 mb-3">
//                                 <label className="form-label fw-bold">Email:</label>
//                                 <input 
//                                     className="form-control" 
//                                     name="employee_email" 
//                                     value={employeeState.employee_email}
//                                     disabled
//                                 />
//                             </div>
//                             <div className="col-md-6 mb-3">
//                                 <label className="form-label fw-bold">Company:</label>
//                                 <input 
//                                     className="form-control" 
//                                     name="companies" 
//                                     value={employeeState.companies} 
//                                     disabled
//                                 />
//                             </div>
//                             <div className="col-md-6 mb-3">
//                                 <label className="form-label fw-bold">Archived:</label>
//                                 <input 
//                                     type="checkbox"
//                                     className="form-check-input m-1" 
//                                     name="employee_isarchived" 
//                                     checked={employeeState.employee_isarchived} 
//                                     onChange={(e) => handleInputChange({ target: { name: 'employee_isarchived', value: e.target.checked }})}
//                                 />
//                             </div>
//                             <div className="d-flex justify-content-between mb-3">
//                                 <button type="button" onClick={() => handleBackClick(retrieved_id)} className="btn btn-secondary">CANCEL</button>
//                                 <button className="btn btn-primary" type="submit">SUBMIT</button>
//                             </div>
//                         </div>
//                     </form>
//                 </div>
//             </div>
//         ) : (
//             <div><SessionExpired /></div>
//         ) ) : ( <UnauthenticatedSkeleton /> )
//     );
// };

// export default UpdateEmployeeForm;
