"use client"

import { useEffect, useState } from "react"
import { useNavigate, useLocation, useParams } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { ChevronLeft, DollarSign, HelpCircle, ChevronDown, Check } from "lucide-react"

import { useAddProduct } from "../../hooks/useAddProduct"
import { useFetchAliasesByProductType } from "../../hooks/useFetchAliasesByProductType"
import { clearAliases } from "../../redux/aliasSlice"
import { setProjectState } from "../../redux/projectSlice"
import EmployeePageSkeleton from "../../pages/loaders/EmployeePageSkeleton"
import EmployeeDetailsSkeleton from "../loaders/EmployeeDetailsSkeleton"
import SessionExpired from "../../components/SessionExpired"
import UnauthenticatedSkeleton from "../loaders/UnauthenticateSkeleton"

const NewProductForm = () => {
  // Component router
  const navigate = useNavigate()
  const location = useLocation()
  const { id } = useParams()
  const { supplierId = null, supplierName = "" } = location.state || {}

  // Component hook
  const dispatch = useDispatch()
  const { fetchAliasesByProductType, productTypeIsLoadingState, productTypeErrorState } = useFetchAliasesByProductType()
  const { addProduct, productIsLoadingState, productErrorState } = useAddProduct()

  // Component state
  const aliasState = useSelector((state) => state.aliasReducer.aliasState)
  const projectState = useSelector((state) => state.projectReducer.projectState)
  const [isLoadingState, setIsLoadingState] = useState(true)
  const [errorState, setErrorState] = useState(null)
  const [aliasFieldToggle, setAliasFieldToggle] = useState(true)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isInputCustomOpen, setIsInputCustomOpen] = useState(false)
  const [productTypeState, setProductTypeState] = useState([])
  const [productDetailsState, setProductDetailsState] = useState({
    product_sku: "",
    product_name: "",
    product_type: "",
    product_actual_size: 0,
    product_next_available_stock_date: "",
    product_isarchived: false,
    supplier: supplierId || id,
    alias: "",
    product_unit_a: "",
    product_number_a: 1,
    product_price_unit_a: 0,
    product_unit_b: "",
    product_number_b: 0,
    product_price_unit_b: 0,
    product_actual_rate: 0,
    product_note: "",
    product_price_note: "",
    price_fixed: false,
    product_effective_date: "",
    projects: [],
  })

  // Component functions and variables
  const localUser = JSON.parse(localStorage.getItem("localUser"))

  const handleBackClick = () => {
    const idToUse = supplierId || id // Use `id` if `supplierId` is null or undefined
    navigate(`/EmpirePMS/supplier/${idToUse}`, { state: idToUse })
  }

  const handleInputCustomToggle = () => {
    setIsInputCustomOpen(!isInputCustomOpen)
    setProductDetailsState((prevState) => ({
      ...prevState,
      alias: "",
    }))
  }

  const handleProductInputChange = (event) => {
    const { name, value } = event.target
    if (name === "product_type") {
      if (value !== "") {
        fetchAliasesByProductType(value)
        setAliasFieldToggle(false)
      } else {
        dispatch(clearAliases())
        setAliasFieldToggle(true)
      }
    }
    setProductDetailsState((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const handleCheckboxChange = (event) => {
    const { value, checked } = event.target
    setProductDetailsState((prevState) => {
      const updatedProjects = checked
        ? [...prevState.projects, value]
        : prevState.projects.filter((projectId) => projectId !== value)
      return { ...prevState, projects: updatedProjects }
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!productDetailsState.projects.length > 0) {
      alert(`You must select one or more projects that this new product applies to`)
      return
    }
    const idToUse = supplierId || id // Use `id` if `supplierId` is null or undefined

    addProduct(productDetailsState, idToUse)
    navigate(`/EmpirePMS/supplier/${idToUse}`)
  }

  //Render component
  useEffect(() => {
    const abortController = new AbortController()
    const signal = abortController.signal

    const fetchProjects = async () => {
      setIsLoadingState(true) // Set loading state to true at the beginning
      try {
        const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/project`, {
          signal,
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("jwt")}`, // Include token in Authorization header
          },
        })
        if (!res.ok) {
          throw new Error("Failed to fetch")
        }
        const data = await res.json()

        if (data.tokenError) {
          throw new Error(data.tokenError)
        }

        setIsLoadingState(false)
        dispatch(setProjectState(data))
        setErrorState(null)
      } catch (error) {
        if (error.name === "AbortError") {
          // do nothing
        } else {
          setIsLoadingState(false)
          setErrorState(error.message)
        }
      }
    }

    fetchProjects()

    return () => {
      abortController.abort() // Cleanup
    }
  }, [dispatch])

  useEffect(() => {
    const abortController = new AbortController()
    const signal = abortController.signal

    const fetchProductTypes = async () => {
      setIsLoadingState(true) // Set loading state to true at the beginning
      try {
        const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/product-type`, {
          signal,
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("jwt")}`, // Include token in Authorization header
          },
        })
        if (!res.ok) {
          throw new Error("Failed to fetch")
        }
        const data = await res.json()

        if (data.tokenError) {
          throw new Error(data.tokenError)
        }

        setIsLoadingState(false)
        setProductTypeState(data)
        setErrorState(null)
      } catch (error) {
        if (error.name === "AbortError") {
          // do nothing
        } else {
          setIsLoadingState(false)
          setErrorState(error.message)
        }
      }
    }

    fetchProductTypes()

    return () => {
      abortController.abort() // Cleanup
    }
  }, [])

  // Display DOM
  if (productTypeIsLoadingState || productIsLoadingState) {
    return <EmployeeDetailsSkeleton />
  }

  if (productTypeErrorState || productErrorState) {
    if (
      productErrorState &&
      (productErrorState.includes("Session expired") ||
        productErrorState.includes("jwt expired") ||
        productErrorState.includes("jwt malformed"))
    ) {
      return (
        <div>
          <SessionExpired />
        </div>
      )
    }
    return <div>Error: {productErrorState || productTypeErrorState}</div>
  }

  if (isLoadingState) {
    return <EmployeePageSkeleton />
  }

  if (errorState) {
    if (
      errorState.includes("Session expired") ||
      errorState.includes("jwt expired") ||
      errorState.includes("jwt malformed")
    ) {
      return (
        <div>
          <SessionExpired />
        </div>
      )
    }
    return <div>Error: {errorState}</div>
  }

  return localUser && Object.keys(localUser).length > 0 ? (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gray-800 text-white p-4 flex items-center">
          <button onClick={handleBackClick} className="mr-4 p-1 rounded hover:bg-gray-700 transition-colors">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="text-lg md:text-xl font-bold uppercase tracking-wide text-center flex-1">
            {supplierName}: NEW PRODUCT
          </h1>
        </div>
        <form
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
            }
          }}
          className="p-4 md:p-6 space-y-6 text-sm md:text-base"
          onSubmit={handleSubmit}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Product Info */}
            <div className="space-y-2">
              <label className="block font-semibold text-gray-700">* Product SKU:</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                name="product_sku"
                value={productDetailsState.product_sku}
                onChange={handleProductInputChange}
                placeholder="Ex: 13RE1236"
                required
                onInvalid={(e) => e.target.setCustomValidity("Enter SKU")}
                onInput={(e) => e.target.setCustomValidity("")}
              />
              <p className="text-xs text-gray-500 italic">Ex: 13RE1236</p>
            </div>

            <div className="space-y-2">
              <label className="block font-semibold text-gray-700">* Name:</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                name="product_name"
                value={productDetailsState.product_name}
                onChange={handleProductInputChange}
                placeholder="Ex: 16mm SHEETROCK 1200mm x 3600mm"
                required
                onInvalid={(e) => e.target.setCustomValidity("Enter product name")}
                onInput={(e) => e.target.setCustomValidity("")}
              />
              <p className="text-xs text-gray-500 italic">Ex: 16mm SHEETROCK 1200mm x 3600mm</p>
            </div>

            <div className="space-y-2">
              <label className="block font-semibold text-gray-700">* Type:</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                name="product_type"
                value={productDetailsState.product_type}
                onChange={handleProductInputChange}
                required
              >
                <option value="">Select Product Type</option>
                {productTypeState
                  .filter((type) => !type.type_isarchived)
                  .map((type) => (
                    <option key={type._id} value={type._id}>
                      {type.type_name}
                    </option>
                  ))}
              </select>
              <p className="text-xs text-gray-500 italic">Alias is based on the product type you select</p>
            </div>

            {/* Alias Selection */}
            <div className="space-y-2">
              <label className="block font-semibold text-gray-700">* Alias:</label>
              {!isInputCustomOpen ? (
                <div className="space-y-2">
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    name="alias"
                    value={productDetailsState.alias}
                    onChange={handleProductInputChange}
                    disabled={aliasFieldToggle}
                    required
                  >
                    <option value="">Select Alias</option>
                    {aliasState &&
                      aliasState.length > 0 &&
                      Array.from(new Set(aliasState.map((product) => (product.alias ? product.alias._id : null))))
                        .filter((aliasId) => aliasId !== null)
                        .map((aliasId) => {
                          return aliasState.find((product) => product.alias && product.alias._id === aliasId)?.alias
                        })
                        .filter((alias) => alias !== undefined) // Just in case
                        .sort((a, b) => a.alias_name.localeCompare(b.alias_name)) // <-- sort here
                        .map((alias, index) => (
                          <option key={index} value={alias._id}>
                            {alias.alias_name}
                          </option>
                        ))}
                  </select>
                  <p className="text-xs text-gray-500 italic">
                    Set alias to ('na') if not available or
                    <button type="button" onClick={handleInputCustomToggle} className="text-blue-600 underline ml-1">
                      create custom alias
                    </button>
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    name="alias"
                    value={productDetailsState.alias}
                    placeholder="Custom alias..."
                    onChange={handleProductInputChange}
                    onInvalid={(e) => e.target.setCustomValidity("Enter a new custom alias")}
                    onInput={(e) => e.target.setCustomValidity("")}
                  />
                  <p className="text-xs text-gray-500 italic">
                    Don't want to create custom alias?
                    <button type="button" onClick={handleInputCustomToggle} className="text-blue-600 underline ml-1">
                      Cancel
                    </button>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Pricing Information */}
          <div className="border-2 border-gray-200 p-4 rounded-lg">
            <h2 className="text-lg font-bold text-gray-700 mb-4">Pricing Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Unit A */}
              <div className="bg-gray-50 p-4 rounded-lg shadow-sm space-y-4">
                <h3 className="font-semibold text-gray-700 border-b pb-2">Unit A Details</h3>

                <div className="space-y-2">
                  <label className="block font-medium text-gray-700">* Number-A:</label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    name="product_number_a"
                    value={productDetailsState.product_number_a}
                    onChange={handleProductInputChange}
                    min={0}
                    step="0.0001"
                    required
                    onInvalid={(e) => e.target.setCustomValidity("Please input number up to four decimal places")}
                    onInput={(e) => e.target.setCustomValidity("")}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block font-medium text-gray-700">* Unit-A:</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    name="product_unit_a"
                    value={productDetailsState.product_unit_a}
                    onChange={handleProductInputChange}
                    required
                    onInvalid={(e) => e.target.setCustomValidity("Enter unit-A")}
                    onInput={(e) => e.target.setCustomValidity("")}
                  />
                  <p className="text-xs text-gray-500 italic">Ex: EACH, M2, LM, BOX/1000</p>
                </div>

                <div className="space-y-2">
                  <label className="block font-medium text-gray-700">* Unit-A Price:</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      className="w-full pl-20 px-5 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      name="product_price_unit_a"
                      value={productDetailsState.product_price_unit_a}
                      onChange={handleProductInputChange}
                      step="0.0001"
                      min={0}
                      required
                      onInvalid={(e) => e.target.setCustomValidity("Please input number up to four decimal places")}
                      onInput={(e) => e.target.setCustomValidity("")}
                    />
                  </div>
                </div>
              </div>

              {/* Unit B */}
              <div className="bg-gray-50 p-4 rounded-lg shadow-sm space-y-4">
                <h3 className="font-semibold text-gray-700 border-b pb-2">Unit B Details</h3>

                <div className="space-y-2">
                  <label className="block font-medium text-gray-700">* Number-B:</label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    name="product_number_b"
                    value={productDetailsState.product_number_b}
                    onChange={handleProductInputChange}
                    step="0.0001"
                    min={0}
                    required
                    onInvalid={(e) => e.target.setCustomValidity("Please input number up to four decimal places")}
                    onInput={(e) => e.target.setCustomValidity("")}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block font-medium text-gray-700">* Unit-B:</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    name="product_unit_b"
                    value={productDetailsState.product_unit_b}
                    onChange={handleProductInputChange}
                    required
                    onInvalid={(e) => e.target.setCustomValidity("Enter unit-B")}
                    onInput={(e) => e.target.setCustomValidity("")}
                  />
                  <p className="text-xs text-gray-500 italic">Ex: EACH, M, SHEET, KG, PANEL</p>
                </div>

                <div className="space-y-2">
                  <label className="block font-medium text-gray-700">* Unit-B Price:</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      className="w-full pl-10 px-5 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      name="product_price_unit_b"
                      value={productDetailsState.product_price_unit_b}
                      onChange={handleProductInputChange}
                      step="0.0001"
                      min={0}
                      required
                      onInvalid={(e) => e.target.setCustomValidity("Please input number up to four decimal places")}
                      onInput={(e) => e.target.setCustomValidity("")}
                    />
                  </div>
                </div>
              </div>

              {/* Project Selection */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block font-medium text-gray-700">* Project:</label>
                  <div className="relative">
                    <button
                      type="button"
                      className="w-full flex justify-between items-center px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                      <span>
                        {productDetailsState.projects.length > 0
                          ? `${productDetailsState.projects.length} Projects Selected`
                          : `Select Projects`}
                      </span>
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    </button>

                    {isDropdownOpen && (
                      <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                        <ul className="py-1">
                          {projectState &&
                            projectState.length > 0 &&
                            projectState.map((project, index) => (
                              <li key={index} className="relative">
                                <label className="flex items-center w-full px-4 py-2 hover:bg-gray-100 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    id={`project-${project._id}`}
                                    value={project._id}
                                    checked={productDetailsState.projects.includes(project._id)}
                                    onChange={handleCheckboxChange}
                                    className="mr-3 h-4 w-4 border-gray-300 rounded focus:ring-blue-500 text-blue-600"
                                    required
                                    onInvalid={(e) =>
                                      e.target.setCustomValidity(
                                        "You must select one or more project applied to this product",
                                      )
                                    }
                                    onInput={(e) => e.target.setCustomValidity("")}
                                  />
                                  <span className="text-gray-800">{project.project_name}</span>
                                  {productDetailsState.projects.includes(project._id) && (
                                    <Check className="h-5 w-5 text-blue-500 absolute right-4" />
                                  )}
                                </label>
                              </li>
                            ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 italic">
                    Select one or more projects that this product applies to
                  </p>
                </div>

                {/* Price Effective Date */}
                <div className="space-y-2">
                  <label className="block font-medium text-gray-700">* Price effective date:</label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    name="product_effective_date"
                    value={productDetailsState.product_effective_date}
                    onChange={handleProductInputChange}
                    required
                  />
                </div>

                {/* Actual Price Rate */}
                <div className="space-y-2">
                  <label className="block font-medium text-gray-700">* Actual price/rate:</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      className="w-full pl-10 px-5 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      name="product_actual_rate"
                      value={productDetailsState.product_actual_rate}
                      onChange={handleProductInputChange}
                      required
                    />
                  </div>
                </div>

                {/* Price Fixed */}
                <div className="flex items-center space-x-3 mt-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="h-4 w-4 border-gray-300 rounded focus:ring-blue-500 text-blue-600"
                      name="price_fixed"
                      checked={productDetailsState.price_fixed}
                      onChange={(e) =>
                        handleProductInputChange({ target: { name: "price_fixed", value: e.target.checked } })
                      }
                    />
                    <span className="text-sm font-medium text-gray-700">Price fixed</span>
                  </label>
                  <HelpCircle className="h-4 w-4 text-gray-400" />
                </div>
              </div>

              {/* Price Notes - Full Width */}
              <div className="md:col-span-3 space-y-2">
                <label className="block font-medium text-gray-700">* Price notes:</label>
                <textarea
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                  name="product_price_note"
                  value={productDetailsState.product_price_note}
                  onChange={handleProductInputChange}
                  placeholder="Enter pricing notes here..."
                  required
                />
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block font-semibold text-gray-700">
                * Actual Size (M<sup>2</sup>/LENGTH):
              </label>
              <input
                type="number"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                name="product_actual_size"
                value={productDetailsState.product_actual_size}
                onChange={handleProductInputChange}
                step="0.0001"
                min={0}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block font-semibold text-gray-700">Next available stock date:</label>
              <input
                type="date"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                name="product_next_available_stock_date"
                value={productDetailsState.product_next_available_stock_date}
                onChange={handleProductInputChange}
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="block font-semibold text-gray-700">* Product notes:</label>
              <textarea
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                name="product_note"
                value={productDetailsState.product_note}
                onChange={handleProductInputChange}
                placeholder="Enter any additional product notes here..."
                required
              />
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
              ADD TO SUPPLIER
            </button>
          </div>
        </form>
      </div>
    </div>
  ) : (
    <UnauthenticatedSkeleton />
  )
}

export default NewProductForm
