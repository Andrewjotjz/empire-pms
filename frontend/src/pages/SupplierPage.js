"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Archive, Building, Layers, Mail, MapPin, Phone, Plus, Search, Truck, CreditCard, Package, X } from "lucide-react"
import SessionExpired from "../components/SessionExpired"
import EmployeePageSkeleton from "./loaders/EmployeePageSkeleton"
import UnauthenticatedSkeleton from "./loaders/UnauthenticateSkeleton"

const itemsPerPage = 10

const Supplier = () => {
  // Component state declaration
  const [supplierState, setSupplierState] = useState([])
  const [isLoadingState, setIsLoadingState] = useState(true)
  const [errorState, setErrorState] = useState(null)
  const [isArchive, setIsArchive] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortConfig, setSortConfig] = useState({})
  // const [sortConfig, setSortConfig] = useState({ key: "supplier_name", direction: "ascending" })
  const [currentPage, setCurrentPage] = useState(1)
  const [expandedRow, setExpandedRow] = useState(null)

  // Component router
  const navigate = useNavigate()

  // Component functions and variables
  const localUser = JSON.parse(localStorage.getItem("localUser"))

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  const filterSuppliers = () => {
    return supplierState.filter((supplier) => {
      const lowerCaseSearchTerm = searchTerm.toLowerCase()

      return (
        supplier.supplier_name.toLowerCase().includes(lowerCaseSearchTerm) ||
        supplier.supplier_contacts.some(
          (contact) =>
            contact.name.toLowerCase().includes(lowerCaseSearchTerm) ||
            contact.email.toLowerCase().includes(lowerCaseSearchTerm) ||
            contact.phone.toLowerCase().includes(lowerCaseSearchTerm),
        ) ||
        supplier.supplier_address.toLowerCase().includes(lowerCaseSearchTerm) ||
        supplier.supplier_payment_term.toLowerCase().includes(lowerCaseSearchTerm) ||
        supplier.supplier_type.toLowerCase().includes(lowerCaseSearchTerm) ||
        supplier.supplier_material_types.toLowerCase().includes(lowerCaseSearchTerm)
      )
    })
  }

  const handleAddClick = () => {
    navigate("/EmpirePMS/supplier/create")
  }

  const handleTableClick = (id) => navigate(`/EmpirePMS/supplier/${id}`, { state: id })

  const toggleExpandRow = (id, e) => {
    e.stopPropagation()
    setExpandedRow(expandedRow === id ? null : id)
  }

  const requestSort = (key) => {
    let direction = "ascending"
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }
    setSortConfig({ key, direction })
  }

  const getSortedSuppliers = (suppliers) => {
    if (!sortConfig.key) return suppliers

    return [...suppliers].sort((a, b) => {
      let aValue, bValue

      if (sortConfig.key === "email") {
        aValue = a.supplier_contacts[0]?.email || ""
        bValue = b.supplier_contacts[0]?.email || ""
      } else if (sortConfig.key === "phone") {
        aValue = a.supplier_contacts[0]?.phone || ""
        bValue = b.supplier_contacts[0]?.phone || ""
      } else if (sortConfig.key === "contact") {
        aValue = a.supplier_contacts[0]?.name || ""
        bValue = b.supplier_contacts[0]?.name || ""
      } else {
        aValue = a[sortConfig.key]
        bValue = b[sortConfig.key]
      }

      if (aValue < bValue) {
        return sortConfig.direction === "ascending" ? -1 : 1
      }
      if (aValue > bValue) {
        return sortConfig.direction === "ascending" ? 1 : -1
      }
      return 0
    })
  }

  // Render component
  useEffect(() => {
    const abortController = new AbortController()
    const signal = abortController.signal

    const fetchAllSuppliers = async () => {
      setIsLoadingState(true)
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

        setIsLoadingState(false)
        setSupplierState(data)
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

    fetchAllSuppliers()

    return () => {
      abortController.abort() // Cleanup
    }
  }, [])

  const filteredSuppliers = getSortedSuppliers(
    filterSuppliers().filter((supplier) => supplier.supplier_isarchived === isArchive),
  )

  const pageCount = Math.ceil(filteredSuppliers.length / itemsPerPage)
  const paginatedSuppliers = filteredSuppliers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

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
          <div className="flex items-center mb-6">
            <Truck className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-800">Supplier Management</h1>
          </div>

          {/* Search and Add Button */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search suppliers..."
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
              <span className="font-medium">ADD SUPPLIER</span>
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

          {/* Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {Array.isArray(supplierState) && supplierState.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-100 text-left text-gray-600 text-sm uppercase">
                        <th className="p-3 cursor-pointer" onClick={() => requestSort("supplier_name")}>
                          <div className="flex items-center">
                            <Building className="h-4 w-4 mr-1" />
                            Name
                            {sortConfig.key === "supplier_name" && (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="ml-1 h-4 w-4"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d={
                                    sortConfig.direction === "ascending"
                                      ? "m4.5 15.75 7.5-7.5 7.5 7.5"
                                      : "m19.5 8.25-7.5 7.5-7.5-7.5"
                                  }
                                />
                              </svg>
                            )}
                          </div>
                        </th>
                        <th className="p-3 cursor-pointer hidden md:table-cell" onClick={() => requestSort("contact")}>
                          <div className="flex items-center">
                            Contact
                            {sortConfig.key === "contact" && (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="ml-1 h-4 w-4"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d={
                                    sortConfig.direction === "ascending"
                                      ? "m4.5 15.75 7.5-7.5 7.5 7.5"
                                      : "m19.5 8.25-7.5 7.5-7.5-7.5"
                                  }
                                />
                              </svg>
                            )}
                          </div>
                        </th>
                        <th className="p-3 cursor-pointer" onClick={() => requestSort("email")}>
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-1" />
                            Email
                            {sortConfig.key === "email" && (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="ml-1 h-4 w-4"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d={
                                    sortConfig.direction === "ascending"
                                      ? "m4.5 15.75 7.5-7.5 7.5 7.5"
                                      : "m19.5 8.25-7.5 7.5-7.5-7.5"
                                  }
                                />
                              </svg>
                            )}
                          </div>
                        </th>
                        <th className="p-3 cursor-pointer" onClick={() => requestSort("phone")}>
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-1" />
                            Phone
                            {sortConfig.key === "phone" && (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="ml-1 h-4 w-4"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d={
                                    sortConfig.direction === "ascending"
                                      ? "m4.5 15.75 7.5-7.5 7.5 7.5"
                                      : "m19.5 8.25-7.5 7.5-7.5-7.5"
                                  }
                                />
                              </svg>
                            )}
                          </div>
                        </th>
                        <th
                          className="p-3 cursor-pointer hidden lg:table-cell"
                          onClick={() => requestSort("supplier_type")}
                        >
                          <div className="flex items-center">
                            <Package className="h-4 w-4 mr-1" />
                            Type
                            {sortConfig.key === "supplier_type" && (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="ml-1 h-4 w-4"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d={
                                    sortConfig.direction === "ascending"
                                      ? "m4.5 15.75 7.5-7.5 7.5 7.5"
                                      : "m19.5 8.25-7.5 7.5-7.5-7.5"
                                  }
                                />
                              </svg>
                            )}
                          </div>
                        </th>
                        <th className="p-3 text-center">Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedSuppliers.map((supplier) => (
                        <>
                          <tr
                            key={supplier._id}
                            className="border-t border-gray-200 hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                          >
                            <td className="p-3">
                              <div 
                                className="font-medium text-blue-600 hover:underline"
                                onClick={() => handleTableClick(supplier._id)}
                              >
                                {supplier.supplier_name}
                              </div>
                            </td>
                            <td className="p-3 hidden md:table-cell text-gray-600">
                              {supplier.supplier_contacts.length > 0 ? (
                                <div>
                                  {supplier.supplier_contacts[0].name}
                                  {supplier.supplier_contacts.length > 1 && (
                                    <span className="text-xs text-gray-500 ml-1">
                                      +{supplier.supplier_contacts.length - 1} more
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-400">No contacts</span>
                              )}
                            </td>
                            <td className="p-3 text-gray-600">
                              {supplier.supplier_contacts.length > 0 ? (
                                supplier.supplier_contacts[0].email
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="p-3 text-gray-600">
                              {supplier.supplier_contacts.length > 0 ? (
                                supplier.supplier_contacts[0].phone
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="p-3 hidden lg:table-cell">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  supplier.supplier_type === "Manufacturer"
                                    ? "bg-blue-100 text-blue-800"
                                    : supplier.supplier_type === "Distributor"
                                      ? "bg-green-100 text-green-800"
                                      : supplier.supplier_type === "Wholesaler"
                                        ? "bg-purple-100 text-purple-800"
                                        : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {supplier.supplier_type}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              <button
                                onClick={(e) => toggleExpandRow(supplier._id, e)}
                                className="text-blue-600 hover:text-blue-800 transition-colors duration-150"
                              >
                                {expandedRow === supplier._id ? (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="inline size-5"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                                  </svg>
                                ) : (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="inline size-5"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                  </svg>
                                )}
                              </button>
                            </td>
                          </tr>
                          {expandedRow === supplier._id && (
                            <tr className="bg-gray-50">
                              <td colSpan="6" className="p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                  <div className="bg-white p-3 rounded shadow-sm">
                                    <div className="flex items-center text-gray-700 mb-2">
                                      <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                                      <span className="font-medium">Address</span>
                                    </div>
                                    <p className="text-sm text-gray-600 ml-6">
                                      {supplier.supplier_address || "Not specified"}
                                    </p>
                                  </div>

                                  <div className="bg-white p-3 rounded shadow-sm">
                                    <div className="flex items-center text-gray-700 mb-2">
                                      <CreditCard className="h-4 w-4 mr-2 text-gray-500" />
                                      <span className="font-medium">Payment Terms</span>
                                    </div>
                                    <p className="text-sm text-gray-600 ml-6">
                                      {supplier.supplier_payment_term || "Not specified"}
                                    </p>
                                  </div>

                                  <div className="bg-white p-3 rounded shadow-sm">
                                    <div className="flex items-center text-gray-700 mb-2">
                                      <Package className="h-4 w-4 mr-2 text-gray-500" />
                                      <span className="font-medium">Material Types</span>
                                    </div>
                                    <p className="text-sm text-gray-600 ml-6">
                                      {supplier.supplier_material_types || "Not specified"}
                                    </p>
                                  </div>

                                  {supplier.supplier_contacts.length > 1 && (
                                    <div className="bg-white p-3 rounded shadow-sm md:col-span-2 lg:col-span-3">
                                      <div className="flex items-center text-gray-700 mb-2">
                                        <Phone className="h-4 w-4 mr-2 text-gray-500" />
                                        <span className="font-medium">Additional Contacts</span>
                                      </div>
                                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 ml-6">
                                        {supplier.supplier_contacts.slice(1).map((contact, index) => (
                                          <div key={index} className="text-sm border border-gray-100 rounded p-2">
                                            <p className="font-medium text-gray-700">{contact.name}</p>
                                            <p className="text-gray-600">{contact.email}</p>
                                            <p className="text-gray-600">{contact.phone}</p>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {filteredSuppliers.length > 0 && (
                  <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 sm:px-6">
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-600">
                        Showing {Math.min(filteredSuppliers.length, (currentPage - 1) * itemsPerPage + 1)} to{" "}
                        {Math.min(filteredSuppliers.length, currentPage * itemsPerPage)} of {filteredSuppliers.length}{" "}
                        suppliers
                      </p>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                          className="px-3 py-1 rounded bg-gray-200 text-gray-600 disabled:opacity-50"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="size-6"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                          </svg>
                        </button>
                        {pageCount <= 5 ? (
                          [...Array(pageCount)].map((_, i) => (
                            <button
                              key={i}
                              onClick={() => setCurrentPage(i + 1)}
                              className={`px-3 py-1 rounded ${
                                currentPage === i + 1 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                              }`}
                            >
                              {i + 1}
                            </button>
                          ))
                        ) : (
                          <>
                            {[...Array(Math.min(3, pageCount))].map((_, i) => (
                              <button
                                key={i}
                                onClick={() => setCurrentPage(i + 1)}
                                className={`px-3 py-1 rounded ${
                                  currentPage === i + 1 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                                }`}
                              >
                                {i + 1}
                              </button>
                            ))}
                            {currentPage > 3 && <span className="px-2 py-1">...</span>}
                            {currentPage > 3 && currentPage < pageCount - 1 && (
                              <button
                                onClick={() => setCurrentPage(currentPage)}
                                className="px-3 py-1 rounded bg-blue-600 text-white"
                              >
                                {currentPage}
                              </button>
                            )}
                            {currentPage < pageCount - 2 && <span className="px-2 py-1">...</span>}
                            {currentPage < pageCount - 1 && (
                              <button
                                onClick={() => setCurrentPage(pageCount)}
                                className={`px-3 py-1 rounded ${
                                  currentPage === pageCount ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                                }`}
                              >
                                {pageCount}
                              </button>
                            )}
                          </>
                        )}
                        <button
                          onClick={() => setCurrentPage((prev) => Math.min(pageCount, prev + 1))}
                          disabled={currentPage === pageCount}
                          className="px-3 py-1 rounded bg-gray-200 text-gray-600 disabled:opacity-50"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="size-6"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <Truck className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No suppliers found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {isArchive
                    ? "There are no archived suppliers matching your criteria."
                    : "There are no active suppliers matching your criteria."}
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
        </div>
      </div>
    </div>
  ) : (
    <UnauthenticatedSkeleton />
  )
}

export default Supplier

