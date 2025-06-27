"use client"

import { useState, useEffect, useCallback } from "react"
import { useNavigate, useParams, useLocation } from "react-router-dom"
import SessionExpired from "../../components/SessionExpired"
import UnauthenticatedSkeleton from "../loaders/UnauthenticateSkeleton"
import LoadingSpinner from "../loaders/LoadingSpinner"
import FormField from "../../components/FormField"

const UpdateProjectForm = () => {
  // Component router
  const navigate = useNavigate()
  const { id } = useParams()
  const location = useLocation()
  const supplierThatHasPurchaseOrder = location.state || {};
  
  // Component state declaration
  const [projectState, setProjectState] = useState({
    _id: "",
    project_name: "",
    project_address: "",
    project_isarchived: false,
    suppliers: [],
    companies: [], // Fixed: changed from null to array
    area_obj_ref: [],
  })

  const [supplierState, setSupplierState] = useState([])
  const [companyState, setCompanyState] = useState([])
  const [isLoadingState, setIsLoadingState] = useState(true)
  const [errorState, setErrorState] = useState(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isCompanyDropdownOpen, setCompanyIsDropdownOpen] = useState(false)
  const [fetchCompanyLoading, setFetchCompanyLoading] = useState(false)
  const [fetchCompanyError, setFetchCompanyError] = useState("")
  const [formErrors, setFormErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Integrated update project hook states
  const [updateLoading, setUpdateLoading] = useState(false)
  const [updateError, setUpdateError] = useState(null)

  // Component functions and variables
  const localUser = JSON.parse(localStorage.getItem("localUser"))

  // Form validation
  const validateForm = () => {
    const errors = {}

    if (!projectState.project_name.trim()) {
      errors.project_name = "Project name is required"
    }

    if (!projectState.project_address.trim()) {
      errors.project_address = "Project address is required"
    }

    if (projectState.suppliers.length === 0) {
      errors.suppliers = "At least one supplier must be selected"
    }

    if (projectState.companies.length === 0) {
      errors.companies = "At least one company must be selected"
    }

    // Validate areas
    projectState.area_obj_ref.forEach((areaObj, areaIndex) => {
      if (!areaObj.areas.area_name.trim()) {
        errors[`area_${areaIndex}`] = "Area name is required"
      }
      areaObj.areas.levels.forEach((level, levelIndex) => {
        if (!level.level_name.trim()) {
          errors[`level_${areaIndex}_${levelIndex}`] = "Level name is required"
        }
        level.subareas.forEach((subarea, subareaIndex) => {
          if (!subarea.subarea_name.trim()) {
            errors[`subarea_${areaIndex}_${levelIndex}_${subareaIndex}`] = "Subarea name is required"
          }
        })
      })
    })

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Integrated update project hook function
  const update = async (projectData) => {
    setUpdateLoading(true)
    setUpdateError(null)
    setIsSubmitting(true)

    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/project/${projectData._id}`, {
        credentials: "include",
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("jwt")}`,
        },
        body: JSON.stringify({ ...projectData }),
      })

      const promise = await res.json()

      if (promise.tokenError) {
        throw new Error(promise.tokenError)
      }

      if (!res.ok) {
        throw new Error("Failed to update project details")
      }

      // Navigate to project page
      navigate(`/EmpirePMS/project/${projectData._id}`)
      alert("Project updated successfully!")
    } catch (error) {
      setUpdateError(error.message)
    } finally {
      setUpdateLoading(false)
      setIsSubmitting(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setProjectState((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }))

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const addArea = () => {
    setProjectState((prevData) => ({
      ...prevData,
      area_obj_ref: [...prevData.area_obj_ref, { areas: { area_name: "", levels: [] } }],
    }))
  }

  const removeArea = (areaIndex) => {
    setProjectState((prevData) => ({
      ...prevData,
      area_obj_ref: prevData.area_obj_ref.filter((_, index) => index !== areaIndex),
    }))
    // Clear related errors
    const newErrors = { ...formErrors }
    delete newErrors[`area_${areaIndex}`]
    setFormErrors(newErrors)
  }

  const addLevel = (areaIndex) => {
    setProjectState((prevData) => ({
      ...prevData,
      area_obj_ref: prevData.area_obj_ref.map((areaObj, index) => {
        if (index === areaIndex) {
          return {
            ...areaObj,
            areas: {
              ...areaObj.areas,
              levels: [...areaObj.areas.levels, { level_name: "", subareas: [] }],
            },
          }
        }
        return areaObj
      }),
    }))
  }

  const removeLevel = (areaIndex, levelIndex) => {
    setProjectState((prevData) => ({
      ...prevData,
      area_obj_ref: prevData.area_obj_ref.map((areaObj, index) => {
        if (index === areaIndex) {
          return {
            ...areaObj,
            areas: {
              ...areaObj.areas,
              levels: areaObj.areas.levels.filter((_, lIndex) => lIndex !== levelIndex),
            },
          }
        }
        return areaObj
      }),
    }))
    // Clear related errors
    const newErrors = { ...formErrors }
    delete newErrors[`level_${areaIndex}_${levelIndex}`]
    setFormErrors(newErrors)
  }

  const addSubarea = (areaIndex, levelIndex) => {
    setProjectState((prevData) => ({
      ...prevData,
      area_obj_ref: prevData.area_obj_ref.map((area, aIndex) =>
        aIndex === areaIndex
          ? {
              ...area,
              areas: {
                ...area.areas,
                levels: area.areas.levels.map((level, lIndex) =>
                  lIndex === levelIndex
                    ? {
                        ...level,
                        subareas: [...level.subareas, { subarea_name: "" }],
                      }
                    : level,
                ),
              },
            }
          : area,
      ),
    }))
  }

  const removeSubarea = (areaIndex, levelIndex, subareaIndex) => {
    setProjectState((prevData) => ({
      ...prevData,
      area_obj_ref: prevData.area_obj_ref.map((area, aIndex) =>
        aIndex === areaIndex
          ? {
              ...area,
              areas: {
                ...area.areas,
                levels: area.areas.levels.map((level, lIndex) =>
                  lIndex === levelIndex
                    ? {
                        ...level,
                        subareas: level.subareas.filter((_, sIndex) => sIndex !== subareaIndex),
                      }
                    : level,
                ),
              },
            }
          : area,
      ),
    }))
    // Clear related errors
    const newErrors = { ...formErrors }
    delete newErrors[`subarea_${areaIndex}_${levelIndex}_${subareaIndex}`]
    setFormErrors(newErrors)
  }

  const handleAreaChange = (areaIndex, value) => {
    setProjectState((prevData) => ({
      ...prevData,
      area_obj_ref: prevData.area_obj_ref.map((areaObj, index) =>
        index === areaIndex
          ? {
              ...areaObj,
              areas: {
                ...areaObj.areas,
                area_name: value,
              },
            }
          : areaObj,
      ),
    }))
    // Clear error when user starts typing
    if (formErrors[`area_${areaIndex}`]) {
      setFormErrors((prev) => ({
        ...prev,
        [`area_${areaIndex}`]: "",
      }))
    }
  }

  const handleLevelChange = (areaIndex, levelIndex, value) => {
    setProjectState((prevData) => ({
      ...prevData,
      area_obj_ref: prevData.area_obj_ref.map((areaObj, aIndex) =>
        aIndex === areaIndex
          ? {
              ...areaObj,
              areas: {
                ...areaObj.areas,
                levels: areaObj.areas.levels.map((level, lIndex) =>
                  lIndex === levelIndex
                    ? {
                        ...level,
                        level_name: value,
                      }
                    : level,
                ),
              },
            }
          : areaObj,
      ),
    }))
    // Clear error when user starts typing
    if (formErrors[`level_${areaIndex}_${levelIndex}`]) {
      setFormErrors((prev) => ({
        ...prev,
        [`level_${areaIndex}_${levelIndex}`]: "",
      }))
    }
  }

  const handleSubareaChange = (areaIndex, levelIndex, subareaIndex, value) => {
    setProjectState((prevData) => ({
      ...prevData,
      area_obj_ref: prevData.area_obj_ref.map((area, aIndex) =>
        aIndex === areaIndex
          ? {
              ...area,
              areas: {
                ...area.areas,
                levels: area.areas.levels.map((level, lIndex) =>
                  lIndex === levelIndex
                    ? {
                        ...level,
                        subareas: level.subareas.map((subarea, sIndex) =>
                          sIndex === subareaIndex
                            ? {
                                ...subarea,
                                subarea_name: value,
                              }
                            : subarea,
                        ),
                      }
                    : level,
                ),
              },
            }
          : area,
      ),
    }))
    // Clear error when user starts typing
    if (formErrors[`subarea_${areaIndex}_${levelIndex}_${subareaIndex}`]) {
      setFormErrors((prev) => ({
        ...prev,
        [`subarea_${areaIndex}_${levelIndex}_${subareaIndex}`]: "",
      }))
    }
  }

  // Fixed checkbox change handler for both suppliers and companies
  const handleCheckboxChange = (event) => {
    const { value, checked, name } = event.target

    if (name === "company") {
      setProjectState((prevState) => {
        const updatedCompanies = checked
          ? [...prevState.companies, value]
          : prevState.companies.filter((companyId) => companyId !== value)
        return { ...prevState, companies: updatedCompanies }
      })
      // Clear error when selection changes
      if (formErrors.companies) {
        setFormErrors((prev) => ({ ...prev, companies: "" }))
      }
    } else {
      // Handle suppliers - check if we're dealing with IDs or objects
      setProjectState((prevState) => {
        const supplierIds = prevState.suppliers.map((s) => (typeof s === "object" ? s._id : s))
        const updatedSupplierIds = checked
          ? [...supplierIds, value]
          : supplierIds.filter((supplierId) => supplierId !== value)

        // Convert back to supplier objects for consistency
        const updatedSuppliers = updatedSupplierIds.map((id) => {
          const supplierObj = supplierState.find((s) => s._id === id)
          return supplierObj || id
        })

        return { ...prevState, suppliers: updatedSuppliers }
      })
      // Clear error when selection changes
      if (formErrors.suppliers) {
        setFormErrors((prev) => ({ ...prev, suppliers: "" }))
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    await update(projectState)
  }

  // Helper function to check if supplier is selected
  const isSupplierSelected = (supplierId) => {
    return projectState.suppliers.some((supplier) =>
      typeof supplier === "object" ? supplier._id === supplierId : supplier === supplierId,
    )
  }

  // Helper function to check if company is selected
  const isCompanySelected = (companyId) => {
    return projectState.companies.includes(companyId)
  }

  // Fetch all suppliers
  useEffect(() => {
    const abortController = new AbortController()
    const signal = abortController.signal

    const fetchAllSuppliers = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/supplier`, {
          signal,
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("jwt")}`,
          },
        })

        if (!res.ok) {
          throw new Error("Failed to fetch suppliers")
        }

        const data = await res.json()

        if (data.tokenError) {
          throw new Error(data.tokenError)
        }

        setSupplierState(data)
      } catch (error) {
        if (error.name !== "AbortError") {
          setErrorState(error.message)
        }
      }
    }

    fetchAllSuppliers()

    return () => {
      abortController.abort()
    }
  }, [])

  // Fetch companies
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

  // Fetch project details
  const fetchProjectDetails = useCallback(async () => {
    setIsLoadingState(true)
    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/project/${id}`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("jwt")}`,
        },
      })

      if (!res.ok) {
        throw new Error("Failed to fetch project details")
      }

      const data = await res.json()

      // Handle both array and single object responses
      const projectData = Array.isArray(data) ? data[0] : data

      // Ensure companies is an array
      if (!projectData.companies) {
        projectData.companies = []
      } else if (!Array.isArray(projectData.companies)) {
        projectData.companies = [projectData.companies]
      }

      setProjectState(projectData)
    } catch (error) {
      setErrorState(error.message)
    } finally {
      setIsLoadingState(false)
    }
  }, [id])

  useEffect(() => {
    fetchProjectDetails()
  }, [fetchProjectDetails])

  // Loading states
  if (isLoadingState || fetchCompanyLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <LoadingSpinner size="large" text="Loading project data..." />
        </div>
      </div>
    )
  }

  // Error states
  if (errorState || fetchCompanyError || updateError) {
    const error = errorState || fetchCompanyError || updateError
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
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-black-600 to-black-700 px-6 py-4 bg-black">
            <h1 className="text-2xl font-bold text-white">Edit Project</h1>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Basic Information Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label="Project Name"
                  name="project_name"
                  value={projectState.project_name}
                  onChange={handleChange}
                  placeholder="Enter project name"
                  required
                  error={formErrors.project_name}
                />

                <FormField
                  label="Project Address"
                  name="project_address"
                  value={projectState.project_address}
                  onChange={handleChange}
                  placeholder="Enter project address"
                  required
                  error={formErrors.project_address}
                />
              </div>

              {/* Archive Status */}
              <div className="mt-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="project_isarchived"
                    name="project_isarchived"
                    checked={projectState.project_isarchived}
                    onChange={handleChange}
                    className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                  />
                  <label htmlFor="project_isarchived" className="ml-2 text-sm font-medium text-gray-700">
                    Archive this project
                  </label>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Archived projects will be hidden from active project lists but data will be preserved.
                </p>
              </div>
            </div>

            {/* Assignments Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Assignments</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Suppliers */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Assign Suppliers
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      className={`w-full px-4 py-3 border rounded-lg text-left focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                        formErrors.suppliers ? "border-red-500 bg-red-50" : "border-gray-300"
                      }`}
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                      {projectState.suppliers.length > 0
                        ? `${projectState.suppliers.length} Supplier${projectState.suppliers.length > 1 ? "s" : ""} Selected`
                        : "Select Suppliers"}
                      <svg
                        className={`w-5 h-5 float-right mt-0.5 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {isDropdownOpen && (
                      <div
                        className="absolute z-10 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto"
                        onMouseLeave={() => setIsDropdownOpen(false)}
                      >
                        <div className="py-2">
                          {supplierState && supplierState.length > 0 ? (
                            supplierState.map((supplier) => (
                              <label
                                key={supplier._id}
                                className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  value={supplier._id}
                                  checked={isSupplierSelected(supplier._id)}
                                  disabled={supplierThatHasPurchaseOrder.includes(supplier._id)}
                                  onChange={handleCheckboxChange}
                                  className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2 mr-3"
                                />
                                <span className="text-gray-900">{supplier.supplier_name}</span>
                              </label>
                            ))
                          ) : (
                            <div className="px-4 py-2 text-gray-500">No suppliers available</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  {formErrors.suppliers && <p className="mt-1 text-sm text-red-600">{formErrors.suppliers}</p>}
                  <p className="mt-1 text-xs text-gray-500">Select one or more suppliers for this project</p>
                </div>

                {/* Companies */}
                <FormField label="Company" name="companies" required>
                  <select
                    name="companies"
                    value={projectState.companies}
                    onChange={handleChange}
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

                {/* Companies */}
                {/* <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Select Company
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      className={`w-full px-4 py-3 border rounded-lg text-left focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                        formErrors.companies ? "border-red-500 bg-red-50" : "border-gray-300"
                      }`}
                      onClick={() => setCompanyIsDropdownOpen(!isCompanyDropdownOpen)}
                    >
                      {projectState.companies.length > 0
                        ? `${projectState.companies.length} Company Selected`
                        : "Select Company"}
                      <svg
                        className={`w-5 h-5 float-right mt-0.5 transition-transform ${isCompanyDropdownOpen ? "rotate-180" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {isCompanyDropdownOpen && (
                      <div
                        className="absolute z-10 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto"
                        onMouseLeave={() => setCompanyIsDropdownOpen(false)}
                      >
                        <div className="py-2">
                          {companyState && companyState.length > 0 ? (
                            companyState.map((company) => (
                              <label
                                key={company._id}
                                className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  name="company"
                                  value={company._id}
                                  checked={isCompanySelected(company._id)}
                                  onChange={handleCheckboxChange}
                                  className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2 mr-3"
                                />
                                <span className="text-gray-900">{company.company_name}</span>
                              </label>
                            ))
                          ) : (
                            <div className="px-4 py-2 text-gray-500">No companies available</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  {formErrors.companies && <p className="mt-1 text-sm text-red-600">{formErrors.companies}</p>}
                  <p className="mt-1 text-xs text-gray-500">Select the company for this project</p>
                </div> */}
              </div>
            </div>

            {/* Areas Section */}
            <div>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Project Areas</h3>
                <button
                  type="button"
                  onClick={addArea}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Add Area
                </button>
              </div>

              <div className="space-y-6">
                {projectState.area_obj_ref.map((areaObj, areaIndex) => (
                  <div key={areaIndex} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={areaObj.areas.area_name}
                          onChange={(e) => handleAreaChange(areaIndex, e.target.value)}
                          placeholder="Enter area name"
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                            formErrors[`area_${areaIndex}`] ? "border-red-500 bg-red-50" : "border-gray-300"
                          }`}
                        />
                        {formErrors[`area_${areaIndex}`] && (
                          <p className="mt-1 text-sm text-red-600">{formErrors[`area_${areaIndex}`]}</p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeArea(areaIndex)}
                        className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                        title="Remove Area"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    {/* Levels */}
                    <div className="border-l-4 border-blue-300 pl-6 ml-4 bg-blue-50 rounded-r-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-md font-medium text-gray-700">Levels</h4>
                        <button
                          type="button"
                          onClick={() => addLevel(areaIndex)}
                          className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 4.5v15m7.5-7.5h-15"
                            />
                          </svg>
                          Add Level
                        </button>
                      </div>

                      <div className="space-y-4">
                        {areaObj.areas.levels.map((level, levelIndex) => (
                          <div key={levelIndex} className="bg-white rounded-lg p-4 border border-blue-200">
                            <div className="flex items-center gap-4 mb-4">
                              <div className="flex-1">
                                <input
                                  type="text"
                                  value={level.level_name}
                                  onChange={(e) => handleLevelChange(areaIndex, levelIndex, e.target.value)}
                                  placeholder="Enter level name"
                                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                                    formErrors[`level_${areaIndex}_${levelIndex}`]
                                      ? "border-red-500 bg-red-50"
                                      : "border-gray-300"
                                  }`}
                                />
                                {formErrors[`level_${areaIndex}_${levelIndex}`] && (
                                  <p className="mt-1 text-sm text-red-600">
                                    {formErrors[`level_${areaIndex}_${levelIndex}`]}
                                  </p>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => removeLevel(areaIndex, levelIndex)}
                                className="p-2 text-red-500 hover:bg-red-100 rounded-md transition-colors"
                                title="Remove Level"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                              </button>
                            </div>

                            {/* Subareas */}
                            <div className="border-l-4 border-pink-300 pl-4 ml-4 bg-pink-50 rounded-r-md p-3">
                              <div className="flex items-center justify-between mb-3">
                                <h5 className="text-sm font-medium text-gray-700">Subareas</h5>
                                <button
                                  type="button"
                                  onClick={() => addSubarea(areaIndex, levelIndex)}
                                  className="inline-flex items-center px-2 py-1 bg-pink-600 text-white rounded text-xs hover:bg-pink-700 transition-colors"
                                >
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M12 4.5v15m7.5-7.5h-15"
                                    />
                                  </svg>
                                  Add Subarea
                                </button>
                              </div>

                              <div className="space-y-2">
                                {level.subareas.map((subarea, subareaIndex) => (
                                  <div key={subareaIndex} className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => removeSubarea(areaIndex, levelIndex, subareaIndex)}
                                      className="p-1 text-red-500 hover:bg-red-100 rounded transition-colors flex-shrink-0"
                                      title="Remove Subarea"
                                    >
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth="2"
                                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                        />
                                      </svg>
                                    </button>
                                    <input
                                      type="text"
                                      value={subarea.subarea_name}
                                      onChange={(e) =>
                                        handleSubareaChange(areaIndex, levelIndex, subareaIndex, e.target.value)
                                      }
                                      placeholder="Enter subarea name"
                                      className={`flex-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 text-sm ${
                                        formErrors[`subarea_${areaIndex}_${levelIndex}_${subareaIndex}`]
                                          ? "border-red-500 bg-red-50"
                                          : "border-gray-300"
                                      }`}
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={isSubmitting || updateLoading}
                className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center"
              >
                {isSubmitting || updateLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Updating Project...
                  </>
                ) : (
                  "Update Project"
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

export default UpdateProjectForm

// "use client"

// // Import modules
// import { useState, useEffect, useCallback } from "react"
// import { useNavigate, useParams } from "react-router-dom"
// import SessionExpired from "../../components/SessionExpired"
// import LoadingScreen from "../loaders/LoadingScreen"
// import UnauthenticatedSkeleton from "../loaders/UnauthenticateSkeleton"
// import { Loader2, X, Plus, Trash2, Square, MinusCircle } from "lucide-react"
// import FormField from "../../components/FormField"

// const UpdateProjectForm = () => {
//   // Component router
//   const navigate = useNavigate()
//   const { id } = useParams()

//   // Component state declaration
//   const [projectState, setProjectState] = useState({
//     project_name: "",
//     project_address: "",
//     project_isarchived: false,
//     suppliers: [],
//     area_obj_ref: [],
//     companies: null
//   })
//   const [supplierState, setSupplierState] = useState([])
//   const [isLoadingState, setIsLoadingState] = useState(true)
//   const [errorState, setErrorState] = useState(null)
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false)

//   // Integrated update project hook states
//   const [updateLoading, setUpdateLoading] = useState(false)
//   const [updateError, setUpdateError] = useState(null)

//   const [formErrors, setFormErrors] = useState({})
//   const [isSubmitting, setIsSubmitting] = useState(false)
//   const [companyState, setCompanyState] = useState([])
//   const [isCompanyDropdownOpen, setCompanyIsDropdownOpen] = useState(false)
  
//   const [fetchCompanyLoading, setFetchCompanyLoading] = useState(false)
//   const [fetchCompanyError, setFetchCompanyError] = useState("")

//   // Component functions and variables
//   const localUser = JSON.parse(localStorage.getItem("localUser"))

//   // Integrated update project hook function
//   const update = async (projectState) => {
//     setUpdateLoading(true)
//     setUpdateError(null)

//     try {
//       const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/project/${projectState._id}`, {
//         credentials: "include",
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${sessionStorage.getItem("jwt")}`, // Include token in Authorization header
//         },
//         body: JSON.stringify({ ...projectState }),
//       })

//       const promise = await res.json()

//       if (promise.tokenError) {
//         throw new Error(promise.tokenError)
//       }

//       if (!res.ok) {
//         throw new Error("Failed to PUT project details")
//       }

//       // navigate client to project page
//       navigate(`/EmpirePMS/project/${projectState._id}`)

//       alert(`Project updated successfully!`)

//       // update loading state
//       setUpdateLoading(false)
//     } catch (error) {
//       setUpdateError(error.message)
//       setUpdateLoading(false)
//     }
//   }

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target
//     setProjectState((prevData) => ({
//       ...prevData,
//       [name]: type === "checkbox" ? checked : value,
//     }))
//   }

//   const addArea = () => {
//     setProjectState((prevData) => ({
//       ...prevData,
//       area_obj_ref: [...prevData.area_obj_ref, { areas: { area_name: "", levels: [] } }],
//     }))
//   }

//   const removeArea = (areaIndex) => {
//     setProjectState((prevData) => ({
//       ...prevData,
//       area_obj_ref: prevData.area_obj_ref.filter((_, index) => index !== areaIndex),
//     }))
//   }

//   const addLevel = (areaIndex) => {
//     setProjectState((prevData) => ({
//       ...prevData,
//       area_obj_ref: prevData.area_obj_ref.map((areaObj, index) => {
//         if (index === areaIndex) {
//           return {
//             ...areaObj,
//             areas: {
//               ...areaObj.areas,
//               levels: [...areaObj.areas.levels, { level_name: "", subareas: [] }],
//             },
//           }
//         }
//         return areaObj
//       }),
//     }))
//   }

//   const removeLevel = (areaIndex, levelIndex) => {
//     setProjectState((prevData) => {
//       const newData = { ...prevData }
//       newData.area_obj_ref[areaIndex].areas.levels = newData.area_obj_ref[areaIndex].areas.levels.filter(
//         (_, index) => index !== levelIndex,
//       )
//       return newData
//     })
//   }

//   const addSubarea = (areaIndex, levelIndex) => {
//     setProjectState((prevData) => ({
//       ...prevData,
//       area_obj_ref: prevData.area_obj_ref.map((area, aIndex) =>
//         aIndex === areaIndex
//           ? {
//               ...area,
//               areas: {
//                 ...area.areas,
//                 levels: area.areas.levels.map((level, lIndex) =>
//                   lIndex === levelIndex
//                     ? {
//                         ...level,
//                         subareas: [...level.subareas, { subarea_name: "" }],
//                       }
//                     : level,
//                 ),
//               },
//             }
//           : area,
//       ),
//     }))
//   }

//   const removeSubarea = (areaIndex, levelIndex, subareaIndex) => {
//     setProjectState((prevData) => {
//       const newData = { ...prevData }
//       newData.area_obj_ref[areaIndex].areas.levels[levelIndex].subareas = newData.area_obj_ref[areaIndex].areas.levels[
//         levelIndex
//       ].subareas.filter((_, index) => index !== subareaIndex)
//       return newData
//     })
//   }

//   const handleAreaChange = (areaIndex, value) => {
//     setProjectState((prevData) => {
//       const newData = { ...prevData }
//       newData.area_obj_ref[areaIndex].areas.area_name = value
//       return newData
//     })
//   }

//   const handleLevelChange = (areaIndex, levelIndex, value) => {
//     setProjectState((prevData) => {
//       const newData = { ...prevData }
//       newData.area_obj_ref[areaIndex].areas.levels[levelIndex].level_name = value
//       return newData
//     })
//   }

//   const handleSubareaChange = (areaIndex, levelIndex, subareaIndex, value) => {
//     setProjectState((prevData) => {
//       const newData = { ...prevData }
//       newData.area_obj_ref[areaIndex].areas.levels[levelIndex].subareas[subareaIndex].subarea_name = value
//       return newData
//     })
//   }

//   const handleCheckboxChange = (event) => {
//     const { value, checked } = event.target

//     setProjectState((prevState) => {
//       // Find the supplier object based on the value (ID)
//       const supplierToAdd = supplierState.find((supplier) => supplier._id === value)

//       const updatedSuppliers = checked
//         ? [...prevState.suppliers, supplierToAdd] // Add the supplier object if checked
//         : prevState.suppliers.filter((supplier) => supplier._id !== value) // Remove the supplier object if unchecked

//       return { ...prevState, suppliers: updatedSuppliers }
//     })
//   }

//   const handleSubmit = (e) => {
//     e.preventDefault()
//     update(projectState)
//   }

//   // fetch all suppliers
//   useEffect(() => {
//     const abortController = new AbortController()
//     const signal = abortController.signal

//     const fetchAllSuppliers = async () => {
//       setIsLoadingState(true)
//       try {
//         const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/supplier`, {
//           signal,
//           credentials: "include",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${sessionStorage.getItem("jwt")}`, // Include token in Authorization header
//           },
//         })

//         if (!res.ok) {
//           throw new Error("Failed to fetch")
//         }

//         const data = await res.json()

//         if (data.tokenError) {
//           throw new Error(data.tokenError)
//         }

//         setIsLoadingState(false)
//         setSupplierState(data)
//         setErrorState(null)
//       } catch (error) {
//         if (error.name === "AbortError") {
//           // do nothing
//         } else {
//           setIsLoadingState(false)
//           setErrorState(error.message)
//         }
//       }
//     }

//     fetchAllSuppliers()

//     return () => {
//       abortController.abort() // Cleanup
//     }
//   }, [])

//   // Fetch companies
//   useEffect(() => {
//     const abortController = new AbortController()
//     const signal = abortController.signal

//     const fetchCompanies = async () => {
//       setFetchCompanyLoading(true)
//       try {
//         const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/company`, {
//           signal,
//           credentials: "include",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${sessionStorage.getItem("jwt")}`,
//           },
//         })

//         if (!res.ok) {
//           throw new Error("Failed to fetch companies")
//         }

//         const data = await res.json()

//         if (data.tokenError) {
//           throw new Error(data.tokenError)
//         }

//         setCompanyState(data)
//         setFetchCompanyError("")
//       } catch (error) {
//         if (error.name !== "AbortError") {
//           setFetchCompanyError(error.message)
//         }
//       } finally {
//         setFetchCompanyLoading(false)
//       }
//     }

//     fetchCompanies()

//     return () => {
//       abortController.abort()
//     }
//   }, [])

//   // fetch project details
//   const fetchProjectDetails = useCallback(async () => {
//     try {
//       const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/project/${id}`, {
//         credentials: "include",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${sessionStorage.getItem("jwt")}`, // Include token in Authorization header
//         },
//       })

//       if (!res.ok) {
//         throw new Error("Network response was not ok")
//       }

//       const data = await res.json()

//       setProjectState(data[0])
//       setIsLoadingState(false)
//     } catch (error) {
//       setErrorState(error.message)
//     } finally {
//       setIsLoadingState(false)
//     }
//   }, [id])

//   useEffect(() => {
//     fetchProjectDetails()
//   }, [fetchProjectDetails])

//   // Improved loading state handling
//   if (isLoadingState) {
//     return <LoadingScreen />
//   }

//   if (errorState) {
//     if (
//       errorState.includes("Session expired") ||
//       errorState.includes("jwt expired") ||
//       errorState.includes("jwt malformed")
//     ) {
//       return (
//         <div>
//           <SessionExpired />
//         </div>
//       )
//     }
//     return <div>Error: {errorState}</div>
//   }

//   return localUser && Object.keys(localUser).length > 0 ? (
//     <div className="min-h-screen bg-gray-50 py-8">
//       <div className="max-w-6xl mx-auto px-4">
//         <div className="bg-white rounded-lg shadow-lg overflow-hidden">
//           {/* Header */}
//           <div className="bg-gradient-to-r from-black-600 to-black-700 px-6 py-4 bg-black">
//             <h1 className="text-2xl font-bold text-white">Edit Project</h1>
//           </div>

//           {/* Form */}
//           <form onSubmit={handleSubmit} className="p-6 space-y-8">
//             {/* Basic Information Section */}
//             <div>
//               <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
//                 Basic Information
//               </h3>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <FormField
//                   label="Project Name"
//                   name="project_name"
//                   value={projectState.project_name}
//                   onChange={handleChange}
//                   placeholder="Enter project name"
//                   required
//                   error={formErrors.project_name}
//                 />

//                 <FormField
//                   label="Project Address"
//                   name="project_address"
//                   value={projectState.project_address}
//                   onChange={handleChange}
//                   placeholder="Enter project address"
//                   required
//                   error={formErrors.project_address}
//                 />
//               </div>
//             </div>

//             {/* Assignments Section */}
//             <div>
//               <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Assignments</h3>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 {/* Suppliers */}
//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">
//                     Assign Suppliers
//                     <span className="text-red-500 ml-1">*</span>
//                   </label>
//                   <div className="relative">
//                     <button
//                       type="button"
//                       className={`w-full px-4 py-3 border rounded-lg text-left focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
//                         formErrors.suppliers ? "border-red-500 bg-red-50" : "border-gray-300"
//                       }`}
//                       onClick={() => setIsDropdownOpen(!isDropdownOpen)}
//                     >
//                       {projectState.suppliers.length > 0
//                         ? `${projectState.suppliers.length} Supplier${projectState.suppliers.length > 1 ? "s" : ""} Selected`
//                         : "Select Suppliers"}
//                       <svg
//                         className={`w-5 h-5 float-right mt-0.5 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
//                         fill="none"
//                         stroke="currentColor"
//                         viewBox="0 0 24 24"
//                       >
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
//                       </svg>
//                     </button>
//                     {isDropdownOpen && (
//                       <div
//                         className="absolute z-10 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto"
//                         onMouseLeave={() => setIsDropdownOpen(false)}
//                       >
//                         <div className="py-2">
//                           {supplierState && supplierState.length > 0 ? (
//                             supplierState.map((supplier) => (
//                               <label
//                                 key={supplier._id}
//                                 className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
//                               >
//                                 <input
//                                   type="checkbox"
//                                   value={supplier._id}
//                                   checked={projectState.suppliers.includes(supplier._id)}
//                                   onChange={handleCheckboxChange}
//                                   className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2 mr-3"
//                                 />
//                                 <span className="text-gray-900">{supplier.supplier_name}</span>
//                               </label>
//                             ))
//                           ) : (
//                             <div className="px-4 py-2 text-gray-500">No suppliers available</div>
//                           )}
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                   {formErrors.suppliers && <p className="mt-1 text-sm text-red-600">{formErrors.suppliers}</p>}
//                   <p className="mt-1 text-xs text-gray-500">Select one or more suppliers for this project</p>
//                 </div>

//                 {/* Companies */}
//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">
//                     Select Company
//                     <span className="text-red-500 ml-1">*</span>
//                   </label>
//                   <div className="relative">
//                     <button
//                       type="button"
//                       className={`w-full px-4 py-3 border rounded-lg text-left focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
//                         formErrors.companies ? "border-red-500 bg-red-50" : "border-gray-300"
//                       }`}
//                       onClick={() => setCompanyIsDropdownOpen(!isCompanyDropdownOpen)}
//                     >
//                       {companyState.length > 0
//                         ? `${companyState.length} Company Selected`
//                         : "Select Company"}
//                       <svg
//                         className={`w-5 h-5 float-right mt-0.5 transition-transform ${isCompanyDropdownOpen ? "rotate-180" : ""}`}
//                         fill="none"
//                         stroke="currentColor"
//                         viewBox="0 0 24 24"
//                       >
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
//                       </svg>
//                     </button>
//                     {isCompanyDropdownOpen && (
//                       <div
//                         className="absolute z-10 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto"
//                         onMouseLeave={() => setCompanyIsDropdownOpen(false)}
//                       >
//                         <div className="py-2">
//                           {companyState && companyState.length > 0 ? (
//                             companyState.map((company) => (
//                               <label
//                                 key={company._id}
//                                 className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
//                               >
//                                 <input
//                                   type="checkbox"
//                                   name="company"
//                                   value={company._id}
//                                   checked={projectState.companies.includes(company._id)}
//                                   onChange={handleCheckboxChange}
//                                   className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2 mr-3"
//                                 />
//                                 <span className="text-gray-900">{company.company_name}</span>
//                               </label>
//                             ))
//                           ) : (
//                             <div className="px-4 py-2 text-gray-500">No companies available</div>
//                           )}
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                   {formErrors.companies && <p className="mt-1 text-sm text-red-600">{formErrors.companies}</p>}
//                   <p className="mt-1 text-xs text-gray-500">Select the company for this project</p>
//                 </div>
//               </div>
//             </div>

//             {/* Areas Section */}
//             <div>
//               <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
//                 <h3 className="text-lg font-semibold text-gray-900">Project Areas</h3>
//                 <button
//                   type="button"
//                   onClick={addArea}
//                   className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
//                 >
//                   <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.5v15m7.5-7.5h-15" />
//                   </svg>
//                   Add Area
//                 </button>
//               </div>

//               {formErrors.areas && <p className="mb-4 text-sm text-red-600">{formErrors.areas}</p>}

//               <div className="space-y-6">
//                 {projectState.area_obj_ref.map((areaObj, areaIndex) => (
//                   <div key={areaIndex} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
//                     <div className="flex items-center gap-4 mb-4">
//                       <div className="flex-1">
//                         <input
//                           type="text"
//                           value={areaObj.areas.area_name}
//                           onChange={(e) => handleAreaChange(areaIndex, e.target.value)}
//                           placeholder="Enter area name"
//                           className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
//                             formErrors[`area_${areaIndex}`] ? "border-red-500 bg-red-50" : "border-gray-300"
//                           }`}
//                         />
//                         {formErrors[`area_${areaIndex}`] && (
//                           <p className="mt-1 text-sm text-red-600">{formErrors[`area_${areaIndex}`]}</p>
//                         )}
//                       </div>
//                       <button
//                         type="button"
//                         onClick={() => removeArea(areaIndex)}
//                         className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
//                         title="Remove Area"
//                       >
//                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
//                         </svg>
//                       </button>
//                     </div>

//                     {/* Levels */}
//                     <div className="border-l-4 border-blue-300 pl-6 ml-4 bg-blue-50 rounded-r-lg p-4">
//                       <div className="flex items-center justify-between mb-4">
//                         <h4 className="text-md font-medium text-gray-700">Levels</h4>
//                         <button
//                           type="button"
//                           onClick={() => addLevel(areaIndex)}
//                           className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
//                         >
//                           <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path
//                               strokeLinecap="round"
//                               strokeLinejoin="round"
//                               strokeWidth="2"
//                               d="M12 4.5v15m7.5-7.5h-15"
//                             />
//                           </svg>
//                           Add Level
//                         </button>
//                       </div>

//                       <div className="space-y-4">
//                         {areaObj.areas.levels.map((level, levelIndex) => (
//                           <div key={levelIndex} className="bg-white rounded-lg p-4 border border-blue-200">
//                             <div className="flex items-center gap-4 mb-4">
//                               <div className="flex-1">
//                                 <input
//                                   type="text"
//                                   value={level.level_name}
//                                   onChange={(e) => handleLevelChange(areaIndex, levelIndex, e.target.value)}
//                                   placeholder="Enter level name"
//                                   className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
//                                     formErrors[`level_${areaIndex}_${levelIndex}`]
//                                       ? "border-red-500 bg-red-50"
//                                       : "border-gray-300"
//                                   }`}
//                                 />
//                                 {formErrors[`level_${areaIndex}_${levelIndex}`] && (
//                                   <p className="mt-1 text-sm text-red-600">
//                                     {formErrors[`level_${areaIndex}_${levelIndex}`]}
//                                   </p>
//                                 )}
//                               </div>
//                               <button
//                                 type="button"
//                                 onClick={() => removeLevel(areaIndex, levelIndex)}
//                                 className="p-2 text-red-500 hover:bg-red-100 rounded-md transition-colors"
//                                 title="Remove Level"
//                               >
//                                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                   <path
//                                     strokeLinecap="round"
//                                     strokeLinejoin="round"
//                                     strokeWidth="2"
//                                     d="M6 18L18 6M6 6l12 12"
//                                   />
//                                 </svg>
//                               </button>
//                             </div>

//                             {/* Subareas */}
//                             <div className="border-l-4 border-pink-300 pl-4 ml-4 bg-pink-50 rounded-r-md p-3">
//                               <div className="flex items-center justify-between mb-3">
//                                 <h5 className="text-sm font-medium text-gray-700">Subareas</h5>
//                                 <button
//                                   type="button"
//                                   onClick={() => addSubarea(areaIndex, levelIndex)}
//                                   className="inline-flex items-center px-2 py-1 bg-pink-600 text-white rounded text-xs hover:bg-pink-700 transition-colors"
//                                 >
//                                   <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                     <path
//                                       strokeLinecap="round"
//                                       strokeLinejoin="round"
//                                       strokeWidth="2"
//                                       d="M12 4.5v15m7.5-7.5h-15"
//                                     />
//                                   </svg>
//                                   Add Subarea
//                                 </button>
//                               </div>

//                               <div className="space-y-2">
//                                 {level.subareas.map((subarea, subareaIndex) => (
//                                   <div key={subareaIndex} className="flex items-center gap-2">
//                                     <button
//                                       type="button"
//                                       onClick={() => removeSubarea(areaIndex, levelIndex, subareaIndex)}
//                                       className="p-1 text-red-500 hover:bg-red-100 rounded transition-colors flex-shrink-0"
//                                       title="Remove Subarea"
//                                     >
//                                       <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path
//                                           strokeLinecap="round"
//                                           strokeLinejoin="round"
//                                           strokeWidth="2"
//                                           d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
//                                         />
//                                       </svg>
//                                     </button>
//                                     <input
//                                       type="text"
//                                       value={subarea.subarea_name}
//                                       onChange={(e) =>
//                                         handleSubareaChange(areaIndex, levelIndex, subareaIndex, e.target.value)
//                                       }
//                                       placeholder="Enter subarea name"
//                                       className={`flex-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 text-sm ${
//                                         formErrors[`subarea_${areaIndex}_${levelIndex}_${subareaIndex}`]
//                                           ? "border-red-500 bg-red-50"
//                                           : "border-gray-300"
//                                       }`}
//                                     />
//                                   </div>
//                                 ))}
//                               </div>
//                             </div>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Submit Button */}
//             <div className="pt-6 border-t border-gray-200">
//               <button
//                 type="submit"
//                 disabled={isSubmitting}
//                 className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center"
//               >
//                 {isSubmitting ? (
//                   <>
//                     <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
//                     Creating Project...
//                   </>
//                 ) : (
//                   "Create Project"
//                 )}
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   ) : (
//     <UnauthenticatedSkeleton />
//   )
//   // return localUser && Object.keys(localUser).length > 0 ? (
//   //   <div className="container mx-auto mt-4 sm:mt-10 px-4 sm:px-6 lg:px-8">
//   //     <div className="bg-white shadow-xl rounded-lg overflow-hidden">
//   //       <div className="bg-gradient-to-r from-gray-800 to-gray-800 px-6 py-2">
//   //         <h1 className="text-xs sm:text-xl font-bold text-white">EDIT PROJECT</h1>
//   //       </div>
//   //       <form
//   //         onKeyDown={(e) => {
//   //           if (e.key === "Enter") {
//   //             e.preventDefault()
//   //           }
//   //         }}
//   //         onSubmit={handleSubmit}
//   //         className="p-4 sm:p-6 space-y-2 sm:space-y-6 text-xs sm:text-base"
//   //       >
//   //         {/* PROJECT NAME */}
//   //         <div className="flex gap-x-2">
//   //           <div className="w-full">
//   //             <label htmlFor="project_name" className="block text-sm font-medium text-gray-700">
//   //               * Project Name
//   //             </label>
//   //             <input
//   //               type="text"
//   //               id="project_name"
//   //               name="project_name"
//   //               value={projectState.project_name}
//   //               onChange={handleChange}
//   //               required
//   //               className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
//   //             />
//   //           </div>
//   //           {/* PROJECT ADDRESS */}
//   //           <div className="w-full">
//   //             <label htmlFor="project_address" className="block text-sm font-medium text-gray-700">
//   //               * Project Address
//   //             </label>
//   //             <input
//   //               type="text"
//   //               id="project_address"
//   //               name="project_address"
//   //               value={projectState.project_address}
//   //               onChange={handleChange}
//   //               required
//   //               className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
//   //             />
//   //           </div>
//   //         </div>
//   //         {/* SUPPLIERS */}
//   //         <div className="mb-0 sm:mb-3">
//   //           <label className="block text-sm font-medium text-gray-700">Assign Suppliers:</label>
//   //           <div>
//   //             <button
//   //               type="button"
//   //               className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-left focus:outline-none focus:ring-2 focus:ring-blue-500"
//   //               onClick={() => setIsDropdownOpen(!isDropdownOpen)}
//   //             >
//   //               {projectState.suppliers.length > 0
//   //                 ? `x${projectState.suppliers.length} Suppliers Selected`
//   //                 : `Select Suppliers`}
//   //             </button>
//   //             {isDropdownOpen && (
//   //               <div
//   //                 className="relative z-10 mt-2 w-full bg-white border border-gray-300 rounded-md shadow-md max-h-60 overflow-auto"
//   //                 onClick={() => setIsDropdownOpen(true)}
//   //               >
//   //                 <ul className="py-1">
//   //                   {supplierState &&
//   //                     supplierState.length > 0 &&
//   //                     supplierState.map((supplier, index) => (
//   //                       <li key={index} className="flex items-center px-4 py-2 hover:bg-gray-100">
//   //                         <input
//   //                           type="checkbox"
//   //                           id={`supplier-${supplier._id}`}
//   //                           value={supplier._id}
//   //                           checked={projectState.suppliers.some((sup) => sup._id === supplier._id)}
//   //                           onChange={handleCheckboxChange}
//   //                           className="mr-2"
//   //                           required={projectState.suppliers.length === 0} // Set required only if no supplier is selected
//   //                           onInvalid={(e) => {
//   //                             if (projectState.suppliers.length === 0) {
//   //                               e.target.setCustomValidity(
//   //                                 "You must select one or more supplier(s) applied to this Project",
//   //                               )
//   //                             }
//   //                           }}
//   //                           onInput={(e) => e.target.setCustomValidity("")}
//   //                         />
//   //                         <label htmlFor={`supplier-${supplier._id}`} className="text-gray-900">
//   //                           {supplier.supplier_name}
//   //                         </label>
//   //                       </li>
//   //                     ))}
//   //                 </ul>
//   //               </div>
//   //             )}
//   //           </div>
//   //           <p className="hidden sm:inline-block text-xs italic text-gray-400 mt-2">
//   //             Assign one or more suppliers to this new Project
//   //           </p>
//   //         </div>
//   //         {/* AREAS */}
//   //         <div>
//   //           <h3 className="text-lg font-medium text-gray-700 mb-2">Areas</h3>
//   //           {projectState.area_obj_ref.map((areaObj, areaIndex) => (
//   //             <div key={areaIndex} className="border border-gray-200 p-4 rounded-md mb-4 bg-gray-50">
//   //               <div className="flex items-center justify-between mb-2">
//   //                 <input
//   //                   type="text"
//   //                   value={areaObj.areas.area_name}
//   //                   onChange={(e) => handleAreaChange(areaIndex, e.target.value)}
//   //                   placeholder="Area Name"
//   //                   className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
//   //                 />
//   //                 {/* REMOVE AREA */}
//   //                 <button
//   //                   type="button"
//   //                   onClick={() => removeArea(areaIndex)}
//   //                   className="px-2 py-1 text-sm rounded-md text-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400 hover:bg-red-500 hover:text-white"
//   //                 >
//   //                   <X className="size-7" />
//   //                 </button>
//   //               </div>
//   //               {/* LEVELS */}
//   //               <div className="border-l-2 border-purple-300 mb-1 p-2 bg-purple-100 bg-opacity-50">
//   //                 <h4 className="text-md font-medium text-gray-700 mb-2">Levels</h4>
//   //                 {areaObj.areas.levels.map((level, levelIndex) => (
//   //                   <div key={levelIndex} className="ml-2 mb-2">
//   //                     <div className="flex items-center justify-between mb-2">
//   //                       <Square className="size-3 mr-1" />
//   //                       <input
//   //                         type="text"
//   //                         value={level.level_name}
//   //                         onChange={(e) => handleLevelChange(areaIndex, levelIndex, e.target.value)}
//   //                         placeholder="Level Name"
//   //                         className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
//   //                       />
//   //                       {/* REMOVE LEVEL */}
//   //                       <button
//   //                         type="button"
//   //                         onClick={() => removeLevel(areaIndex, levelIndex)}
//   //                         className="px-2 py-1 text-sm rounded-md text-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400 hover:text-white"
//   //                       >
//   //                         <MinusCircle className="size-6" />
//   //                       </button>
//   //                     </div>
//   //                     {/* SUBAREAS */}
//   //                     <div className="ml-6 border-l-2 border-pink-300 mb-4 p-2 bg-pink-100 bg-opacity-50">
//   //                       <h5 className="text-sm font-medium text-gray-700 mb-2">Subareas</h5>
//   //                       {level.subareas.map((subarea, subareaIndex) => (
//   //                         <div key={subareaIndex} className="flex items-center justify-between mb-2">
//   //                           {/* REMOVE SUBAREA */}
//   //                           <button
//   //                             type="button"
//   //                             onClick={() => removeSubarea(areaIndex, levelIndex, subareaIndex)}
//   //                             className="px-2 py-1 text-sm rounded-md text-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400 hover:bg-red-500 hover:text-white"
//   //                           >
//   //                             <Trash2 className="size-5" />
//   //                           </button>
//   //                           <input
//   //                             type="text"
//   //                             value={subarea.subarea_name}
//   //                             onChange={(e) => handleSubareaChange(areaIndex, levelIndex, subareaIndex, e.target.value)}
//   //                             placeholder="Subarea Name"
//   //                             className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
//   //                           />
//   //                         </div>
//   //                       ))}
//   //                       {/* ADD SUBAREA */}
//   //                       <button
//   //                         type="button"
//   //                         onClick={() => addSubarea(areaIndex, levelIndex)}
//   //                         className="inline-flex items-center px-2 py-1 border border-transparent leading-4 font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ease-in-out text-xs sm:text-sm"
//   //                       >
//   //                         <Plus className="size-4 sm:size-5 mr-1" />
//   //                         Add Sub-area
//   //                       </button>
//   //                     </div>
//   //                   </div>
//   //                 ))}
//   //                 {/* ADD LEVEL */}
//   //                 <button
//   //                   type="button"
//   //                   onClick={() => addLevel(areaIndex)}
//   //                   className="inline-flex items-center px-3 py-2 border border-transparent leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out text-xs sm:text-sm"
//   //                 >
//   //                   <Plus className="size-4 sm:size-5 mr-1" />
//   //                   Add Level
//   //                 </button>
//   //               </div>
//   //             </div>
//   //           ))}
//   //           {/* ADD AREA */}
//   //           <button
//   //             type="button"
//   //             onClick={addArea}
//   //             className="inline-flex items-center px-4 py-3 border border-transparent leading-4 font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition duration-150 ease-in-out text-xs sm:text-sm"
//   //           >
//   //             <Plus className="size-4 sm:size-5 mr-1" />
//   //             Add Area
//   //           </button>
//   //         </div>

//   //         <div>
//   //           <button
//   //             type="submit"
//   //             disabled={updateLoading}
//   //             className="w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed"
//   //           >
//   //             {updateLoading ? (
//   //               <span className="flex items-center justify-center">
//   //                 <Loader2 className="animate-spin mr-2 h-4 w-4" />
//   //                 UPDATING...
//   //               </span>
//   //             ) : (
//   //               "UPDATE PROJECT"
//   //             )}
//   //           </button>

//   //           {updateError && (
//   //             <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded-md">Error: {updateError}</div>
//   //           )}
//   //         </div>
//   //       </form>
//   //     </div>
//   //   </div>
//   // ) : (
//   //   <UnauthenticatedSkeleton />
//   // )
// }

// export default UpdateProjectForm
