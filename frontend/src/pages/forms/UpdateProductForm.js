"use client"

import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { ChevronLeft, DollarSign, HelpCircle, ChevronDown, Check, Edit2, Plus, X, RotateCcw } from "lucide-react"

import { useAddProductPrice } from "../../hooks/useAddProductPrice"
import { useUpdateProduct } from "../../hooks/useUpdateProduct"
import { useFetchAliasesByProductType } from "../../hooks/useFetchAliasesByProductType"
import { setProjectState } from "../../redux/projectSlice"
import { setProductState } from "../../redux/productSlice"
import { setProductPrice } from "../../redux/productPriceSlice"
import EmployeePageSkeleton from "../../pages/loaders/EmployeePageSkeleton"
import EmployeeDetailsSkeleton from "../loaders/EmployeeDetailsSkeleton"
import UnauthenticatedSkeleton from "../loaders/UnauthenticateSkeleton"
import SessionExpired from "../../components/SessionExpired"

const UpdateProductForm = () => {
  // Component router
  const navigate = useNavigate()
  const { id, productId } = useParams()

  // Component hook
  const dispatch = useDispatch()
  const { fetchAliasesByProductType, productTypeIsLoadingState, productTypeErrorState } = useFetchAliasesByProductType()
  const { updateProduct, productUpdateIsLoadingState, productUpdateErrorState } = useUpdateProduct()
  const { addPrice, isAddPriceLoadingState, addPriceErrorState } = useAddProductPrice()

  // Component state
  const aliasState = useSelector((state) => state.aliasReducer.aliasState)
  const projectState = useSelector((state) => state.projectReducer.projectState)
  const productState = useSelector((state) => state.productReducer.productState)
  const productPriceState = useSelector((state) => state.productPriceReducer.productPriceState)
  const [isLoadingState, setIsLoadingState] = useState(true)
  const [errorState, setErrorState] = useState(null)
  const [isDisabled, setIsDisabled] = useState(true)
  const [isProductPriceDisabled, setIsProductPriceDisabled] = useState(true)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isDropdownOpenNewPrice, setIsDropdownOpenNewPrice] = useState(false)
  const [isEditAlias, setIsEditAlias] = useState(false)
  const [isChangeAlias, setIsChangeAlias] = useState(false)
  const [isShowNewPriceForm, setIsShowNewPriceForm] = useState(false)
  const [defaultProductType, setDefaultProductType] = useState("")
  const [defaultAlias, setDefaultAlias] = useState("")
  const [defaultProductPrice, setDefaultProductPrice] = useState({})
  const [newProductPriceState, setNewProductPriceState] = useState({
    product_obj_ref: productId,
    product_unit_a: "",
    product_number_a: "",
    product_price_unit_a: 0,
    product_unit_b: "",
    product_number_b: 0,
    product_price_unit_b: 0,
    product_price_note: "",
    price_fixed: false,
    product_effective_date: "",
    projects: [],
  })
  const [productTypeState, setProductTypeState] = useState([])

  // Component functions and variables
  const localUser = JSON.parse(localStorage.getItem("localUser"))

  const handleBackClick = () => navigate(-1)

  const handleAbortNewPrice = () => {
    setIsShowNewPriceForm(!isShowNewPriceForm)
    setNewProductPriceState({
      product_obj_ref: productId,
      product_unit_a: "",
      product_number_a: "",
      product_price_unit_a: 0,
      product_unit_b: "",
      product_number_b: 0,
      product_price_unit_b: 0,
      price_fixed: false,
      product_effective_date: "",
      projects: [],
    })
  }

  const handleCreateNewPrice = () => {
    setIsShowNewPriceForm(!isShowNewPriceForm)
    if (Object.values(defaultProductPrice).length === 0) {
      setDefaultProductPrice(productPriceState)
    }
  }

  const handleEditProductPrice = () => {
    setIsProductPriceDisabled(!isProductPriceDisabled)
    if (Object.values(defaultProductPrice).length === 0) {
      setDefaultProductPrice(productPriceState)
    }
  }

  const changeAlias = () => {
    setIsChangeAlias(!isChangeAlias)
    if (defaultProductType === "") {
      setDefaultProductType(productState.product_type)
      setDefaultAlias(productState.alias_name)
      fetchAliasesByProductType(productState.product_type)
      setIsDisabled(false)
    } else {
      fetchAliasesByProductType(defaultProductType)
    }
    dispatch(setProductState({ ...productState, product_type: defaultProductType, alias_name: defaultAlias }))
    setIsDisabled(false)
  }

  const handleNewPriceInputChange = (event) => {
    const { name, value } = event.target

    setNewProductPriceState((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const handleProductInputChange = (event) => {
    const { name, value } = event.target
    if (name === "product_type") {
      if (value !== "") {
        fetchAliasesByProductType(value)
      }
    }
    dispatch(
      setProductState({
        ...productState,
        [name]: value,
      }),
    )
  }

  const handlePriceInputChange = (event) => {
    const { name, value } = event.target

    dispatch(
      setProductPrice({
        ...productPriceState,
        [name]: value,
      }),
    )
  }

  const handleCheckboxChange = (event) => {
    const { value, checked } = event.target
    let updatedProjects
    if (checked) {
      updatedProjects = [...productPriceState.projects, value]
    } else {
      updatedProjects = productPriceState.projects.filter((projectId) => projectId !== value)
    }
    dispatch(setProductPrice({ ...productPriceState, projects: updatedProjects }))
  }

  const handleCheckboxChangeNewPrice = (event) => {
    const { value, checked } = event.target
    setNewProductPriceState((prevState) => {
      const updatedProjects = checked
        ? [...prevState.projects, value]
        : prevState.projects.filter((projectId) => projectId !== value)
      return { ...prevState, projects: updatedProjects }
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!productPriceState.projects.length > 0) {
      alert(`You must select one or more projects that this new product applies to`)
      return
    }
    if (!newProductPriceState.projects.length > 0 && isShowNewPriceForm === true) {
      alert(`You must select one or more projects that this new product applies to`)
      return
    }

    if (newProductPriceState.product_number_a !== "" && isShowNewPriceForm === true) {
      addPrice(newProductPriceState)
    }

    updateProduct(productState, productPriceState, productId, productPriceState._id)
  }

  // Fetch projects
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

  // Fetch product types
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

  // Fetch product details
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/supplier/${id}/products/${productId}`, {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("jwt")}`, // Include token in Authorization header
          },
        })
        if (!res.ok) {
          throw new Error("Failed to fetch product details")
        }
        const data = await res.json()

        if (data.tokenError) {
          throw new Error(data.tokenError)
        }

        // Convert the MongoDB Date ISO8601 format to (YYYY-MM-DD) JavaScript Date string
        if (data && data.length > 0) {
          const product = data[0].product || {}
          const modifiedProductState = {
            ...product,
            product_next_available_stock_date: product.product_next_available_stock_date
              ? product.product_next_available_stock_date.split("T")[0]
              : "", // or 'null' depending on your needs
          }
          dispatch(setProductState(modifiedProductState))
        }

        // Convert the MongoDB Date ISO8601 format to (YYYY-MM-DD) JavaScript Date string
        if (data && data[0].productPrice && data[0].productPrice.product_effective_date) {
          const modifiedProductPriceState = {
            ...data[0].productPrice,
            product_effective_date: data[0].productPrice.product_effective_date
              ? data[0].productPrice.product_effective_date.split("T")[0]
              : "", // or 'null' depending on your needs
          }
          dispatch(setProductPrice(modifiedProductPriceState))
        }

        setIsLoadingState(false)
      } catch (err) {
        setErrorState(err.message)
        setIsLoadingState(false)
      }
    }

    fetchProductDetails()
  }, [id, productId, dispatch])

  // Display DOM
  if (productTypeIsLoadingState || productUpdateIsLoadingState || isAddPriceLoadingState) {
    return <EmployeeDetailsSkeleton />
  }

  if (productTypeErrorState || productUpdateErrorState || addPriceErrorState) {
    if (
      productUpdateErrorState &&
      (productUpdateErrorState.includes("Session expired") ||
        productUpdateErrorState.includes("jwt expired") ||
        productUpdateErrorState.includes("jwt malformed"))
    ) {
      return (
        <div>
          <SessionExpired />
        </div>
      )
    }
    return <div>Error: {productUpdateErrorState || productTypeErrorState || addPriceErrorState}</div>
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

  return localUser && Object.keys(localUser).length > 0 && productState ? (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gray-800 text-white p-4 flex items-center">
          <button onClick={handleBackClick} className="mr-4 p-1 rounded hover:bg-gray-700 transition-colors">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="text-lg md:text-xl font-bold uppercase tracking-wide text-center flex-1">EDIT PRODUCT</h1>
        </div>

        {/* Form */}
        <form
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
            }
          }}
          className="p-4 md:p-6 space-y-6 text-sm md:text-base"
          onSubmit={handleSubmit}
        >
          {/* Basic Product Info Section */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center">
              <span>Product Information</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block font-semibold text-gray-700">*Product SKU:</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="product_sku"
                  value={productState.product_sku}
                  onChange={handleProductInputChange}
                  required
                  onInvalid={(e) => e.target.setCustomValidity("Enter SKU")}
                  onInput={(e) => e.target.setCustomValidity("")}
                />
                <p className="text-xs text-gray-500 italic">Ex: 13RE1236</p>
              </div>

              <div className="space-y-2">
                <label className="block font-semibold text-gray-700">*Name:</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="product_name"
                  value={productState.product_name}
                  onChange={handleProductInputChange}
                  required
                  onInvalid={(e) => e.target.setCustomValidity("Enter product name")}
                  onInput={(e) => e.target.setCustomValidity("")}
                />
                <p className="text-xs text-gray-500 italic">Ex: 16mm SHEETROCK 1200mm x 3600mm</p>
              </div>

              <div className="space-y-2">
                <label className="block font-semibold text-gray-700">*Type:</label>
                <select
                  className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    !isChangeAlias ? "bg-gray-100" : ""
                  }`}
                  name="product_type"
                  value={productState.product_type}
                  onChange={handleProductInputChange}
                  required
                  disabled={!isChangeAlias}
                >
                  <option value="" disabled>
                    Select Product Type
                  </option>
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
                <label className="block font-semibold text-gray-700">*Alias:</label>
                {!isEditAlias && !isChangeAlias && (
                  <div className="space-y-2">
                    <div className="flex">
                      <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded-l-md bg-gray-100"
                        name="alias_name"
                        value={productState.alias_name}
                        disabled
                      />
                      <button
                        type="button"
                        onClick={changeAlias}
                        className="px-3 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 transition-colors"
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 italic">Click the edit button to change alias</p>
                  </div>
                )}
                {isChangeAlias && !isEditAlias && (
                  <div className="space-y-2">
                    <div className="flex">
                      <select
                        className="w-full px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        name="alias"
                        onChange={handleProductInputChange}
                        disabled={isDisabled}
                        required
                      >
                        <option value="">Select Alias</option>
                        {aliasState &&
                          aliasState.length > 0 &&
                          Array.from(new Set(aliasState.map((product) => (product.alias ? product.alias._id : null))))
                            .filter((aliasId) => aliasId !== null)
                            .map((aliasId, index) => {
                              const alias = aliasState.find(
                                (product) => product.alias && product.alias._id === aliasId,
                              ).alias
                              return (
                                <option key={index} value={aliasId}>
                                  {alias.alias_name}
                                </option>
                              )
                            })}
                      </select>
                      <button
                        type="button"
                        onClick={changeAlias}
                        className="px-3 py-2 bg-gray-500 text-white rounded-r-md hover:bg-gray-600 transition-colors"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 italic">Select a new alias or cancel to keep the current one</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Current Price Section */}
          <div
            className={`bg-gray-50 p-4 rounded-lg border ${
              isProductPriceDisabled ? "border-gray-200" : "border-blue-300"
            } transition-colors`}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-700 flex items-center">
                <span>Current Price Information</span>
              </h2>
              <div className="flex space-x-2">
                {isProductPriceDisabled && !isShowNewPriceForm && (
                  <button
                    type="button"
                    onClick={handleEditProductPrice}
                    className="px-3 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors flex items-center"
                  >
                    <Edit2 className="h-4 w-4 mr-1" />
                    <span>Edit</span>
                  </button>
                )}
                {!isProductPriceDisabled && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsProductPriceDisabled(!isProductPriceDisabled)
                      dispatch(setProductPrice(defaultProductPrice))
                    }}
                    className="px-3 py-1 bg-gray-500 text-white text-sm rounded-md hover:bg-gray-600 transition-colors flex items-center"
                  >
                    <RotateCcw className="h-4 w-4 mr-1" />
                    <span>Reset</span>
                  </button>
                )}
                {isProductPriceDisabled && !isShowNewPriceForm && (
                  <button
                    type="button"
                    onClick={handleCreateNewPrice}
                    className="px-3 py-1 bg-green-500 text-white text-sm rounded-md hover:bg-green-600 transition-colors flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    <span>New Price</span>
                  </button>
                )}
              </div>
            </div>

            <div
              className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${
                isProductPriceDisabled ? "opacity-75" : ""
              } transition-opacity`}
            >
              {/* Unit A */}
              <div className="bg-white p-4 rounded-lg shadow-sm space-y-4 border border-gray-100">
                <h3 className="font-semibold text-gray-700 border-b pb-2">Unit A Details</h3>

                <div className="space-y-2">
                  <label className="block font-medium text-gray-700">*Number-A:</label>
                  <input
                    type="number"
                    className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isProductPriceDisabled ? "bg-gray-100" : ""
                    }`}
                    name="product_number_a"
                    value={productPriceState.product_number_a}
                    onChange={handlePriceInputChange}
                    min={0}
                    step="0.0001"
                    required
                    onInvalid={(e) => e.target.setCustomValidity("Please input number up to four decimal places")}
                    onInput={(e) => e.target.setCustomValidity("")}
                    disabled={isProductPriceDisabled}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block font-medium text-gray-700">*Unit-A:</label>
                  <input
                    type="text"
                    className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isProductPriceDisabled ? "bg-gray-100" : ""
                    }`}
                    name="product_unit_a"
                    value={productPriceState.product_unit_a}
                    onChange={handlePriceInputChange}
                    required
                    onInvalid={(e) => e.target.setCustomValidity("Enter unit-A")}
                    onInput={(e) => e.target.setCustomValidity("")}
                    disabled={isProductPriceDisabled}
                  />
                  <p className="text-xs text-gray-500 italic">Ex: Box, Pack, Carton</p>
                </div>

                <div className="space-y-2">
                  <label className="block font-medium text-gray-700">*Unit-A Price:</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      className={`w-full pl-10 px-6 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isProductPriceDisabled ? "bg-gray-100" : ""
                      }`}
                      name="product_price_unit_a"
                      value={productPriceState.product_price_unit_a}
                      onChange={handlePriceInputChange}
                      step="0.0001"
                      min={0}
                      required
                      onInvalid={(e) => e.target.setCustomValidity("Please input number up to four decimal places")}
                      onInput={(e) => e.target.setCustomValidity("")}
                      disabled={isProductPriceDisabled}
                    />
                  </div>
                </div>
              </div>

              {/* Unit B */}
              <div className="bg-white p-4 rounded-lg shadow-sm space-y-4 border border-gray-100">
                <h3 className="font-semibold text-gray-700 border-b pb-2">Unit B Details</h3>

                <div className="space-y-2">
                  <label className="block font-medium text-gray-700">*Number-B:</label>
                  <input
                    type="number"
                    className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isProductPriceDisabled ? "bg-gray-100" : ""
                    }`}
                    name="product_number_b"
                    value={productPriceState.product_number_b}
                    onChange={handlePriceInputChange}
                    step="0.0001"
                    min={0}
                    required
                    onInvalid={(e) => e.target.setCustomValidity("Please input number up to four decimal places")}
                    onInput={(e) => e.target.setCustomValidity("")}
                    disabled={isProductPriceDisabled}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block font-medium text-gray-700">*Unit-B:</label>
                  <input
                    type="text"
                    className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isProductPriceDisabled ? "bg-gray-100" : ""
                    }`}
                    name="product_unit_b"
                    value={productPriceState.product_unit_b}
                    onChange={handlePriceInputChange}
                    required
                    onInvalid={(e) => e.target.setCustomValidity("Enter unit-B")}
                    onInput={(e) => e.target.setCustomValidity("")}
                    disabled={isProductPriceDisabled}
                  />
                  <p className="text-xs text-gray-500 italic">Ex: units, length, each, sheet</p>
                </div>

                <div className="space-y-2">
                  <label className="block font-medium text-gray-700">*Unit-B Price:</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      className={`w-full pl-10 px-6 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isProductPriceDisabled ? "bg-gray-100" : ""
                      }`}
                      name="product_price_unit_b"
                      value={productPriceState.product_price_unit_b}
                      onChange={handlePriceInputChange}
                      step="0.0001"
                      min={0}
                      required
                      onInvalid={(e) => e.target.setCustomValidity("Please input number up to four decimal places")}
                      onInput={(e) => e.target.setCustomValidity("")}
                      disabled={isProductPriceDisabled}
                    />
                  </div>
                </div>
              </div>

              {/* Project Selection */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block font-medium text-gray-700">*Project:</label>
                  <div className="relative">
                    <button
                      type="button"
                      className={`w-full flex justify-between items-center px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isProductPriceDisabled ? "bg-gray-100" : "bg-white"
                      }`}
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      disabled={isProductPriceDisabled}
                    >
                      <span>
                        {productPriceState.projects && productPriceState.projects.length > 0
                          ? `${productPriceState.projects.length} Projects Selected`
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
                                    checked={
                                      productPriceState.projects && productPriceState.projects.includes(project._id)
                                    }
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
                                  {productPriceState.projects && productPriceState.projects.includes(project._id) && (
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
                  <label className="block font-medium text-gray-700">*Price effective date:</label>
                  <input
                    type="date"
                    className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isProductPriceDisabled ? "bg-gray-100" : ""
                    }`}
                    name="product_effective_date"
                    value={productPriceState.product_effective_date}
                    onChange={handlePriceInputChange}
                    required
                    disabled={isProductPriceDisabled}
                  />
                </div>

                {/* Actual Price Rate */}
                <div className="space-y-2">
                  <label className="block font-medium text-gray-700">*Actual price/rate:</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      className={`w-full pl-10 px-6 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isProductPriceDisabled ? "bg-gray-100" : ""
                      }`}
                      name="product_actual_rate"
                      value={productPriceState.product_actual_rate}
                      onChange={handlePriceInputChange}
                      required
                      disabled={isProductPriceDisabled}
                    />
                  </div>
                </div>

                {/* Price Fixed */}
                <div className="flex items-center space-x-3 mt-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className={`h-4 w-4 border-gray-300 rounded focus:ring-blue-500 text-blue-600 ${
                        isProductPriceDisabled ? "bg-gray-100" : ""
                      }`}
                      name="price_fixed"
                      checked={productPriceState.price_fixed}
                      onChange={(e) =>
                        handlePriceInputChange({ target: { name: "price_fixed", value: e.target.checked } })
                      }
                      disabled={isProductPriceDisabled}
                    />
                    <span className="text-sm font-medium text-gray-700">Price fixed</span>
                  </label>
                  <HelpCircle className="h-4 w-4 text-gray-400" />
                </div>
              </div>

              {/* Price Notes - Full Width */}
              <div className="md:col-span-3 space-y-2">
                <label className="block font-medium text-gray-700">*Price notes:</label>
                <textarea
                  className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px] ${
                    isProductPriceDisabled ? "bg-gray-100" : ""
                  }`}
                  name="product_price_note"
                  value={productPriceState.product_price_note}
                  onChange={handlePriceInputChange}
                  disabled={isProductPriceDisabled}
                />
              </div>
            </div>
          </div>

          {/* New Price Form */}
          {isShowNewPriceForm && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-700 flex items-center">
                  <span>New Price Version</span>
                </h2>
                <button
                  type="button"
                  onClick={handleAbortNewPrice}
                  className="px-3 py-1 bg-gray-500 text-white text-sm rounded-md hover:bg-gray-600 transition-colors flex items-center"
                >
                  <X className="h-4 w-4 mr-1" />
                  <span>Cancel</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Unit A */}
                <div className="bg-white p-4 rounded-lg shadow-sm space-y-4 border border-gray-100">
                  <h3 className="font-semibold text-gray-700 border-b pb-2">Unit A Details</h3>

                  <div className="space-y-2">
                    <label className="block font-medium text-gray-700">*Number-A:</label>
                    <input
                      type="number"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      name="product_number_a"
                      value={newProductPriceState.product_number_a}
                      onChange={handleNewPriceInputChange}
                      min={0}
                      step="0.0001"
                      required
                      onInvalid={(e) => e.target.setCustomValidity("Please input number up to four decimal places")}
                      onInput={(e) => e.target.setCustomValidity("")}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block font-medium text-gray-700">*Unit-A:</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      name="product_unit_a"
                      value={newProductPriceState.product_unit_a}
                      onChange={handleNewPriceInputChange}
                      required
                      onInvalid={(e) => e.target.setCustomValidity("Enter unit-A")}
                      onInput={(e) => e.target.setCustomValidity("")}
                    />
                    <p className="text-xs text-gray-500 italic">Ex: Box, Pack, Carton</p>
                  </div>

                  <div className="space-y-2">
                    <label className="block font-medium text-gray-700">*Unit-A Price:</label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <DollarSign className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="number"
                        className="w-full pl-10 px-6 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        name="product_price_unit_a"
                        value={newProductPriceState.product_price_unit_a}
                        onChange={handleNewPriceInputChange}
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
                <div className="bg-white p-4 rounded-lg shadow-sm space-y-4 border border-gray-100">
                  <h3 className="font-semibold text-gray-700 border-b pb-2">Unit B Details</h3>

                  <div className="space-y-2">
                    <label className="block font-medium text-gray-700">*Number-B:</label>
                    <input
                      type="number"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      name="product_number_b"
                      value={newProductPriceState.product_number_b}
                      onChange={handleNewPriceInputChange}
                      step="0.0001"
                      min={0}
                      required
                      onInvalid={(e) => e.target.setCustomValidity("Please input number up to four decimal places")}
                      onInput={(e) => e.target.setCustomValidity("")}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block font-medium text-gray-700">*Unit-B:</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      name="product_unit_b"
                      value={newProductPriceState.product_unit_b}
                      onChange={handleNewPriceInputChange}
                      required
                      onInvalid={(e) => e.target.setCustomValidity("Enter unit-B")}
                      onInput={(e) => e.target.setCustomValidity("")}
                    />
                    <p className="text-xs text-gray-500 italic">Ex: units, length, each, sheet</p>
                  </div>

                  <div className="space-y-2">
                    <label className="block font-medium text-gray-700">*Unit-B Price:</label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <DollarSign className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="number"
                        className="w-full pl-10 px-6 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        name="product_price_unit_b"
                        value={newProductPriceState.product_price_unit_b}
                        onChange={handleNewPriceInputChange}
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
                    <label className="block font-medium text-gray-700">*Project:</label>
                    <div className="relative">
                      <button
                        type="button"
                        className="w-full flex justify-between items-center px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        onClick={() => setIsDropdownOpenNewPrice(!isDropdownOpenNewPrice)}
                      >
                        <span>
                          {newProductPriceState.projects.length > 0
                            ? `${newProductPriceState.projects.length} Projects Selected`
                            : `Select Projects`}
                        </span>
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      </button>

                      {isDropdownOpenNewPrice && (
                        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                          <ul className="py-1">
                            {projectState &&
                              projectState.length > 0 &&
                              projectState.map((project, index) => (
                                <li key={index} className="relative">
                                  <label className="flex items-center w-full px-4 py-2 hover:bg-gray-100 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      id={`new-project-${project._id}`}
                                      value={project._id}
                                      checked={newProductPriceState.projects.includes(project._id)}
                                      onChange={handleCheckboxChangeNewPrice}
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
                                    {newProductPriceState.projects.includes(project._id) && (
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
                      Select one or more projects that this new price applies to
                    </p>
                  </div>

                  {/* Price Effective Date */}
                  <div className="space-y-2">
                    <label className="block font-medium text-gray-700">*Price effective date:</label>
                    <input
                      type="date"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      name="product_effective_date"
                      value={newProductPriceState.product_effective_date}
                      onChange={handleNewPriceInputChange}
                      required
                    />
                  </div>

                  {/* Actual Price Rate */}
                  <div className="space-y-2">
                    <label className="block font-medium text-gray-700">*Actual price/rate:</label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <DollarSign className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="number"
                        className="w-full pl-10 px-6 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        name="product_actual_rate"
                        value={newProductPriceState.product_actual_rate}
                        onChange={handleNewPriceInputChange}
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
                        checked={newProductPriceState.price_fixed}
                        onChange={(e) =>
                          handleNewPriceInputChange({ target: { name: "price_fixed", value: e.target.checked } })
                        }
                      />
                      <span className="text-sm font-medium text-gray-700">Price fixed</span>
                    </label>
                    <HelpCircle className="h-4 w-4 text-gray-400" />
                  </div>
                </div>

                {/* Price Notes - Full Width */}
                <div className="md:col-span-3 space-y-2">
                  <label className="block font-medium text-gray-700">*Price notes:</label>
                  <textarea
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                    name="product_price_note"
                    value={newProductPriceState.product_price_note}
                    onChange={handleNewPriceInputChange}
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Additional Details */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h2 className="text-lg font-bold text-gray-700 mb-4">Additional Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block font-semibold text-gray-700">
                  *Actual Size (M<sup>2</sup>/LENGTH):
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="product_actual_size"
                  value={productState.product_actual_size}
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
                  value={productState.product_next_available_stock_date}
                  onChange={handleProductInputChange}
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="block font-semibold text-gray-700">Product notes:</label>
                <textarea
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                  name="product_note"
                  value={productState.product_note}
                  onChange={handleProductInputChange}
                  required
                />
              </div>
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
              CONFIRM UPDATE
            </button>
          </div>
        </form>
      </div>
    </div>
  ) : (
    <UnauthenticatedSkeleton />
  )
}

export default UpdateProductForm

// // Import modules
// import { useEffect, useState } from 'react';
// import { useNavigate, useLocation, useParams } from 'react-router-dom';
// import { useDispatch, useSelector } from 'react-redux';
 
// import { useAddProductPrice } from '../../hooks/useAddProductPrice'; 
// import { useUpdateProduct } from '../../hooks/useUpdateProduct'; 
// import { useFetchAliasesByProductType } from '../../hooks/useFetchAliasesByProductType'
// import { setProjectState } from '../../redux/projectSlice';
// import { setProductState } from '../../redux/productSlice';
// import { setProductPrice } from '../../redux/productPriceSlice';
// import EmployeePageSkeleton from "../../pages/loaders/EmployeePageSkeleton"
// import EmployeeDetailsSkeleton from "../loaders/EmployeeDetailsSkeleton";
// import UnauthenticatedSkeleton from "../loaders/UnauthenticateSkeleton";
// import SessionExpired from '../../components/SessionExpired';

// const UpdateProductForm = () => {
//     // Component router
//     const navigate = useNavigate();
//     const {id, productId} = useParams();

//     // Component hook
//     const dispatch = useDispatch();
//     const { fetchAliasesByProductType, productTypeIsLoadingState, productTypeErrorState } = useFetchAliasesByProductType();
//     const { updateProduct, productUpdateIsLoadingState, productUpdateErrorState } = useUpdateProduct();
//     const { addPrice, isAddPriceLoadingState, addPriceErrorState } = useAddProductPrice();

//     // Component state
//     const aliasState = useSelector((state) => state.aliasReducer.aliasState)
//     const projectState = useSelector((state) => state.projectReducer.projectState)
//     const productState = useSelector((state) => state.productReducer.productState)
//     const productPriceState = useSelector((state) => state.productPriceReducer.productPriceState)
//     const [isLoadingState, setIsLoadingState] = useState(true);
//     const [errorState, setErrorState] = useState(null);
//     const [isDisabled, setIsDisabled] = useState(true);
//     const [isProductPriceDisabled, setIsProductPriceDisabled] = useState(true);
//     const [isDropdownOpen, setIsDropdownOpen] = useState(false);
//     const [isDropdownOpenNewPrice, setIsDropdownOpenNewPrice] = useState(false);
//     const [isEditAlias, setIsEditAlias] = useState(false);
//     const [isChangeAlias, setIsChangeAlias] = useState(false);
//     const [isShowNewPriceForm, setIsShowNewPriceForm] = useState(false);
//     const [defaultProductType, setDefaultProductType] = useState('');
//     const [defaultAlias, setDefaultAlias] = useState('');
//     const [defaultProductPrice, setDefaultProductPrice] = useState({})
//     const [newProductPriceState, setNewProductPriceState] = useState({
//         product_obj_ref: productId,
//         product_unit_a: '',
//         product_number_a: '',
//         product_price_unit_a: 0,
//         product_unit_b: '',
//         product_number_b: 0,
//         product_price_unit_b: 0,
//         product_price_note: '',
//         price_fixed: false,
//         product_effective_date: '',
//         projects: []
//     })
//     const [productTypeState, setProductTypeState] = useState([]);

//     // Component functions and variables
//     const localUser = JSON.parse(localStorage.getItem('localUser'))

//     const handleBackClick = () => navigate(-1);

//     const handleAbortNewPrice = () => {
//         setIsShowNewPriceForm(!isShowNewPriceForm)
//         setNewProductPriceState({
//             product_obj_ref: productId,
//             product_unit_a: '',
//             product_number_a: '',
//             product_price_unit_a: 0,
//             product_unit_b: '',
//             product_number_b: 0,
//             product_price_unit_b: 0,
//             price_fixed: false,
//             product_effective_date: '',
//             projects: []
//         })
//     }

//     const handleCreateNewPrice = () => {
//         setIsShowNewPriceForm(!isShowNewPriceForm)
//         if (Object.values(defaultProductPrice).length === 0) {
//             setDefaultProductPrice(productPriceState)
//         }
//     }

//     const handleEditProductPrice = () => {
//         setIsProductPriceDisabled(!isProductPriceDisabled)
//         if (Object.values(defaultProductPrice).length === 0) {
//             setDefaultProductPrice(productPriceState)
//         }
//     }

//     const changeAlias = () => {
//         setIsChangeAlias(!isChangeAlias)
//         if (defaultProductType === '') {
//             setDefaultProductType(productState.product_type)
//             setDefaultAlias(productState.alias_name)
//             fetchAliasesByProductType(productState.product_type)
//             setIsDisabled(false);
//         }
//         else {
//             fetchAliasesByProductType(defaultProductType)
//         }
//         dispatch(setProductState({...productState, product_type: defaultProductType, alias_name: defaultAlias}))
//         setIsDisabled(false);
//     }

//     const handleNewPriceInputChange = (event) => {
//         const { name, value } = event.target;
        
//         setNewProductPriceState((prevState) => ({
//             ...prevState,
//             [name]: value
//         }))
//     };

//     const handleProductInputChange = (event) => {
//         const { name, value } = event.target;
//         if (name === 'product_type'){
//             if (value !== ''){
//                 fetchAliasesByProductType(value)
//             }
//         }
//         dispatch(setProductState({
//             ...productState,
//             [name]: value,
//         }));
//     };

//     const handlePriceInputChange = (event) => {
//         const { name, value } = event.target;
        
//         dispatch(setProductPrice({
//             ...productPriceState,
//             [name]: value,
//         }));
//     };

//     const handleCheckboxChange = (event) => {
//         const { value, checked } = event.target;
//         let updatedProjects;
//         if (checked) {
//             updatedProjects = [...productPriceState.projects, value];
//         } else {
//             updatedProjects = productPriceState.projects.filter(projectId => projectId !== value);
//         }
//         dispatch(setProductPrice({...productPriceState, projects: updatedProjects}));
//     };

//     const handleCheckboxChangeNewPrice = (event) => {
//         const { value, checked } = event.target;
//         setNewProductPriceState((prevState) => {
//             const updatedProjects = checked
//                 ? [...prevState.projects, value]
//                 : prevState.projects.filter(projectId => projectId !== value);
//             return { ...prevState, projects: updatedProjects };
//         });
//     };

//     const handleSubmit = async (event) => {
//         event.preventDefault();

//         if (!productPriceState.projects.length > 0){
//             alert(`You must select one or more projects that this new product applies to`)
//             return;
//         }
//         if (!newProductPriceState.projects.length > 0 && isShowNewPriceForm === true){
//             alert(`You must select one or more projects that this new product applies to`)
//             return;
//         }

//         if (newProductPriceState.product_number_a !== '' && isShowNewPriceForm === true) {
//             addPrice(newProductPriceState);
//         }

//         updateProduct(productState, productPriceState, productId, productPriceState._id);
//     };
    

//     // Fetch projects
//     useEffect(() => {
//         const abortController = new AbortController();
//         const signal = abortController.signal;

//         const fetchProjects = async () => {
//             setIsLoadingState(true); // Set loading state to true at the beginning
//             try {
//                 const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/project`, { signal , credentials: 'include',
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
                
//                 setIsLoadingState(false);
//                 dispatch(setProjectState(data));
//                 setErrorState(null);
//             } catch (error) {
//                 if (error.name === 'AbortError') {
//                     // do nothing
//                 } else {
//                     setIsLoadingState(false);
//                     setErrorState(error.message);
//                 }
//             }
//         };

//         fetchProjects();

//         return () => {
//             abortController.abort(); // Cleanup
//         };
//     }, [dispatch]);

//     // Fetch product types
//     useEffect(() => {
//         const abortController = new AbortController();
//         const signal = abortController.signal;

//         const fetchProductTypes = async () => {
//             setIsLoadingState(true); // Set loading state to true at the beginning
//             try {
//                 const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/product-type`, { signal , credentials: 'include',
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
                
//                 setIsLoadingState(false);
//                 setProductTypeState(data);
//                 setErrorState(null);
//             } catch (error) {
//                 if (error.name === 'AbortError') {
//                     // do nothing
//                 } else {
//                     setIsLoadingState(false);
//                     setErrorState(error.message);
//                 }
//             }
//         };

//         fetchProductTypes();

//         return () => {
//             abortController.abort(); // Cleanup
//         };
//     }, []);

//     // Fetch product details
//     useEffect(() => {
//         const fetchProductDetails = async () => {
//             try {
//                 const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/supplier/${id}/products/${productId}`, { credentials: 'include',
//                     headers: {
//                         'Content-Type': 'application/json',
//                         'Authorization': `Bearer ${sessionStorage.getItem('jwt')}` // Include token in Authorization header
//                     }});
//                 if (!res.ok) {
//                     throw new Error('Failed to fetch product details');
//                 }
//                 const data = await res.json();

//                 if (data.tokenError) {
//                     throw new Error(data.tokenError);
//                 }

                
//                 // Convert the MongoDB Date ISO8601 format to (YYYY-MM-DD) JavaScript Date string
//                 if (data && data.length > 0) {
//                     const product = data[0].product || {};
//                     const modifiedProductState = {
//                         ...product,
//                         product_next_available_stock_date: product.product_next_available_stock_date
//                             ? product.product_next_available_stock_date.split('T')[0]
//                             : '', // or 'null' depending on your needs
//                     };
//                     dispatch(setProductState(modifiedProductState));
//                 }
            
//                 // Convert the MongoDB Date ISO8601 format to (YYYY-MM-DD) JavaScript Date string
//                 if (
//                     data &&
//                     data[0].productPrice &&
//                     data[0].productPrice.product_effective_date
//                 ) {
//                     const modifiedProductPriceState = {
//                         ...data[0].productPrice,
//                         product_effective_date: data[0].productPrice.product_effective_date
//                             ? data[0].productPrice.product_effective_date.split('T')[0]
//                             : '', // or 'null' depending on your needs
//                     };
//                     dispatch(setProductPrice(modifiedProductPriceState));
//                 }


//                 setIsLoadingState(false);
//             } catch (err) {
//                 setErrorState(err.message);
//                 setIsLoadingState(false);
//             }
//         };

//         fetchProductDetails();
//     }, [id, productId, dispatch]);

//     // Display DOM
//     if (productTypeIsLoadingState || productUpdateIsLoadingState || isAddPriceLoadingState) {
//         return <EmployeeDetailsSkeleton />;
//     }

//     if (productTypeErrorState || productUpdateErrorState || addPriceErrorState) {
//         if (productUpdateErrorState.includes("Session expired") || productUpdateErrorState.includes("jwt expired") || errorState.includes("jwt malformed")) {
//             return <div><SessionExpired /></div>;
//         }
//         return <div>Error: {productUpdateErrorState}</div>;
//     }

//     if (isLoadingState) { return (<EmployeePageSkeleton />); }

//     if (errorState) {
//         if(errorState.includes("Session expired") || errorState.includes("jwt expired") || errorState.includes("jwt malformed")){
//             return(<div><SessionExpired /></div>)
//         }
//         return (<div>Error: {errorState}</div>);
//     }

//     return (
//         localUser && Object.keys(localUser).length > 0 && productState ? (
//         <div className="container mt-2 sm:mt-5"> 
//             <div className="card">
//                 <div className="card-header bg-dark text-white flex justify-between items-center">
//                     <button onClick={handleBackClick}>
//                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-7 w-12 border-transparent bg-gray-700 rounded-md p-1 hover:bg-gray-500 hover:scale-95 ease-out duration-300">
//                             <path strokeLinecap="round" strokeLinejoin="round" d="m18.75 4.5-7.5 7.5 7.5 7.5m-6-15L5.25 12l7.5 7.5"/>
//                         </svg>
//                     </button>
//                     <h1 className='mx-auto uppercase font-bold text-base'>EDIT PRODUCT</h1>
//                 </div>
//                 <form  onKeyDown={(e) => { if (e.key === 'Enter') {e.preventDefault();} }} className="card-body" onSubmit={handleSubmit}>
//                     <div className="row">
//                         {/* PRODUCT TABLE */}
//                         <div className="col-md-6 mb-0 sm:mb-3">
//                             <label className="form-label font-bold text-xs sm:text-base mb-1 sm:mb-2">*Product SKU:</label>
//                             <input 
//                                 type='text'
//                                 className="form-control text-xs sm:text-base" 
//                                 name="product_sku" 
//                                 value={productState.product_sku} 
//                                 onChange={handleProductInputChange}
//                                 required
//                                 onInvalid={(e) => e.target.setCustomValidity('Enter SKU')}
//                                 onInput={(e) => e.target.setCustomValidity('')}
//                             />
//                             <label className='hidden sm:inline-block text-xs italic text-gray-400'>Ex: 13RE1236</label>
//                         </div>
//                         <div className="col-md-6 mb-0 sm:mb-3">
//                             <label className="form-label font-bold text-xs sm:text-base mb-1 sm:mb-2">*Name:</label>
//                             <input 
//                                 type='text'
//                                 className="form-control text-xs sm:text-base" 
//                                 name="product_name" 
//                                 value={productState.product_name} 
//                                 onChange={handleProductInputChange}
//                                 required
//                                 onInvalid={(e) => e.target.setCustomValidity('Enter product name')}
//                                 onInput={(e) => e.target.setCustomValidity('')}
//                             />
//                             <label className='hidden sm:inline-block text-xs italic text-gray-400'>Ex: 16mm SHEETROCK 1200mm x 3600mm</label>
//                         </div>
//                         <div className="col-md-6 mb-0 sm:mb-3">
//                             <label className="form-label font-bold text-xs sm:text-base mb-1 sm:mb-2">*Type:</label>
//                             <select 
//                                 className="form-control text-xs sm:text-base shadow-sm cursor-pointer"
//                                 name="product_type" 
//                                 value={productState.product_type} 
//                                 onChange={handleProductInputChange}
//                                 required
//                                 disabled={!isChangeAlias}
//                             >                                
//                                 <option value="" disabled>Select Product Type</option>
//                                 {productTypeState.filter(type => !type.type_isarchived).map(type => (
//                                     <>
//                                     <option value={type._id}>{type.type_name}</option>
//                                     </>
//                                 ))}
//                             </select>
//                             <label className='hidden sm:inline-block text-xs italic text-gray-400'>Alias is based on the product type you select</label>
//                         </div>
//                         {/***************************** ALIAS TABLE *************************/}
//                         <div className="col-md-6 mb-0 sm:mb-3">
//                             <label className="form-label font-bold text-xs sm:text-base mb-1 sm:mb-2">*Alias:</label>
//                             { !isEditAlias && !isChangeAlias && <div>
//                                 <input 
//                                     type='text'
//                                     className="form-control text-xs sm:text-base" 
//                                     name="alias_name" 
//                                     value={productState.alias_name} 
//                                     disabled
//                                 />
//                                 <label className='text-xs italic text-gray-400'><span className="text-blue-600 size-5 cursor-pointer underline" onClick={changeAlias}>Change</span> alias</label>
//                             </div>}
//                             { isChangeAlias && !isEditAlias && <div>
//                                 <select 
//                                     className="form-control text-xs sm:text-base shadow-sm cursor-pointer"
//                                     name="alias"
//                                     onChange={handleProductInputChange}
//                                     disabled={isDisabled}
//                                     required
//                                 >
//                                     <option value="">Select Alias</option>
//                                     {aliasState && aliasState.length > 0 && 
//                                         Array.from(new Set(aliasState.map(product => product.alias ? product.alias._id : null)))
//                                             .filter(aliasId => aliasId !== null)
//                                             .map((aliasId, index) => {
//                                                 const alias = aliasState.find(product => product.alias && product.alias._id === aliasId).alias;
//                                                 return <option key={index} value={aliasId}>{alias.alias_name}</option>;
//                                             })
//                                     }
//                                 </select>
//                                 <label className='text-xs italic text-gray-400'>Don't want to change alias? <span className="text-blue-600 size-5 cursor-pointer underline" onClick={changeAlias}>Cancel</span></label>
//                             </div>}
//                         </div>
//                         {/***************************** ALIAS TABLE END *************************/}

//                         {/***************************** PRODUCT PRICE TABLE *************************/}
//                                     {/* Editing Price */}
//                         <div className={`grid grid-cols-1 sm:grid-cols-3 gap-x-1 sm:gap-x-10 gap-y-1 sm:gap-y-4 border-4 rounded p-1 sm:p-3 mb-0 sm:mb-1 ${isProductPriceDisabled ? 'opacity-40 cursor-not-allowed' : ''}`}>
//                             <div className='border-2 rounded p-2'>
//                                 <div className="mb-3">
//                                     <label className="form-label font-bold text-xs sm:text-base mb-1 sm:mb-2">*Number-A:</label>
//                                     <input 
//                                         type='number'
//                                         className="form-control text-xs sm:text-base" 
//                                         name="product_number_a" 
//                                         value={productPriceState.product_number_a} 
//                                         onChange={handlePriceInputChange}
//                                         min={0}
//                                         step="0.0001"  // Allows input with up to four decimal places
//                                         required
//                                         onInvalid={(e) => e.target.setCustomValidity('Please input number up to four decimal places')}
//                                         onInput={(e) => e.target.setCustomValidity('')}
//                                         disabled={isProductPriceDisabled}
//                                     />
//                                 </div>
//                                 <div className="mb-3">
//                                     <label className="form-label font-bold text-xs sm:text-base mb-1 sm:mb-2">*Unit-A:</label>
//                                     <input 
//                                         type='text'
//                                         className="form-control text-xs sm:text-base" 
//                                         name="product_unit_a" 
//                                         value={productPriceState.product_unit_a} 
//                                         onChange={handlePriceInputChange}
//                                         required
//                                         onInvalid={(e) => e.target.setCustomValidity('Enter unit-A')}
//                                         onInput={(e) => e.target.setCustomValidity('')}
//                                         disabled={isProductPriceDisabled}
//                                     />
//                                     <label className='hidden sm:inline-block text-xs italic text-gray-400'>Ex: Box, Pack, Carton</label>
//                                 </div>
//                                 <div className="mb-3">
//                                     <label className="form-label font-bold text-xs sm:text-base mb-1 sm:mb-2">*Unit-A Price:</label>
//                                     <div className='flex items-center border rounded'>
//                                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 ml-2">
//                                             <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
//                                         </svg>
//                                         <input 
//                                             type='number'
//                                             className="form-control text-xs sm:text-base flex-1 pl-2 border-0" 
//                                             name="product_price_unit_a" 
//                                             value={productPriceState.product_price_unit_a} 
//                                             onChange={handlePriceInputChange}
//                                             step="0.0001"  // Allows input with up to four decimal places
//                                             min={0}
//                                             required
//                                             onInvalid={(e) => e.target.setCustomValidity('Please input number up to four decimal places')}
//                                             onInput={(e) => e.target.setCustomValidity('')}
//                                             disabled={isProductPriceDisabled}
//                                         />
//                                     </div>
//                                 </div>
//                             </div>
//                             <div className='border-2 rounded p-2'>
//                                 <div className="mb-3">
//                                     <label className="form-label font-bold text-xs sm:text-base mb-1 sm:mb-2">*Number-B:</label>
//                                     <input 
//                                         type='number'
//                                         className="form-control text-xs sm:text-base" 
//                                         name="product_number_b" 
//                                         value={productPriceState.product_number_b} 
//                                         onChange={handlePriceInputChange}
//                                         step="0.0001"  // Allows input with up to four decimal places
//                                         min={0}
//                                         required
//                                         onInvalid={(e) => e.target.setCustomValidity('Please input number up to four decimal places')}
//                                         onInput={(e) => e.target.setCustomValidity('')}
//                                         disabled={isProductPriceDisabled}
//                                     />
//                                 </div>
//                                 <div className="mb-3">
//                                     <label className="form-label font-bold text-xs sm:text-base mb-1 sm:mb-2">*Unit-B:</label>
//                                     <input 
//                                         type='text'
//                                         className="form-control text-xs sm:text-base" 
//                                         name="product_unit_b" 
//                                         value={productPriceState.product_unit_b} 
//                                         onChange={handlePriceInputChange}
//                                         required
//                                         onInvalid={(e) => e.target.setCustomValidity('Enter unit-B')}
//                                         onInput={(e) => e.target.setCustomValidity('')}
//                                         disabled={isProductPriceDisabled}
//                                     />
//                                     <label className='hidden sm:inline-block text-xs italic text-gray-400'>Ex: units, length, each, sheet</label>
//                                 </div>
//                                 <div className="mb-3">
//                                     <label className="form-label font-bold text-xs sm:text-base mb-1 sm:mb-2">*Unit-B Price:</label>
//                                     <div className='flex items-center border rounded'>
//                                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 ml-2">
//                                             <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
//                                         </svg>
//                                         <input 
//                                             type='number'
//                                             className="form-control text-xs sm:text-base flex-1 pl-2 border-0" 
//                                             name="product_price_unit_b" 
//                                             value={productPriceState.product_price_unit_b} 
//                                             onChange={handlePriceInputChange}
//                                             step="0.0001"  // Allows input with up to four decimal places
//                                             min={0}
//                                             required
//                                             onInvalid={(e) => e.target.setCustomValidity('Please input number up to four decimal places')}
//                                             onInput={(e) => e.target.setCustomValidity('')}
//                                             disabled={isProductPriceDisabled}
//                                         />
//                                     </div>
//                                 </div>
//                             </div>
//                             {/* **** PROJECT DROPDOWN START **** */}
//                             <div>
//                                 <label className="block font-bold mb-2">*Project:</label>
//                                 <div>
//                                     <button
//                                         type="button"
//                                         className="sm:text-base text-xs w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-left focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                         onClick={() => setIsDropdownOpen(!isDropdownOpen)}
//                                         disabled={isProductPriceDisabled}
//                                     >
//                                         {productPriceState.projects.length > 0 ? `x${productPriceState.projects.length} Projects Selected` : `Select Projects`}
//                                     </button>
//                                     {isDropdownOpen && (
//                                         <div className="text-xs sm:text-base relative z-10 mt-2 w-full bg-white border border-gray-300 rounded-md shadow-md max-h-60 overflow-auto" onMouseLeave={() => setIsDropdownOpen(false)}>
//                                             <ul className="py-1">
//                                                 {projectState && projectState.length > 0 && projectState.map((project, index) => (
//                                                     <li key={index} className="flex items-center px-4 py-2 hover:bg-gray-100">
//                                                         <input
//                                                             type="checkbox"
//                                                             id={`project-${project._id}`}
//                                                             value={project._id}
//                                                             checked={productPriceState.projects.includes(project._id)}
//                                                             onChange={handleCheckboxChange}
//                                                             className="mr-2"
//                                                             required
//                                                             onInvalid={(e) => e.target.setCustomValidity('You must select one or more project applied to this product')}
//                                                             onInput={(e) => e.target.setCustomValidity('')}
//                                                         />
//                                                         <label htmlFor={`project-${project._id}`} className="text-gray-900">{project.project_name}</label>
//                                                     </li>
//                                                 ))}
//                                             </ul>
//                                         </div>
//                                     )}
//                                 </div>
//                                 <p className='hidden sm:inline-block text-xs italic text-gray-400 mt-2'>Select one or more projects that this new product applies to</p>
//                             </div>
//                             {/* **** PROJECT DROPDOWN END **** */}

//                             {/* **** PRICE FIXED? ************ */}
//                             <div>
//                                 <label className="form-label font-bold text-xs sm:text-base mb-1 sm:mb-2">Price effective date:</label>
//                                 <input 
//                                     type='date'
//                                     className="form-control text-xs sm:text-base" 
//                                     name="product_effective_date" 
//                                     value={productPriceState.product_effective_date}
//                                     onChange={handlePriceInputChange}
//                                     required
//                                     disabled={isProductPriceDisabled}
//                                 />
//                             </div>
//                             <div>
//                                 <label className="form-label font-bold text-xs sm:text-base mb-1 sm:mb-2">*Price actual price/rate:</label>
//                                 <input 
//                                     type='number'
//                                     className="form-control text-xs sm:text-base" 
//                                     name="product_actual_rate" 
//                                     value={productPriceState.product_actual_rate}
//                                     onChange={handlePriceInputChange}
//                                     required
//                                     disabled={isProductPriceDisabled}
//                                 />
//                             </div>
//                             <div>
//                                 <label className="form-label font-bold text-xs sm:text-base mb-1 sm:mb-2">Price fixed(?):</label>
//                                 <input 
//                                         type="checkbox"
//                                         className="form-check-input m-1" 
//                                         name="price_fixed" 
//                                         checked={productPriceState.price_fixed} 
//                                         onChange={(e) => handlePriceInputChange({ target: { name: 'price_fixed', value: e.target.checked }})}
//                                         disabled={isProductPriceDisabled}
//                                     />
//                             </div>
//                             <div className='col-span-3'>
//                                 <label className="form-label font-bold text-xs sm:text-base mb-1 sm:mb-2">*Price notes:</label>
//                                 <textarea
//                                     className="form-control text-xs sm:text-base" 
//                                     name="product_price_note"
//                                     value={productPriceState.product_price_note}
//                                     onChange={handlePriceInputChange}
//                                     disabled={isProductPriceDisabled}
//                                 />
//                             </div>
//                         </div>
//                                     {/* Creating New Price */}
//                         {isShowNewPriceForm && 
//                         <div className='grid grid-cols-1 sm:grid-cols-3 gap-x-1 sm:gap-x-10 gap-y-1 sm:gap-y-4 border-4 rounded p-1 sm:p-3 mb-0 sm:mb-1'>
//                             <div className='border-2 rounded p-2'>
//                                 <div className="mb-3">
//                                     <label className="form-label font-bold text-xs sm:text-base mb-1 sm:mb-2">*Number-A:</label>
//                                     <input 
//                                         type='number'
//                                         className="form-control text-xs sm:text-base" 
//                                         name="product_number_a" 
//                                         value={newProductPriceState.product_number_a} 
//                                         onChange={handleNewPriceInputChange}
//                                         min={0}
//                                         step="0.0001"  // Allows input with up to four decimal places
//                                         required
//                                         onInvalid={(e) => e.target.setCustomValidity('Please input number up to four decimal places')}
//                                         onInput={(e) => e.target.setCustomValidity('')}
//                                     />
//                                 </div>
//                                 <div className="mb-3">
//                                     <label className="form-label font-bold text-xs sm:text-base mb-1 sm:mb-2">*Unit-A:</label>
//                                     <input 
//                                         type='text'
//                                         className="form-control text-xs sm:text-base" 
//                                         name="product_unit_a" 
//                                         value={newProductPriceState.product_unit_a} 
//                                         onChange={handleNewPriceInputChange}
//                                         required
//                                         onInvalid={(e) => e.target.setCustomValidity('Enter unit-A')}
//                                         onInput={(e) => e.target.setCustomValidity('')}
//                                     />
//                                     <label className='hidden sm:inline-block text-xs italic text-gray-400'>Ex: Box, Pack, Carton</label>
//                                 </div>
//                                 <div className="mb-3">
//                                     <label className="form-label font-bold text-xs sm:text-base mb-1 sm:mb-2">*Unit-A Price:</label>
//                                     <div className='flex items-center border rounded'>
//                                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 ml-2">
//                                             <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
//                                         </svg>
//                                         <input 
//                                             type='number'
//                                             className="form-control text-xs sm:text-base flex-1 pl-2 border-0" 
//                                             name="product_price_unit_a" 
//                                             value={newProductPriceState.product_price_unit_a} 
//                                             onChange={handleNewPriceInputChange}
//                                             step="0.0001"  // Allows input with up to four decimal places
//                                             min={0}
//                                             required
//                                             onInvalid={(e) => e.target.setCustomValidity('Please input number up to four decimal places')}
//                                             onInput={(e) => e.target.setCustomValidity('')}
//                                         />
//                                     </div>
//                                 </div>
//                             </div>
//                             <div className='border-2 rounded p-2'>
//                                 <div className="mb-3">
//                                     <label className="form-label font-bold text-xs sm:text-base mb-1 sm:mb-2">*Number-B:</label>
//                                     <input 
//                                         type='number'
//                                         className="form-control text-xs sm:text-base" 
//                                         name="product_number_b" 
//                                         value={newProductPriceState.product_number_b} 
//                                         onChange={handleNewPriceInputChange}
//                                         step="0.0001"  // Allows input with up to four decimal places
//                                         min={0}
//                                         required
//                                         onInvalid={(e) => e.target.setCustomValidity('Please input number up to four decimal places')}
//                                         onInput={(e) => e.target.setCustomValidity('')}
//                                     />
//                                 </div>
//                                 <div className="mb-3">
//                                     <label className="form-label font-bold text-xs sm:text-base mb-1 sm:mb-2">*Unit-B:</label>
//                                     <input 
//                                         type='text'
//                                         className="form-control text-xs sm:text-base" 
//                                         name="product_unit_b" 
//                                         value={newProductPriceState.product_unit_b} 
//                                         onChange={handleNewPriceInputChange}
//                                         required
//                                         onInvalid={(e) => e.target.setCustomValidity('Enter unit-B')}
//                                         onInput={(e) => e.target.setCustomValidity('')}
//                                     />
//                                     <label className='hidden sm:inline-block text-xs italic text-gray-400'>Ex: units, length, each, sheet</label>
//                                 </div>
//                                 <div className="mb-3">
//                                     <label className="form-label font-bold text-xs sm:text-base mb-1 sm:mb-2">*Unit-B Price:</label>
//                                     <div className='flex items-center border rounded'>
//                                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 ml-2">
//                                             <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
//                                         </svg>
//                                         <input 
//                                             type='number'
//                                             className="form-control text-xs sm:text-base flex-1 pl-2 border-0" 
//                                             name="product_price_unit_b" 
//                                             value={newProductPriceState.product_price_unit_b} 
//                                             onChange={handleNewPriceInputChange}
//                                             step="0.0001"  // Allows input with up to four decimal places
//                                             min={0}
//                                             required
//                                             onInvalid={(e) => e.target.setCustomValidity('Please input number up to four decimal places')}
//                                             onInput={(e) => e.target.setCustomValidity('')}
//                                         />
//                                     </div>
//                                 </div>
//                             </div>
//                             {/* **** PROJECT DROPDOWN START **** */}
//                             <div>
//                                 <label className="block font-bold mb-2">*Project:</label>
//                                 <div>
//                                     <button
//                                         type="button"
//                                         className="sm:text-base text-xs w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-left focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                         onClick={() => setIsDropdownOpenNewPrice(!isDropdownOpenNewPrice)}
//                                     >
//                                         {newProductPriceState.projects.length > 0 ? `x${newProductPriceState.projects.length} Projects Selected` : `Select Projects`}
//                                     </button>
//                                     {isDropdownOpenNewPrice && (
//                                         <div className="text-xs sm:text-base relative z-10 mt-2 w-full bg-white border border-gray-300 rounded-md shadow-md max-h-60 overflow-auto" onMouseLeave={() => setIsDropdownOpenNewPrice(false)}>
//                                             <ul className="py-1">
//                                                 {projectState && projectState.length > 0 && projectState.map((project, index) => (
//                                                     <li key={index} className="flex items-center px-4 py-2 hover:bg-gray-100">
//                                                         <input
//                                                             type="checkbox"
//                                                             id={`project-${project._id}`}
//                                                             value={project._id}
//                                                             checked={newProductPriceState.projects.includes(project._id)}
//                                                             onChange={handleCheckboxChangeNewPrice}
//                                                             className="mr-2"
//                                                             required
//                                                             onInvalid={(e) => e.target.setCustomValidity('You must select one or more project applied to this product')}
//                                                             onInput={(e) => e.target.setCustomValidity('')}
//                                                         />
//                                                         <label htmlFor={`project-${project._id}`} className="text-gray-900">{project.project_name}</label>
//                                                     </li>
//                                                 ))}
//                                             </ul>
//                                         </div>
//                                     )}
//                                 </div>
//                                 <p className='hidden sm:inline-block text-xs italic text-gray-400 mt-2'>Select one or more projects that this new product applies to</p>
//                             </div>
//                             {/* **** PRICE EFFECTIVE DATE **** */}
//                             <div>
//                                 <label className="form-label font-bold text-xs sm:text-base mb-1 sm:mb-2">Price effective date:</label>
//                                 <input 
//                                     type='date'
//                                     className="form-control text-xs sm:text-base" 
//                                     name="product_effective_date" 
//                                     value={newProductPriceState.product_effective_date}
//                                     onChange={handleNewPriceInputChange}
//                                     required
//                                 />
//                             </div>
//                             <div>
//                                 <label className="form-label font-bold text-xs sm:text-base mb-1 sm:mb-2">*Price actual price/rate:</label>
//                                 <input 
//                                     type='number'
//                                     className="form-control text-xs sm:text-base" 
//                                     name="product_actual_rate" 
//                                     value={newProductPriceState.product_actual_rate}
//                                     onChange={handleNewPriceInputChange}
//                                     required
//                                 />
//                             </div>
//                             {/* **** PRICE FIXED (?) **** */}
//                             <div>
//                                 <label className="form-label font-bold text-xs sm:text-base mb-1 sm:mb-2">Price fixed(?):</label>
//                                 <input 
//                                     type="checkbox"
//                                     className="form-check-input m-1" 
//                                     name="price_fixed" 
//                                     checked={newProductPriceState.price_fixed} 
//                                     onChange={(e) => handleNewPriceInputChange({ target: { name: 'price_fixed', value: e.target.checked }})}
//                                 />
//                             </div>
//                             <div className='col-span-3'>
//                                 <label className="form-label font-bold text-xs sm:text-base mb-1 sm:mb-2">*Price notes:</label>
//                                 <textarea
//                                     className="form-control text-xs sm:text-base" 
//                                     name="product_price_note"
//                                     value={newProductPriceState.product_price_note}
//                                     onChange={handleNewPriceInputChange}
//                                     required
//                                 />
//                             </div>
//                         </div>
//                         }
//                         {isProductPriceDisabled && !isShowNewPriceForm &&
//                             <div className='sm:grid sm:grid-cols-3'>
//                                 <label className='sm:col-start-2 text-center text-xs italic text-gray-400 mb-2'>
//                                     <span className="text-blue-600 size-5 cursor-pointer underline" onClick={handleEditProductPrice}>Edit</span> existing version of price or <span className="text-blue-600 size-5 cursor-pointer underline" onClick={handleCreateNewPrice}>Create</span> a new version of price for this product?
//                                 </label>
//                             </div>
//                         }
//                         {!isProductPriceDisabled &&
//                             <div className='sm:grid sm:grid-cols-3'>
//                                 <label className='sm:col-start-2 text-center text-xs italic text-gray-400 mb-2'>
//                                     <span className="text-blue-600 size-5 cursor-pointer underline" onClick={() => {setIsProductPriceDisabled(!isProductPriceDisabled); dispatch(setProductPrice(defaultProductPrice));}}>Reset</span> to original
//                                 </label>
//                             </div>
//                         }
//                         {isShowNewPriceForm &&
//                             <div className='sm:grid sm:grid-cols-3'>
//                                 <label className='sm:col-start-2 text-center text-xs italic text-gray-400 mb-2'>
//                                     <span className="text-blue-600 size-5 cursor-pointer underline" onClick={handleAbortNewPrice} >Abort</span> creating new price and reset to original
//                                 </label>
//                             </div>
//                         }
                        
//                         {/* ********************************************* PRODUCT PRICE END *********************************************** */}
//                         <div className='grid grid-cols-2 gap-x-4'>
//                             <div className="mb-0 sm:mb-3">
//                                 <label className="form-label font-bold text-xs sm:text-base mb-1 sm:mb-2">*Actual Size (M<span className='text-xs align-top'>2</span>/LENGTH):</label>
//                                 <input 
//                                     type='number'
//                                     className="form-control text-xs sm:text-base" 
//                                     name="product_actual_size" 
//                                     value={productState.product_actual_size} 
//                                     onChange={handleProductInputChange}
//                                     step="0.0001"  // Allows input with up to four decimal places
//                                     min={0}
//                                     required
//                                 />
//                             </div>

//                             <div className="mb-0 sm:mb-3">
//                                 <label className="form-label font-bold text-xs sm:text-base mb-1 sm:mb-2">Next available stock date:</label>
//                                 <input 
//                                     type='date'
//                                     className="form-control text-xs sm:text-base" 
//                                     name="product_next_available_stock_date" 
//                                     value={productState.product_next_available_stock_date}
//                                     onChange={handleProductInputChange}
//                                 />
//                             </div>

//                             <div className="mb-0 sm:mb-3 col-span-2">
//                                 <label className="form-label font-bold text-xs sm:text-base mb-1 sm:mb-2">Product notes:</label>
//                                 <textarea 
//                                     className="form-control text-xs sm:text-base" 
//                                     name="product_note" 
//                                     value={productState.product_note} 
//                                     onChange={handleProductInputChange}
//                                     step="0.0001"  // Allows input with up to four decimal places
//                                     min={0}
//                                     required
//                                 />
//                             </div>
//                         </div>

//                         {/* ******************************************* END OF FORM ********************************************************** */}
//                         <div className="d-flex justify-content-between mb-0 sm:mb-3 mt-2 sm:mt-0">
//                             <button type="button" onClick={handleBackClick} className="btn btn-secondary">CANCEL</button>
//                             <button className="btn btn-primary" type="submit">CONFIRM UPDATE</button>
//                         </div>
//                     </div>
//                 </form>
//             </div>
//         </div> ) : ( <UnauthenticatedSkeleton /> )
//     );
// };

// export default UpdateProductForm;