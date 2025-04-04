"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronDown, ChevronRight, Edit, Layers, Plus, Search, Archive, X } from "lucide-react"
import SessionExpired from "../components/SessionExpired"
import EmployeePageSkeleton from "./loaders/EmployeePageSkeleton"
import UnauthenticatedSkeleton from "./loaders/UnauthenticateSkeleton"

const ProductType = () => {
  // state
  const localUser = JSON.parse(localStorage.getItem("localUser"))
  const [isArchive, setIsArchive] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [productTypeState, setProductTypeState] = useState([])
  const [isLoadingState, setIsLoadingState] = useState(true)
  const [errorState, setErrorState] = useState(null)
  const [expandedNodes, setExpandedNodes] = useState({})

  // router
  const navigate = useNavigate()

  // functions and variables
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleAddClick = () => {
    navigate("/EmpirePMS/product-type/create")
  }

  const handleEditClick = (typeId, e) => {
    e.stopPropagation()
    navigate(`/EmpirePMS/product-type/${typeId}/edit`)
  }

  const toggleNode = (nodeId) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }))
  }

  // Filter the data using searchTerm
  const filterProductType = () => {
    return productTypeState.filter((producttype) => {
      const lowerCaseSearchTerm = searchTerm.toLowerCase()

      return (
        producttype.type_name.toLowerCase().includes(lowerCaseSearchTerm) ||
        producttype.type_categories.some(
          (category) =>
            category.category_name.toLowerCase().includes(lowerCaseSearchTerm) ||
            category.subcategories.some((subcategory) =>
              subcategory.subcategory_name.toLowerCase().includes(lowerCaseSearchTerm),
            ),
        )
      )
    })
  }

  // Transform the data into the required format for the table
  const formatData = (rawData) => {
    return rawData.map((type) => ({
      id: type._id,
      name: type.type_name,
      unit: type.type_unit,
      children: type.type_categories.map((category) => ({
        id: category._id,
        name: category.category_name,
        unit: category.category_unit,
        children: category.subcategories.map((subcategory) => ({
          id: subcategory._id,
          name: subcategory.subcategory_name,
          unit: subcategory.subcategory_unit,
        })),
      })),
    }))
  }

  const formattedData = formatData(filterProductType().filter((type) => type.type_isarchived === isArchive))

  // useEffect
  useEffect(() => {
    const abortController = new AbortController()
    const signal = abortController.signal

    const fetchProductTypes = async () => {
      setIsLoadingState(true)
      try {
        const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/product-type`, {
          signal,
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("jwt")}`,
          },
        })

        if (!res.ok) {
          throw new Error("Failed to fetch product types")
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

  // components
  const TreeTableRow = ({ node, level }) => {
    const hasChildren = node.children && node.children.length > 0
    const isExpanded = expandedNodes[node.id]

    const levelColors = ["border-blue-500", "border-emerald-500", "border-amber-500"]

    const borderColor = levelColors[level] || "border-gray-300"

    return (
      <>
        <tr
          className={`border-t border-gray-100 hover:bg-gray-50 transition-colors duration-150 ${level === 0 ? "bg-gray-50" : ""}`}
          onClick={() => hasChildren && toggleNode(node.id)}
        >
          <td className="p-3">
            <div style={{ paddingLeft: `${level * 24}px` }} className="flex items-center">
              {hasChildren ? (
                <button className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-700 mr-2">
                  {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
              ) : (
                <div className="w-6 h-6 mr-2" />
              )}

              <div className={`border-l-2 pl-2 ${borderColor} flex-1 flex items-center`}>
                <span className="font-medium text-gray-800">{node.name}</span>
                {node.unit && (
                  <span className="ml-2 text-xs text-gray-500 italic hidden sm:inline-block">{node.unit}</span>
                )}
              </div>

              {level === 0 && (
                <button
                  className="ml-2 p-1 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-colors duration-150"
                  onClick={(e) => handleEditClick(node.id, e)}
                >
                  <Edit className="h-4 w-4" />
                </button>
              )}
            </div>
          </td>
        </tr>

        {isExpanded &&
          hasChildren &&
          node.children.map((child) => <TreeTableRow key={child.id} node={child} level={level + 1} />)}
      </>
    )
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
      return <SessionExpired />
    }
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{errorState}</span>
        </div>
      </div>
    )
  }

  return localUser && Object.keys(localUser).length > 0 ? (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold mb-6 text-gray-800">Product Types</h1>

          {/* Search and Add Button */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search product types..."
                className="w-full p-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={handleSearchChange}
              />
              { searchTerm === "" ? (<Search className="absolute right-3 top-2.5 text-gray-400 h-5 w-5" />) : (<X className="absolute right-3 top-2.5 text-gray-400 h-5 w-5 hover:scale-105 hover:cursor-pointer" onClick={() => setSearchTerm("")}/>) }
            </div>

            <button
              onClick={handleAddClick}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center transition-colors duration-200"
            >
              <Plus className="h-5 w-5 mr-2" />
              <span className="font-medium">CREATE PRODUCT TYPE</span>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex">
            <button
              className={`mr-2 px-6 py-2 rounded-t-lg font-medium transition-colors duration-200 flex items-center ${
                !isArchive ? "bg-white text-blue-600 shadow-inner" : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              }`}
              onClick={() => setIsArchive(false)}
            >
              <Layers className="h-4 w-4 mr-2" />
              Current
            </button>
            <button
              className={`px-6 py-2 rounded-t-lg font-medium transition-colors duration-200 flex items-center ${
                isArchive ? "bg-white text-blue-600 shadow-inner" : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              }`}
              onClick={() => setIsArchive(true)}
            >
              <Archive className="h-4 w-4 mr-2" />
              Archived
            </button>
          </div>

          {/* Tree Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {formattedData.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 text-left text-gray-600 text-sm uppercase">
                    <th className="p-3">Product Type Hierarchy</th>
                  </tr>
                </thead>
                <tbody>
                  {formattedData.map((node) => (
                    <TreeTableRow key={node.id} node={node} level={0} />
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <Layers className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No product types found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {isArchive
                    ? "There are no archived product types matching your criteria."
                    : "There are no active product types matching your criteria."}
                </p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Clear search
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="mt-6 text-sm text-gray-600">
            {formattedData.length > 0 ? (
              <p>
                Showing {formattedData.length} product type{formattedData.length !== 1 ? "s" : ""}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  ) : (
    <UnauthenticatedSkeleton />
  )
}

export default ProductType

