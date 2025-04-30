"use client"

// Import modules
import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useUpdateProductType } from "../../hooks/useUpdateProductType"
import { ChevronDown, ChevronUp, Plus, Trash2, X, Tag } from "lucide-react"

import SessionExpired from "../../components/SessionExpired"
import UnauthenticatedSkeleton from "../loaders/UnauthenticateSkeleton"
import LoadingScreen from "../loaders/LoadingScreen"

const UpdateProductTypeForm = () => {
  // router
  const navigate = useNavigate()
  const { id } = useParams()

  // hook
  const { updateProductType, isUpdating, updateError } = useUpdateProductType()

  // state
  const [productTypeState, setProductTypeState] = useState({
    type_name: "",
    type_unit: "",
    type_categories: [
      {
        category_name: "",
        category_unit: "",
        subcategories: [
          {
            subcategory_name: "",
            subcategory_unit: "",
          },
        ],
      },
    ],
  })
  const [productState, setProductState] = useState([])
  const [aliasState, setAliasState] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isFetchError, setFetchError] = useState(null)
  const [isFetchProductsLoading, setFetchProductsLoading] = useState(false)
  const [isFetchProductsError, setFetchProductsError] = useState(null)
  const [openCategories, setOpenCategories] = useState({})
  const [showSuggestions, setShowSuggestions] = useState({
    type: null, // 'category' or 'subcategory'
    catIndex: null,
    subIndex: null,
  })
  const [showMore, setShowMore] = useState(false);

  // functions and variables
  const localUser = JSON.parse(localStorage.getItem("localUser"))

  // Toggle category accordion
  const toggleCategory = (index) => {
    setOpenCategories({
      ...openCategories,
      [index]: !openCategories[index],
    })
  }

  // Handle back click
  const handleBackClick = () => navigate(`/EmpirePMS/product-type`)

  // Handle archive
  const handleArchive = () => {
    setProductTypeState({ ...productTypeState, type_isarchived: !productTypeState.type_isarchived })
    updateProductType(productTypeState, id)
  }

  // Handle changes for type name
  const handleTypeChange = (field, e) => {
    setProductTypeState({ ...productTypeState, [field]: e.target.value })
  }

  // Handle changes for category name
  const handleCategoryChange = (index, field, value) => {
    const updatedCategories = [...productTypeState.type_categories]
    updatedCategories[index][field] = value
    setProductTypeState({ ...productTypeState, type_categories: updatedCategories })
  }

  // Handle changes for subcategory name
  const handleSubcategoryChange = (catIndex, subIndex, field, value) => {
    const updatedCategories = [...productTypeState.type_categories]
    updatedCategories[catIndex].subcategories[subIndex][field] = value
    setProductTypeState({ ...productTypeState, type_categories: updatedCategories })
  }

  // Show suggestions for category or subcategory
  const toggleSuggestions = (type, catIndex, subIndex = null) => {
    if (
      showSuggestions.type === type &&
      showSuggestions.catIndex === catIndex &&
      showSuggestions.subIndex === subIndex
    ) {
      // If clicking the same field, close suggestions
      setShowSuggestions({ type: null, catIndex: null, subIndex: null })
    } else {
      // Otherwise, show suggestions for the clicked field
      setShowSuggestions({ type, catIndex, subIndex })
    }
  }

  // Apply suggestion to category or subcategory
  const applySuggestion = (suggestion) => {
    const { type, catIndex, subIndex } = showSuggestions

    if (type === "category") {
      handleCategoryChange(catIndex, "category_name", suggestion)
    } else if (type === "subcategory") {
      handleSubcategoryChange(catIndex, subIndex, "subcategory_name", suggestion)
    }

    // Close suggestions after applying
    setShowSuggestions({ type: null, catIndex: null, subIndex: null })
  }

  // Add a new category
  const addCategory = () => {
    const newIndex = productTypeState.type_categories.length
    setProductTypeState({
      ...productTypeState,
      type_categories: [
        ...productTypeState.type_categories,
        { category_name: "", category_unit: "", subcategories: [{ subcategory_name: "", subcategory_unit: "" }] },
      ],
    })
    // Open the newly added category
    setOpenCategories({
      ...openCategories,
      [newIndex]: true,
    })
  }

  // Add a new subcategory to a specific category
  const addSubcategory = (catIndex) => {
    const updatedCategories = [...productTypeState.type_categories]
    updatedCategories[catIndex].subcategories.push({ subcategory_name: "", subcategory_unit: "" })
    setProductTypeState({ ...productTypeState, type_categories: updatedCategories })
  }

  // Remove a category
  const removeCategory = (index) => {
    const updatedCategories = productTypeState.type_categories.filter((_, i) => i !== index)
    setProductTypeState({ ...productTypeState, type_categories: updatedCategories })

    // Update open categories state
    const newOpenCategories = { ...openCategories }
    delete newOpenCategories[index]

    // Adjust keys for categories after the deleted one
    Object.keys(newOpenCategories).forEach((key) => {
      const keyNum = Number.parseInt(key)
      if (keyNum > index) {
        newOpenCategories[keyNum - 1] = newOpenCategories[keyNum]
        delete newOpenCategories[keyNum]
      }
    })

    setOpenCategories(newOpenCategories)
  }

  // Remove a subcategory
  const removeSubcategory = (catIndex, subIndex) => {
    const updatedCategories = [...productTypeState.type_categories]
    updatedCategories[catIndex].subcategories = updatedCategories[catIndex].subcategories.filter(
      (_, i) => i !== subIndex,
    )
    setProductTypeState({ ...productTypeState, type_categories: updatedCategories })
  }

  // Remove input with empty string
  const cleanObject = (obj) => {
    if (Array.isArray(obj)) {
      return obj
        .map(cleanObject) // Process each element
        .filter((item) => item && Object.keys(item).length > 0) // Remove empty objects
    } else if (typeof obj === "object" && obj !== null) {
      const cleaned = Object.entries(obj).reduce((acc, [key, value]) => {
        const cleanedValue = cleanObject(value) // Clean nested values
        if (
          cleanedValue !== "" && // Remove empty strings
          (typeof cleanedValue !== "object" || Object.keys(cleanedValue).length > 0) // Remove empty objects
        ) {
          acc[key] = cleanedValue
        }
        return acc
      }, {})
      return cleaned
    }
    return obj // Return primitive values unchanged
  }

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault()

    const cleanedData = cleanObject(productTypeState) // Clean the data by removing empty strings from input

    updateProductType(cleanedData, id)

    setProductTypeState({
      type_name: "",
      type_unit: "",
      type_categories: [
        { category_name: "", category_unit: "", subcategories: [{ subcategory_name: "", subcategory_unit: "" }] },
      ],
    })
  }

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === "Escape") {
        setShowSuggestions({ type: null, catIndex: null, subIndex: null })
      }
    }

    document.addEventListener("keydown", handleEscapeKey)
    return () => {
      document.removeEventListener("keydown", handleEscapeKey)
    }
  }, [])

  // useEffect for fetching product type
  useEffect(() => {
    const abortController = new AbortController()
    const signal = abortController.signal

    const fetchProductType = async () => {
      setIsLoading(true) // Set loading state to true at the beginning
      try {
        const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/product-type/${id}`, {
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

        setIsLoading(false)
        setProductTypeState(data)

        // Initialize open/closed state for categories
        const initialOpenState = {}
        data.type_categories.forEach((_, index) => {
          initialOpenState[index] = index === 0 // Open only the first category by default
        })
        setOpenCategories(initialOpenState)

        setFetchError(null)
      } catch (error) {
        if (error.name === "AbortError") {
          // do nothing
        } else {
          setIsLoading(false)
          setFetchError(error.message)
        }
      }
    }

    fetchProductType()

    return () => {
      abortController.abort() // Cleanup
    }
  }, [id])

  // fetch products by product type
  useEffect(() => {
    const abortController = new AbortController()
    const signal = abortController.signal

    const fetchProducts = async () => {
      setFetchProductsLoading(true)
      try {
        const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/product/type/${id}`, {
          signal,
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("jwt")}`, // Include token in Authorization header
          },
        })
        if (!res.ok) {
          throw new Error("Failed to fetch products")
        }
        const data = await res.json()

        if (data.tokenError) {
          throw new Error(data.tokenError)
        }

        setFetchProductsLoading(false)
        setProductState(data)
        setFetchProductsError(null)
      } catch (error) {
        if (error.name === "AbortError") {
          // do nothing
        } else {
          setFetchProductsLoading(false)
          setFetchProductsError(error.message)
        }
      }
    }

    fetchProducts()

    return () => {
      abortController.abort() // Cleanup
    }
  }, [id])

  // Process product data to extract aliases
  useEffect(() => {
    if (productState.length > 0) {
      // Get the current product type name
      const currentTypeName = productTypeState.type_name || ""

      const aliases = productState
        .map((product) => {
          const aliasName = product.alias?.alias_name ?? ""

          if (!aliasName) return ""

          // Apply specific rules based on product type
          if (currentTypeName === "Plasterboard") {
            // Remove measurement at the end - eg: "1.2x3.6m", "0.6x3.0mm", etc.
            return aliasName.replace(/\b\d+(\.\d+)?x\d+(\.\d+)?m{1,2}\b/gi, "").trim()

          } else if (currentTypeName === "Framing Ceiling") {
            // Remove all measurement-like patterns
            const cleaned = aliasName
              .replace(/^\d+(\.\d+)?mm\s*/i, "")               // Start: remove "16mm", "28mm", etc.
              .replace(/\b\d+(\.\d+)?(mm|m|bmt)\b/gi, "")       // Remove "50mm", "3.6m", "0.7bmt", etc.
              .replace(/\b\d+x\d+mm\b/gi, "")                  // Remove "50x50mm", etc.
              .replace(/\b\d+\s*Deg\b/gi, "")                  // Remove "90 Deg"
              .replace(/\s+/g, " ")                            // Normalize extra spaces
              .trim()
            // Get first two remaining words
            const words = cleaned.split(" ")
            return words.slice(0, 2).join(" ")

          } else if (currentTypeName === "Framing Wall") {
            // Remove measurements at the end - both dimension and length patterns
            return aliasName
              .replace(/\b\d+x\d+mm\b/gi, "") // Remove dimensions like "25x75mm"
              .replace(/\b\d+mm\b/gi, "") // Remove single measurements like "300mm"
              .replace(/\b\d+(\.\d+)?m\b/gi, "") // Remove lengths like "2.4m", "3.0m"
              .trim()

          } else if (currentTypeName === "Batt Insulation") {
            // Remove complex measurements like "1160x580x195mm"
            return aliasName
              .replace(/\b\d+x\d+x\d+mm\b/gi, "")
              .replace(/\b\d+x\d+x\d+\b/gi, "") // Also catch without mm
              .trim()

          } else if (currentTypeName === "External Cladding") {
            // Remove length measurements like "2.4m", "3.6m"
            return aliasName.replace(/\b\d+(\.\d+)?x\d+(\.\d+)?m{1,2}\b/gi, "").trim()

          } else {
            // Default processing for other product types
            
            return aliasName
            // Remove common measurement patterns - CURRENTLY NOT REQUIRED
              // .replace(/\b\d+(\.\d+)?x\d+(\.\d+)?m{1,2}\b/gi, "") // Remove area measurements
              // .replace(/\b\d+(\.\d+)?m\b/gi, "") // Remove length measurements
              // .replace(/\b\d+mm\b/gi, "") // Remove mm measurements
              // .trim()
          }
        })
        .filter((value) => value) // Remove empty values
        .filter((value, index, self) => self.indexOf(value) === index) // Remove duplicates
        .sort() // Sort alphabetically

      setAliasState(aliases)
    }
  }, [productState, productTypeState.type_name]) // Added type_name as dependency


  // if type_name === "Plasterboard"
  // remove measurement at the end - eg: "1.2x3.6m", "0.6x3.0mm", etc.
  // remove empty values
  // remove duplicate
  // sort alphabetically

  // if type_name === "Framing Ceiling"
  // remove measurement at the start - eg: "16mm", "28mm", etc.
  // keep first two words using slice
  // remove empty values
  // remove duplicate
  // sort alphabetically

  // if type_name === "Framing Wall"
  // remove measurement at the end - eg: "25x75mm", "300mm", etc.
  // remove measurement at the end - eg: "2.4m", "2.7m", "3.0m", "3.6m", etc.
  // remove empty values
  // remove duplicate
  // sort alphabetically

  // if type_name === "Batt Insulation"
  // remove measurement at the end - eg: "1160x580x195mm", "1200x450x75mm", "1160x430x250mm", etc.
  // remove empty values
  // remove duplicate
  // sort alphabetically

  // if type_name === "External Cladding"
  // remove measurement at the end - eg: "2.4m", "2.7m", "3.0m", "3.6m", etc.
  // remove empty values
  // remove duplicate
  // sort alphabetically


  // // Remove measurement at the end - eg: "1.2x3.6m", "0.6x3.0mm", etc.
  // const aliasNoMeasurement = aliasName.replace(/\b\d+(\.\d+)?x\d+(\.\d+)?m{1,2}\b/gi, "").trim()

  // // Keep first 2 or 3 words
  // const words = aliasNoMeasurement.split(/\s+/).slice(0, 4).join(" ")

  // component
  if (isFetchError || updateError) {
    if (isFetchError && isFetchError.includes("Session expired")) {
      return (
        <div>
          <SessionExpired />
        </div>
      )
    }

    return (
      <div>
        <p>Error: {isFetchError || updateError}</p>
      </div>
    )
  }

  if (isLoading) {
    return <LoadingScreen />
  }

  // Get all used category and subcategory names
  const getUsedNames = () => {
    const usedNames = new Set()

    // Add all category names
    productTypeState.type_categories.forEach((category) => {
      if (category.category_name) {
        usedNames.add(category.category_name.toLowerCase())
      }

      // Add all subcategory names
      category.subcategories.forEach((subcategory) => {
        if (subcategory.subcategory_name) {
          usedNames.add(subcategory.subcategory_name.toLowerCase())
        }
      })
    })

    return usedNames
  }

  const usedNames = getUsedNames();
  const unusedSuggestions = aliasState.filter(
    (alias) => !usedNames.has(alias.toLowerCase())
  );

  const visibleAliases = showMore ? unusedSuggestions : unusedSuggestions.slice(0, 8);
  const hiddenCount = unusedSuggestions.length - 8;

  // Filter suggestions based on input and exclude already used values
  const filterSuggestions = (input) => {
    const usedNames = getUsedNames()
    const currentValue = getCurrentInputValue().toLowerCase()

    // Don't filter out the current value being edited
    if (currentValue) {
      usedNames.delete(currentValue)
    }

    // Filter by input text and exclude used names
    return aliasState.filter((suggestion) => {
      const lowerSuggestion = suggestion.toLowerCase()
      return (!input || lowerSuggestion.includes(input.toLowerCase())) && !usedNames.has(lowerSuggestion)
    })
  }

  // Get current input value based on showSuggestions state
  const getCurrentInputValue = () => {
    const { type, catIndex, subIndex } = showSuggestions
    if (type === "category") {
      return productTypeState.type_categories[catIndex]?.category_name || ""
    } else if (type === "subcategory") {
      return productTypeState.type_categories[catIndex]?.subcategories[subIndex]?.subcategory_name || ""
    }
    return ""
  }

  // Get filtered suggestions
  const filteredSuggestions = filterSuggestions(getCurrentInputValue())

  return localUser && Object.keys(localUser).length > 0 ? (
    <div className="container mx-auto mt-4 sm:mt-6 px-4 sm:px-6 lg:px-8 max-w-5xl">
      <div className="bg-white shadow-xl rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-gray-800 to-gray-800 px-6 py-3 flex justify-between items-center">
          <h1 className="text-sm sm:text-xl font-bold text-white">EDIT PRODUCT TYPE</h1>
          <span className="text-xs text-gray-300">ID: {id}</span>
        </div>

        <form
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
            }
          }}
          className="p-4 sm:p-6 space-y-4"
          onSubmit={handleSubmit}
        >
          {/* Product Type Info Section */}
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
            <h2 className="text-sm sm:text-base font-semibold text-gray-700 mb-3">Product Type Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">* Product Type Name</label>
                <input
                  type="text"
                  value={productTypeState.type_name}
                  onChange={(e) => handleTypeChange("type_name", e)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Ex: Plasterboard, Framing Wall, Ceiling Tiles</p>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">* Product Type Unit</label>
                <input
                  type="text"
                  value={productTypeState.type_unit}
                  onChange={(e) => handleTypeChange("type_unit", e)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Ex: M2, UNIT, EACH</p>
              </div>
            </div>
          </div>

          {/* Suggestions Panel */}
          {aliasState.length > 0 && (
            <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Tag size={16} className="text-blue-600" />
                <h3 className="text-sm font-medium text-blue-700">Available Suggestions</h3>
                {(() => {
                  const usedNames = getUsedNames()
                  const unusedCount = aliasState.filter((alias) => !usedNames.has(alias.toLowerCase())).length
                  return (
                    <span className="text-xs bg-indigo-200 text-indigo-800 px-2 py-0.5 rounded-full ml-2">
                      {unusedCount} unused
                    </span>
                  )
                })()}
              </div>
              <div className="flex justify-between">
                <p className="text-xs text-blue-600 mb-2">
                  Click on any field's suggestion icon{" "}
                  <span className="inline-block bg-blue-100 rounded-full p-1">
                    <Tag size={12} />
                  </span>{" "}
                  to see available suggestions
                </p>
                <p className="text-xs text-blue-600 mb-2 hover:cursor-pointer" onClick={() => setShowMore(false)} hidden={showMore === false}>
                  Show less
                </p>
              </div>
              {/* <div className="flex flex-wrap gap-2">
                {(() => {
                  const usedNames = getUsedNames()
                  const unusedSuggestions = aliasState.filter((alias) => !usedNames.has(alias.toLowerCase()))
                  return unusedSuggestions.slice(0, 8).map((alias, index) => (
                    <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {alias}
                    </span>
                  ))
                })()}
                {(() => {
                  const usedNames = getUsedNames()
                  const unusedCount = aliasState.filter((alias) => !usedNames.has(alias.toLowerCase())).length
                  return unusedCount > 8 && <span className="text-xs text-blue-600">+{unusedCount - 8} more</span>
                })()}
              </div> */}
              <div className="flex flex-wrap gap-2">
                {visibleAliases.map((alias, index) => (
                  <span key={index} className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
                    {alias}
                  </span>
                ))}
                {!showMore && hiddenCount > 0 && (
                  <span
                    className="text-xs text-blue-600 cursor-pointer"
                    onClick={() => setShowMore(true)}
                  >
                    +{hiddenCount} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Categories Section */}
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-sm sm:text-base font-semibold text-gray-700">
                Categories ({productTypeState.type_categories.length})
              </h2>
              <button
                type="button"
                onClick={addCategory}
                className="inline-flex items-center px-2 py-1 text-xs sm:text-sm border border-transparent rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <Plus size={16} className="mr-1" />
                Add Category
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {productTypeState.type_categories.map((category, catIndex) => (
                <div key={catIndex} className="border border-gray-200 rounded-md overflow-hidden">
                  {/* Category Header */}
                  <div
                    className={`flex items-center justify-between p-3 cursor-pointer ${
                      openCategories[catIndex] ? "bg-blue-50" : "bg-gray-100"
                    }`}
                    onClick={() => toggleCategory(catIndex)}
                  >
                    <div className="flex items-center">
                      {openCategories[catIndex] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      <span className="ml-2 font-medium text-sm">
                        {category.category_name
                          ? `${category.category_name} (${category.subcategories.length} subcategories)`
                          : `Category ${catIndex + 1} (${category.subcategories.length} subcategories)`}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeCategory(catIndex)
                      }}
                      className="text-red-500 hover:text-red-700 transition-colors p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Category Content */}
                  {openCategories[catIndex] && (
                    <div className="p-3 bg-white border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <div className="relative">
                          <label className="block text-xs font-medium text-gray-700 mb-1">Category Name</label>
                          <div className="flex">
                            <input
                              type="text"
                              value={category.category_name}
                              onChange={(e) => handleCategoryChange(catIndex, "category_name", e.target.value)}
                              placeholder="Category Name"
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault()
                                toggleSuggestions("category", catIndex)
                              }}
                              className="suggestion-trigger px-2 bg-blue-100 border border-blue-300 rounded-r-md hover:bg-blue-200 transition-colors"
                              title="Show suggestions"
                            >
                              <Tag size={16} className="text-blue-600" />
                            </button>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Ex: 13mm RE, 16mm FR, 64mm Stud 3m</p>

                          {/* Suggestions dropdown for category */}
                          {showSuggestions.type === "category" && showSuggestions.catIndex === catIndex && (
                            <div className="suggestions-container fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                              <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                                <div className="flex justify-between items-center p-4 border-b">
                                  <h3 className="font-medium">Select a Suggestion</h3>
                                  <button
                                    type="button"
                                    onClick={() => setShowSuggestions({ type: null, catIndex: null, subIndex: null })}
                                    className="text-gray-500 hover:text-gray-700"
                                  >
                                    <X size={20} />
                                  </button>
                                </div>

                                <div className="p-2">
                                  <input
                                    type="text"
                                    placeholder="Filter suggestions..."
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md mb-2"
                                    value={getCurrentInputValue()}
                                    onChange={(e) => {
                                      const updatedCategories = [...productTypeState.type_categories]
                                      updatedCategories[catIndex].category_name = e.target.value
                                      setProductTypeState({ ...productTypeState, type_categories: updatedCategories })
                                    }}
                                    autoFocus
                                  />
                                </div>

                                <div className="overflow-y-auto p-2" style={{ maxHeight: "60vh" }}>
                                  {filteredSuggestions.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                      {filteredSuggestions.map((suggestion, idx) => (
                                        <div
                                          key={idx}
                                          className="px-3 py-2 text-sm bg-gray-50 hover:bg-blue-50 cursor-pointer rounded border border-gray-200"
                                          onClick={() => applySuggestion(suggestion)}
                                        >
                                          {suggestion}
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="text-center text-gray-500 py-4">
                                      {getCurrentInputValue() ? (
                                        <p>No matching suggestions found</p>
                                      ) : aliasState.length > 0 ? (
                                        <p>All suggestions are already used in the form</p>
                                      ) : (
                                        <p>No suggestions available</p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Category Unit</label>
                          <input
                            type="text"
                            value={category.category_unit}
                            onChange={(e) => handleCategoryChange(catIndex, "category_unit", e.target.value)}
                            placeholder="Category Unit"
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <p className="text-xs text-gray-500 mt-1">Ex: M2, UNIT, EACH</p>
                        </div>
                      </div>

                      {/* Subcategories */}
                      <div className="mt-3">
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-xs font-medium text-gray-700">Subcategories</label>
                          <button
                            type="button"
                            onClick={() => addSubcategory(catIndex)}
                            className="inline-flex items-center px-2 py-1 text-xs border border-transparent rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                          >
                            <Plus size={14} className="mr-1" />
                            Add
                          </button>
                        </div>

                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                          {category.subcategories.map((subcategory, subIndex) => (
                            <div
                              key={subIndex}
                              className="grid grid-cols-12 gap-2 items-center bg-gray-50 p-2 rounded-md"
                            >
                              <button
                                type="button"
                                onClick={() => removeSubcategory(catIndex, subIndex)}
                                className="text-red-500 hover:text-red-700 transition-colors col-span-1"
                              >
                                <X size={14} />
                              </button>
                              <div className="col-span-6 sm:col-span-5 relative">
                                <div className="flex">
                                  <input
                                    type="text"
                                    value={subcategory.subcategory_name}
                                    onChange={(e) =>
                                      handleSubcategoryChange(catIndex, subIndex, "subcategory_name", e.target.value)
                                    }
                                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Subcategory Name"
                                  />
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault()
                                      toggleSuggestions("subcategory", catIndex, subIndex)
                                    }}
                                    className="suggestion-trigger px-1 bg-blue-100 border border-blue-300 rounded-r-md hover:bg-blue-200 transition-colors"
                                    title="Show suggestions"
                                  >
                                    <Tag size={12} className="text-blue-600" />
                                  </button>
                                </div>

                                {/* Suggestions dropdown for subcategory */}
                                {showSuggestions.type === "subcategory" &&
                                  showSuggestions.catIndex === catIndex &&
                                  showSuggestions.subIndex === subIndex && (
                                    <div className="suggestions-container fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                                      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                                        <div className="flex justify-between items-center p-4 border-b">
                                          <h3 className="font-medium">Select a Suggestion</h3>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              setShowSuggestions({ type: null, catIndex: null, subIndex: null })
                                            }
                                            className="text-gray-500 hover:text-gray-700"
                                          >
                                            <X size={20} />
                                          </button>
                                        </div>

                                        <div className="p-2">
                                          <input
                                            type="text"
                                            placeholder="Filter suggestions..."
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md mb-2"
                                            value={getCurrentInputValue()}
                                            onChange={(e) => {
                                              const updatedCategories = [...productTypeState.type_categories]
                                              updatedCategories[catIndex].subcategories[subIndex].subcategory_name =
                                                e.target.value
                                              setProductTypeState({
                                                ...productTypeState,
                                                type_categories: updatedCategories,
                                              })
                                            }}
                                            autoFocus
                                          />
                                        </div>

                                        <div className="overflow-y-auto p-2" style={{ maxHeight: "60vh" }}>
                                          {filteredSuggestions.length > 0 ? (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                              {filteredSuggestions.map((suggestion, idx) => (
                                                <div
                                                  key={idx}
                                                  className="px-3 py-2 text-sm bg-gray-50 hover:bg-blue-50 cursor-pointer rounded border border-gray-200"
                                                  onClick={() => applySuggestion(suggestion)}
                                                >
                                                  {suggestion}
                                                </div>
                                              ))}
                                            </div>
                                          ) : (
                                            <div className="text-center text-gray-500 py-4">
                                              {getCurrentInputValue() ? (
                                                <p>No matching suggestions found</p>
                                              ) : aliasState.length > 0 ? (
                                                <p>All suggestions are already used in the form</p>
                                              ) : (
                                                <p>No suggestions available</p>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                              </div>
                              <div className="col-span-5 sm:col-span-6">
                                <input
                                  type="text"
                                  value={subcategory.subcategory_unit}
                                  onChange={(e) =>
                                    handleSubcategoryChange(catIndex, subIndex, "subcategory_unit", e.target.value)
                                  }
                                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="Subcategory Unit"
                                />
                              </div>
                            </div>
                          ))}
                        </div>

                        {category.subcategories.length === 0 && (
                          <p className="text-xs text-gray-500 italic text-center py-2">No subcategories added</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {productTypeState.type_categories.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  <p>No categories added yet. Click "Add Category" to get started.</p>
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-between pt-2 border-t border-gray-200">
            <button
              type="button"
              className="px-4 py-2 text-xs sm:text-sm border border-gray-300 rounded-md shadow-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
              onClick={handleBackClick}
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs sm:text-sm border border-transparent rounded-md shadow-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              SAVE CHANGES
            </button>
          </div>
        </form>
      </div>
    </div>
  ) : (
    <UnauthenticatedSkeleton />
  )
}

export default UpdateProductTypeForm



// "use client"

// // Import modules
// import { useEffect, useState } from "react"
// import { useNavigate, useParams } from "react-router-dom"
// import { useUpdateProductType } from "../../hooks/useUpdateProductType"
// import { ChevronDown, ChevronUp, Plus, Trash2, X } from "lucide-react"

// import SessionExpired from "../../components/SessionExpired"
// import UnauthenticatedSkeleton from "../loaders/UnauthenticateSkeleton"
// import LoadingScreen from "../loaders/LoadingScreen"

// const UpdateProductTypeForm = () => {
//   // router
//   const navigate = useNavigate()
//   const { id } = useParams()

//   // hook
//   const { updateProductType, isUpdating, updateError } = useUpdateProductType()

//   // state
//   const [productTypeState, setProductTypeState] = useState({
//     type_name: "",
//     type_unit: "",
//     type_categories: [
//       {
//         category_name: "",
//         category_unit: "",
//         subcategories: [
//           {
//             subcategory_name: "",
//             subcategory_unit: "",
//           },
//         ],
//       },
//     ],
//   })
//   const [productState, setProductState] = useState([])
//   const [aliasState, setAliasState] = useState([])
//   const [isLoading, setIsLoading] = useState(false)
//   const [isFetchError, setFetchError] = useState(null)
//   const [isFetchProductsLoading, setFetchProductsLoading] = useState(false)
//   const [isFetchProductsError, setFetchProductsError] = useState(null)
//   const [openCategories, setOpenCategories] = useState({})

//   // functions and variables
//   const localUser = JSON.parse(localStorage.getItem("localUser"))

//   // Toggle category accordion
//   const toggleCategory = (index) => {
//     setOpenCategories({
//       ...openCategories,
//       [index]: !openCategories[index],
//     })
//   }

//   // Handle back click
//   const handleBackClick = () => navigate(`/EmpirePMS/product-type`)

//   // Handle archive
//   const handleArchive = () => {
//     setProductTypeState({ ...productTypeState, type_isarchived: !productTypeState.type_isarchived })
//     updateProductType(productTypeState, id)
//   }

//   // Handle changes for type name
//   const handleTypeChange = (field, e) => {
//     setProductTypeState({ ...productTypeState, [field]: e.target.value })
//   }

//   // Handle changes for category name
//   const handleCategoryChange = (index, field, value) => {
//     const updatedCategories = [...productTypeState.type_categories]
//     updatedCategories[index][field] = value
//     setProductTypeState({ ...productTypeState, type_categories: updatedCategories })
//   }

//   // Handle changes for subcategory name
//   const handleSubcategoryChange = (catIndex, subIndex, field, value) => {
//     const updatedCategories = [...productTypeState.type_categories]
//     updatedCategories[catIndex].subcategories[subIndex][field] = value
//     setProductTypeState({ ...productTypeState, type_categories: updatedCategories })
//   }

//   // Add a new category
//   const addCategory = () => {
//     const newIndex = productTypeState.type_categories.length
//     setProductTypeState({
//       ...productTypeState,
//       type_categories: [
//         ...productTypeState.type_categories,
//         { category_name: "", category_unit: "", subcategories: [{ subcategory_name: "", subcategory_unit: "" }] },
//       ],
//     })
//     // Open the newly added category
//     setOpenCategories({
//       ...openCategories,
//       [newIndex]: true,
//     })
//   }

//   // Add a new subcategory to a specific category
//   const addSubcategory = (catIndex) => {
//     const updatedCategories = [...productTypeState.type_categories]
//     updatedCategories[catIndex].subcategories.push({ subcategory_name: "", subcategory_unit: "" })
//     setProductTypeState({ ...productTypeState, type_categories: updatedCategories })
//   }

//   // Remove a category
//   const removeCategory = (index) => {
//     const updatedCategories = productTypeState.type_categories.filter((_, i) => i !== index)
//     setProductTypeState({ ...productTypeState, type_categories: updatedCategories })

//     // Update open categories state
//     const newOpenCategories = { ...openCategories }
//     delete newOpenCategories[index]

//     // Adjust keys for categories after the deleted one
//     Object.keys(newOpenCategories).forEach((key) => {
//       const keyNum = Number.parseInt(key)
//       if (keyNum > index) {
//         newOpenCategories[keyNum - 1] = newOpenCategories[keyNum]
//         delete newOpenCategories[keyNum]
//       }
//     })

//     setOpenCategories(newOpenCategories)
//   }

//   // Remove a subcategory
//   const removeSubcategory = (catIndex, subIndex) => {
//     const updatedCategories = [...productTypeState.type_categories]
//     updatedCategories[catIndex].subcategories = updatedCategories[catIndex].subcategories.filter(
//       (_, i) => i !== subIndex,
//     )
//     setProductTypeState({ ...productTypeState, type_categories: updatedCategories })
//   }

//   // Remove input with empty string
//   const cleanObject = (obj) => {
//     if (Array.isArray(obj)) {
//       return obj
//         .map(cleanObject) // Process each element
//         .filter((item) => item && Object.keys(item).length > 0) // Remove empty objects
//     } else if (typeof obj === "object" && obj !== null) {
//       const cleaned = Object.entries(obj).reduce((acc, [key, value]) => {
//         const cleanedValue = cleanObject(value) // Clean nested values
//         if (
//           cleanedValue !== "" && // Remove empty strings
//           (typeof cleanedValue !== "object" || Object.keys(cleanedValue).length > 0) // Remove empty objects
//         ) {
//           acc[key] = cleanedValue
//         }
//         return acc
//       }, {})
//       return cleaned
//     }
//     return obj // Return primitive values unchanged
//   }

//   // Handle form submission
//   const handleSubmit = (e) => {
//     e.preventDefault()

//     const cleanedData = cleanObject(productTypeState) // Clean the data by removing empty strings from input

//     updateProductType(cleanedData, id)

//     setProductTypeState({
//       type_name: "",
//       type_unit: "",
//       type_categories: [
//         { category_name: "", category_unit: "", subcategories: [{ subcategory_name: "", subcategory_unit: "" }] },
//       ],
//     })
//   }

//   // useEffect
//   useEffect(() => {
//     const abortController = new AbortController()
//     const signal = abortController.signal

//     const fetchProductType = async () => {
//       setIsLoading(true) // Set loading state to true at the beginning
//       try {
//         const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/product-type/${id}`, {
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

//         setIsLoading(false)
//         setProductTypeState(data)

//         // Initialize open/closed state for categories
//         const initialOpenState = {}
//         data.type_categories.forEach((_, index) => {
//           initialOpenState[index] = index === 0 // Open only the first category by default
//         })
//         setOpenCategories(initialOpenState)

//         setFetchError(null)
//       } catch (error) {
//         if (error.name === "AbortError") {
//           // do nothing
//         } else {
//           setIsLoading(false)
//           setFetchError(error.message)
//         }
//       }
//     }

//     fetchProductType()

//     return () => {
//       abortController.abort() // Cleanup
//     }
//   }, [id])

//   // fetch products by product type
//   useEffect(() => {
//   const abortController = new AbortController();
//   const signal = abortController.signal;

//   const fetchProducts = async () => {
//       setFetchProductsLoading(true);
//       try {
//           const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/product/type/${id}`, { signal , credentials: 'include',
//               headers: {
//                   'Content-Type': 'application/json',
//                   'Authorization': `Bearer ${sessionStorage.getItem('jwt')}` // Include token in Authorization header
//               }});
//           if (!res.ok) {
//               throw new Error('Failed to fetch products');
//           }
//           const data = await res.json();

//           if (data.tokenError) {
//               throw new Error(data.tokenError);
//           }
          
//           setFetchProductsLoading(false);
//           setProductState(data);
//           setFetchProductsError(null);
//       } catch (error) {
//           if (error.name === 'AbortError') {
//               // do nothing
//           } else {
//               setFetchProductsLoading(false);
//               setFetchProductsError(error.message);
//           }
//       }
//   };

//   fetchProducts();

//   return () => {
//       abortController.abort(); // Cleanup
//   };
//   }, []);

//   useEffect(() => {
//     if (productState.length > 0) {
//       const aliases = productState
//         .map(product => {
//           const aliasName = product.alias?.alias_name ?? "";
  
//           // Remove measurement at the end - eg: "1.2x3.6m", "0.6x3.0mm", etc.
//           const aliasNoMeasurement = aliasName.replace(/\b\d+(\.\d+)?x\d+(\.\d+)?m{1,2}\b/gi, "").trim();
  
//           // Keep first 2 or 3 words
//           const words = aliasNoMeasurement.split(/\s+/).slice(0, 4).join(" ");
  
//           return aliasName;
//         })
//         .filter((value, index, self) => self.indexOf(value) === index); // remove duplicates
  
//       setAliasState(aliases);
//     }
//   }, [productState]);
  

//   console.log("productState", productState)
//   console.log("aliasState", aliasState)

//   // component
//   if (isFetchError || updateError) {
//     if (isFetchError && isFetchError.includes("Session expired")) {
//       return (
//         <div>
//           <SessionExpired />
//         </div>
//       )
//     }

//     return (
//       <div>
//         <p>Error: {isFetchError || updateError}</p>
//       </div>
//     )
//   }

//   if (isLoading) {
//     return <LoadingScreen />
//   }

//   return localUser && Object.keys(localUser).length > 0 ? (
//     <div className="container mx-auto mt-4 sm:mt-6 px-4 sm:px-6 lg:px-8 max-w-5xl">
//       <div className="bg-white shadow-xl rounded-lg overflow-hidden">
//         <div className="bg-gradient-to-r from-gray-800 to-gray-800 px-6 py-3 flex justify-between items-center">
//           <h1 className="text-sm sm:text-xl font-bold text-white">EDIT PRODUCT TYPE</h1>
//           <span className="text-xs text-gray-300">ID: {id}</span>
//         </div>

//         <form
//           onKeyDown={(e) => {
//             if (e.key === "Enter") {
//               e.preventDefault()
//             }
//           }}
//           className="p-4 sm:p-6 space-y-4"
//           onSubmit={handleSubmit}
//         >
//           {/* Product Type Info Section */}
//           <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
//             <h2 className="text-sm sm:text-base font-semibold text-gray-700 mb-3">Product Type Information</h2>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">* Product Type Name</label>
//                 <input
//                   type="text"
//                   value={productTypeState.type_name}
//                   onChange={(e) => handleTypeChange("type_name", e)}
//                   className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
//                   required
//                 />
//                 <p className="text-xs text-gray-500 mt-1">Ex: Plasterboard, Framing Wall, Ceiling Tiles</p>
//               </div>
//               <div>
//                 <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">* Product Type Unit</label>
//                 <input
//                   type="text"
//                   value={productTypeState.type_unit}
//                   onChange={(e) => handleTypeChange("type_unit", e)}
//                   className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
//                   required
//                 />
//                 <p className="text-xs text-gray-500 mt-1">Ex: M2, UNIT, EACH</p>
//               </div>
//             </div>
//           </div>

//           {/* Categories Section */}
//           <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
//             <div className="flex justify-between items-center mb-3">
//               <h2 className="text-sm sm:text-base font-semibold text-gray-700">
//                 Categories ({productTypeState.type_categories.length})
//               </h2>
//               <button
//                 type="button"
//                 onClick={addCategory}
//                 className="inline-flex items-center px-2 py-1 text-xs sm:text-sm border border-transparent rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
//               >
//                 <Plus size={16} className="mr-1" />
//                 Add Category
//               </button>
//             </div>

//             <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
//               {productTypeState.type_categories.map((category, catIndex) => (
//                 <div key={catIndex} className="border border-gray-200 rounded-md overflow-hidden">
//                   {/* Category Header */}
//                   <div
//                     className={`flex items-center justify-between p-3 cursor-pointer ${openCategories[catIndex] ? "bg-blue-50" : "bg-gray-100"}`}
//                     onClick={() => toggleCategory(catIndex)}
//                   >
//                     <div className="flex items-center">
//                       {openCategories[catIndex] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
//                       <span className="ml-2 font-medium text-sm">
//                         {category.category_name
//                           ? `${category.category_name} (${category.subcategories.length} subcategories)`
//                           : `Category ${catIndex + 1} (${category.subcategories.length} subcategories)`}
//                       </span>
//                     </div>
//                     <button
//                       type="button"
//                       onClick={(e) => {
//                         e.stopPropagation()
//                         removeCategory(catIndex)
//                       }}
//                       className="text-red-500 hover:text-red-700 transition-colors p-1"
//                     >
//                       <Trash2 size={16} />
//                     </button>
//                   </div>

//                   {/* Category Content */}
//                   {openCategories[catIndex] && (
//                     <div className="p-3 bg-white border-t border-gray-200">
//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
//                         <div>
//                           <label className="block text-xs font-medium text-gray-700 mb-1">Category Name</label>
//                           <input
//                             type="text"
//                             value={category.category_name}
//                             onChange={(e) => handleCategoryChange(catIndex, "category_name", e.target.value)}
//                             placeholder="Category Name"
//                             className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
//                           />
//                           <p className="text-xs text-gray-500 mt-1">Ex: 13mm RE, 16mm FR, 64mm Stud 3m</p>
//                         </div>
//                         <div>
//                           <label className="block text-xs font-medium text-gray-700 mb-1">Category Unit</label>
//                           <input
//                             type="text"
//                             value={category.category_unit}
//                             onChange={(e) => handleCategoryChange(catIndex, "category_unit", e.target.value)}
//                             placeholder="Category Unit"
//                             className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
//                           />
//                           <p className="text-xs text-gray-500 mt-1">Ex: M2, UNIT, EACH</p>
//                         </div>
//                       </div>

//                       {/* Subcategories */}
//                       <div className="mt-3">
//                         <div className="flex justify-between items-center mb-2">
//                           <label className="block text-xs font-medium text-gray-700">Subcategories</label>
//                           <button
//                             type="button"
//                             onClick={() => addSubcategory(catIndex)}
//                             className="inline-flex items-center px-2 py-1 text-xs border border-transparent rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
//                           >
//                             <Plus size={14} className="mr-1" />
//                             Add
//                           </button>
//                         </div>

//                         <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
//                           {category.subcategories.map((subcategory, subIndex) => (
//                             <div
//                               key={subIndex}
//                               className="grid grid-cols-12 gap-2 items-center bg-gray-50 p-2 rounded-md"
//                             >
//                               <button
//                                 type="button"
//                                 onClick={() => removeSubcategory(catIndex, subIndex)}
//                                 className="text-red-500 hover:text-red-700 transition-colors col-span-1"
//                               >
//                                 <X size={14} />
//                               </button>
//                               <div className="col-span-6 sm:col-span-5">
//                                 <input
//                                   type="text"
//                                   value={subcategory.subcategory_name}
//                                   onChange={(e) =>
//                                     handleSubcategoryChange(catIndex, subIndex, "subcategory_name", e.target.value)
//                                   }
//                                   className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
//                                   placeholder="Subcategory Name"
//                                 />
//                               </div>
//                               <div className="col-span-5 sm:col-span-6">
//                                 <input
//                                   type="text"
//                                   value={subcategory.subcategory_unit}
//                                   onChange={(e) =>
//                                     handleSubcategoryChange(catIndex, subIndex, "subcategory_unit", e.target.value)
//                                   }
//                                   className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
//                                   placeholder="Subcategory Unit"
//                                 />
//                               </div>
//                             </div>
//                           ))}
//                         </div>

//                         {category.subcategories.length === 0 && (
//                           <p className="text-xs text-gray-500 italic text-center py-2">No subcategories added</p>
//                         )}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               ))}

//               {productTypeState.type_categories.length === 0 && (
//                 <div className="text-center py-4 text-gray-500">
//                   <p>No categories added yet. Click "Add Category" to get started.</p>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Form Actions */}
//           <div className="flex justify-between pt-2 border-t border-gray-200">
//             <button
//               type="button"
//               className="px-4 py-2 text-xs sm:text-sm border border-gray-300 rounded-md shadow-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
//               onClick={handleBackClick}
//             >
//               CANCEL
//             </button>
//             <button
//               type="submit"
//               className="px-4 py-2 text-xs sm:text-sm border border-transparent rounded-md shadow-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
//             >
//               SAVE CHANGES
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   ) : (
//     <UnauthenticatedSkeleton />
//   )
// }

// export default UpdateProductTypeForm


// *******************************************************************************************************************************

// // Import modules
// import { useEffect, useState } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import { useUpdateProductType } from '../../hooks/useUpdateProductType'; 
 
// import SessionExpired from '../../components/SessionExpired';
// import UnauthenticatedSkeleton from "../loaders/UnauthenticateSkeleton";
// import LoadingScreen from '../loaders/LoadingScreen';

// const UpdateProductTypeForm = () => {
//     // router
//     const navigate = useNavigate();
//     const { id } = useParams();

//     // hook
//     const { updateProductType, isUpdating, updateError } = useUpdateProductType();

//     // state
//     const [productTypeState, setProductTypeState] = useState({
//         type_name: '',
//         type_unit: '',
//         type_categories: [
//             {
//             category_name: '',
//             category_unit: '',
//             subcategories: [
//                 {
//                 subcategory_name: '',
//                 subcategory_unit: ''
//                 }]
//             }
//         ]
//     });
//     const [isLoading, setIsLoading] = useState(false);
//     const [isFetchError, setFetchError] = useState(null);

//     // functions and variables
//     const localUser = JSON.parse(localStorage.getItem('localUser'))

//     // Handle back click
//     const handleBackClick = () => navigate(`/EmpirePMS/product-type`);

//     // Handle archive
//     const handleArchive = () => {
//       setProductTypeState({...productTypeState, type_isarchived: !productTypeState.type_isarchived})

//       updateProductType(productTypeState, id)
//     }

//     // Handle changes for type name
//     const handleTypeChange = (field, e) => {
//         setProductTypeState({ ...productTypeState, [field]: e.target.value });
//     };

//     // Handle changes for category name
//     const handleCategoryChange = (index, field, value) => {
//         const updatedCategories = [...productTypeState.type_categories];
//         updatedCategories[index][field] = value;
//         setProductTypeState({ ...productTypeState, type_categories: updatedCategories });
//     };

//     // Handle changes for subcategory name
//     const handleSubcategoryChange = (catIndex, subIndex, field, value) => {
//         const updatedCategories = [...productTypeState.type_categories];
//         updatedCategories[catIndex].subcategories[subIndex][field] = value;
//         setProductTypeState({ ...productTypeState, type_categories: updatedCategories });
//     };
    
//     // Add a new category
//     const addCategory = () => {
//       setProductTypeState({
//         ...productTypeState,
//         type_categories: [
//           ...productTypeState.type_categories,
//           { category_name: '', category_unit: '', subcategories: [{ subcategory_name: '', subcategory_unit: '' }] }
//         ]
//       });
//     };

//     // Add a new subcategory to a specific category
//     const addSubcategory = (catIndex) => {
//         const updatedCategories = [...productTypeState.type_categories];
//         updatedCategories[catIndex].subcategories.push({ subcategory_name: '', subcategory_unit: '' });
//         setProductTypeState({ ...productTypeState, type_categories: updatedCategories });
//     };

//     // Remove a category
//     const removeCategory = (index) => {
//         const updatedCategories = productTypeState.type_categories.filter((_, i) => i !== index);
//         setProductTypeState({ ...productTypeState, type_categories: updatedCategories });
//     };

//     // Remove a subcategory
//     const removeSubcategory = (catIndex, subIndex) => {
//         const updatedCategories = [...productTypeState.type_categories];
//         updatedCategories[catIndex].subcategories = updatedCategories[catIndex].subcategories.filter(
//         (_, i) => i !== subIndex
//         );
//         setProductTypeState({ ...productTypeState, type_categories: updatedCategories });
//     };

//     // Remove input with empty string
//     const cleanObject = (obj) => {
//       if (Array.isArray(obj)) {
//         return obj
//           .map(cleanObject) // Process each element
//           .filter((item) => item && Object.keys(item).length > 0); // Remove empty objects
//       } else if (typeof obj === 'object' && obj !== null) {
//         const cleaned = Object.entries(obj).reduce((acc, [key, value]) => {
//           const cleanedValue = cleanObject(value); // Clean nested values
//           if (
//             cleanedValue !== '' && // Remove empty strings
//             (typeof cleanedValue !== 'object' || Object.keys(cleanedValue).length > 0) // Remove empty objects
//           ) {
//             acc[key] = cleanedValue;
//           }
//           return acc;
//         }, {});
//         return cleaned;
//       }
//       return obj; // Return primitive values unchanged
//     };

//     // Handle form submission
//     const handleSubmit = (e) => {
//         e.preventDefault();

//         const cleanedData = cleanObject(productTypeState); // Clean the data by removing empty strings from input

//         updateProductType(cleanedData, id)

//         setProductTypeState({
//         type_name: '',
//         type_unit: '',
//         type_categories: [{ category_name: '', category_unit: '', subcategories: [{ subcategory_name: '', subcategory_unit: '' }] }]
//         });
//     };

//     // useEffect
//     useEffect(() => {
//         const abortController = new AbortController();
//         const signal = abortController.signal;

//         const fetchProductType = async () => {
//             setIsLoading(true); // Set loading state to true at the beginning
//             try {
//                 const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/product-type/${id}`, { signal , credentials: 'include',
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
                
//                 setIsLoading(false);
//                 setProductTypeState(data);
//                 setFetchError(null);
//             } catch (error) {
//                 if (error.name === 'AbortError') {
//                     // do nothing
//                 } else {
//                     setIsLoading(false);
//                     setFetchError(error.message);
//                 }
//             }
//         };

//         fetchProductType();

//         return () => {
//             abortController.abort(); // Cleanup
//         };
//     }, [id]);

//     // component
//     if (isFetchError || updateError) {
//       if (isFetchError && isFetchError.includes("Session expired")) {
//         return (
//           <div>
//             <SessionExpired />
//           </div>
//         );
//       }

//       return (
//         <div>
//           <p>
//             Error:{" "}
//             {isFetchError ||
//               updateError}
//           </p>
//         </div>
//       );
//     }

//     return (
//       localUser && Object.keys(localUser).length > 0 ? (
//       <div className="container mx-auto mt-4 sm:mt-10 px-4 sm:px-6 lg:px-8">
//         <div className="bg-white shadow-xl rounded-lg overflow-hidden">
//           <div className="bg-gradient-to-r from-gray-800 to-gray-800 px-6 py-2">
//             <h1 className=" text-xs sm:text-xl font-bold text-white">EDIT PRODUCT TYPE</h1>
//           </div>
//           <form  onKeyDown={(e) => { if (e.key === 'Enter') {e.preventDefault();} }} className="p-4 sm:p-6 space-y-2 sm:space-y-6 text-xs sm:text-base" onSubmit={handleSubmit}>
//             <div className='flex gap-x-2'>
//               <div className='w-full'>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">* Product Type Name</label>
//                 <input
//                   type="text"
//                   value={productTypeState.type_name}
//                   onChange={(e) => handleTypeChange("type_name", e)}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
//                   required
//                 />
//                 <label className='hidden sm:inline-block text-xs italic text-gray-400'>Ex: Plasterboard, Framing Wall, Framing Wall (Accessories), Ceiling Tiles, Rigid Insulation, Speedpanel (Accessories)</label>
//               </div>
//               <div className='w-full'>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">* Product Type Unit</label>
//                 <input
//                   type="text"
//                   value={productTypeState.type_unit}
//                   onChange={(e) => handleTypeChange("type_unit", e)}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
//                   required
//                 />
//                 <label className='hidden sm:inline-block text-xs italic text-gray-400'>Ex: M2, UNIT, EACH</label>
//               </div>
//             </div>
  
//             {productTypeState.type_categories.map((category, catIndex) => (
//               <div key={catIndex} className="space-y-2 p-4 bg-gray-100 rounded-md">
//                 <div className="flex items-center justify-between">
//                   <label className="block text-sm font-medium text-gray-700">Category</label>
//                   <button
//                     type="button"
//                     onClick={() => removeCategory(catIndex)}
//                     className="text-red-500 hover:text-red-700 transition duration-150 ease-in-out"
//                   >
//                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 sm:size-6">
//                           <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
//                       </svg>
//                   </button>
//                 </div>
//                 <div className='flex gap-x-2'>
//                   <div className='w-full'>
//                     <input
//                       type="text"
//                       value={category.category_name}
//                       onChange={(e) => handleCategoryChange(catIndex, "category_name", e.target.value)}
//                       placeholder='Category Name'
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
//                     />
//                     <label className='hidden sm:inline text-xs italic text-gray-400'>Ex: 13mm RE, 16mm FR, 64mm Stud 3m 0.5BMT, 92mm Stud 3m 0.75BMT</label>
//                   </div>
//                   <div className='w-full'>
//                     <input
//                       type="text"
//                       value={category.category_unit}
//                       onChange={(e) => handleCategoryChange(catIndex, "category_unit", e.target.value)}
//                       placeholder='Category Unit'
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
//                     />
//                     <label className='hidden sm:inline text-xs italic text-gray-400'>Ex: M2, UNIT, EACH</label>
//                   </div>
//                 </div>
                
//                 <label className="block text-sm font-medium text-gray-700 ml-2">Sub-category</label>
//                 {category.subcategories.map((subcategory, subIndex) => (
//                   <div key={subIndex}>
//                     <div className="flex items-center space-x-2">
//                       <div className='w-full'>
//                         <div className='flex'>
//                           <button
//                             type="button"
//                             onClick={() => removeSubcategory(catIndex, subIndex)}
//                             className="text-red-500 hover:text-red-700 transition duration-150 ease-in-out inline-block mx-2"
//                           >
//                             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
//                                 <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
//                             </svg>
//                           </button>
//                           <input
//                             type="text"
//                             value={subcategory.subcategory_name}
//                             onChange={(e) => handleSubcategoryChange(catIndex, subIndex, "subcategory_name", e.target.value)}
//                             className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out w-full"
//                             placeholder="Sub-category Name"
//                           />
//                         </div>
//                         <label className='hidden sm:inline-block text-xs italic text-gray-400 ml-8'>Ex: 64mm Track, 64mm Nogging, 64mm Stud, 64mm DH Track</label>
//                       </div>
//                       <div className='w-full'>
//                         <input
//                           type="text"
//                           value={subcategory.subcategory_unit}
//                           onChange={(e) => handleSubcategoryChange(catIndex, subIndex, "subcategory_unit", e.target.value)}
//                           className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out w-full"
//                           placeholder="Sub-category Unit"
//                         />
//                         <label className='hidden sm:inline-block text-xs italic text-gray-400'>Ex: M2, UNIT, EACH</label>
//                       </div>
//                     </div>
//                   </div>
//                 ))}                  
//                 <button
//                   type="button"
//                   onClick={() => addSubcategory(catIndex)}
//                   className="inline-flex items-center px-3 py-2 border border-transparent leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out text-xs sm:text-sm"
//                 >
//                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 sm:size-5">
//                       <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
//                   </svg>
//                   Add Sub-category
//                 </button>
//               </div>
//             ))}
  
//             <button
//               type="button"
//               onClick={addCategory}
//               className="inline-flex items-center px-4 py-2 border border-transparent font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ease-in-out text-xs sm:text-sm"
//             >
//               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 sm:size-5">
//                   <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
//               </svg>
//               Add Category
//             </button>
  
//             <div className='grid grid-cols-2'>
//               <div className='grid grid-cols-3'>
//                   <button
//                   className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm font-medium text-white bg-gray-400 hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 transition duration-150 ease-in-out text-xs sm:text-sm"
//                   onClick={handleBackClick}
//                   >
//                   CANCEL
//                   </button>
//               </div>
//               <div className='grid grid-cols-3'>
//                   <button
//                   type="submit"
//                   className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out col-start-3 text-xs sm:text-sm"
//                   >
//                   SUBMIT
//                   </button>
//               </div>
//             </div>
//           </form>
//         </div>
//       </div>
//   ) : ( <UnauthenticatedSkeleton /> )
//   );
// };

// export default UpdateProductTypeForm;
