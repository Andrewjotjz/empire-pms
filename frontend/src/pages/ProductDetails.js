"use client"

//import modules
import { useParams, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import SessionExpired from "../components/SessionExpired"
import EmployeeDetailsSkeleton from "./loaders/EmployeeDetailsSkeleton"
import UnauthenticatedSkeleton from "./loaders/UnauthenticateSkeleton"
import { ChevronDown, Edit, Calendar, DollarSign, Package, Tag } from "lucide-react"

const ProductDetails = () => {
  // Component state declaration - converted from Redux to useState
  const [fetchedOrders, setFetchedOrders] = useState([])
  const [productState, setProductState] = useState([])
  const [isLoadingState, setIsLoadingState] = useState(true)
  const [errorState, setErrorState] = useState(null)
  const [productTypeState, setProductTypeState] = useState([])
  const [selectedPriceId, setSelectedPriceId] = useState(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  // Component router
  const { id: supplierId, productId } = useParams()
  const navigate = useNavigate()

  // Component functions and variables
  const localUser = JSON.parse(localStorage.getItem("localUser"))

  const handlePriceTableClick = (priceId) => {
    setSelectedPriceId(priceId === selectedPriceId ? null : priceId)
  }

  const handleEditProduct = () => {
    // Convert the MongoDB Date ISO8601 format to (YYYY-MM-DD) JavaScript Date string
    if (productState && productState.length > 0) {
      const product = productState[0].product || {}
      const modifiedProductState = {
        ...product,
        product_next_available_stock_date: product.product_next_available_stock_date
          ? product.product_next_available_stock_date.split("T")[0]
          : "", // or 'null' depending on your needs
      }

      // Store in localStorage or pass via navigation state instead of Redux
      localStorage.setItem("editProductState", JSON.stringify(modifiedProductState))
    }

    // Convert the MongoDB Date ISO8601 format to (YYYY-MM-DD) JavaScript Date string
    if (productState && productState[0].productPrice && productState[0].productPrice.product_effective_date) {
      const modifiedProductPriceState = {
        ...productState[0].productPrice,
        product_effective_date: productState[0].productPrice.product_effective_date
          ? productState[0].productPrice.product_effective_date.split("T")[0]
          : "", // or 'null' depending on your needs
      }

      // Store in localStorage instead of Redux
      localStorage.setItem("editProductPriceState", JSON.stringify(modifiedProductPriceState))
    }

    navigate(`/EmpirePMS/supplier/${supplierId}/products/${productId}/edit`, { state: fetchedOrders })
  }

  const handleEditPrice = (priceId) => {
    const targetPriceVersion = productState.find((prod) => prod.productPrice._id === priceId).productPrice

    const modifiedProductPriceState = {
      ...targetPriceVersion,
      product_effective_date: targetPriceVersion.product_effective_date
        ? targetPriceVersion.product_effective_date.split("T")[0]
        : "", // or 'null' depending on your needs
    }

    // Store in localStorage instead of Redux
    localStorage.setItem("editProductPriceState", JSON.stringify(modifiedProductPriceState))

    navigate(`/EmpirePMS/supplier/${supplierId}/products/${productId}/productprice/${priceId}/edit`, { state: fetchedOrders})
  }

  const formatDate = (dateString) => {
    if (dateString === null) {
      return ""
    } else {
      const date = new Date(dateString)
      const options = { day: "2-digit", month: "short", year: "numeric" }
      return date.toLocaleDateString("en-AU", options).toUpperCase().replace(" ", "-").replace(" ", "-")
    }
  }

  // Fetch product details
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/supplier/${supplierId}/products/${productId}`, {
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

        setProductState(data)
        setIsLoadingState(false)
      } catch (err) {
        setErrorState(err.message)
        setIsLoadingState(false)
      }
    }

    fetchProductDetails()
  }, [supplierId, productId])

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

  // Fetch Order details
  useEffect(() => {
      setIsLoadingState(true);
      const fetchPurchaseOrderDetails = async () => {
          try {
              const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/order`, { credentials: 'include',
                  headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${sessionStorage.getItem('jwt')}` // Include token in Authorization header
                  }});
              if (!res.ok) {
                  throw new Error('Failed to fetch purchase orders');
              }
              const data = await res.json();

              if (data.tokenError) {
                  throw new Error(data.tokenError);
              }

              setFetchedOrders(data);

              setIsLoadingState(false);
          } catch (err) {
              setErrorState(err.message);
              setIsLoadingState(false);
          }
      };

      fetchPurchaseOrderDetails();
  }, []);

  //Display DOM
  const productPriceTable =
    Array.isArray(productState) && productState.length > 0 ? (
      <div className="mt-8">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-5 h-5 text-gray-700" />
          <h2 className="text-xl font-bold text-gray-800">Product Prices</h2>
        </div>

        { localUser.employee_roles === "Admin" ? <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-indigo-200 border-b border-indigo-300">
                  <th className="px-3 py-3 text-left text-sm font-semibold text-gray-800 hidden sm:table-cell">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Effective Date
                    </div>
                  </th>
                  <th className="px-3 py-3 text-center text-sm font-semibold text-gray-800">Unit A</th>
                  <th className="px-3 py-3 text-center text-sm font-semibold text-gray-800">Unit B</th>
                  <th className="px-3 py-3 text-center text-sm font-semibold text-gray-800 hidden sm:table-cell">
                    Price Fixed
                  </th>
                  <th className="px-3 py-3 text-center text-sm font-semibold text-gray-800 hidden sm:table-cell">
                    Actual Rate
                  </th>
                  <th className="px-3 py-3 text-center text-sm font-semibold text-gray-800 hidden sm:table-cell">
                    Notes
                  </th>
                  <th className="px-3 py-3 text-center text-sm font-semibold text-gray-800">
                    <div className="flex items-center justify-center gap-2">
                      <Package className="w-4 h-4" />
                      Project
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {productState.map((item, index) => (
                  <tr
                    key={index}
                    onClick={() => handlePriceTableClick(item.productPrice._id)}
                    className={`border-b border-gray-200 cursor-pointer transition-colors duration-150 group ${selectedPriceId === item.productPrice._id ? "bg-gray-200 hover:bg-gray-200" : "hover:bg-gray-50"}`}
                  >
                    <td className="px-3 py-3 text-sm text-gray-700 hidden sm:table-cell">
                      <div className="flex items-center gap-2">
                        {formatDate(item.productPrice.product_effective_date)}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <div className="space-y-1">
                        <div className="flex items-center justify-center gap-2">
                          <span className="font-medium text-gray-800">{item.productPrice.product_number_a}</span>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            {item.productPrice.product_unit_a}
                          </span>
                        </div>
                        <div className="text-md font-bold text-green-600">
                          {new Intl.NumberFormat("en-US", { style: "currency", currency: "AUD" }).format(
                            Math.floor(item.productPrice.product_price_unit_a * 100) / 100,
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <div className="space-y-1">
                        <div className="flex items-center justify-center gap-2">
                          <span className="font-medium text-gray-800">{item.productPrice.product_number_b}</span>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            {item.productPrice.product_unit_b}
                          </span>
                        </div>
                        <div className="text-md font-bold text-green-600">
                          {new Intl.NumberFormat("en-US", { style: "currency", currency: "AUD" }).format(
                            Math.floor(item.productPrice.product_price_unit_b * 100) / 100,
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center hidden sm:table-cell">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          item.productPrice.price_fixed ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {item.productPrice.price_fixed ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center text-sm text-indigo-700 hidden sm:table-cell">
                      <span className="font-semibold bg-indigo-100 px-2 py-1 rounded">
                        ${item.productPrice.product_actual_rate}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center text-sm text-gray-600 hidden sm:table-cell max-w-xs">
                      <div className="truncate" title={item.productPrice?.product_price_note || "None"}>
                        {item.productPrice?.product_price_note || "None"}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center relative">
                      <div className="flex flex-wrap justify-center gap-1">
                        {item.productPrice.project_names.map((project, projectIndex) => (
                          <span
                            key={projectIndex}
                            className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-md border border-blue-200"
                          >
                            <Tag className="w-3 h-3 mr-1" />
                            {project}
                          </span>
                        ))}
                      </div>
                      {selectedPriceId === item.productPrice._id && localUser.employee_roles === "Admin" && (
                        <div className="absolute top-4 right-4 mt-2 z-30">
                          <button
                            className="flex items-center gap-2 border bg-indigo-300 border-indigo-400 shadow-lg px-3 py-2 text-sm rounded-lg hover:bg-indigo-400 hover:border-gray-400 hover:scale-105 transition-all duration-150 whitespace-nowrap"
                            onClick={() => handleEditPrice(selectedPriceId)}
                          >
                            <Edit className="w-4 h-4" />
                            EDIT PRICE
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div> :
        <div>Access denied</div>}
      </div>
    ) : (
      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">Product Price API fetched successfully, but it might be empty...</p>
      </div>
    )

  if (isLoadingState) {
    return <EmployeeDetailsSkeleton />
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
    <div className="max-w-full mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gray-800 text-white px-6 py-2">
          <h1 className="text-lg font-bold">PRODUCT DETAILS</h1>
        </div>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div></div>
            {localUser.employee_roles === "Admin" && (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg font-medium transition-colors duration-150"
                >
                  ACTIONS
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-150 ${dropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    <button
                      onClick={() => {
                        handleEditProduct()
                        setDropdownOpen(false)
                      }}
                      className="w-full flex items-center gap-3 px-3 py-3 text-left hover:bg-gray-50 transition-colors duration-150"
                    >
                      <Edit className="w-4 h-4 text-gray-600" />
                      <span className="text-gray-800">EDIT PRODUCT</span>
                    </button>
                    <button
                      onClick={() => {
                        setDropdownOpen(false)
                      }}
                      className="w-full flex items-center gap-3 px-3 py-3 text-left hover:bg-gray-50 transition-colors duration-150"
                    >
                      <Edit className="w-4 h-4 text-gray-600" />
                      <span className="text-gray-800">PLACEHOLDER</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {Array.isArray(productState) && productState.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">SKU:</label>
                  <p className="text-gray-900 font-mono">{productState[0].product.product_sku}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Type:</label>
                  <p className="text-gray-900">
                    {productTypeState.find((type) => type._id === productState[0].product.product_type)?.type_name ||
                      "Unknown"}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Alias:</label>
                  <p className="text-gray-900">{productState[0].product.alias_name}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Notes:</label>
                  <p className="text-gray-900">{productState[0].product?.product_note || "None"}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Name:</label>
                  <p className="text-gray-900 font-medium">{productState[0].product.product_name}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Actual Size:</label>
                  <p className="text-gray-900">{productState[0].product.product_actual_size}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Next available stock date:</label>
                  <p className="text-gray-900">
                    {productState[0].product.product_next_available_stock_date || "In-stock now"}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">isArchived:</label>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      productState[0].product.product_isarchived
                        ? "bg-red-100 text-red-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {productState[0].product.product_isarchived ? "Yes" : "No"}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-8">
              <p className="text-yellow-800">Product API fetched successfully, but it might be empty...</p>
            </div>
          )}

          {productPriceTable}
        </div>
      </div>
    </div>
  ) : (
    <UnauthenticatedSkeleton />
  )
}

export default ProductDetails


//! Commented this as no longer using react-redux
// "use client"

// //import modules
// import { useParams, useNavigate } from "react-router-dom"
// import { useEffect, useState } from "react"
// import { useSelector, useDispatch } from "react-redux"
// import { setProductState } from "../redux/productSlice"
// import { setProductPrice } from "../redux/productPriceSlice"
// import SessionExpired from "../components/SessionExpired"
// import EmployeeDetailsSkeleton from "./loaders/EmployeeDetailsSkeleton"
// import UnauthenticatedSkeleton from "./loaders/UnauthenticateSkeleton"
// import { ChevronDown, Edit, Calendar, DollarSign, Package, Tag } from "lucide-react"

// const ProductDetails = () => {
//   //Component state declaration
//   const productState = useSelector((state) => state.productReducer.productState)
//   const dispatch = useDispatch()
//   const [isLoadingState, setIsLoadingState] = useState(true)
//   const [errorState, setErrorState] = useState(null)
//   const [productTypeState, setProductTypeState] = useState([])
//   const [selectedPriceId, setSelectedPriceId] = useState(null)
//   const [dropdownOpen, setDropdownOpen] = useState(false)

//   //Component router
//   const { id: supplierId, productId } = useParams()
//   const navigate = useNavigate()

//   //Component functions and variables
//   const localUser = JSON.parse(localStorage.getItem("localUser"))

//   const handlePriceTableClick = (priceId) => {
//     // setSelectedPriceId(priceId);
//     setSelectedPriceId(priceId === selectedPriceId ? null : priceId)
//   }

//   const handleEditProduct = () => {
//     // Convert the MongoDB Date ISO8601 format to (YYYY-MM-DD) JavaScript Date string
//     if (productState && productState.length > 0) {
//       const product = productState[0].product || {}
//       const modifiedProductState = {
//         ...product,
//         product_next_available_stock_date: product.product_next_available_stock_date
//           ? product.product_next_available_stock_date.split("T")[0]
//           : "", // or 'null' depending on your needs
//       }
//       dispatch(setProductState(modifiedProductState))
//     }

//     // Convert the MongoDB Date ISO8601 format to (YYYY-MM-DD) JavaScript Date string
//     if (productState && productState[0].productPrice && productState[0].productPrice.product_effective_date) {
//       const modifiedProductPriceState = {
//         ...productState[0].productPrice,
//         product_effective_date: productState[0].productPrice.product_effective_date
//           ? productState[0].productPrice.product_effective_date.split("T")[0]
//           : "", // or 'null' depending on your needs
//       }
//       dispatch(setProductPrice(modifiedProductPriceState))
//     }

//     navigate(`/EmpirePMS/supplier/${supplierId}/products/${productId}/edit`, { state: productId })
//   }

//   const handleEditPrice = (priceId) => {

//     const targetPriceVersion = productState.find(prod => prod.productPrice._id === priceId).productPrice
     
//     const modifiedProductPriceState = {
//       ...targetPriceVersion,
//       product_effective_date: targetPriceVersion.product_effective_date
//         ? targetPriceVersion.product_effective_date.split("T")[0]
//         : "", // or 'null' depending on your needs
//     }
//     dispatch(setProductPrice(modifiedProductPriceState))
    

//     navigate(`/EmpirePMS/supplier/${supplierId}/productprice/${priceId}/edit`)
//   }

//   const formatDate = (dateString) => {
//     if (dateString === null) {
//       return ""
//     } else {
//       const date = new Date(dateString)
//       const options = { day: "2-digit", month: "short", year: "numeric" }
//       return date.toLocaleDateString("en-AU", options).toUpperCase().replace(" ", "-").replace(" ", "-")
//     }
//   }

//   // Fetch product details
//   useEffect(() => {
//     const fetchProductDetails = async () => {
//       try {
//         const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/supplier/${supplierId}/products/${productId}`, {
//           credentials: "include",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${sessionStorage.getItem("jwt")}`, // Include token in Authorization header
//           },
//         })
//         if (!res.ok) {
//           throw new Error("Failed to fetch product details")
//         }
//         const data = await res.json()

//         if (data.tokenError) {
//           throw new Error(data.tokenError)
//         }

//         dispatch(setProductState(data))
//         setIsLoadingState(false)
//       } catch (err) {
//         setErrorState(err.message)
//         setIsLoadingState(false)
//       }
//     }

//     fetchProductDetails()
//   }, [supplierId, productId, dispatch])

//   // Fetch product types
//   useEffect(() => {
//     const abortController = new AbortController()
//     const signal = abortController.signal

//     const fetchProductTypes = async () => {
//       setIsLoadingState(true) // Set loading state to true at the beginning
//       try {
//         const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/product-type`, {
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
//         setProductTypeState(data)
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

//     fetchProductTypes()

//     return () => {
//       abortController.abort() // Cleanup
//     }
//   }, [])

//   //Display DOM
//   const productPriceTable =
//     Array.isArray(productState) && productState.length > 0 ? (
//       <div className="mt-8">
//         <div className="flex items-center gap-2 mb-4">
//           <DollarSign className="w-5 h-5 text-gray-700" />
//           <h2 className="text-xl font-bold text-gray-800">Product Prices</h2>
//         </div>

//         <div className="bg-white rounded-lg shadow-lg overflow-hidden">
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead>
//                 <tr className="bg-indigo-200 border-b border-indigo-300">
//                   <th className="px-3 py-3 text-left text-sm font-semibold text-gray-800 hidden sm:table-cell">
//                     <div className="flex items-center gap-2">
//                       <Calendar className="w-4 h-4" />
//                       Effective Date
//                     </div>
//                   </th>
//                   <th className="px-3 py-3 text-center text-sm font-semibold text-gray-800">Unit A</th>
//                   <th className="px-3 py-3 text-center text-sm font-semibold text-gray-800">Unit B</th>
//                   <th className="px-3 py-3 text-center text-sm font-semibold text-gray-800 hidden sm:table-cell">
//                     Price Fixed
//                   </th>
//                   <th className="px-3 py-3 text-center text-sm font-semibold text-gray-800 hidden sm:table-cell">
//                     Actual Rate
//                   </th>
//                   <th className="px-3 py-3 text-center text-sm font-semibold text-gray-800 hidden sm:table-cell">
//                     Notes
//                   </th>
//                   <th className="px-3 py-3 text-center text-sm font-semibold text-gray-800">
//                     <div className="flex items-center justify-center gap-2">
//                       <Package className="w-4 h-4" />
//                       Project
//                     </div>
//                   </th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {productState.map((item, index) => (
//                   <tr
//                     key={index}
//                     onClick={() => handlePriceTableClick(item.productPrice._id)}
//                     className={`border-b border-gray-200 cursor-pointer transition-colors duration-150 group ${selectedPriceId === item.productPrice._id ? 'bg-gray-200 hover:bg-gray-200' : 'hover:bg-gray-50'}`}
//                   >
//                     <td className="px-3 py-3 text-sm text-gray-700 hidden sm:table-cell">
//                       <div className="flex items-center gap-2">
//                         {formatDate(item.productPrice.product_effective_date)}
//                       </div>
//                     </td>
//                     <td className="px-3 py-3 text-center">
//                       <div className="space-y-1">
//                         <div className="flex items-center justify-center gap-2">
//                           <span className="font-medium text-gray-800">{item.productPrice.product_number_a}</span>
//                           <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
//                             {item.productPrice.product_unit_a}
//                           </span>
//                         </div>
//                         <div className="text-md font-bold text-green-600">
//                           {new Intl.NumberFormat("en-US", { style: "currency", currency: "AUD" }).format(
//                             Math.floor(item.productPrice.product_price_unit_a * 100) / 100,
//                           )}
//                         </div>
//                       </div>
//                     </td>
//                     <td className="px-3 py-3 text-center">
//                       <div className="space-y-1">
//                         <div className="flex items-center justify-center gap-2">
//                           <span className="font-medium text-gray-800">{item.productPrice.product_number_b}</span>
//                           <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
//                             {item.productPrice.product_unit_b}
//                           </span>
//                         </div>
//                         <div className="text-md font-bold text-green-600">
//                           {new Intl.NumberFormat("en-US", { style: "currency", currency: "AUD" }).format(
//                             Math.floor(item.productPrice.product_price_unit_b * 100) / 100,
//                           )}
//                         </div>
//                       </div>
//                     </td>
//                     <td className="px-3 py-3 text-center hidden sm:table-cell">
//                       <span
//                         className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
//                           item.productPrice.price_fixed ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
//                         }`}
//                       >
//                         {item.productPrice.price_fixed ? "Yes" : "No"}
//                       </span>
//                     </td>
//                     <td className="px-3 py-3 text-center text-sm text-indigo-700 hidden sm:table-cell">
//                       <span className="font-semibold bg-indigo-100 px-2 py-1 rounded">
//                         ${item.productPrice.product_actual_rate}
//                       </span>
//                     </td>
//                     <td className="px-3 py-3 text-center text-sm text-gray-600 hidden sm:table-cell max-w-xs">
//                       <div className="truncate" title={item.productPrice?.product_price_note || "None"}>
//                         {item.productPrice?.product_price_note || "None"}
//                       </div>
//                     </td>
//                     <td className="px-3 py-3 text-center relative">
//                       <div className="flex flex-wrap justify-center gap-1">
//                         {item.productPrice.project_names.map((project, projectIndex) => (
//                           <span
//                             key={projectIndex}
//                             className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-md border border-blue-200"
//                           >
//                             <Tag className="w-3 h-3 mr-1" />
//                             {project}
//                           </span>
//                         ))}
//                       </div>
//                       {selectedPriceId === item.productPrice._id && localUser.employee_roles === "Admin" && (
//                         <div className="absolute top-4 right-4 mt-2 z-30">
//                           <button className="flex items-center gap-2 border bg-indigo-300 border-indigo-400 shadow-lg px-3 py-2 text-sm rounded-lg hover:bg-indigo-400 hover:border-gray-400 hover:scale-105 transition-all duration-150 whitespace-nowrap" onClick={() => handleEditPrice(selectedPriceId)}>
//                             <Edit className="w-4 h-4" />
//                             EDIT PRICE
//                           </button>
//                         </div>
//                       )}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>
//     ) : (
//       <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
//         <p className="text-yellow-800">Product Price API fetched successfully, but it might be empty...</p>
//       </div>
//     )

//   if (isLoadingState) {
//     return <EmployeeDetailsSkeleton />
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
//     <div className="max-w-full mx-auto p-6">
//       <div className="bg-white rounded-lg shadow-lg overflow-hidden">
//         <div className="bg-gray-800 text-white px-6 py-2">
//           <h1 className="text-lg font-bold">PRODUCT DETAILS</h1>
//         </div>
//         <div className="p-6">
//           <div className="flex justify-between items-center mb-6">
//             <div></div>
//             {localUser.employee_roles === "Admin" && (
//               <div className="relative">
//                 <button
//                   onClick={() => setDropdownOpen(!dropdownOpen)}
//                   className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg font-medium transition-colors duration-150"
//                 >
//                   ACTIONS
//                   <ChevronDown
//                     className={`w-4 h-4 transition-transform duration-150 ${dropdownOpen ? "rotate-180" : ""}`}
//                   />
//                 </button>
//                 {dropdownOpen && (
//                   <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
//                     <button
//                       onClick={() => {
//                         handleEditProduct()
//                         setDropdownOpen(false)
//                       }}
//                       className="w-full flex items-center gap-3 px-3 py-3 text-left hover:bg-gray-50 transition-colors duration-150"
//                     >
//                       <Edit className="w-4 h-4 text-gray-600" />
//                       <span className="text-gray-800">EDIT PRODUCT</span>
//                     </button>
//                     <button
//                       onClick={() => {
//                         setDropdownOpen(false)
//                       }}
//                       className="w-full flex items-center gap-3 px-3 py-3 text-left hover:bg-gray-50 transition-colors duration-150"
//                     >
//                       <Edit className="w-4 h-4 text-gray-600" />
//                       <span className="text-gray-800">PLACEHOLDER</span>
//                     </button>
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>

//           {Array.isArray(productState) && productState.length > 0 ? (
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
//               <div className="space-y-4">
//                 <div className="bg-gray-50 p-3 rounded-lg">
//                   <label className="block text-sm font-semibold text-gray-700 mb-1">SKU:</label>
//                   <p className="text-gray-900 font-mono">{productState[0].product.product_sku}</p>
//                 </div>
//                 <div className="bg-gray-50 p-3 rounded-lg">
//                   <label className="block text-sm font-semibold text-gray-700 mb-1">Type:</label>
//                   <p className="text-gray-900">
//                     {productTypeState.find((type) => type._id === productState[0].product.product_type)?.type_name ||
//                       "Unknown"}
//                   </p>
//                 </div>
//                 <div className="bg-gray-50 p-3 rounded-lg">
//                   <label className="block text-sm font-semibold text-gray-700 mb-1">Alias:</label>
//                   <p className="text-gray-900">{productState[0].product.alias_name}</p>
//                 </div>
//                 <div className="bg-gray-50 p-3 rounded-lg">
//                   <label className="block text-sm font-semibold text-gray-700 mb-1">Notes:</label>
//                   <p className="text-gray-900">{productState[0].product?.product_note || "None"}</p>
//                 </div>
//               </div>
//               <div className="space-y-4">
//                 <div className="bg-gray-50 p-3 rounded-lg">
//                   <label className="block text-sm font-semibold text-gray-700 mb-1">Name:</label>
//                   <p className="text-gray-900 font-medium">{productState[0].product.product_name}</p>
//                 </div>
//                 <div className="bg-gray-50 p-3 rounded-lg">
//                   <label className="block text-sm font-semibold text-gray-700 mb-1">Actual Size:</label>
//                   <p className="text-gray-900">{productState[0].product.product_actual_size}</p>
//                 </div>
//                 <div className="bg-gray-50 p-3 rounded-lg">
//                   <label className="block text-sm font-semibold text-gray-700 mb-1">Next available stock date:</label>
//                   <p className="text-gray-900">
//                     {productState[0].product.product_next_available_stock_date || "In-stock now"}
//                   </p>
//                 </div>
//                 <div className="bg-gray-50 p-3 rounded-lg">
//                   <label className="block text-sm font-semibold text-gray-700 mb-1">isArchived:</label>
//                   <span
//                     className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
//                       productState[0].product.product_isarchived
//                         ? "bg-red-100 text-red-800"
//                         : "bg-green-100 text-green-800"
//                     }`}
//                   >
//                     {productState[0].product.product_isarchived ? "Yes" : "No"}
//                   </span>
//                 </div>
//               </div>
//             </div>
//           ) : (
//             <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-8">
//               <p className="text-yellow-800">Product API fetched successfully, but it might be empty...</p>
//             </div>
//           )}

//           {productPriceTable}
//         </div>
//       </div>
//     </div>
//   ) : (
//     <UnauthenticatedSkeleton />
//   )
// }

// export default ProductDetails