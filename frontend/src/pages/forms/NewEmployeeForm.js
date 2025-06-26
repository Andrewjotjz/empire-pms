"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAddEmployee } from "../../hooks/useAddEmployee"
import SessionExpired from "../../components/SessionExpired"
import UnauthenticatedSkeleton from "../loaders/UnauthenticateSkeleton"
import LoadingSpinner from "../loaders/LoadingSpinner"
import FormField from "../../components/FormField"

const NewEmployeeForm = () => {
  const navigate = useNavigate()
  const { addEmployee, isLoadingState, errorState } = useAddEmployee()

  const [employeeState, setEmployeeState] = useState({
    employee_first_name: "",
    employee_last_name: "",
    employee_roles: "Employee",
    employee_mobile_phone: "",
    employee_email: "",
    employee_password: "",
    companies: [],
  })

  const [fetchCompanyLoading, setFetchCompanyLoading] = useState(false)
  const [fetchCompanyError, setFetchCompanyError] = useState("")
  const [companyState, setCompanyState] = useState([])
  const [formErrors, setFormErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const localUser = JSON.parse(localStorage.getItem("localUser"))

  const isValidEmail = (email) => {
    const pattern = /[a-zA-Z0-9._%+-]+@empirecbs\.com/
    return pattern.test(email)
  }

  const isValidPhone = (phone) => {
    const pattern = /^[\d\s\-+$$$$]+$/
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

    if (!employeeState.employee_password.trim()) {
      errors.employee_password = "Password is required"
    } else if (employeeState.employee_password.length < 6) {
      errors.employee_password = "Password must be at least 6 characters"
    }

    if (employeeState.employee_mobile_phone && !isValidPhone(employeeState.employee_mobile_phone)) {
      errors.employee_mobile_phone = "Please enter a valid phone number"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0 //! ???
  }

  const handleBackClick = () => navigate(`/EmpirePMS/employee`)

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setEmployeeState((prevState) => ({
      ...prevState,
      [name]: value,
    }))

    // Clear error when user starts typing
    if (formErrors[name]) {  //! ???
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!validateForm()) { //! ???
      return
    }

    setIsSubmitting(true)
    try {
      await addEmployee(employeeState)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Fetch all companies
  useEffect(() => {
    const abortController = new AbortController()
    const signal = abortController.signal

    const fetchCompanies = async () => {
      setFetchCompanyLoading(true)
      try {
        const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/company`, {
          signal,
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
        if (error.name !== "AbortError") {
          setFetchCompanyError(error.message)
        }
      } finally {
        setFetchCompanyLoading(false)
      }
    }

    fetchCompanies()

    return () => {
      abortController.abort()
    }
  }, [])

  // Loading states
  if (fetchCompanyLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <LoadingSpinner size="large" text="Loading company data..." />
        </div>
      </div>
    )
  }

  // Error states
  if (errorState || fetchCompanyError) {
    const error = errorState || fetchCompanyError
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-black-600 to-black-700 px-6 py-4 bg-dark">
            <h1 className="text-2xl font-bold text-white">Add New Employee</h1>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              <FormField label="Role" name="employee_roles" required>
                <select
                  name="employee_roles"
                  value={employeeState.employee_roles}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">Select a company</option>
                  {companyState.map((company) => (
                    <option key={company._id} value={company._id}>
                      {company.company_name}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField
                label="Phone Number"
                name="employee_mobile_phone"
                type="tel"
                value={employeeState.employee_mobile_phone}
                onChange={handleInputChange}
                placeholder="0435 303 047"
                error={formErrors.employee_mobile_phone}
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
                label="Password"
                name="employee_password"
                type="password"
                value={employeeState.employee_password}
                onChange={handleInputChange}
                placeholder="Minimum 6 characters"
                required
                error={formErrors.employee_password}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between mt-8 pt-6 border-t border-gray-200">
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
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center"
              >
                {isSubmitting || isLoadingState ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Adding Employee...
                  </>
                ) : (
                  "Add Employee"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  ) : (
    <UnauthenticatedSkeleton />
  )
}

export default NewEmployeeForm

// // Import modules
// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAddEmployee } from '../../hooks/useAddEmployee'; 
 
// import SessionExpired from '../../components/SessionExpired';
// import EmployeeDetailsSkeleton from "../loaders/EmployeeDetailsSkeleton";
// import UnauthenticatedSkeleton from "../loaders/UnauthenticateSkeleton";

// const NewEmployeeForm = () => {
//     // Component router
//     const navigate = useNavigate();

//     // Component hook
//     const { addEmployee, isLoadingState, errorState } = useAddEmployee();

//     // Component state
//     const [employeeState, setEmployeeState] = useState({
//         employee_first_name: '',
//         employee_last_name: '',
//         employee_roles: 'Employee',
//         employee_mobile_phone: '',
//         employee_email: '',
//         employee_password: '',
//         companies: []
//     });
//     const [fetchCompanyLoading, setFetchCompanyLoading] = useState(false);
//     const [fetchCompanyError, setFetchCompanyError] = useState('');
//     const [companyState, setCompanyState] = useState([]);

//     // Component functions and variables
//     const localUser = JSON.parse(localStorage.getItem('localUser'))

//     const isValidEmail = (email) => {
//         const pattern = /[a-zA-Z0-9._%+-]+@empirecbs\.com/;
//         return pattern.test(email);
//     };

//     const handleBackClick = () => navigate(`/EmpirePMS/employee`);

//     const handleInputChange = (event) => {
//         const { name, value } = event.target;
//         setEmployeeState((prevState) => ({
//             ...prevState,
//             [name]: value,
//         }));
//     };

//     const handleSubmit = (event) => {
//         event.preventDefault();
        
//         if (!isValidEmail(employeeState.employee_email)) {
//             alert(`Email must be in this format xxxx.xxxx@empirecbs.com`);
//             return;
//         }

//         addEmployee(employeeState);
//     };

//     // Fetch all companies
//     useEffect(() => {
//         const abortController = new AbortController();
//         const signal = abortController.signal;

//         const fetchCompanies = async () => {
//             setFetchCompanyLoading(true); // Set loading state to true at the beginning
//             try {
//                 const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/company`, { signal , credentials: 'include',
//                     headers: {
//                         'Content-Type': 'application/json',
//                         'Authorization': `Bearer ${sessionStorage.getItem('jwt')}` // Include token in Authorization header
//                     }});
//                 if (!res.ok) {
//                     throw new Error('Failed to fetch');
//                 }
//                 const data = await res.json();

//                 if (data.tokenError) {
//                     throw new Error(data.tokenError);
//                 }
                
//                 setFetchCompanyLoading(false);
//                 setCompanyState(data);
//                 setFetchCompanyError(null);
//             } catch (error) {
//                 if (error.name === 'AbortError') {
//                     // do nothing
//                 } else {
//                     setFetchCompanyLoading(false);
//                     setFetchCompanyError(error.message);
//                 }
//             }
//         };

//         fetchCompanies();

//         return () => {
//             abortController.abort(); // Cleanup
//         };
//     }, []);

//     // Display DOM
//     if (isLoadingState) {
//         return <EmployeeDetailsSkeleton />;
//     }
//     if (fetchCompanyLoading) {
//         return <EmployeeDetailsSkeleton />;
//     }

//     if (errorState) {
//         if (errorState.includes("Session expired") || errorState.includes("jwt expired") || errorState.includes("jwt malformed")) {
//             return <div><SessionExpired /></div>;
//         }
//         return <div>Error: {errorState}</div>;
//     }
//     if (fetchCompanyError) {
//         if (fetchCompanyError.includes("Session expired") || fetchCompanyError.includes("jwt expired") || fetchCompanyError.includes("jwt malformed")) {
//             return <div><SessionExpired /></div>;
//         }
//         return <div>Error: {fetchCompanyError}</div>;
//     }

//     return (
//         localUser && Object.keys(localUser).length > 0 ? (
//         <div className="container mt-5"> 
//             <div className="card">
//                 <div className="card-header bg-dark text-white">
//                     <h1>NEW EMPLOYEE</h1>
//                 </div>
//                 <form  onKeyDown={(e) => { if (e.key === 'Enter') {e.preventDefault();} }} className="card-body" onSubmit={handleSubmit}>
//                     <div className="row">
//                         <div className="col-md-6 mb-3">
//                             <label className="form-label font-bold">First name:</label>
//                             <input 
//                                 type='text'
//                                 className="form-control placeholder-gray-400 placeholder-opacity-50" 
//                                 name="employee_first_name" 
//                                 value={employeeState.employee_first_name} 
//                                 onChange={handleInputChange}
//                                 placeholder='First name'
//                                 required
//                                 onInvalid={(e) => e.target.setCustomValidity('Enter first name')}
//                                 onInput={(e) => e.target.setCustomValidity('')}
//                             />
//                         </div>
//                         <div className="col-md-6 mb-3">
//                             <label className="form-label font-bold">Last name:</label>
//                             <input 
//                                 type='text'
//                                 className="form-control placeholder-gray-400 placeholder-opacity-50" 
//                                 name="employee_last_name" 
//                                 value={employeeState.employee_last_name} 
//                                 onChange={handleInputChange} 
//                                 placeholder='Last name'
//                                 required
//                                 onInvalid={(e) => e.target.setCustomValidity('Enter last name')}
//                                 onInput={(e) => e.target.setCustomValidity('')}
//                             />
//                         </div>
//                         <div className="col-md-6 mb-3">
//                             <label className="form-label font-bold">Role:</label>
//                             <select 
//                                 className="form-control cursor-pointer hover:shadow-md"
//                                 name="employee_roles" 
//                                 value={employeeState.employee_roles} 
//                                 onChange={handleInputChange}
//                             >
//                                 {localUser.employee_roles === "Admin" && <option value="Admin">Admin</option>}
//                                 <option value="Manager">Manager</option>
//                                 <option value="Foreman">Foreman</option>
//                                 <option value="Employee">Employee</option>
//                             </select>
//                         </div>
//                         <div className="col-md-6 mb-3">
//                             <label className="form-label font-bold">Company:</label>
//                             <select 
//                                 className="form-control cursor-pointer hover:shadow-md"
//                                 name="employee_roles" 
//                                 value={companyState._id} 
//                                 onChange={handleInputChange}
//                             >
//                                 {companyState.map(company => <option value={company._id}>{company.company_name}</option>)}
//                             </select>
//                         </div>
//                         <div className="col-md-6 mb-3">
//                             <label className="form-label font-bold">Contact:</label>
//                             <input 
//                                 type='text'
//                                 className="form-control placeholder-gray-400 placeholder-opacity-50" 
//                                 name="employee_mobile_phone" 
//                                 value={employeeState.employee_mobile_phone} 
//                                 onChange={handleInputChange} 
//                                 placeholder='0435303047'
//                             />
//                         </div>
//                         <div className="col-md-6 mb-3">
//                             <label className="form-label font-bold">Email:</label>
//                             <input 
//                                 type='text'
//                                 className="form-control placeholder-gray-400 placeholder-opacity-50" 
//                                 name="employee_email" 
//                                 value={employeeState.employee_email}
//                                 onChange={handleInputChange}
//                                 placeholder='yourname@empirecbs.com'
//                                 required
//                                 onInvalid={(e) => e.target.setCustomValidity('Enter email and must be in this format yourname@empirecbs.com')}
//                                 onInput={(e) => e.target.setCustomValidity('')}
//                             />
//                         </div>
//                         <div className="col-md-6 mb-3">
//                             <label className="form-label font-bold">Password:</label>
//                             <input 
//                                 type='text'
//                                 className="form-control placeholder-gray-400 placeholder-opacity-50" 
//                                 name="employee_password" 
//                                 value={employeeState.employee_password}
//                                 onChange={handleInputChange}
//                                 placeholder='Minimum 6 characters'
//                                 required
//                                 onInvalid={(e) => e.target.setCustomValidity('Enter password')}
//                                 onInput={(e) => e.target.setCustomValidity('')}
//                             />
//                         </div>
//                         <div className="d-flex justify-content-between mb-3">
//                             <button type="button" onClick={handleBackClick} className="btn btn-secondary">CANCEL</button>
//                             <button className="btn btn-primary" type="submit">ADD TO COMPANY</button>
//                         </div>
//                     </div>
//                 </form>
//             </div>
//         </div> ) : ( <UnauthenticatedSkeleton /> )
//     );
// };

// export default NewEmployeeForm;
